/* */ 
var Q = require('q');
var Content = require('./content');
var Status = require('./status');
exports.HandleJsonResponses = function(app, reviver, tab) {
  return function(request) {
    request.handleJsonResponse = exports.handleJsonResponse;
    return Q.fcall(app, request).then(function(response) {
      if (response.data !== void 0) {
        return Q.fcall(exports.handleJsonResponse, response, reviver, tab);
      } else {
        return response;
      }
    });
  };
};
exports.handleJsonResponse = function(response, revivier, tab) {
  response.headers["content-type"] = "application/json";
  response.body = {forEach: function(write) {
      write(JSON.stringify(response.data, revivier, tab));
    }};
  return response;
};
exports.Json = function(app, reviver, tabs) {
  return function(request, response) {
    return Q.when(app(request, response), function(object) {
      return exports.json(object, reviver, tabs);
    });
  };
};
exports.json = function(content, reviver, tabs) {
  try {
    var json = JSON.stringify(content, reviver, tabs);
  } catch (exception) {
    return Q.reject(exception);
  }
  return Content.ok([json], "application/json");
};
exports.JsonRequest = function(app, badRequest) {
  if (!badRequest)
    badRequest = Status.badRequest;
  return Content.ContentRequest(function(content, request, response) {
    try {
      var object = JSON.parse(content);
    } catch (error) {
      return badRequest(request, error);
    }
    return app(object, request, response);
  });
};
