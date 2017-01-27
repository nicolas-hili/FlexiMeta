(function () {
    'use strict';

    fleximeta.views.ModelExplorer = function (options) {

        if (fleximeta.views.ModelExplorer.getInstance()) {
            return fleximeta.views.ModelExplorer.getInstance()
        }

        options = options || {};

        var containerElement = options.element
          , li = containerElement.nextElementSibling
          , links = document.createElement('div');

        this.li = li;

        links.className = 'links';

        containerElement.appendChild(links);

        links.innerHTML += "<a href='' style='margin-right:5px;'><span class='glyphicon glyphicon-question-sign'></span></a>";
        links.innerHTML += "<a href='' style='margin-right:5px;'><span class='glyphicon glyphicon-repeat'></span></a>";
        links.innerHTML += "<a href='' style='margin-right:5px;'><span class='glyphicon glyphicon-cog'></span></a>";

        this.jstree = $.jstree.create($(li), {
            "core" : {
              check_callback: true,
            }
        });

        fleximeta.views.ModelExplorer.instance = this;

        if (options.model)
            this.createNode(options.model);

    };

    fleximeta.views.ModelExplorer.prototype.createNode = function (element, parentElement) {
        
        var idParent;

        if (!parentElement)
            idParent = '#';
        else if (typeof parentElement === 'string')
            idParent = parentElement;
        else if (typeof parentElement === 'object' && parentElement.getUuid)
            idParent = parentElement.getUuid();

        if (!idParent)
            return;

        var newNode = this.jstree.create_node(idParent, element.getLabel());

        this.jstree.set_id(newNode, element.getUuid());
        this.jstree.get_node(element.getUuid()).element = element;

        element.addListener('modelExplorer', this);

        // create leaves
        var keys = Object.getOwnPropertyNames(element).filter(function (key) {return element.propertyIsEnumerable(key)
        });
        for (var i = 0; i < keys.length; i++) {
            if (element[keys[i]] instanceof Array)
                this.createArray(element, keys[i]);
            else if (typeof element[keys[i]] === 'object')
                this.createReference(element, keys[i]);
            else
                this.createLeaf(element, keys[i]);
        }

    };

    fleximeta.views.ModelExplorer.prototype.createArray = function (element, key) {
        var idParent = element.getUuid() + '_' + key
          , array = element[key];

        var newNode = this.jstree.create_node(element.getUuid(), key);
        this.jstree.set_id(newNode, element.getUuid() + '_' + key);

        for (var i = 0; i < array.length; i++) {
            this.createNode(array[i], element.getUuid() + '_' + key);
        }
    };

    fleximeta.views.ModelExplorer.prototype.createLeaf = function (element, key) {
        
        if (key === 'uuid' || key === 'label')
            return;
        var newNode = this.jstree.create_node(element.getUuid(), key + ' = ' + element[key]);
        this.jstree.set_id(newNode, element.getUuid() + '_' + key);
        this.jstree.set_icon(element.getUuid() + '_' + key, './img/tag.png');
    };

    fleximeta.views.ModelExplorer.prototype.createReference = function (element, key) {
        
        var newNode = this.jstree.create_node(element.getUuid(), key + ' -> ' + element[key].get('label'));
        this.jstree.set_id(newNode, element.getUuid() + '_' + key);
    };

    fleximeta.views.ModelExplorer.instance = null;

    fleximeta.views.ModelExplorer.getInstance = function () {
        return fleximeta.views.ModelExplorer.instance;
    };

    fleximeta.views.ModelExplorer.prototype.update = function (model, operation, key, values) {
        if (operation === 'PUSH') {
           this.createNode(values[0], model.getUuid()+'_'+key); 
        }
        else if (operation === 'SET') {
            this.updateLabel(model);
            this.updateLeaf(model, key, values);
        }
    };

    fleximeta.views.ModelExplorer.prototype.updateLabel = function (element) {
        this.jstree.set_text(element.getUuid(), element.getLabel());
    };

    fleximeta.views.ModelExplorer.prototype.updateLeaf = function (element, key, value) {
        this.jstree.set_text(element.getUuid() + '_'+ key, key + ' = ' + element.getLabel());
    };

    fleximeta.views.ModelExplorer.prototype.reinitialize = function (newModel) {
        this.jstree.destroy();

        this.jstree = $.jstree.create($(this.li), {
            "core" : {
              check_callback: true,
            }
        });
        this.createNode(newModel);
    };

})();

