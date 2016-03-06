/* */ 
var Q = require('q');
var MimeParse = require('mimeparse');
var Status = require('./status');
exports.negotiate = negotiate;
function negotiate(request, types, header) {
  var keys = Object.keys(types);
  var accept = request.headers[header || "accept"] || "*";
  var best = MimeParse.bestMatch(keys, accept);
  return types[best];
}
exports.Method = function(methods, methodNotAllowed) {
  var keys = Object.keys(methods);
  if (!methodNotAllowed)
    methodNotAllowed = Status.methodNotAllowed;
  return function(request) {
    var method = request.method;
    if (Object.has(keys, method)) {
      return Object.get(methods, method)(request);
    } else {
      return methodNotAllowed(request);
    }
  };
};
var Negotiator = function(requestHeader, responseHeader, respond) {
  return function(types, notAcceptable) {
    var keys = Object.keys(types);
    if (!notAcceptable)
      notAcceptable = Status.notAcceptable;
    return function(request) {
      var accept = request.headers[requestHeader] || "*";
      var type = MimeParse.bestMatch(keys, accept);
      request.terms = request.terms || {};
      request.terms[responseHeader] = type;
      if (Object.has(keys, type)) {
        return Q.when(types[type](request), function(response) {
          if (respond !== null && response && response.status === 200 && response.headers) {
            response.headers[responseHeader] = type;
          }
          return response;
        });
      } else {
        return notAcceptable(request);
      }
    };
  };
};
exports.ContentType = Negotiator("accept", "content-type");
exports.Language = Negotiator("accept-language", "language");
exports.Charset = Negotiator("accept-charset", "charset");
exports.Encoding = Negotiator("accept-encoding", "encoding");
exports.Host = function(appForHost, notAcceptable) {
  var table = Object.keys(appForHost).map(function(pattern) {
    var parts = pattern.split(":");
    return [pattern, parts[0] || "*", parts[1] || "*", appForHost[pattern]];
  });
  if (!notAcceptable) {
    notAcceptable = Status.notAcceptable;
  }
  return function(request) {
    for (var index = 0; index < table.length; index++) {
      var row = table[index];
      var pattern = row[0];
      var hostname = row[1];
      var port = row[2];
      var app = row[3];
      if ((hostname === "*" || hostname === request.hostname) && (port === "*" || port === "" + request.port)) {
        request.terms = request.terms || {};
        request.terms.host = pattern;
        return app(request);
      }
    }
    return notAcceptable(request);
  };
};
exports.Select = function(select) {
  return function(request) {
    return Q.when(select(request), function(app) {
      return app(request);
    });
  };
};
