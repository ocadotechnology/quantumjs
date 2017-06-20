describe('entityTransforms', () => {
  const path = require('path')
  const quantum = require('quantum-core')
  const dom = require('quantum-dom')
  const { stylesheetAsset } = require('quantum-code-highlight')
  const { entityTransforms } = require('..')

  it('provides the correct entityTransforms', () => {
    entityTransforms().should.have.keys(['markdown'])
    entityTransforms().markdown.should.be.a('function')
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

    entityTransforms().markdown(selection).should.eql(
      dom.create('div').class('qm-markdown')
        .add('<h1 class="qm-header-font">H1<a class="qm-docs-anchor-icon" id="h1" href="#h1"></a></h1>\n<h2 class="qm-header-font">H2<a class="qm-docs-anchor-icon" id="h2" href="#h2"></a></h2>\n<h3 class="qm-header-font">H3<a class="qm-docs-anchor-icon" id="h3" href="#h3"></a></h3>\n<h4 class="qm-header-font">H4<a class="qm-docs-anchor-icon" id="h4" href="#h4"></a></h4>\n<h5 class="qm-header-font">H5<a class="qm-docs-anchor-icon" id="h5" href="#h5"></a></h5>\n<h6 class="qm-header-font">H6<a class="qm-docs-anchor-icon" id="h6" href="#h6"></a></h6>\n')
        .add(dom.asset({
          url: '/quantum-markdown.css',
          filename: path.join(__dirname, '../assets/quantum-markdown.css'),
          shared: true
        }))
        .add(stylesheetAsset)
    )
  })
})
