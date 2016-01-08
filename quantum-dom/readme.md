quantum-dom
===========

About
-----

A simple virtual dom used by quantum as part of the html generation process.

Example
-------

    var dom = require('quantum-dom')

    var page = dom()

    var body = page.create('body')
      .add(page.create('div').class('hx-header'))
      .add(page.create('div').class('hx-content'))

    var html = page.create('html')
      .add(page.create('head'))
      .add(body)

    /* outputs this:
      <html>
        <head></head>
        <body>
          <div class="hx-header"></div>
          <div class="hx-content"></div>
        </body>
      </html>
    */
    html.render()


Running the tests
-----------------

    npm run test
    npm run coverage