(function () {
    'use strict';

    fleximeta.Demo = function () {

       this.user = undefined;
       this.diagram = undefined;
       this.phase = 0;
       this.firstConnexion = false;
       this.model = undefined;
       this.views = {};
    }

    fleximeta.Demo.prototype.initialize = function () {
        this.initializeNarrator();
        this.initializeData();
    };

    fleximeta.Demo.prototype.getCanvas = function () {
        return this.canvas;
    };

    fleximeta.Demo.prototype.reinitialize = function (phase) {

        this.phase = phase;
        
        // save canvas
        var diagram = this.canvas.save();

        // save model
        var json = fleximeta.Serializer.serialize(this.model);

        // empty cache
        fleximeta.model.Base.emptyCache();

        var newModel = fleximeta.Serializer.deserialize(JSON.parse(json), {
            baseClass: fleximeta.model.Family
        });

        // replace model and phase in all views
        for (var i in this.views) {
            this.views[i].model = newModel;
            this.views[i].phase = phase;
        }

        // remove the tree in the model explorer
        this.views['modelExplorer'].reinitialize(newModel);
        this.views['validation'].reinitialize();
        this.views['xmlExporter'].reinitialize();
        $('#metamodelContent .thumbnail').removeClass('hide');

        // empty canvas
        this.canvas.clear();

        // fill the canvas with the good model
        this.canvas.model = newModel;

        // delete model and recreate it
        delete this.model;
        this.model = newModel;

        // reinitialize canvas
        this.canvas.load(this.diagram);


    };

    fleximeta.Demo.prototype.initializeViews = function () {

        var jsonExporter = new fleximeta.views.JsonExporter({
            element: document.getElementById('jsonExporter'),
            phase: this.phase,
            model: this.model
        });

        var xmlExporter = new fleximeta.views.XmlExporter({
            element: document.getElementById('xmlExporter'),
            phase: this.phase,
            model: this.model
        });

        var chart = new fleximeta.views.Chart({
            element: document.getElementById('phase'),
            phase: this.phase,
            demo: this
        });

        var modelExplorer = new fleximeta.views.ModelExplorer({
            element: document.getElementById('modelExplorer'),
            phase: this.phase,
            model: this.model
        });

        var validation = new fleximeta.views.Validation({
            element: document.getElementById('validation'),
            phase: this.phase,
            model: this.model
        });

        this.views = {
            'jsonExporter': jsonExporter,
            'xmlExporter': xmlExporter,
            'chart': chart,
            'modelExplorer': modelExplorer,
            'validation': validation
        };

        if (this.phase > 0)
            $('#metamodelContent .thumbnail').removeClass('hide');
    };

    fleximeta.Demo.prototype.initializeNarrator = function () {
        this.narrator = fleximeta.Narrator.getInstance();
        this.narrator.init();
    };

    fleximeta.Demo.prototype.initializeData = function () {

        var self = this;

        $.ajax({
            url: "/ajax/user/get",
            type: 'GET',
            dataType: 'json',
            success: function(result) {
                self.user = result.user;
                self.diagram = result.diagram;
                self.phase = result.phase;

                self.firstConnexion = result.firstConnexion;
                self.initializeModel(result.model);

            }
        });
    };

    fleximeta.Demo.prototype.initializeScenario = function () {

        var self = this;

     //   this.narrator.showPresentationScenario(true, function () {
     //       console.log('test');
     //   });
    };

    fleximeta.Demo.prototype.initializeModel = function (object) {
        var self = this;
        if (this.phase > 0) {
            $.ajax({
                  url: 'ajax/user/getScript',
                  dataType: "script",
                  success: function (script) {
                      self.deserializeModel(object);
                  }
            });
        }
        else
            this.deserializeModel(object);
    };

    fleximeta.Demo.prototype.deserializeModel = function (object) {
        var baseClass = fleximeta.model.Family || fleximeta.model.Base;
        this.model = fleximeta.Serializer.deserialize(object, {
            baseClass: baseClass
        });
        this.initializeEditor();
        this.initializeViews();

        if (this.firstConnexion)
                fleximeta.Narrator.getInstance().showPresentationScenario(true);
    };

    fleximeta.Demo.prototype.initializeEditor = function () {

        var editor = document.getElementById('editor')
          , model = this.model;

        this.canvas = new fleximeta.editor.Canvas('editor', {
            width: editor.offsetWidth,
            height: editor.offsetHeight,
            renderOnAddRemove: false,
            backgroundColor: 'white',
            model: this.model
        });

        this.canvas.load(this.diagram);
    };

    fleximeta.Demo.prototype.repeat = function () {

        var self = this
          , narrator = fleximeta.Narrator.getInstance();

        narrator.createValidationModal({
            name: 'Reset your model ?',
            label: 'Are you sure you want to reset and restart from the beginning ? (Undo is not possible)',
            onResult: function (result) {
            },
            onFinished: function (result) {
                if (result) {
                    $.ajax({
                          url: 'ajax/user/destroySession',
                          success: function () {
                              window.location = "./demo-models2016";
                          }
                    });
                }
            }
        });

    };

    fleximeta.Demo.prototype.save = function () {

        var saving = $('#saving');
        saving.hide();
        saving.html('saving...');
        saving.fadeIn();


        var diagram = this.canvas.save()
          , model = fleximeta.Serializer.serialize(this.model);

        var data = {
            model:   model,
            diagram: JSON.stringify(diagram)
        };

        $.ajax({
            url: "/ajax/user/update",
            type: 'POST',
            data: data,
            dataType: 'json',
            success: function(result) {
                saving.html('saved');
                saving.fadeIn('slow', function () {
                    saving.fadeOut('slow');
                });
            }
        });
    };

})();
