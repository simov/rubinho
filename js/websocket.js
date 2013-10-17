
function guid () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}

if (window.location.pathname.indexOf('/gem') == 0)

var ws = (function () {
    var gem = window.location.pathname.replace(/\/gem\/(.*)/, '$1');
    
    // connect
    var ws = new WebSocket('ws://localhost:3001');
    ws.uuid = guid();

    ws.onopen = function () {
        ws.send(JSON.stringify({message: 'ping', id: ws.uuid}));
    }

    ws.onmessage = function (e) {
        var res = JSON.parse(e.data);
        switch (res.message) {
            case 'pong':
                console.log('pong');
                ws.send(JSON.stringify({message: 'gems', gem: gem, id: ws.uuid}));
                graph.init();
                break;
            case 'node':
                console.log('node %O', res.gem);
                graph.addNode(res.gem);
                break;
            case 'done':
                console.log('done %O', res.gems);
                graph.addLinks(res.gems);
                break;
            case 'owners':
                console.log('owners %O', {owners: res.owners});
                graph.addOwners(res.gem, res.owners);
                break;
        }
    }

    ws.onerror = function (error) {
        console.log(error);
    }

    return ws;
}());
