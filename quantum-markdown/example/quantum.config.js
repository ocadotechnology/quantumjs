const html = require('quantum-html')
const markdown = require('quantum-markdown')

const htmlTransforms = {
  html: html.transforms(),
  markdown: markdown.transforms()
}

function pipeline (page) {
  return Promise.resolve(page)
    .then(html({ transforms: htmlTransforms }))
    .then(html.stringify())
    .then(html.htmlRenamer())
}

module.exports = {
  pipeline: pipeline,
  pages: 'src/*.um',
  htmlTransforms: htmlTransforms
}
