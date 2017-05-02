describe('parseMarkdown', () => {
  const path = require('path')
  const fs = require('fs')

  function readFile (file) {
    return fs.readFileSync(path.join(__dirname, 'parseMarkdown', file), 'utf8')
  }
  const { parseMarkdown } = require('..')

  it('parses markdown cheatsheet to html', () => {
    return parseMarkdown(readFile('complete.md')).should.equal(readFile('complete.html'))
  })

  describe('code highlighting', () => {
    it('renders highlighted code', () => {
      return parseMarkdown(readFile('highlight.md')).should.equal(readFile('highlight.html'))
    })
  })

  describe('table of contents', () => {
    it('renders a basic table of contents', () => {
      return parseMarkdown(readFile('basic-toc.md')).should.equal(readFile('basic-toc.html'))
    })

    it('handles duplicate headings correctly', () => {
      return parseMarkdown(readFile('duplicate-toc.md')).should.equal(readFile('duplicate-toc.html'))
    })
  })
})
