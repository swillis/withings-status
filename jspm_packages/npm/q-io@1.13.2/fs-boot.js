/* */ 
(function(process) {
  (function(exports) {
    var regExpEscape = function(str) {
      return str.replace(/[-[\]{}()*+?.\\^$|,#\s]/g, "\\$&");
    };
    var path = require('path');
    exports.ROOT = exports.SEPARATOR = path.sep || (process.platform === "win32" ? "\\" : "/");
    if (path.sep === "\\") {
      exports.ALT_SEPARATOR = "/";
    } else {
      exports.ALT_SEPARATOR = undefined;
    }
    var separatorCached,
        altSeparatorCached,
        separatorReCached;
    exports.SEPARATORS_RE = function() {
      if (separatorCached !== exports.SEPARATOR || altSeparatorCached !== exports.ALT_SEPARATOR) {
        separatorCached = exports.SEPARATOR;
        altSeparatorCached = exports.ALT_SEPARATOR;
        separatorReCached = new RegExp("[" + (separatorCached || "").replace(/[-[\]{}()*+?.\\^$|,#\s]/g, "\\$&") + (altSeparatorCached || "").replace(/[-[\]{}()*+?.\\^$|,#\s]/g, "\\$&") + "]", "g");
      }
      return separatorReCached;
    };
    exports.split = function(path) {
      var parts;
      try {
        parts = String(path).split(exports.SEPARATORS_RE());
      } catch (exception) {
        throw new Error("Cannot split " + (typeof path) + ", " + JSON.stringify(path));
      }
      if (parts.length === 1 && parts[0] === "")
        return [];
      return parts;
    };
    exports.join = function() {
      if (arguments.length === 1 && Array.isArray(arguments[0]))
        return exports.normal.apply(exports, arguments[0]);
      return exports.normal.apply(exports, arguments);
    };
    exports.resolve = function() {
      var root = "";
      var parents = [];
      var children = [];
      var leaf = "";
      for (var i = 0; i < arguments.length; i++) {
        var path = String(arguments[i]);
        if (path == "")
          continue;
        var parts = path.split(exports.SEPARATORS_RE());
        if (exports.isAbsolute(path)) {
          root = parts.shift() + exports.SEPARATOR;
          parents = [];
          children = [];
        }
        leaf = parts.pop();
        if (leaf == "." || leaf == "..") {
          parts.push(leaf);
          leaf = "";
        }
        for (var j = 0; j < parts.length; j++) {
          var part = parts[j];
          if (part == "." || part == "") {} else if (part == "..") {
            if (children.length) {
              children.pop();
            } else {
              if (root) {} else {
                parents.push("..");
              }
            }
          } else {
            children.push(part);
          }
        }
        ;
      }
      path = parents.concat(children).join(exports.SEPARATOR);
      if (path)
        leaf = exports.SEPARATOR + leaf;
      return root + path + leaf;
    };
    exports.normal = function() {
      var root = "";
      var parents = [];
      var children = [];
      for (var i = 0,
          ii = arguments.length; i < ii; i++) {
        var path = String(arguments[i]);
        if (path === "")
          continue;
        var parts = path.split(exports.SEPARATORS_RE());
        if (exports.isAbsolute(path)) {
          root = parts.shift() + exports.SEPARATOR;
          parents = [];
          children = [];
        }
        for (var j = 0,
            jj = parts.length; j < jj; j++) {
          var part = parts[j];
          if (part === "." || part === "") {} else if (part == "..") {
            if (children.length) {
              children.pop();
            } else {
              if (root) {} else {
                parents.push("..");
              }
            }
          } else {
            children.push(part);
          }
        }
      }
      path = parents.concat(children).join(exports.SEPARATOR);
      return root + path;
    };
    exports.isAbsolute = function(path) {
      var parts = exports.split(path);
      if (parts.length == 0)
        return false;
      return exports.isRoot(parts[0]);
    };
    exports.isRelative = function(path) {
      return !exports.isAbsolute(path);
    };
    exports.isRoot = function(first) {
      if (exports.SEPARATOR === "\\") {
        return /[a-zA-Z]:$/.test(first);
      } else {
        return first == "";
      }
    };
    exports.root = function(path) {
      if (!exports.isAbsolute(path))
        path = require('./fs').absolute(path);
      var parts = exports.split(path);
      return exports.join(parts[0], "");
    };
    exports.directory = function(path) {
      path = exports.normal(path);
      var absolute = exports.isAbsolute(path);
      var parts = exports.split(path);
      if (parts.length) {
        if (parts[parts.length - 1] == "..") {
          parts.push("..");
        } else {
          parts.pop();
        }
      } else {
        parts.unshift("..");
      }
      return parts.join(exports.SEPARATOR) || (exports.isRelative(path) ? "" : exports.ROOT);
    };
    exports.base = function(path, extension) {
      var base = path.split(exports.SEPARATORS_RE()).pop();
      if (extension)
        base = base.replace(new RegExp(regExpEscape(extension) + "$"), "");
      return base;
    };
    exports.extension = function(path) {
      path = exports.base(path);
      path = path.replace(/^\.*/, "");
      var index = path.lastIndexOf(".");
      return index <= 0 ? "" : path.substring(index);
    };
  })(typeof exports !== "undefined" ? exports : FS_BOOT = {});
})(require('process'));
