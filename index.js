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
      hljs = require('highlight.js'),
      Remarkable = require('remarkable'),
      cons = require('consolidate');

/**
* Add `view` method.
*
* @param {Object} opts (optional)
* @api public
*/
module.exports = function(opts) {

  opts = opts || {};

  opts = Object.assign({}, {
    engine: opts.engine || 'handlebars',
    pages: opts.pages ||  './pages',        // default directory name for pages
    layouts: opts.layouts ||'./layouts',     // default directory name for layouts
    defaults: opts.defaults || {},           // default variables to pass to layout
    markdown: Object.assign({
      html: true,
      highlight: function (str, lang) {
        try {
          return hljs.highlightAuto(str).value;
        } catch (err) {}
      }
    }, opts.markdown)
  }, opts);

  var md = new Remarkable(opts.markdown);

  /**
  * Render `page` with `locals`
  *
  * @param {String} partial
  * @return {GeneratorFunction}
  * @api public
  */
  async function serveView(ctx, partial) {

    var fm, layout, contents, type;

    if (fs.existsSync(join(opts.pages, partial) + '.md')) {
      fm = matter.read(join(opts.pages, partial) + '.md');
      type = 1;
    } else if (fs.existsSync(join(opts.pages, partial) + '.html')) {
      fm = matter.read( join(opts.pages, partial) + '.html');
      type = 2;
    } else {
      ctx.throw("Cannot find: "  + partial);
    }

    // render content template
    var viewData = Object.assign({}, opts.defaults, fm.data);
    contents = await cons[opts.engine].render(fm.content, viewData);

    // render markdown
    if (type === 1) {
      contents = md.render(contents);
    }

    // render layout
    ctx.body = await cons[opts.engine](
      join( opts.layouts, fm.data.layout),
      Object.assign({}, viewData, { contents: contents })
    );
  }


  return async function serve(ctx, next) {


    if (!ctx.serveView) ctx.serveView = async (partial) => await serveView(ctx, partial);

    try {
      if (ctx.path === '/') {
        await serveView(ctx, 'index');
      } else {
        try {
          await serveView(ctx, ctx.path.substr(1));
        } catch(e) {
          await serveView(ctx, ctx.path.substr(1) + '/index');
        }
      }

    } catch(e) {
      console.log('VIEW ERROR', e)
      await next;
    }

  };

}
