(function (global) {
  'use strict';

  fabric.Individual = fabric.util.createClass(fabric.Object, {

      type: 'individual',

      initialize: function (options) {
          options || (options = { });

          this.callSuper('initialize', options);

          this.set({
              minimumWidth: 150,
              minimumHeight: 100,
              fill: 'white',
              stroke: 'black',
              outgoings: options.outgoings || [],
              incomings: options.incomings || []
          });

          
          var attributes = {};
          if (options.attributes) {
              for (var i = 0; i < options.attributes.length; i++) {
                  attributes[options.attributes[i].name] = options.attributes[i].value;
              }
              attributes['label'] = options.label;
          }

          if (!this.model) {
              this.model = new fleximeta.model.Base(attributes);
          }

      },

      getContextMenu: function () {

          this.contextMenu = {
             'rename': {name:'Rename Member', icon: 'edit', callback:'rename'},
             'sep1': '---------',
             'attributes': {
                 name: 'Attributes', 
                 "items": {
                     'addAttribute': {name:'Add New Attribute', icon: 'add', callback:this.addAttribute.bind(this)},
                     'sep2': '---------',
                 }
             },
             'references': {
                 name: 'References', 
                 "items": {
                     'addReference': {name:'Add New Ref', icon: 'add', callback:this.connect.bind(this)},
                     'sep3': '---------',
                 }
             },
             'sep4': '---------',
             'delete': {name:'Delete', icon: 'delete', callback:'deleteIndividual'},
          };

          var attributeItems = this.contextMenu.attributes.items
            , referenceItems = this.contextMenu.references.items
            , model = this.model
            , attributeKeys = this.getEditableAttributeKeys()
            , referenceKeys = Object.getOwnPropertyNames(model).filter(function (key) {
                var value = model[key]
                  , isEnumerable = model.propertyIsEnumerable(key)
                  , isArray = model[key] instanceof Array
                  , isObject = typeof model[key] === 'object'
                  , isArrayOfObject = isArray && value.length && typeof value[0] === 'object'
                return isEnumerable && (isArrayOfObject || isObject)
            });

          for (var i = 0; i < attributeKeys.length; i++) {

              var key = attributeKeys[i];

              attributeItems[key] = {
                  name: key,
                  items: {
                  }
              };
              attributeItems[key].items['edit_name_'+key] = {name: 'Edit Name', icon: 'edit', callback:this.editAttributeNameHandler.bind(this)};
              attributeItems[key].items['edit_value_'+key] = {name: 'Edit Value', icon: 'edit', callback:this.editAttributeValueHandler.bind(this)};
              attributeItems[key].items['sep'] = '---------';
              attributeItems[key].items[key] = {name: 'Delete Attribute', icon: 'delete', callback:this.deleteAttribute.bind(this)};
          }

          if (!attributeKeys.length)
              attributeItems['nothing'] = {name: 'No attribute', disabled: true};


          for (var i = 0; i < referenceKeys.length; i++) {

              var key = referenceKeys[i];

              referenceItems[key] = {
                  name: key,
                  items: {
                  }
              };
              referenceItems[key].items['edit_name_'+key] = {name: 'Edit Name', icon: 'edit', callback:this.editReferenceNameHandler.bind(this)};
              referenceItems[key].items['sep'] = '---------';
              referenceItems[key].items[key] = {name: 'Delete Reference', icon: 'delete', callback:this.deleteReference.bind(this)};
          }

          if (!referenceKeys.length)
              referenceItems['nothing'] = {name: 'No reference', disabled: true};

          return this.contextMenu;
      },

      toObject: function (propertiesToInclude) {

        var incomings = this.incomings.map(function (incoming) {
            return incoming.getUuid();
        });

        var outgoings = this.outgoings.map(function (outgoing) {
            return outgoing.getUuid();
        });

        return fabric.util.object.extend(this.callSuper('toObject', propertiesToInclude), {
            incomings: incomings,
            outgoings: outgoings,
        });
      },

      resolve: function (cache) {

          this.incomings = this.incomings.map(function (incoming) {
            if (typeof incoming === 'string')
                return cache[incoming];
            else
                return incoming;
          });

          this.outgoings = this.outgoings.map(function (outgoing) {
            if (typeof outgoing === 'string')
                return cache[outgoing];
            else
                return outgoing;
          });
      },


      addAttribute: function () {

          var name, value
            , self = this
            , narrator = fleximeta.Narrator.getInstance();

          this.editAttributeName(null, function (e, data) {
              name = data[0].value;

              if (Object.keys(self.model).indexOf(name) !== -1)
                return 'An attribute (or reference) with this name already exists';

              self.editAttributeValue(null, function (e, data) {
                  value = data[0].value;
                  self.model.set(name, value);
              }, function () {
                  self.canvas.renderAll();
              });
          });
      },

      editAttributeNameHandler: function (key) {
          var model = this.model
            , attributeName = key.split('_')[2]
            , value = model[attributeName]
            , narrator = fleximeta.Narrator.getInstance()
            , canvas = this.canvas;

          this.editAttributeName (attributeName,
                  function (e, data) {
                      model.unset(attributeName);
                      model.set(data[0].value, value);
                  },
                  function () {
                      canvas.renderAll();
                  }
          );
      },

      editReferenceNameHandler: function (key) {
          var model = this.model
            , referenceName = key.split('_')[2]
            , value = model[referenceName]
            , self = this
            , canvas = this.canvas;

          this.editAttributeName (referenceName,
                  function (e, data) {
                      model.set(data[0].value, value);
                      self.outgoings.filter(function (outgoing) {
                          return outgoing.relation === referenceName;
                      }).forEach(function (outgoing) {
                          outgoing.relation = data[0].value;
                      });
                      model.unset(referenceName);
                  },
                  function () {
                      canvas.renderAll();
                  },
                  true
          );
      },

      editAttributeValueHandler: function (key) {
          var model = this.model
            , attributeName = key.split('_')[2]
            , value = model[attributeName]
            , narrator = fleximeta.Narrator.getInstance()
            , canvas = this.canvas;

          this.editAttributeValue (attributeName,
                  function (e, data) {
                      model.set(attributeName, data[0].value);
                      canvas.renderAll();
                      narrator.hide();
                      return true;
                  },
                  function () {
                      canvas.renderAll();
                  }
          );
      },

      editAttributeName: function (attributeName, onSubmit, onFinished, isReference) {

          var ref = (isReference) ? 'reference' : 'attribute'
            , name = (attributeName) ? 'Rename' : 'Set name'
            , label = 'Name of the '+ref+':'
            , narrator = fleximeta.Narrator.getInstance()
            , hideOnFinish = (attributeName) ? 'yes' : 'no'
            , value = attributeName || '';

          narrator.createPromptModal({
              name: name,
              label: label,
              defaultValue: value,
              hideOnFinish: hideOnFinish,
              placeholder: ref,
              onSubmit: onSubmit,
              onFinished: onFinished
          });
      },

      editAttributeValue: function (attributeName, onSubmit, onFinished) {

          var name = 'Set value'
            , label = 'Value of the attribute:'
            , narrator = fleximeta.Narrator.getInstance()
            , value = (attributeName) ? this.model[attributeName]: '';

          narrator.createPromptModal({
              name: name,
              label: label,
              defaultValue: value,
              hideOnFinish: 'yes',
              placeholder: 'attribute',
              onSubmit: onSubmit,
              onFinished: onFinished
          });
      },

      deleteAttribute: function (key) {
          
          var canvas = this.canvas
            , narrator = fleximeta.Narrator.getInstance()
            , model = this.model;

          narrator.createValidationModal({
              name: 'Delete attribute',
              label: 'Are you sure you want to delete the \''+key+'\' attribute ?',
              onResult: function (result) {
                if (result) {
                    model.unset(key);
                    canvas.renderAll();
                }
              }
          });
      },

      deleteIndividual: function () {

          var self = this
            , narrator = fleximeta.Narrator.getInstance();

          narrator.createValidationModal({
              name: 'Remove Individual',
              label: 'Are you sure you want to delete this family member ?',
              onResult: function (result) {
                if (result) {
                    self.deleteNode();
                }
              },
              onFinished: function () {
                  self.canvas.renderAll();
              }
          });
      },

      deleteReference: function (key) {

          var canvas = this.canvas
            , outgoings = this.outgoings
            , narrator = fleximeta.Narrator.getInstance()
            , model = this.model;

          narrator.createValidationModal({
              name: 'Delete reference',
              label: 'Are you sure you want to delete the \''+key+'\' reference ?',
              onResult: function (result) {
                if (result) {
                    model.unset(key);
                    var references = outgoings.filter(function (outgoing) {
                        return outgoing.relation === key;
                    }).forEach(function (ref) {
                        ref.deleteEdge();
                    });
                    
                    canvas.renderAll();
                }
              }
          });
      },

      connect: function () {
          this.canvas.initiateConnection(this);
      },
      
      rename: function () {

          var model = this.model
            , narrator = fleximeta.Narrator.getInstance()
            , self = this;

          narrator.createPromptModal({
              name: 'Rename',
              label: 'New name of the member:',
              defaultValue: model.get('firstName'),
              placeholder: 'firstname',
              onSubmit: function (e, data) {
                  model.set('firstname', data[0].value);
                  model.set('label', data[0].value);
              },
              onFinished: function () {
                  narrator.hide();
                  self.canvas.renderAll();
              },
          });
      },

      _render: function (ctx, noTransform) {
          fabric.Rect.prototype._render.call(this, ctx, noTransform);
          ctx.save();
          this._renderName (ctx);
          this._renderSeparator (ctx);
          this._renderAttributes (ctx);
          ctx.restore();
      },

      _renderName: function(ctx) {
          ctx.font = "20px Arial";
          ctx.fillStyle = 'black';
          ctx.textAlign = 'center';

          var name = this.fittingString(ctx, this.model.getLabel(), this.width-8);

          ctx.fillText(name,0,-this.height/2+20);
      },

      _renderSeparator: function(ctx) {
          ctx.beginPath();
          ctx.moveTo(-this.width/2, -this.height/2+30);
          ctx.lineTo(this.width/2, -this.height/2+30);
          ctx.stroke();
      },

      getEditableAttributeKeys: function () {

          var model = this.model;

          return Object.getOwnPropertyNames(model).filter(function (key) {
              var value = model[key]
                , isEnumerable = model.propertyIsEnumerable(key)
                , isArray = model[key] instanceof Array
                , isUuid = (key === 'uuid')
                , isLabel = (key === 'label')
                , isObject = typeof model[key] === 'object'
                , isArrayOfObject = isArray && value.length && typeof value[0] === 'object'
              return isEnumerable && !isArrayOfObject && !isObject && !isUuid && !isLabel && value != undefined;
          });
      },

      _renderAttributes: function(ctx) {
          ctx.font = "16px Arial";
          ctx.fillStyle = 'black';
          ctx.textAlign = 'left';

          var model = this.model
            , keys = this.getEditableAttributeKeys();

          for (var i = 0; i < keys.length; i++) {
              var height = -this.height/2+20+20*(i+1) + 10
               ,  overflowHeight = i < keys.length && (20+20*(i+2) + 10) > this.height;

              if (overflowHeight) {
                  ctx.fillText('…',-this.width/2+24,-this.height/2+20+20*(i+1) + 10);
                  break;
              }

              var attribute = this.model[keys[i]]
                , text = this.fittingString(ctx, keys[i] + ' = ' + attribute, this.width-28);

              ctx.fillText(text,-this.width/2+24,-this.height/2+20+20*(i+1) + 10);
          }
      },

      fittingString: function (ctx, str, maxWidth) {
          var width = ctx.measureText(str).width;
          var ellipsis = '…';
          var ellipsisWidth = ctx.measureText(ellipsis).width;
          if (width<=maxWidth || width<=ellipsisWidth) {
              return str;
          } else {
              var len = str.length;
              while (width>=maxWidth-ellipsisWidth && len-->0) {
                  str = str.substring(0, len);
                  width = ctx.measureText(str).width;
              }
              return str+ellipsis;
          }
      },

      getAnchor: function (angle) {
      
          var a1 = Math.atan(this.height/this.width)
            , a2 = Math.PI - a1
            , a3 = Math.PI + a1
            , a4 = 2*Math.PI - a1

          if (angle <= a1 || angle >= a4) {
            var x = this.left + this.width
              , y = this.top + this.height/2*(1+Math.sin(angle));
          }

          else if (angle > a1 && angle <= a2) {
            var x = this.left + this.width/2*(1+Math.cos(angle))
              , y = this.top + this.height;
          }

          else if (angle > a2 && angle <= a3)
            var x = this.left
              , y = this.top + this.height/2 +this.height/2*Math.sin(angle);

          else if (angle > a3 && angle < a4) {
            var x = this.left + this.width/2*(1+Math.cos(angle))
              , y = this.top;
          }
                
          return {x: x, y: y};
      },

      getAnchorPosition: function (angle) {
      
          var a1 = Math.atan(this.height/this.width)
            , a2 = Math.PI - a1
            , a3 = a1+Math.PI
            , a4 = a2+Math.PI;

          if (angle <= a1 || angle >= a4)
              return 'right';

          else if (angle > a1 && angle <= a2)
              return 'bottom';

          else if (angle > a2 && angle <= a3)
              return 'left';

          else if (angle > a3 && angle < a4)
              return 'top';
      },

      deleteNode: function () {
          for (var i = 0; i < this.incomings.length; i++)
              this.incomings[i].deleteEdge();
          for (var i = 0; i < this.outgoings.length; i++)
              this.outgoings[i].deleteEdge();
          if (this.model) {
              var members = this.canvas.model.get('members')
                , index = members.indexOf(this.model);

              if(index !== -1)
                  members.splice(index, 1);
          }
          this.canvas.remove(this);
      },

      addIncomingEdge: function (edge) {
          var index = this.incomings.indexOf(edge);

          if (index === -1)
              this.incomings.push(edge);
      },

      addOutgoingEdge: function (edge) {
          var index = this.outgoings.indexOf(edge);

          if (index === -1)
              this.outgoings.push(edge);
      },

      removeIncomingEdge: function (edge) {
          var index = this.icomings.indexOf(edge);

          if (index !== -1)
              this.icomings.splice(index, 1);
      },

      removeOutgoingEdge: function (edge) {
          var index = this.outgoings.indexOf(edge);

          if (index !== -1)
              this.outgoing.splice(index, 1);
      }
  });

  fabric.Individual.fromObject = function (object) {
    return new fabric.Individual(object);
  };


})();
