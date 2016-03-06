## Withings API

A javascript module to help generate OAuth signed [Withings API](http://oauth.withings.com/api) URL

## Install

1. `npm install withings-api`

## Usage

```javascript
var withingsApi = require("withings-api");

withingsApi.generateUrl({
	url: "http://wbsapi.withings.net/measure",
	parameters: {
		action: "getmeas",
		userid: "THE USER's ID"
	},
	consumer_key: "YOU APP'S KEY",
	consumer_secret: "YOU APP'S SECRET",
	access_token: "YOUR USER-SPECIFIC ACCESS TOKEN",
	access_token_secret: "YOUR USER-SPECIFIC ACCESS TOKEN SECRET",
	callback: "URL TO YOUR APP"
});
```

## Gotchas

1. Don't pass in `callback` when requesting for activity measure (http://wbsapi.withings.net/v2/measure?action=getactivity)
    1. Otherwise you'll get response of `{"status":503,"error":"Invalid Params"}`

## Test

1. `npm test`