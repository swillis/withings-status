/* */ 
require('../shim');
var WeakMap = require('weak-map');
var object_owns = Object.prototype.hasOwnProperty;
var propertyChangeDescriptors = new WeakMap();
var overriddenObjectDescriptors = new WeakMap();
module.exports = PropertyChanges;
function PropertyChanges() {
  throw new Error("This is an abstract interface. Mix it. Don't construct it");
}
PropertyChanges.debug = true;
PropertyChanges.prototype.getOwnPropertyChangeDescriptor = function(key) {
  if (!propertyChangeDescriptors.has(this)) {
    propertyChangeDescriptors.set(this, {});
  }
  var objectPropertyChangeDescriptors = propertyChangeDescriptors.get(this);
  if (!object_owns.call(objectPropertyChangeDescriptors, key)) {
    objectPropertyChangeDescriptors[key] = {
      willChangeListeners: [],
      changeListeners: []
    };
  }
  return objectPropertyChangeDescriptors[key];
};
PropertyChanges.prototype.hasOwnPropertyChangeDescriptor = function(key) {
  if (!propertyChangeDescriptors.has(this)) {
    return false;
  }
  if (!key) {
    return true;
  }
  var objectPropertyChangeDescriptors = propertyChangeDescriptors.get(this);
  if (!object_owns.call(objectPropertyChangeDescriptors, key)) {
    return false;
  }
  return true;
};
PropertyChanges.prototype.addOwnPropertyChangeListener = function(key, listener, beforeChange) {
  if (this.makeObservable && !this.isObservable) {
    this.makeObservable();
  }
  var descriptor = PropertyChanges.getOwnPropertyChangeDescriptor(this, key);
  var listeners;
  if (beforeChange) {
    listeners = descriptor.willChangeListeners;
  } else {
    listeners = descriptor.changeListeners;
  }
  PropertyChanges.makePropertyObservable(this, key);
  listeners.push(listener);
  var self = this;
  return function cancelOwnPropertyChangeListener() {
    PropertyChanges.removeOwnPropertyChangeListener(self, key, listeners, beforeChange);
    self = null;
  };
};
PropertyChanges.prototype.addBeforeOwnPropertyChangeListener = function(key, listener) {
  return PropertyChanges.addOwnPropertyChangeListener(this, key, listener, true);
};
PropertyChanges.prototype.removeOwnPropertyChangeListener = function(key, listener, beforeChange) {
  var descriptor = PropertyChanges.getOwnPropertyChangeDescriptor(this, key);
  var listeners;
  if (beforeChange) {
    listeners = descriptor.willChangeListeners;
  } else {
    listeners = descriptor.changeListeners;
  }
  var index = listeners.lastIndexOf(listener);
  if (index === -1) {
    throw new Error("Can't remove listener: does not exist.");
  }
  listeners.splice(index, 1);
  if (descriptor.changeListeners.length + descriptor.willChangeListeners.length === 0) {
    PropertyChanges.makePropertyUnobservable(this, key);
  }
};
PropertyChanges.prototype.removeBeforeOwnPropertyChangeListener = function(key, listener) {
  return PropertyChanges.removeOwnPropertyChangeListener(this, key, listener, true);
};
PropertyChanges.prototype.dispatchOwnPropertyChange = function(key, value, beforeChange) {
  var descriptor = PropertyChanges.getOwnPropertyChangeDescriptor(this, key);
  if (descriptor.isActive) {
    return;
  }
  descriptor.isActive = true;
  var listeners;
  if (beforeChange) {
    listeners = descriptor.willChangeListeners;
  } else {
    listeners = descriptor.changeListeners;
  }
  var changeName = (beforeChange ? "Will" : "") + "Change";
  var genericHandlerName = "handleProperty" + changeName;
  var propertyName = String(key);
  propertyName = propertyName && propertyName[0].toUpperCase() + propertyName.slice(1);
  var specificHandlerName = "handle" + propertyName + changeName;
  try {
    listeners.forEach(function(listener) {
      var thisp = listener;
      listener = (listener[specificHandlerName] || listener[genericHandlerName] || listener);
      if (!listener.call) {
        throw new Error("No event listener for " + specificHandlerName + " or " + genericHandlerName + " or call on " + listener);
      }
      listener.call(thisp, value, key, this);
    }, this);
  } finally {
    descriptor.isActive = false;
  }
};
PropertyChanges.prototype.dispatchBeforeOwnPropertyChange = function(key, listener) {
  return PropertyChanges.dispatchOwnPropertyChange(this, key, listener, true);
};
PropertyChanges.prototype.makePropertyObservable = function(key) {
  if (Array.isArray(this)) {
    return;
  }
  if (!Object.isExtensible(this, key)) {
    throw new Error("Can't make property " + JSON.stringify(key) + " observable on " + this + " because object is not extensible");
  }
  var state;
  if (typeof this.__state__ === "object") {
    state = this.__state__;
  } else {
    state = {};
    if (Object.isExtensible(this, "__state__")) {
      Object.defineProperty(this, "__state__", {
        value: state,
        writable: true,
        enumerable: false
      });
    }
  }
  state[key] = this[key];
  if (!overriddenObjectDescriptors.has(this)) {
    overriddenPropertyDescriptors = {};
    overriddenObjectDescriptors.set(this, overriddenPropertyDescriptors);
  }
  var overriddenPropertyDescriptors = overriddenObjectDescriptors.get(this);
  if (object_owns.call(overriddenPropertyDescriptors, key)) {
    return;
  }
  var overriddenDescriptor;
  var attached = this;
  var formerDescriptor = Object.getOwnPropertyDescriptor(attached, key);
  do {
    overriddenDescriptor = Object.getOwnPropertyDescriptor(attached, key);
    if (overriddenDescriptor) {
      break;
    }
    attached = Object.getPrototypeOf(attached);
  } while (attached);
  overriddenDescriptor = overriddenDescriptor || {
    value: undefined,
    enumerable: true,
    writable: true,
    configurable: true
  };
  if (!overriddenDescriptor.configurable) {
    throw new Error("Can't observe non-configurable properties");
  }
  overriddenPropertyDescriptors[key] = overriddenDescriptor;
  if (!overriddenDescriptor.writable && !overriddenDescriptor.set) {
    return;
  }
  var propertyListener;
  if ('value' in overriddenDescriptor) {
    propertyListener = {
      get: function() {
        return overriddenDescriptor.value;
      },
      set: function(value) {
        if (value === overriddenDescriptor.value) {
          return value;
        }
        PropertyChanges.dispatchBeforeOwnPropertyChange(this, key, overriddenDescriptor.value);
        overriddenDescriptor.value = value;
        state[key] = value;
        PropertyChanges.dispatchOwnPropertyChange(this, key, value);
        return value;
      },
      enumerable: overriddenDescriptor.enumerable,
      configurable: true
    };
  } else {
    propertyListener = {
      get: function() {
        if (overriddenDescriptor.get) {
          return overriddenDescriptor.get.apply(this, arguments);
        }
      },
      set: function(value) {
        var formerValue;
        if (overriddenDescriptor.get) {
          formerValue = overriddenDescriptor.get.apply(this, arguments);
        }
        if (overriddenDescriptor.set) {
          overriddenDescriptor.set.apply(this, arguments);
        }
        if (overriddenDescriptor.get) {
          value = overriddenDescriptor.get.apply(this, arguments);
          state[key] = value;
        }
        if (value === formerValue) {
          return value;
        }
        PropertyChanges.dispatchBeforeOwnPropertyChange(this, key, formerValue);
        PropertyChanges.dispatchOwnPropertyChange(this, key, value);
        return value;
      },
      enumerable: overriddenDescriptor.enumerable,
      configurable: true
    };
  }
  Object.defineProperty(this, key, propertyListener);
};
PropertyChanges.prototype.makePropertyUnobservable = function(key) {
  if (Array.isArray(this)) {
    return;
  }
  if (!overriddenObjectDescriptors.has(this)) {
    throw new Error("Can't uninstall observer on property");
  }
  var overriddenPropertyDescriptors = overriddenObjectDescriptors.get(this);
  if (!overriddenPropertyDescriptors[key]) {
    throw new Error("Can't uninstall observer on property");
  }
  var overriddenDescriptor = overriddenPropertyDescriptors[key];
  delete overriddenPropertyDescriptors[key];
  var state;
  if (typeof this.__state__ === "object") {
    state = this.__state__;
  } else {
    state = {};
    if (Object.isExtensible(this, "__state__")) {
      Object.defineProperty(this, "__state__", {
        value: state,
        writable: true,
        enumerable: false
      });
    }
  }
  delete state[key];
  Object.defineProperty(this, key, overriddenDescriptor);
};
PropertyChanges.getOwnPropertyChangeDescriptor = function(object, key) {
  if (object.getOwnPropertyChangeDescriptor) {
    return object.getOwnPropertyChangeDescriptor(key);
  } else {
    return PropertyChanges.prototype.getOwnPropertyChangeDescriptor.call(object, key);
  }
};
PropertyChanges.hasOwnPropertyChangeDescriptor = function(object, key) {
  if (object.hasOwnPropertyChangeDescriptor) {
    return object.hasOwnPropertyChangeDescriptor(key);
  } else {
    return PropertyChanges.prototype.hasOwnPropertyChangeDescriptor.call(object, key);
  }
};
PropertyChanges.addOwnPropertyChangeListener = function(object, key, listener, beforeChange) {
  if (!Object.isObject(object)) {} else if (object.addOwnPropertyChangeListener) {
    return object.addOwnPropertyChangeListener(key, listener, beforeChange);
  } else {
    return PropertyChanges.prototype.addOwnPropertyChangeListener.call(object, key, listener, beforeChange);
  }
};
PropertyChanges.removeOwnPropertyChangeListener = function(object, key, listener, beforeChange) {
  if (!Object.isObject(object)) {} else if (object.removeOwnPropertyChangeListener) {
    return object.removeOwnPropertyChangeListener(key, listener, beforeChange);
  } else {
    return PropertyChanges.prototype.removeOwnPropertyChangeListener.call(object, key, listener, beforeChange);
  }
};
PropertyChanges.dispatchOwnPropertyChange = function(object, key, value, beforeChange) {
  if (!Object.isObject(object)) {} else if (object.dispatchOwnPropertyChange) {
    return object.dispatchOwnPropertyChange(key, value, beforeChange);
  } else {
    return PropertyChanges.prototype.dispatchOwnPropertyChange.call(object, key, value, beforeChange);
  }
};
PropertyChanges.addBeforeOwnPropertyChangeListener = function(object, key, listener) {
  return PropertyChanges.addOwnPropertyChangeListener(object, key, listener, true);
};
PropertyChanges.removeBeforeOwnPropertyChangeListener = function(object, key, listener) {
  return PropertyChanges.removeOwnPropertyChangeListener(object, key, listener, true);
};
PropertyChanges.dispatchBeforeOwnPropertyChange = function(object, key, value) {
  return PropertyChanges.dispatchOwnPropertyChange(object, key, value, true);
};
PropertyChanges.makePropertyObservable = function(object, key) {
  if (object.makePropertyObservable) {
    return object.makePropertyObservable(key);
  } else {
    return PropertyChanges.prototype.makePropertyObservable.call(object, key);
  }
};
PropertyChanges.makePropertyUnobservable = function(object, key) {
  if (object.makePropertyUnobservable) {
    return object.makePropertyUnobservable(key);
  } else {
    return PropertyChanges.prototype.makePropertyUnobservable.call(object, key);
  }
};
