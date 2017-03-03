describe('fileTransform', () => {
  const { fileTransform } = require('..')
  const { File, FileInfo } = require('quantum-js')

  it('populates a table of contents (default options)', () => {
    const page = new File({
      info: new FileInfo({
        src: 'filename.um',
        dest: 'target/filename.um'
      }),
      content: {
        content: [{
          type: 'div',
          params: [],
          content: [
            {type: 'tableOfContents', params: [], content: []},
            {type: 'topic', params: ['Topic 1'], content: ['Content']},
            {type: 'topic', params: ['Topic 2'], content: ['Content']},
            {
              type: 'topic',
              params: ['Topic 3'],
              content: [
                {type: 'section', params: ['Section 1'], content: ['Content']},
                {type: 'section', params: ['Section 2'], content: ['Content']},
                {type: 'section', params: ['Section 3'], content: ['Content']}
              ]
            }
          ]
        }]
      }
    })

    fileTransform()(page).should.eql(new File({
      info: new FileInfo({
        src: 'filename.um',
        dest: 'target/filename.um'
      }),
      content: {
        content: [{
          type: 'div',
          params: [],
          content: [
            {
              type: 'tableOfContents',
              params: [],
              content: [
                {type: 'topic', params: ['Topic 1'], content: []},
                {type: 'topic', params: ['Topic 2'], content: []},
                {
                  type: 'topic',
                  params: ['Topic 3'],
                  content: [
                    {type: 'section', params: ['Section 1'], content: []},
                    {type: 'section', params: ['Section 2'], content: []},
                    {type: 'section', params: ['Section 3'], content: []}
                  ]
                }
              ]
            },
            {type: 'topic', params: ['Topic 1'], content: ['Content']},
            {type: 'topic', params: ['Topic 2'], content: ['Content']},
            {
              type: 'topic',
              params: ['Topic 3'],
              content: [
                {type: 'section', params: ['Section 1'], content: ['Content']},
                {type: 'section', params: ['Section 2'], content: ['Content']},
                {type: 'section', params: ['Section 3'], content: ['Content']}
              ]
            }
          ]
        }]
      }
    }))
  })

  it('populates a table of contents (explicitly enabled)', () => {
    const page = new File({
      info: new FileInfo({
        src: 'filename.um',
        dest: 'target/filename.um'
      }),
      content: {
        content: [{
          type: 'div',
          params: [],
          content: [
            {type: 'tableOfContents', params: [], content: []},
            {type: 'topic', params: ['Topic 1'], content: ['Content']},
            {type: 'topic', params: ['Topic 2'], content: ['Content']},
            {
              type: 'topic',
              params: ['Topic 3'],
              content: [
                {type: 'section', params: ['Section 1'], content: ['Content']},
                {type: 'section', params: ['Section 2'], content: ['Content']},
                {type: 'section', params: ['Section 3'], content: ['Content']}
              ]
            }
          ]
        }]
      }
    })

    fileTransform({tableOfContents: {enabled: true}})(page).should.eql(new File({
      info: new FileInfo({
        src: 'filename.um',
        dest: 'target/filename.um'
      }),
      content: {
        content: [{
          type: 'div',
          params: [],
          content: [
            {
              type: 'tableOfContents',
              params: [],
              content: [
                {type: 'topic', params: ['Topic 1'], content: []},
                {type: 'topic', params: ['Topic 2'], content: []},
                {
                  type: 'topic',
                  params: ['Topic 3'],
                  content: [
                    {type: 'section', params: ['Section 1'], content: []},
                    {type: 'section', params: ['Section 2'], content: []},
                    {type: 'section', params: ['Section 3'], content: []}
                  ]
                }
              ]
            },
            {type: 'topic', params: ['Topic 1'], content: ['Content']},
            {type: 'topic', params: ['Topic 2'], content: ['Content']},
            {
              type: 'topic',
              params: ['Topic 3'],
              content: [
                {type: 'section', params: ['Section 1'], content: ['Content']},
                {type: 'section', params: ['Section 2'], content: ['Content']},
                {type: 'section', params: ['Section 3'], content: ['Content']}
              ]
            }
          ]
        }]
      }
    }))
  })

  it('doesnt populate a table of contents (explicitly disabled)', () => {
    const page = new File({
      info: new FileInfo({
        src: 'filename.um',
        dest: 'target/filename.um'
      }),
      content: {
        content: [{
          type: 'div',
          params: [],
          content: [
            {type: 'tableOfContents', params: [], content: []},
            {type: 'topic', params: ['Topic 1'], content: ['Content']},
            {type: 'topic', params: ['Topic 2'], content: ['Content']},
            {
              type: 'topic',
              params: ['Topic 3'],
              content: [
                {type: 'section', params: ['Section 1'], content: ['Content']},
                {type: 'section', params: ['Section 2'], content: ['Content']},
                {type: 'section', params: ['Section 3'], content: ['Content']}
              ]
            }
          ]
        }]
      }
    })

    fileTransform({tableOfContents: {enabled: false}})(page).should.eql(new File({
      info: new FileInfo({
        src: 'filename.um',
        dest: 'target/filename.um'
      }),
      content: {
        content: [{
          type: 'div',
          params: [],
          content: [
            {
              type: 'tableOfContents',
              params: [],
              content: []
            },
            {type: 'topic', params: ['Topic 1'], content: ['Content']},
            {type: 'topic', params: ['Topic 2'], content: ['Content']},
            {
              type: 'topic',
              params: ['Topic 3'],
              content: [
                {type: 'section', params: ['Section 1'], content: ['Content']},
                {type: 'section', params: ['Section 2'], content: ['Content']},
                {type: 'section', params: ['Section 3'], content: ['Content']}
              ]
            }
          ]
        }]
      }
    }))
  })
})
