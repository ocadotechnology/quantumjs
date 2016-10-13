const dom = require('quantum-dom')


exports.sellingPoint = (selection, transform) => {
  return dom.create('div').class('selling-point')
    .add(dom.create('div').class('selling-point-title').text(selection.ps()))
    .add(dom.create('div').class('selling-point-text').add(selection.transform(transform)))
}

exports.markdown = (selection, transform) => {
  const marked = require('marked')
  const path = require('path')

  marked.setOptions({
    pedantic: true
  })

  return dom.create('div').class('markdown-body')
    .add(marked(selection.cs()))
    .add(dom.asset({
      url: '/src/resources/markdown.css',
      file: path.join(__dirname, '../resources/markdown.css'),
      shared: true
    }))
}