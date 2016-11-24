'use strict'

const path = require('path')

const chai = require('chai')
const quantum = require('quantum-js')

const changelog = require('../..')
const pageTransform = require('../../lib/page-transform')

chai.should()

const testlanguage = {
  name: 'test-language-1',
  entityTypes: ['function'],
  hashEntry: (selection, parent) => {
    return selection.ps()
  },
  extractEntry: (selection, previousExtraction) => {
    const apiEntry = {
      type: selection.type(),
      name: selection.ps()
    }

    const changes = []

    return { apiEntry, changes }
  },
  buildEntryHeaderAst: (apiEntryChanges) => {
    return {
      type: 'header',
      params: [apiEntryChanges.apiEntry.type],
      content: [
        {type: 'name', params: [apiEntryChanges.apiEntry.name], content: []}
      ]
    }
  }
}

chai.should()

function checkSpec (spec) {
  const file = new quantum.File({
    src: 'src/content/a1.um',
    resolved: 'a1.um',
    base: 'src/content',
    dest: 'target/a1.um',
    watch: true
  })

  const inputPage = new quantum.Page({
    file: file,
    content: {
      type: '',
      params: [],
      content: spec.select('input').content()
    }
  })

  const outputPage = new quantum.Page({
    file: file,
    content: {
      type: '',
      params: [],
      content: spec.select('output').content()
    }
  })

  const options = {
    languages: [testlanguage],
    groupByApi: spec.select('options').select('groupByApi').ps() === 'true',
    reverseVisibleList: spec.select('options').select('reverseVisibleList').ps() === 'true'
  }

  changelog(options)(inputPage).should.eql(outputPage)
}

describe('pageTransform', () => {
  it('spec.um', () => {
    return quantum.read(path.join(__dirname, 'spec.um'))
      .then(parsed => {
        quantum.select(parsed)
          .selectAll('spec')
          .forEach(checkSpec)
      })
  })

  describe('pageTransform', () => {
    it('should do nothing when there is no @changelogList', () => {
      const page = new quantum.Page({
        file: new quantum.File({
          src: 'src/content/a1.um',
          resolved: 'a1.um',
          base: 'src/content',
          dest: 'target/a1.um',
          watch: true
        }),
        content: {
          type: '',
          params: [],
          content: []
        }
      })
      pageTransform.pageTransform(page).should.eql(page)
    })

    it('should process page when a @changelogList is found', () => {
      const page = new quantum.Page({
        file: new quantum.File({
          src: 'src/content/a1.um',
          resolved: 'a1.um',
          base: 'src/content',
          dest: 'target/a1.um',
          watch: true
        }),
        content: {
          type: '',
          params: [],
          content: [
            {
              type: 'changelogList',
              params: [],
              content: []
            }
          ]
        }
      })
      pageTransform.pageTransform(page).should.not.equal(page)
      pageTransform.pageTransform(page).should.be.an.instanceof(quantum.Page)
    })
  })

  describe('extractApis', () => {
    it('should extract the versions', () => {
      const markup = `
        @section
          @version 0.1.0
        @section
          @nested
            @version 0.2.0
        @version 0.3.0
        `

      const result = pageTransform.extractApis(quantum.select(quantum.parse(markup)))
      result.versions.should.eql(['0.1.0', '0.2.0', '0.3.0'])
    })

    it('should create a version -> api selections map', () => {
      const markup = `
        @section
          @version 0.1.0
            @api name1
          @version 0.1.0
            @api name2
          @version 0.1.0
            @api name3
        @section
          @nested
            @version 0.2.0
        @version 0.3.0
          @api name1
        `

      const selection = quantum.select(quantum.parse(markup))

      const result = pageTransform.extractApis(selection)
      const versions = selection.selectAll('version', {recursive: true})
      Array.from(result.apisByVersion).should.eql([
        ['0.1.0', versions.filter(v => v.ps() === '0.1.0').map(version => version.select('api'))],
        ['0.2.0', []],
        ['0.3.0', versions.filter(v => v.ps() === '0.3.0').map(version => version.select('api'))]
      ])
    })
  })

  describe('buildChangelogEntries', () => {
    const testlanguage1 = {
      name: 'test-language-1',
      entityTypes: ['function'],
      hashEntry: (selection, parent) => {
        return selection.ps() !== 'canthash' ? selection.type() + ':' + selection.ps() : undefined
      },
      extractEntry: (selection, previousExtraction) => {
        const apiEntry = {
          type: selection.type(),
          name: selection.ps(),
          hadFlag: previousExtraction ? previousExtraction.hasFlag : false
        }

        const changes = []

        return { apiEntry, changes }
      }
    }

    const testLanguages = [testlanguage1]

    it('should return the new api map and a map of changelog entries', () => {
      const markup = `
        @api name
        `

      const selection = quantum.select(quantum.parse(markup))
      const languages = testLanguages

      const result = pageTransform.buildChangelogEntries(languages, selection.select('api'), undefined, false)

      result.apiMap.should.be.an.instanceof(Map)
      result.apiMap.size.should.eql(0)
      result.changelogEntriesMap.should.be.an.instanceof(Map)
      result.changelogEntriesMap.size.should.eql(0)
    })

    it('should ignore entries that cant be hashed', () => {
      const markup = `
        @api name
          @function canthash
        `

      const selection = quantum.select(quantum.parse(markup))
      const languages = testLanguages

      const result = pageTransform.buildChangelogEntries(languages, selection.select('api'), undefined, false)

      result.apiMap.should.be.an.instanceof(Map)
      result.apiMap.size.should.eql(0)
      result.changelogEntriesMap.should.be.an.instanceof(Map)
      result.changelogEntriesMap.size.should.eql(0)
    })

    it('should keep the entries from the old api map', () => {
      const markup = `
        @api name
        `

      const selection = quantum.select(quantum.parse(markup))
      const languages = []

      const oldApiMap = new Map()
      oldApiMap.set('some-entry', {
        type: 'function',
        name: 'testFunc'
      })

      const result = pageTransform.buildChangelogEntries(languages, selection.select('api'), oldApiMap, false)

      result.apiMap.size.should.eql(1)

      result.apiMap.get('some-entry').should.eql({
        type: 'function',
        name: 'testFunc'
      })
    })

    it('should add new entries found in the api', () => {
      const markup = `
        @api name
          @function testFunc
        `

      const selection = quantum.select(quantum.parse(markup))
      const languages = testLanguages

      const result = pageTransform.buildChangelogEntries(languages, selection.select('api'), undefined, false)
      result.apiMap.size.should.eql(1)

      result.apiMap.get('function:testFunc').should.eql({
        type: 'function',
        name: 'testFunc',
        hadFlag: false
      })
    })

    it('should generate changelog entries using the default entry generator', () => {
      const markup = `
        @api name
          @function testFunc
            @added
              @description: Some description
        `

      const selection = quantum.select(quantum.parse(markup))
      const languages = testLanguages

      const result = pageTransform.buildChangelogEntries(languages, selection.select('api'), undefined, false)

      result.changelogEntriesMap.size.should.equal(1)
      result.changelogEntriesMap.get('function:testFunc').should.eql({
        language: testlanguage1,
        apiEntry: {
          type: 'function',
          name: 'testFunc',
          hadFlag: false
        },
        changelogEntries: [
          {
            tagType: 'added',
            selection: selection.select('api').select('function').select('added')
          }
        ]
      })
    })

    it('should automatically detect added entries', () => {
      const markup = `
        @api name
          @function testFunc
        `

      const selection = quantum.select(quantum.parse(markup))
      const languages = testLanguages

      const result = pageTransform.buildChangelogEntries(languages, selection.select('api'), undefined, true)

      result.changelogEntriesMap.size.should.equal(1)
      result.changelogEntriesMap.get('function:testFunc').should.eql({
        language: testlanguage1,
        apiEntry: {
          type: 'function',
          name: 'testFunc',
          hadFlag: false
        },
        changelogEntries: [
          {
            tagType: 'added',
            selection: quantum.select({
              type: 'added',
              params: [],
              content: []
            })
          }
        ]
      })
    })

    it('should not automatically detect added entries when there is an explicit added tag', () => {
      const markup = `
        @api name
          @function testFunc
            @added
        `

      const selection = quantum.select(quantum.parse(markup))
      const languages = testLanguages

      const result = pageTransform.buildChangelogEntries(languages, selection.select('api'), undefined, true)

      result.changelogEntriesMap.size.should.equal(1)
      result.changelogEntriesMap.get('function:testFunc').should.eql({
        language: testlanguage1,
        apiEntry: {
          type: 'function',
          name: 'testFunc',
          hadFlag: false
        },
        changelogEntries: [
          {
            tagType: 'added',
            selection: selection.select('api').select('function').select('added')
          }
        ]
      })
    })

    it('should generate changelog entries using the previous entry', () => {
      const markup = `
      @api name
        @function testFunc
          @info
      `

      const selection = quantum.select(quantum.parse(markup))
      const languages = testLanguages

      const previousApiMap = new Map()
      previousApiMap.set('function:testFunc', {
        type: 'function',
        name: 'testFunc',
        hasFlag: true
      })

      const result = pageTransform.buildChangelogEntries(languages, selection, previousApiMap)

      result.changelogEntriesMap.size.should.equal(1)
      result.changelogEntriesMap.get('function:testFunc').should.eql({
        language: testlanguage1,
        apiEntry: {
          type: 'function',
          name: 'testFunc',
          hadFlag: true
        },
        changelogEntries: [
          {
            tagType: 'info',
            selection: selection.select('api').select('function').select('info')
          }
        ]
      })
    })
  })
})
