/* */ 
require('../shim');
var List = require('../list');
var WeakMap = require('weak-map');
var PropertyChanges = require('./property-changes');
var RangeChanges = require('./range-changes');
var MapChanges = require('./map-changes');
var array_splice = Array.prototype.splice;
var array_slice = Array.prototype.slice;
var array_reverse = Array.prototype.reverse;
var array_sort = Array.prototype.sort;
var protoIsSupported = {}.__proto__ === Object.prototype;
var array_makeObservable;
if (protoIsSupported) {
  array_makeObservable = function() {
    this.__proto__ = ChangeDispatchArray;
  };
} else {
  array_makeObservable = function() {
    Object.defineProperties(this, observableArrayProperties);
  };
}
Object.defineProperty(Array.prototype, "makeObservable", {
  value: array_makeObservable,
  writable: true,
  configurable: true,
  enumerable: false
});
function defineEach(prototype) {
  for (var name in prototype) {
    Object.defineProperty(Array.prototype, name, {
      value: prototype[name],
      writable: true,
      configurable: true,
      enumerable: false
    });
  }
}
defineEach(PropertyChanges.prototype);
defineEach(RangeChanges.prototype);
defineEach(MapChanges.prototype);
var observableArrayProperties = {
  isObservable: {
    value: true,
    writable: true,
    configurable: true
  },
  makeObservable: {
    value: Function.noop,
    writable: true,
    configurable: true
  },
  reverse: {
    value: function reverse() {
      var reversed = this.constructClone(this);
      reversed.reverse();
      this.swap(0, this.length, reversed);
      return this;
    },
    writable: true,
    configurable: true
  },
  sort: {
    value: function sort() {
      this.dispatchBeforeRangeChange(this, this, 0);
      for (var i = 0; i < this.length; i++) {
        PropertyChanges.dispatchBeforeOwnPropertyChange(this, i, this[i]);
        this.dispatchBeforeMapChange(i, this[i]);
      }
      array_sort.apply(this, arguments);
      for (var i = 0; i < this.length; i++) {
        PropertyChanges.dispatchOwnPropertyChange(this, i, this[i]);
        this.dispatchMapChange(i, this[i]);
      }
      this.dispatchRangeChange(this, this, 0);
      return this;
    },
    writable: true,
    configurable: true
  },
  splice: {
    value: function splice(start, length) {
      var minus = array_slice.call(this, start, start + length);
      var plus = array_slice.call(arguments, 2);
      if (!minus.length && !plus.length)
        return plus;
      var diff = plus.length - minus.length;
      var oldLength = this.length;
      var newLength = Math.max(this.length + diff, start + plus.length);
      var longest = Math.max(oldLength, newLength);
      if (diff) {
        PropertyChanges.dispatchBeforeOwnPropertyChange(this, "length", this.length);
      }
      this.dispatchBeforeRangeChange(plus, minus, start);
      if (diff === 0) {
        for (var i = start; i < start + plus.length; i++) {
          PropertyChanges.dispatchBeforeOwnPropertyChange(this, i, this[i]);
          this.dispatchBeforeMapChange(i, this[i]);
        }
      } else if (PropertyChanges.hasOwnPropertyChangeDescriptor(this)) {
        for (var i = start; i < longest; i++) {
          PropertyChanges.dispatchBeforeOwnPropertyChange(this, i, this[i]);
          this.dispatchBeforeMapChange(i, this[i]);
        }
      }
      if (start > oldLength) {
        this.length = start;
      }
      var result = array_splice.apply(this, arguments);
      if (diff === 0) {
        for (var i = start; i < start + plus.length; i++) {
          PropertyChanges.dispatchOwnPropertyChange(this, i, this[i]);
          this.dispatchMapChange(i, this[i]);
        }
      } else if (PropertyChanges.hasOwnPropertyChangeDescriptor(this)) {
        for (var i = start; i < longest; i++) {
          PropertyChanges.dispatchOwnPropertyChange(this, i, this[i]);
          this.dispatchMapChange(i, this[i]);
        }
      }
      this.dispatchRangeChange(plus, minus, start);
      if (diff) {
        PropertyChanges.dispatchOwnPropertyChange(this, "length", this.length);
      }
      return result;
    },
    writable: true,
    configurable: true
  },
  set: {
    value: function set(index, value) {
      this.splice(index, 1, value);
      return this;
    },
    writable: true,
    configurable: true
  },
  shift: {
    value: function shift() {
      return this.splice(0, 1)[0];
    },
    writable: true,
    configurable: true
  },
  pop: {
    value: function pop() {
      if (this.length) {
        return this.splice(this.length - 1, 1)[0];
      }
    },
    writable: true,
    configurable: true
  },
  push: {
    value: function push(arg) {
      if (arguments.length === 1) {
        return this.splice(this.length, 0, arg);
      } else {
        var args = array_slice.call(arguments);
        return this.swap(this.length, 0, args);
      }
    },
    writable: true,
    configurable: true
  },
  unshift: {
    value: function unshift(arg) {
      if (arguments.length === 1) {
        return this.splice(0, 0, arg);
      } else {
        var args = array_slice.call(arguments);
        return this.swap(0, 0, args);
      }
    },
    writable: true,
    configurable: true
  },
  clear: {
    value: function clear() {
      return this.splice(0, this.length);
    },
    writable: true,
    configurable: true
  }
};
var ChangeDispatchArray = Object.create(Array.prototype, observableArrayProperties);
