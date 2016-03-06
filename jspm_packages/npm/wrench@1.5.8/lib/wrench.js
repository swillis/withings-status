/* */ 
(function(process) {
  var fs = require('fs'),
      _path = require('path'),
      isWindows = !!process.platform.match(/^win/);
  exports.readdirSyncRecursive = function(baseDir) {
    baseDir = baseDir.replace(/\/$/, '');
    var readdirSyncRecursive = function(baseDir) {
      var files = [],
          curFiles,
          nextDirs,
          isDir = function(fname) {
            return fs.existsSync(_path.join(baseDir, fname)) ? fs.statSync(_path.join(baseDir, fname)).isDirectory() : false;
          },
          prependBaseDir = function(fname) {
            return _path.join(baseDir, fname);
          };
      curFiles = fs.readdirSync(baseDir);
      nextDirs = curFiles.filter(isDir);
      curFiles = curFiles.map(prependBaseDir);
      files = files.concat(curFiles);
      while (nextDirs.length) {
        files = files.concat(readdirSyncRecursive(_path.join(baseDir, nextDirs.shift())));
      }
      return files;
    };
    var fileList = readdirSyncRecursive(baseDir).map(function(val) {
      return _path.relative(baseDir, val);
    });
    return fileList;
  };
  exports.readdirRecursive = function(baseDir, fn) {
    baseDir = baseDir.replace(/\/$/, '');
    var waitCount = 0;
    function readdirRecursive(curDir) {
      var prependcurDir = function(fname) {
        return _path.join(curDir, fname);
      };
      waitCount++;
      fs.readdir(curDir, function(e, curFiles) {
        if (e) {
          fn(e);
          return;
        }
        waitCount--;
        curFiles = curFiles.map(prependcurDir);
        curFiles.forEach(function(it) {
          waitCount++;
          fs.stat(it, function(e, stat) {
            waitCount--;
            if (e) {
              fn(e);
            } else {
              if (stat.isDirectory()) {
                readdirRecursive(it);
              }
            }
            if (waitCount == 0) {
              fn(null, null);
            }
          });
        });
        fn(null, curFiles.map(function(val) {
          return _path.relative(baseDir, val);
        }));
        if (waitCount == 0) {
          fn(null, null);
        }
      });
    }
    ;
    readdirRecursive(baseDir);
  };
  exports.rmdirSyncRecursive = function(path, failSilent) {
    var files;
    try {
      files = fs.readdirSync(path);
    } catch (err) {
      if (failSilent)
        return;
      throw new Error(err.message);
    }
    for (var i = 0; i < files.length; i++) {
      var file = _path.join(path, files[i]);
      var currFile = fs.lstatSync(file);
      if (currFile.isDirectory()) {
        exports.rmdirSyncRecursive(file);
      } else if (currFile.isSymbolicLink()) {
        if (isWindows) {
          fs.chmodSync(file, 666);
        }
        fs.unlinkSync(file);
      } else {
        if (isWindows) {
          fs.chmodSync(file, 666);
        }
        fs.unlinkSync(file);
      }
    }
    return fs.rmdirSync(path);
  };
  function isFileIncluded(opts, dir, filename) {
    function isMatch(filter) {
      if (typeof filter === 'function') {
        return filter(filename, dir) === true;
      } else {
        return filename.match(filter);
      }
    }
    if (opts.include || opts.exclude) {
      if (opts.exclude) {
        if (isMatch(opts.exclude)) {
          return false;
        }
      }
      if (opts.include) {
        if (isMatch(opts.include)) {
          return true;
        } else {
          return false;
        }
      }
      return true;
    } else if (opts.filter) {
      var filter = opts.filter;
      if (!opts.whitelist) {
        return isMatch(filter) ? false : true;
      } else {
        return !isMatch(filter) ? false : true;
      }
    }
    return true;
  }
  exports.copyDirSyncRecursive = function(sourceDir, newDirLocation, opts) {
    opts = opts || {};
    try {
      if (fs.statSync(newDirLocation).isDirectory()) {
        if (opts.forceDelete) {
          exports.rmdirSyncRecursive(newDirLocation);
        } else {
          return new Error('You are trying to delete a directory that already exists. Specify forceDelete in the opts argument to override this. Bailing~');
        }
      }
    } catch (e) {}
    var checkDir = fs.statSync(sourceDir);
    try {
      fs.mkdirSync(newDirLocation, checkDir.mode);
    } catch (e) {
      if (e.code !== 'EEXIST')
        throw e;
    }
    var files = fs.readdirSync(sourceDir);
    var hasFilter = opts.filter || opts.include || opts.exclude;
    var preserveFiles = opts.preserveFiles === true;
    var preserveTimestamps = opts.preserveTimestamps === true;
    for (var i = 0; i < files.length; i++) {
      if (typeof opts !== 'undefined') {
        if (hasFilter) {
          if (!isFileIncluded(opts, sourceDir, files[i])) {
            continue;
          }
        }
        if (opts.excludeHiddenUnix && /^\./.test(files[i]))
          continue;
      }
      var currFile = fs.lstatSync(_path.join(sourceDir, files[i]));
      var fCopyFile = function(srcFile, destFile) {
        if (typeof opts !== 'undefined' && opts.preserveFiles && fs.existsSync(destFile))
          return;
        var contents = fs.readFileSync(srcFile);
        fs.writeFileSync(destFile, contents);
        var stat = fs.lstatSync(srcFile);
        fs.chmodSync(destFile, stat.mode);
        if (preserveTimestamps) {
          fs.utimesSync(destFile, stat.atime, stat.mtime);
        }
      };
      if (currFile.isDirectory()) {
        exports.copyDirSyncRecursive(_path.join(sourceDir, files[i]), _path.join(newDirLocation, files[i]), opts);
      } else if (currFile.isSymbolicLink()) {
        var symlinkFull = fs.readlinkSync(_path.join(sourceDir, files[i]));
        symlinkFull = _path.resolve(fs.realpathSync(sourceDir), symlinkFull);
        if (typeof opts !== 'undefined' && !opts.inflateSymlinks) {
          fs.symlinkSync(symlinkFull, _path.join(newDirLocation, files[i]));
          continue;
        }
        var tmpCurrFile = fs.lstatSync(symlinkFull);
        if (tmpCurrFile.isDirectory()) {
          exports.copyDirSyncRecursive(symlinkFull, _path.join(newDirLocation, files[i]), opts);
        } else {
          fCopyFile(symlinkFull, _path.join(newDirLocation, files[i]));
        }
      } else {
        fCopyFile(_path.join(sourceDir, files[i]), _path.join(newDirLocation, files[i]));
      }
    }
  };
  exports.chmodSyncRecursive = function(sourceDir, filemode) {
    var files = fs.readdirSync(sourceDir);
    for (var i = 0; i < files.length; i++) {
      var currFile = fs.lstatSync(_path.join(sourceDir, files[i]));
      if (currFile.isDirectory()) {
        exports.chmodSyncRecursive(_path.join(sourceDir, files[i]), filemode);
      } else {
        fs.chmod(_path.join(sourceDir, files[i]), filemode);
      }
    }
    fs.chmod(sourceDir, filemode);
  };
  exports.chownSyncRecursive = function(sourceDir, uid, gid) {
    var files = fs.readdirSync(sourceDir);
    for (var i = 0; i < files.length; i++) {
      var currFile = fs.lstatSync(_path.join(sourceDir, files[i]));
      if (currFile.isDirectory()) {
        exports.chownSyncRecursive(_path.join(sourceDir, files[i]), uid, gid);
      } else {
        fs.chownSync(_path.join(sourceDir, files[i]), uid, gid);
      }
    }
    fs.chownSync(sourceDir, uid, gid);
  };
  exports.rmdirRecursive = function rmdirRecursive(dir, failSilent, clbk) {
    if (clbk === null || typeof clbk == 'undefined')
      clbk = function(err) {};
    fs.readdir(dir, function(err, files) {
      if (err && typeof failSilent === 'boolean' && !failSilent)
        return clbk(err);
      if (typeof failSilent === 'function')
        clbk = failSilent;
      (function rmFile(err) {
        if (err)
          return clbk(err);
        var filename = files.shift();
        if (filename === null || typeof filename == 'undefined')
          return fs.rmdir(dir, clbk);
        var file = dir + '/' + filename;
        fs.lstat(file, function(err, stat) {
          if (err)
            return clbk(err);
          if (stat.isDirectory())
            rmdirRecursive(file, rmFile);
          else
            fs.unlink(file, rmFile);
        });
      })();
    });
  };
  exports.copyDirRecursive = function copyDirRecursive(srcDir, newDir, opts, clbk) {
    var originalArguments = Array.prototype.slice.apply(arguments);
    srcDir = _path.normalize(srcDir);
    newDir = _path.normalize(newDir);
    fs.stat(newDir, function(err, newDirStat) {
      if (!err) {
        if (typeof opts !== 'undefined' && typeof opts !== 'function' && opts.forceDelete)
          return exports.rmdirRecursive(newDir, function(err) {
            copyDirRecursive.apply(this, originalArguments);
          });
        else
          return clbk(new Error('You are trying to delete a directory that already exists. Specify forceDelete in an options object to override this.'));
      }
      if (typeof opts === 'function')
        clbk = opts;
      fs.stat(srcDir, function(err, srcDirStat) {
        if (err)
          return clbk(err);
        fs.mkdir(newDir, srcDirStat.mode, function(err) {
          if (err)
            return clbk(err);
          fs.readdir(srcDir, function(err, files) {
            if (err)
              return clbk(err);
            (function copyFiles(err) {
              if (err)
                return clbk(err);
              var filename = files.shift();
              if (filename === null || typeof filename == 'undefined')
                return clbk(null);
              var file = srcDir + '/' + filename,
                  newFile = newDir + '/' + filename;
              fs.stat(file, function(err, fileStat) {
                if (err)
                  return clbk(err);
                if (fileStat.isDirectory())
                  copyDirRecursive(file, newFile, copyFiles, clbk);
                else if (fileStat.isSymbolicLink())
                  fs.readlink(file, function(err, link) {
                    if (err)
                      return clbk(err);
                    fs.symlink(link, newFile, copyFiles);
                  });
                else
                  fs.readFile(file, function(err, data) {
                    if (err)
                      return clbk(err);
                    fs.writeFile(newFile, data, copyFiles);
                  });
              });
            })();
          });
        });
      });
    });
  };
  var mkdirSyncRecursive = function(path, mode) {
    var self = this;
    path = _path.normalize(path);
    try {
      fs.mkdirSync(path, mode);
    } catch (err) {
      if (err.code == "ENOENT") {
        var slashIdx = path.lastIndexOf(_path.sep);
        if (slashIdx > 0) {
          var parentPath = path.substring(0, slashIdx);
          mkdirSyncRecursive(parentPath, mode);
          mkdirSyncRecursive(path, mode);
        } else {
          throw err;
        }
      } else if (err.code == "EEXIST") {
        return;
      } else {
        throw err;
      }
    }
  };
  exports.mkdirSyncRecursive = mkdirSyncRecursive;
  exports.LineReader = function(filename, bufferSize) {
    this.bufferSize = bufferSize || 8192;
    this.buffer = "";
    this.fd = fs.openSync(filename, "r");
    this.currentPosition = 0;
  };
  exports.LineReader.prototype = {
    close: function() {
      return fs.closeSync(this.fd);
    },
    getBufferAndSetCurrentPosition: function(position) {
      var res = fs.readSync(this.fd, this.bufferSize, position, "ascii");
      this.buffer += res[0];
      if (res[1] === 0) {
        this.currentPosition = -1;
      } else {
        this.currentPosition = position + res[1];
      }
      return this.currentPosition;
    },
    hasNextLine: function() {
      while (this.buffer.indexOf('\n') === -1) {
        this.getBufferAndSetCurrentPosition(this.currentPosition);
        if (this.currentPosition === -1)
          return false;
      }
      if (this.buffer.indexOf("\n") > -1 || this.buffer.length !== 0)
        return true;
      return false;
    },
    getNextLine: function() {
      var lineEnd = this.buffer.indexOf("\n"),
          result = this.buffer.substring(0, lineEnd != -1 ? lineEnd : this.buffer.length);
      this.buffer = this.buffer.substring(result.length + 1, this.buffer.length);
      return result;
    }
  };
})(require('process'));
