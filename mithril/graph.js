
var customGraph = {
  colors: {
    blue: '#0072bb', green: '#159f0a', red: '#a83920',
    black: '#222e33', yellow: '#dad705'
  },
  customizeNodes: (graphics, select) => {
    graphics
      .node((node) => {
        // SVG group of elements: http://www.w3.org/TR/SVG/struct.html
        var group = Viva.Graph.svg('g')

        var text = Viva.Graph.svg('text').attr('y', '-8px').text(node.id)
        group.append(text)

        var elem
        if (node.data.type === 'root') {
          elem = Viva.Graph.svg('circle')
            .attr('r', 9)
            .attr('stroke-width', '0')
            .attr('fill', customGraph.colors.blue)
            .attr('type', 'root')
            .attr('active', false)
        }
        else if (node.data.type === 'gem') {
          elem = Viva.Graph.svg('circle')
            .attr('r', 7)
            .attr('stroke-width', '0')
            .attr('fill', customGraph.colors.green)
            .attr('type', 'gem')
            .attr('active', false)
        }
        elem.append('title').text(node.data.name)
        elem.addEventListener('click', select.bind(null, node))

        elem.addEventListener('mouseover', (e) => {
          e.target.attr('fill', customGraph.colors.yellow)
          // highlightRelatedNodes(node.id, true)
        })
        elem.addEventListener('mouseout', (e) => {
          e.target.attr('fill', (node.data.type === 'root'
            ? customGraph.colors.blue : customGraph.colors.green))
          // highlightRelatedNodes(node.id, false)
        })
        group.append(elem)

        return group
      })
      .placeNode((nodeUI, pos) => {
        nodeUI.attr('transform',
          'translate(' + (pos.x - 0/2) + ',' + (pos.y - 0/2) + ')')
      })
  },
  customizeLinks: (graphics) => {

    function createMarker (id) {
      return Viva.Graph.svg('marker')
        .attr('id', id)
        .attr('viewBox', '0 0 10 10')
        .attr('refX', '11')
        .attr('refY', '5')
        .attr('markerUnits', 'strokeWidth')
        .attr('markerWidth', '10')
        .attr('markerHeight', '5')
        .attr('orient', 'auto')
        .attr('stroke', 'gray')
        .attr('fill', '#333')
    }

    var marker = createMarker('Triangle')
    marker.append('path').attr('d', 'M 0 0 L 10 5 L 0 10 z')

    var defs = graphics.getSvgRoot().append('defs')
    defs.append(marker)

    var geom = Viva.Graph.geom()

    graphics
      .link((link) =>
        Viva.Graph.svg('path')
          .attr('stroke', 'gray')
          .attr('marker-end', 'url(#Triangle)')
      )
      .placeLink((linkUI, fromPos, toPos) => {
        var toNodeSize = 14
        var fromNodeSize = 14

        var from = geom.intersectRect(
          // rectangle:
          fromPos.x - fromNodeSize / 2 + 2, // left
          fromPos.y - fromNodeSize / 2 + 2, // top
          fromPos.x + fromNodeSize / 2 - 2, // right
          fromPos.y + fromNodeSize / 2 - 2, // bottom
          // segment:
          fromPos.x, fromPos.y, toPos.x, toPos.y)
            || fromPos // if no intersection found - return center of the node

        var to = geom.intersectRect(
          // rectangle:
          toPos.x - toNodeSize / 2 + 2, // left
          toPos.y - toNodeSize / 2 + 2, // top
          toPos.x + toNodeSize / 2 - 2, // right
          toPos.y + toNodeSize / 2 - 2, // bottom
          // segment:
          toPos.x, toPos.y, fromPos.x, fromPos.y)
            || toPos // if no intersection found - return center of the node

        var data = 'M' + from.x + ',' + from.y + 'L' + to.x + ',' + to.y

        linkUI.attr('d', data)
      })
  }
}

var Graph = {
  controller: function () {
    var graph = Viva.Graph.graph()
    var graphics = Viva.Graph.View.svgGraphics()

    function highlightRelatedNodes (nodeId, isOn) {
      graph.forEachLinkedNode(nodeId, (node, link) => {
        if (link && link.ui) {
          if (link.fromId === nodeId) {
            link.ui.attr('stroke', isOn ? customGraph.colors.red : 'gray')
          }
          else if (link.toId === nodeId) {
            link.ui.attr('stroke', isOn ? customGraph.colors.blue : 'gray')
          }
        }
      })
    }

    function selectNode (node, e) {
      console.log('selected %O', node.data)

      // reset node colors
      $('circle').each(function () {
        var type = $(this).attr('type')
        $(this)
          .attr('fill', (type === 'root' ? customGraph.colors.blue : customGraph.colors.green))
          .attr('active', false)
      })

      // reset link colors
      $('path').each(function () {
        $(this).attr('stroke', 'gray')
      })

      // set active node
      $(e.target).attr('fill', customGraph.colors.red).attr('active', true)

      highlightRelatedNodes(node.id, true)

      // redraw gem component
      m.startComputation()
      app.gem = node.data
      m.endComputation()

      // load gem owners
      if (!node.data.owners) {
        app.ws.send(JSON.stringify({
          message: 'owners',
          gem: node.id,
          id: app.ws.uuid
        }))
      }
    }

    function init () {
      customGraph.customizeNodes(graphics, selectNode)

      var renderer = Viva.Graph.View.renderer(graph, {
        container: document.querySelector('#graph'),
        graphics: graphics
      })
      renderer.run()

      customGraph.customizeLinks(graphics)
    }

    function addNode (gem) {
      m.startComputation()
      gem.type = (gem.name === m.route.param('gem')) ? 'root' : 'gem'
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
            .dispatchEvent(new Event('click'))
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
      var node = graph.getNode(gem)
      node.data.owners = owners
      m.endComputation()
    }

    app.graph = {
      instance: graph,
      init: init,
      addNode: addNode,
      addLinks: addLinks,
      addOwners: addOwners
    }
  },
  view: (ctrl, args) => {
    return m('#graph')
  }
}
