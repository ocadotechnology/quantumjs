const dom = require('quantum-dom')
const quantum = require('quantum-js')
const html = require('quantum-html')

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
        .add(dom.create('div').class('docs-example-code-block').add(fake.transform(transformer)))
    }
  }

  const code = dom.create('div').class('docs-example-code-body')
    .add([
      addCodeSection('nohighlight', 'Console'),
      addCodeSection('html', 'HTML'),
      addCodeSection('js', 'Javascript'),
      addCodeSection('css', 'CSS'),
      addCodeSection('json', 'JSON'),
      addCodeSection('um', 'Quantum')
    ])

  const output = selection.has('noOutput') ? undefined :
    selection.has('output') ?
      selection.select('output').transform(transformer) :
      selection.transform(transformer)

  const outputFile = selection.has('output') && selection.select('output').ps()
  if (outputFile && outputFile.length) {
    return {
      code,
      resultFile: {
        head: outputFile,
        body: output
      }
    }
  } else {
    return { code, result: output }
  }
}

/*
Mutli-file and language example transform

@example
  @noBackground    - Hide the background for the sections (explicitly true in @extra blocks)
  @noOutput        - Hide all output from example (e.g remove the Example Result section)

  @<type>          - langauge type, displays with '<Type>' heading (e.g. @js)) can have multiple types at once
    ...            - Code for example

  @file filename   - Define a file section, shows with <filename> (<Type>) instead of just <Type> heading
    @noOutput      - Don't output for this file (e.g. for JS with 'require' in it)
    @output        - Set the output of this file (combined with other files)
    @output [file] - Set the output of this file (with a file name, separated from other output)
    @@<type>       - Code for file

  @output          - Set the output of this example section

e.g.
@example
  @file quantum.config.js
    @noOutput
    @js
      <insert generic pipeline here>

  @file index.um
    @@um
      @h1: Heading

Outputs a block with rendered 'index.um' as well as codeblocks for the 'quantum.config.js' and 'index.um'
*/
function example (selection, transformer) {
  const { code: codeBody, result, resultFiles } = !selection.has('file') ? exampleFile(selection, transformer) :
    selection.selectAll('file').map(s => exampleFile(s, transformer, s.ps()))
      .reduce(({ code, result, resultFiles }, { code: newCode, result: newResult, resultFile: newResultFile }) => {
        return {
          code: newCode ? [...code, newCode] : code,
          result: newResult ? [...result, newResult] : result,
          resultFiles: newResultFile ? [...resultFiles, newResultFile] : resultFiles
        }
      }, { code: [], result: [], resultFiles: [] })

  const noOutput = selection.has('noOutput')

  const code = [
    dom.create('div').class('docs-example-heading qm-header-font').text(noOutput ? 'Example' : 'Example Markup'),
    dom.create('div').class('docs-example-code').add(codeBody)
  ]

  const transformedResult = noOutput ? undefined :
    dom.create('div').class('docs-example-body-section').add(selection.has('output') ?
      selection.select('output').transform(transformer) :
      result)

  const transformedResultFiles = noOutput || !resultFiles || (resultFiles && !resultFiles.length) ? undefined : resultFiles.map(({head, body}) => {
    return dom.create('div').class('docs-example-body-section')
      .add(dom.create('div').class('docs-example-body-heading').add(head))
      .add(body)
  })

  const resultHead = noOutput || (!transformedResult && !transformedResultFiles) ? undefined :
    dom.create('div').class('docs-example-heading qm-header-font').text('Example Result')

  const docsExample = dom.create('div').class('docs-example')
    .classed('docs-example-no-background', selection.has('noBackground'))
    .add(code)

  return docsExample
    .add(resultHead)
    .add(transformedResultFiles || transformedResult ? dom.create('div').class('docs-example-body')
      .add(transformedResultFiles || transformedResult) : undefined)
}

function customTransform (selection, transformer) {
  return html.paragraphTransform(selection, transformer)
}

function landingSection (selection, transformer) {
  return dom.create('div').class('landing-section')
    .add(dom.create('h2').class('landing-section__title')
      .add(selection.ps() || ''))
    .add(html.paragraphTransform(selection, transformer))
    .add(selection.has('last') ? undefined : dom.create('div').class('scroll-next-placeholder'))
    .add(selection.has('last') ? undefined : dom.create('div').class('scroll-next'))
}

function cheatsheetExample (selection, transformer) {
  return dom.create('div').class('docs-cheatsheet-example')
    .add(dom.create('div').class('docs-cheatsheet-example-code')
      .add(transformer(quantum.select({
        type: 'codeblock',
        params: ['um'],
        content: selection.content()
      }))))
    .add(dom.create('div').class('docs-cheatsheet-example-output')
      .add(quantum.select(quantum.parse(selection.cs())).transform(transformer)))
}

function transforms () {
  return Object.freeze({
    um,
    example,
    customTransform,
    landingSection,
    cheatsheetExample
  })
}

module.exports = {
  transforms
}
