(function () {
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
