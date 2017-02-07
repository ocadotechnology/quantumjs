describe('stringify', () => {
  const dom = require('..')
  const path = require('path')
  const { stringify } = dom
  it('stringifies an empty page', () => {
    return stringify([]).should.eventually.eql({
      html: '<!DOCTYPE html>\n<html>\n<head></head>\n<body class="qm-body-font"></body></html>',
      assets: []
    })
  })

  it('stringifies a page with body content', () => {
    return stringify([
      dom.create('div')
    ]).should.eventually.eql({
      html: '<!DOCTYPE html>\n<html>\n<head></head>\n<body class="qm-body-font"><div></div></body></html>',
      assets: []
    })
  })

  it('stringifies a page with body content', () => {
    return stringify([
      'Some content',
      {ignore: 'this'}
    ]).should.eventually.eql({
      html: '<!DOCTYPE html>\n<html>\n<head></head>\n<body class="qm-body-font">Some content</body></html>',
      assets: []
    })
  })

  it('stringifies a page with head content', () => {
    return stringify([
      dom.head(dom.create('title').text('title'))
    ]).should.eventually.eql({
      html: '<!DOCTYPE html>\n<html>\n<head><title>title</title></head>\n<body class="qm-body-font"></body></html>',
      assets: []
    })
  })

  it('stringifies a page with assets (embedAssets: true)', () => {
    return stringify([
      dom.asset({url: '/assets/site.js', file: path.join(__dirname, 'assets/test.js'), shared: true}),
      dom.asset({url: '/assets/site.css', file: path.join(__dirname, 'assets/test.css'), shared: true})
    ], {embedAssets: true}).should.eventually.eql({
      html: '<!DOCTYPE html>\n<html>\n<head><style>.div{ color: red; }\n</style></head>\n<body class="qm-body-font"><script>console.log(window.querySelectorAll(\'div\'))\n</script></body></html>',
      assets: []
    })
  })

  it('stringifies a page with assets (embedAssets: false)', () => {
    const elements = [
      dom.asset({url: '/assets/site.css', file: 'src/assets/site.css', shared: true}),
      dom.asset({url: '/assets/site.js', file: 'src/assets/site.js', shared: true})
    ]
    return stringify(elements, {embedAssets: false}).should.eventually.eql({
      html: '<!DOCTYPE html>\n<html>\n<head><link rel="stylesheet" href="/assets/site.css"></link></head>\n<body class="qm-body-font"><script src="/assets/site.js"></script></body></html>',
      assets: elements
    })
  })

  it('stringifies a page with assets (embedAssets: true) and non embeddable assets', () => {
    const unembeddable = dom.asset({url: '/assets/site.something', file: 'src/assets/site.something', shared: true})

    const elements = [
      dom.asset({url: '/assets/site.css', file: path.join(__dirname, 'assets/test.css'), shared: true}),
      unembeddable
    ]
    return stringify(elements, {embedAssets: true}).should.eventually.eql({
      html: '<!DOCTYPE html>\n<html>\n<head><style>.div{ color: red; }\n</style></head>\n<body class="qm-body-font"></body></html>',
      assets: [
        unembeddable
      ]
    })
  })

  it('stringifies a page with assets (embedAssets: false, assetPath: /resources)', () => {
    const elements = [
      dom.asset({url: '/assets/site.css', file: 'src/assets/site.css', shared: true}),
      dom.asset({url: '/assets/site.js', file: 'src/assets/site.js', shared: true})
    ]
    return stringify(elements, {embedAssets: false, assetPath: '/resources'}).should.eventually.eql({
      html: '<!DOCTYPE html>\n<html>\n<head><link rel="stylesheet" href="/resources/assets/site.css"></link></head>\n<body class="qm-body-font"><script src="/resources/assets/site.js"></script></body></html>',
      assets: elements
    })
  })

  it('adds content that are strings when stringifying', () => {
    return stringify([
      dom.head('Some content')
    ]).should.eventually.eql({
      html: '<!DOCTYPE html>\n<html>\n<head>Some content</head>\n<body class="qm-body-font"></body></html>',
      assets: []
    })
  })

  it('ignores content that are not strings when stringifying', () => {
    return stringify([
      dom.head({not: 'an element'})
    ]).should.eventually.eql({
      html: '<!DOCTYPE html>\n<html>\n<head></head>\n<body class="qm-body-font"></body></html>',
      assets: []
    })
  })

  it('de-duplicates head elements with the same id', () => {
    return stringify([
      dom.head(dom.create('title').text('title'), {id: 'title'}),
      dom.head(dom.create('title').text('title2'), {id: 'title'})
    ]).should.eventually.eql({
      html: '<!DOCTYPE html>\n<html>\n<head><title>title2</title></head>\n<body class="qm-body-font"></body></html>',
      assets: []
    })
  })

  it('modifies the body class correctly', () => {
    return stringify([
      dom.bodyClassed('my-class', true)
    ]).should.eventually.eql({
      html: '<!DOCTYPE html>\n<html>\n<head></head>\n<body class="qm-body-font my-class"></body></html>',
      assets: []
    })
  })
})
