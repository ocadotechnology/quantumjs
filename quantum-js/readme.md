# quantum-js

The core module for the QuantumJS collection

This module contains the parser, the selection api and the watching api

See the full documentation here: https://quantum.hexagonjs.io.

## quantum.watch

Provides a glob watcher for quantum files that calls a callback when changes are
made. It keeps track of `@inline` entity references, allowing only the files
affected by a file change to be rebuilt.


### Api

```
var watch = require('quantum-watch')

// watches quantum files for changes, and changes in any files that are inlined with `@inline`
// options.dir - the directory that paths are given relative to
// options.dest - the root destination directory
// handler - a function that takes a parsed { file, content } quantum object
watch(<glob-objects>, options, handler): Promise[{build, events}]

// resolves <glob-objects> to a list of files
// options.dir - the directory that paths are given relative to
// options.dest - the root destination directory
watch.resolve(<glob-objects>, options): Promise[Array[filename]]

// watch standard files for changes
// options.dir - the directory that paths are given relative to
// options.dest - the root destination directory
watch.watcher(<glob-objects>, options): Promise[Watcher]

Watcher::on('add', function () { }) // when a file is added
Watcher::on('change', function () { }) // when a file is changed
Watcher::on('remove', function () { }) // when a file is removed
Watcher::files() // the list of files being watched
Watcher::stop() // stop watching

```

Where:

```
<glob-objects> = <glob-object> or Array[<glob-object>]
<glob-object> = <glob> or {
  files: <glob> or Array[glob],
  base: String, (optional)
  watch: Boolean (optional),
  dest: String (optional) - where within the dest folder the output should be placed (this option is only used in some cases)
}
<glob> = String - like `**/*.um` or `resources/*.jpg`. For more details/examples see https://github.com/isaacs/node-glob#glob-primer
```
