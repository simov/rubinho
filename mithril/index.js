
var app = {
  graph: null,
  gem: null,
  ws: null
}

window.addEventListener('DOMContentLoaded', (e) => {
  m.route(document.querySelector('body'), '/', {
    '/': {
      view: () =>
        m('.sidebar', [
          m(Search),
          m(Footer)
        ])
    },
    '/gem/:gem': {
      view: () => [
        m('.sidebar', [
          m(Search, {}),
          m(GraphInfo, {}),
          m(Gem, {})
        ]),
        m(Footer),
        m(Graph)
      ]
    }
  })
})
