
var Search = {
  controller: function () {

    var status = {
      text: '',
      interval: null,
      start: () => {
        var dots = []
        status.interval = setInterval(() => {
          if (dots.length === 3) {
            status.text = 'searching'
            dots = []
          }
          else {
            dots.push('.')
            status.text = 'searching ' + dots.join('')
          }
          m.redraw()
        }, 500)
      },
      stop: () => {
        clearInterval(status.interval)
        status.interval = null
        status.text = ''
        m.redraw()
      }
    }

    return {
      status: status,
      selectize: (elem, init, ctx) => {
        if (!init) {
          var $select = $(elem).selectize({
            create: false,
            options: [{value: m.route.param('gem'), text: m.route.param('gem')}],
            loadThrottle: 500,
            load: function (query, done) {
              this.clearOptions()
              status.stop()

              if (!query.length) {
                done()
                return
              }

              status.start()
              m.request({method: 'GET', url: '/search', data: {query}})
                .then((body) => {
                  status.stop()
                  done(body)
                })
                .catch((err) => {
                  status.stop()
                  console.log(err)
                })
            }
          })

          ctx.selectize = $select[0].selectize
          ctx.selectize.setValue(m.route.param('gem'))

          ctx.selectize.on('change', function () {
            if (this.getValue()) {
              m.route('/gem/' + this.getValue())
            }
          })
        }
      }
    }
  },
  view: (ctrl) => {
    return m('.search', [
      m('select', {
        placeholder: 'Search',
        config: ctrl.selectize
      }),
      (ctrl.status.text || null) &&
      m('p.status', ctrl.status.text)
    ])
  }
}
