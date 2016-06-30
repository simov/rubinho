
var GraphInfo = {
  controller: function () {
    return {
      toggleNames: (e) => {
        // TODO: remove jQuery
        if (e.target.checked) {
          $('text').show()
        }
        else {
          $('text').hide()
        }
      }
    }
  },
  view: (ctrl, args) => {
    if (app.graph) {
      return true &&
      m('p.graph-info', [
        m('label',
          m('input[type="checkbox"]', {onchange: ctrl.toggleNames}),
          'names'
        ),
        ' | nodes ', m('strong', app.graph.getNodes()),
        ' | links ', m('strong', app.graph.getLinks())
      ])
    }
    else {
      return m('div')
    }
  }
}
