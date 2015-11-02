import 'whatwg-fetch';
import React from 'react';
import ReactDOM from 'react-dom';
import jquery from 'jquery';

// var results = { "status": 0, "body": "activities": [ { "date": "2015-10-06", "steps": 10233, "distance": 7439.44, "calories": 530.79, "elevation": 808.24, "soft": 9240, "moderate": 960, "intense": 0, "timezone":"Europe/Berlin" }, { "date": "2015-10-07", "steps": 6027, "distance": 5015.6, "calories": 351.71, "elevation": 153.82, "elevation": 50.78, "soft": 17580, "moderate": 1860, "timezone":"Europe/Berlin" }, { "date": "2015-10-08", "steps": 2552, "distance": 2127.73, "calories": 164.25, "elevation": 33.68, "soft": 5880, "moderate": 1080, "intense": 540, "timezone":"Europe/Berlin" } ] }
//
//
// var Result = React.createClass({
//   render: function() {
//     return (
//       <div className="commentBox">
//         Hello, world! I am a result.
//       </div>
//     );
//   }
// });
// ReactDOM.render(
//   <Result />,
//   document.getElementById('app')
// );

var MySteps = React.createClass({
  render: function() {
    return (
      <p>Hello</p>
    );
  }
});

var MyStatus = React.createClass({
  render: function() {
    return (
      <div className="my-status">
        <h1>My Status</h1>
        <MySteps />
      </div>
    );
  }
});

ReactDOM.render(
  <MyStatus url="results.json" />,
  document.getElementById('app')
);
