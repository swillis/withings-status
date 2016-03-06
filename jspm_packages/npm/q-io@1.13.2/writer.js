/* */ 
(function(Buffer, process) {
  var Q = require('q');
  module.exports = Writer;
  var version = process.versions.node.split('.');
  var supportsFinish = version[0] >= 1 || version[1] >= 10;
  function Writer(_stream, charset) {
    var self = Object.create(Writer.prototype);
    if (charset && _stream.setEncoding)
      _stream.setEncoding(charset);
    var drained = Q.defer();
    _stream.on("error", function(reason) {
      drained.reject(reason);
      drained = Q.defer();
    });
    _stream.on("drain", function() {
      drained.resolve();
      drained = Q.defer();
    });
    self.write = function(content) {
      if (!_stream.writeable && !_stream.writable)
        return Q.reject(new Error("Can't write to non-writable (possibly closed) stream"));
      if (typeof content !== "string") {
        content = new Buffer(content);
      }
      if (!_stream.write(content)) {
        return drained.promise;
      } else {
        return Q.resolve();
      }
    };
    self.flush = function() {
      return drained.promise;
    };
    self.close = function() {
      var finished;
      if (supportsFinish) {
        finished = Q.defer();
        _stream.on("finish", function() {
          finished.resolve();
        });
        _stream.on("error", function(reason) {
          finished.reject(reason);
        });
      }
      _stream.end();
      drained.resolve();
      if (finished) {
        return finished.promise;
      } else {
        return Q();
      }
    };
    self.destroy = function() {
      _stream.destroy();
      drained.resolve();
      return Q.resolve();
    };
    self.node = _stream;
    return Q(self);
  }
})(require('buffer').Buffer, require('process'));
