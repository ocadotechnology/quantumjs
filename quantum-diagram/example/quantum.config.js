const quantum = require('quantum-js')
const html = require('quantum-html')
const diagram = require('..') // normally require('quantum-diagram')

const htmlTransforms = {
  html: html.entityTransforms(),
  diagram: diagram.entityTransforms()
}

module.exports = {
  pipeline: [
    html({entityTransforms: htmlTransforms}),
    html.build()
  ],
  pages: 'index.um'
}
