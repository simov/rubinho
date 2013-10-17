
var rb = require('./node/rubygems'),
    ws = require('./node/websocket');


// Express

var express = require('express'),
    hogan = require('hogan.js'),
    consolidate = require('consolidate');

var app = express();

app.configure(function () {
    // config

    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'html');
    app.set('view cache', true);
    app.engine('html', consolidate.hogan);

    // middleware

    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(__dirname + '/'));
});

app.configure('development', function() {
    app.use(express.errorHandler());
});


// Routes

app.get('/', function (req, res) {
    res.render('view');
});

app.get('/search/:query', function (req, res) {
    // https://rubygems.org/api/v1/search.json?query=c

    rb.get('search', {query:req.params.query}, function (err, reply) {
        var result = [];
        for (var i=0; i < reply.body.length; i++) {
            result.push({
                value: reply.body[i].name,
                tokens: [reply.body[i].name]
            });
        }
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(result));
    });
});

app.get('/gem/:name', function (req, res) {
    res.render('view', {
        gem: req.params.name,
        inner: true
    });
});

// Server

app.listen(app.get('port'), function() {
    console.log('Rubinho server listening on port ' + app.get('port'));
});
