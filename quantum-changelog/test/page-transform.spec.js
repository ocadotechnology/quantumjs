'use strict'

const chai = require('chai')
const pageTransform = require('../lib/page-transform')
const quantum = require('quantum-js')

const should = chai.should()

describe('page transform', () => {
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
          content: [{
            type: 'changelogList',
            params: [],
            content: []
          }]
        }
      })
      pageTransform.pageTransform(page).should.not.equal(page)
      pageTransform.pageTransform(page).should.be.an.instanceof(quantum.Page)
    })
  })

  describe('resolveOptions', () => {
    it('should be fine with undefined being passed in', () => {
      pageTransform.resolveOptions(undefined).should.be.an.object
    })

    it('should resolve targetVersions correctly', () => {
      pageTransform.resolveOptions(undefined).targetVersions.should.eql([])
      pageTransform.resolveOptions({}).targetVersions.should.eql([])
      pageTransform.resolveOptions({targetVersions: undefined}).targetVersions.should.eql([])
      pageTransform.resolveOptions({targetVersions: []}).targetVersions.should.eql([])
      pageTransform.resolveOptions({targetVersions: ['0.1.0', '0.2.0']}).targetVersions
        .should.eql(['0.1.0', '0.2.0'])
    })

    it('should resolve languages correctly', () => {
      pageTransform.resolveOptions(undefined).languages.should.eql([])
      pageTransform.resolveOptions({}).languages.should.eql([])
      pageTransform.resolveOptions({languages: undefined}).languages.should.eql([])
      pageTransform.resolveOptions({languages: []}).languages.should.eql([])
      pageTransform.resolveOptions({languages: [{name: 'javascript'}, {name: 'css'}]}).languages
        .should.eql([{name: 'javascript'}, {name: 'css'}])
    })

    it('should resolve reverseVisibleList correctly', () => {
      pageTransform.resolveOptions(undefined).reverseVisibleList.should.equal(false)
      pageTransform.resolveOptions({}).reverseVisibleList.should.equal(false)
      pageTransform.resolveOptions({reverseVisibleList: undefined}).reverseVisibleList.should.equal(false)
      pageTransform.resolveOptions({reverseVisibleList: false}).reverseVisibleList.should.equal(false)
      pageTransform.resolveOptions({reverseVisibleList: true}).reverseVisibleList.should.equal(true)
      pageTransform.resolveOptions({reverseVisibleList: 'nope'}).reverseVisibleList.should.equal(false)
    })

    it('should resolve groupByApi correctly', () => {
      pageTransform.resolveOptions(undefined).groupByApi.should.equal(false)
      pageTransform.resolveOptions({}).groupByApi.should.equal(false)
      pageTransform.resolveOptions({groupByApi: undefined}).groupByApi.should.equal(false)
      pageTransform.resolveOptions({groupByApi: false}).groupByApi.should.equal(false)
      pageTransform.resolveOptions({groupByApi: true}).groupByApi.should.equal(true)
      pageTransform.resolveOptions({groupByApi: 'nope'}).groupByApi.should.equal(false)
    })
  })

  describe('processChangelogList', () => {
    xit('should work', () => {
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

    it('should extract the versions in reverse order if requested', () => {
      const markup = `
        @section
          @version 0.1.0
        @section
          @nested
            @version 0.2.0
        @version 0.3.0
        `

      const result = pageTransform.extractApis(quantum.select(quantum.parse(markup)), true)
      result.versions.should.eql(['0.3.0', '0.2.0', '0.1.0'])
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

  describe('buildApiMap', () => {
    const testLanguages = [{
      name: 'test-language',
      entityTypes: ['function'],
      hashEntry(selection, parent) {
        return selection.type() + ':' + selection.ps()
      },
      extractEntry(selection, previousExtraction) {
        return {
          type: selection.type(),
          name: selection.ps()
        }
      },
      buildChangelogEntries(previousEntry, entry) {
        return [
          {
            tagType: previousEntry === undefined ? 'added' : 'updated',
            type: entry.type,
            name: entry.name
          }
        ]
      }
    }]

    it('should return the new api map and a list of changelog entries', () => {
      const markup = `
        @api name
        `

      const selection = quantum.select(quantum.parse(markup))
      const languages = []

      pageTransform.buildApiMap(languages, selection, undefined).should.eql({
        apiMap: new Map(),
        changelogEntries: []
      })
    })

    it('should keep the entries from the old api map', () => {
      const markup = `
        @api name
        `

      const selection = quantum.select(quantum.parse(markup))
      const languages = []

      const oldApiMap = new Map()
      oldApiMap.set('some-entry', {
        tagType: 'added',
        apiEntry: quantum.select({type: 'function', params: ['name'], content: []})
      })

      const result = pageTransform.buildApiMap(languages, selection, oldApiMap)

      result.apiMap.size.should.eql(1)

      result.apiMap.get('some-entry').should.eql({
        tagType: 'added',
        apiEntry: quantum.select({type: 'function', params: ['name'], content: []})
      })
    })

    it('should add new entries found in the api', () => {
      const markup = `
        @api name
          @function testFunc
        `

      const selection = quantum.select(quantum.parse(markup))
      const languages = testLanguages

      const result = pageTransform.buildApiMap(languages, selection, undefined)
      result.apiMap.size.should.eql(1)

      result.apiMap.get('function:testFunc').should.eql({
        type: 'function',
        name: 'testFunc'
      })
    })

    it('should generate changelog entries', () => {
      const markup = `
        @api name
          @function testFunc
        `

      const selection = quantum.select(quantum.parse(markup))
      const languages = testLanguages

      const result = pageTransform.buildApiMap(languages, selection, undefined)

      result.changelogEntries.should.eql([
        {
          language: 'test-language',
          entry: {
            tagType: 'added',
            type: 'function',
            name: 'testFunc'
          }
        }
      ])
    })

    it('should generate changelog entries using the previous entry', () => {
      const markup = `
        @api name
          @function testFunc
        `

      const selection = quantum.select(quantum.parse(markup))
      const languages = testLanguages

      const previousApiMap = new Map()
      previousApiMap.set('function:testFunc', {
        type: 'function',
        name: 'testFunc'
      })

      const result = pageTransform.buildApiMap(languages, selection, previousApiMap)

      result.changelogEntries.should.eql([
        {
          language: 'test-language',
          entry: {
            tagType: 'updated',
            type: 'function',
            name: 'testFunc'
          }
        }
      ])
    })
  })

  describe('buildDefaultChangelogEntries', () => {
    it('should create added entries for new entries', () => {
      const selection = quantum.select({
        type: 'function',
        params: [],
        content: []
      })
      const entry = {}
      const previousEntry = undefined
      const detectAdded = true
      const language = {
        name: 'test-language'
      }
      pageTransform.buildDefaultChangelogEntries(previousEntry, entry, selection, detectAdded).should.eql([{
        tagType: 'added',
        entry: entry
      }])
    })
  })
})
