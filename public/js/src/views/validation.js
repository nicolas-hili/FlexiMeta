(function () {
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
