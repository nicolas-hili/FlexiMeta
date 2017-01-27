(function () {
    'use strict';

      var nodeToConnect = undefined;

      fleximeta.editor.Canvas = fabric.util.createClass(fabric.Canvas, {

        initialize: function (element, options) {
          options || (options = { });

          this.callSuper('initialize', element, options);
          
          if(options.model)
            this.model = options.model;
          else {
            this.model = new fleximeta.model.Base({
                'label': 'The Simpson Family',
                'lastname': 'Simpson',
                'address': '742 Evergreen Terrace'
            });
            this.model.setCollection('members');
          }

          this.contextMenu = {
             'add': {name:'Add Member', icon: 'add', callback:'addMember'},
             'rename': {name:'Rename Family', icon: 'edit', callback:'rename'}
          };
        },

        getContextMenu: function () {
            return this.contextMenu;
        },

        find: function (uuid) {
            var object = this.getObjects().filter(function (obj) {
                return obj.uuid === uuid;
            });
            if (object.length)
                return object[0];

            return undefined;
        },

        rename: function () {

            var family = this.model,
                narrator = fleximeta.Narrator.getInstance();

            narrator.createPromptModal({
                narrator: 'bart',
                name: 'Rename',
                label: 'New name of the family',
                hideOnFinish: 'yes',
                defaultValue: this.model.get('lastname'),
                onSubmit: function (e, data) {
                    family.set('lastname', data[0].value);
                    family.set('label', 'The ' + data[0].value + ' family');
                }
            });

        },

        addMember: function (e) {

            var individual = new fabric.Individual({
                left: e.offsetX,
                top: e.offsetY,
                label: 'new member',
                width: 200,
                height: 160,
                attributes: [
                    {name:'firstname', value:''}
                ]
            });

            this.add(individual);
            this.renderAll();
            this.model.get('members').push(individual.model);
            

            individual.rename();
        },


        createGrid: function () {

            var self = this;

            var grid = new fabric.Grid({
                width: editor.offsetWidth,
                height: editor.offsetHeight
            });

            this.add(grid);

            grid.cloneAsImage(function (clone) {
                clone.set({
                  left: grid.left,
                  top: grid.top,
                  scaleX: 1,
                  evented: false,
                  selectable: false,
                  lockMovement: true,
                  scaleY: 1
                });
                self.insertAt(clone, 0);
                self.remove(grid);
            });
        },

        _setObjectScale: function(localMouse, transform, lockScalingX, lockScalingY, by, lockScalingFlip, _dim) {
            var target = transform.target
              , corner = transform.target.__corner
              , ratioX = (localMouse.x) / transform.offsetX
              , ratioY = (localMouse.y) / transform.offsetY
              , minimumWidth = target.get('minimumWidth') || 0
              , minimumHeight = target.get('minimumHeight') || 0;

            if (corner === 'tl' || corner === 'tr' || corner === 'mt')
                ratioY = (localMouse.y) / target.originalState.height;

            if (corner === 'ml' || corner === 'tl' || corner === 'bl')
                ratioX = (localMouse.x) / target.originalState.width;

            var newWidth = target.originalState.width*ratioX
              , newHeight = target.originalState.height*ratioY;

            if (by === 'x' || by === 'equally')
                if (newWidth >= minimumWidth)
                    target.set('width', target.originalState.width*ratioX);

            if (by === 'y' || by === 'equally')
                if (newHeight >= minimumHeight)
                    target.set('height', target.originalState.height*ratioY);
        },

        initiateConnection: function (node) {
            nodeToConnect = node;
            this.off('object:selected', this.terminateConnection);
            this.on('object:selected', this.terminateConnection);
            this.renderAll();
        },

        terminateConnection: function (e) {
            var target = e.target;

            if (!nodeToConnect)
                return;

            if (target !== nodeToConnect) {
                var relation = new fabric.Relation({
                    source: nodeToConnect,
                    target: target,
                    relation: 'newRelation'
                });
                this.add(relation);
                this.renderAll();
                relation.editRelation();
                nodeToConnect = undefined;
            }
        },

        cancelConnection: function () {
            nodeToConnect = undefined;
            this.off('object:selected', this.terminateConnection);
            this.renderAll();
        },

        save: function () {
            var json = this.toJSON()
              , firstObject = json.objects[0];

            if (firstObject.type === 'grid' || firstObject.type === 'image')
                json.objects.splice(0,1);

            json.model = (this.model) ? this.model.getUuid() : undefined;
            return json;
        },

        renderAll: function () {
            this.callSuper('renderAll');

            if (nodeToConnect) {
                var ctx = this.contextContainer;
                ctx.font = "16px Arial";
                ctx.fillStyle = 'black';
                ctx.textAlign = 'left';
                ctx.fillText('Click on another relative to create a new relationship',20, 20);
                ctx.fillText('(or ESC to cancel)',20, 36);
            }
        },

        load: function (json) {

          var canvas = this
            , model = this.model
            , json = json || {
                objects: [],
                background: "white"
              }
            , cache = {};

          json.renderOnAddRemove = false;
          json.targetFindToleance = 6;
      
          fabric.util.enlivenObjects(json.objects, function (enlivenedObjects) {

            canvas.createGrid();
            for (var i = 0; i < enlivenedObjects.length; i++) {

              enlivenedObjects[i].resolve(cache);

              canvas.add(enlivenedObjects[i]);
            }
            canvas.renderAll();

          }, 'fabric', function reviver(object, enlivenedObject) {

            cache[object.uuid] = enlivenedObject;

            var el = enlivenedObject.getModel();
            if (!el)
                return;

            el = model.find(el);
            enlivenedObject.setModel(el);
          });
        }
      });

})();
