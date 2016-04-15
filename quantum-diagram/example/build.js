var quantum = require('quantum-js')
var html = require('quantum-html')
var diagram = require('..') // normally require('quantum-diagram')

var htmlTransforms = {
  html: html.transforms,
  diagram: diagram()
}

quantum.read('index.um')
  .map(html({transforms: htmlTransforms}))
  .map(html.stringify())
  .map(quantum.write('target'))
