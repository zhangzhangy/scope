package multitenant

import (
	"bytes"
	"crypto/sha256"
	"encoding/base64"
	"strings"
	"time"

	log "github.com/Sirupsen/logrus"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/awserr"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/ugorji/go/codec"
	billing "github.com/weaveworks/scope/billing-client"
	"golang.org/x/net/context"

	"github.com/weaveworks/common/instrument"
	"github.com/weaveworks/scope/app"
	"github.com/weaveworks/scope/report"
)

const (
	// The requested resource could not be found. The stream might not be specified
	// correctly.
	ErrCodeResourceNotFoundException = "ResourceNotFoundException"

	megabyte = 2 << 19
)

var (
	billingRequestDuration = prometheus.NewHistogramVec(prometheus.HistogramOpts{
		Namespace: "scope",
		Name:      "billing_request_duration_seconds",
		Help:      "Time in seconds spent emitting billing info.",
		Buckets:   prometheus.DefBuckets,
	}, []string{"method", "status_code"})
)

func init() {
	prometheus.MustRegister(billingRequestDuration)
}

// BillingEmitterConfig has everything we need to make an AWS collector.
type BillingEmitterConfig struct {
	UserIDer        UserIDer
	DefaultInterval time.Duration
}

type billingEmitter struct {
	app.Collector

	userIDer        UserIDer
	defaultInterval time.Duration
	billing         *billing.Client
}

// NewBillingEmitter is the charging-mechanism
func NewBillingEmitter(upstream app.Collector, cfg BillingEmitterConfig) (Collector, error) {
	return &billingEmitter{
		Collector:       upstream,
		userIDer:        cfg.UserIDer,
		defaultInterval: cfg.DefaultInterval,
		billing:         billing.New(),
	}, nil
}

func (e *billingEmitter) Add(ctx context.Context, rep report.Report, buf []byte) error {
	userid, err := e.userIDer(ctx)
	if err != nil {
		return err
	}
	rowKey, colKey := calculateDynamoKeys(userid, time.Now())
	summary, err := summarizeReport(userid, rep, buf, rowKey, colKey)
	if err != nil {
		return err
	}

	containerCount := int64(len(rep.Container.Nodes))
	interval, ok := reportInterval(rep)
	if !ok {
		interval = e.defaultInterval
	}
	hash := "sha256:" + base64.URLEncoding.EncodeToString(sha256.New().Sum(buf))
	timestamp := time.Now().UTC()
	amounts := map[billing.AmountType]int64{
		billing.ContainerSeconds: int64(interval) * containerCount,
	}
	metadata := map[string]string{
		"row_key": rowKey,
		"col_key": colKey,
	}

	err = instrument.TimeRequestHistogram(ctx, "Billing.AddAmounts", billingRequestDuration, func(_ context.Context) error {
		return e.billing.AddAmounts(
			hash,
			userID,
			timestamp,
			amounts,
			metadata,
		)
	})
	if err != nil {
		log.Errorf("Failed emitting billing data: %v", err)
		return err
	}

	return e.Collector.Add(ctx, rep, buf)
}

// reportInterval tries to find the custom report interval of this report. If
// it is malformed, or not set, it returns false.
func reportInterval(r report.Report) (time.Duration, bool) {
	var inter string
	for _, c := range r.Process.Nodes {
		cmd, ok := c.Latest.Lookup("cmdline")
		if !ok {
			continue
		}
		if strings.Contains(cmd, "scope-probe") &&
			strings.Contains(cmd, "probe.publish.interval") {
			cmds := strings.SplitAfter(cmd, "probe.publish.interval")
			aft := strings.Split(cmds[1], " ")
			if aft[0] == "" {
				inter = aft[1]
			} else {
				inter = aft[0][1:]
			}

		}
	}
	if inter == "" {
		return 0, false
	}
	d, err := time.ParseDuration(inter)
	if err != nil {
		return 0, false
	}
	return d, true
}
