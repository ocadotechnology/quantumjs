'use strict'
const chai = require('chai')

const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs-extra'))

const quantum = require('../lib')
const write = quantum.write
const path = require('path')

const File = quantum.File
const Page = quantum.Page

describe('write', () => {
  const file1 = new File({
    src: 'src/content/a1.um',
    resolved: 'a1.um',
    base: 'src/content',
    dest: 'target/write/a1.um'
  })

  const file2 = new File({
    src: 'src/content/a2.um',
    resolved: 'a2.um',
    base: 'src/content',
    dest: 'target/write/a2.um'
  })

  const file3 = new File({
    src: 'src/content/a2.um',
    resolved: 'a2.um',
    base: 'src/content',
    dest: 'target/write/a3.um'
  })

  const page1 = new Page({
    file: file1,
    content: [ 'some content 1' ],
    meta: {}
  })

  const page2 = new Page({
    file: file2,
    content: [ 'some content 2' ],
    meta: {}
  })

  const page3 = new Page({
    file: file3,
    content: [ 'some content 3' ],
    meta: {}
  })

  const currDir = process.cwd()
  before(() => {
    chai.should()
    process.chdir(path.join(__dirname, '../'))
  })
  after(() => process.chdir(currDir))

  it('should write a file', () => {
    return write(page1)
      .map((page) => {
        page.should.eql(page1)

        return fs.readFileAsync(page.file.dest, 'utf-8')
          .then(file => file.should.equal('some content 1'))
      })
  })

  it('should write an array of files', () => {
    return write([ page2, page3 ])
      .map((page, index) => {
        page.should.eql(index === 0 ? page2 : page3)

        return fs.readFileAsync(page.file.dest, 'utf-8')
          .then(res => res.should.equal('some content ' + (index + 2)))
      })
  })
})
