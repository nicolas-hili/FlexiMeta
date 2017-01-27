(function () {
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

