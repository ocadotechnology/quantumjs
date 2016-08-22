const quantum = require('quantum-js')
const html = require('quantum-html')
const diagram = require('..') // normally require('quantum-diagram')

const htmlTransforms = {
  html: html.transforms,
  diagram: diagram()
}

quantum.read('index.um')
  .map(html({transforms: htmlTransforms}))
  .map(html.stringify())
  .map(quantum.write('target'))
