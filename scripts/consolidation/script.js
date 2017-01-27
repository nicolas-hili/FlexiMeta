(function () {
  'use strict';

    fleximeta.model.Family = function (options) {

        options = options || {};

        this.setLastname(options.lastname || 'Doe');
        this.setAddress(options.address || '');
        this.setCollection('members', options.members || [], fleximeta.model.Individual);

        delete options.lastname;
        delete options.members;

        fleximeta.model.Base.call(this, options);
    };

    fleximeta.model.Family.prototype = Object.create(fleximeta.model.Base.prototype);
    fleximeta.model.Family.constructor = fleximeta.model.Family;

    fleximeta.model.Family.prototype.setLastname = function (lastname) {
        this.set('lastname', lastname);
    };

    fleximeta.model.Family.prototype.getLastname = function () {
        return this.get('lastname');
    };

    fleximeta.model.Family.prototype.setAddress = function (address) {
        this.set('address', address);
    };

    fleximeta.model.Family.prototype.getAddress = function () {
        return this.get('address');
    };

    fleximeta.model.Family.prototype.getMembers = function () {
        return this.get('members');
    };

    fleximeta.model.Family.prototype.validate = function (errors) {

        errors = errors || [];

        var members = this.getMembers()
          , lastname = this.getLastname()
          , address = this.getAddress();

        if (!lastname)
            errors.push({element: this, id: 'lastnameRequired', label: 'lastname is a required attribute'});

        if (!address)
            errors.push({element: this, id: 'addressRequired', label: 'address is a required attribute'});


        if (!(members instanceof Array) || members.length < 2)
            errors.push({element: this, name: 'memberAtLeast2', label: 'multiplicity of the <strong>members</strong> attribute must be at least 2'});

        for (var i = 0; i < members.length; i++) {
            errors = members[i].validate(errors);
        }

        errors = fleximeta.model.Base.prototype.validate.call(this, errors, [
                'members',
                'lastname',
                'address'
        ]);
        return errors;
    };

    fleximeta.model.Family.prototype.toXML = function (errors) {

        var members = this.getMembers()
          , uuid = this.getUuid();

        var xml = 
             '<?xml version="1.0" encoding="UTF-8"?>'
          +  '<family:Family '
          +  'xmi:version="2.0" '
          +  'xmlns:xmi="http://www.omg.org/XMI" '
          +  'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" '
          +  'xmlns:family="http://family/0.1" '
          +  'xsi:schemaLocation="http://family/0.1 family.ecore" '
          +  'lastname="Simpson" ';

          xml += 'uuid="'+uuid+'" ';

          xml += ">";

          for (var i = 0; i < members.length; i++) {
              xml += members[i].toXML();
          }

          xml += '</family:Family>';
          return xml;

    };

})();

(function () {
   fleximeta.model.Title = [
       'Mr',
       'Ms',
       'Mse'
   ];
})();

(function () {
  'use strict';

    fleximeta.model.Individual = function (options) {

        options = options || {};

        this.setFirstname(options.firstname || 'John');
        this.setAge(options.age || 0);
        this.setSpouse(options.spouse || undefined);
        this.setOccupation(options.occupation || '');
        this.setTitle(options.title || 0);
        this.setCollection('children', options.children || [], fleximeta.model.Individual);

        delete options.firstname;
        delete options.age;
        delete options.occupation;
        delete options.spouse;
        delete options.title;
        delete options.children;

        fleximeta.model.Base.call(this, options);
    };

    fleximeta.model.Individual.prototype = Object.create(fleximeta.model.Base.prototype);
    fleximeta.model.Individual.constructor = fleximeta.model.Individual;
    
    fleximeta.model.Individual.prototype.setFirstname = function (firstname) {
        this.set('firstname', firstname);
    };

    fleximeta.model.Individual.prototype.getFirstname = function () {
        return this.get('firstname');
    };

    fleximeta.model.Individual.prototype.setAge = function (age) {
        this.set('age', age);
    };

    fleximeta.model.Individual.prototype.getAge = function () {
        return this.get('age');
    };

    fleximeta.model.Individual.prototype.setSpouse = function (spouse) {
        this.set('spouse', spouse);
    };

    fleximeta.model.Individual.prototype.getSpouse = function () {
        return this.get('spouse');
    };

    fleximeta.model.Individual.prototype.setChildren = function (children) {
        this.set('children', children);
    };

    fleximeta.model.Individual.prototype.getChildren = function () {
        return this.get('children');
    };

    fleximeta.model.Individual.prototype.setTitle = function (title) {
        if (isNaN(title) && fleximeta.model.Title.indexOf(title) !== -1)
            this.set('title', title);
        else if (title >= 0 && title <= 2)
            this.set('title', fleximeta.model.Title[title]);
    };

    fleximeta.model.Individual.prototype.getTitle = function () {
        return this.get('title');
    };

    fleximeta.model.Individual.prototype.setOccupation = function (occupation) {
        this.set('occupation', occupation);
    };

    fleximeta.model.Individual.prototype.getOccupation = function () {
        return this.get('occupation');
    };

    fleximeta.model.Individual.prototype.validate = function (errors) {

        errors = errors || [];

        var occupation = this.getOccupation()
          , age = this.getAge()
          , title = this.getTitle()
          , firstname = this.getFirstname();

        if (!title)
            errors.push({element: this, id: 'titleRequired', label: 'title is a required attribute'});

        if (title && fleximeta.model.Title.indexOf(title) === -1)
            errors.push({element: this, name: 'titleIncorrectValue', label: 'possible values for title are: [' + fleximeta.model.Title.join(', ') + ']'});

        if (!age)
            errors.push({element: this, id: 'ageRequired', label: 'age is a required attribute'});

        if (age && isNaN(age))
            errors.push({element: this, id: 'ageNaN', label: 'age is not a number'});

        if (!firstname)
            errors.push({element: this, id: 'firstnameRequired', label: 'firstname is a required attribute'});

        errors = fleximeta.model.Base.prototype.validate.call(this, errors, [
                'firstname',
                'occupation',
                'age',
                'title',
                'spouse',
                'children',
        ]);
        return errors;
    };

    fleximeta.model.Individual.prototype.toXML = function () {
        var occupation = this.getOccupation()
          , firstname = this.getFirstname()
          , age = this.getAge()
          , title = this.getTitle()
          , uuid = this.getUuid()
          , spouse = this.getSpouse()
          , childrenUuid = this.getChildren().map(function (element) {
                return element.getUuid();
            })
          , occupation = this.getOccupation()
          , spouseUuid = (spouse) ? spouse.getUuid() : ''
          ;

        var xml = "<members ";
        xml += 'uuid="'+uuid+'" ';
        xml += 'firstname="'+firstname+'" ';
        xml += 'age="'+age+'" ';
        xml += 'title="'+title+'" ';
        xml += 'occupation="'+occupation+'" ';
        if (spouse)
            xml += 'spouse="'+spouseUuid+'" ';
        if (childrenUuid.length)
            xml += 'children="'+childrenUuid.join(' ')+'" ';

        xml += ">";

        xml += "</members>";
        return xml;
    };

})();
