
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
        m('label',
          m('input[type="checkbox"]', {
            onchange: ctrl.toggleNames,
            checked: ctrl.store.showNames ? 'checked' : null
          }),
          'names'
        ),
        ' | nodes ', m('strong', app.graph.getNodes()),
        ' | links ', m('strong', app.graph.getLinks())
      ]))
    }
    else {
      return m('div')
    }
  }
}
