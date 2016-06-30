
var Graph = {
  controller: function () {
    var graph = CustomGraph()

    function addNode (gem) {
      m.startComputation()
      gem.type = (gem.name === m.route.param('gem') ? 'root' : 'node')
      graph.addNode(gem.name, gem)
      m.endComputation()
    }

    function addLinks (gems) {
      var index = 0
      var names = Object.keys(gems)

      var timeout = setInterval(() => {
        if (index === names.length) {
          clearInterval(timeout)
          document.querySelector('circle[type=root]')
            .dispatchEvent(new Event('click', {bubbles: true}))
          return
        }

        m.startComputation()
        var gem = gems[names[index++]]
        gem.dependencies.runtime.forEach((item) => {
          graph.addLink(gem.name, item.name)
        })
        m.endComputation()
      }, 50)
    }

    function addOwners (gem, owners) {
      m.startComputation()
      graph.getNode(gem).data.owners = owners
      m.endComputation()
    }

    function selectNode (gem) {
      console.log('selected %O', gem)

      // redraw gem component
      m.startComputation()
      app.gem = gem
      m.endComputation()

      // load gem owners
      if (!gem.owners) {
        app.ws.send(JSON.stringify({
          message: 'owners',
          gem: gem.name,
          id: app.ws.uuid
        }))
      }
    }

    app.graph = {
      run: () => graph.run(),
      addNode: addNode,
      addLinks: addLinks,
      addOwners: addOwners,
      getNodes: () => graph.getNodesCount(),
      getLinks: () => graph.getLinksCount()
    }

    return {
      config: (el, init, ctx) => {
        if (!init) {
          el.addEventListener('click', (e) => {
            // node
            if (e.target.nodeName === 'circle') {
              var gem = graph.getNode(e.target.attr('gem')).data
              selectNode(gem)
            }
          })
        }
      }
    }
  },
  view: (ctrl) => {
    return m('#graph', {config: ctrl.config})
  }
}
