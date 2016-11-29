const quantum = require('quantum-js')
const html = require('quantum-html')
const diagram = require('..') // normally require('quantum-diagram')

const htmlTransforms = {
  html: html.transforms(),
  diagram: diagram.transforms()
}

module.exports = {
  pipeline: [
    html({transforms: htmlTransforms}),
    html.build()
  ],
  pages: 'index.um'
}
