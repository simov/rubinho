
var GraphInfo = {
  controller: function () {
    var ctrl = {
      store: JSON.parse(localStorage.getItem('rubinho')) || {},
      toggleNames: (e) => {
        document.querySelectorAll('text').forEach((text) => {
          text.style.display = e.target.checked ? 'block' : 'none'
        })
        localStorage.setItem('rubinho', JSON.stringify({
          showNames: e.target.checked
        }))
        ctrl.store.showNames = e.target.checked
      }
    }
    return ctrl
  },
  view: (ctrl, args) => {
    if (app.graph) {
      return (
      m('p.graph-info', [
        ((app.gem && app.gem.name !== m.route.param('gem')) || null) &&
        m('a', {href: '/gem/' + app.gem.name, config: m.route}, 'show graph'),
        m('label',
          m('input[type="checkbox"]', {
            onchange: ctrl.toggleNames,
            checked: ctrl.store.showNames ? 'checked' : null
          }),
          'names'
        ),
        ' | nodes ', m('strong', app.graph.getNodes() || 0),
        ' | links ', m('strong', app.graph.getLinks() || 0)
      ]))
    }
    else {
      return m('div')
    }
  }
}
