
var graph = (function () {

var color = {blue: '#0072bb', green: '#159f0a', red: '#a83920', black: '#222e33'},
    root= window.location.pathname.replace(/\/gem\/(.*)/, '$1'),
    gems = null;

var graph = Viva.Graph.graph(),
    graphics = Viva.Graph.View.svgGraphics(),
    renderer = null;


function highlightRelatedNodes (nodeId, isOn) {
    graph.forEachLinkedNode(nodeId, function (node, link) {
        if (link && link.ui) {
            if (link.fromId == nodeId) {
                link.ui.attr('stroke', isOn ? color.red : 'gray');
            } else if (link.toId == nodeId) {
                link.ui.attr('stroke', isOn ? color.blue : 'gray');
            }
        }
    });
}

function customizeNodes () {
    graphics.node(function (node) {
        // Group of elements: http://www.w3.org/TR/SVG/struct.html
        var ui = Viva.Graph.svg('g');
        var text = Viva.Graph.svg('text').attr('y', '-8px').text(node.id);

        switch (node.data.type) {
            case 'root':
                var elem = Viva.Graph.svg('circle')
                    .attr('r', 9)
                    .attr('stroke-width', '0')
                    .attr('fill', color.blue)
                    .attr('type', 'root')
                    .attr('active', false);
                break;
            case 'gem':
                var elem = Viva.Graph.svg('circle')
                    .attr('r', 7)
                    .attr('stroke-width', '0')
                    .attr('fill', color.green)
                    .attr('type', 'gem')
                    .attr('active', false);
                break;
        }

        $(ui).hover(function (е) {
            if ($(this.children[1]).attr('active') == 'false') {
                this.children[1].attr('fill', color.red);
                highlightRelatedNodes(node.id, true);
            }
        }, function (e) {
            if ($(this.children[1]).attr('active') == 'false') {
                var clr = '';
                switch (node.data.type) {
                    case 'root': clr = color.blue; break;
                    case 'gem': clr = color.green; break;
                }
                this.children[1].attr('fill', clr);
                highlightRelatedNodes(node.id, false);
            }
        });

        $(elem).on('click', function (e) {
            $('body').trigger('click');
            $('#gem').show();
            $(this)
                .attr('fill', color.black)
                .attr('active', true);
            
            highlightRelatedNodes(node.id, true);
            console.log('selected %O', node.data);
            $('#gem').empty().append(template.gem.render(node.data));

            if (!node.data.owners) {
                ws.send(JSON.stringify({
                    message: 'owners',
                    gem: node.id,
                    id: ws.uuid
                }));
            }
            return false;
        });
        
        ui.append(text);
        elem.append('title').text(node.data.name);
        ui.append(elem);
        return ui;
    }).placeNode(function (nodeUI, pos) {
        nodeUI.attr('transform', 'translate(' + (pos.x - 0/2) + ',' + (pos.y - 0/2) + ')');
    });
}

function createMarkers () {
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
            .attr('fill', '#333');
    }
    var marker = createMarker('Triangle');
        marker.append('path').attr('d', 'M 0 0 L 10 5 L 0 10 z');
    
    var defs = graphics.getSvgRoot().append('defs');
    defs.append(marker);
    
    var geom = Viva.Graph.geom(); 
    
    graphics.link(function (link){
        return Viva.Graph.svg('path')
                .attr('stroke', 'gray')
                .attr('marker-end', 'url(#Triangle)');
    }).placeLink(function (linkUI, fromPos, toPos) {
        var toNodeSize = 14,
            fromNodeSize = 14;
            
        var from = geom.intersectRect(
            // rectangle:
            fromPos.x - fromNodeSize / 2 + 2, // left
            fromPos.y - fromNodeSize / 2 + 2, // top
            fromPos.x + fromNodeSize / 2 - 2, // right
            fromPos.y + fromNodeSize / 2 - 2, // bottom
            // segment:
            fromPos.x, fromPos.y, toPos.x, toPos.y) 
                || fromPos; // if no intersection found - return center of the node
        
        var to = geom.intersectRect(
            // rectangle:
            toPos.x - toNodeSize / 2 + 2, // left
            toPos.y - toNodeSize / 2 + 2, // top
            toPos.x + toNodeSize / 2 - 2, // right
            toPos.y + toNodeSize / 2 - 2, // bottom
            // segment:
            toPos.x, toPos.y, fromPos.x, fromPos.y) 
                || toPos; // if no intersection found - return center of the node
                    
        var data = 'M' + from.x + ',' + from.y +
                    'L' + to.x + ',' + to.y;
        
        linkUI.attr("d", data);
    });
}

function addNode (gem) {
    gem.type = (gem.name == root) ? 'root' : 'gem';
    graph.addNode(gem.name, gem);
    $('.nodes-count').text(graph.getNodesCount());
}

function addLinks (gems) {
    var keys = Object.keys(gems),
        index = 0;
    var timeout = window.setInterval(function () {
        if (index == keys.length) {
            window.clearInterval(timeout);
            $('circle[type=root]').trigger('click');
            $('.loading-graph').hide();
            return;
        }
        var gem = gems[keys[index++]];
        for (var i=0; i < gem.dependencies.runtime.length; i++) {
            graph.addLink(gem.name, gem.dependencies.runtime[i].name);
        }
        $('.links-count').text(graph.getLinksCount());
    }, 50);
}

function init () {
    customizeNodes();

    renderer = Viva.Graph.View.renderer(graph, {
        container: document.getElementById('graph'),
        graphics: graphics
    });
    renderer.run();

    createMarkers();
}

function addOwners (gem, owners) {
    var node = graph.getNode(gem);
    node.data.owners = owners;
    if ($('.gem h2 a').text() == gem)
        $('#gem ul').prepend(template.owners.render({owners: owners}));
}

return {
    color: color,
    init: init,
    addNode: addNode,
    addLinks: addLinks,
    addOwners: addOwners
}

}());
