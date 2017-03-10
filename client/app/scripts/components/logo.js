/* eslint react/jsx-first-prop-new-line: "off" */
/* eslint max-len: "off" */
import React from 'react';

export default class Logo extends React.Component {
  render() {
    const { transform = '' } = this.props;
    return (
      <g className="logo" transform={transform}>
        <path fill="#32324B" d="M114.937,118.165l75.419-67.366c-5.989-4.707-12.71-8.52-19.981-11.211l-55.438,49.52V118.165z" />
        <path fill="#32324B" d="M93.265,108.465l-20.431,18.25c1.86,7.57,4.88,14.683,8.87,21.135l11.561-10.326V108.465z" />
        <path fill="#00D2FF" d="M155.276,53.074V35.768C151.815,35.27,148.282,35,144.685,35c-3.766,0-7.465,0.286-11.079,0.828v36.604
          L155.276,53.074z" />
        <path fill="#00D2FF" d="M155.276,154.874V82.133l-21.671,19.357v80.682c3.614,0.543,7.313,0.828,11.079,0.828
          c4.41,0,8.723-0.407,12.921-1.147l58.033-51.838c1.971-6.664,3.046-13.712,3.046-21.015c0-3.439-0.254-6.817-0.708-10.132
          L155.276,154.874z" />
        <path fill="#FF4B19" d="M155.276,133.518l58.14-51.933c-2.77-6.938-6.551-13.358-11.175-19.076l-46.965,41.951V133.518z" />
        <path fill="#FF4B19" d="M133.605,123.817l-18.668,16.676V41.242c-8.086,3.555-15.409,8.513-21.672,14.567V162.19
          c4.885,4.724,10.409,8.787,16.444,12.03l23.896-21.345V123.817z" />
        <polygon fill="#32324B" points="325.563,124.099 339.389,72.22 357.955,72.22 337.414,144.377 315.556,144.377 303.311,95.79
          291.065,144.377 269.207,144.377 248.666,72.22 267.232,72.22 281.058,124.099 294.752,72.22 311.869,72.22 " />
        <path fill="#32324B" d="M426.429,120.676c-2.106,14.352-13.167,24.623-32.128,24.623c-20.146,0-35.025-12.114-35.025-36.605
          c0-24.622,15.406-37.395,35.025-37.395c21.726,0,33.182,15.933,33.182,37.263v3.819h-49.772c0,8.031,3.291,18.17,16.327,18.17
          c7.242,0,12.904-3.555,14.353-10.27L426.429,120.676z M408.654,99.608c-0.659-10.008-7.11-13.694-14.484-13.694
          c-8.427,0-14.879,5.135-15.801,13.694H408.654z" />
        <path fill="#32324B" d="M480.628,97.634v-2.502c0-5.662-2.37-9.351-13.036-9.351c-13.298,0-13.694,7.375-13.694,9.877h-17.117
          c0-10.666,4.477-24.359,31.338-24.359c25.676,0,30.285,12.771,30.285,23.174v39.766c0,2.897,0.131,5.267,0.395,7.11l0.527,3.028
          h-18.172v-7.241c-5.134,5.134-12.245,8.163-22.384,8.163c-14.221,0-25.018-8.296-25.018-22.648c0-16.59,15.67-20.146,21.99-21.199
          L480.628,97.634z M480.628,111.195l-6.979,1.054c-3.819,0.658-8.427,1.315-11.192,1.843c-3.029,0.527-5.662,1.186-7.637,2.765
          c-1.844,1.449-2.765,3.425-2.765,5.926c0,2.107,0.79,8.69,10.666,8.69c5.793,0,10.928-2.105,13.693-4.872
          c3.556-3.555,4.214-8.032,4.214-11.587V111.195z" />
        <polygon fill="#32324B" points="549.495,144.377 525.399,144.377 501.698,72.221 521.186,72.221 537.775,127.392 554.499,72.221
          573.459,72.221 " />
        <path fill="#32324B" d="M641.273,120.676c-2.106,14.352-13.167,24.623-32.128,24.623c-20.146,0-35.025-12.114-35.025-36.605
          c0-24.622,15.406-37.395,35.025-37.395c21.726,0,33.182,15.933,33.182,37.263v3.819h-49.772c0,8.031,3.291,18.17,16.327,18.17
          c7.242,0,12.904-3.555,14.354-10.27L641.273,120.676z M623.498,99.608c-0.659-10.008-7.109-13.694-14.483-13.694
          c-8.428,0-14.88,5.135-15.802,13.694H623.498z" />
        <path fill="#32324B" d="M682.976,80.873c-7.524,0-16.896,2.376-16.896,10.692c0,17.952,46.201,1.452,46.201,30.229
          c0,9.637-5.676,22.309-30.229,22.309c-19.009,0-27.721-9.636-28.249-22.44h11.881c0.264,7.788,5.147,13.332,17.688,13.332
          c14.52,0,17.952-6.204,17.952-12.54c0-13.332-24.421-7.788-37.753-15.181c-4.885-2.771-8.316-7.128-8.316-15.048
          c0-11.616,10.824-20.461,27.853-20.461c20.989,0,27.193,12.145,27.589,20.196h-11.484
          C698.685,83.381,691.556,80.873,682.976,80.873z" />
        <path fill="#32324B" d="M756.233,134.994c10.429,0,17.953-5.939,19.009-16.632h10.957c-1.98,17.028-13.597,25.74-29.966,25.74
          c-18.744,0-32.076-12.012-32.076-35.905c0-23.76,13.464-36.433,32.209-36.433c16.104,0,27.721,8.712,29.568,25.213h-10.956
          c-1.452-11.353-9.24-16.104-18.877-16.104c-12.012,0-20.856,8.448-20.856,27.324C735.245,127.471,744.485,134.994,756.233,134.994z
          " />
        <path fill="#32324B" d="M830.418,144.103c-19.141,0-32.341-12.145-32.341-36.169c0-23.893,13.2-36.169,32.341-36.169
          c19.009,0,32.209,12.145,32.209,36.169C862.627,132.091,849.427,144.103,830.418,144.103z M830.418,134.994
          c12.145,0,21.12-7.392,21.12-27.061c0-19.536-8.976-27.061-21.12-27.061c-12.276,0-21.253,7.393-21.253,27.061
          C809.165,127.603,818.142,134.994,830.418,134.994z" />
        <path fill="#32324B" d="M888.629,72.688v10.692c3.96-6.732,12.54-11.616,22.969-11.616c19.009,0,30.757,12.673,30.757,36.169
          c0,23.629-12.145,36.169-31.152,36.169c-10.429,0-18.745-4.224-22.573-11.22v35.641h-10.824V72.688H888.629z M910.409,134.994
          c12.145,0,20.857-7.392,20.857-27.061c0-19.536-8.713-27.061-20.857-27.061c-12.275,0-21.912,7.393-21.912,27.061
          C888.497,127.603,898.134,134.994,910.409,134.994z" />
        <path fill="#32324B" d="M1016.801,119.022c-1.452,12.408-10.032,25.08-30.229,25.08c-18.745,0-32.341-12.804-32.341-36.037
          c0-21.912,13.464-36.301,32.209-36.301c19.8,0,30.757,14.784,30.757,38.018h-51.878c0.265,13.332,5.809,25.212,21.385,25.212
          c11.484,0,18.217-7.128,19.141-16.104L1016.801,119.022z M1005.448,101.201c-1.056-14.916-9.636-20.328-19.272-20.328
        c-10.824,0-19.141,7.26-20.46,20.328H1005.448z" />
      </g>
    );
  }
}
