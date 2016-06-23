# quantum-js

The core module for the QuantumJS collection

This module contains the parser, the selection api and the watching api

See the full documentation here: https://quantum.hexagonjs.io.

## quantum.watch

Provides a glob watcher for quantum files that calls a callback when changes are
made. It keeps track of `@inline` entity references, allowing only the files
affected by a file change to be rebuilt.


### Api

    # core api
    quantum.build(config: Object): Promise
    quantum.watch(config: Object): Watcher

    Watcher::stop() - stops the watching

    # formatting files
    quantum.stringify(ast: <AST>, options: <format-options>): String
    quantum.format(markup: String, options: <format-options>): String

    # low level stuff
    quantum.parse(input: String, options: Object): <AST>
    quantum.read(filename: String, options: Object): Promise[<AST>]
    quantum.clone(ast: <AST>): <AST>


### Selection Api

    quantum.select(<entity>): Selection
    quantum.select(selection: Selection): Selection

    quantum.select.isEntity(Any): Boolean
    quantum.select.isText(Any): Boolean

    Selection::entity(): <entity>
    Selection::type(): String
    Selection::param(i: Int): String
    Selection::params(): Array[String]
    Selection::content(): Array[<entity>]
    Selection::has(type, options): Boolean
    Selection::hasParams(): Boolean
    Selection::hasContent(): Boolean
    Selection::isEmpty(): Boolean
    Selection::parent(): Selection
    Selection::ps(): String
    Selection::cs(): String

    // selection filtering
    Selection::select(type, {recursive: Boolean, required: Boolean}): Selection
    Selection::selectAll(type, {recursive: Boolean, required: Boolean}): Array[Selection]
    Selection::filter(predicate: Function): Selection
    Selection::filter(type: String): Selection
    Selection::filter(types: Array[String]): Selection

    // transforms
    Selection::transform(renderer: Function): Any

    // mutations (can't be performed on a filtered selection)
    Selection::type(type: String): Selection
    Selection::params(params: Array[String]): Selection
    Selection::param(i: Int, param: String): Selection
    Selection::content(content: Array[<entity>]): Selection
    Selection::ps(paramString): Selection
    Selection::cs(contentString: String): Selection
    Selection::remove(type: String or Array[String], {recursive: Boolean}): <entity> or undefined or Array[<entity>]
    Selection::removeAll(type: String or Array[String], {recursive: Boolean}): Array[<entity>] or Array[Array[<entity>]]
    Selection::add(<entity>): Selection
    Selection::add(text: String): Selection
    Selection::append(<entity>): Selection (selection of new element)
    Selection::addParam(param: String): Selection

### Built in pipeline transforms

    quantum.json(page: Page, options: Object): String






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
