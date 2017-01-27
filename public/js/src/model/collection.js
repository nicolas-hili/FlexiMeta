(function () {
  'use strict';

  var makeSubArray = (function(){

    var MAX_SIGNED_INT_VALUE = Math.pow(2, 32) - 1,
        hasOwnProperty = Object.prototype.hasOwnProperty;

    function ToUint32(value) {
      return value >>> 0;
    }

    function getMaxIndexProperty(object) {
      var maxIndex = -1, isValidProperty;

      for (var prop in object) {

        isValidProperty = (
          String(ToUint32(prop)) === prop &&
          ToUint32(prop) !== MAX_SIGNED_INT_VALUE &&
          hasOwnProperty.call(object, prop));

        if (isValidProperty && prop > maxIndex) {
          maxIndex = prop;
        }
      }
      return maxIndex;
    }

    return function(methods) {
      var length = 0;
      methods = methods || { };

      methods.length = {
        get: function() {
          var maxIndexProperty = +getMaxIndexProperty(this);
          return Math.max(length, maxIndexProperty + 1);
        },
        set: function(value) {
          var constrainedValue = ToUint32(value);
          if (constrainedValue !== +value) {
            throw new RangeError();
          }
          for (var i = constrainedValue, len = this.length; i < len; i++) {
            delete this[i];
          }
          length = constrainedValue;
        }
      };
      methods.toString = {
        value: Array.prototype.join
      };
      methods.toJSON = {
        value: fleximeta.model.Collection.prototype.toJSON
      };
      methods.push = {
        value: fleximeta.model.Collection.prototype.push
      };
      methods.splice = {
        value: fleximeta.model.Collection.prototype.splice
      };
      methods.addListener = {
        value: fleximeta.model.Collection.prototype.addListener
      };
      methods.notify = {
        value: fleximeta.model.Collection.prototype.notify
      };
      return Object.create(Array.prototype, methods);
    };
  })();

  fleximeta.model.Collection = (function() {
    var methods = {
      last: {
        value: function() {
          return this[this.length - 1];
        }
      }
    };
    return function() {
      var arr = makeSubArray(methods);

      Object.defineProperty(arr, 'listeners', {
        enumerable: false,
        writable: true
      });
      
      arr.listeners = [];
    
      if (arguments.length === 1) {
        arr.length = arguments[0];
      }
      else {
        arr.push.apply(arr, arguments);
      }
      return arr;
    };
  })();
  
  fleximeta.model.Collection.prototype.toJSON = function () {

    var arr = [];
    for (var i = 0; i < this.length; i++)
        arr.push(this[i]);
    return arr;
  };

  fleximeta.model.Collection.prototype.push = function () {
    Array.prototype.push.apply(this, arguments);
    this.notify('PUSH', arguments);
  };

  fleximeta.model.Collection.prototype.splice = function () {
    this.notify('REMOVE', arguments);
    Array.prototype.splice.apply(this, arguments);
    
    if (arguments[2]) {
      arguments.length = 1;
      arguments[0] = arguments[2];
    }
  };
  
  
  
  /**
   * add a listener
   */
  fleximeta.model.Collection.prototype.addListener = function (listener, propertyName) {
    if (this.listeners.indexOf(listener) === -1)
      this.listeners.push({listener:listener, propertyName: propertyName});
  };

  /**
   * remove a listener
   */
  fleximeta.model.Collection.prototype.removeListener = function (listener) {
    var index = this.listeners.indexOf(listener);
    if (index !== -1)
      this.listeners.splice(index, 0);
  };

  /**
   * yeld listeners for an update
   */
  fleximeta.model.Collection.prototype.notify = function (operation, newValues) {
    for (var i in this.listeners)
      this.listeners[i].listener.update(this, operation, this.listeners[i].propertyName, newValues);
  };
  
})();
