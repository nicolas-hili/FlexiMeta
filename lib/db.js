var assert = require('assert')
  , simpson = require('./simpson.js')
  , mongodb = require('mongodb')
  , MongoClient = mongodb.MongoClient
  , ObjectId = mongodb.ObjectID
  , database;

// Connection URL
var url = (process.env.NODE_ENV === 'production') ? 'mongodb://localhost:27017/local' :  'mongodb://localhost:27017/simpson';

MongoClient.connect(url, function(err, db) {
      assert.equal(null, err);
      database = db;
});


exports.createProject = function (callback) {

  // Get the projects collection
  var collection = database.collection('projects');

  // Insert some documents
  collection.insert({
        'model' : simpson.createSimpsonInitialModel(),
        'diagram' : simpson.createSimpsonInitialDiagram(),
        'phase': 0
    }, function(err, result) {
        assert.equal(err, null);
        if (callback)
            callback(result);
  });
};

exports.getProject = function (user, callback) {

  // Get the projects collection
  var collection = database.collection('projects');

  collection.findOne({_id: ObjectId(user)}, function (err, document) {
        assert.equal(err, null);
        if (callback)
            callback(document);
  });
    
};

exports.removeProject = function (user, callback) {

  // Get the projects collection
  var collection = database.collection('projects');

  collection.deleteOne({_id: ObjectId(user)}, function (err, result) {
        assert.equal(err, null);
        assert.equal(1, result.result.n);
        if (callback)
            callback(true);
  });
};

exports.updateProject = function (user, data, callback) {

  // Get the projects collection
  var collection = database.collection('projects');

  collection.updateOne({_id: ObjectId(user)}, 
    { $set: {model: data.model, diagram: data.diagram}},
    function (err, result) {
        assert.equal(err, null);
        assert.equal(1, result.result.n);
        if (callback)
            callback(true);
  });

};

exports.updatePhase = function (user, phase, callback) {

  // Get the projects collection
  var collection = database.collection('projects');

  collection.updateOne({_id: ObjectId(user)}, 
    { $set: {phase: phase}},
    function (err, result) {
        assert.equal(err, null);
        assert.equal(1, result.result.n);
        if (callback)
            callback(true);
  });

};
