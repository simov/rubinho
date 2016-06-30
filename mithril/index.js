
var app = {
  graph: null,
  gem: null,
  ws: null
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
        m('.sidebar', m(Search)),
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
          m(Search, {}),
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
