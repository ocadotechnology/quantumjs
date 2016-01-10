var quantum = require('quantum-js')
var html = require('quantum-html')
var api = require('quantum-api')

var apiOptions = {
  types: {
    'String': 'https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String',
    'Number': 'https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number',
    'Boolean': 'https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean',
    'Node': 'https://developer.mozilla.org/en/docs/Web/API/Node',
    'Element': 'https://developer.mozilla.org/en/docs/Web/API/Element',
    'HTMLElement': 'https://developer.mozilla.org/en/docs/Web/API/HTMLElement',
    'SVGElement': 'https://developer.mozilla.org/en/docs/Web/API/SVGElement',
    'Date': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date'
  }
}

var htmlTransforms = {
  html: html.transforms,
  api: api(apiOptions)
}

quantum.read('index.um')
  .map(html(htmlTransforms))
  .map(html.stringify())
  .map(quantum.write('target'))
