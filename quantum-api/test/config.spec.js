'use strict'

const chai = require('chai')
const config = require('../lib/config')

const should = chai.should()

describe('config.resolve', () => {
  it('should be fine with undefined being passed in', () => {
    config.resolve(undefined).should.be.an.object
  })

  it('should resolve targetVersions correctly', () => {
    should.not.exist(config.resolve(undefined).targetVersions)
    should.not.exist(config.resolve({}).targetVersions)
    should.not.exist(config.resolve({targetVersions: undefined}).targetVersions)
    config.resolve({targetVersions: []}).targetVersions.should.eql([])
    config.resolve({targetVersions: ['0.1.0', '0.2.0']}).targetVersions
      .should.eql(['0.1.0', '0.2.0'])
  })

  it('should resolve languages correctly', () => {
    config.resolve(undefined).languages.length.should.equal(2)
    config.resolve({}).languages.length.should.equal(2)
    config.resolve({languages: []}).languages.should.eql([])
    config.resolve({languages: [{name: 'javascript'}, {name: 'css'}]})
      .languages.should.eql([{name: 'javascript'}, {name: 'css'}])
  })

  it('should resolve changelogReverseVisibleList correctly', () => {
    config.resolve(undefined).changelogReverseVisibleList.should.equal(false)
    config.resolve({}).changelogReverseVisibleList.should.equal(false)
    config.resolve({changelogReverseVisibleList: false}).changelogReverseVisibleList.should.equal(false)
    config.resolve({changelogReverseVisibleList: true}).changelogReverseVisibleList.should.equal(true)
  })

  it('should resolve changelogGroupByApi correctly', () => {
    config.resolve(undefined).changelogGroupByApi.should.equal(false)
    config.resolve({}).changelogGroupByApi.should.equal(false)
    config.resolve({changelogGroupByApi: false}).changelogGroupByApi.should.equal(false)
    config.resolve({changelogGroupByApi: true}).changelogGroupByApi.should.equal(true)
  })

  it('should resolve issueUrl correctly', () => {
    function altIssueUrl (id) {
      return id
    }

    config.resolve(undefined).issueUrl.should.equal(config.defaultIssueUrl)
    config.resolve({}).issueUrl.should.equal(config.defaultIssueUrl)
    config.resolve({issueUrl: altIssueUrl}).issueUrl.should.equal(altIssueUrl)

    should.not.exist(config.resolve(undefined).issueUrl())
  })
})
