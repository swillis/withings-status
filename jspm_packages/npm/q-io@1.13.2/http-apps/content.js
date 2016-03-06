/* */ 
var Q = require('q');
var Negotiate = require('./negotiate');
var QS = require('qs');
var URL = require('url2');
exports.Content = function(body, contentType, status) {
  return function() {
    return exports.content(body, contentType, status);
  };
};
exports.content = exports.ok = function(content, contentType, status) {
  status = status || 200;
  content = content || "";
  if (typeof content === "string") {
    content = [content];
  }
  contentType = contentType || "text/plain";
  return {
    "status": status,
    "headers": {"content-type": contentType},
    "body": content
  };
};
exports.ContentRequest = function(app) {
  return function(request, response) {
    return Q.when(request.body.read(), function(body) {
      return app(body, request, response);
    });
  };
};
exports.Inspect = function(app) {
  return Negotiate.Method({"GET": function(request, response) {
      return Q.when(app(request, response), function(object) {
        return {
          status: 200,
          headers: {"content-type": "text/plain"},
          body: [inspect(object)]
        };
      });
    }});
};
exports.ParseQuery = function(app) {
  return function(request, response) {
    request.query = QS.parse(URL.parse(request.url).query || "");
    return app(request, response);
  };
};
