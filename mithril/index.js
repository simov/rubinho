
var app = {
  graph: null,
  gem: null,
  ws: null,
  selectized: false
}

window.addEventListener('DOMContentLoaded', (e) => {
  m.route(document.querySelector('body'), '/', {
    '/': {
      controller: function () {
        if (app.graph) {
          app.graph.clear()
          app.graph = null
        }
        app.gem = null
      },
      view: () => [
        m('.sidebar', m(Selectize, {})),
        m('footer', m('p',
          m('a[href="http://simov.github.io"][target="_blank"]', 'simov')))
      ]
    },
    '/gem/:gem': {
      controller: function () {
        if (app.graph) {
          app.graph.clear()
          app.graph = null
        }
        app.gem = null
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
