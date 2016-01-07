# quantum-html

## About

This module contains the transform that converts from the ast to virtual dom, and a transform for converting from virtual dom to a html string.

Also included are some renderers that render common html elements.

## Example


    var quantum = require('quantum')
    var html    = require('quantum-html')

    quantum.read('index.um')         // read in a markup file
      .map(html())                   // convert to virtual dom
      .map(html.stringify())         // convert to a html string
      .map(quantum.write('target'))  // write the result to the target directory


## Api


### html([renderers])

  Args

    renderers: An object whose properties are functions which transform ast into virtual dom. Nested object definitions can also be used to achieve namespacing.

  Returns a function which transforms from ast to virtual dom:

  Example:

    var quantum = require('quantum')
    var html    = require('quantum-html')
    var hexagon = require('quantum-html-hexagon')
    var api     = require('quantum-html-api')

    // namespace each of the modules we are including
    // this means we can do things like @hx.collapsible
    var htmlTransforms = {
      html: html.transforms,
      hx: hexagon,
      api: api
    }

    quantum.read('index.um')
      .map(html(htmlTransforms))
      .map(html.stringify())
      .map(quantum.write('target'))

### html.stringify()

  Returns a function that converts from virtual dom into a html string.

## Running the tests

    npm run test
    npm run coverage