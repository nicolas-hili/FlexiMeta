(function () {
  'use strict';

  fabric.Relation = fabric.util.createClass(fabric.Object, {
      
        type: 'relation',

        initialize: function (options) {
            options || (options = { });

            this.callSuper('initialize', options);

            this.set({
                source: options.source || null,
                target: options.target || null,
                relation: options.relation || null,
                selectable: false,
                lockMovementX: true,
                lockMovementY: true,
                perPixelTargetFind: true,
                angle: 0
            });


            this.contextMenu = {
               'edit': {name:'Edit Relation', icon: 'edit', callback:'editRelation'},
               'delete': {name:'Delete', icon: 'delete', callback:'deleteRelation'},

            };

            if (typeof this.source === 'object'
             && typeof this.target === 'object') {
                this.source.addOutgoingEdge(this);
                this.target.addIncomingEdge(this);
                this.calcWidthHeight();
            }
        },

        getContextMenu: function () {
            return this.contextMenu;
        },

        editRelation: function () {

            var individual = this.source.model
              , related = this.target.model
              , narrator = fleximeta.Narrator.getInstance()
              , oldReference = individual[this.relation]
              , self = this;

            var oldRef = {
                ref: individual[this.relation],
                isExist: true,
                isEnumerable: true,
                isArray: individual[this.relation] instanceof Array,
                isObject: typeof individual[this.relation] === 'object'
            };

            oldRef.isArrayOfObjects = oldRef.isArray;

            var refs = Object.keys(individual).filter(function (key) {
                var value = individual[key]
                  , isArray = value instanceof Array
                  , isArrayOfObjects = isArray && (value.length === 0 || typeof value[0] === 'object')
                  , isObject = !isArray && typeof value === 'object';
               return isObject || isArrayOfObjects;
            });

            narrator.createPromptModal({
                name: 'Edit relation',
                label: 'New name of the relation:',
                defaultValue: this.relation,
                datalist: refs,
                onSubmit: function (e, data) {

                    var newRef = {};
                    data = data[0].value;

                    if (data === this.relation)
                        return;

                    newRef.value = individual[data];
                    newRef.isExist = (individual[data] != null);
                    newRef.isEnumerable = newRef.isExist && individual.propertyIsEnumerable(data);
                    newRef.isArray = newRef.isEnumerable && individual[data] instanceof Array;
                    newRef.isObject = newRef.isEnumerable && !newRef.isArray && typeof individual[data] === 'object';
                    newRef.isArrayOfObjects = newRef.isArray && (!newRef.value.length || typeof newRef.value[0] === 'object');
                    
                    if (newRef.isExist) {

                        if (!newRef.isEnumerable || (!newRef.isObject && !newRef.isArrayOfObjects)) {
                            console.log(data + ' is a reserved key, a primitive value or an array of primitive values.');
                            console.log(newRef);
                            return;
                        }

                        self.setNewRef(individual, related, data, newRef);
                    }
                    else
                        self.setNewRef(individual, related, data, newRef);

                    if (oldRef.isExist)
                        self.unsetOldRef(individual, related, oldRef);

                    self.relation = data;

                    return true;
                },
                onFinished: function () {
                    self.canvas.renderAll();
                },
            });
        },

        setNewRef: function (individual, related, key, newRef) {

            if (!newRef.isExist)
                individual.set(key, related);
            else if (!newRef.isArrayOfObjects) {
                this.convertRefIntoComposition(individual, key);
                individual.get(key).push(related);
            }
        },

        unsetOldRef: function (individual, related, oldRef) {

            var key = this.relation;

            if (!oldRef.isArrayOfObjects) {
                individual.unset(key);
            }
            else {
                var index = individual.get(key).indexOf(related);
                if (index !== -1)
                    individual.get(key).splice(index, 1);
                if(!individual.get(key).length)
                    individual.unset(key);
            }
        },

        convertRefIntoComposition: function (individual, key) {
            var val = individual.get(key);
            individual.unset(key);
            individual.setCollection(key, [val], val.constructor);
        },

        calcWidthHeight: function () {

            var p1 = this.source.getCenterPoint()
              , p2 = this.target.getCenterPoint()
              , angle = this.calcAngle(p1, p2)
              , oppositeAngle = (angle > Math.PI) ? angle - Math.PI : angle + Math.PI
              , pCalc1 = this.source.getAnchor(angle, false)
              , pCalc2 = this.target.getAnchor(oppositeAngle, true);

            this.set({
                width: pCalc2.x -pCalc1.x,
                height: pCalc2.y - pCalc1.y,
                left: pCalc1.x,
                top: pCalc1.y,
                beginPoint: {x: -this.width/2, y: -this.height/2},
                endPoint: {x: this.width/2, y: this.height/2},
                cangle: this.calcAngle(pCalc1, pCalc2)
            });

            this.setCoords();
        },

        calcAngle: function (p1, p2) {

          var dx = p2.x - p1.x
            , dy = p2.y - p1.y
            , angle = Math.atan2(dy, dx);

          if (angle < 0) angle = 2*Math.PI+angle;

          return angle;
        },

        _renderSimpleArrow: function (ctx, p, arrowSize, arrowAngle, angle, position) {
      
          var sens = (position === 'begin') ? 1: -1
            
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x+sens*arrowSize*Math.cos(angle-arrowAngle),p.y+sens*arrowSize*Math.sin(angle-arrowAngle));
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x+sens*arrowSize*Math.cos(angle+arrowAngle),p.y+sens*arrowSize*Math.sin(angle+arrowAngle));
          ctx.lineWidth = 1;
          ctx.stroke();

          return p;
        },

        toObject: function (propertiesToInclude) {
          return fabric.util.object.extend(this.callSuper('toObject', propertiesToInclude), {
                relation: this.relation,
                source: (this.source) ? this.source.getUuid() : null,
                target: (this.target) ? this.target.getUuid() : null,
          });
        },

        resolve: function (cache) {
            this.source = cache[this.source];
            this.target = cache[this.target];
        },

        _renderLabel: function (ctx) {
          var angle = this.cangle
            , oppositeAngle = (angle > Math.PI) ? angle - Math.PI : angle + Math.PI
            , anchorPosition2 = this.target.getAnchorPosition(oppositeAngle, true)
            , align = 'center'
            , x = 0
            , y = 0;

            ctx.font = "14px Arial";
            ctx.fillStyle = 'white';
            ctx.textAlign = align;

            var width = ctx.measureText(this.relation).width
              , height = 20;
            ctx.fillRect(-width/2, -height/2, width, height);
            ctx.stroke();

            ctx.fillStyle = 'black';

            ctx.fillText(this.relation, x, y);
        },

        _render: function (ctx, noTransform) {
            this.calcWidthHeight();
            ctx.strokeStyle = 'black';
            ctx.beginPath();
            ctx.moveTo(-this.width/2, -this.height/2);
            ctx.lineTo(this.width/2, this.height/2);
            ctx.stroke();
            this._renderSimpleArrow(ctx, this.endPoint, 10, Math.PI/6, this.cangle);
            this._renderLabel(ctx);
        },

      deleteRelation: function () {

          var self = this
            , narrator = fleximeta.Narrator.getInstance();

          narrator.createValidationModal({
              name: 'Remove Relation',
              label: 'Are you sure you want to delete this relation ?',
              onResult: function (result) {
                if (result) {
                    self.deleteEdge();
                }
              },
              onFinished: function () {
                  self.canvas.renderAll();
              }
          });
      },

        deleteEdge: function () {

            var individual = this.source.model
              , related = this.target.model
              , self = this;

            var oldRef = {
                ref: individual[this.relation],
                isExist: true,
                isEnumerable: true,
                isArray: individual[this.relation] instanceof Array,
                isObject: typeof individual[this.relation] === 'object'
            };

            oldRef.isArrayOfObjects = oldRef.isArray;
            this.unsetOldRef(individual, related, oldRef);

       //     this.source.model.unset(this.relation);
            this.canvas.remove(this);
        }
  });

  fabric.Relation.fromObject = function (object) {
    return new fabric.Relation(object);
  };
  
})();
