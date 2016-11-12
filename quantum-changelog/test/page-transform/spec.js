'use strict'

const chai = require('chai')
const changelog = require('../..')
const path = require('path')
const quantum = require('quantum-js')

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
})
