var blanket  = require('blanket')('../lib')
var chai     = require('chai')
var should = chai.should()
var select = require('../lib').select
var parse  = require('../lib').parse

var source1 = "@tag hello\n  @tag-a [one two] three\n  @tag-b\n\n  @tag-c\n\n    some\n\n    lines\n\n    with\n\n    spaces\n\n  @tag-a";
var source2 = "@tag\n  @tag2";

describe('select', function() {

  it('should convert the parameter array to a string for single parameter', function() {
    var value;
    value = select(parse(source1)).select('tag').ps();
    value.should.eql('hello');
  });

  it('should convert the parameter array to a string for multiple parameters', function() {
    var value;
    value = select(parse(source1)).select('tag').select('tag-a').ps();
    value.should.eql('one two three');
  });

  it('should convert the parameter array to a string for multiple parameters (with alternative join string)', function() {
    var value;
    value = select(parse(source1)).select('tag').select('tag-a').ps('/');
    value.should.eql('one two/three');
  });

  it('should be able to select items by tag', function() {
    var value;
    value = select(parse(source2)).select('tag');
    value.should.eql(select({
      type: 'tag',
      params: [],
      content: [
        {
          type: 'tag2',
          params: [],
          content: []
        }
      ]
    }));
  });

  it('should be able to select items by tag with required equal to true (and no error should be thrown)', function() {
    var value;
    value = select(parse(source2)).select('tag', true);
    return value.should.eql(select({
      type: 'tag',
      params: [],
      content: [
        {
          type: 'tag2',
          params: [],
          content: []
        }
      ]
    }));
  });

  it('should selectAll correctly', function() {
    var buttons, expected, source;
    source = "@tag\n  @button a\n  @button b\n  @button c\n  @notbutton d";
    buttons = select(parse(source)).select('tag').selectAll('button');
    expected = [
      {
        type: 'button',
        params: ['a'],
        content: []
      }, {
        type: 'button',
        params: ['b'],
        content: []
      }, {
        type: 'button',
        params: ['c'],
        content: []
      }
    ].map(select);
    buttons.should.eql(expected);
  });

  it('should throw error when selected required tag that does not exist', function() {
    var s;
    s = select(parse(source2));
    chai.expect(function() { s.select('button', true)}).to.throw()
  });

  it('should correctly retrieve a parameter by position', function() {
    var s, source;
    source = "@tag one two three";
    s = select(parse(source)).select('tag', true);
    s.param(0).should.eql('one');
    s.param(1).should.eql('two');
    s.param(2).should.eql('three');
  });

  it('should return non empty content correctly', function() {
    var s = select(parse(source1)).select('tag').select('tag-c');
    s.nonEmpty().should.eql(select({
      type: 'tag-c',
      params: [],
      content: ['some', 'lines', 'with', 'spaces']
    }));
  });

  it('should select text content', function() {
    var expected, selection, source;
    source = "@tag\n  @button a\n  text1\n  @button b\n  text2\n  @button c\n  text3\n  @notbutton d\n  text4";
    selection = select(parse(source));
    expected = select({
      type: 'tag',
      params: [],
      content: ['text1', 'text2', 'text3', 'text4']
    });
    selection.select('tag').textContent().should.eql(expected);
  });

  it('should build content string correctly', function() {
    var expected, selection, source;
    source = "@tag\n  @button a\n  text1\n  @button b\n  text2\n  @button c\n  text3\n  @notbutton d\n  text4";
    selection = select(parse(source));
    expected = ['text1', 'text2', 'text3', 'text4'].join('\n');
    selection.select('tag').cs().should.eql(expected);
  });

  it('should build content string with alternative join string correctly', function() {
    var expected, selection, source;
    source = "@tag\n  @button a\n  text1\n  @button b\n  text2\n  @button c\n  text3\n  @notbutton d\n  text4";
    selection = select(parse(source));
    expected = ['text1', 'text2', 'text3', 'text4'].join('-');
    selection.select('tag').cs('-').should.eql(expected);
  });

  it('should select an item with no parameters', function() {
    select({
      type: 'button',
      content: []
    }).should.eql(select({
      type: 'button',
      content: [],
      params: []
    }));
  });

  it('should select an item with no content', function() {
    select({
      type: 'button',
      params: []
    }).should.eql(select({
      type: 'button',
      content: [],
      params: []
    }));
  });

  it('should transform things correctly', function() {
    function transform(entity){
      return entity.split("").reverse().join("")
    }
    return select({
      type: 'button',
      params: [],
      content: ['lemon', 'banana']
    }).transform(transform)
      .then(function(result){
        result.should.eql(['nomel', 'ananab'])
      })
  });

  it('should include empty lines when for cs', function() {
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

});
