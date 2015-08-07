# quantum

## About

This module contains the parser, the selection api and an api for constructing ast.

## Example


    var quantum = require('quantum')

    quantum.read('index.um')         // read in a markup file
      .map(html())                   // convert to virtual dom
      .map(html.stringify())         // convert to a html string
      .map(quantum.write('target'))  // write the result to the target directory


## Api


### quantum.read(glob: Array[String]/String, [options])

Args
    glob: This can either be an array of glob strings or a glob string. This selects the files to process
    options: {
      inline: true,      // whether or not to follow inline links
      loader: <function> // function that takes a filename and returns a promise with the contents of the file
    }

  Returns a promise that yields an array of objects of the form:

    {
      filename: "path/to/file.um",  // relative to the rootDirectory
      content: <parsed-content>     // which is an object
    }

### quantum.write(directory: String)

  Returns a function that can write a {filename, content} object to disk.

## Running the tests

    npm run test
    npm run coverage