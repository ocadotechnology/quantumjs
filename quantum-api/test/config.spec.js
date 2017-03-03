describe('config', () => {
  const should = require('chai').should()
  const config = require('../lib/config')

  it('provides the correct things', () => {
    config.should.be.an('object')
    config.should.have.keys(['resolve', 'defaultIssueUrl'])
    config.defaultIssueUrl.should.be.a('function')
    config.resolve.should.be.a('function')
  })

  describe('defaultIssueUrl', () => {
    const { defaultIssueUrl } = config
    it('returns undefined', () => {
      should.not.exist(defaultIssueUrl())
    })
  })

  describe('resolve', () => {
    const { resolve } = config
    it('is fine with undefined being passed in', () => {
      resolve(undefined).should.be.an.object
    })

    it('resolves targetVersions correctly', () => {
      should.not.exist(resolve(undefined).targetVersions)
      should.not.exist(resolve({}).targetVersions)
      should.not.exist(resolve({targetVersions: undefined}).targetVersions)
      resolve({targetVersions: []}).targetVersions.should.eql([])
      resolve({targetVersions: ['0.1.0', '0.2.0']}).targetVersions
        .should.eql(['0.1.0', '0.2.0'])
    })

    it('resolves languages correctly', () => {
      resolve(undefined).languages.length.should.equal(2)
      resolve({}).languages.length.should.equal(2)
      resolve({languages: []}).languages.should.eql([])
      resolve({languages: [{name: 'javascript'}, {name: 'css'}]})
        .languages.should.eql([{name: 'javascript'}, {name: 'css'}])
    })

    it('resolves changelogReverseVisibleList correctly', () => {
      resolve(undefined).changelogReverseVisibleList.should.equal(false)
      resolve({}).changelogReverseVisibleList.should.equal(false)
      resolve({changelogReverseVisibleList: false}).changelogReverseVisibleList.should.equal(false)
      resolve({changelogReverseVisibleList: true}).changelogReverseVisibleList.should.equal(true)
    })

    it('resolves changelogGroupByApi correctly', () => {
      resolve(undefined).changelogGroupByApi.should.equal(false)
      resolve({}).changelogGroupByApi.should.equal(false)
      resolve({changelogGroupByApi: false}).changelogGroupByApi.should.equal(false)
      resolve({changelogGroupByApi: true}).changelogGroupByApi.should.equal(true)
    })

    it('resolves issueUrl correctly', () => {
      function altIssueUrl (id) {
        return id
      }

      resolve(undefined).issueUrl.should.equal(config.defaultIssueUrl)
      resolve({}).issueUrl.should.equal(config.defaultIssueUrl)
      resolve({issueUrl: altIssueUrl}).issueUrl.should.equal(altIssueUrl)

      should.not.exist(resolve(undefined).issueUrl())
    })
  })
})
