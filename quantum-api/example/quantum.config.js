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
  html: html.entityTransforms(),
  api: api.entityTransforms(apiOptions)
}

module.exports = {
  pipeline: [
    html({ entityTransforms: htmlTransforms }),
    html.build(),
    html.htmlRenamer()
  ],
  pages: 'src/*.um',
  htmlTransforms: htmlTransforms
}
