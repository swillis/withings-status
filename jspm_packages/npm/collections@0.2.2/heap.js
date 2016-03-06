/* */ 
var ArrayChanges = require('./listen/array-changes');
var Shim = require('./shim');
var GenericCollection = require('./generic-collection');
var MapChanges = require('./listen/map-changes');
var RangeChanges = require('./listen/range-changes');
var PropertyChanges = require('./listen/property-changes');
module.exports = Heap;
function Heap(values, equals, compare) {
  if (!(this instanceof Heap)) {
    return new Heap(values, equals, compare);
  }
  this.contentEquals = equals || Object.equals;
  this.contentCompare = compare || Object.compare;
  this.content = [];
  this.length = 0;
  this.addEach(values);
}
Heap.Heap = Heap;
Object.addEach(Heap.prototype, GenericCollection.prototype);
Object.addEach(Heap.prototype, PropertyChanges.prototype);
Object.addEach(Heap.prototype, RangeChanges.prototype);
Object.addEach(Heap.prototype, MapChanges.prototype);
Heap.prototype.constructClone = function(values) {
  return new this.constructor(values, this.contentEquals, this.contentCompare);
};
Heap.prototype.push = function(value) {
  this.content.push(value);
  this.float(this.content.length - 1);
  this.length++;
};
Heap.prototype.pop = function() {
  var result = this.content[0];
  var top = this.content.pop();
  if (this.content.length > 0) {
    this.content.set(0, top);
    this.sink(0);
  }
  this.length--;
  return result;
};
Heap.prototype.add = function(value) {
  this.push(value);
};
Heap.prototype.indexOf = function(value) {
  for (var index = 0; index < this.length; index++) {
    if (this.contentEquals(this.content[index], value)) {
      return index;
    }
  }
  return -1;
};
Heap.prototype.delete = function(value) {
  var index = this.indexOf(value);
  if (index === -1)
    return false;
  var top = this.content.pop();
  if (index === this.content.length)
    return true;
  this.content.set(index, top);
  var comparison = this.contentCompare(top, value);
  if (comparison > 0) {
    this.float(index);
  } else if (comparison < 0) {
    this.sink(index);
  }
  this.length--;
  return true;
};
Heap.prototype.peek = function() {
  if (this.length) {
    return this.content[0];
  }
};
Heap.prototype.max = function() {
  return this.peek();
};
Heap.prototype.one = function() {
  return this.peek();
};
Heap.prototype.float = function(index) {
  var value = this.content[index];
  while (index > 0) {
    var parentIndex = Math.floor((index + 1) / 2) - 1;
    var parent = this.content[parentIndex];
    if (this.contentCompare(parent, value) < 0) {
      this.content.set(parentIndex, value);
      this.content.set(index, parent);
    } else {
      break;
    }
    index = parentIndex;
  }
};
Heap.prototype.sink = function(index) {
  var length = this.content.length;
  var value = this.content[index];
  var left,
      right,
      leftIndex,
      rightIndex,
      swapIndex,
      needsSwap;
  while (true) {
    rightIndex = (index + 1) * 2;
    leftIndex = rightIndex - 1;
    needsSwap = false;
    if (leftIndex < length) {
      var left = this.content[leftIndex];
      var comparison = this.contentCompare(left, value);
      if (comparison > 0) {
        swapIndex = leftIndex;
        needsSwap = true;
      }
    }
    if (rightIndex < length) {
      var right = this.content[rightIndex];
      var comparison = this.contentCompare(right, needsSwap ? left : value);
      if (comparison > 0) {
        swapIndex = rightIndex;
        needsSwap = true;
      }
    }
    if (needsSwap) {
      this.content.set(index, this.content[swapIndex]);
      this.content.set(swapIndex, value);
      index = swapIndex;
    } else {
      break;
    }
  }
};
Heap.prototype.clear = function() {
  this.content.clear();
  this.length = 0;
};
Heap.prototype.reduce = function(callback, basis) {
  var thisp = arguments[2];
  return this.content.reduce(function(basis, value, key) {
    return callback.call(thisp, basis, value, key, this);
  }, basis, this);
};
Heap.prototype.reduceRight = function(callback, basis) {
  var thisp = arguments[2];
  return this.content.reduceRight(function(basis, value, key) {
    return callback.call(thisp, basis, value, key, this);
  }, basis, this);
};
Heap.prototype.makeObservable = function() {
  this.content.addRangeChangeListener(this, "content");
  this.content.addBeforeRangeChangeListener(this, "content");
  this.content.addMapChangeListener(this, "content");
  this.content.addBeforeMapChangeListener(this, "content");
};
Heap.prototype.handleContentRangeChange = function(plus, minus, index) {
  this.dispatchRangeChange(plus, minus, index);
};
Heap.prototype.handleContentRangeWillChange = function(plus, minus, index) {
  this.dispatchBeforeRangeChange(plus, minus, index);
};
Heap.prototype.handleContentMapChange = function(value, key) {
  this.dispatchMapChange(key, value);
};
Heap.prototype.handleContentMapWillChange = function(value, key) {
  this.dispatchBeforeMapChange(key, value);
};
