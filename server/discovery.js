
var https = require('https')
var async = require('async')
var rb = require('./rubygems')


exports.run = (root, step, done) => {
  var gems = {}
  var error = false
  var agent = new https.Agent({keepAlive: true, maxSockets: 3})

  getGem({name: root}, (err) => {
    agent.destroy()
    if (err) {
      done(err)
      return
    }
    done(null, gems)
  })

  function getGem (gem, done) {
    if (error) {
      done(error)
      return
    }

    // skip
    if (gems[gem.name]) {
      done(error)
      return
    }

    gems[gem.name] = true

    // get
    rb.get('gems/' + gem.name, {agent}, (err, res, body) => {
      if (err) {
        done(err)
        return
      }

      gems[gem.name] = body

      if (step) {
        error = step(body)
      }
      // client has disconnected
      if (error) {
        done(error)
        return
      }

      // deps
      if (body.dependencies.runtime.length) {
        deps(body.dependencies.runtime, done)
      }
      // bottom
      else {
        done()
      }
    })
  }

  function deps (dependencies, done) {
    async.each(dependencies, getGem, done)
  }
}
