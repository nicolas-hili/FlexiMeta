var http = require('http')
  , fs = require('fs')
  , port = process.env['PORT'] || 8080
  , director = require('director')
  , serveStatic = require('serve-static')
  , db = require('./lib/db.js')
  , simpson = require('./lib/simpson.js')
  , Plates = require('plates')
  , sessionManager = require('session-manager').create({engine: 'file', directory:'./data'});

function showInit() {

      var res = this.res;

      fs.readFile('./views/index.html', function (err, html) {

          var data = {};
          var map = Plates.Map();

          if(process.env.NODE_ENV === 'production') {
              map.class('srcScript').remove();
              map.class('script').partial('<script src="js/dist/fleximeta-0.0.1.min.js"></script>');
              html = Plates.bind(html, data, map);
          }

          res.writeHeader(200, {"Content-Type": "text/html"});  
          res.write(html);  
          res.end();
      });
}


function destroySession() {

    var res = this.res
      , req = this.req;

    var session = sessionManager.start(req, res);
    var user = session.get('user');

    if (user === undefined) {
        res.writeHeader(500, {"Content-Type": "text/json"});  
        res.write("no existing session is found.");  
        res.end();
        return;
    }

    db.removeProject (user, function (result) {
        if (result) {
            var session = sessionManager.start(req, res);
            session.set('user', undefined);

            res.writeHeader(200, {"Content-Type": "text/html"});  
            res.write("Project and session destroyed.");  
            res.end();
        }
        else {
            res.writeHeader(500, {"Content-Type": "text/json"});  
            res.write("no existing session is found.");  
            res.end();
            return;
        }
    });
}

function updateUser() {

    var res = this.res
      , req = this.req;

  //  clientSession.csget(req, res); // get csession

      var session = sessionManager.start(req, res);

      var user = session.get('user')
        , diagram = this.req.body.diagram
        , model = this.req.body.model;

    if (!user || !model || !diagram) {
        res.writeHeader(200, {"Content-Type": "application/json"});  
        res.write(JSON.stringify({error: true}));  
        res.end();
    }
    else {

        var data = {
            model: JSON.parse(this.req.body.model),
            diagram: JSON.parse(this.req.body.diagram)
        };
        db.updateProject(user, data, function () {
            res.writeHeader(200, {"Content-Type": "application/json"});  
            res.write(JSON.stringify({ok: true}));  
            res.end();
        });
    }
}

function updatePhase () {

    var res = this.res
      , req = this.req;

      var session = sessionManager.start(req, res);
      var user = session.get('user');

    if (!user) {
        res.writeHeader(200, {"Content-Type": "application/json"});  
        res.write(JSON.stringify({error: true}));  
        res.end();
        return;
    }

    db.getProject (user, function (result) {

        var data = {
                user:           result._id,
                model:          result.model,
                diagram:        result.diagram,
                phase:          result.phase,
                firstConnexion: false
            }
          , phases = ['exploratory', 'consolidation', 'finalization']
          , currentPhase = data.phase;

        if (currentPhase > 1) {
            res.writeHeader(200, {"Content-Type": "application/json"});  
            res.write(JSON.stringify({error: true}));  
            res.end();
            return;
        }

        currentPhase++;

        // TODO: update phase
        db.updatePhase(user, currentPhase, function (result) {
            getScriptPhase(currentPhase, function (err, script) {
                res.writeHeader(200, {"Content-Type": "application/javascript"});  
                res.write(script);  
                res.end();
            });
        });
    });

}

function getScript () {

    var res = this.res
      , req = this.req;

      var session = sessionManager.start(req, res);
      var user = session.get('user');

    if (!user) {
        res.writeHeader(200, {"Content-Type": "application/json"});  
        res.write(JSON.stringify({error: true}));  
        res.end();
        return;
    }

    db.getProject (user, function (result) {

        var data = {
                user:           result._id,
                model:          result.model,
                diagram:        result.diagram,
                phase:          result.phase,
                firstConnexion: false
            }
          , phases = ['exploratory', 'consolidation', 'finalization']
          , currentPhase = data.phase;

        if (currentPhase == 0) {
            res.writeHeader(200, {"Content-Type": "application/json"});  
            res.write(JSON.stringify({error: true}));  
            res.end();
            return;
        }

        getScriptPhase(currentPhase, function (err, script) {
            res.writeHeader(200, {"Content-Type": "application/javascript"});  
            res.write(script);  
            res.end();
        });
    });

}

function getScriptPhase(phase, callback) {
    var phases = ['exploratory', 'consolidation', 'finalization'];

    if(process.env.NODE_ENV === 'production')
        fs.readFile('./scripts/'+phases[phase]+'/script.min.js', callback);
    else
        fs.readFile('./scripts/'+phases[phase]+'/script.js', callback);
}

function getUser() {

    var res = this.res
      , req = this.req;

      var session = sessionManager.start(req, res);
      var user = session.get('user');

    if (user === undefined) {
        db.createProject (function (result) {
            var data = {
                user:           result.ops[0]._id,
                model:          result.ops[0].model,
                diagram:        result.ops[0].diagram,
                phase:          result.ops[0].phase,
                firstConnexion: true
            };

            session.set('user', data.user);

            res.writeHeader(200, {"Content-Type": "application/json"});  
            res.write(JSON.stringify(data));  
            res.end();
        });
    }
    else {
        // db.getProject
        db.getProject (user, function (result) {

            var data = {
                user:           result._id,
                model:          result.model,
                diagram:        result.diagram,
                phase:          result.phase,
                firstConnexion: false
            };

            res.writeHeader(200, {"Content-Type": "application/json"});  
            res.write(JSON.stringify(data));  
            res.end();
        });
    }
}

var routes = {
      '/': {'get': showInit},
      '/demo-simpson': {'get': showInit},
      '/ajax': {
        '/user': {
            '/get': { 'get': getUser},
            '/update': { 'post': updateUser},
            '/increase': { 'get': updatePhase},
            '/getScript': { 'get': getScript},
            '/destroySession': { 'get' : destroySession}
        }
      },
      '/user': {
        '/destroySession': { 'get' : destroySession}
      }
};

//
// define a routing table.
//
var router = new director.http.Router(routes);

// Serve up public folder 
var serve = serveStatic('public/');

var server = http.createServer(function (req, res) {

    // For post params
    req.chunks = [];
    req.on('data', function (chunk) {
      req.chunks.push(chunk.toString());
    } );

    var session = sessionManager.start(req, res);


    router.dispatch(req, res, function (err) {
        if (err) {
            serve(req, res, function () {
                res.writeHead(404);
                res.end('this page does not exist');
            })
        }
    });
});

server.listen(port);

console.log("Server ready to accept requests on port %d", port);
