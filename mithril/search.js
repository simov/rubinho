
var Search = {
  controller: function (args) {
    return {
      config: (elem, init, ctx) => {
        if (!init) {
          var $select = $(elem).selectize({
            create: false,
            options: [{value: m.route.param('gem'), text: m.route.param('gem')}],
            load: function (query, done) {
              this.clearOptions()

              if (!query.length) {
                done()
                return
              }

              m.request({method: 'GET', url: '/search', data: {query}})
                .then(done)
                .catch((err) => console.log(err))
            }
          })

          ctx.selectize = $select[0].selectize
          ctx.selectize.setValue(args.value)

          ctx.selectize.on('change', function () {
            if (this.getValue()) {
              m.route('/gem/' + this.getValue())
            }
          })
        }
      }
    }
  },
  view: (ctrl, args) => {
    if (!app.selectized) {
      return m('.search',
        m('select', {
          placeholder: 'Search',
          config: ctrl.config
        })
      )
    }
    else {
      return {subtree: 'retain'}
    }
  }
}
