
var async = require('async')
var rb = require('./rubygems')


exports.run = (root, step, done) => {
  var gems = {}
  var error = false

  getGem({name: root}, (err) => {
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
    rb.get('gems/' + gem.name, (err, res) => {
      if (err) {
        done(err)
        return
      }

      gems[gem.name] = res.body

      if (step) {
        error = step(res.body)
      }
      // client has disconnected
      if (error) {
        done(error)
        return
      }

      // deps
      if (res.body.dependencies.runtime.length) {
        deps(res.body.dependencies.runtime, done)
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
