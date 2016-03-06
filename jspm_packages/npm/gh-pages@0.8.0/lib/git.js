/* */ 
(function(process) {
  var cp = require('child_process');
  var path = require('path');
  var util = require('util');
  var Q = require('q');
  var fs = require('q-io/fs');
  var git = 'git';
  function ProcessError(code, message) {
    var callee = arguments.callee;
    Error.apply(this, [message]);
    Error.captureStackTrace(this, callee);
    this.code = code;
    this.message = message;
    this.name = callee.name;
  }
  util.inherits(ProcessError, Error);
  function spawn(exe, args, cwd) {
    var deferred = Q.defer();
    var child = cp.spawn(exe, args, {cwd: cwd || process.cwd()});
    var buffer = [];
    child.stderr.on('data', function(chunk) {
      buffer.push(chunk.toString());
    });
    child.stdout.on('data', function(chunk) {
      deferred.notify(chunk);
    });
    child.on('close', function(code) {
      if (code) {
        var msg = buffer.join('') || 'Process failed: ' + code;
        deferred.reject(new ProcessError(code, msg));
      } else {
        deferred.resolve(code);
      }
    });
    return deferred.promise;
  }
  exports = module.exports = function(args, cwd) {
    return spawn(git, args, cwd);
  };
  exports.exe = function(exe) {
    git = exe;
  };
  exports.init = function init(cwd) {
    return spawn(git, ['init'], cwd);
  };
  exports.clone = function clone(repo, dir, branch, options) {
    return fs.exists(dir).then(function(exists) {
      if (exists) {
        return Q.resolve();
      } else {
        return fs.makeTree(path.dirname(path.resolve(dir))).then(function() {
          var args = ['clone', repo, dir, '--branch', branch, '--single-branch'];
          if (options.depth) {
            args.push('--depth', options.depth);
          }
          return spawn(git, args).fail(function(err) {
            return spawn(git, ['clone', repo, dir]);
          });
        });
      }
    });
  };
  var clean = exports.clean = function clean(cwd) {
    return spawn(git, ['clean', '-f', '-d'], cwd);
  };
  var reset = exports.reset = function reset(remote, branch, cwd) {
    return spawn(git, ['reset', '--hard', remote + '/' + branch], cwd);
  };
  exports.fetch = function fetch(remote, cwd) {
    return spawn(git, ['fetch', remote], cwd);
  };
  exports.checkout = function checkout(remote, branch, cwd) {
    var treeish = remote + '/' + branch;
    return spawn(git, ['ls-remote', '--exit-code', '.', treeish], cwd).then(function() {
      return spawn(git, ['checkout', branch], cwd).then(function() {
        return clean(cwd);
      }).then(function() {
        return reset(remote, branch, cwd);
      });
    }, function(error) {
      if (error instanceof ProcessError && error.code === 2) {
        return spawn(git, ['checkout', '--orphan', branch], cwd);
      } else {
        return Q.reject(error);
      }
    });
  };
  exports.rm = function rm(files, cwd) {
    return spawn(git, ['rm', '--ignore-unmatch', '-r', '-f', files], cwd);
  };
  exports.add = function add(files, cwd) {
    return spawn(git, ['add', files], cwd);
  };
  exports.commit = function commit(message, cwd) {
    return spawn(git, ['diff-index', '--quiet', 'HEAD', '.'], cwd).then(function() {
      return Q.resolve();
    }).fail(function() {
      return spawn(git, ['commit', '-m', message], cwd);
    });
  };
  exports.tag = function tag(name, cwd) {
    return spawn(git, ['tag', name], cwd);
  };
  exports.push = function push(remote, branch, cwd) {
    return spawn(git, ['push', '--tags', remote, branch], cwd);
  };
})(require('process'));
