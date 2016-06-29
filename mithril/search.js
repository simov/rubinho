
var Search = {
  view: (ctrl, args) => {
    var args = args || {}
    return m('input[placeholder="Search"]', args.gem || '')
  }
}
