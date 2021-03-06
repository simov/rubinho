
var CustomGraph = (args) => {
  var graph = Viva.Graph.graph()
  var graphics = Viva.Graph.View.svgGraphics()

  // color scheme
  var colors = {
    root: '#086788',
    node: '#06AED5',
    active: '#DD1C1A',
    hover: '#F0C808',
    link: '#808080',
    from: '#DD1C1A',
    to: '#06AED5'
  }

  var events = {
    // on hover over node
    over: (e) => {
      e.target.attr('fill', colors.hover)
      highlightRelatedLinks(e.target.attr('gem'))
    },
    // on hover out of node
    out: (e) => {
      var color
      if (e.target.attr('active') === 'true') {
        color = colors.active
      }
      else if (e.target.attr('type') === 'root') {
        color = colors.root
      }
      else if (e.target.attr('type') === 'node') {
        color = colors.node
      }
      e.target.attr('fill', color)
      highlightRelatedLinks(
        document.querySelector('circle[active=true]').attr('gem'))
    },
    // on click node
    click: (e) => {
      // reset nodes
      document.querySelectorAll('circle').forEach((node) => {
        var color = node.attr('type') === 'root'
          ? colors.root : colors.node
        node.attr('fill', color).attr('active', false)
      })

      // set active node
      e.target
        .attr('fill', colors.active)
        .attr('active', true)

      highlightRelatedLinks(e.target.attr('gem'))
    },
  }

  // executed every time a new node or link is added to the graph
  var custom = {
    node: () => {
      graphics
        .node((node) => {
          // SVG group of elements: http://www.w3.org/TR/SVG/struct.html
          var group = Viva.Graph.svg('g')

          var text = Viva.Graph.svg('text')
            .attr('y', '-10px')
            .attr('style', 'display: ' + (args.showNames ? 'block' : 'none'))
            .text(node.id)
          group.append(text)

          var elem
          if (node.data.type === 'root') {
            elem = Viva.Graph.svg('circle')
              .attr('r', 9)
              .attr('stroke-width', 0)
              .attr('fill', colors.root)
              .attr('gem', node.id)
              .attr('type', 'root')
              .attr('active', false)
          }
          else if (node.data.type === 'node') {
            elem = Viva.Graph.svg('circle')
              .attr('r', 7)
              .attr('stroke-width', 0)
              .attr('fill', colors.node)
              .attr('gem', node.id)
              .attr('type', 'node')
              .attr('active', false)
          }
          elem.append('title').text(node.id)
          elem.addEventListener('click', events.click)
          elem.addEventListener('mouseover', events.over)
          elem.addEventListener('mouseout', events.out)
          group.append(elem)

          return group
        })
        .placeNode((nodeUI, pos) => {
          nodeUI.attr('transform',
            'translate(' + (pos.x - 0/2) + ',' + (pos.y - 0/2) + ')')
        })
    },
    link: () => {
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
          .attr('stroke', colors.link)
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
            .attr('stroke', colors.link)
            .attr('marker-end', 'url(#Triangle)')
            .attr('id', link.id)
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

  function highlightRelatedLinks (id) {
    // reset links
    document.querySelectorAll('path').forEach((link) => {
      link.attr('stroke', colors.link)
    })

    graph.forEachLinkedNode(id, (node, link) => {
      var color
      if (link.fromId === id) {
        color = colors.from
      }
      else if (link.toId === id) {
        color = colors.to
      }
      document.querySelector('[id="' + link.id + '"]').attr('stroke', color)
    })
  }

  graph.run = () => {
    custom.node()

    var renderer = Viva.Graph.View.renderer(graph, {
      container: document.querySelector('#graph'),
      graphics: graphics
    })
    renderer.run()

    custom.link()
  }

  return graph
}
