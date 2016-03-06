/* */ 
var http = require('http');
var qs = require('querystring');
var OAuth2 = require('../lib/oauth2').OAuth2;
var clientID = '';
var clientSecret = '';
var oauth2 = new OAuth2(clientID, clientSecret, 'https://github.com/', 'login/oauth/authorize', 'login/oauth/access_token', null);
http.createServer(function(req, res) {
  var p = req.url.split('/');
  pLen = p.length;
  var authURL = oauth2.getAuthorizeUrl({
    redirect_uri: 'http://localhost:8080/code',
    scope: ['repo', 'user'],
    state: 'some random string to protect against cross-site request forgery attacks'
  });
  var body = '<a href="' + authURL + '"> Get Code </a>';
  if (pLen === 2 && p[1] === '') {
    res.writeHead(200, {
      'Content-Length': body.length,
      'Content-Type': 'text/html'
    });
    res.end(body);
  } else if (pLen === 2 && p[1].indexOf('code') === 0) {
    var qsObj = {};
    qsObj = qs.parse(p[1].split('?')[1]);
    oauth2.getOAuthAccessToken(qsObj.code, {'redirect_uri': 'http://localhost:8080/code/'}, function(e, access_token, refresh_token, results) {
      if (e) {
        console.log(e);
        res.end(e);
      } else if (results.error) {
        console.log(results);
        res.end(JSON.stringify(results));
      } else {
        console.log('Obtained access_token: ', access_token);
        res.end(access_token);
      }
    });
  } else {}
}).listen(8080);
