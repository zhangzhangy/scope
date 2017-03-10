package multitenant

import (
	"bytes"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"strings"
	"time"

	log "github.com/Sirupsen/logrus"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/awserr"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/kinesis"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/ugorji/go/codec"
	"golang.org/x/net/context"

	"github.com/weaveworks/common/instrument"
	"github.com/weaveworks/scope/app"
	"github.com/weaveworks/scope/report"
)

const (
	// The requested resource could not be found. The stream might not be specified
	// correctly.
	ErrCodeResourceNotFoundException = "ResourceNotFoundException"
)

var (
	kinesisRequestDuration = prometheus.NewHistogramVec(prometheus.HistogramOpts{
		Namespace: "scope",
		Name:      "kinesis_request_duration_seconds",
		Help:      "Time in seconds spent doing Kinesis requests.",
		Buckets:   prometheus.DefBuckets,
	}, []string{"method", "status_code"})
	kinesisValueSize = prometheus.NewCounterVec(prometheus.CounterOpts{
		Namespace: "scope",
		Name:      "kinesis_value_size_bytes_total",
		Help:      "Total size of data written to Kinesis in bytes.",
	}, []string{"method"})
)

func init() {
	prometheus.MustRegister(kinesisRequestDuration)
	prometheus.MustRegister(kinesisValueSize)
}

// AWSEmitter is a Collector which can also CreateStream
type AWSEmitter interface {
	app.Collector
	CreateStream() error
}

// AWSEmitterConfig has everything we need to make an AWS collector.
type AWSEmitterConfig struct {
	UserIDer          UserIDer
	KinesisConfig     *aws.Config
	StreamName        string
	ShardCount        int64
	IncludeFullReport bool
}

type awsEmitter struct {
	app.Collector

	userIDer          UserIDer
	k                 *kinesis.Kinesis
	streamName        string
	shardCount        int64
	includeFullReport bool
}

// NewAWSCollector the elastic reaper of souls
// https://github.com/aws/aws-sdk-go/wiki/common-examples
func NewAWSEmitter(upstream app.Collector, config AWSEmitterConfig) (AWSEmitter, error) {
	return &awsEmitter{
		Collector:         upstream,
		k:                 kinesis.New(session.New(config.KinesisConfig)),
		userIDer:          config.UserIDer,
		streamName:        config.StreamName,
		shardCount:        config.ShardCount,
		includeFullReport: config.IncludeFullReport,
	}, nil
}

// CreateStream creates the required stream in kinesis
func (e *awsEmitter) CreateStream() error {
	// see if stream exists
	_, err := e.k.DescribeStream(&kinesis.DescribeStreamInput{
		StreamName: aws.String(e.streamName),
	})
	if err == nil {
		return nil
	}
	if err, ok := err.(awserr.Error); !ok || err.Code() != "ResourceNotFoundException" {
		return err
	}

	log.Infof("Creating stream %s", e.streamName)
	_, err = e.k.CreateStream(&kinesis.CreateStreamInput{
		StreamName: aws.String(e.streamName),
		ShardCount: aws.Int64(e.shardCount),
	})
	return err
}

func (e *awsEmitter) Add(ctx context.Context, rep report.Report, buf []byte) error {
	userid, err := e.userIDer(ctx)
	if err != nil {
		return err
	}
	rowKey, _ := calculateDynamoKeys(userid, time.Now())
	summary, err := summarizeReport(userid, rep, buf, e.includeFullReport)
	if err != nil {
		return err
	}

	err = instrument.TimeRequestHistogram(ctx, "Kinesis.PutRecord", kinesisRequestDuration, func(_ context.Context) error {
		_, err := e.k.PutRecord(&kinesis.PutRecordInput{
			StreamName:   aws.String(e.streamName),
			PartitionKey: aws.String(rowKey),
			Data:         summary,
		})
		return err
	})
	if err != nil {
		return err
	}
	// record the size we just send to kinesis
	kinesisValueSize.WithLabelValues("PutRecord").
		Add(float64(len(summary)))

	return e.Collector.Add(ctx, rep, buf)
}

// summarizeReport formats the data to be emitted.
func summarizeReport(internalInstanceID string, rep report.Report, buf []byte, includeFullReport bool) ([]byte, error) {
	summary := &reportSummary{
		ID:                 rep.ID,
		InternalInstanceID: internalInstanceID,
		Sha256:             base64.URLEncoding.EncodeToString(sha256.New().Sum(buf)),
		Counts:             map[string]int{},
	}
	for _, t := range rep.Topologies() {
		summary.Counts[t.Label] = len(t.Nodes)
	}
	if interval, ok := reportInterval(rep); ok {
		summary.PublishInterval = interval
	}

	if includeFullReport {
		summary.Report = buf
	}

	encoded := &bytes.Buffer{}
	if err := codec.NewEncoder(encoded, &codec.JsonHandle{}).Encode(summary); err != nil {
		return nil, err
	}
	return encoded.Bytes(), nil
}

type reportSummary struct {
	ID                 string          `json:"id"`
	InternalInstanceID string          `json:"internalInstanceID"`
	Sha256             string          `json:"sha256"`
	Counts             map[string]int  `json:"counts"`
	PublishInterval    time.Duration   `json:"publishInterval,omitempty"`
	Report             json.RawMessage `json:"report,omitempty"`
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
