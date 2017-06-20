const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs-extra'))
const { stringify, parse } = require('..')

describe('stringify', () => {
  it('stringifies as expected for the default settings (standard)', () => {
    return fs.readFileAsync('test/files/stringify/standard.um', 'utf8')
      .then((markup) => {
        stringify(parse(markup)).should.equal(markup)
      })
  })

  it('stringifies objects that look like entities', () => {
    const selection = {
      type: 'div',
      params: ['a'],
      content: [
        'Thing'
      ]
    }
    stringify(selection).should.equal('@div a: Thing')
  })
})
