const dom = require('quantum-dom')
const quantum = require('quantum-js')
function um (selection, transformer) {
  return quantum.select(quantum.parse(selection.cs())).transform(transformer)
}

function exampleFile (selection, transformer, fileName) {
  function addCodeSection (type, title) {
    if (selection.has(type)) {
      const subEntity = selection.select(type)

      const fake = quantum.select({
        content: [{
          type: 'codeblock',
          params: [type === 'config' ? 'js' : type],
          content: subEntity.content()
        }]
      })

      return dom.create('div').class('docs-example-code-section')
        .add(dom.create('div').class('docs-example-code-heading').text(fileName ? `${fileName} (${title})` : title))
        .add(fake.transform(transformer))
    }
  }

  const code = dom.create('div').class('docs-example-code-body')
    .add([
      addCodeSection('html', 'HTML'),
      addCodeSection('um', 'Quantum'),
      addCodeSection('js', 'Javascript'),
      addCodeSection('coffee', 'CoffeeScript'),
      addCodeSection('css', 'CSS'),
      addCodeSection('json', 'JSON')
    ])

  const result = selection.has('noOutput') ? undefined :
    selection.has('output') ?
      selection.select('output').transform(transformer) :
      selection.transform(transformer)

  return { code, result }
}

function example (selection, transformer) {
  const { code: codeBody, result: resultBody } = !selection.has('file') ? exampleFile(selection, transformer) :
    selection.selectAll('file').map(s => exampleFile(s, transformer, s.ps()))
      .reduce(({ code, result }, { code: newCode, result: newResult }) => {
        return { code: [...code, newCode], result: [...result, newResult] }
      }, { code: [], result: [] })

  const noOutput = selection.has('noOutput')

  const code = [
    dom.create('div').class('docs-example-heading qm-header-font').text(noOutput ? 'Example' : 'Example Markup'),
    dom.create('div').class('docs-example-code').add(codeBody)
  ]

  const result = noOutput ? undefined : [
    dom.create('div').class('docs-example-heading qm-header-font').text('Example Result'),
    dom.create('div').class('docs-example-body').add(selection.has('output') ? selection.select('output').transform(transformer) : resultBody)
  ]

  return dom.create('div').class('docs-example')
      .add(code)
      .add(result)
}

function transforms () {
  return Object.freeze({
    um,
    example
  })
}

module.exports = {
  transforms
}
