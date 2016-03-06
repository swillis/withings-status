/* */ 
var Negotiation = require('./negotiate');
var HtmlApps = require('./html');
exports.statusCodes = {
  100: 'Continue',
  101: 'Switching Protocols',
  102: 'Processing',
  200: 'OK',
  201: 'Created',
  202: 'Accepted',
  203: 'Non-Authoritative Information',
  204: 'No Content',
  205: 'Reset Content',
  206: 'Partial Content',
  207: 'Multi-Status',
  300: 'Multiple Choices',
  301: 'Moved Permanently',
  302: 'Found',
  303: 'See Other',
  304: 'Not Modified',
  305: 'Use Proxy',
  307: 'Temporary Redirect',
  400: 'Bad Request',
  401: 'Unauthorized',
  402: 'Payment Required',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  406: 'Not Acceptable',
  407: 'Proxy Authentication Required',
  408: 'Request Timeout',
  409: 'Conflict',
  410: 'Gone',
  411: 'Length Required',
  412: 'Precondition Failed',
  413: 'Request Entity Too Large',
  414: 'Request-URI Too Large',
  415: 'Unsupported Media Type',
  416: 'Request Range Not Satisfiable',
  417: 'Expectation Failed',
  422: 'Unprocessable Entity',
  423: 'Locked',
  424: 'Failed Dependency',
  500: 'Internal Server Error',
  501: 'Not Implemented',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Timeout',
  505: 'HTTP Version Not Supported',
  507: 'Insufficient Storage'
};
exports.statusMessages = {};
for (var code in exports.statusCodes)
  exports.statusMessages[exports.statusCodes[code]] = +code;
exports.statusWithNoEntityBody = function(status) {
  return (status >= 100 && status <= 199) || status == 204 || status == 304;
};
exports.appForStatus = function(status) {
  return function(request) {
    return exports.responseForStatus(request, status, request.method + " " + request.path);
  };
};
exports.responseForStatus = function(request, status, addendum) {
  if (exports.statusCodes[status] === undefined)
    throw "Unknown status code";
  var message = exports.statusCodes[status];
  if (exports.statusWithNoEntityBody(status)) {
    return {
      status: status,
      headers: {}
    };
  } else {
    var handlers = {};
    handlers["text/plain"] = exports.textResponseForStatus;
    if (request.handleHtmlFragmentResponse) {
      handlers["text/html"] = exports.htmlResponseForStatus;
    }
    var responseForStatus = Negotiation.negotiate(request, handlers) || exports.textResponseForStatus;
    return responseForStatus(request, status, message, addendum);
  }
};
exports.textResponseForStatus = function(request, status, message, addendum) {
  var content = message + "\n";
  if (addendum) {
    content += addendum + "\n";
  }
  var contentLength = content.length;
  return {
    status: status,
    statusMessage: message,
    headers: {"content-length": contentLength},
    body: [content]
  };
};
exports.htmlResponseForStatus = function(request, status, message, addendum) {
  return {
    status: status,
    statusMessage: message,
    headers: {},
    htmlTitle: message,
    htmlFragment: {forEach: function(write) {
        write("<h1>" + HtmlApps.escapeHtml(message) + "</h1>\n");
        write("<p>Status: " + status + "</p>\n");
        if (addendum) {
          write("<pre>" + HtmlApps.escapeHtml(addendum) + "</pre>\n");
        }
      }}
  };
};
exports.badRequest = exports.appForStatus(400);
exports.notFound = exports.appForStatus(404);
exports.methodNotAllowed = exports.appForStatus(405);
exports.noLanguage = exports.notAcceptable = exports.appForStatus(406);
