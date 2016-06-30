
var Gem = {
  controller: function () {
    function guid () {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        var r = Math.random() * 16|0
        var v = c == 'x' ? r : (r&0x3|0x8)
        return v.toString(16)
      })
    }

    var gem = m.route.param('gem')

    // connect
    var ws = app.ws = new WebSocket('ws://localhost:3001')
    ws.uuid = guid()

    ws.onopen = () => {
      console.log('ping')
      ws.send(JSON.stringify({message: 'ping', id: ws.uuid}))
    }

    ws.onmessage = (e) => {
      var res = JSON.parse(e.data)
      if (res.message === 'pong') {
        console.log('pong')
        ws.send(JSON.stringify({message: 'gems', gem: gem, id: ws.uuid}))
        app.graph.run()
      }
      else if (res.message === 'node') {
        console.log('node %O', res.gem)
        app.graph.addNode(res.gem)
      }
      else if (res.message === 'done') {
        console.log('done %O', res.gems)
        app.graph.addLinks(res.gems)
      }
      else if (res.message === 'owners') {
        console.log('owners %O', {owners: res.owners})
        app.graph.addOwners(res.gem, res.owners)
      }
    }

    ws.onerror = (err) => console.log(err)
  },
  view: () => {
    var gem = app.gem

    if (!gem) {
      return m('div')
    }

    return (
    m('.gem', [
      m('.header', [
        m('h2', m('a[target="_blank"]', {href: gem.project_uri}, gem.name)),
        m('p.info', gem.info),
        m('code', 'gem install ' + gem.name)
      ]),
      m('ul', [
        (gem.owners || null) &&
        m('li', m('strong', 'Owners: '), m.trust(gem.owners)),
        m('li', m('strong', 'Downloads: '), m('em', gem.downloads)),
        m('li', m('strong', 'Authors: '), m('em', gem.authors)),
        m('li', m('strong', 'Version: '), m('em', gem.version)),
        m('li', m('strong', 'Licenses: '), m('em', gem.licenses.join(', '))),

        m('li', [
          m('strong', 'Resources: '),
          (gem.gem_uri || null) &&
          m('a[target="_blank"]', {href: gem.gem_uri}, m('em', 'gem')),
          (gem.source_code_uri || null) && [
            ' | ',
            m('a[target="_blank"]', {href: gem.source_code_uri}, m('em', 'source'))
          ],
          (gem.documentation_uri || null) && [
            ' | ',
            m('a[target="_blank"]', {href: gem.documentation_uri}, m('em', 'docs'))
          ]
        ])
      ])
    ]))
  }
}
