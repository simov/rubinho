
var app = {
  graph: null,
  gem: null,
  ws: null,
  selectized: false,
  cleanup: () => {
    if (app.graph) {
      app.graph.clear()
      app.graph = null
    }
    if (app.ws) {
      app.ws.close(4000, 'CLOSE_GOING_AWAY')
    }
    app.gem = null
  }
}

window.addEventListener('DOMContentLoaded', (e) => {
  m.route(document.querySelector('body'), '/', {
    '/': {
      controller: function () {
        app.cleanup()
      },
      view: () => [
        m('.sidebar', m(Selectize, {})),
        m('footer', m('p',
          m('a[href="http://simov.github.io"][target="_blank"]', 'simov')))
      ]
    },
    '/gem/:gem': {
      controller: function () {
        app.cleanup()
      },
      view: () => [
        m('.sidebar', [
          m(Selectize, {value: m.route.param('gem')}),
          m(GraphInfo, {}),
          m(Gem, {})
        ]),
        m('footer', m('p',
          m('a[href="http://simov.github.io"][target="_blank"]', 'simov'))),
        m(Graph)
      ]
    }
  })
})
