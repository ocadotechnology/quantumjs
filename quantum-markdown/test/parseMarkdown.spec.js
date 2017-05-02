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
})
