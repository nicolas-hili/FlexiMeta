(function () {
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
