const should = require('chai').should()

const quantum = require('..')
const File = quantum.File
const Page = quantum.Page

describe('Page', () => {
  const file1 = new File({
    src: 'src/content/a1.um',
    resolved: 'a1.um',
    base: 'src/content',
    dest: 'target/a1.um',
    watch: true
  })

  const file2 = new File({
    src: 'src/content/a2.um',
    resolved: 'a2.um',
    base: 'src/content',
    dest: 'target/a2.um',
    watch: true
  })

  const content1 = []
  const content2 = ['some content']
  const meta1 = {}
  const meta2 = { key: { innerKey: 'value'}}
  const meta3 = { key: { innerKey2: 'value2', }}

  it('should use the options to set up the properties', () => {
    const page = new Page({
      file: file1,
      content: content1,
      meta: meta1
    })

    page.file.should.equal(file1)
    page.content.should.equal(content1)
    page.meta.should.equal(meta1)
  })

  it('should use defaults for content and meta', () => {
    const page = new Page({
      file: file1
    })

    page.file.should.equal(file1)
    page.content.should.eql([])
    page.meta.should.eql({})
  })

  describe('Page::clone', () => {
    const page = new Page({
      file: file1,
      content: content1,
      meta: meta1
    })

    it('should look the same after cloning', () => {
      page.clone().should.eql(page)
    })

    it('should change the file property', () => {
      page.clone({file: file2}).should.eql(new Page({
        file: file2,
        content: content1,
        meta: meta1
      }))

      // check the original page was untouched
      page.should.eql(new Page({
        file: file1,
        content: content1,
        meta: meta1
      }))
    })

    it('should change the content property', () => {
      page.clone({content: content2}).should.eql(new Page({
        file: file1,
        content: content2,
        meta: meta1
      }))

      // check the original page was untouched
      page.should.eql(new Page({
        file: file1,
        content: content1,
        meta: meta1
      }))
    })

    it('should change the meta property', () => {
      page.clone({meta: meta2}).should.eql(new Page({
        file: file1,
        content: content1,
        meta: meta2
      }))

      // check the original page was untouched
      page.should.eql(new Page({
        file: file1,
        content: content1,
        meta: meta1
      }))
    })

    it('should merge changes into the meta property', () => {
      page.clone({meta: meta2}).clone({meta: meta3}).should.eql(new Page({
        file: file1,
        content: content1,
        meta: {
          key: {
            innerKey: 'value',
            innerKey2: 'value2'
          }
        }
      }))

      // check the original page was untouched
      page.should.eql(new Page({
        file: file1,
        content: content1,
        meta: meta1
      }))
    })
  })

})
