
var ds = require('./discovery')
var rb = require('./rubygems')
var sc = require('./scrape')


var WebSocketServer = require('ws').Server
var wss = new WebSocketServer({host: 'localhost', port: 3001})
var clients = {}

wss.on('connection', (ws) => {

  ws.on('message', (data) => {
    var req = JSON.parse(data)

    if (req.message === 'ping') {
      ws.id = req.id
      clients[ws.id] = ws
      clients[ws.id].send(JSON.stringify({message: 'pong', id: ws.id}))
    }
    else if (req.message === 'gems') {
      ds.run(req.gem,
        (gem) => {
          if (!clients[req.id]) {
            return true
          }
          clients[req.id].send(JSON.stringify({message: 'node', gem: gem}))
        },
        (err, gems) => {
          if (!clients[req.id]) {
            return true
          }
          clients[req.id].send(JSON.stringify({message: 'done', gems: gems}))
        }
      )
    }
    else if (req.message === 'owners') {
      sc.owners('gems/' + req.gem, (err, owners) => {
        if (!clients[req.id]) {
          return true
        }
        clients[req.id].send(JSON.stringify({
          message: 'owners', owners: owners, gem: req.gem
        }))
      })
    }
  })

  ws.on('close', () => delete clients[ws.id])
})

exports.clients = clients
