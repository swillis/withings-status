/* */ 
var Q = require('q');
var HTTP = require('../http');
var RouteApps = require('./route');
var StatusApps = require('./status');
exports.Normalize = function(app) {
  return function(request, response) {
    var request = HTTP.normalizeRequest(request);
    return Q.when(app(request, response), function(response) {
      return HTTP.normalizeResponse(response);
    });
  };
};
exports.Date = function(app, present) {
  present = present || function() {
    return new Date();
  };
  return RouteApps.Trap(app, function(response, request) {
    response.headers["date"] = "" + present();
  });
};
exports.Error = function(app, debug) {
  return function(request, response) {
    return Q.when(app(request, response), null, function(error) {
      if (!debug)
        error = undefined;
      return StatusApps.responseForStatus(request, 500, error && error.stack || error);
    });
  };
};
exports.Debug = function(app) {
  return exports.Error(app, true);
};
exports.Log = function(app, log, stamp) {
  log = log || console.log;
  stamp = stamp || function(message) {
    return new Date().toISOString() + " " + message;
  };
  return function(request, response) {
    var remoteHost = request.remoteHost + ":" + request.remotePort;
    var requestLine = request.method + " " + request.path + " " + "HTTP/" + request.version.join(".");
    log(stamp(remoteHost + " " + "-->     " + requestLine));
    return Q.when(app(request, response), function(response) {
      if (response) {
        log(stamp(remoteHost + " " + "<== " + response.status + " " + requestLine + " " + (response.headers["content-length"] || "-")));
      } else {
        log(stamp(remoteHost + " " + "... " + "... " + requestLine + " (response undefined / presumed streaming)"));
      }
      return response;
    }, function(reason) {
      log(stamp(remoteHost + " " + "!!!     " + requestLine + " " + (reason && reason.message || reason)));
      return Q.reject(reason);
    });
  };
};
exports.Time = function(app) {
  return function(request, response) {
    var start = new Date();
    return Q.when(app(request, response), function(response) {
      var stop = new Date();
      if (response && response.headers) {
        response.headers["x-response-time"] = "" + (stop - start);
      }
      return response;
    });
  };
};
exports.Headers = function(app, headers) {
  return function(request, response) {
    return Q.when(app(request, response), function(response) {
      if (response && response.headers) {
        Object.keys(headers).forEach(function(key) {
          if (!(key in response.headers)) {
            response.headers[key] = headers[key];
          }
        });
      }
      return response;
    });
  };
};
var farFuture = 1000 * 60 * 60 * 24 * 365 * 10;
exports.Permanent = function(app, future) {
  future = future || function() {
    return new Date(new Date().getTime() + farFuture);
  };
  app = RouteApps.Tap(app, function(request, response) {
    request.permanent = future;
  });
  app = RouteApps.Trap(app, function(response, request) {
    response.headers["expires"] = "" + future();
  });
  return app;
};
exports.Decorators = function(decorators, app) {
  decorators.reversed().forEach(function(Middleware) {
    app = Middleware(app);
  });
  return app;
};
