describe('transforms', () => {
  const path = require('path')
  const quantum = require('quantum-js')
  const dom = require('quantum-dom')
  const { stylesheetAsset } = require('quantum-code-highlight')
  const { transforms } = require('..')

  it('provides the correct transforms', () => {
    transforms().should.have.keys(['markdown'])
    transforms().markdown.should.be.a('function')
  })

  it('render some basic markdown', () => {
    const selection = quantum.select({
      type: 'markdown',
      params: [],
      content: [
        '# H1',
        '## H2',
        '### H3',
        '#### H4',
        '##### H5',
        '###### H6'
      ]
    })

    transforms().markdown(selection).should.eql(
      dom.create('div').class('qm-markdown')
        .add('<h1>H1<a class="qm-docs-anchor-icon" id="h1" href="#h1"></a></h1>\n<h2>H2<a class="qm-docs-anchor-icon" id="h2" href="#h2"></a></h2>\n<h3>H3<a class="qm-docs-anchor-icon" id="h3" href="#h3"></a></h3>\n<h4>H4<a class="qm-docs-anchor-icon" id="h4" href="#h4"></a></h4>\n<h5>H5<a class="qm-docs-anchor-icon" id="h5" href="#h5"></a></h5>\n<h6>H6<a class="qm-docs-anchor-icon" id="h6" href="#h6"></a></h6>\n')
        .add(dom.asset({
          url: '/quantum-markdown.css',
          filename: path.join(__dirname, '../assets/quantum-markdown.css'),
          shared: true
        }))
        .add(stylesheetAsset)
    )
  })

  it('links duplicate headings correctly', () => {
    const selection = quantum.select({
      type: 'markdown',
      params: [],
      content: [
        '# Heading 1',
        '## Heading 2',
        '### Example',
        '## Heading 3',
        '### Example',
        '## Heading 4',
        '### Example'
      ]
    })

    transforms().markdown(selection).should.eql(
      dom.create('div').class('qm-markdown')
        .add('<h1>Heading 1<a class="qm-docs-anchor-icon" id="heading-1" href="#heading-1"></a></h1>\n<h2>Heading 2<a class="qm-docs-anchor-icon" id="heading-2" href="#heading-2"></a></h2>\n<h3>Example<a class="qm-docs-anchor-icon" id="example" href="#example"></a></h3>\n<h2>Heading 3<a class="qm-docs-anchor-icon" id="heading-3" href="#heading-3"></a></h2>\n<h3>Example<a class="qm-docs-anchor-icon" id="example-1" href="#example-1"></a></h3>\n<h2>Heading 4<a class="qm-docs-anchor-icon" id="heading-4" href="#heading-4"></a></h2>\n<h3>Example<a class="qm-docs-anchor-icon" id="example-2" href="#example-2"></a></h3>\n')
        .add(dom.asset({
          url: '/quantum-markdown.css',
          filename: path.join(__dirname, '../assets/quantum-markdown.css'),
          shared: true
        }))
        .add(stylesheetAsset)
    )
  })

  it('render highlighted code', () => {
    const selection = quantum.select({
      type: 'markdown',
      params: [],
      content: [
        '`inline code`',
        '```js',
        'const thing = 1;',
        '```'
      ]
    })

    transforms().markdown(selection).should.eql(
      dom.create('div').class('qm-markdown')
        .add('<p><code class="qm-code-font ">inline code</code></p>\n<pre><code class="qm-code-font lang-js"><span class="hljs-keyword">const</span> thing = <span class="hljs-number">1</span>;\n</code></pre>\n')
        .add(dom.asset({
          url: '/quantum-markdown.css',
          filename: path.join(__dirname, '../assets/quantum-markdown.css'),
          shared: true
        }))
        .add(stylesheetAsset)
    )
  })
})
