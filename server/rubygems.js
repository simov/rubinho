
var https = require('https')


function toQueryString (qs) {
  return Object.keys(qs)
    .map((name) => (name + '=' + qs[name]))
    .join('&')
}

function getPath (api, qs) {
  var path = '/api/v1/' + api + '.json'
  if (qs) {
    path += '?' + toQueryString(qs)
  }
  return path
}

exports.get = (api, options, done) => {
  if (typeof options === 'function') {
    done = options
    options = {}
  }

  var opts = {
    hostname: 'rubygems.org',
    port: 443,
    method: 'GET',
    path: getPath(api, options.qs)
  }
  if (options.agent) {
    opts.agent = options.agent
  }

  var req = https.request(opts)

  req.on('response', (res) => {
    var buff = ''
    res
      .on('data', (chunk) => (buff += chunk))
      .on('end', () => {
        var raw = buff.toString()
        try {
          var body = JSON.parse(raw)
        }
        catch (e) {
          var err = new Error(raw)
        }
        done(err, res, body)
      })
  })

  req.on('error', done)
  req.end()
}

exports.scrape = (api, done) => {
  var opts = {
    hostname: 'rubygems.org',
    port: 443,
    path: '/' + api,
    method: 'GET'
  }

  var req = https.request(opts)

  req.on('response', (res) => {
    var buff = ''
    res
      .on('data', (chunk) => (buff += chunk))
      .on('end', () => {
        var body = buff.toString()
        done(null, res, body)
      })
  })

  req.on('error', done)
  req.end()
}
