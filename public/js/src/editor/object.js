(function(global) {
  'use strict';

  var lut = []; for (var i=0; i<256; i++) { lut[i] = (i<16?'0':'')+(i).toString(16); }

  fabric.util.object.extend(fabric.Object.prototype, {

    /**
     * The unique id
     */
    iduu: undefined,

    /**
     * The model element represented by this node
     */
    model: undefined,

    /**
     * The initialize function
     */
    initialize: function (options) {
      options || (options = { });

      this.setOptions(options);

      // model properties
      this.set('uuid', options.uuid || this.generateUuid());
      this.setModel(options.model);

//      // we redefine the toObject function
//      this.toObject = (function(toObject) {
//        return function() {
//          return fabric.util.object.extend(toObject.call(this), {
//            uuid: this.getUuid(), 
//            model: (this.model) ? this.model.getUuid() : null
//          });
//        };
//      })(this.toObject);

//      this.on('dropped', this._onDrop);
//      this.on('modified', this.onModified);
    },

    /**
     * Returns an object representation of an instance
     * @param {Array} [propertiesToInclude] Any properties that you might want to additionally include in the output
     * @return {Object} Object representation of an instance
     */
    toObject: function(propertiesToInclude) {
      var NUM_FRACTION_DIGITS = fabric.Object.NUM_FRACTION_DIGITS,

          object = {
            uuid:                     this.uuid, 
            model:                    (this.model) ? this.model.getUuid() : null,
            type:                     this.type,
            left:                     fabric.util.toFixed(this.left, NUM_FRACTION_DIGITS),
            top:                      fabric.util.toFixed(this.top, NUM_FRACTION_DIGITS),
            width:                    fabric.util.toFixed(this.width, NUM_FRACTION_DIGITS),
            height:                   fabric.util.toFixed(this.height, NUM_FRACTION_DIGITS),
          };

      if (!this.includeDefaultValues) {
        object = this._removeDefaultValues(object);
      }

      fabric.util.populateWithProperties(this, object, propertiesToInclude);

      return object;
    },

    /**
     * Getter for the iduu
     */
    getUuid: function() {
      return this.uuid;
    },

    /**
     * The generate Iduu function
     */
    generateUuid: function () {
      var d0 = Math.random()*0xffffffff|0
        , d1 = Math.random()*0xffffffff|0
        , d2 = Math.random()*0xffffffff|0
        , d3 = Math.random()*0xffffffff|0

      return lut[d0&0xff]+lut[d0>>8&0xff]+lut[d0>>16&0xff]+lut[d0>>24&0xff]+'-'+
        lut[d1&0xff]+lut[d1>>8&0xff]+'-'+lut[d1>>16&0x0f|0x40]+lut[d1>>24&0xff]+'-'+
        lut[d2&0x3f|0x80]+lut[d2>>8&0xff]+'-'+lut[d2>>16&0xff]+lut[d2>>24&0xff]+
        lut[d3&0xff]+lut[d3>>8&0xff]+lut[d3>>16&0xff]+lut[d3>>24&0xff];
    },

    /**
     * Getter for this model element
     */
    getModel: function () {
      return this.model;
    },

    /**
     * Setter for this model element
     */
    setModel: function (model) {

      if (!model)
        return;

      this.model = model;

      if (typeof model === 'string')
        return;

      if (typeof model === 'object' && model.addListener) {

        this.model.addListener(this);

        if (this.updateIcon)
          this.updateIcon();
      }
    },

  });

})();
