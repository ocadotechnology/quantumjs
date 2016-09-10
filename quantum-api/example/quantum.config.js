const html = require('quantum-html')
const api = require('quantum-api')

const apiOptions = {
  types: {
    String: 'https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String',
    Number: 'https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number',
    Boolean: 'https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean',
    Node: 'https://developer.mozilla.org/en/docs/Web/API/Node',
    Element: 'https://developer.mozilla.org/en/docs/Web/API/Element',
    HTMLElement: 'https://developer.mozilla.org/en/docs/Web/API/HTMLElement',
    SVGElement: 'https://developer.mozilla.org/en/docs/Web/API/SVGElement',
    Date: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date'
  }
}

const htmlTransforms = {
  html: html.transforms(),
  api: api.transforms(apiOptions)
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
