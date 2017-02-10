const dom = require('quantum-dom')
const quantum = require('quantum-js')
function um (selection, transformer) {
  return quantum.select(quantum.parse(selection.cs())).transform(transformer)
}

function example (selection, transformer) {
  function addCodeSection (type, title) {
    if (selection.has(type)) {
      const subEntity = selection.select(type)

      const fake = quantum.select({
        content: [{
          type: 'codeblock',
          params: [type],
          content: subEntity.content()
        }]
      })

      return dom.create('div').class('docs-example-code-type')
        .add(dom.create('div').class('docs-example-code-heading').text(title))
        .add(fake.transform(transformer))
    }
  }

  const codeBody = dom.create('div').class('docs-example-code-body')
    .add([
      addCodeSection('html', 'HTML'),
      addCodeSection('um', 'Quantum'),
      addCodeSection('js', 'JavaScript'),
      addCodeSection('coffee', 'CoffeeScript'),
      addCodeSection('css', 'CSS'),
      addCodeSection('json', 'JSON')
    ])

  return dom.create('div').class('docs-example')
    .add(dom.create('div').class('docs-example-heading qm-header-font')
      .text('Example Markup'))
    .add(dom.create('div').class('docs-example-code')
      .add(codeBody))
    .add(dom.create('div').class('docs-example-heading qm-header-font')
      .text('Example Result'))
    .add(dom.create('div').class('docs-example-body')
      .add(selection.transform(transformer)))
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
