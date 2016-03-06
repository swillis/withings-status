/* */ 
var HTTP = require('http');
var HTTPS = require('https');
var URL = require('url2');
var Q = require('q');
var Reader = require('./reader');
exports.Server = function(respond) {
  var self = Object.create(exports.Server.prototype);
  var server = HTTP.createServer(function(_request, _response) {
    var request = exports.ServerRequest(_request);
    var response = exports.ServerResponse(_response);
    var closed = Q.defer();
    _request.on("end", function(error, value) {
      if (error) {
        closed.reject(error);
      } else {
        closed.resolve(value);
      }
    });
    Q.when(request, function(request) {
      return Q.when(respond(request, response), function(response) {
        if (!response)
          return;
        _response.writeHead(response.status, response.headers);
        if (response.onclose || response.onClose)
          Q.when(closed, response.onclose || response.onClose);
        return Q.when(response.body, function(body) {
          var length;
          if (Array.isArray(body) && (length = body.length) && body.every(function(chunk) {
            return typeof chunk === "string";
          })) {
            body.forEach(function(chunk, i) {
              if (i < length - 1) {
                _response.write(chunk, response.charset);
              } else {
                _response.end(chunk, response.charset);
              }
            });
          } else if (body) {
            var end;
            var done = body.forEach(function(chunk) {
              end = Q.when(end, function() {
                return Q.when(chunk, function(chunk) {
                  _response.write(chunk, response.charset);
                });
              });
            });
            return Q.when(done, function() {
              return Q.when(end, function() {
                _response.end();
              });
            });
          } else {
            _response.end();
          }
        });
      });
    }).done();
  });
  var stopped = Q.defer();
  server.on("close", function(err) {
    if (err) {
      stopped.reject(err);
    } else {
      stopped.resolve();
    }
  });
  self.stop = function() {
    server.close();
    listening = undefined;
    return stopped.promise;
  };
  var listening = Q.defer();
  server.on("listening", function(err) {
    if (err) {
      listening.reject(err);
    } else {
      listening.resolve(self);
    }
  });
  self.listen = function() {
    if (typeof server.port !== "undefined")
      return Q.reject(new Error("A server cannot be restarted or " + "started on a new port"));
    server.listen.apply(server, arguments);
    return listening.promise;
  };
  self.stopped = stopped.promise;
  self.node = server;
  self.nodeServer = server;
  self.address = server.address.bind(server);
  return self;
};
Object.defineProperties(exports.Server, {
  port: {get: function() {
      return this.node.port;
    }},
  host: {get: function() {
      return this.node.host;
    }}
});
exports.ServerRequest = function(_request, ssl) {
  var request = Object.create(_request, requestDescriptor);
  request.version = _request.httpVersion.split(".").map(Math.floor);
  request.method = _request.method;
  request.path = _request.url;
  request._pathInfo = null;
  request.scriptName = "";
  request.scheme = "http";
  var address = _request.connection.address();
  if (_request.headers.host) {
    request.hostname = _request.headers.host.split(":")[0];
  } else {
    request.hostname = address.address;
  }
  request.port = address.port;
  var defaultPort = request.port === (ssl ? 443 : 80);
  request.host = request.hostname + (defaultPort ? "" : ":" + request.port);
  var socket = _request.socket;
  request.remoteHost = socket.remoteAddress;
  request.remotePort = socket.remotePort;
  request.url = URL.format({
    protocol: request.scheme,
    host: _request.headers.host,
    port: request.port === (ssl ? 443 : 80) ? null : request.port,
    path: request.path
  });
  request.body = Reader(_request);
  request.headers = _request.headers;
  request.node = _request;
  request.nodeRequest = _request;
  request.nodeConnection = _request.connection;
  return Q.when(request.body, function(body) {
    request.body = body;
    return request;
  });
};
var requestDescriptor = {pathInfo: {
    get: function() {
      if (this._pathInfo === null) {
        this._pathInfo = decodeURIComponent(URL.parse(this.url).pathname);
      }
      return this._pathInfo;
    },
    set: function(pathInfo) {
      this._pathInfo = pathInfo;
    }
  }};
exports.ServerResponse = function(_response, ssl) {
  var response = Object.create(_response);
  response.ssl = ssl;
  response.node = _response;
  response.nodeResponse = _response;
  return response;
};
exports.normalizeRequest = function(request) {
  if (typeof request === "string") {
    request = {url: request};
  }
  request.method = request.method || "GET";
  request.headers = request.headers || {};
  if (request.url) {
    var url = URL.parse(request.url);
    request.ssl = url.protocol === "https:";
    request.hostname = url.hostname;
    request.host = url.host;
    request.port = +url.port;
    request.path = (url.pathname || "") + (url.search || "");
    request.auth = url.auth || void 0;
  }
  request.host = request.host || request.headers.host;
  request.port = request.port || (request.ssl ? 443 : 80);
  if (request.host && !request.hostname) {
    request.hostname = request.host.split(":")[0];
  }
  if (request.hostname && request.port && !request.host) {
    var defaultPort = request.ssl ? 443 : 80;
    request.host = request.hostname + (defaultPort ? "" : ":" + request.port);
  }
  request.headers.host = request.headers.host || request.host;
  request.path = request.path || "/";
  return request;
};
exports.normalizeResponse = function(response) {
  if (response === void 0) {
    return;
  }
  if (typeof response == "string") {
    response = [response];
  }
  if (response.forEach) {
    response = {
      status: 200,
      headers: {},
      body: response
    };
  }
  return response;
};
exports.request = function(request) {
  return Q.when(request, function(request) {
    request = exports.normalizeRequest(request);
    var deferred = Q.defer();
    var http = request.ssl ? HTTPS : HTTP;
    var requestOptions = {
      hostname: request.hostname,
      port: request.port || (request.ssl ? 443 : 80),
      localAddress: request.localAddress,
      socketPath: request.socketPath,
      method: request.method,
      path: request.path,
      headers: request.headers,
      auth: request.auth
    };
    if (request.agent !== undefined) {
      requestOptions.agent = request.agent;
    }
    var _request = http.request(requestOptions, function(_response) {
      deferred.resolve(exports.ClientResponse(_response, request.charset));
      _response.on("error", function(error) {
        console.warn(error && error.stack || error);
        deferred.reject(error);
      });
    });
    _request.on("error", function(error) {
      deferred.reject(error);
    });
    if (request.timeout) {
      _request.setTimeout(request.timeout, function() {
        _request.abort();
      });
    }
    Q.when(request.body, function(body) {
      var end,
          done;
      if (body) {
        done = body.forEach(function(chunk) {
          end = Q.when(end, function() {
            return Q.when(chunk, function(chunk) {
              _request.write(chunk, request.charset);
            });
          });
        });
      }
      return Q.when(end, function() {
        return Q.when(done, function() {
          _request.end();
        });
      });
    }).done();
    return deferred.promise;
  });
};
exports.read = function(request, qualifier) {
  qualifier = qualifier || function(response) {
    return response.status === 200;
  };
  return Q.when(exports.request(request), function(response) {
    if (!qualifier(response)) {
      var error = new Error("HTTP request failed with code " + response.status);
      error.response = response;
      throw error;
    }
    return Q.post(response.body, 'read', []);
  });
};
exports.ClientResponse = function(_response, charset) {
  var response = Object.create(exports.ClientResponse.prototype);
  response.status = _response.statusCode;
  response.version = _response.httpVersion;
  response.headers = _response.headers;
  response.node = _response;
  response.nodeResponse = _response;
  response.nodeConnection = _response.connection;
  return Q.when(Reader(_response, charset), function(body) {
    response.body = body;
    return response;
  });
};
