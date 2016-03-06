/* */ 
var merge = require("merge");
var MD5 = require("crypto-js/md5");
var HmacSHA1 = require("crypto-js/hmac-sha1");
var Base64 = require("crypto-js/enc-base64");

module.exports = {

	defaults: {
		"oauth_signature_method": "HMAC-SHA1",
		"oauth_version": "1.0"
	},

	generateUrl: function generateUrl(opts) {
		var self = this;

		var misses = self.findMisses(opts, [
			"url", 
			"consumer_key", 
			"consumer_secret",
			"access_token",
			"access_token_secret"
		]);

		if (misses.length != 0) {
			console.log("Missing options " + misses.join(", "));
			return "";
		}

		// opts.parameters is optional
		var parameters = merge((opts["parameters"] || {}), {
			"oauth_consumer_key": opts["consumer_key"],
			"oauth_token": opts["access_token"],
			"oauth_nonce": self.generateNonce(),
			"oauth_timestamp": self.generateOAuthTimestamp(),
			"oauth_signature_method": self.defaults["oauth_signature_method"],
			"oauth_version": self.defaults["oauth_version"]
		});

		if (opts["callback"]) {
			parameters["oauth_callback"] = opts["callback"];
		}

		var baseString = self.generateOAuthBaseString(opts["url"], parameters);
		var oAuthSecret = opts["consumer_secret"] + "&" + opts["access_token_secret"];

		parameters["oauth_signature"] = self.generateOAuthSignature(baseString, oAuthSecret);

		var params = self.generateUrlParameters(parameters);
		var url = opts["url"] + "?" + params;

		return url;
	},

	findMisses: function findMisses(opts, keys) {
		var misses = [];

		if (!opts) {
			return misses;
		}

		if (!(keys instanceof Array)) {
			keys = [keys];
		}

		keys.forEach(function(key) {
			var value = opts[key];

			if (value == undefined || value == null) {
				misses.push(key);
			}
		});

		return misses;
	},

	generateNonce: function generateNonce() {
		return MD5("" + Math.random());
	},

	generateOAuthTimestamp: function generateOAuthTimestamp() {
		return Math.round((new Date).getTime() / 1000);
	},

	generateOAuthBaseString: function generateOAuthBaseString(url, parameters) {
		var params = this.generateUrlParameters(parameters);

        return ("GET&" + encodeURIComponent(url) + "&" + encodeURIComponent(params));
	},

	generateUrlParameters: function generateUrlParameters(parameters) {
		var sortedKeys = Object.keys(parameters);
        sortedKeys.sort();

        var params = "";
        var amp = "";

        for (var i = 0 ; i < sortedKeys.length; i++) {
            params += amp + sortedKeys[i] + "=" + parameters[sortedKeys[i]];
            amp = "&";
        }

        return params;
	},

	generateOAuthSignature: function generateOAuthSignature(baseString, oAuthSecret) {
		return encodeURIComponent(HmacSHA1(baseString, oAuthSecret).toString(Base64));
	}

};