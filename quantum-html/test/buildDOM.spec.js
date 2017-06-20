describe('buildDOM', () => {
  const { File, FileInfo } = require('quantum-core')
  const { buildDOM } = require('..')
  it('entityTransforms a file', () => {
    const file = new File({
      info: new FileInfo({
        src: 'filename.um',
        dest: 'filename.um'
      }),
      content: {
        content: [{
          type: 'div',
          params: [],
          content: ['Content']
        }]
      }
    })

    return buildDOM({includeCommonMetaTags: false})(file)
      .then((file) => {
        file.info.dest.should.equal('filename.um')
        file.content.elements.length.should.equal(1)
        file.content.elements[0].type.should.equal('div')
      })
  })

  it('uses the default renderer when a type is unknown', () => {
    const file = new File({
      info: new FileInfo({
        src: 'filename.um',
        dest: 'filename.um'
      }),
      content: {
        content: [{
          type: 'notaknowntype',
          params: [],
          content: ['Content']
        }]
      }
    })

    return buildDOM({includeCommonMetaTags: false})(file)
      .then((file) => {
        file.info.dest.should.equal('filename.um')
        file.content.elements.length.should.equal(1)
        file.content.elements[0].should.equal('Content')
      })
  })

  describe('element', () => {
    it('generates a basic div properly', () => {
      const file = new File({
        info: new FileInfo({
          src: 'filename.um',
          dest: 'filename.um'
        }),
        content: {
          content: [{
            type: 'div',
            params: [],
            content: []
          }]
        }
      })

      return buildDOM({includeCommonMetaTags: false})(file)
        .then((file) => {
          file.info.dest.should.equal('filename.um')
          file.content.elements.length.should.equal(1)
          file.content.elements[0].type.should.equal('div')
        })
    })

    describe('shorthand:', () => {
      it('single class', () => {
        const file = new File({
          info: new FileInfo({
            src: 'filename.um',
            dest: 'filename.um'
          }),
          content: {
            content: [{
              type: 'div',
              params: ['.strawberry'],
              content: []
            }]
          }
        })

        return buildDOM({includeCommonMetaTags: false})(file)
          .then((file) => {
            file.info.dest.should.equal('filename.um')
            file.content.elements[0].type.should.equal('div')
            file.content.elements[0].attrs['class'].should.equal('strawberry')
            file.content.elements.length.should.equal(1)
          })
      })

      it('de-duplicates classes', () => {
        const file = new File({
          info: new FileInfo({
            src: 'filename.um',
            dest: 'filename.um'
          }),
          content: {
            content: [{
              type: 'div',
              params: ['.strawberry.strawberry'],
              content: []
            }]
          }
        })

        return buildDOM({includeCommonMetaTags: false})(file)
          .then((file) => {
            file.info.dest.should.equal('filename.um')
            file.content.elements[0].type.should.equal('div')
            file.content.elements[0].attrs['class'].should.equal('strawberry')
            file.content.elements.length.should.equal(1)
          })
      })

      it('multiple classes', () => {
        const file = new File({
          info: new FileInfo({
            src: 'filename.um',
            dest: 'filename.um'
          }),
          content: {
            content: [{
              type: 'div',
              params: ['.strawberry.banana'],
              content: []
            }]
          }
        })

        return buildDOM({includeCommonMetaTags: false})(file)
          .then((file) => {
            file.info.dest.should.equal('filename.um')
            file.content.elements[0].type.should.equal('div')
            file.content.elements[0].attrs['class'].should.equal('strawberry banana')
            file.content.elements.length.should.equal(1)
          })
      })

      it('id', () => {
        const file = new File({
          info: new FileInfo({
            src: 'filename.um',
            dest: 'filename.um'
          }),
          content: {
            content: [{
              type: 'div',
              params: ['#strawberry'],
              content: []
            }]
          }
        })

        return buildDOM({includeCommonMetaTags: false})(file)
          .then((file) => {
            file.info.dest.should.equal('filename.um')
            file.content.elements[0].type.should.equal('div')
            file.content.elements[0].attrs['id'].should.equal('strawberry')
            file.content.elements.length.should.equal(1)
          })
      })

      it('mixed classes and id', () => {
        const file = new File({
          info: new FileInfo({
            src: 'filename.um',
            dest: 'filename.um'
          }),
          content: {
            content: [{
              type: 'div',
              params: ['#strawberry.banana'],
              content: []
            }]
          }
        })

        return buildDOM({includeCommonMetaTags: false})(file)
          .then((file) => {
            file.info.dest.should.equal('filename.um')
            file.content.elements[0].type.should.equal('div')
            file.content.elements[0].attrs['id'].should.equal('strawberry')
            file.content.elements[0].attrs['class'].should.equal('banana')
            file.content.elements.length.should.equal(1)
          })
      })
    })
  })
})
