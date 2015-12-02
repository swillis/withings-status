import 'whatwg-fetch';
import React from 'react';
import withingsApi from 'withings-api';
import jquery from 'jquery';
import ReactDOM from 'react-dom';
import jqueryNumerator from 'jquery-numerator';

// Get the todays's date
var today = new Date();
var dd = today.getDate();
var mm = today.getMonth()+1; //January is 0!
var yyyy = today.getFullYear();

if(dd<10) {
    dd='0'+dd
}

if(mm<10) {
    mm='0'+mm
}

var dateForWithings = yyyy+'-'+mm+'-'+dd;

var today = dd+'.'+mm+'.'+yyyy;

console.log('Today ' + today);

// Get the activity log from Withings
var activityUrl = withingsApi.generateUrl({
	url: "http://wbsapi.withings.net/v2/measure",

	parameters: {
		action: "getactivity",
		userid: "8680483",
		date: dateForWithings,
	},

	consumer_key: "8536748c0d33794f647c6448f765b7682e4f820e49718153246be40bfbc683",
	consumer_secret: "2889eb3c8e43ecc9d03207219ef2e6fb52ce49d3c7b08de37294f2d390fd",
	access_token: "c288268c2d2318eb62fe23ffed11038e10f122885c66367e3b26e9c429",
	access_token_secret: "9e7d5e43e2ee399c5988190cdfe67d45107b413887b152080def30184d466ec"
});

var goal = 12000;

// Timestamp
var TimeStamp = React.createClass({

  render: function() {
    return (
      <span className="timestamp">Activity {this.props.date}</span>
    );
  }
});

// Distance
var Distance = React.createClass({
  render: function() {

    var floorDistance = Math.floor(this.props.distance);
    var stepsInMeters = ((floorDistance) / (this.props.steps));
    var distanceGoal = (Math.floor((stepsInMeters) * (goal)));

    $('.distance').numerator({
      duration: 800,
      toValue: floorDistance,
      delimiter: ','
    })

    return (
      <div className="result">
        <div className="label">
          <span>Distance</span>
        </div>

        <div className="value">
          <span className="distance">0</span><span className="unit">m</span>
        </div>

        <div className="goal">
          <span className="">Goal: {distanceGoal}</span><span className="small-unit">m</span>
        </div>
      </div>
    );
  }
});

// Steps
var Steps = React.createClass({

  render: function() {
    $('.steps').numerator({
      duration: 800,
      toValue: (this.props.steps),
      delimiter: ','
    })

    return (
      <div className="result primo">
        <div className="label">
          <span>Steps</span>
        </div>

        <div className="value">
          <span className="steps">0</span>
        </div>

        <div className="goal">
          <span className="">Goal: {goal}</span>
        </div>
      </div>
    );
  }
});

// Calories
var Calories = React.createClass({
  render: function() {

    var floorTotalCalories = Math.floor(this.props.totalCalories);
    var floorCalories = Math.floor(this.props.calories);

    $('.calories').numerator({
      duration: 800,
      toValue: floorCalories,
      delimiter: ','
    })

    return (
      <div className="result">
        <div className="label">
          <span>Calories</span>
        </div>

        <div className="value">
          <span className="calories">0</span><span className="unit">kcal</span>
        </div>

        <div className="goal">
          <span className="">Total calories: {floorTotalCalories}</span><span className="small-unit">kcal</span>
        </div>
      </div>
    );
  }
});

var ProgressMeter = React.createClass({
  render: function() {
    var steps = (this.props.steps);
    var progress = (steps / goal) * 100;
    var progressPercentage = Math.floor(progress);

    $('.progress-percent-value').numerator({
      duration: 800,
      toValue: progressPercentage,
      delimiter: ','
    })

    var divStyle = {
      transform: 'translateX(-' + (100 - progress) + '%)'
    };

    return (
      <div className="progress-meter" style={divStyle}>
        <span className="progress-percent"><span className="progress-percent-value"></span>%</span>
      </div>
    );
  }
});

// Results container
var ResultBox = React.createClass({
  getInitialState: function() {
    return {
      steps: '0',
      distance: '0',
      calories: '0',
      totalCalories: '0',
    };
  },

  componentDidMount: function() {
    $.get(this.props.source, function(result) {
      var urlResults = result;
      if (this.isMounted()) {
        this.setState({
          steps: urlResults.body.steps,
          distance: urlResults.body.distance,
          calories: urlResults.body.calories,
          totalCalories: urlResults.body.totalcalories,
        });
      }
    }.bind(this));
  },

  render: function() {
    return (
      <div className="result-box">
        <Distance distance={this.state.distance} steps={this.state.steps}/>
        <Steps steps={this.state.steps}/>
        <Calories calories={this.state.calories} totalCalories={this.state.totalCalories}/>
        <TimeStamp date={today}/>
        <ProgressMeter steps={this.state.steps}/>
      </div>
    );
  }
});


ReactDOM.render(
  <ResultBox source={activityUrl}/>,
  document.getElementById('content')
);

// var yesterdayNoon = new Date(yyyy, mm, dd).getTime() / 1000 - 43200;
//
// var now = Math.floor(Date.now() / 1000);
//
// // Get the sleep data from Withings
// var sleepUrl = withingsApi.generateUrl({
// 	url: "http://wbsapi.withings.net/v2/sleep",
//
// 	parameters: {
// 		action: "getsummary",
// 		userid: "8680483",
//     // enddate: now,
// 		// startdate: yesterdayNoon,
// 	},
//
// 	consumer_key: "8536748c0d33794f647c6448f765b7682e4f820e49718153246be40bfbc683",
// 	consumer_secret: "2889eb3c8e43ecc9d03207219ef2e6fb52ce49d3c7b08de37294f2d390fd",
// 	access_token: "c288268c2d2318eb62fe23ffed11038e10f122885c66367e3b26e9c429",
// 	access_token_secret: "9e7d5e43e2ee399c5988190cdfe67d45107b413887b152080def30184d466ec"
// });
//
// console.log(sleepUrl);
