/* */ 
var Q = require('q');
var StatusApps = require('./status');
exports.Cap = function(app, notFound) {
  notFound = notFound || StatusApps.notFound;
  return function(request, response) {
    if (request.pathInfo === "" || request.pathInfo === "/") {
      return app(request, response);
    } else {
      return notFound(request, response);
    }
  };
};
exports.Tap = function(app, tap) {
  return function(request, response) {
    var self = this,
        args = arguments;
    return Q.when(tap.apply(this, arguments), function(response) {
      if (response) {
        return response;
      } else {
        return app.apply(self, args);
      }
    });
  };
};
exports.Trap = function(app, trap) {
  return function(request, response) {
    return Q.when(app.apply(this, arguments), function(response) {
      if (response) {
        response.headers = response.headers || {};
        return trap(response, request) || response;
      }
    });
  };
};
exports.Branch = function(paths, notFound) {
  if (!paths)
    paths = {};
  if (!notFound)
    notFound = StatusApps.notFound;
  return function(request, response) {
    if (!/^\//.test(request.pathInfo)) {
      return notFound(request, response);
    }
    var path = request.pathInfo.slice(1);
    var parts = path.split("/");
    var part = decodeURIComponent(parts.shift());
    if (Object.has(paths, part)) {
      request.scriptName = request.scriptName + part + "/";
      request.pathInfo = path.slice(part.length);
      return Object.get(paths, part)(request, response);
    }
    return notFound(request, response);
  };
};
exports.FirstFound = function(cascade) {
  return function(request, response) {
    var i = 0,
        ii = cascade.length;
    function next() {
      var response = cascade[i++](request, response);
      if (i < ii) {
        return Q.when(response, function(response) {
          if (response.status === 404) {
            return next();
          } else {
            return response;
          }
        });
      } else {
        return response;
      }
    }
    return next();
  };
};
