'use strict'

// A middleware to render pages based on layouts and page contents.

/**
* Module dependencies.
*/

const debug = require('debug')('koa-grey-matter-views'),
dirname = require('path').dirname,
extname = require('path').extname,
join = require('path').join,
resolve = require('path').resolve,
readFileSync = require('fs').readFileSync,
matter = require('gray-matter'),
ejs = require('ejs')

/**
 * Add `render` method.
 *
 * @param {String} path
 * @param {Object} opts (optional)
 * @api public
 */
module.exports = (opts) => {

  opts = opts || {}

  opts = Object.assign({}, {
    contents: opts.contents || __dirname + '/contents',       // default directory name for page contents
    layouts: opts.layouts || __dirname + '/layouts',         // default directory name for layouts
    extension: 'ejs'            // default file extension
  }, opts)

  console.log('options: %j', opts)
  debug('options: %j', opts)

  return function* (next) {

    if (this.render) yield next

    /**
     * Render `page` with `locals`
     *
     * @param {String} page
     * @param {Object} locals
     * @return {GeneratorFunction}
     * @api public
     */
    this.render = function (page, locals) {
      if (locals == null) {
        locals = {}
      }

      let ext = (extname(page) || '.' + opts.extension).slice(1),
      fm = matter.read( opts.contents + '/' + page + '.' + ext ),
      contents = ejs.render(fm.content, locals),
      layout = readFileSync(opts.layouts + '/' + fm.data.layout + '.ejs').toString()

      return ejs.render(layout, Object.assign({}, locals, fm.data, { contents }))
    }

    yield next
  }
}
