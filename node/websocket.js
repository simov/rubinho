
var ds = require('./discovery'),
    rb = require('./rubygems'),
    sc = require('./scrape');


var WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({host: 'localhost', port: 3001});
var clients = {};

wss.on('connection', function (ws) {
    ws.on('message', function (data) {
        var req = JSON.parse(data);
        switch (req.message) {
            case 'ping':
                ws.id = req.id;
                clients[ws.id] = ws;
                clients[ws.id].send(JSON.stringify({message: 'pong'}));
                break;
            case 'gems':
                ds.run(req.gem, 
                    function (gem) {
                        if (!clients[req.id]) return true;
                        clients[req.id].send(JSON.stringify({
                            message: 'node',
                            gem: gem
                        }));
                    },
                    function (err, gems) {
                        if (!clients[req.id]) return true;
                        clients[req.id].send(JSON.stringify({
                            message: 'done',
                            gems: gems
                        }));
                    });
                break;
            case 'owners':
                sc.owners('gems/'+req.gem, function (err, owners) {
                    if (!clients[req.id]) return true;
                    clients[req.id].send(JSON.stringify({
                        message: 'owners',
                        owners: owners,
                        gem: req.gem
                    }));
                });
                break;
        }
    });
    ws.on('close', function () {
        delete clients[ws.id];
    });
});

// setInterval(function () {
// 	console.log('clients', '->', Object.keys(clients).length);
// 	console.log('-------------------------------');
// }, 1000);

exports.clients = clients;
