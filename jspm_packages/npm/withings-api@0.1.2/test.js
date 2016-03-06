/* */ 
(function(process) {
  var withingsApi = require('./index');
  var oAuthSignedUrl = withingsApi.generateUrl({
    url: "http://wbsapi.withings.net/v2/measure",
    parameters: {
      action: "getactivity",
      userid: "4459868"
    },
    consumer_key: "54cc2cf01d2c828441020c4b30b8562779cf3c659e23798fe70888d9684e",
    consumer_secret: "1d43d8be45d7d64b38f0ececfc7d6b7ce140e53706421d2b7fe83fd4cffcb1f",
    access_token: "051c4b2c4b3b9b8cdbbe24d7560c5426d2eecf7cd8fb0e29d45df12e2c7",
    access_token_secret: "892bd305275775ccd65fc6e38b2596c2bcd387f4104307fbbfd72542df1"
  });
  console.log(oAuthSignedUrl);
  process.exit();
})(require('process'));
