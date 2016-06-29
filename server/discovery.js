
var async = require('async')
var rb = require('./rubygems')


exports.run = (root, step, done) => {
  if (done === undefined) {
    done = step
    step = null
  }

  var gems = {}
  var wait = {}
  var error = false

  function getGem (gem, done) {
    if (error) {
      done(error)
      return
    }

    if (!gems.hasOwnProperty(gem.name) && !wait.hasOwnProperty(gem.name)) {
      wait[gem.name] = true
      rb.get('gems/' + gem.name, (err, res) => {
        if (err) {
          done(err)
          return
        }

        delete wait[gem.name]
        gems[gem.name] = res.body

        // console.log('gem', '->', gem.name)
        if (step) {
          error = step(res.body)
        }
        if (error) {
          done(error)
          return
        }

        if (res.body.dependencies.runtime.length) {
          deps(res.body.dependencies.runtime, done)
        }
        else {
          done()
        }
      })
    }
    else {
      // console.log('pass')
      done(error)
    }
  }

  function deps (dependencies, done) {
    async.each(
      dependencies,
      getGem,
      (err) => {
        if (err) {
          done(err)
          return
        }
        // console.log('DONE!')
        done()
      }
    )
  }

  getGem({name: root}, (err) => {
    if (err) {
      done(err)
      return
    }
    // console.log('FINISH!')
    done(null, gems)
  })
}
