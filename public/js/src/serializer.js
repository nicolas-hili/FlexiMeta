(function () {
    'use strict';

    fleximeta.Serializer = {};

    fleximeta.Serializer.serialize = function (model, options) {

      options = options || {};

      var cache = []
        , indent = options.indent || 0
        , removeLabel = options.removeLabel || false
        , prettify = options.prettify || false

      var json = JSON.stringify(model, function (key, value) {

        if (key === 'label' && removeLabel)
            return;

        if (typeof value === 'object' && value !== null && value.getUuid) {
            if (cache.indexOf(value.getUuid()) !== -1) {
                // Circular reference found, discard key
                return value.getUuid();
            }
            // Store value in our collection
            cache.push(value.getUuid());
        }
        return value;
      }, indent);

      cache = null;

      if (prettify)
        json = fleximeta.prettify.json.prettyPrint(json);

      return json;

    };

    fleximeta.Serializer.deserialize = function (json, options) {

      options = options || {};
         
      var baseClass = options.baseClass || fleximeta.model.Base;

      return new baseClass(json);
    };

})();

