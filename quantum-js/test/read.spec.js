describe('read', () => {
  const { read } = require('..')
  const filename = 'test/files/read/source1.um'

  it('works', () => {
    const expected = {
      type: '',
      params: [],
      content: [
        {
          type: 'test',
          params: [],
          content: [
            {
              type: 'button',
              params: [],
              content: ['Hello World']
            }, {
              type: 'inlinedContent',
              params: [],
              content: [
                {
                  type: 'button',
                  params: [],
                  content: ['Hello 2']
                }, {
                  type: 'last',
                  params: ['end', 'of', 'the', 'chain'],
                  content: ['Some content']
                }
              ]
            }, {
              type: 'altinline',
              params: ['source2.um'],
              content: []
            }, {
              type: 'button',
              params: [],
              content: ['Hello World 2']
            }
          ]
        }
      ]
    }

    return read(filename).should.eventually.eql(expected)
  })

  it('different entity tag kind', () => {
    const filename = 'test/files/read/source1.um'

    const expected = {
      type: '',
      params: [],
      content: [
        {
          type: 'test',
          params: [],
          content: [
            {
              type: 'button',
              params: [],
              content: ['Hello World']
            }, {
              type: 'inline',
              params: ['source2.um'],
              content: []
            }, {
              type: 'inlinedContent',
              params: [],
              content: [
                {
                  type: 'button',
                  params: [],
                  content: ['Hello 2']
                }, {
                  type: 'inline',
                  params: ['source3.um'],
                  content: []
                }
              ]
            }, {
              type: 'button',
              params: [],
              content: ['Hello World 2']
            }
          ]
        }
      ]
    }

    return read(filename, { inlineEntityType: 'altinline' }).should.eventually.eql(expected)
  })

  it('reads non um files as content', () => {
    const filename = 'test/files/read/source4.um'

    const expected = {
      type: '',
      params: [],
      content: [
        {
          type: 'test',
          params: [],
          content: [
            {
              type: 'button',
              params: [],
              content: ['Hello World']
            }, 'Expect', 'These', 'Lines', '@inline source6.um', {
              type: 'altinline',
              params: ['source2.um'],
              content: []
            }, {
              type: 'button',
              params: [],
              content: ['Hello World 2']
            }
          ]
        }
      ]
    }

    return read(filename).should.eventually.eql(expected)
  })

  it('reads non um files as um files with parse specified as the second parameter', () => {
    const filename = 'test/files/read/source7.um'

    const expected = {
      type: '',
      params: [],
      content: [
        {
          type: 'test',
          params: [],
          content: [
            {
              type: 'button',
              params: [],
              content: ['Hello World']
            },
            {
              type: 'inlinedContent',
              params: [],
              content: [
                {
                  type: 'button',
                  params: [],
                  content: ['Hello 2']
                }
              ]
            },
            '@inlinedContent',
            '  @button: Hello 2',
            {
              type: 'button',
              params: [],
              content: ['Hello World 2']
            }
          ]
        }
      ]
    }

    return read(filename).should.eventually.eql(expected)
  })

  it('returns an error when a file is not found', () => {
    return read('test/files/read/not-a-source.um').should.be.rejected
  })

  it('doesnt inline if inline is false', () => {
    const filename = 'test/files/read/source2.um'

    const expected = {
      type: '',
      params: [],
      content: [
        {
          type: 'inlinedContent',
          params: [],
          content: [
            {
              type: 'button',
              params: [],
              content: ['Hello 2']
            },
            {
              type: 'inline',
              params: ['source3.um'],
              content: []
            }
          ]
        }
      ]
    }

    return read(filename, {inline: false}).should.eventually.eql(expected)
  })

  it('inlines multiple files', () => {
    const filename = 'test/files/read/source9.um'

    const expected = {
      type: '',
      params: [],
      content: [
        {
          type: 'inlinedContent',
          params: [],
          content: [
            {
              type: 'div',
              params: ['file1'],
              content: ['Part1']
            },
            {
              type: 'div',
              params: ['file1'],
              content: ['Part2']
            },
            {
              type: 'div',
              params: ['file2'],
              content: ['Part1']
            },
            {
              type: 'div',
              params: ['file2'],
              content: ['Part2']
            },
            {
              type: 'div',
              params: ['file3'],
              content: ['Part1']
            },
            {
              type: 'div',
              params: ['file3'],
              content: ['Part2']
            }
          ]
        }
      ]
    }

    return read(filename).should.eventually.eql(expected)
  })

  it('yields an error when parsing fails', () => {
    const filename = 'test/files/read/invalid.um'
    return read(filename).should.eventually.be.rejected
  })
})

describe('readAsFile', () => {
  const { readAsFile, File, FileInfo } = require('..')
  const filename = 'test/files/read/source1.um'
  it('readAsFile works', () => {
    const expected = new File({
      info: new FileInfo({
        src: filename,
        dest: filename
      }),
      content: {
        type: '',
        params: [],
        content: [
          {
            type: 'test',
            params: [],
            content: [
              {
                type: 'button',
                params: [],
                content: ['Hello World']
              }, {
                type: 'inlinedContent',
                params: [],
                content: [
                  {
                    type: 'button',
                    params: [],
                    content: ['Hello 2']
                  }, {
                    type: 'last',
                    params: ['end', 'of', 'the', 'chain'],
                    content: ['Some content']
                  }
                ]
              }, {
                type: 'altinline',
                params: ['source2.um'],
                content: []
              }, {
                type: 'button',
                params: [],
                content: ['Hello World 2']
              }
            ]
          }
        ]
      }
    })

    return readAsFile(filename).should.eventually.eql(expected)
  })
})
