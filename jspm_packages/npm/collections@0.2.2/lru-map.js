/* */ 
"use strict";
var Shim = require('./shim');
var LruSet = require('./lru-set');
var GenericCollection = require('./generic-collection');
var GenericMap = require('./generic-map');
var PropertyChanges = require('./listen/property-changes');
module.exports = LruMap;
function LruMap(values, maxLength, equals, hash, getDefault) {
  if (!(this instanceof LruMap)) {
    return new LruMap(values, maxLength, equals, hash, getDefault);
  }
  equals = equals || Object.equals;
  hash = hash || Object.hash;
  getDefault = getDefault || Function.noop;
  this.contentEquals = equals;
  this.contentHash = hash;
  this.getDefault = getDefault;
  this.store = new LruSet(undefined, maxLength, function keysEqual(a, b) {
    return equals(a.key, b.key);
  }, function keyHash(item) {
    return hash(item.key);
  });
  this.length = 0;
  this.addEach(values);
}
LruMap.LruMap = LruMap;
Object.addEach(LruMap.prototype, GenericCollection.prototype);
Object.addEach(LruMap.prototype, GenericMap.prototype);
Object.addEach(LruMap.prototype, PropertyChanges.prototype);
LruMap.prototype.constructClone = function(values) {
  return new this.constructor(values, this.maxLength, this.contentEquals, this.contentHash, this.getDefault);
};
LruMap.prototype.log = function(charmap, stringify) {
  stringify = stringify || this.stringify;
  this.store.log(charmap, stringify);
};
LruMap.prototype.stringify = function(item, leader) {
  return leader + JSON.stringify(item.key) + ": " + JSON.stringify(item.value);
};
LruMap.prototype.addMapChangeListener = function() {
  if (!this.dispatchesMapChanges) {
    var self = this;
    this.store.addBeforeRangeChangeListener(function(plus, minus) {
      if (plus.length && minus.length) {
        self.dispatchBeforeMapChange(minus[0].key, undefined);
      }
    });
    this.store.addRangeChangeListener(function(plus, minus) {
      if (plus.length && minus.length) {
        self.dispatchMapChange(minus[0].key, undefined);
      }
    });
  }
  GenericMap.prototype.addMapChangeListener.apply(this, arguments);
};
