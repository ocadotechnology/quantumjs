'use strict'
const chai = require('chai')

const quantum = require('quantum-js')
const dom = require('quantum-dom')
const html = require('quantum-html')

const entityTransforms = require('../lib/entity-transforms')

const should = chai.should()

function transform (selection) {
  return dom.create('div').text(selection.type())
}

function changelogBlock () {
  return dom.create('div').class('qm-changelog')
    .add(entityTransforms.assets)
}

describe('entity-transforms', () => {
  it('should be a factory', () => {
    entityTransforms.should.be.a.function
  })

  it('should return an object with the transforms', () => {
    entityTransforms.transforms().should.be.an.object
    entityTransforms.transforms().changelog.should.be.a.function
    entityTransforms.transforms().changelogList.should.be.a.function
  })

  describe('changelogList', () => {
    it('should only transform changelog entries', () => {
      const selection = quantum.select({
        type: 'changelogList',
        params: [],
        content: [
          {
            type: 'changelog',
            params: ['0.1.0'],
            content: []
          },
          {
            type: 'div',
            params: ['0.2.0'],
            content: []
          },
          {
            type: 'changelog',
            params: ['0.3.0'],
            content: []
          }
        ]
      })

      entityTransforms.transforms().changelogList(selection, transform).should.eql(
        dom.create('div').class('qm-changelog-list')
          .add(dom.create('div').text('changelog'))
          .add(dom.create('div').text('changelog'))
      )
    })
  })

  describe('changelog', () => {
    it('should return undefined if there is no content', () => {
      const selection = quantum.select({
        type: 'changelog',
        params: ['0.1.0'],
        content: []
      })

      should.not.exist(entityTransforms.transforms().changelog(selection, transform))
    })

    it('should display a description', () => {
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

      entityTransforms.transforms().changelog(selection, transform).should.eql(
        changelogBlock()
          .add(dom.create('div').class('qm-changelog-head').text('0.1.0'))
          .add(dom.create('div').class('qm-changelog-body')
            .add(dom.create('div').class('qm-changelog-description')
              .add(html.paragraphTransform(quantum.select({type: '', params: [], content: ['some description']})))))
      )
    })

    it('should add language assets to the page', () => {
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
        assets: [
          dom.asset({
            url: '/some-url',
            file: '/some-file'
          })
        ]
      }

      entityTransforms.transforms({languages: [testLanguage]}).changelog(selection, transform).should.eql(
        changelogBlock()
          .add(dom.asset({
            url: '/some-url',
            file: '/some-file'
          }))
          .add(dom.create('div').class('qm-changelog-head').text('0.1.0'))
          .add(dom.create('div').class('qm-changelog-body')
            .add(dom.create('div').class('qm-changelog-description')
              .add(html.paragraphTransform(quantum.select({type: '', params: [], content: ['some description']})))))
      )
    })

    it('should turn the header into a link if a @link entity is found', () => {
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

      entityTransforms.transforms().changelog(selection, transform).should.eql(
        changelogBlock()
          .add(dom.create('div').class('qm-changelog-head')
            .add(dom.create('div').class('qm-changelog-link')
              .add(dom.create('a').attr('href', 'link/to/0.1.0').text('0.1.0'))))
          .add(dom.create('div').class('qm-changelog-body')
            .add(dom.create('div').class('qm-changelog-description')
              .add(html.paragraphTransform(quantum.select({type: '', params: [], content: ['some description']})))))
      )
    })

    it('should display an entry', () => {
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

      entityTransforms.transforms().changelog(selection, transform).should.eql(
        changelogBlock()
          .add(dom.create('div').class('qm-changelog-head').text('0.1.0'))
          .add(dom.create('div').class('qm-changelog-body')
            .add(dom.create('div').class('qm-changelog-entry')
              .add(dom.create('div').class('qm-changelog-entry-header'))
              .add(dom.create('div').class('qm-changelog-entry-content'))))
      )
    })

    it('should display an entry with changes', () => {
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

      const header = dom.create('div').class('qm-changelog-entry-header')

      const body = dom.create('div').class('qm-changelog-entry-content')
        .add(entityTransforms.changeDom(quantum.select(change), transform, {
          updated: {
            displayName: 'Updated',
            iconClass: 'quantum-changelog-icon-updated'
          }
        }))

      entityTransforms.transforms().changelog(selection, transform).should.eql(
        changelogBlock()
          .add(dom.create('div').class('qm-changelog-head').text('0.1.0'))
          .add(dom.create('div').class('qm-changelog-body')
            .add(dom.create('div').class('qm-changelog-entry')
              .add(header)
              .add(body)))
      )
    })

    describe('group', () => {
      it('should display a group', () => {
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

        entityTransforms.transforms().changelog(selection, transform).should.eql(
          changelogBlock()
            .add(dom.create('div').class('qm-changelog-head').text('0.1.0'))
            .add(dom.create('div').class('qm-changelog-body')
              .add(dom.create('div').class('qm-changelog-group')
                .add(entityTransforms.createCollapsible(header, body))))
        )
      })

      it('should display a group with a @link', () => {
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

        entityTransforms.transforms().changelog(selection, transform).should.eql(
          changelogBlock()
            .add(dom.create('div').class('qm-changelog-head').text('0.1.0'))
            .add(dom.create('div').class('qm-changelog-body')
              .add(dom.create('div').class('qm-changelog-group')
                .add(entityTransforms.createCollapsible(header, body))))
        )
      })

      it('should display a group description', () => {
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

        entityTransforms.transforms().changelog(selection, transform).should.eql(
          changelogBlock()
            .add(dom.create('div').class('qm-changelog-head').text('0.1.0'))
            .add(dom.create('div').class('qm-changelog-body')
              .add(dom.create('div').class('qm-changelog-group')
                .add(entityTransforms.createCollapsible(header, body))))
        )
      })

      it('should display group level changes', () => {
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
          .add(entityTransforms.label('updated', 'quantum-changelog-icon-updated', 1)))

        const body = dom.create('div').class('qm-changelog-group-body')
          .add(dom.create('div').class('qm-changelog-group-entries')
            .add(dom.create('div').class('qm-changelog-entry')
              .add(entityTransforms.changeDom(quantum.select(change), transform, {
                updated: {
                  displayName: 'Updated',
                  iconClass: 'quantum-changelog-icon-updated'
                }
              }))))

        entityTransforms.transforms().changelog(selection, transform).should.eql(
          changelogBlock()
            .add(dom.create('div').class('qm-changelog-head').text('0.1.0'))
            .add(dom.create('div').class('qm-changelog-body')
              .add(dom.create('div').class('qm-changelog-group')
                .add(entityTransforms.createCollapsible(header, body))))
        )
      })

      it('should display an entry with changes', () => {
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
          .add(entityTransforms.label('updated', 'quantum-changelog-icon-updated', 1)))

        const body = dom.create('div').class('qm-changelog-group-body')
          .add(dom.create('div').class('qm-changelog-group-entries')
            .add(dom.create('div').class('qm-changelog-entry')
              .add(dom.create('div').class('qm-changelog-entry-header'))
              .add(dom.create('div').class('qm-changelog-entry-content')
                .add(entityTransforms.changeDom(quantum.select(change), transform, {
                  updated: {
                    displayName: 'Updated',
                    iconClass: 'quantum-changelog-icon-updated'
                  }
                })))))

        entityTransforms.transforms().changelog(selection, transform).should.eql(
          changelogBlock()
            .add(dom.create('div').class('qm-changelog-head').text('0.1.0'))
            .add(dom.create('div').class('qm-changelog-body')
              .add(dom.create('div').class('qm-changelog-group')
                .add(entityTransforms.createCollapsible(header, body))))
        )
      })

      it('should display an entry with a header', () => {
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

        const testLanguage = {
          name: 'test-language',
          createHeaderDom (headerSelection, transforms) {
            return dom.create('div').class('test-header').text(headerSelection.select('name').ps())
          },
          assets: []
        }

        const header = dom.create('div').class('qm-changelog-group-head')
          .add(dom.create('div').class('qm-changelog-group-title').text('GroupName'))
          .add(dom.create('div').class('qm-changelog-group-labels')
          .add(entityTransforms.label('updated', 'quantum-changelog-icon-updated', 1)))

        const body = dom.create('div').class('qm-changelog-group-body')
          .add(dom.create('div').class('qm-changelog-group-entries')
            .add(dom.create('div').class('qm-changelog-entry')
              .add(dom.create('div').class('qm-changelog-entry-header')
                .add(dom.create('div').class('test-header').text('EntryName')))
              .add(dom.create('div').class('qm-changelog-entry-content')
                .add(entityTransforms.changeDom(quantum.select(change), transform, {
                  updated: {
                    displayName: 'Updated',
                    iconClass: 'quantum-changelog-icon-updated'
                  }
                })))))

        entityTransforms.transforms({languages: [testLanguage]}).changelog(selection, transform).should.eql(
          changelogBlock()
            .add(dom.create('div').class('qm-changelog-head').text('0.1.0'))
            .add(dom.create('div').class('qm-changelog-body')
              .add(dom.create('div').class('qm-changelog-group')
                .add(entityTransforms.createCollapsible(header, body))))
        )
      })
    })
  })

  describe('changeDom', () => {
    const tagsByName = {
      updated: {
        displayName: 'Updated',
        iconClass: 'quantum-changelog-icon-class'
      },
      added: {
        displayName: 'Added'
      },
      removed: {
        iconClass: 'quantum-changelog-icon-class'
      }
    }

    function issueUrl (id) {
      return '/link/to/issue/' + id
    }

    it('should create a basic change section', () => {
      const changeSelection = quantum.select({
        type: 'change',
        params: [],
        content: []
      })

      entityTransforms.changeDom(changeSelection, transform, tagsByName, issueUrl).should.eql(
        dom.create('div').class('qm-changelog-change')
          .add(dom.create('div').class('qm-changelog-change-header')
            .add(dom.create('div').class('qm-changelog-change-icon'))
            .add(dom.create('div').class('qm-changelog-change-type')))
          .add(dom.create('div').class('qm-changelog-change-body'))
      )
    })

    it('should fail gracefully when an invalid tag type is used', () => {
      const changeSelection = quantum.select({
        type: 'change',
        params: ['invalid'],
        content: []
      })

      entityTransforms.changeDom(changeSelection, transform, tagsByName, issueUrl).should.eql(
        dom.create('div').class('qm-changelog-change')
          .add(dom.create('div').class('qm-changelog-change-header')
            .add(dom.create('div').class('qm-changelog-change-icon'))
            .add(dom.create('div').class('qm-changelog-change-type')))
          .add(dom.create('div').class('qm-changelog-change-body'))
      )
    })

    it('should create a change section for a tag', () => {
      const changeSelection = quantum.select({
        type: 'change',
        params: ['updated'],
        content: []
      })

      entityTransforms.changeDom(changeSelection, transform, tagsByName, issueUrl).should.eql(
        dom.create('div').class('qm-changelog-change')
          .add(dom.create('div').class('qm-changelog-change-header')
            .add(dom.create('div').class('qm-changelog-change-icon')
              .add(dom.create('i')
                .class('quantum-changelog-icon-class qm-changelog-text-updated')
                .attr('title', 'Updated')))
            .add(dom.create('div').class('qm-changelog-change-type').text('Updated')))
          .add(dom.create('div').class('qm-changelog-change-body'))
      )
    })

    it('should create a change section for a tag with issues', () => {
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

      entityTransforms.changeDom(changeSelection, transform, tagsByName, issueUrl).should.eql(
        dom.create('div').class('qm-changelog-change')
          .add(dom.create('div').class('qm-changelog-change-header')
            .add(dom.create('div').class('qm-changelog-change-icon')
              .add(dom.create('i')
                .class('quantum-changelog-icon-class qm-changelog-text-updated')
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

    it('should create a change section for a tag (missing icon class)', () => {
      const changeSelection = quantum.select({
        type: 'change',
        params: ['added'],
        content: []
      })

      entityTransforms.changeDom(changeSelection, transform, tagsByName, issueUrl).should.eql(
        dom.create('div').class('qm-changelog-change')
          .add(dom.create('div').class('qm-changelog-change-header')
            .add(dom.create('div').class('qm-changelog-change-icon')
              .add(dom.create('i')
                .class('qm-changelog-text-added')
                .attr('title', 'Added')))
            .add(dom.create('div').class('qm-changelog-change-type').text('Added')))
          .add(dom.create('div').class('qm-changelog-change-body'))
      )
    })

    it('should create a change section for a tag (missing display name)', () => {
      const changeSelection = quantum.select({
        type: 'change',
        params: ['removed'],
        content: []
      })

      entityTransforms.changeDom(changeSelection, transform, tagsByName, issueUrl).should.eql(
        dom.create('div').class('qm-changelog-change')
          .add(dom.create('div').class('qm-changelog-change-header')
            .add(dom.create('div').class('qm-changelog-change-icon')
              .add(dom.create('i').class('quantum-changelog-icon-class qm-changelog-text-removed')))
            .add(dom.create('div').class('qm-changelog-change-type')))
          .add(dom.create('div').class('qm-changelog-change-body'))
      )
    })
  })
})
