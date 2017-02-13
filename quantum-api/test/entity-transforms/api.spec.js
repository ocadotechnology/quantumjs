describe('api', () => {
  const path = require('path')
  const quantum = require('quantum-js')
  const dom = require('quantum-dom')
  const html = require('quantum-html')
  const api = require('../../lib/entity-transforms/api')
  const body = require('../../lib/entity-transforms/builders/body')

  it('works with defaults', () => {
    const selection = quantum.select({
      type: 'api',
      params: [],
      content: [
        {
          type: 'description',
          params: [],
          content: ['Some description']
        }
      ]
    })

    api()(selection).should.eql(
      dom.create('div')
        .class('qm-api')
        .add(dom.asset({
          url: '/quantum-api.css',
          file: path.join(__dirname, '../../assets/quantum-api.css'),
          shared: true
        }))
        .add(dom.asset({
          url: '/quantum-api.js',
          file: path.join(__dirname, '../../assets/quantum-api.js'),
          shared: true
        }))
    )
  })

  it('works with custom builders', () => {
    const selection = quantum.select({
      type: 'api',
      params: [],
      content: [
        {
          type: 'description',
          params: [],
          content: ['Some description']
        }
      ]
    })

    const builders = [
      body.description
    ]

    api({builders})(selection).should.eql(
      dom.create('div')
        .class('qm-api')
        .add(dom.create('div')
          .class('qm-api-description')
          .add(html.paragraphTransform(quantum.select({
            type: 'description',
            params: [],
            content: ['Some description']
          }))))
        .add(dom.asset({
          url: '/quantum-api.css',
          file: path.join(__dirname, '../../assets/quantum-api.css'),
          shared: true
        }))
        .add(dom.asset({
          url: '/quantum-api.js',
          file: path.join(__dirname, '../../assets/quantum-api.js'),
          shared: true
        }))

    )
  })

  it('adds the language assets correctly', () => {
    const selection = quantum.select({
      type: 'api',
      params: [],
      content: [
        {
          type: 'description',
          params: [],
          content: ['Some description']
        }
      ]
    })

    const languages = [
      {
        assets: [
          dom.asset({
            url: '/language.css',
            file: 'some-path.css',
            shared: true
          })
        ]
      }
    ]

    api({languages})(selection).should.eql(
      dom.create('div')
        .class('qm-api')
        .add(dom.asset({
          url: '/quantum-api.css',
          file: path.join(__dirname, '../../assets/quantum-api.css'),
          shared: true
        }))
        .add(dom.asset({
          url: '/quantum-api.js',
          file: path.join(__dirname, '../../assets/quantum-api.js'),
          shared: true
        }))
        .add(dom.asset({
          url: '/language.css',
          file: 'some-path.css',
          shared: true
        }))
    )
  })
})
