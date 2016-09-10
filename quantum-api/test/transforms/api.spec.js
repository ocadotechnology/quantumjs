const chai = require('chai')
const path = require('path')
const quantum = require('quantum-js')
const dom = require('quantum-dom')
const api = require('../../lib/transforms/api')

chai.should()

describe('api', () => {
  it('should work with defaults', () => {
    const selection = quantum.select({
      type: 'api',
      params: [],
      content: []
    })

    api()(selection).should.eql(
      dom.create('div')
        .class('qm-api')
        .add(dom.asset({
          url: '/assets/quantum-api.css',
          file: path.join(__dirname, '../../assets/quantum-api.css'),
          shared: true
        }))
        .add(dom.asset({
          url: '/assets/quantum-api.js',
          file: path.join(__dirname, '../../assets/quantum-api.js'),
          shared: true
        }))
    )
  })
})
