
var cheerio = require('cheerio')
var rb = require('./rubygems')


exports.owners = (path, done) => {
  rb.scrape(path, (err, res, body) => {
    if (err) {
      done(err)
      return
    }

    var $ = cheerio.load(body)

    $('.gem__owners a').each(function (index) {
      $(this).attr('target', '_blank')
      var path = $(this).attr('href')
      $(this).attr('href', 'http://rubygems.org' + path)
    })

    done(null, $('<div>').append($('.gem__owners')).html())
  })
}
