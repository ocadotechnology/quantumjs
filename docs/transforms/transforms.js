const dom = require('quantum-dom')

exports.sellingPoint = function (selection, transform) {
  return dom.create('div').class('selling-point')
    .add(dom.create('div').class('selling-point-title').text(selection.ps()))
    .add(dom.create('div').class('selling-point-text').add(selection.transform(transform)))
}
