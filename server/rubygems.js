
var https = require('https')


function toQueryString (params) {
  return Object.keys(params)
    .map((name) => (name + '=' + params[name]))
    .join('&')
}

function getPath (api, params) {
  var path = '/api/v1/' + api + '.json'
  if (params) {
    path += '?' + toQueryString(params)
  }
  return path
}

exports.get = (api, params, done) => {
  if (typeof params === 'function') {
    done = params
    params = {}
  }
  https.request({
    hostname: 'rubygems.org',
    port: 443,
    path: getPath(api, params),
    method: 'GET'
  }, (res) => {
    var buff = ''
    res.on('data', (chunk) => {
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
  .on('error', done)
  .end()
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
