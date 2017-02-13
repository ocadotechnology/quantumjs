describe('mostRecentVersion', () => {
  const should = require('chai').should()
  const quantum = require('quantum-js')
  const { mostRecentVersion } = require('../lib/lib')
  it('works when versions all line up (vanilla case)', () => {
    const version = '0.2.0'
    const candidateVersions = ['0.1.0', '0.2.0', '0.3.0']
    const targetVersions = ['0.1.0', '0.2.0', '0.3.0']

    const candidateVersionSelections = candidateVersions.map(v => {
      return quantum.select({
        type: 'version',
        params: [v],
        content: []
      })
    })

    const selectedVersion = mostRecentVersion(version, candidateVersionSelections, targetVersions)
    selectedVersion.ps().should.eql('0.2.0')
  })

  it('picks the most recent, when there is a version missing', () => {
    const version = '0.2.0'
    const candidateVersions = ['0.1.0', '0.3.0']
    const targetVersions = ['0.1.0', '0.2.0', '0.3.0']

    const candidateVersionSelections = candidateVersions.map(v => {
      return quantum.select({
        type: 'version',
        params: [v],
        content: []
      })
    })

    const selectedVersion = mostRecentVersion(version, candidateVersionSelections, targetVersions)
    selectedVersion.ps().should.eql('0.1.0')
  })

  it('picks the most recent, when out of range of the candidate versions', () => {
    const version = '0.4.0'
    const candidateVersions = ['0.1.0', '0.3.0']
    const targetVersions = ['0.1.0', '0.2.0', '0.3.0', '0.4.0']

    const candidateVersionSelections = candidateVersions.map(v => {
      return quantum.select({
        type: 'version',
        params: [v],
        content: []
      })
    })

    const selectedVersion = mostRecentVersion(version, candidateVersionSelections, targetVersions)
    selectedVersion.ps().should.eql('0.3.0')
  })

  it('returns undefined when before any of the candidate versions', () => {
    const version = '0.1.0'
    const candidateVersions = ['0.3.0', '0.4.0']
    const targetVersions = ['0.1.0', '0.3.0', '0.4.0']

    const candidateVersionSelections = candidateVersions.map(v => {
      return quantum.select({
        type: 'version',
        params: [v],
        content: []
      })
    })

    const selectedVersion = mostRecentVersion(version, candidateVersionSelections, targetVersions)
    should.not.exist(selectedVersion)
  })

  it('returns undefined when there are no candidateVersions', () => {
    const version = '0.1.0'
    const candidateVersions = []
    const targetVersions = ['0.1.0', '0.3.0', '0.4.0']

    const candidateVersionSelections = candidateVersions.map(v => {
      return quantum.select({
        type: 'version',
        params: [v],
        content: []
      })
    })

    const selectedVersion = mostRecentVersion(version, candidateVersionSelections, targetVersions)
    should.not.exist(selectedVersion)
  })
})
