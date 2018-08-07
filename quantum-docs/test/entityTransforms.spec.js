describe('entityTransforms', () => {
  const path = require('path')
  const quantum = require('quantum-core')
  const dom = require('quantum-dom')
  const html = require('quantum-html')
  const { entityTransforms } = require('..')
  const should = require('chai').should()

  function transformer (selection) {
    return dom.create('div').text(selection.cs ? selection.cs() : selection)
  }

  const stylesheetAsset = dom.asset({
    url: '/quantum-docs.css',
    filename: path.join(__dirname, '../assets/quantum-docs.css'),
    shared: true
  })

  const scriptAsset = dom.asset({
    url: '/quantum-docs.js',
    filename: path.join(__dirname, '../assets/quantum-docs.js'),
    shared: true
  })

  it('provides the correct entityTransforms', () => {
    const keys = [
      'topic',
      'section',
      'subsection',
      'notice',
      'list',
      'bold',
      'italic',
      'strikethrough',
      'image',
      'summary',
      'group',
      'versionSelector',
      'sidebarPage',
      'sidebar',
      'tableOfContents',
      'navigationMenu',
      'header',
      'breadcrumb',
      'topSection',
      'contentSection',
      'fullWidth',
      'bottomSection',
      'relatedButtons',
      'table'
    ]
    entityTransforms().should.have.keys(keys)
    keys.forEach(key => entityTransforms()[key].should.be.a('function'))
  })

  describe('@topic', () => {
    it('renders as expected', () => {
      const selection = quantum.select({
        type: 'topic',
        params: ['My Topic'],
        content: [
          'Content'
        ]
      })

      entityTransforms().topic(selection, transformer).should.eql(
        dom.create('div')
          .class('qm-docs-topic')
          .add(stylesheetAsset)
          .add(dom.create('div').class('qm-docs-anchor').id('my-topic')
            .add(dom.create('div').class('qm-docs-topic-header qm-header-font')
              .text('My Topic')
              .add(dom.create('a').class('qm-docs-anchor-icon').attr('href', '#my-topic'))))
          .add(dom.create('div').class('qm-docs-topic-body').add(html.paragraphTransform(selection, transformer)))
      )
    })
  })

  describe('@section', () => {
    it('renders as expected', () => {
      const selection = quantum.select({
        type: 'section',
        params: ['My Section'],
        content: [
          'Content'
        ]
      })

      entityTransforms().section(selection, transformer).should.eql(
        dom.create('div')
          .class('qm-docs-section')
          .add(stylesheetAsset)
          .add(dom.create('div').class('qm-docs-anchor').id('my-section')
            .add(dom.create('div').class('qm-docs-section-header qm-header-font')
              .text('My Section')
              .add(dom.create('a').class('qm-docs-anchor-icon').attr('href', '#my-section'))))
          .add(dom.create('div').class('qm-docs-section-body').add(html.paragraphTransform(selection, transformer)))
      )
    })
  })

  describe('@subsection', () => {
    it('renders as expected', () => {
      const selection = quantum.select({
        type: 'subsection',
        params: ['My Sub Section'],
        content: [
          'Content'
        ]
      })

      entityTransforms().subsection(selection, transformer).should.eql(
        dom.create('div')
          .class('qm-docs-subsection')
          .add(stylesheetAsset)
          .add(dom.create('div').class('qm-docs-subsection-header qm-header-font').text('My Sub Section'))
          .add(dom.create('div').class('qm-docs-subsection-body').add(html.paragraphTransform(selection, transformer)))
      )
    })
  })

  describe('@notice', () => {
    it('renders as expected', () => {
      const selection = quantum.select({
        type: 'notice',
        params: ['My Notice', 'info'],
        content: [
          'Content'
        ]
      })

      entityTransforms().notice(selection, transformer).should.eql(
        dom.create('div')
          .class('qm-docs-notice qm-docs-info')
          .add(stylesheetAsset)
          .add(dom.create('div').class('qm-docs-notice-header qm-header-font').text('My Notice'))
          .add(dom.create('div').class('qm-docs-notice-body').add(html.paragraphTransform(selection, transformer)))
      )
    })

    it('renders without a title', () => {
      const selection = quantum.select({
        type: 'notice',
        params: [],
        content: [
          'Content'
        ]
      })

      entityTransforms().notice(selection, transformer).should.eql(
        dom.create('div')
          .class('qm-docs-notice')
          .add(stylesheetAsset)
          .add(dom.create('div').class('qm-docs-notice-header qm-header-font').text(''))
          .add(dom.create('div').class('qm-docs-notice-body').add(html.paragraphTransform(selection, transformer)))
      )
    })
  })

  describe('@list', () => {
    it('renders an unordered list', () => {
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

      entityTransforms().list(selection, transformer).should.eql(
        dom.create('ul')
          .class('qm-docs-list')
          .add(stylesheetAsset)
          .add(dom.create('li').add(html.paragraphTransform(quantum.select(selection.content()[1]), transformer)))
          .add(dom.create('li').add(html.paragraphTransform(quantum.select(selection.content()[3]), transformer)))
      )
    })

    it('renders an ordered list', () => {
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

      entityTransforms().list(selection, transformer).should.eql(
        dom.create('ol')
          .class('qm-docs-list')
          .add(stylesheetAsset)
          .add(dom.create('li').add(html.paragraphTransform(quantum.select(selection.content()[1]), transformer)))
          .add(dom.create('li').add(html.paragraphTransform(quantum.select(selection.content()[3]), transformer)))
      )
    })
  })

  describe('@bold', () => {
    it('renders as expected', () => {
      const selection = quantum.select({
        type: 'bold',
        params: [],
        content: [
          'Content'
        ]
      })

      entityTransforms().bold(selection, transformer).should.eql(
        dom.create('b').add(dom.create('div').text('Content'))
      )
    })
  })

  describe('@italic', () => {
    it('renders as expected', () => {
      const selection = quantum.select({
        type: 'italic',
        params: [],
        content: [
          'Content'
        ]
      })

      entityTransforms().italic(selection, transformer).should.eql(
        dom.create('i').add(dom.create('div').text('Content'))
      )
    })
  })

  describe('@strikethrough', () => {
    it('renders as expected', () => {
      const selection = quantum.select({
        type: 'strikethrough',
        params: [],
        content: [
          'Content'
        ]
      })

      entityTransforms().strikethrough(selection, transformer).should.eql(
        dom.create('del').add(dom.create('div').text('Content'))
      )
    })
  })

  describe('@image', () => {
    it('renders as expected', () => {
      const selection = quantum.select({
        type: 'image',
        params: ['path/image.png'],
        content: [
          'Content'
        ]
      })

      entityTransforms().image(selection, transformer).should.eql(
        dom.create('img')
          .attr('src', 'path/image.png')
          .attr('alt', 'Content')
          .attr('title', 'Content')
      )
    })

    it('uses the width attribute', () => {
      const selection = quantum.select({
        type: 'image',
        params: ['path/image.png'],
        content: [
          'Content',
          {
            type: 'width',
            params: ['500px'],
            content: []
          }
        ]
      })

      entityTransforms().image(selection, transformer).should.eql(
        dom.create('img')
          .attr('src', 'path/image.png')
          .attr('alt', 'Content')
          .attr('title', 'Content')
          .attr('width', '500px')
      )
    })

    it('uses the height attribute', () => {
      const selection = quantum.select({
        type: 'image',
        params: ['path/image.png'],
        content: [
          'Content',
          {
            type: 'height',
            params: ['500px'],
            content: []
          }
        ]
      })

      entityTransforms().image(selection, transformer).should.eql(
        dom.create('img')
          .attr('src', 'path/image.png')
          .attr('alt', 'Content')
          .attr('title', 'Content')
          .attr('height', '500px')
      )
    })

    it('uses the title attribute', () => {
      const selection = quantum.select({
        type: 'image',
        params: ['path/image.png'],
        content: [
          'Content',
          {
            type: 'title',
            params: [],
            content: ['something']
          }
        ]
      })

      entityTransforms().image(selection, transformer).should.eql(
        dom.create('img')
          .attr('src', 'path/image.png')
          .attr('alt', 'something')
          .attr('title', 'something')
      )
    })
  })

  describe('@summary', () => {
    it('renders as expected', () => {
      const selection = quantum.select({
        type: 'summary',
        params: ['Title'],
        content: []
      })

      entityTransforms().summary(selection, transformer).should.eql(
        dom.create('div')
          .class('qm-docs-summary')
          .add(stylesheetAsset)
          .add(dom.create('div').text('Title').class('qm-docs-summary-header qm-header-font'))
          .add(dom.create('div').class('qm-docs-summary-body'))
      )
    })

    it('renders a description', () => {
      const selection = quantum.select({
        type: 'summary',
        params: ['Title'],
        content: [
          {type: 'description', params: [], content: ['Description']}
        ]
      })

      entityTransforms().summary(selection, transformer).should.eql(
        dom.create('div')
          .class('qm-docs-summary')
          .add(stylesheetAsset)
          .add(dom.create('div').text('Title').class('qm-docs-summary-header qm-header-font'))
          .add(dom.create('div').class('qm-docs-summary-body')
            .add(dom.create('div').text('Description')))
      )
    })

    it('renders links', () => {
      const selection = quantum.select({
        type: 'summary',
        params: ['Title'],
        content: [
          {type: 'link', params: ['/link/somewhere'], content: ['Text']}
        ]
      })

      entityTransforms().summary(selection, transformer).should.eql(
        dom.create('div')
          .class('qm-docs-summary')
          .add(stylesheetAsset)
          .add(dom.create('div').text('Title').class('qm-docs-summary-header qm-header-font'))
          .add(dom.create('div').class('qm-docs-summary-body'))
          .add(dom.create('a').class('qm-docs-summary-link').attr('href', '/link/somewhere')
            .add(dom.create('span').text('Text'))
            .add(dom.create('i').class('fa fa-chevron-right qm-docs-summary-link-icon')))
      )
    })
  })

  describe('@group', () => {
    it('renders as expected', () => {
      const selection = quantum.select({
        type: 'group',
        params: [],
        content: [
          'Content'
        ]
      })

      entityTransforms().group(selection, transformer).should.eql(
        dom.create('div')
          .add(stylesheetAsset)
          .class('qm-docs-group')
          .add(dom.create('div').text('Content'))
      )
    })
  })

  describe('@versionSelector', () => {
    it('returns undefined when there are no versions', () => {
      const selection = quantum.select({
        type: 'versionSelector',
        params: [],
        content: []
      })

      should.not.exist(entityTransforms().versionSelector(selection, transformer))
    })

    it('renders as expected', () => {
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
      const versionSelectorAsset = dom.asset({
        type: 'js',
        content: 'window.quantum.docs.createDropdown("fixed-id", ["0.1.0", "0.2.0", "0.3.0"], "0.2.0");'
      })

      entityTransforms().versionSelector(selection, transformer).should.eql(
        dom.create('select')
          .id('fixed-id')
          .class('qm-docs-version-selector')
          .add(stylesheetAsset)
          .add(scriptAsset)
          .add(versionSelectorAsset)

      )

      dom.randomId = randomId
    })
  })

  describe('@sidebar', () => {
    it('renders as expected', () => {
      const selection = quantum.select({
        type: 'sidebar',
        params: [],
        content: [
          'Content'
        ]
      })

      entityTransforms().sidebar(selection, transformer).should.eql(
        dom.create('div')
          .add(stylesheetAsset)
          .add(scriptAsset)
          .class('qm-docs-sidebar')
          .add(selection.transform(transformer))
      )
    })
  })

  describe('@sidebarPage', () => {
    it('renders as expected', () => {
      const selection = quantum.select({
        type: 'sidebarPage',
        params: [],
        content: [
          {
            type: 'sidebar',
            params: [],
            content: [
              'Content1'
            ]
          },
          {
            type: 'content',
            params: [],
            content: [
              'Content2'
            ]
          }
        ]
      })

      function innerTransformer (selection) {
        const type = quantum.isSelection(selection) ? selection.type() : undefined
        if (type === 'sidebar') {
          return entityTransforms().sidebar(selection, transformer)
        } else {
          return transformer(selection)
        }
      }

      entityTransforms().sidebarPage(selection, innerTransformer).should.eql(
        dom.create('div').class('qm-docs-sidebar-page')
          .add(stylesheetAsset)
          .add(dom.create('div')
            .add(stylesheetAsset)
            .add(scriptAsset)
            .class('qm-docs-sidebar')
            .add(dom.create('div').text('Content1')))
          .add(dom.create('div').class('qm-docs-content-section-container')
            .add(dom.create('div').text('Content2')))
          .add(dom.bodyClassed('qm-docs-sidebar-page', true))
      )
    })
  })

  describe('@tableOfContents', () => {
    it('renders as expected (empty)', () => {
      const selection = quantum.select({
        type: 'tableOfContents',
        params: [],
        content: []
      })

      entityTransforms().tableOfContents(selection, transformer).should.eql(
        dom.create('div')
          .class('qm-docs-table-of-contents')
          .add(stylesheetAsset)
          .add(dom.create('ul').class('qm-docs-table-of-contents-container'))
      )
    })

    it('renders as expected (with header)', () => {
      const selection = quantum.select({
        type: 'tableOfContents',
        params: ['Header'],
        content: []
      })

      entityTransforms().tableOfContents(selection, transformer).should.eql(
        dom.create('div')
          .class('qm-docs-table-of-contents')
          .add(stylesheetAsset)
          .add(dom.create('h1').text('Header'))
          .add(dom.create('ul').class('qm-docs-table-of-contents-container'))
      )
    })

    it('renders as expected (with topics and sections)', () => {
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

      entityTransforms().tableOfContents(selection, transformer).should.eql(
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
    it('renders as expected (empty)', () => {
      const selection = quantum.select({
        type: 'navigationMenu',
        params: [],
        content: []
      })

      entityTransforms().navigationMenu(selection, transformer).should.eql(
        dom.create('div')
          .add(stylesheetAsset)
          .class('qm-docs-navigation-menu-wrapper')
          .add(dom.create('div').class('qm-docs-navigation-menu'))
      )
    })

    it('renders as expected (with sections and pages)', () => {
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

      entityTransforms().navigationMenu(selection, transformer).should.eql(
        dom.create('div')
          .add(stylesheetAsset)
          .class('qm-docs-navigation-menu-wrapper')
          .add(dom.create('div')
            .class('qm-docs-navigation-menu')
            .add(dom.create('div').class('qm-docs-navigation-menu-section')
              .add(dom.create('div').class('qm-docs-navigation-menu-section-title').text('Section One'))
              .add(dom.create('div').class('qm-docs-navigation-menu-section-body')
                .add(dom.create('a').class('qm-docs-navigation-menu-page')
                  .attr('href', '/page/one')
                  .text('Page One'))
              ))
            .add(dom.create('div').class('qm-docs-navigation-menu-section')
              .add(dom.create('div').class('qm-docs-navigation-menu-section-title').text('Section Two'))
              .add(dom.create('div').class('qm-docs-navigation-menu-section-body')
                .add(dom.create('a').class('qm-docs-navigation-menu-page')
                  .attr('href', '/page/one')
                  .text('Page One'))
                .add(dom.create('a').class('qm-docs-navigation-menu-page')
                  .attr('href', '/page/two')
                  .text('Page Two'))
              ))
          )

      )
    })
  })

  describe('@header', () => {
    it('renders as expected', () => {
      const randomId = dom.randomId
      dom.randomId = function () {
        return 'fixed-id'
      }
      const selection = quantum.select({
        type: 'header',
        params: [],
        content: [
          { type: 'link', params: ['/link/one'], content: ['Link One'] },
          { type: 'link', params: ['/link/two'], content: ['Link Two'] }
        ]
      })

      entityTransforms().header(selection, transformer).should.eql(
        dom.create('div').class('qm-docs-header')
          .add(dom.create('div').class('qm-docs-centered')
            .add(dom.create('div').class('qm-docs-header-wrapper')
              .add(dom.create('div').class('qm-docs-header-title qm-header-font').text(selection.select('title').ps()))
              .add(dom.create('div').class('qm-docs-header-mobile-menu').id('nav.toggle.fixed-id')
                .add(dom.create('i').class('qm-docs-header-mobile-menu-icon')))
              .add(dom.create('div').class('qm-docs-header-links').id('nav.links.fixed-id')
                .add(dom.create('a')
                  .class('qm-docs-header-link')
                  .attr('href', '/link/one')
                  .text('Link One'))
                .add(dom.create('a')
                  .class('qm-docs-header-link')
                  .attr('href', '/link/two')
                  .text('Link Two')))
            ))
          .add(stylesheetAsset)
          .add(scriptAsset)
          .add(dom.asset({
            type: 'js',
            content: 'window.quantum.docs.createHeaderToggle("fixed-id");'
          }))
      )
      dom.randomId = randomId
    })

    it('renders with an icon', () => {
      const randomId = dom.randomId
      dom.randomId = function () {
        return 'fixed-id'
      }
      const selection = quantum.select({
        type: 'header',
        params: [],
        content: [
          { type: 'link', params: ['/link/one'], content: ['Link One'] },
          { type: 'link', params: ['/link/two'], content: ['Link Two'] },
          { type: 'icon', params: ['/path/to/icon.png'], content: [] }
        ]
      })

      entityTransforms().header(selection, transformer).should.eql(
        dom.create('div').class('qm-docs-header')
          .add(dom.create('div').class('qm-docs-centered')
            .add(dom.create('div').class('qm-docs-header-wrapper')
              .add(dom.create('image').class('qm-docs-header-logo').attr('src', selection.select('icon').ps()))
              .add(dom.create('div').class('qm-docs-header-title qm-header-font').text(selection.select('title').ps()))
              .add(dom.create('div').class('qm-docs-header-mobile-menu').id('nav.toggle.fixed-id')
                .add(dom.create('i').class('qm-docs-header-mobile-menu-icon')))
              .add(dom.create('div').class('qm-docs-header-links').id('nav.links.fixed-id')
                .add(dom.create('a')
                  .class('qm-docs-header-link')
                  .attr('href', '/link/one')
                  .text('Link One'))
                .add(dom.create('a')
                  .class('qm-docs-header-link')
                  .attr('href', '/link/two')
                  .text('Link Two')))
            ))
          .add(stylesheetAsset)
          .add(scriptAsset)
          .add(dom.asset({
            type: 'js',
            content: 'window.quantum.docs.createHeaderToggle("fixed-id");'
          }))
      )
      dom.randomId = randomId
    })

    it('renders with an icon and icon link', () => {
      const randomId = dom.randomId
      dom.randomId = function () {
        return 'fixed-id'
      }
      const selection = quantum.select({
        type: 'header',
        params: [],
        content: [
          { type: 'link', params: ['/link/one'], content: ['Link One'] },
          { type: 'link', params: ['/link/two'], content: ['Link Two'] },
          { type: 'icon', params: ['/path/to/icon.png', '/somewhere.html'], content: [] }
        ]
      })

      entityTransforms().header(selection, transformer).should.eql(
        dom.create('div').class('qm-docs-header')
          .add(dom.create('div').class('qm-docs-centered')
            .add(dom.create('div').class('qm-docs-header-wrapper')
              .add(dom.create('a').class('qm-docs-header-logo-link')
                .attr('href', selection.select('icon').param(1))
                .add(dom.create('image').class('qm-docs-header-logo').attr('src', selection.select('icon').param(0))))
              .add(dom.create('div').class('qm-docs-header-title qm-header-font').text(selection.select('title').ps()))
              .add(dom.create('div').class('qm-docs-header-mobile-menu').id('nav.toggle.fixed-id')
                .add(dom.create('i').class('qm-docs-header-mobile-menu-icon')))
              .add(dom.create('div').class('qm-docs-header-links').id('nav.links.fixed-id')
                .add(dom.create('a')
                  .class('qm-docs-header-link')
                  .attr('href', '/link/one')
                  .text('Link One'))
                .add(dom.create('a')
                  .class('qm-docs-header-link')
                  .attr('href', '/link/two')
                  .text('Link Two')))
            ))
          .add(stylesheetAsset)
          .add(scriptAsset)
          .add(dom.asset({
            type: 'js',
            content: 'window.quantum.docs.createHeaderToggle("fixed-id");'
          }))
      )
      dom.randomId = randomId
    })
  })

  describe('@breadcrumb', () => {
    it('returns undefined if there are no items', () => {
      const selection = quantum.select({
        type: 'breadcrumb',
        params: [],
        content: []
      })

      should.not.exist(entityTransforms().breadcrumb(selection, transformer))
    })

    it('renders correctly', () => {
      const selection = quantum.select({
        type: 'breadcrumb',
        params: [],
        content: [
          { type: 'item', params: ['/link/one'], content: ['Link One'] },
          { type: 'item', params: ['/link/two'], content: ['Link Two'] }
        ]
      })

      entityTransforms().breadcrumb(selection, transformer).should.eql(
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
    it('renders correctly', () => {
      const selection = quantum.select({
        type: 'topSection',
        params: [],
        content: []
      })

      entityTransforms().topSection(selection, transformer).should.eql(
        dom.create('div').class('qm-docs-top-section')
          .add(stylesheetAsset)
          .add(entityTransforms().breadcrumb(selection.select('breadcrumb'), transformer))
          .add(dom.create('div').class('qm-docs-top-section-centered qm-docs-top-section-banner')
            .add(dom.create('div').class('qm-docs-top-section-title qm-header-font').text(''))
            .add(dom.create('div').class('qm-docs-top-section-description')
              .add(html.paragraphTransform(selection.select('description'), transformer))))
      )
    })

    it('renders correctly (with title)', () => {
      const selection = quantum.select({
        type: 'topSection',
        params: [],
        content: [
          {type: 'title', params: ['Title'], content: []}
        ]
      })

      entityTransforms().topSection(selection, transformer).should.eql(
        dom.create('div').class('qm-docs-top-section')
          .add(dom.head(dom.create('title').text('Title'), {id: 'title'}))
          .add(stylesheetAsset)
          .add(entityTransforms().breadcrumb(selection.select('breadcrumb'), transformer))
          .add(dom.create('div').class('qm-docs-top-section-centered qm-docs-top-section-banner')
            .add(dom.create('div').class('qm-docs-top-section-title qm-header-font').text('Title'))
            .add(dom.create('div').class('qm-docs-top-section-description')
              .add(html.paragraphTransform(selection.select('description'), transformer))))
      )
    })

    it('renders correctly (with source)', () => {
      const selection = quantum.select({
        type: 'topSection',
        params: [],
        content: [
          {type: 'source', params: ['/source/link'], content: ['Suggest edit']}
        ]
      })

      entityTransforms().topSection(selection, transformer).should.eql(
        dom.create('div').class('qm-docs-top-section')
          .add(stylesheetAsset)
          .add(entityTransforms().breadcrumb(selection.select('breadcrumb'), transformer))
          .add(dom.create('div').class('qm-docs-top-section-centered qm-docs-top-section-banner')
            .add(dom.create('a').class('qm-docs-top-section-source').attr('href', '/source/link').text('Suggest edit'))
            .add(dom.create('div').class('qm-docs-top-section-title qm-header-font').text(''))
            .add(dom.create('div').class('qm-docs-top-section-description')
              .add(html.paragraphTransform(selection.select('description'), transformer))))
      )
    })

    it('renders correctly (with description)', () => {
      const selection = quantum.select({
        type: 'topSection',
        params: [],
        content: [
          {type: 'description', params: [], content: ['Some content']}
        ]
      })

      entityTransforms().topSection(selection, transformer).should.eql(
        dom.create('div').class('qm-docs-top-section')
          .add(stylesheetAsset)
          .add(entityTransforms().breadcrumb(selection.select('breadcrumb'), transformer))
          .add(dom.create('div').class('qm-docs-top-section-centered qm-docs-top-section-banner')
            .add(dom.create('div').class('qm-docs-top-section-title qm-header-font').text(''))
            .add(dom.create('div').class('qm-docs-top-section-description')
              .add(html.paragraphTransform(selection.select('description'), transformer))))
      )
    })
  })

  describe('@contentSection', () => {
    it('renders as expected', () => {
      const selection = quantum.select({
        type: 'contentSection',
        params: [],
        content: [
          'Content'
        ]
      })

      entityTransforms().contentSection(selection, transformer).should.eql(
        dom.create('div')
          .class('qm-docs-content-section')
          .add(stylesheetAsset)
          .add(selection.transform(transformer))
      )
    })
  })

  describe('@fullWidth', () => {
    it('renders as expected', () => {
      const selection = quantum.select({
        type: 'fullWidth',
        params: [],
        content: [
          'Content'
        ]
      })

      entityTransforms().fullWidth(selection, transformer).should.eql(
        dom.create('div')
          .class('qm-docs-full-width')
          .add(selection.transform(transformer)))
    })
  })

  describe('@bottomSection', () => {
    it('renders as expected', () => {
      const selection = quantum.select({
        type: 'bottomSection',
        params: [],
        content: [
          'Content'
        ]
      })

      entityTransforms().bottomSection(selection, transformer).should.eql(
        dom.create('div').class('qm-docs-bottom-section')
          .add(stylesheetAsset)
          .add(selection.transform(transformer))
      )
    })
  })

  describe('@relatedButtons', () => {
    it('renders as expected', () => {
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

      entityTransforms().relatedButtons(selection, transformer).should.eql(
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
    it('renders as expected', () => {
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

      entityTransforms().table(selection, transformer).should.eql(
        dom.create('table')
          .class('qm-docs-table')
          .add(dom.create('thead').class('qm-header-font')
            .add(dom.create('tr')
              .add(dom.create('th').add(html.paragraphTransform(quantum.select({type: 'cell', params: [], content: ['Cell1']}), transformer)))
              .add(dom.create('th').add(html.paragraphTransform(quantum.select({type: 'cell', params: [], content: ['Cell2']}), transformer)))
              .add(dom.create('th').add(html.paragraphTransform(quantum.select({type: 'cell', params: [], content: ['Cell3']}), transformer))))
            .add(dom.create('tr')
              .add(dom.create('th').add(html.paragraphTransform(quantum.select({type: 'cell', params: [], content: ['Cell7']}), transformer)))
              .add(dom.create('th').add(html.paragraphTransform(quantum.select({type: 'cell', params: [], content: ['Cell8']}), transformer)))
              .add(dom.create('th').add(html.paragraphTransform(quantum.select({type: 'cell', params: [], content: ['Cell9']}), transformer)))))
          .add(dom.create('tbody')
            .add(dom.create('tr')
              .add(dom.create('td').add(html.paragraphTransform(quantum.select({type: 'cell', params: [], content: ['Cell4']}), transformer)))
              .add(dom.create('td').add(html.paragraphTransform(quantum.select({type: 'cell', params: [], content: ['Cell5']}), transformer)))
              .add(dom.create('td').add(html.paragraphTransform(quantum.select({type: 'cell', params: [], content: ['Cell6']}), transformer)))))
          .add(stylesheetAsset)
      )
    })

    it('copes with having no rows', () => {
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

      entityTransforms().table(selection, transformer).should.eql(
        dom.create('table')
          .class('qm-docs-table')
          .add(dom.create('thead').class('qm-header-font')
            .add(dom.create('tr')
              .add(dom.create('th').add(html.paragraphTransform(quantum.select({type: 'cell', params: [], content: ['Cell1']}), transformer)))
              .add(dom.create('th').add(html.paragraphTransform(quantum.select({type: 'cell', params: [], content: ['Cell2']}), transformer)))
              .add(dom.create('th').add(html.paragraphTransform(quantum.select({type: 'cell', params: [], content: ['Cell3']}), transformer))))
            .add(dom.create('tr')
              .add(dom.create('th').add(html.paragraphTransform(quantum.select({type: 'cell', params: [], content: ['Cell7']}), transformer)))
              .add(dom.create('th').add(html.paragraphTransform(quantum.select({type: 'cell', params: [], content: ['Cell8']}), transformer)))
              .add(dom.create('th').add(html.paragraphTransform(quantum.select({type: 'cell', params: [], content: ['Cell9']}), transformer)))))
          .add(stylesheetAsset)
      )
    })

    it('copes with having no headers', () => {
      const selection = quantum.select({
        type: 'table',
        params: [],
        content: [
          {
            type: 'row',
            params: [],
            content: [
              {type: 'cell', params: [], content: ['Cell4']},
              {type: 'cell', params: [], content: ['Cell5']},
              {type: 'cell', params: [], content: ['Cell6']}
            ]
          }
        ]
      })

      entityTransforms().table(selection, transformer).should.eql(
        dom.create('table')
          .class('qm-docs-table')
          .add(dom.create('tbody')
            .add(dom.create('tr')
              .add(dom.create('td').add(html.paragraphTransform(quantum.select({type: 'cell', params: [], content: ['Cell4']}), transformer)))
              .add(dom.create('td').add(html.paragraphTransform(quantum.select({type: 'cell', params: [], content: ['Cell5']}), transformer)))
              .add(dom.create('td').add(html.paragraphTransform(quantum.select({type: 'cell', params: [], content: ['Cell6']}), transformer)))))
          .add(stylesheetAsset)
      )
    })
  })
})
