describe('changelog', () => {
  const quantum = require('quantum-js')
  const dom = require('quantum-dom')
  const html = require('quantum-html')

  const changelog = require('../../lib/entity-transforms/changelog')
  const { changeDom, createCollapsible } = changelog
  const should = require('chai').should()

  function transformer (selection) {
    return dom.create('div').text(selection.type())
  }

  function changelogBlock () {
    return dom.create('div').class('qm-changelog')
      .add(changelog.assets)
  }
  const testLanguage = {
    name: 'test-language',
    changelogHeaderTransforms: {
      name: (headerSelection, transformer) => {
        return dom.create('div').class('test-header').text(headerSelection.ps())
      }
    }
  }

  const options = {
    languages: []
  }

  const optionsWithLanguage = {
    languages: [testLanguage]
  }

  it('returns undefined if there is no content', () => {
    const selection = quantum.select({
      type: 'changelog',
      params: ['0.1.0'],
      content: []
    })

    should.not.exist(changelog()(selection, transformer))
  })

  it('displays a description', () => {
    const selection = quantum.select({
      type: 'changelog',
      params: ['0.1.0'],
      content: [
        {
          type: 'description',
          params: [],
          content: ['some description']
        }
      ]
    })

    changelog(options)(selection, transformer).should.eql(
      changelogBlock()
        .add(dom.create('div').class('qm-changelog-head qm-header-font').text('0.1.0'))
        .add(dom.create('div').class('qm-changelog-body')
          .add(dom.create('div').class('qm-changelog-description')
            .add(html.paragraphTransform(quantum.select({type: '', params: [], content: ['some description']})))))
    )
  })

  it('adds language assets to the page', () => {
    const selection = quantum.select({
      type: 'changelog',
      params: ['0.1.0'],
      content: [
        {
          type: 'description',
          params: [],
          content: ['some description']
        }
      ]
    })

    const testLanguage = {
      name: 'test-language',
      entityTypes: [],
      assets: [
        dom.asset({
          url: '/some-url',
          file: '/some-file'
        })
      ]
    }

    changelog({languages: [testLanguage]})(selection, transformer).should.eql(
      changelogBlock()
        .add(dom.asset({
          url: '/some-url',
          file: '/some-file'
        }))
        .add(dom.create('div').class('qm-changelog-head qm-header-font').text('0.1.0'))
        .add(dom.create('div').class('qm-changelog-body')
          .add(dom.create('div').class('qm-changelog-description')
            .add(html.paragraphTransform(quantum.select({type: '', params: [], content: ['some description']})))))
    )
  })

  it('turns the header into a link if a @link entity is found', () => {
    const selection = quantum.select({
      type: 'changelog',
      params: ['0.1.0'],
      content: [
        {
          type: 'link',
          params: ['link/to/0.1.0'],
          content: []
        },
        {
          type: 'description',
          params: [],
          content: ['some description']
        }
      ]
    })

    changelog(options)(selection, transformer).should.eql(
      changelogBlock()
        .add(dom.create('div').class('qm-changelog-head qm-header-font')
          .add(dom.create('div').class('qm-changelog-link')
            .add(dom.create('a').attr('href', 'link/to/0.1.0').text('0.1.0'))))
        .add(dom.create('div').class('qm-changelog-body')
          .add(dom.create('div').class('qm-changelog-description')
            .add(html.paragraphTransform(quantum.select({type: '', params: [], content: ['some description']})))))
    )
  })

  it('displays an entry', () => {
    const selection = quantum.select({
      type: 'changelog',
      params: ['0.1.0'],
      content: [
        {
          type: 'entry',
          params: ['EntryName'],
          content: []
        }
      ]
    })

    changelog(options)(selection, transformer).should.eql(
      changelogBlock()
        .add(dom.create('div').class('qm-changelog-head qm-header-font').text('0.1.0'))
        .add(dom.create('div').class('qm-changelog-body')
          .add(dom.create('div').class('qm-changelog-entry')
            .add(dom.create('div').class('qm-changelog-entry-header qm-code-font'))
            .add(dom.create('div').class('qm-changelog-entry-content'))))
    )
  })

  it('displays an entry with a language and unsupported type', () => {
    const selection = quantum.select({
      type: 'changelog',
      params: ['0.1.0'],
      content: [
        {
          type: 'entry',
          params: ['EntryName'],
          content: [{
            type: 'header',
            params: ['test-language'],
            content: [{
              type: 'randomUnsupportedType',
              params: [],
              content: []
            }]
          }]
        }
      ]
    })

    changelog(optionsWithLanguage)(selection, transformer).should.eql(
      changelogBlock()
        .add(dom.create('div').class('qm-changelog-head qm-header-font').text('0.1.0'))
        .add(dom.create('div').class('qm-changelog-body')
          .add(dom.create('div').class('qm-changelog-entry')
            .add(dom.create('div').class('qm-changelog-entry-header qm-code-font'))
            .add(dom.create('div').class('qm-changelog-entry-content'))))
    )
  })

  it('displays an entry with changes', () => {
    const change = {
      type: 'change',
      params: ['updated'],
      content: []
    }

    const selection = quantum.select({
      type: 'changelog',
      params: ['0.1.0'],
      content: [
        {
          type: 'entry',
          params: ['EntryName'],
          content: [
            change
          ]
        }
      ]
    })

    const header = dom.create('div').class('qm-changelog-entry-header qm-code-font')

    const body = dom.create('div').class('qm-changelog-entry-content')
      .add(changeDom(quantum.select(change), transformer, {
        updated: {
          displayName: 'Updated',
          iconClass: 'qm-changelog-icon-updated'
        }
      }))

    changelog(options)(selection, transformer).should.eql(
      changelogBlock()
        .add(dom.create('div').class('qm-changelog-head qm-header-font').text('0.1.0'))
        .add(dom.create('div').class('qm-changelog-body')
          .add(dom.create('div').class('qm-changelog-entry')
            .add(header)
            .add(body)))
    )
  })

  describe('group', () => {
    const { label } = changelog
    it('displays a group', () => {
      const selection = quantum.select({
        type: 'changelog',
        params: ['0.1.0'],
        content: [
          {
            type: 'group',
            params: ['GroupName'],
            content: []
          }
        ]
      })

      const header = dom.create('div').class('qm-changelog-group-head')
        .add(dom.create('div').class('qm-changelog-group-title').text('GroupName'))
        .add(dom.create('div').class('qm-changelog-group-labels'))

      const body = dom.create('div').class('qm-changelog-group-body')
        .add(dom.create('div').class('qm-changelog-group-entries'))

      changelog(options)(selection, transformer).should.eql(
        changelogBlock()
          .add(dom.create('div').class('qm-changelog-head qm-header-font').text('0.1.0'))
          .add(dom.create('div').class('qm-changelog-body')
            .add(dom.create('div').class('qm-changelog-group')
              .add(createCollapsible(header, body))))
      )
    })

    it('displays a group with a @link', () => {
      const selection = quantum.select({
        type: 'changelog',
        params: ['0.1.0'],
        content: [
          {
            type: 'group',
            params: ['GroupName'],
            content: [
              {
                type: 'link',
                params: ['link/to/group'],
                content: []
              }
            ]
          }
        ]
      })

      const header = dom.create('div').class('qm-changelog-group-head')
        .add(dom.create('div').class('qm-changelog-group-title')
        .add(dom.create('div').class('qm-changelog-group-link')
          .add(dom.create('a').attr('href', 'link/to/group').text('GroupName'))))
        .add(dom.create('div').class('qm-changelog-group-labels'))

      const body = dom.create('div').class('qm-changelog-group-body')
        .add(dom.create('div').class('qm-changelog-group-entries'))

      changelog(options)(selection, transformer).should.eql(
        changelogBlock()
          .add(dom.create('div').class('qm-changelog-head qm-header-font').text('0.1.0'))
          .add(dom.create('div').class('qm-changelog-body')
            .add(dom.create('div').class('qm-changelog-group')
              .add(createCollapsible(header, body))))
      )
    })

    it('displays a group description', () => {
      const selection = quantum.select({
        type: 'changelog',
        params: ['0.1.0'],
        content: [
          {
            type: 'group',
            params: ['GroupName'],
            content: [
              {
                type: 'description',
                params: [],
                content: ['some description']
              }
            ]
          }
        ]
      })

      const header = dom.create('div').class('qm-changelog-group-head')
        .add(dom.create('div').class('qm-changelog-group-title').text('GroupName'))
        .add(dom.create('div').class('qm-changelog-group-labels'))

      const body = dom.create('div').class('qm-changelog-group-body')
        .add(dom.create('div').class('qm-changelog-description')
          .add(html.paragraphTransform(quantum.select({type: '', params: [], content: ['some description']}))))
        .add(dom.create('div').class('qm-changelog-group-entries'))

      changelog(options)(selection, transformer).should.eql(
        changelogBlock()
          .add(dom.create('div').class('qm-changelog-head qm-header-font').text('0.1.0'))
          .add(dom.create('div').class('qm-changelog-body')
            .add(dom.create('div').class('qm-changelog-group')
              .add(createCollapsible(header, body))))
      )
    })

    it('displays group level changes', () => {
      const change = {
        type: 'change',
        params: ['updated'],
        content: ['some description']
      }

      const selection = quantum.select({
        type: 'changelog',
        params: ['0.1.0'],
        content: [
          {
            type: 'group',
            params: ['GroupName'],
            content: [
              change
            ]
          }
        ]
      })

      const header = dom.create('div').class('qm-changelog-group-head')
        .add(dom.create('div').class('qm-changelog-group-title').text('GroupName'))
        .add(dom.create('div').class('qm-changelog-group-labels')
        .add(label('updated', 1)))

      const body = dom.create('div').class('qm-changelog-group-body')
        .add(dom.create('div').class('qm-changelog-group-entries')
          .add(dom.create('div').class('qm-changelog-entry')
            .add(changeDom(quantum.select(change), transformer, {
              updated: {
                displayName: 'Updated',
                iconClass: 'qm-changelog-icon-updated'
              }
            }))))

      changelog(options)(selection, transformer).should.eql(
        changelogBlock()
          .add(dom.create('div').class('qm-changelog-head qm-header-font').text('0.1.0'))
          .add(dom.create('div').class('qm-changelog-body')
            .add(dom.create('div').class('qm-changelog-group')
              .add(createCollapsible(header, body))))
      )
    })

    it('displays an entry with changes', () => {
      const change = {
        type: 'change',
        params: ['updated'],
        content: [
          {
            type: 'description',
            params: [],
            content: ['Some description']
          }
        ]
      }

      const selection = quantum.select({
        type: 'changelog',
        params: ['0.1.0'],
        content: [
          {
            type: 'group',
            params: ['GroupName'],
            content: [
              {
                type: 'entry',
                params: [],
                content: [
                  change
                ]
              }
            ]
          }
        ]
      })

      const header = dom.create('div').class('qm-changelog-group-head')
        .add(dom.create('div').class('qm-changelog-group-title').text('GroupName'))
        .add(dom.create('div').class('qm-changelog-group-labels')
        .add(label('updated', 1)))

      const body = dom.create('div').class('qm-changelog-group-body')
        .add(dom.create('div').class('qm-changelog-group-entries')
          .add(dom.create('div').class('qm-changelog-entry')
            .add(dom.create('div').class('qm-changelog-entry-header qm-code-font'))
            .add(dom.create('div').class('qm-changelog-entry-content')
              .add(changeDom(quantum.select(change), transformer, {
                updated: {
                  displayName: 'Updated',
                  iconClass: 'qm-changelog-icon-updated'
                }
              })))))

      changelog(options)(selection, transformer).should.eql(
        changelogBlock()
          .add(dom.create('div').class('qm-changelog-head qm-header-font').text('0.1.0'))
          .add(dom.create('div').class('qm-changelog-body')
            .add(dom.create('div').class('qm-changelog-group')
              .add(createCollapsible(header, body))))
      )
    })

    it('displays an entry with a header', () => {
      const change = {
        type: 'change',
        params: ['updated'],
        content: [
          {
            type: 'description',
            params: [],
            content: ['Some description']
          }
        ]
      }

      const selection = quantum.select({
        type: 'changelog',
        params: ['0.1.0'],
        content: [
          {
            type: 'group',
            params: ['GroupName'],
            content: [
              {
                type: 'entry',
                params: [],
                content: [
                  {
                    type: 'header',
                    params: ['test-language'],
                    content: [
                      {
                        type: 'name',
                        params: ['EntryName'],
                        content: []
                      }
                    ]
                  },
                  change
                ]
              }
            ]
          }
        ]
      })

      const header = dom.create('div').class('qm-changelog-group-head')
        .add(dom.create('div').class('qm-changelog-group-title').text('GroupName'))
        .add(dom.create('div').class('qm-changelog-group-labels')
        .add(label('updated', 1)))

      const body = dom.create('div').class('qm-changelog-group-body')
        .add(dom.create('div').class('qm-changelog-group-entries')
          .add(dom.create('div').class('qm-changelog-entry')
            .add(dom.create('div').class('qm-changelog-entry-header qm-code-font')
              .add(dom.create('div').class('test-header').text('EntryName')))
            .add(dom.create('div').class('qm-changelog-entry-content')
              .add(changeDom(quantum.select(change), transformer, {
                updated: {
                  displayName: 'Updated',
                  iconClass: 'qm-changelog-icon-updated'
                }
              })))))

      changelog(optionsWithLanguage)(selection, transformer).should.eql(
        changelogBlock()
          .add(dom.create('div').class('qm-changelog-head qm-header-font').text('0.1.0'))
          .add(dom.create('div').class('qm-changelog-body')
            .add(dom.create('div').class('qm-changelog-group')
              .add(createCollapsible(header, body))))
      )
    })
  })

  describe('changeDom', () => {
    const { changeDom } = changelog
    function issueUrl (id) {
      return '/link/to/issue/' + id
    }

    it('creates a basic change section', () => {
      const changeSelection = quantum.select({
        type: 'change',
        params: [],
        content: []
      })

      changeDom(changeSelection, transformer, issueUrl).should.eql(
        dom.create('div').class('qm-changelog-change')
          .add(dom.create('div').class('qm-changelog-change-header')
            .add(dom.create('div').class('qm-changelog-change-icon'))
            .add(dom.create('div').class('qm-changelog-change-type')))
          .add(dom.create('div').class('qm-changelog-change-body'))
      )
    })

    it('fails gracefully when an invalid tag type is used', () => {
      const changeSelection = quantum.select({
        type: 'change',
        params: ['invalid'],
        content: []
      })

      changeDom(changeSelection, transformer, issueUrl).should.eql(
        dom.create('div').class('qm-changelog-change')
          .add(dom.create('div').class('qm-changelog-change-header')
            .add(dom.create('div').class('qm-changelog-change-icon'))
            .add(dom.create('div').class('qm-changelog-change-type')))
          .add(dom.create('div').class('qm-changelog-change-body'))
      )
    })

    it('creates a change section for a tag', () => {
      const changeSelection = quantum.select({
        type: 'change',
        params: ['updated'],
        content: []
      })

      changeDom(changeSelection, transformer, issueUrl).should.eql(
        dom.create('div').class('qm-changelog-change')
          .add(dom.create('div').class('qm-changelog-change-header')
            .add(dom.create('div').class('qm-changelog-change-icon')
              .add(dom.create('i')
                .class('qm-changelog-icon-updated qm-changelog-text-updated')
                .attr('title', 'Updated')))
            .add(dom.create('div').class('qm-changelog-change-type').text('Updated')))
          .add(dom.create('div').class('qm-changelog-change-body'))
      )
    })

    it('creates a change section for a tag with issues', () => {
      const changeSelection = quantum.select({
        type: 'change',
        params: ['updated'],
        content: [
          {
            type: 'issue',
            params: ['56'],
            content: []
          }
        ]
      })

      changeDom(changeSelection, transformer, issueUrl).should.eql(
        dom.create('div').class('qm-changelog-change')
          .add(dom.create('div').class('qm-changelog-change-header')
            .add(dom.create('div').class('qm-changelog-change-icon')
              .add(dom.create('i')
                .class('qm-changelog-icon-updated qm-changelog-text-updated')
                .attr('title', 'Updated')))
            .add(dom.create('div').class('qm-changelog-change-type').text('Updated'))
            .add(dom.create('span').class('qm-changelog-change-issues')
              .add(dom.create('a')
                .class('qm-changelog-change-issue')
                .attr('href', '/link/to/issue/56')
                .text('#56'))))
          .add(dom.create('div').class('qm-changelog-change-body'))
      )
    })

    it('creates a change section for a tag (missing icon class)', () => {
      const changeSelection = quantum.select({
        type: 'change',
        params: ['added'],
        content: []
      })

      changeDom(changeSelection, transformer, issueUrl).should.eql(
        dom.create('div').class('qm-changelog-change')
          .add(dom.create('div').class('qm-changelog-change-header')
            .add(dom.create('div').class('qm-changelog-change-icon')
              .add(dom.create('i')
                .class('qm-changelog-icon-added qm-changelog-text-added')
                .attr('title', 'Added')))
            .add(dom.create('div').class('qm-changelog-change-type').text('Added')))
          .add(dom.create('div').class('qm-changelog-change-body'))
      )
    })

    it('creates a change section for a tag (missing display name)', () => {
      const changeSelection = quantum.select({
        type: 'change',
        params: ['removed'],
        content: []
      })

      changeDom(changeSelection, transformer, issueUrl).should.eql(
        dom.create('div').class('qm-changelog-change')
          .add(dom.create('div').class('qm-changelog-change-header')
            .add(dom.create('div').class('qm-changelog-change-icon')
              .add(dom.create('i')
                .class('qm-changelog-icon-removed qm-changelog-text-removed')
                .attr('title', 'Removed')))
            .add(dom.create('div').class('qm-changelog-change-type').text('Removed')))
          .add(dom.create('div').class('qm-changelog-change-body'))
      )
    })
  })

  describe('label', () => {
    const { label } = changelog
    it('handles undefined tag type', () => {
      label(undefined, 1).should.eql(dom.create('div').class('qm-changelog-label qm-changelog-label-undefined')
        .add(dom.create('span').text(1)))
    })
  })
})
