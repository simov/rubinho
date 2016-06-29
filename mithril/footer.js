
var Footer = {
  view: () =>
    m('footer',
      m('p', [
        m('a[href="http://simov.github.io"][target="_blank"]', 'simov'),
        ' ↔ ',
        m('a[href="https://github.com/simov/rubinho"][target="_blank"]', 'rubinho')
      ])
    )
}
