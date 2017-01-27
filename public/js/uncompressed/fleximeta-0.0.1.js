var fleximeta = fleximeta || {version: '0.1.0'};

fleximeta.editor = fleximeta.editor || {};
fleximeta.model = fleximeta.editor || {};
fleximeta.views = fleximeta.views || {};
fleximeta.prettify = fleximeta.prettify || {};
;var model = this.model
  , cache = [];

fleximeta.prettify.json = {
   replacer: function(match, pIndent, pKey, pVal, pEnd) {
      var key = '<span class=json-key>';
      var val = '<span class=json-value>';
      var str = '<span class=json-string>';
      var r = pIndent || '';
      if (pKey)
         r = r + key + pKey.replace(/[": ]/g, '') + '</span>: ';
      if (pVal)
         r = r + (pVal[0] == '"' ? str : val) + pVal + '</span>';
      return r + (pEnd || '');
      },
   prettyPrint: function(json) {
      var jsonLine = /^( *)("[\w]+": )?("[^"]*"|[\w.+-]*)?([,[{])?$/mg;

      return json.replace(/&/g, '&amp;').replace(/\\"/g, '&quot;')
         .replace(/</g, '&lt;').replace(/>/g, '&gt;')
         .replace(jsonLine, fleximeta.prettify.json.replacer);
    }
};

fleximeta.prettify.xml = {
   replacer: function(match, pIndent, pKey, pVal, pEnd) {
      var key = '<span class=json-key>';
      var val = '<span class=json-value>';
      var str = '<span class=json-string>';
      var r = pIndent || '';
      if (pKey)
         r = r + key + pKey.replace(/[": ]/g, '') + '</span>: ';
      if (pVal)
         r = r + (pVal[0] == '"' ? str : val) + pVal + '</span>';
      return r + (pEnd || '');
      },
   prettyPrint: function (obj) {
        return vkbeautify.xml(obj)
         .replace(/&/g, '&amp;').replace(/\\"/g, '&quot;')
         .replace(/</g, '&lt;').replace(/>/g, '&gt;');
   //     obj = formatXml(obj)
   //     return obj;
    }
};
;(function () {
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

;(function () {
    'use strict';

    fleximeta.views.JsonExporter = function (options) {

        options = options || {};

        var containerElement = options.element
          , preElement = document.createElement('pre')
          , codeElement = document.createElement('code');

        this.model = options.model;
        this.phase = options.phase;

        preElement.innerHTML = "<a href=''><span style='float:right'class='glyphicon glyphicon-cog'></span></a>";
        preElement.innerHTML += "<a href=''><span style='float:right'class='glyphicon glyphicon-repeat'></span></a>";
        preElement.innerHTML += "<a href=''><span style='float:right'class='glyphicon glyphicon-question-sign'></span></a>";
        preElement.innerHTML += "<strong>JSON Output:</strong><br /><span id='jsonSize'></span><br /><br />";
        preElement.appendChild(codeElement);
        containerElement.appendChild(preElement);

        this.codeElement = codeElement;
        this.preElement = preElement;

        this.setTimer(5000);

    };

    fleximeta.views.JsonExporter.prototype.setTimer = function (timer) {

        if (this.timerId)
            this.timerId.clearInterval(this.timerId);

        this.refresh();
        this.timerId = setInterval(this.refresh.bind(this), timer);
    };

    fleximeta.views.JsonExporter.prototype.refresh = function () {
        this.codeElement.innerHTML = fleximeta.Serializer.serialize(this.model, {
            indent: 3,
            prettify: true,
            removeLabel: true
        });


        var xmlSizeSpan = document.getElementById('xmlSize');

        if (this.phase === 2) {

            var jsonSize = fleximeta.Serializer.serialize(this.model, {
                removeLabel: true
            }).length;

            document.getElementById('jsonSize').innerHTML = "Size (compressed): "+ jsonSize+" characters";
           
            if (xmlSizeSpan && xmlSizeSpan.innerHTML) {
                var xmlSize = parseInt(xmlSizeSpan.innerHTML.split(' ')[2]);

                var ratio = Math.abs(1-jsonSize/xmlSize)*100;
                var label = (jsonSize/xmlSize < 1) ? '<' : '>';
                document.getElementById('jsonSize').innerHTML += " ("+label+" "+Math.round(ratio*10)/10+"% compared to XML)";
            }
        }
    };

})();
;(function () {
    'use strict';

    fleximeta.views.XmlExporter = function (options) {

        options = options || {};

        this.element = options.element;

        var containerElement = options.element
          , preElement = document.createElement('pre')
          , codeElement = document.createElement('code');

        codeElement.id = 'xmlCode';

        this.model = options.model;
        this.phase = options.phase || 0;

        preElement.innerHTML = "<a href=''><span style='float:right'class='glyphicon glyphicon-cog'></span></a>";
        preElement.innerHTML += "<a href=''><span style='float:right'class='glyphicon glyphicon-repeat'></span></a>";
        preElement.innerHTML += "<a href=''><span style='float:right'class='glyphicon glyphicon-question-sign'></span></a>";
        preElement.innerHTML += "<strong>XML Output:</strong><br /><span id='xmlSize'></span><br /><br />";
        preElement.appendChild(codeElement);
        containerElement.appendChild(preElement);

        this.preElement = preElement;
        this.codeElement = codeElement;


        if (this.phase === 0)
            this.codeElement.innerHTML = "XML Export is not available during the <mark>Exploratory</mark> phase";
        else
            this.reinitialize();
    };

    fleximeta.views.XmlExporter.prototype.refresh = function () {
        
        var xml;

        if (!this.model.toXML)
            return;

        xml = this.model.toXML();
        document.getElementById('xmlSize').innerHTML = "Size (compressed): "+ xml.length+" characters";
        this.codeElement.innerHTML = fleximeta.prettify.xml.prettyPrint(xml);
    };

    fleximeta.views.XmlExporter.prototype.setTimer = function (timer) {

        this.timer = timer;

        this.cancelTimer();
        this.startTimer(timer);

    };

    fleximeta.views.XmlExporter.prototype.cancelTimer = function () {
        if (this.timerId)
            window.clearInterval(this.timer);
    };

    fleximeta.views.XmlExporter.prototype.startTimer = function (timer) {
        this.timerId = setInterval(this.refresh.bind(this), timer);
    };

    fleximeta.views.XmlExporter.prototype.reinitialize = function () {
        this.cancelTimer();
        this.startTimer(2000);
    };

})();

;(function () {
    'use strict';

    var phases = ["Exploratory", "Consolidation", "Finalization"]
      , axes   = ["Validity", "Flexibility", "Platform independence", "Scalability", "Interoperability"]
      , currentPhase = 0;

    var phase = [
        {
            "Validity": {
                label: "No validation is possible at this level.",
                mark: 1
             },
            "Flexibility": {
                label: "JavaScript objects inherit from the Base JavaScript meta-object. Therefore, they can access to the generic getter and setter defined by its prototype. No limitation to create new attributes and object references.",
                mark: 3
             },
            "Platform independence": {
                label: "FlexiMeta is fully independent of any platform.",
                mark: 3
             },
            "Scalability": {
                label: "FlexiMeta relies on the JSON data serialization format to serialize models. JSON owns a lightweight notation that makes it reliable for addressing the scalability challenge. Several papers already prove the gain whem serializing models into JSON instead of XML. For the Simpson Family, FlexiMeta is able to save up to 40% of the size of a model using JSON.",
                mark: 2
             },
            "Interoperability": {
                label: "Interoperability is ensured by the use of the standardized JSON format. However, it is not possible to use import / export functions in a specific meta-model definition.",
                mark: 1
             },
        },
        {
            "Validity": {
                label: "Partial validation is possible at this level.",
                mark: 2
             },
            "Flexibility": {
                label: "JavaScript objects inherit from the newly created meta-objects. They can access to the specific getters and setters defined by their prototypes. However, it is still possible to access generic functions from the Base Javascript meta-object.",
                mark: 2
             },
            "Platform independence": {
                label: "",
                mark: 3
             },
            "Scalability": {
                label: "",
                mark: 2
             },
            "Interoperability": {
                label: "Import / export functions can be generated from a specific metamodel.",
                mark: 1
             },
        },
        {
            "Validity": {
                label: "Full and obtrusive validation is possible at this level.",
                mark: 3
             },
            "Flexibility": {
                label: "JavaScript objects inherit from the newly created meta-objects. They can access to the specific getters and setters defined by their prototypes. It is no longer possible to access generic functions from the \textit{Base} Javascript meta-object.",
                mark: 1
             },
            "Platform independence": {
                label: "",
                mark: 3
             },
            "Scalability": {
                label: "",
                mark: 2
             },
            "Interoperability": {
                label: "Import / export functions can be generated from a specific metamodel.",
                mark: 1
             },
        },
    ];

    fleximeta.views.Chart = function (options) {

        options = options || {};
        currentPhase = options.phase;

        phase[2]["Scalability"] = phase[1]["Scalability"] = phase[0]["Scalability"];
        phase[2]["Platform independence"] = phase[1]["Platform independence"] = phase[0]["Platform independence"];

        var containerElement = options.element
          , li = containerElement.nextElementSibling
          , self = this
          , links = document.createElement('div')
          , canvas = document.createElement('canvas');

        this.nextPhaseButton = document.createElement('button');
        this.currentPhaseDiv = document.createElement('div');
        this.demo = options.demo;

        currentPhase = options.phase || 0;

        links.className = 'links';

        containerElement.appendChild(links);

        this.currentPhaseDiv.innerHTML = 'Current phase: <strong>'+phases[currentPhase]+'</strong>'; 
            if (currentPhase < 2)
                this.nextPhaseButton.innerHTML = '<span class="glyphicon glyphicon-fast-forward" aria-hidden="true"></span> <strong>'+phases[currentPhase+1]+'</strong> phase';
            else {
                this.nextPhaseButton.innerHTML = '<span class="glyphicon glyphicon-fast-forward" aria-hidden="true"></span> <strong>'+phases[currentPhase] +'</strong> phase reached';
                this.nextPhaseButton.setAttribute("disabled", "disabled");
                $(this.nextPhaseButton).unbind();
            }
        this.nextPhaseButton.className = 'btn btn-primary btn-s';
        this.currentPhaseDiv.style.textAlign = "center";
        this.nextPhaseButton.style.display = "block";
        this.nextPhaseButton.style.margin = "auto";

        li.appendChild(canvas);
        li.appendChild(this.currentPhaseDiv);
        li.appendChild(this.nextPhaseButton);

        this.nextPhaseButton.addEventListener('mouseup', function (e) {
            e.preventDefault();
            var narrator = fleximeta.Narrator.getInstance();
            narrator.createValidationModal({
                name: 'Moving to the ' + phases[currentPhase+1]+ ' phase ?',
                label: 'You are currently at the <mark>' + phases[currentPhase] + '</mark> phase. Are you sure you want to move to the <mark>' + phases[currentPhase+1]+ '</mark> phase ? (Undo is not possible)',
                onResult: function (result) {
                },
                onFinished: function (result) {
                    if (result)
                        self.increasePhase();
                }
            });
        });



        links.innerHTML += "<a href='' style='margin-right:5px;'><span class='glyphicon glyphicon-question-sign'></span></a>";
        links.innerHTML += "<a href='' style='margin-right:5px;'><span class='glyphicon glyphicon-repeat'></span></a>";
        links.innerHTML += "<a href='' style='margin-right:5px;'><span class='glyphicon glyphicon-cog'></span></a>";

        var radarChartData = {
            labels: axes,
            datasets: [
                {
                    label: phases[currentPhase] + ' phase',
                    fillColor: "rgba(151,187,205,0.2)",
                    strokeColor: "rgba(151,187,205,1)",
                    pointColor: "rgba(151,187,205,1)",
                    pointStrokeColor: "#fff",
                    pointHighlightFill: "#fff",
                    pointHighlightStroke: "rgba(151,187,205,1)",
                    data: axes.map(function (axis) {
                        return phase[currentPhase][axis].mark
                    })
                }
            ]
        };
        this.chart = new Chart(canvas.getContext("2d")).Radar(radarChartData, {
            responsive: true,
            customTooltips: function (tooltip) {
                // Tooltip Element
                var tooltipEl = $('#chartjs-tooltip');

                // Hide if no tooltip
                if (!tooltip) {
                    tooltipEl.css({
                        opacity: 0
                    });
                    return;
                }

                var axis = tooltip.text.split(':')[0];
                tooltip.text = '<strong>' + axis + ':</strong> ' + phase[currentPhase][axis].label;

                tooltip.yAlign = 'middle';
                tooltip.xAlign = 'left';

                // Set caret Position
                tooltipEl.removeClass('above below');
                tooltipEl.addClass(tooltip.xAlign);

                // Set Text
                tooltipEl.html(tooltip.text);

                // Find Y Location on page
                var top = tooltip.y - tooltipEl.height()/2 - 5 - tooltip.caretPadding
                  , left = tooltip.x - 100 - 12 - tooltip.caretPadding;

                // Display, position, and set styles for font
                tooltipEl.css({
                    opacity: 1,
                    left: tooltip.chart.canvas.parentNode.parentNode.parentNode.offsetLeft + tooltip.chart.canvas.offsetLeft + left + 'px',
                    top: + tooltip.chart.canvas.parentNode.offsetTop + tooltip.chart.canvas.offsetTop + top + 50 + 'px',
                    fontFamily: tooltip.fontFamily,
                    fontSize: tooltip.fontSize,
                    fontStyle: tooltip.fontStyle,
                });
            }
        });

        fleximeta.views.Chart.prototype.increasePhase = function () {

            var self = this
              , narrator = fleximeta.Narrator.getInstance();

            if (currentPhase > 1)
                return;
            currentPhase++;

            this.currentPhaseDiv.innerHTML = 'Current phase: <strong>'+phases[currentPhase]+'</strong>'; 
            if (currentPhase < 2)
                this.nextPhaseButton.innerHTML = '<span class="glyphicon glyphicon-fast-forward" aria-hidden="true"></span> <strong>'+phases[currentPhase+1]+'</strong> phase';
            else {
                this.nextPhaseButton.setAttribute("disabled", "disabled");
                $(this.nextPhaseButton).unbind();
            }

            this.chart.datasets[0].label = phases[currentPhase] + ' phase';
            var points = this.chart.datasets[0].points;
            for (var i = 0; i < axes.length; i++) {
                points[i].value = phase[currentPhase][axes[i]].mark;
            }
            this.chart.update();

            $.ajax({
                  url: 'ajax/user/increase',
                  dataType: "script",
                  success: function (script) {
                    setTimeout(function () {
                    if (currentPhase === 1) {
                        narrator.changeNarrator('Lisa');
                        narrator.showConsolidationPhase();
                    }
                    else if (currentPhase === 2) {
                        narrator.changeNarrator('Marge');
                        narrator.showFinalizationPhase();
                    }

                    self.demo.reinitialize(currentPhase);
                    }, 1000);
                  }
            });
        };
    };

})();

;(function () {
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

;(function () {
    'use strict';

    fleximeta.views.Validation = function (options) {

        options = options || {};

        var containerElement = options.element
          , li = containerElement.nextElementSibling
          , self = this
          , links = document.createElement('div');

        links.className = 'links';
        containerElement.appendChild(links);

        links.innerHTML += "<a href='' style='margin-right:5px;'><span class='glyphicon glyphicon-question-sign'></span></a>";
        links.innerHTML += "<a href='' style='margin-right:5px;'><span class='glyphicon glyphicon-repeat'></span></a>";
        links.innerHTML += "<a href='' style='margin-right:5px;'><span class='glyphicon glyphicon-cog'></span></a>";

        this.li = li;
        this.model = options.model;
        this.phase = options.phase;
        this.errors = []
        this.timer = 5000;
        this.setTimer(5000);

    };

    fleximeta.views.Validation.prototype.setTimer = function (timer) {

        this.timer = timer;

        this.cancelTimer();
        this.startTimer();

    };

    fleximeta.views.Validation.prototype.cancelTimer = function () {
        if (this.timerId)
            window.clearInterval(this.timer);
    };

    fleximeta.views.Validation.prototype.startTimer = function () {
        this.timerId = setInterval(this.refresh.bind(this), this.timer);
    };


    fleximeta.views.Validation.prototype.refresh = function () {
        var errors = this.model.validate();

        if (!errors.length)
            this.appearNoErrorMessage();
        else
            this.removeNoErrorMessage();

        this.addAlerts(errors);
        this.removeAlerts(errors);
    };

    fleximeta.views.Validation.prototype.addAlerts = function (errors) {
        for (var i = 0; i < errors.length; i++) {
            var error = errors[i]
              , id = error.element.uuid + '-' + error.id
              , label = error.label
              , index = this.errors.indexOf(id);

            if (index !== -1)
                return;

            this.errors.push(id);
            var type = (this.phase < 2) ? 'warning' : 'danger';
            this.appearMessage(id, type, label);
        }
    };

    fleximeta.views.Validation.prototype.reinitialize = function () {
        this.cancelTimer();
        for (var i = 0; i < this.errors.length; i++)
            this.removeMessage(this.errors[i]);
        this.errors = [];
        this.startTimer();
    };

    fleximeta.views.Validation.prototype.removeAlerts = function (errors) {

        var errorId = errors.map(function (error) {
            return error.element.uuid + '-' + error.id;
        });

        var max = this.errors.length -1

        for (var i = max; i >= 0; i--) {
            var id = this.errors[i]
              , index = errorId.indexOf(id);

            if (index !== -1)
                continue;

            this.errors.splice(i, 1);
            this.removeMessage(id);
        }
    };

    fleximeta.views.Validation.prototype.appearNoErrorMessage = function () {

        var alertMessage = document.getElementById('noErrorFound');

        if (alertMessage)
            return;

        this.appearMessage('noErrorFound', 'info', 'No error found');
    };

    fleximeta.views.Validation.prototype.removeNoErrorMessage = function () {
        var alertMessage = document.getElementById('noErrorFound');

        if (!alertMessage)
            return;

        this.removeMessage('noErrorFound');
    };

    fleximeta.views.Validation.prototype.removeMessage = function (id) {

        var alertMessage = document.getElementById(id);

        $(alertMessage).fadeOut('fast', function () {
            $(this).remove();
        });

    };

    fleximeta.views.Validation.prototype.appearMessage = function (id, type, message) {
        var alertMessage = document.createElement('div');
        alertMessage.className = "alert alert-" + type;
        alertMessage.id = id;
        alertMessage.innerHTML = message;
        this.li.appendChild(alertMessage);
        $(alertMessage).hide().fadeIn('fast');
    };

})();
;(function () {
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
;(function () {
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
;(function(global) {
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
;(function() {
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
;(function () {
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
;(function (global) {
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
;(function () {
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
;(function () {
    'use strict';

    var inPlay = undefined
      , narrator
      , fadeInToDisappear
      , callback
      , i = 0;

    fleximeta.Narrator = function () {
    };

    fleximeta.Narrator.prototype.showScenarios =function () {
    };

    fleximeta.Narrator.prototype.showPrivacy = function (fadeIn, onFinished) {
        this.fadeIn();

        inPlay = [
            "To respect the privacy of the review, an <mark>anonymous session</mark> is created and an <mark>anonymous ID</mark> is generated during your first visit. This session is only used to save and restore the model you created, and we do not store any information from you or your browser.",
            "We do not <mark>collect</mark> nor <mark>analyse</mark> your IP, or your <mark>browser's user-agent</mark>. This website was tested on Firefox and Chrome only. Please use one of these two browsers to prevent yourself from experimenting any trouble.",
            "At the end of your session, you can use the Restart button (<span class='glyphicon glyphicon-repeat' aria-hidden='true'></span>) on the topbar to delete the model you created from the database.",
        ];

        callback = onFinished;
        fadeInToDisappear = fadeIn;

        i = 0;

        this.wrapper.click();
    };

    fleximeta.Narrator.prototype.showConsolidationPhase = function (fadeIn, onFinished) {
        this.fadeIn();

        inPlay = [
            "<img src='img/metamodel.png' style='width:100%;'/><br />During the <mark>consolidation</mark> phase, the <mark>metamodel</mark> has been defined.<br />This phase ensures that your model satisfies the rules of the metamodel. During this phase, you can migrate the created model to correct <mark>conformance violation errors</mark>.",
            "To help you, a <mark>validation view</mark> on the bottom left corner gives you the list of model conformance errors. You can therefore correct these problems directly into the model.",
            "Moreover, during this phase, the metamodel is known. That means that you can <mark>export</mark> the created model using the <mark>XML Exporter</mark> view below the editor area. This view is refreshed automatically. This is an example of how <mark>interoperability</mark> is addressed during the <mark>consolidation</mark> phase.",
            "The consolidation phase is intended to remain until both the model is corrected and the metamodel is stable. Once you finish to correct the conformance errors, you can go to the <mark>finalization</mark> phase.",
        ];

        callback = onFinished;
        fadeInToDisappear = fadeIn;

        i = 0;

        this.wrapper.click();
    };

    fleximeta.Narrator.prototype.showFinalizationPhase = function (fadeIn, onFinished) {
        this.fadeIn();

        inPlay = [
            "During the <mark>finalization</mark> phase, the <mark>metamodel</mark> is totally stable and the created models should conform with it.<br />This phase is the ``<mark>production</mark>'' phase. Models can be created using the metamodel defintion. Unexpected attributes and references are deleted from the model, as you can see in the <mark>JSON exporter</mark> view below the editor.",
            "Moreover, you can now <mark>compare</mark> the size of the model serialized in <mark>JSON</mark> and <mark>XML</mark>. It shows you how FlexiMeta addresses the <mark>scalability</mark> challenge.",
            "During the <mark>finalization</mark> phase, it is no longer possible to create unexpected attributes or references. For example, you can no longer create new attributes that have not been defined in the metamodel. This addresses the validition challenge but reduces flexilibity and creativity that were essential at the begining of the modeling.",
        ];

        callback = onFinished;
        fadeInToDisappear = fadeIn;

        i = 0;

        this.wrapper.click();
    };


    fleximeta.Narrator.prototype.showPresentationScenario = function (fadeIn, onFinished) {
       
        this.fadeIn();

        inPlay = [
            "Hi!<br />I am Bart Simpson. I am here to guide you through this tutorial.<br />In this tutorial, we will learn how to use FlexiMeta.<br /><br />This website is a prilimenary sketch to discover FlexiMeta. It may have bugs and some features have not been implemented yet.<br /><br />This website was tested on Firefox and Chrome only. Please use one of these two browsers to prevent yourself from experimenting any trouble.",
            "As a reminder, FlexiMeta allows you to create models in three different phases: <mark>Exploratory</mark>, <mark>Consolidation</mark>, and <mark>Finalization</mark>. For the moment, you are in the <mark>Exploratory Phase</mark>. That means you can create models without relying on metamodels. This promotes flexibility over strict model conformance.",
            "The screen is composed of several areas.",
            "The main area is a <mark>graphical editor</mark> to edit the model. Editing is done using using the contextual menu accessible from the right-click button.",
            "On the left and right sides, you have several menus.",
            "The <mark>model explorer</mark> allows you to explore the model.",
            "The <mark>validation</mark> view checks model conformance violations and lists all the errors that occur on the model. During the <mark>Exploratory Phase</mark>, we do not rely on a metamodel definition. Therefore, no error can be found.",
            "A chart diagram appears at the top right corner of the screen. It helps you remember in which phase you are. You can hover an axis to know how the current phase addresses a specific challenge of flexible metamodeling.",
            "Below the graphical editor, you can see how the model is serialized into JSON and XML. During the <mark>Exploratory Phase</mark>, XML serialization is not possible as it is specific to a metamodel defintion (which does not exists yet).",
            "Now, let's begin to model my family !",
            "To help you, I will give you an example. I will add my dad and mom, and myself into the diagram. Feel free to do any change as you want. Once your are done, you can use the blue button below the chart diagram to go to the <mark>Consolidation Phase</mark>.",
        ];

        callback = onFinished;
        fadeInToDisappear = fadeIn;

        i = 0;

        this.wrapper.click();
    };

    fleximeta.Narrator.prototype.createValidationModal = function (options) {

        this.fadeIn();

        var self = this
          , hasToAppear = !narrator.classList.contains('appear')
          , hideOnFinish = options.hideOnFinish || 'yes';

        var value = options.defaultValue || ''
          , placeholder = options.placeholder || '';

        var form =
          $('<form id="newValueForm">'
        +   '<div class="form-group">'
        +       '<label>'+options.label+'</label>'
        +       '<div class="input-group">'
        +           '<span class="input-group-btn">'
        +               '<button type="submit" class="btn btn-search">Yes</button>'
        +               ' <button type="reset" class="btn btn-search">No</button>'
        +           '</span>'
        +       '</div>'
        +   '</div>'
        + '</form>')
        ;

        $(narrator).data('bs.popover').options.content = form[0];

        form.bind('submit', function (e) {
            e.preventDefault();

            var result = options.onResult(true);

            if (result === false)
                return;

            if(hideOnFinish === 'yes')
                self.hide();

            if (options.onFinished)
                options.onFinished(true);
        });

        form.bind('reset', function (e) {
            e.preventDefault();

            var result = options.onResult(false);

            if (result === false)
                return;

            if(hideOnFinish === 'yes')
                self.hide();

            if (options.onFinished)
                options.onFinished(false);
        });

        if (hasToAppear) {
            narrator.classList.add('appear');
            setTimeout(
            function() {
                $(narrator).popover('show');
            }, 500);
        }
        else
            $(narrator).popover('show');
    };

    fleximeta.Narrator.prototype.createPromptModal = function (options) {

        this.fadeIn();

        var self = this
          , hasToAppear = !narrator.classList.contains('appear')
          , hideOnFinish = options.hideOnFinish || 'yes';

        var value = options.defaultValue || ''
          , placeholder = options.placeholder || '';

        var form =
          $('<form id="newValueForm" autocomplete="off">'
        +   '<div class="form-group">'
        +       '<label for="newValue">'+options.label+'</label>'
        +       '<div class="input-group">'
        +           '<input type="text" name="newValue" class="form-control" id="newValue" placeholder="'+placeholder+'" value="'+value+'">'
        +           '<span class="input-group-btn">'
        +               '<button type="submit" class="btn btn-search">OK</button>'
        +           '</span>'
        +       '</div>'
        +       '<span id="newValueMessage" class="help-block"></span>'
        +   '</div>'
        + '</form>')
        ;

        if (options.datalist) {
            var datalist = $('<datalist id="newValueDatalist"></datalist>');
            for (var i in options.datalist) {
                datalist.append('<option>'+options.datalist[i]+'</option>');
            }
            form.find('#newValue').attr('list', 'newValueDatalist');
            form.find('#newValue').after(datalist);
        }

        $(narrator).data('bs.popover').options.content = form[0];

        form.bind('submit', function (e) {
            e.preventDefault();

            var result = options.onSubmit(e, $(this).serializeArray());

            if (typeof result === 'string') {
                form.find('#newValueMessage').html(result);
                return;
            }

            if (result === false)
                return;

            if(hideOnFinish === 'yes')
                self.hide();

            if (options.onFinished)
                options.onFinished();
        });

        form.bind('reset', function (e) {
            e.preventDefault();

            if (options.onReset)
                options.onReset(e);

            if(hideOnFinish === 'yes')
                self.hide();

            if (options.onFinished)
                options.onFinished();

        });

        form.bind('keyup', function (e) {
            if (e.keyCode === 27) {
                
                e.preventDefault();

                if (options.onReset)
                    options.onReset(e);

                self.hide();
            }
        });

        if (hasToAppear) {
            narrator.classList.add('appear');
            setTimeout(
            function() {
                $(narrator).popover('show');
            }, 500);
        }
        else
            $(narrator).popover('show');
    };

    fleximeta.Narrator.prototype.hide = function (options) {

        var self = this
          , nar = narrator;

        $(nar).popover('hide');

        setTimeout(
            function() {
                nar.classList.remove('appear');
                self.fadeOut();
            }, 200
        );
    };

    fleximeta.Narrator.prototype.play = function () {

        if (!inPlay)
            return;

        if (i > inPlay.length - 1) {
            
            var sentence = inPlay[i-1]
              , self = this;

            $(narrator).data('bs.popover').options.content = '';
            $(narrator).popover('show');
            $(narrator).popover('hide');

            setTimeout(
                function() {
                    narrator.classList.remove('appear');
                    if (callback)
                        callback();
                    self.fadeOut();
                }, 200
            );

            inPlay = undefined;
            i= 0;
            return;
        }

        var sentence = inPlay[i]
          , hasToAppear = !narrator.classList.contains('appear');

      //  popover.options.content = sentence;
        $(narrator).data('bs.popover').options.content = sentence;
        i++;

        if (hasToAppear) {
            narrator.classList.add('appear');
            setTimeout(
            function() {
                $(narrator).popover('show');
            }, 500);
        }
        else
            $(narrator).popover('show');

    };

    fleximeta.Narrator.prototype.fadeIn = function () {
        $(this.wrapper).fadeIn();
    };

    fleximeta.Narrator.prototype.fadeOut = function () {
        $(this.wrapper).fadeOut();
    };

    fleximeta.Narrator.prototype.init = function () {

        var scenarios = [
            {title: "Presentation", scenario: this.showPresentationScenario}
        ];

        this.wrapper = document.createElement('div');
        this.wrapper.id = "wrap";

        $(this.wrapper).on('click', this.play.bind(this));

        document.body.appendChild(this.wrapper);

        // create narrators
        this.addNarrator('Bart', 'right');
        this.addNarrator('Lisa', 'left');
        this.addNarrator('Marge', 'left');

        $('body').delegate('.popover-content', 'keyup', function (e) {
            if (e.keyCode === 27)
                $(e.currentTarget).find('form').trigger('reset');
        });

        this.changeNarrator('Bart');
    };

    fleximeta.Narrator.prototype.addNarrator = function (name, placement) {

        this[name] = document.createElement('img');
        this[name].src = 'img/'+name+'.png';
        this[name].className = 'simpson noselect';
        this[name].id = name;

        document.body.appendChild(this[name]);

         $(this[name]).popover({
            html: true,
            content: "",
            title: name + ' says:',
            trigger:"manual",
            placement: placement
        });

     //   var popover = $(this[name]).data('bs.popover');

        $(this[name]).on('shown.bs.popover', function () {
            var pop = $(this).data('bs.popover')
              , isDOM = typeof pop.options.content === 'object';

            if (!isDOM)
                return;

            var form = $(pop.options.content);
            form.find('input[type="text"]').focus();
            form.find('input[type="text"]').select();
        });

     //   this[name].popover = popover;

    //    popover.$element.on('shown.bs.popover', function () {
    //    });

    //    popover.$element.on('hidden.bs.popover', function () {
    //        $(popover.options.content).remove();
    //    });
    };

    fleximeta.Narrator.prototype.changeNarrator = function (newNarrator) {

        if (!this[newNarrator])
            return;

        narrator = this[newNarrator];
     //   popover = narrator.popover;
    };

    fleximeta.Narrator.instance = undefined;

    fleximeta.Narrator.getInstance = function () {
        if (!fleximeta.Narrator.instance)
            fleximeta.Narrator.instance = new fleximeta.Narrator();
        return fleximeta.Narrator.instance;
    };

})();
;(function () {
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
;$(function () {

    var demo = new fleximeta.Demo();
    demo.initialize();

    $('[data-toggle="popover"]').popover();

    $.contextMenu({
        // define which elements trigger this menu
        selector: ".upper-canvas",
        build: function($trigger, e) {
            var target = demo.canvas.findTarget(e) || demo.canvas;

            return {
                callback: function(key, options) {
                    // FIXME: does not work with hierarchical menu
                    var callback = target.contextMenu[key].callback;
                    target[callback](e);
                },
                items: target.getContextMenu()
            };
        }
    });
    
    $('.navbar-toggle').click();

    var narrator = fleximeta.Narrator.getInstance();

    $('#privacy').bind('click', function (e) {
        e.preventDefault();
        narrator.showPrivacy(true, function () {});
    });

    $('#save').bind('click', function (e) {
        e.preventDefault();
        demo.save();
    });

    $('#repeat').bind('click', function (e) {
        e.preventDefault();
        demo.repeat();
    });

    $('body').bind('keyup', function (e) {
        if (e.keyCode === 27)
            demo.getCanvas().cancelConnection();
    });


});
