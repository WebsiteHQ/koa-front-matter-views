'use strict'
// A middleware to render pages based on layouts and pages.

/**
* Module dependencies.
*/
const fs = require('fs'),
dirname = require('path').dirname,
extname = require('path').extname,
join = require('path').join,
resolve = require('path').resolve,
readFileSync = require('fs').readFileSync,
matter = require('gray-matter'),
Remarkable = require('remarkable'),
md = new Remarkable(),
cons = require('consolidate')

/**
* Add `view` method.
*
* @param {Object} opts (optional)
* @api public
*/
module.exports = function(opts) {

  opts = opts || {}

  opts = Object.assign({}, {
    engine: opts.engine || 'handlebars',
    pages: opts.pages ||  './pages',        // default directory name for pages
    layouts: opts.layouts ||'./layouts'   // default directory name for layouts
  }, opts)

  /**
  * Render `page` with `locals`
  *
  * @param {String} partial
  * @return {GeneratorFunction}
  * @api public
  */
  function* view(partial) {

    var fm, layout, contents;

    if (fs.existsSync(join(opts.pages, partial) + '.md')) {
      fm = matter.read(join(opts.pages, partial) + '.md')
      contents = md.render(fm.content)
    } else if (fs.existsSync(join(opts.pages, partial) + '.html')) {
      fm = matter.read( join(opts.pages, partial) + '.html')
      contents = yield cons[opts.engine].render(fm.content, {})
    } else {
      this.throw("Cannot find: "  + partial)
    }

    this.body = yield cons[opts.engine](
      join( opts.layouts, fm.data.layout),
      Object.assign({}, fm.data, { contents: contents })
    )
  }

  return function* serve(next) {

    if (!this.serveView) this.serveView = view.bind(this)

    try {
      if (this.path === '/') {
        yield view.call(this, 'index')
      } else {
        yield view.call(this, this.path.substr(1))
      }

    } catch(e) {
      console.error(e)
      yield next;
    }

  }

}
