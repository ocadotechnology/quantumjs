'use strict'

const chai = require('chai')
const path = require('path')
const docs = require('..')
const quantum = require('quantum-js')
const dom = require('quantum-dom')
const html = require('quantum-html')

const should = chai.should()

function transforms (selection) {
  return dom.create('div').text(selection.cs ? selection.cs() : selection)
}

const stylesheetAsset = dom.asset({
  url: '/assets/quantum-docs.css',
  file: path.join(__dirname, '../assets/quantum-docs.css'),
  shared: true
})

const scriptAsset = dom.asset({
  url: '/assets/quantum-docs.js',
  file: path.join(__dirname, '../assets/quantum-docs.js'),
  shared: true
})

describe('@topic', () => {
  it('should render as expected', () => {
    const selection = quantum.select({
      type: 'topic',
      params: ['My Topic'],
      content: [
        'Content'
      ]
    })

    docs.transforms().topic(selection, transforms).should.eql(
      dom.create('div')
        .class('qm-docs-topic')
        .add(stylesheetAsset)
        .add(dom.create('div').class('qm-docs-anchor').id('my-topic')
          .add(dom.create('div').class('qm-docs-topic-header')
            .text('My Topic')
            .add(dom.create('a').class('qm-docs-anchor-icon').attr('href', '#my-topic'))))
        .add(dom.create('div').class('qm-docs-topic-body').add(html.paragraphTransform(selection, transforms)))
    )
  })
})

describe('@section', () => {
  it('should render as expected', () => {
    const selection = quantum.select({
      type: 'section',
      params: ['My Section'],
      content: [
        'Content'
      ]
    })

    docs.transforms().section(selection, transforms).should.eql(
      dom.create('div')
        .class('qm-docs-section')
        .add(stylesheetAsset)
        .add(dom.create('div').class('qm-docs-anchor').id('my-section')
          .add(dom.create('div').class('qm-docs-section-header')
            .text('My Section')
            .add(dom.create('a').class('qm-docs-anchor-icon').attr('href', '#my-section'))))
        .add(dom.create('div').class('qm-docs-section-body').add(html.paragraphTransform(selection, transforms)))
    )
  })
})

describe('@subsection', () => {
  it('should render as expected', () => {
    const selection = quantum.select({
      type: 'subsection',
      params: ['My Sub Section'],
      content: [
        'Content'
      ]
    })

    docs.transforms().subsection(selection, transforms).should.eql(
      dom.create('div')
        .class('qm-docs-subsection')
        .add(stylesheetAsset)
        .add(dom.create('div').class('qm-docs-subsection-header').text('My Sub Section'))
        .add(dom.create('div').class('qm-docs-subsection-body').add(html.paragraphTransform(selection, transforms)))
    )
  })
})

describe('@notice', () => {
  it('should render as expected', () => {
    const selection = quantum.select({
      type: 'notice',
      params: ['My Notice', 'info'],
      content: [
        'Content'
      ]
    })

    docs.transforms().notice(selection, transforms).should.eql(
      dom.create('div')
        .class('qm-docs-notice qm-docs-info')
        .add(stylesheetAsset)
        .add(dom.create('div').class('qm-docs-notice-header').text('My Notice'))
        .add(dom.create('div').class('qm-docs-notice-body').add(html.paragraphTransform(selection, transforms)))
    )
  })

  it('should render without a title', () => {
    const selection = quantum.select({
      type: 'notice',
      params: [],
      content: [
        'Content'
      ]
    })

    docs.transforms().notice(selection, transforms).should.eql(
      dom.create('div')
        .class('qm-docs-notice')
        .add(stylesheetAsset)
        .add(dom.create('div').class('qm-docs-notice-header').text(''))
        .add(dom.create('div').class('qm-docs-notice-body').add(html.paragraphTransform(selection, transforms)))
    )
  })
})

describe('@list', () => {
  it('should render an unordered list', () => {
    const selection = quantum.select({
      type: 'list',
      params: [],
      content: [
        'Content',
        {type: 'item', params: [], content: ['Item 1']},
        'Content',
        {type: 'item', params: [], content: ['Item 2']}
      ]
    })

    docs.transforms().list(selection, transforms).should.eql(
      dom.create('ul')
        .class('qm-docs-list')
        .add(stylesheetAsset)
        .add(dom.create('li').add(html.paragraphTransform(quantum.select(selection.content()[1]), transforms)))
        .add(dom.create('li').add(html.paragraphTransform(quantum.select(selection.content()[3]), transforms)))
    )
  })

  it('should render an ordered list', () => {
    const selection = quantum.select({
      type: 'list',
      params: ['ordered'],
      content: [
        'Content',
        {type: 'item', params: [], content: ['Item 1']},
        'Content',
        {type: 'item', params: [], content: ['Item 2']}
      ]
    })

    docs.transforms().list(selection, transforms).should.eql(
      dom.create('ol')
        .class('qm-docs-list')
        .add(stylesheetAsset)
        .add(dom.create('li').add(html.paragraphTransform(quantum.select(selection.content()[1]), transforms)))
        .add(dom.create('li').add(html.paragraphTransform(quantum.select(selection.content()[3]), transforms)))
    )
  })
})

describe('@bold', () => {
  it('should render as expected', () => {
    const selection = quantum.select({
      type: 'bold',
      params: [],
      content: [
        'Content'
      ]
    })

    docs.transforms().bold(selection, transforms).should.eql(
      dom.create('b').add(dom.create('div').text('Content'))
    )
  })
})

describe('@italic', () => {
  it('should render as expected', () => {
    const selection = quantum.select({
      type: 'italic',
      params: [],
      content: [
        'Content'
      ]
    })

    docs.transforms().italic(selection, transforms).should.eql(
      dom.create('i').add(dom.create('div').text('Content'))
    )
  })
})

describe('@strikethrough', () => {
  it('should render as expected', () => {
    const selection = quantum.select({
      type: 'strikethrough',
      params: [],
      content: [
        'Content'
      ]
    })

    docs.transforms().strikethrough(selection, transforms).should.eql(
      dom.create('del').add(dom.create('div').text('Content'))
    )
  })
})

describe('@image', () => {
  it('should render as expected', () => {
    const selection = quantum.select({
      type: 'image',
      params: ['path/image.png'],
      content: [
        'Content'
      ]
    })

    docs.transforms().image(selection, transforms).should.eql(
      dom.create('img')
        .attr('src', 'path/image.png')
        .attr('alt', 'Content')
        .attr('title', 'Content')
    )
  })
})

describe('@summary', () => {
  it('should render as expected', () => {
    const selection = quantum.select({
      type: 'summary',
      params: ['Title'],
      content: []
    })

    docs.transforms().summary(selection, transforms).should.eql(
      dom.create('div')
        .class('qm-docs-summary')
        .add(stylesheetAsset)
        .add(dom.create('div').text('Title').class('qm-docs-summary-header'))
        .add(dom.create('div').class('qm-docs-summary-body'))
    )
  })

  it('should render a description', () => {
    const selection = quantum.select({
      type: 'summary',
      params: ['Title'],
      content: [
        {type: 'description', params: [], content: ['Description']}
      ]
    })

    docs.transforms().summary(selection, transforms).should.eql(
      dom.create('div')
        .class('qm-docs-summary')
        .add(stylesheetAsset)
        .add(dom.create('div').text('Title').class('qm-docs-summary-header'))
        .add(dom.create('div').class('qm-docs-summary-body')
          .add(dom.create('div').text('Description')))
    )
  })

  it('should render links', () => {
    const selection = quantum.select({
      type: 'summary',
      params: ['Title'],
      content: [
        {type: 'link', params: ['/link/somewhere'], content: ['Text']}
      ]
    })

    docs.transforms().summary(selection, transforms).should.eql(
      dom.create('div')
        .class('qm-docs-summary')
        .add(stylesheetAsset)
        .add(dom.create('div').text('Title').class('qm-docs-summary-header'))
        .add(dom.create('div').class('qm-docs-summary-body'))
        .add(dom.create('a').class('qm-docs-summary-link').attr('href', '/link/somewhere')
          .add(dom.create('span').text('Text'))
          .add(dom.create('i').class('fa fa-chevron-right qm-docs-summary-link-icon')))
    )
  })
})

describe('@group', () => {
  it('should render as expected', () => {
    const selection = quantum.select({
      type: 'group',
      params: [],
      content: [
        'Content'
      ]
    })

    docs.transforms().group(selection, transforms).should.eql(
      dom.create('div')
        .add(stylesheetAsset)
        .class('qm-docs-group')
        .add(dom.create('div').text('Content'))
    )
  })
})

describe('@versionSelector', () => {
  it('should return undefined when there are no versions', () => {
    const selection = quantum.select({
      type: 'versionSelector',
      params: [],
      content: []
    })

    should.not.exist(docs.transforms().versionSelector(selection, transforms))
  })

  it('should render as expected', () => {
    const selection = quantum.select({
      type: 'versionSelector',
      params: [],
      content: [
        {
          type: 'versionList',
          params: [],
          content: [
            {type: 'current', params: ['0.2.0'], content: []},
            {type: 'version', params: ['0.1.0'], content: []},
            {type: 'version', params: ['0.2.0'], content: []},
            {type: 'version', params: ['0.3.0'], content: []}
          ]
        }
      ]
    })

    const randomId = dom.randomId
    dom.randomId = function () {
      return 'fixed-id'
    }

    docs.transforms().versionSelector(selection, transforms).should.eql(
      dom.create('button')
        .id('fixed-id')
        .class('qm-docs-version-selector hx-btn')
        .add(stylesheetAsset)
        .add(dom.create('span').text('0.2.0'))
        .add(dom.create('i').class('fa fa-caret-down'))
        .add(dom.create('script').text('window.quantum.docs.createDropdown("fixed-id", ["0.1.0", "0.2.0", "0.3.0"], "0.2.0");', {escape: false}))
    )

    dom.randomId = randomId
  })
})

describe('@sidebar', () => {
  it('should render as expected', () => {
    const selection = quantum.select({
      type: 'sidebar',
      params: [],
      content: [
        'Content'
      ]
    })

    docs.transforms().sidebar(selection, transforms).should.eql(
      dom.create('div')
        .add(stylesheetAsset)
        .add(scriptAsset)
        .class('qm-docs-sidebar qm-docs-sidebar-left')
        .add(selection.transform(transforms))
        .add(dom.bodyClassed('qm-docs-sidebar-page', true))
    )
  })

  it('should render as expected (right)', () => {
    const selection = quantum.select({
      type: 'sidebar',
      params: ['right'],
      content: [
        'Content'
      ]
    })

    docs.transforms().sidebar(selection, transforms).should.eql(
      dom.create('div')
        .add(stylesheetAsset)
        .add(scriptAsset)
        .class('qm-docs-sidebar qm-docs-sidebar-right')
        .add(selection.transform(transforms))
        .add(dom.bodyClassed('qm-docs-sidebar-page', true))
    )
  })
})

describe('@tableOfContents', () => {
  it('should render as expected (empty)', () => {
    const selection = quantum.select({
      type: 'tableOfContents',
      params: [],
      content: []
    })

    docs.transforms().tableOfContents(selection, transforms).should.eql(
      dom.create('div')
        .class('qm-docs-table-of-contents')
        .add(stylesheetAsset)
        .add(dom.create('ul').class('qm-docs-table-of-contents-container'))
    )
  })

  it('should render as expected (with header)', () => {
    const selection = quantum.select({
      type: 'tableOfContents',
      params: ['Header'],
      content: []
    })

    docs.transforms().tableOfContents(selection, transforms).should.eql(
      dom.create('div')
        .class('qm-docs-table-of-contents')
        .add(stylesheetAsset)
        .add(dom.create('h1').text('Header'))
        .add(dom.create('ul').class('qm-docs-table-of-contents-container'))
    )
  })

  it('should render as expected (with topics and sections)', () => {
    const selection = quantum.select({
      type: 'tableOfContents',
      params: [],
      content: [
        {
          type: 'topic',
          params: ['Topic One'],
          content: [
            { type: 'section', params: ['Section One'], content: [] }
          ]
        },
        {
          type: 'topic',
          params: ['Topic Two'],
          content: [
            { type: 'section', params: ['Section One'], content: [] },
            { type: 'section', params: ['Section Two'], content: [] }
          ]
        }
      ]
    })

    docs.transforms().tableOfContents(selection, transforms).should.eql(
      dom.create('div')
        .class('qm-docs-table-of-contents')
        .add(stylesheetAsset)
        .add(dom.create('ul').class('qm-docs-table-of-contents-container')
          .add(dom.create('li').class('qm-docs-table-of-contents-topic-container')
            .add(dom.create('a')
              .class('qm-docs-table-of-contents-topic')
              .attr('href', '#topic-one')
              .text('Topic One'))
            .add(dom.create('ul')
              .add(dom.create('li').add(
                dom.create('a')
                  .class('qm-docs-table-of-contents-section')
                  .attr('href', '#section-one')
                  .text('Section One')
              ))))
          .add(dom.create('li').class('qm-docs-table-of-contents-topic-container')
            .add(dom.create('a')
              .class('qm-docs-table-of-contents-topic')
              .attr('href', '#topic-two')
              .text('Topic Two'))
            .add(dom.create('ul')
              .add(dom.create('li').add(
                dom.create('a')
                  .class('qm-docs-table-of-contents-section')
                  .attr('href', '#section-one')
                  .text('Section One')
              ))
              .add(dom.create('li').add(
                dom.create('a')
                  .class('qm-docs-table-of-contents-section')
                  .attr('href', '#section-two')
                  .text('Section Two')
              ))))
      )
    )
  })
})

describe('@navigationMenu', () => {
  it('should render as expected (empty)', () => {
    const selection = quantum.select({
      type: 'navigationMenu',
      params: [],
      content: []
    })

    docs.transforms().navigationMenu(selection, transforms).should.eql(
      dom.create('div')
        .add(stylesheetAsset)
        .class('qm-docs-navication-menu-wrapper')
        .add(dom.create('div').class('qm-docs-navication-menu'))
    )
  })

  it('should render as expected (with sections and pages)', () => {
    const selection = quantum.select({
      type: 'navigationMenu',
      params: [],
      content: [
        {
          type: 'section',
          params: ['Section One'],
          content: [
            { type: 'page', params: ['/page/one'], content: ['Page One'] }
          ]
        },
        {
          type: 'section',
          params: ['Section Two'],
          content: [
            { type: 'page', params: ['/page/one'], content: ['Page One'] },
            { type: 'page', params: ['/page/two'], content: ['Page Two'] }
          ]
        }
      ]
    })

    docs.transforms().navigationMenu(selection, transforms).should.eql(
      dom.create('div')
        .add(stylesheetAsset)
        .class('qm-docs-navication-menu-wrapper')
        .add(dom.create('div')
          .class('qm-docs-navication-menu')
          .add(dom.create('div').class('qm-docs-navication-menu-section')
            .add(dom.create('div').class('qm-docs-navication-menu-section-title').text('Section One'))
            .add(dom.create('div').class('qm-docs-navication-menu-section-body')
              .add(dom.create('a').class('qm-docs-navication-menu-page')
                .attr('href', '/page/one')
                .text('Page One'))
          ))
          .add(dom.create('div').class('qm-docs-navication-menu-section')
            .add(dom.create('div').class('qm-docs-navication-menu-section-title').text('Section Two'))
            .add(dom.create('div').class('qm-docs-navication-menu-section-body')
              .add(dom.create('a').class('qm-docs-navication-menu-page')
                .attr('href', '/page/one')
                .text('Page One'))
              .add(dom.create('a').class('qm-docs-navication-menu-page')
                .attr('href', '/page/two')
                .text('Page Two'))
          ))
      )

    )
  })
})

describe('@header', () => {
  it('should render as expected', () => {
    const selection = quantum.select({
      type: 'header',
      params: [],
      content: [
        { type: 'link', params: ['/link/one'], content: ['Link One'] },
        { type: 'link', params: ['/link/two'], content: ['Link Two'] }
      ]
    })

    docs.transforms().header(selection, transforms).should.eql(
      dom.create('div').class('qm-docs-header')
        .add(stylesheetAsset)
        .add(dom.create('div').class('qm-docs-centered')
          .add(dom.create('div').class('qm-docs-header-wrapper')
            .add(dom.create('div').class('qm-docs-header-title').text(selection.select('title').ps()))
            .add(dom.create('a')
              .class('qm-docs-header-link')
              .attr('href', '/link/one')
              .text('Link One'))
            .add(dom.create('a')
              .class('qm-docs-header-link')
              .attr('href', '/link/two')
              .text('Link Two'))
        ))
    )
  })
})

describe('@breadcrumb', () => {
  it('should return undefined if there are no items', () => {
    const selection = quantum.select({
      type: 'breadcrumb',
      params: [],
      content: []
    })

    should.not.exist(docs.transforms().breadcrumb(selection, transforms))
  })

  it('should render correctly', () => {
    const selection = quantum.select({
      type: 'breadcrumb',
      params: [],
      content: [
        { type: 'item', params: ['/link/one'], content: ['Link One'] },
        { type: 'item', params: ['/link/two'], content: ['Link Two'] }
      ]
    })

    docs.transforms().breadcrumb(selection, transforms).should.eql(
      dom.create('div')
        .class('qm-docs-breadcrumb')
        .add(stylesheetAsset)
        .add(dom.create('div')
          .class('qm-docs-top-section-centered qm-docs-breadcrumb-padding')
          .add(dom.create('a').attr('href', '/link/one').class('qm-docs-breadcrumb-section').text('Link One'))
          .add(dom.create('i').class('fa fa-angle-right qm-docs-breadcrumb-arrow-icon'))
          .add(dom.create('a').attr('href', '/link/two').class('qm-docs-breadcrumb-section').text('Link Two')))
    )
  })
})

describe('@topSection', () => {
  it('should render correctly', () => {
    const selection = quantum.select({
      type: 'topSection',
      params: [],
      content: []
    })

    docs.transforms().topSection(selection, transforms).should.eql(
      dom.create('div').class('qm-docs-top-section')
        .add(stylesheetAsset)
        .add(docs.transforms().breadcrumb(selection.select('breadcrumb'), transforms))
        .add(dom.create('div').class('qm-docs-top-section-centered qm-docs-top-section-banner')
          .add(dom.create('div').class('qm-docs-top-section-title').text(''))
          .add(dom.create('div').class('qm-docs-top-section-description')
            .add(html.paragraphTransform(selection.select('description'), transforms))))
    )
  })

  it('should render correctly (with title)', () => {
    const selection = quantum.select({
      type: 'topSection',
      params: [],
      content: [
        {type: 'title', params: ['Title'], content: []}
      ]
    })

    docs.transforms().topSection(selection, transforms).should.eql(
      dom.create('div').class('qm-docs-top-section')
        .add(dom.head(dom.create('title').attr('name', 'Title'), {id: 'title'}))
        .add(stylesheetAsset)
        .add(docs.transforms().breadcrumb(selection.select('breadcrumb'), transforms))
        .add(dom.create('div').class('qm-docs-top-section-centered qm-docs-top-section-banner')
          .add(dom.create('div').class('qm-docs-top-section-title').text('Title'))
          .add(dom.create('div').class('qm-docs-top-section-description')
            .add(html.paragraphTransform(selection.select('description'), transforms))))
    )
  })

  it('should render correctly (with source)', () => {
    const selection = quantum.select({
      type: 'topSection',
      params: [],
      content: [
        {type: 'source', params: ['/source/link'], content: ['Suggest edit']}
      ]
    })

    docs.transforms().topSection(selection, transforms).should.eql(
      dom.create('div').class('qm-docs-top-section')
        .add(stylesheetAsset)
        .add(docs.transforms().breadcrumb(selection.select('breadcrumb'), transforms))
        .add(dom.create('div').class('qm-docs-top-section-centered qm-docs-top-section-banner')
          .add(dom.create('a').class('qm-docs-top-section-source').attr('href', '/source/link').text('Suggest edit'))
          .add(dom.create('div').class('qm-docs-top-section-title').text(''))
          .add(dom.create('div').class('qm-docs-top-section-description')
            .add(html.paragraphTransform(selection.select('description'), transforms))))
    )
  })

  it('should render correctly (with description)', () => {
    const selection = quantum.select({
      type: 'topSection',
      params: [],
      content: [
        {type: 'description', params: [], content: ['Some content']}
      ]
    })

    docs.transforms().topSection(selection, transforms).should.eql(
      dom.create('div').class('qm-docs-top-section')
        .add(stylesheetAsset)
        .add(docs.transforms().breadcrumb(selection.select('breadcrumb'), transforms))
        .add(dom.create('div').class('qm-docs-top-section-centered qm-docs-top-section-banner')
          .add(dom.create('div').class('qm-docs-top-section-title').text(''))
          .add(dom.create('div').class('qm-docs-top-section-description')
            .add(html.paragraphTransform(selection.select('description'), transforms))))
    )
  })
})

describe('@contentSection', () => {
  it('should render as expected', () => {
    const selection = quantum.select({
      type: 'contentSection',
      params: [],
      content: [
        'Content'
      ]
    })

    docs.transforms().contentSection(selection, transforms).should.eql(
      dom.create('div').class('qm-docs-content-section-container')
        .add(stylesheetAsset)
        .add(dom.create('div').class('qm-docs-content-section')
          .add(dom.create('div').class('qm-docs-centered')
            .add(selection.transform(transforms))))
    )
  })
})

describe('@bottomSection', () => {
  it('should render as expected', () => {
    const selection = quantum.select({
      type: 'bottomSection',
      params: [],
      content: [
        'Content'
      ]
    })

    docs.transforms().bottomSection(selection, transforms).should.eql(
      dom.create('div').class('qm-docs-bottom-section')
        .add(stylesheetAsset)
        .add(selection.transform(transforms))
    )
  })
})

describe('@relatedButtons', () => {
  it('should render as expected', () => {
    const selection = quantum.select({
      type: 'relatedButtons',
      params: [],
      content: [
        {
          type: 'button',
          params: ['/link/1'],
          content: [
            {type: 'title', params: [], content: ['Title 1']},
            {type: 'description', params: [], content: ['Description 1']}
          ]
        },
        {
          type: 'button',
          params: ['/link/2'],
          content: [
            {type: 'title', params: [], content: ['Title 2']},
            {type: 'description', params: [], content: ['Description 2']}
          ]
        }
      ]
    })

    docs.transforms().relatedButtons(selection, transforms).should.eql(
      dom.create('div')
        .class('qm-docs-related-buttons')
        .add(stylesheetAsset)
        .add(dom.create('a')
          .attr('href', '/link/1')
          .class('qm-docs-related-button')
          .add(dom.create('div')
            .add(dom.create('div').class('qm-docs-related-button-title').text('Title 1'))
            .add(dom.create('div').class('qm-docs-related-button-description').text('Description 1'))))
        .add(dom.create('a')
          .attr('href', '/link/2')
          .class('qm-docs-related-button')
          .add(dom.create('div')
            .add(dom.create('div').class('qm-docs-related-button-title').text('Title 2'))
            .add(dom.create('div').class('qm-docs-related-button-description').text('Description 2'))))
    )
  })
})

describe('@table', () => {
  it('should render as expected', () => {
    const selection = quantum.select({
      type: 'table',
      params: [],
      content: [
        {
          type: 'header',
          params: [],
          content: [
            {type: 'cell', params: [], content: ['Cell1']},
            {type: 'cell', params: [], content: ['Cell2']},
            {type: 'cell', params: [], content: ['Cell3']}
          ]
        },
        {
          type: 'row',
          params: [],
          content: [
            {type: 'cell', params: [], content: ['Cell4']},
            {type: 'cell', params: [], content: ['Cell5']},
            {type: 'cell', params: [], content: ['Cell6']}
          ]
        },
        {
          type: 'header',
          params: [],
          content: [
            {type: 'cell', params: [], content: ['Cell7']},
            {type: 'cell', params: [], content: ['Cell8']},
            {type: 'cell', params: [], content: ['Cell9']}
          ]
        }
      ]
    })

    docs.transforms().table(selection, transforms).should.eql(
      dom.create('table')
        .class('qm-docs-table')
        .add(stylesheetAsset)
        .add(dom.create('tr')
          .add(dom.create('th').add(html.paragraphTransform(quantum.select({type: 'cell', params: [], content: ['Cell1']}), transforms)))
          .add(dom.create('th').add(html.paragraphTransform(quantum.select({type: 'cell', params: [], content: ['Cell2']}), transforms)))
          .add(dom.create('th').add(html.paragraphTransform(quantum.select({type: 'cell', params: [], content: ['Cell3']}), transforms))))
        .add(dom.create('tr')
          .add(dom.create('td').add(html.paragraphTransform(quantum.select({type: 'cell', params: [], content: ['Cell4']}), transforms)))
          .add(dom.create('td').add(html.paragraphTransform(quantum.select({type: 'cell', params: [], content: ['Cell5']}), transforms)))
          .add(dom.create('td').add(html.paragraphTransform(quantum.select({type: 'cell', params: [], content: ['Cell6']}), transforms))))
        .add(dom.create('tr')
          .add(dom.create('th').add(html.paragraphTransform(quantum.select({type: 'cell', params: [], content: ['Cell7']}), transforms)))
          .add(dom.create('th').add(html.paragraphTransform(quantum.select({type: 'cell', params: [], content: ['Cell8']}), transforms)))
          .add(dom.create('th').add(html.paragraphTransform(quantum.select({type: 'cell', params: [], content: ['Cell9']}), transforms))))
    )
  })
})
