
// heroku dynamically assigns a port to your application process!
const port = process.env.PORT || 3000

var fs = require('fs')
var path = require('path')

var express = require('express')
var favicon = require('serve-favicon')
var serveStatic = require('serve-static')
var compression = require('compression')
var logger = require('morgan')

var hogan = require('hogan.js')
var index = fs.readFileSync(path.resolve(__dirname, '../mithril/base.html'), 'utf8')

var static = require('../mithril/config/static')[process.env.NODE_ENV || 'development']
var rb = require('./rubygems')
require('./websocket')

var app = express()

app.use(logger('dev'))
app.use(compression())

app.use(favicon(path.join(__dirname, '../assets/images/favicon.ico')))
app.use(serveStatic(path.join(__dirname, '../assets'), {maxAge: '1 year'}))
app.use(serveStatic(path.join(__dirname, '../mithril'), {maxAge: '1 year'}))


app.get('/search/:query', (req, res) => {
  // https://rubygems.org/api/v1/search.json?query=c
  rb.get('search', {query: req.params.query}, (err, reply) => {
    var result = reply.body.map((item) => ({
      value: item.name,
      tokens: [item.name]
    }))
    res.writeHead(200, {'Content-Type': 'application/json'})
    res.end(JSON.stringify(result))
  })
})

app.get('/', (req, res) => {
  var template = hogan.compile(index)
  res.writeHead(200, {'content-type': 'text/html'})
  res.end(template.render({static}))
})


app.listen(port, () => console.log('Oh hi', port, '!'))
