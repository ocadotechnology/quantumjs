const { File, FileInfo } = require('..')

describe('File', () => {
  const fileInfo1 = new FileInfo({
    src: 'src/content/a1.um',
    resolved: 'a1.um',
    base: 'src/content',
    dest: 'target/a1.um',
    watch: true
  })

  const fileInfo2 = new FileInfo({
    src: 'src/content/a2.um',
    resolved: 'a2.um',
    base: 'src/content',
    dest: 'target/a2.um',
    watch: true
  })

  const content1 = []
  const content2 = ['some content']
  const meta1 = {}
  const meta2 = { key: { innerKey: 'value' } }
  const meta3 = { key: { innerKey2: 'value2' } }

  it('uses the options to set up the properties', () => {
    const file = new File({
      info: fileInfo1,
      content: content1,
      meta: meta1
    })

    file.info.should.equal(fileInfo1)
    file.content.should.equal(content1)
    file.meta.should.equal(meta1)
  })

  it('uses defaults for content and meta', () => {
    const file = new File({
      info: fileInfo1
    })

    file.info.should.equal(fileInfo1)
    file.content.should.eql([])
    file.meta.should.eql({})
  })

  describe('File::warning', () => {
    it('stores warnings', () => {
      const file = new File({
        info: fileInfo1
      })

      file.warning({
        module: 'quantum-core',
        problem: 'something broke',
        resolution: 'fix it'
      })

      file.warnings.should.eql([
        {
          module: 'quantum-core',
          problem: 'something broke',
          resolution: 'fix it'
        }
      ])
    })
  })

  describe('File::error', () => {
    it('stores errors', () => {
      const file = new File({
        info: fileInfo1
      })

      file.error({
        module: 'quantum-core',
        problem: 'something broke',
        resolution: 'fix it'
      })

      file.errors.should.eql([
        {
          module: 'quantum-core',
          problem: 'something broke',
          resolution: 'fix it'
        }
      ])
    })
  })

  describe('File::clone', () => {
    const file = new File({
      info: fileInfo1,
      content: content1,
      meta: meta1
    })

    it('looks the same after cloning', () => {
      file.clone().should.eql(file)
    })

    it('changes the file property', () => {
      file.clone({info: fileInfo2}).should.eql(new File({
        info: fileInfo2,
        content: content1,
        meta: meta1
      }))

      // check the original page was untouched
      file.should.eql(new File({
        info: fileInfo1,
        content: content1,
        meta: meta1
      }))
    })

    it('changes the content property', () => {
      file.clone({content: content2}).should.eql(new File({
        info: fileInfo1,
        content: content2,
        meta: meta1
      }))

      // check the original page was untouched
      file.should.eql(new File({
        info: fileInfo1,
        content: content1,
        meta: meta1
      }))
    })

    it('changes the meta property', () => {
      file.clone({meta: meta2}).should.eql(new File({
        info: fileInfo1,
        content: content1,
        meta: meta2
      }))

      // check the original page was untouched
      file.should.eql(new File({
        info: fileInfo1,
        content: content1,
        meta: meta1
      }))
    })

    it('merges changes into the meta property', () => {
      file.clone({meta: meta2}).clone({meta: meta3}).should.eql(new File({
        info: fileInfo1,
        content: content1,
        meta: {
          key: {
            innerKey: 'value',
            innerKey2: 'value2'
          }
        }
      }))

      // check the original page was untouched
      file.should.eql(new File({
        info: fileInfo1,
        content: content1,
        meta: meta1
      }))
    })

    it('clones warnings and errors', () => {
      const clone = file.clone()
      clone.warning({
        module: 'quantum-core',
        problem: 'warning: something broke',
        resolution: 'fix it'
      })
      clone.error({
        module: 'quantum-core',
        problem: 'error: something broke',
        resolution: 'fix it'
      })

      clone.clone().should.eql(new File({
        info: fileInfo1,
        content: content1,
        warnings: [
          {
            module: 'quantum-core',
            problem: 'warning: something broke',
            resolution: 'fix it'
          }
        ],
        errors: [
          {
            module: 'quantum-core',
            problem: 'error: something broke',
            resolution: 'fix it'
          }
        ]
      }))
    })

    it('allows changes to warnings and errors when cloning', () => {
      file.clone({
        warnings: [{
          module: 'quantum-core',
          problem: 'warning: something broke',
          resolution: 'fix it'
        }],
        errors: [{
          module: 'quantum-core',
          problem: 'error: something broke',
          resolution: 'fix it'
        }]
      }).should.eql(new File({
        info: fileInfo1,
        content: content1,
        warnings: [
          {
            module: 'quantum-core',
            problem: 'warning: something broke',
            resolution: 'fix it'
          }
        ],
        errors: [
          {
            module: 'quantum-core',
            problem: 'error: something broke',
            resolution: 'fix it'
          }
        ]
      }))

      // check the original page was untouched
      file.should.eql(new File({
        info: fileInfo1,
        content: content1,
        meta: meta1
      }))
    })
  })
})
