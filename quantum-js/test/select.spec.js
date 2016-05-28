var chai = require('chai')
var should = chai.should()
var select = require('../lib').select
var parse = require('../lib').parse

var source1 = '@tag hello\n  @tag-a [one two] three\n  @tag-b\n\n  @tag-c\n\n    some\n\n    lines\n\n    with\n\n    spaces\n\n  @tag-a'
var source2 = '@tag\n  @tag2'

describe('select', function () {
  it('should convert the parameter array to a string for single parameter', function () {
    select(parse(source1)).select('tag').ps().should.eql('hello')
  })

  it('should convert the parameter array to a string for multiple parameters', function () {
    select(parse(source1)).select('tag').select('tag-a').ps().should.eql('one two three')
  })

  it('should convert the parameter array to a string for multiple parameters (with alternative join string)', function () {
    select(parse(source1)).select('tag').select('tag-a').ps('/').should.eql('one two/three')
  })

  it('should retain a copy of the original', function () {
    var parsed = parse(source1)
    select(parsed).original.should.eql(parsed)
  })

  it('should be able to select items by tag', function () {
    var parsed = parse(source2)
    select(parsed).select('tag').type.should.equal('tag')
    select(parsed).select('tag').params.should.eql([])
    select(parsed).select('tag').content.should.eql([
      {
        type: 'tag2',
        params: [],
        content: []
      }
    ])
  })

  it('should be able to select items by tag with required equal to true (and no error should be thrown)', function () {
    var parsed = parse(source2)
    select(parsed).select('tag', {required: true}).type.should.equal('tag')
    select(parsed).select('tag', {required: true}).params.should.eql([])
    select(parsed).select('tag', {required: true}).content.should.eql([
      {
        type: 'tag2',
        params: [],
        content: []
      }
    ])
  })

  it('should selectAll correctly', function () {
    var source = '@tag\n  @button a\n  @button b\n  @button c\n  @notbutton d'
    var parsed = parse(source)
    select(parsed).select('tag').selectAll('button').should.eql([
      select(parsed).selectAll('button', {recursive: true})[0],
      select(parsed).selectAll('button', {recursive: true})[1],
      select(parsed).selectAll('button', {recursive: true})[2]
    ])
  })

  it('should throw error when selected required tag that does not exist', function () {
    var s = select(parse(source2))
    chai.expect(function () { s.select('button', {required: true})}).to.throw()
  })

  it('should correctly retrieve a parameter by position', function () {
    var source = '@tag one two three'
    var s = select(parse(source)).select('tag', true)
    s.param(0).should.eql('one')
    s.param(1).should.eql('two')
    s.param(2).should.eql('three')
  })

  it('should return non empty content correctly', function () {
    var selection = select(parse(source1))
      .select('tag')
      .select('tag-c')

    var expected = select({
      type: 'tag-c',
      params: [],
      content: ['some', 'lines', 'with', 'spaces']
    })

    expected.original = selection.original

    selection.nonEmpty().should.eql(expected)
  })

  it('should select text content', function () {
    var source = '@tag\n  @button a\n  text1\n  @button b\n  text2\n  @button c\n  text3\n  @notbutton d\n  text4'
    var selection = select(parse(source)).select('tag')
    var expected = select({
      type: 'tag',
      params: [],
      content: ['text1', 'text2', 'text3', 'text4']
    })
    expected.original = selection.original
    selection.textContent().should.eql(expected)
  })

  it('should build content string correctly', function () {
    var source = '@tag\n  @button a\n  text1\n  @button b\n  text2\n  @button c\n  text3\n  @notbutton d\n  text4'
    var selection = select(parse(source))
    var expected = ['text1', 'text2', 'text3', 'text4'].join('\n')
    selection.select('tag').cs().should.eql(expected)
  })

  it('should build content string with alternative join string correctly', function () {
    var source = '@tag\n  @button a\n  text1\n  @button b\n  text2\n  @button c\n  text3\n  @notbutton d\n  text4'
    var selection = select(parse(source))
    var expected = ['text1', 'text2', 'text3', 'text4'].join('-')
    selection.select('tag').cs('-').should.eql(expected)
  })

  it('should select an item with no parameters', function () {
    var expected = select({
      type: 'button',
      content: [],
      params: []
    })

    expected.original = {
      type: 'button',
      content: []
    }

    select({
      type: 'button',
      content: []
    }).should.eql(expected)
  })

  it('should select an item with no content', function () {
    var expected = select({
      type: 'button',
      content: [],
      params: []
    })

    expected.original = {
      type: 'button',
      params: []
    }

    select({
      type: 'button',
      params: []
    }).should.eql(expected)
  })

  it('should transform things correctly', function () {
    function transform (entity) {
      return entity.split('').reverse().join('')
    }
    return select({
      type: 'button',
      params: [],
      content: ['lemon', 'banana']
    }).transform(transform)
      .then(function (result) {
        result.should.eql(['nomel', 'ananab'])
      })
  })

  it('should include empty lines when for cs', function () {
    select({
      type: 'fruits',
      params: ['ripe'],
      content: [
        '',
        {
          type: 'banana',
          params: [],
          content: []
        },
        '  ',
        {
          type: 'lychee',
          params: [],
          content: []
        },
        'strawberry'
      ]
    }).cs().should.equal('\n  \nstrawberry')
  })

  it('should be able to replace params', function () {
    var entity = {
      type: 'fruits',
      params: ['ripe'],
      content: [
        'lychee',
        'banana'
      ]
    }

    select(entity).replaceParams(['unripe'])
    entity.params.should.eql(['unripe'])
  })

  it('should be able to replace content', function () {
    var entity = {
      type: 'fruits',
      params: ['ripe'],
      content: [
        'lychee',
        'banana'
      ]
    }

    select(entity).replaceContent(['apple', 'pear', 'cherry'])
    entity.content.should.eql(['apple', 'pear', 'cherry'])
  })

})
