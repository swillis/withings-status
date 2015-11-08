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

// Steps component
var Steps = React.createClass({
  render: function() {
    return (
      <div className="result steps">
        <div className="value">
          {this.props.steps}
        </div>

        <div className="label">
          <span>Steps</span>
        </div>
      </div>
    );
  }
});

// Distance component
var Distance = React.createClass({
  render: function() {
    return (
      <div className="result steps">
        <div className="value">
          <span>{this.props.distance}</span>
        </div>

        <div className="label">
          <span>Distance</span>
        </div>
      </div>
    );
  }
});

// Calories component
var Calories = React.createClass({
  render: function() {
    return (
      <div className="result steps">
        <div className="value">
          <span>{this.props.calories}</span>
        </div>
        <div className="label">
          <span>Calories</span>
        </div>
      </div>
    );
  }
});

// Results container
var ResultBox = React.createClass({
  getInitialState: function() {
    return {
      steps: '',
      distance: '',
      calories: ''
    };
  },

  componentDidMount: function() {
    $.get(this.props.source, function(result) {
      var urlResults = result;
      if (this.isMounted()) {
        this.setState({
          steps: urlResults.body.steps,
          distance: urlResults.body.distance,
          calories: urlResults.body.calories
        });
      }
    }.bind(this));
  },

  render: function() {
    return (
      <div className="result-box">
        <Steps steps={this.state.steps} />
        <Distance distance={this.state.distance} />
        <Calories calories={this.state.calories} />
      </div>
    );
  }
});

ReactDOM.render(
  <ResultBox source={activityUrl}/>,
  document.getElementById('content')
);
