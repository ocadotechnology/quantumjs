const quantum = require('quantum-js')
const dot = require('./index.js')
const html = require('quantum-html')
const merge = require('merge')

const htmlTransforms = merge({
  html: html.transforms(),
  dot: dot.transforms()
})


module.exports = {
  pipeline: [html({ transforms: htmlTransforms })],
  htmlTransforms,
  pages: './*.um'
} 
