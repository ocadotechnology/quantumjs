'use strict'

const path = require('path')
const dom = require('quantum-dom')

module.exports = function group (options) {
  const builders = (options || {}).builders || []
  return (selection, transforms) => {
    return dom.create('div')
      .class('qm-api')
      .add(builders.map(builder => builder(selection, transforms)))
      .add(dom.asset({
        url: '/quantum-api.css',
        file: path.join(__dirname, '../../assets/quantum-api.css'),
        shared: true
      }))
      .add(dom.asset({
        url: '/quantum-api.js',
        file: path.join(__dirname, '../../assets/quantum-api.js'),
        shared: true
      }))
  }
}
