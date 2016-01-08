var quantum = require('quantum-js')
var html = require('quantum-html')
var diagram = require('..') // normally require('quantum-diagram')

var diagramOptions = {}

var htmlTransforms = {
  html: html.transforms,
  diagram: diagram(diagramOptions)
}

quantum.read('index.um')
  .map(html(htmlTransforms))
  .map(html.stringify())
  .map(quantum.write('target'))
