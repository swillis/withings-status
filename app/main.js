import 'whatwg-fetch';

import React from 'react';
import ReactDOM from 'react-dom';
import withingsApi from 'withings-api';
import jquery from 'jquery';

// Generate the Withings API base url
var activityUrl = withingsApi.generateUrl({
	url: "http://wbsapi.withings.net/v2/measure",

	parameters: {
		action: "getactivity",
		userid: "8680483",
		date: "2015-11-02",
	},

	consumer_key: "8536748c0d33794f647c6448f765b7682e4f820e49718153246be40bfbc683",
	consumer_secret: "2889eb3c8e43ecc9d03207219ef2e6fb52ce49d3c7b08de37294f2d390fd",
	access_token: "c288268c2d2318eb62fe23ffed11038e10f122885c66367e3b26e9c429",
	access_token_secret: "9e7d5e43e2ee399c5988190cdfe67d45107b413887b152080def30184d466ec"
});


var test = $.getJSON( activityUrl, function(data) {
  console.log(data);
});

// console.log(test);

// var data = [
//   {
//     "status":0,
//     "body":{
//       "date":"2015-11-02",
//       "steps":7974,
//       "distance":7412.391,
//       "calories":369.89,
//       "totalcalories":2513.781,
//       "elevation":0,
//       "soft":2880,
//       "moderate":1920,
//       "intense":0,
//       "timezone":"Europe\/London"
//     }
//   }
// ];


var Steps = React.createClass({
  render: function() {
    return (
      <div className="result steps">
        <div className="value">
          {data[0].body.calories}
        </div>
        <div className="label">
          <span>Steps</span>
        </div>
      </div>
    );
  }
});
//
// var Distance = React.createClass({
//   render: function() {
//     return (
//       <div className="result steps">
//         <div className="value">
//           <span>{data[0].body.distance}</span>
//         </div>
//         <div className="label">
//           <span>Distance</span>
//         </div>
//       </div>
//     );
//   }
// });
//
// var Calories = React.createClass({
//   render: function() {
//     return (
//       <div className="result steps">
//         <div className="value">
//           <span>{data[0].body.calories}</span>
//         </div>
//         <div className="label">
//           <span>Calories</span>
//         </div>
//       </div>
//     );
//   }
// });

var ResultBox = React.createClass({
  getInitialState: function() {
    return {
      steps: ''
    };
  },

  componentDidMount: function() {
    $.get(this.props.source, function(result) {
      var lastGist = result[0];
      if (this.isMounted()) {
        console.log(lastGist[0]);
        this.setState({

        });
      }
    }.bind(this));
  },
  render: function() {
    return (
      <div className="result-box">
        <Steps />
      </div>
    );
  }
});

ReactDOM.render(
  <ResultBox source={activityUrl}/>,
  document.getElementById('content')
);

// var navigationConfig = [
//     {
//         href: 'http://ryanclark.me',
//         text: 'My Website'
//     }
// ];
//
// var Navigation = React.createClass({
//     render: function () {
//         var config = this.props.config;
//
//         var items = function (d) {
//             return (
//                   <p className="navigation__link">
//                       { d.text }
//                   </p>
//                 );
//         };
//
//         return (
//             <div className="navigation">
//                 { items }
//             </div>
//             );
//     }
// });
//
// ReactDOM.render(<Navigation config={ navigationConfig } />, document.body);
