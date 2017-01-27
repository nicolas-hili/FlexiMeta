(function() {
  'use strict';

  fabric.Grid = fabric.util.createClass(fabric.Object, {

    type: 'grid',

    initialize: function(options) {
      options || (options = { });

      this.callSuper('initialize', options);
      this.set('grid', options.grid || 10);
      this.set('stroke', options.stroke || 'silver');
      this.set('evented', false);
      this.set('selectable', false);
      this.set('width', options.width);
      this.set('height', options.height);
      this.set('left', 0);
      this.set('top', -1);
    },

    toObject: function() {
      return fabric.util.object.extend(this.callSuper('toObject'), {
        grid: this.get('grid')
      });
    },
    
    _render: function(ctx, noTransform) {
      var grid = this.grid;
      var width = this.width;
      var height = this.height;

      if (grid) {
      // master grid
      ctx.beginPath();
      ctx.globalAlpha = 0.4;
      
      for (var i = 0; i < height; i+=5*grid) {
        ctx.moveTo(-width/2, i-height/2);
        ctx.lineTo(width/2, i-height/2);
      }
      for (var i = 0; i < width; i+=5*grid) {
        ctx.moveTo(i-width/2, -height/2);
        ctx.lineTo(i-width/2, height/2);
      }
      ctx.stroke();
      ctx.closePath();

      // secondary grid
      ctx.beginPath();
      ctx.globalAlpha = 0.2;
      for (var i = 0; i < height; i+=grid) {
        ctx.moveTo(-width/2, i-height/2);
        ctx.lineTo(width/2, i-height/2);
      }
      for (var i = 0; i < width; i+=grid) {
        ctx.moveTo(i-width/2, -height/2);
        ctx.lineTo(i-width/2, height/2);
      }
      ctx.stroke();
      ctx.closePath();
      }
    },
  });

  fabric.Grid.fromObject = function (object) {
    return new fabric.Grid(object);
  };
  
})();
