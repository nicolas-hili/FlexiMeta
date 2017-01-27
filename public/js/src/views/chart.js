(function () {
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

