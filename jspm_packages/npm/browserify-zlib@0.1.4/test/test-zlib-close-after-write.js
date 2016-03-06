/* */ 
var tape = require('tape');
var zlib = require('../../browserify-zlib@0.1.4');
tape(function(t) {
  t.plan(1);
  zlib.gzip('hello', function(err, out) {
    var unzip = zlib.createGunzip();
    unzip.write(out);
    unzip.close(function() {
      t.ok(true);
    });
  });
});
