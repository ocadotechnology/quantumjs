|- watch multiple (or single) globs, each with their own base directory
|- watch quantum files
  |- emit an event when a file is changed (with parsed content)
  |- watch non-quantum inlined files for changes
  |- handle files being deleted
|- watch normal files
  |- emit an event when a file is changed (without content)
|- check package json dependencies for any unused ones
- tidy the code
- get to 100% coverage
- document

Api:
```
var watch = require('quantum-watch')

// resolves <glob-objects> to a list of files
// options.dir - the directory that paths are given relative to
// options.dest - the root destination directory
watch.resolve(<glob-objects>, options): Array[filename]

// watch standard files for changes
watch.watcher(<glob-objects>, options): Watcher

Watcher::on('add', function () { }) // when a file is added
Watcher::on('change', function () { }) // when a file is changed
Watcher::on('remove', function () { }) // when a file is removed

// more advanced watcher that follows inline links in quantum files and triggers a refresh of the parent when an inlined file is changed
watch(<glob-objects>, function (obj) {
  // do what you want with the parsed object
  return Promise.resolve(obj)
    .then(html())
    .then(quantum.write('target'))
})
```

Where:

```
<glob-objects> = <glob-object> or Array[<glob-object>]
<glob-object> = glob or {
  files: glob or Array[glob],
  base: string, (optional)
  watch: Boolean (optional),
  dest: string (optional) - where within the dest folder the output should be placed (only used in some cases)
}
```
