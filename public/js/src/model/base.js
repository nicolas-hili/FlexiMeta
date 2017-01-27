(function () {
  'use strict';

    var lut = []; for (var i=0; i<256; i++) { lut[i] = (i<16?'0':'')+(i).toString(16); }

    var Placeholder = function Placeholder(uuid, object, key, index, klass) {
        this.uuid = uuid;
        this.object = object;
        this.key = key;
        this.index = index;
        this.klass = klass || fleximeta.model.Base;
    };
    var cache = {};
    cache.placeholders = {};


    fleximeta.model.Base = function (options) {

        Object.defineProperty(this, "uuid", {
            enumerable: true,
            writable: true
        });

        Object.defineProperty(this, "label", {
            enumerable: true,
            writable: true
        });

        Object.defineProperty(this, "listeners", {
            enumerable: false,
            writable: true
        });

        this.listeners = {};


        options || (options = { });

        this.set(options);

        if (!this.uuid)
           this.uuid = this.generateUuid();
    };

    fleximeta.model.Base.emptyCache = function () {
        cache = {};
        cache.placeholders = {};
        this.createCache();
    };

    fleximeta.model.Base.createCache = function () {
        cache.save = function (object) {

            var klass = fleximeta.model.Base;

            if (!(object instanceof fleximeta.model.Base)) {
                if(this.placeholders[object.uuid]) {
                    klass = this.placeholders[object.uuid][0].klass;
                }
                object = new klass(object);
            }

            if(typeof(this[object.uuid]) === "undefined") {
               this[object.uuid] = object;

               if (this.placeholders[object.uuid]) {

                   for (var i = 0; i < this.placeholders[object.uuid].length; i++) {
                       var placeholder = this.placeholders[object.uuid][i]
                         , isArray = placeholder.object instanceof Array; 

                     if (!isArray) {
                        placeholder.object.set(placeholder.key, object); 
                     }
                     else {
                        placeholder.object.splice(placeholder.index, 1, object);
                     }
                   }
               }
            }

            return this[object.uuid];
        };

        cache.restore = function (uuid, object, key, index, klass) {

            if (uuid == null)
                return null;

            var obj = this[uuid];

            if (typeof(obj) === "undefined") {
                obj = new Placeholder(uuid, object, key, index, klass);
                if (typeof(this.placeholders[uuid]) === "undefined")
                    this.placeholders[uuid] = [];
                this.placeholders[uuid].push(obj);
            }

            return obj;
        };
    };

    fleximeta.model.Base.createCache();

    fleximeta.model.Base.prototype.generateUuid = function () {
      var d0 = Math.random()*0xffffffff|0
        , d1 = Math.random()*0xffffffff|0
        , d2 = Math.random()*0xffffffff|0
        , d3 = Math.random()*0xffffffff|0

      return lut[d0&0xff]+lut[d0>>8&0xff]+lut[d0>>16&0xff]+lut[d0>>24&0xff]+'-'+
        lut[d1&0xff]+lut[d1>>8&0xff]+'-'+lut[d1>>16&0x0f|0x40]+lut[d1>>24&0xff]+'-'+
        lut[d2&0x3f|0x80]+lut[d2>>8&0xff]+'-'+lut[d2>>16&0xff]+lut[d2>>24&0xff]+
        lut[d3&0xff]+lut[d3>>8&0xff]+lut[d3>>16&0xff]+lut[d3>>24&0xff];
    };

    fleximeta.model.Base.prototype.getUuid = function () {
        return this.uuid;
    };

    fleximeta.model.Base.prototype.get = function (key) {
        return this[key];
    };

    fleximeta.model.Base.prototype.set = function (key, value) {

        if (typeof key === 'object') {
            for (var i in key)
                this.set(i, key[i]);

            return;
        }

        if (value instanceof Array)
            this.setCollection(key, value);
        else if (typeof value === 'object')
            this[key] = cache.save(value);
        else if (this.isId(key, value))
            this[key] = cache.restore(value, this, key);
        else
            this[key] = value;

        if (typeof value === 'object' && value.notify) {
            value.addListener(this.uuid, this);
        }

        this.notify('SET', key, value);
    };

    fleximeta.model.Base.prototype.isId = function (key, value) {
        return key != 'uuid' && value && value.length === 36;
    };

    fleximeta.model.Base.prototype.unset = function (key) {
        if(this[key])
            delete this[key];
    };

    fleximeta.model.Base.prototype.setCollection = function (key, array, klass) {
    
        if (!(array instanceof Array))
            array = [array];

        // FIXME: array.sort is a hack to insert id values before objects values. Otherwise, cache.restore will fail to find the proper klass
        var collection = new fleximeta.model.Collection()
          , array = array.sort(function (a, b) {
              if (typeof b === 'string' && typeof a === 'string')
                  return 0;

                return (typeof b === 'string') ? 1 : -1;
            })
          , klass = klass || fleximeta.model.Base;

        if (array && (array instanceof Array)) {

          for (var i = 0; i < array.length; i++) {

            var value = array[i]
              , temp;

            if (typeof value === 'object') {
                temp = cache.save(new klass(value));
            }
            else if (this.isId(key, value))
                temp = cache.restore(value, collection, null, i, klass);
            else
                temp = array[i];

            collection.push(temp);
          }
        }
        this[key] = collection;
        this[key].addListener(this, key);
    };

    fleximeta.model.Base.prototype.getLabel = function () {
        return this.label || this.name || this.uuid;
    };

    fleximeta.model.Base.prototype.validate = function (errors, toExclude) {

        errors = errors || [];

        if (!toExclude)
            return errors;

        var self = this;

        var extraKeys = Object.keys(this).filter(function (key) {
            return key !== 'uuid' 
                && key !== 'label' 
                && toExclude.indexOf(key) == -1
        }); 

        extraKeys.forEach(function (key) {
            errors.push({element:self, id:key+'NotExpected', label: 'the <strong>' + key + '</strong> attribute of the <strong>' +self.getLabel()+ '</strong> element is not expected according to the metamodel definition'});
        });

        return errors;

    }

    fleximeta.model.Base.prototype.find = function (elementId) {
        if (typeof elementId !== 'string')
          return elementId;
    
        if (this.getUuid() === elementId) {
          return this;
        }
      
        var keys = Object.keys(this); 
        for (var i = 0; i < keys.length; i++) {
          var property = this[keys[i]];
          
          if (property instanceof Array) {
            for (var j = 0; j < property.length; j++) {
              if (!property[j].find)
                break;
              var match = property[j].find(elementId);
              if (match) {
                return match;
              }
            }
          }
          else if (property && property.find) {
            var match = property.find(elementId);
            if (match)
              return match;
          }
        }
        return null;
    };

    fleximeta.model.Base.prototype.addListener = function (key, listener) {
        this.listeners[key] = listener;
    };

    fleximeta.model.Base.prototype.removeListener = function (key) {
        delete this.listeners[key];
    };

    fleximeta.model.Base.prototype.notify = function (operation, property, values) {
    //    for (var key in this.listeners)
    //      this.listeners[key].update(this, operation, property, values);
    };

    fleximeta.model.Base.prototype.update = function (model, operation, key, values) {
        this.notify(operation, key, values);
    };


})();
