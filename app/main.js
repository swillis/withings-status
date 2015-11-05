var withingsApi = require("withings-api");

var holyGrail = withingsApi.generateUrl({
	url: "http://wbsapi.withings.net/v2/measure",

	parameters: {
		action: "getactivity",
		userid: "8680483",
		date: "2015-11-01",
	},

	consumer_key: "8536748c0d33794f647c6448f765b7682e4f820e49718153246be40bfbc683",
	consumer_secret: "2889eb3c8e43ecc9d03207219ef2e6fb52ce49d3c7b08de37294f2d390fd",
	access_token: "c288268c2d2318eb62fe23ffed11038e10f122885c66367e3b26e9c429",
	access_token_secret: "9e7d5e43e2ee399c5988190cdfe67d45107b413887b152080def30184d466ec"
});

console.log(holyGrail);
