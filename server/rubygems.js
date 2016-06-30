
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
      .on('data', (chunk) => {
        buff += chunk
      })
      .on('end', () => {
        res.raw = buff.toString()
        try {
          res.body = JSON.parse(res.raw)
        }
        catch (e) {
          var err = new Error(res.raw)
        }
        done(err, res)
      })
  })

  req.on('error', done)
  req.end()
}

exports.scrape = (api, done) => {
  https.request({
    hostname: 'rubygems.org',
    port: 443,
    path: '/' + api,
    method: 'GET'
  }, (res) => {
    var buff = ''
    res.on('data', (chunk) => {
      buff += chunk
    })
    .on('end', () => {
      res.raw = buff.toString()
      done(null, res)
    })
  })
  .on('error', done)
  .end()
}
