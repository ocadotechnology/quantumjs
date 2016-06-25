const chai = require('chai')
const should = chai.should()

const html = require('quantum-html')
const api = require('..')

const quantum = require('quantum-js')
const Page = quantum.Page
const File = quantum.File

function testCase (test) {
  const transform = html({ transforms: {api: api()}})
  const page = new Page({
    file: new File({
      src: 'whatever.um',
      dest: 'whatever.um'
    }),
    content: quantum.parse(test.select('um').cs()),
    meta: {}
  })

  return transform(page)
    .then(res => res.content.body.stringify())
    .then(res => res.substring(6, res.length - 7)) // remove the <body></body> wrapper
    .then(res => test.select('html').cs().should.equal(res))
}

describe('api', () => {
  quantum.read('test/spec.um').then((content) => {
    quantum.select(content).selectAll('describe').forEach((desc) => {
      describe(desc.ps(), () => {
        desc.selectAll('it').forEach((itt) => {
          it(itt.ps(), function () {
            return testCase(itt)
          })
        })
      })
    })
    run()
  })
})

describe('api', () => {
  it('should be a function', () => {
    api.should.be.a.function
  })
})
