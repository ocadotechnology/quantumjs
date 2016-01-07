quantum-watch
=============

A glob watcher that handles @inline links

Example Use
-----------

    quantum.watch('**/*.um', {base: 'whatever'}, function(objs) {
      return objs
        .map(template())
        .map(html())
        .map(html.stringify())
        .map(quantum.write('dest'))
    })