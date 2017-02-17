'use strict'

const path = require('path')
const dom = require('quantum-dom')

const assets = [
  dom.asset({
    url: '/quantum-api.css',
    filename: path.join(__dirname, '../../assets/quantum-api.css'),
    shared: true
  }),
  dom.asset({
    url: '/quantum-api.js',
    filename: path.join(__dirname, '../../assets/quantum-api.js'),
    shared: true
  })
]

module.exports = function transforms (options) {
  const builders = (options || {}).builders || []
  const languages = (options || {}).languages || []
  return (selection, transformer) => {
    return dom.create('div')
      .class('qm-api')
      .add(builders.map(builder => builder(selection, transformer)))
      .add(assets)
      .add(languages.map(l => l.assets))
  }
}
