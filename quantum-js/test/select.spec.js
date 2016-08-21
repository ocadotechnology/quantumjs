var chai = require('chai')
var should = chai.should()
var expect = chai.expect

var quantum = require('..')
var select = quantum.select

describe('select', function () {
  it('should throw an error when something that is not an entity is passed in', function () {
    expect(function () {
      select(123)
    }).to.throw()
  })

  it('should return a Selection', function () {
    select({type: 'tag', params: [], content: []}).should.be.an.instanceof(select.Selection)
  })

  it('isSelection should work', function () {
    select.isSelection(new select.Selection()).should.equal(true)
    select.isSelection({}).should.equal(false)
  })

  it('should flatten', function () {
    select(select({type: 'tag', params: [], content: []})).should.be.an.instanceof(select.Selection)
  })

  describe('select.isEntity', function () {
    it('should return true for an object that looks like an entity', function () {
      select.isEntity({type: 'tag', params: [], content: []}).should.equal(true)
    })

    it('should return false for an object has missing or incorrect type field', function () {
      select.isEntity({params: [], content: []}).should.equal(false)
      select.isEntity({type: 123, params: [], content: []}).should.equal(false)
      select.isEntity({type: function () {}, params: [], content: []}).should.equal(false)
      select.isEntity({type: {}, params: [], content: []}).should.equal(false)
      select.isEntity({type: [], params: [], content: []}).should.equal(false)
      select.isEntity({type: undefined, params: [], content: []}).should.equal(false)
      select.isEntity({type: null, params: [], content: []}).should.equal(false)
      select.isEntity({type: true, params: [], content: []}).should.equal(false)
    })

    it('should return false for an object has missing or incorrect params field', function () {
      select.isEntity({type: 'tag', content: []}).should.equal(false)
      select.isEntity({type: 'tag', params: 123, content: []}).should.equal(false)
      select.isEntity({type: 'tag', params: function () {}, content: []}).should.equal(false)
      select.isEntity({type: 'tag', params: {}, content: []}).should.equal(false)
      select.isEntity({type: 'tag', params: '', content: []}).should.equal(false)
      select.isEntity({type: 'tag', params: undefined, content: []}).should.equal(false)
      select.isEntity({type: 'tag', params: null, content: []}).should.equal(false)
      select.isEntity({type: 'tag', params: true, content: []}).should.equal(false)
    })

    it('should return false for an object has missing or incorrect content field', function () {
      select.isEntity({type: 'tag', params: []}).should.equal(false)
      select.isEntity({type: 'tag', params: [], content: 123}).should.equal(false)
      select.isEntity({type: 'tag', params: [], content: function () {}}).should.equal(false)
      select.isEntity({type: 'tag', params: [], content: {}}).should.equal(false)
      select.isEntity({type: 'tag', params: [], content: ''}).should.equal(false)
      select.isEntity({type: 'tag', params: [], content: undefined}).should.equal(false)
      select.isEntity({type: 'tag', params: [], content: null}).should.equal(false)
      select.isEntity({type: 'tag', params: [], content: true}).should.equal(false)
    })
  })

  describe('select.isText', function () {
    it('should return true for a string', function () {
      select.isText('some text').should.equal(true)
    })

    it('should return false for things that are not strings', function () {
      select.isText(null).should.equal(false)
      select.isText(undefined).should.equal(false)
      select.isText({}).should.equal(false)
      select.isText([]).should.equal(false)
      select.isText(23).should.equal(false)
      select.isText(function () {}).should.equal(false)
      select.isText(false).should.equal(false)
      select.isText(true).should.equal(false)
    })
  })

  describe('Selection::entity', function () {
    it('should return the original entity', function () {
      var entity = {type: 'tag', params: [], content: []}
      select(entity).entity().should.equal(entity)
    })
  })

  describe('Selection::type', function () {
    it('should get the type correctly', function () {
      var entity = {type: 'tag', params: [], content: []}
      select(entity).type().should.equal('tag')
    })

    it('should set the type correctly', function () {
      var entity = {type: 'tag', params: [], content: []}
      var selection = select(entity)
      selection.type().should.equal('tag')
      selection.type('name').should.equal(selection)
      selection.type().should.equal('name')
      entity.type.should.equal('name')
    })

    it('should throw an error when modifying a filtered selection', function () {
      var entity = {type: 'tag', params: [], content: []}
      var selection = select(entity).filter('whatever')
      selection.type().should.equal('tag')
      chai.expect(function () {
        selection.type('name')
      }).to.throw()
    })
  })

  describe('Selection::params', function () {
    it('should get the params correctly', function () {
      var entity = {type: 'tag', params: ['one', 'two', 'three'], content: []}
      select(entity).params().should.eql(['one', 'two', 'three'])
    })

    it('should set the params correctly', function () {
      var entity = {type: 'tag', params: ['one', 'two', 'three'], content: []}
      var selection = select(entity)
      selection.params().should.eql(['one', 'two', 'three'])
      var newParams = ['four', 'five']
      selection.params(newParams).should.equal(selection)
      selection.params().should.equal(newParams)
      entity.params.should.equal(newParams)
    })

    it('should throw an error when modifying a filtered selection', function () {
      var entity = {type: 'tag', params: [], content: []}
      var selection = select(entity).filter('whatever')
      selection.params().should.eql([])
      chai.expect(function () {
        selection.params(['name'])
      }).to.throw()
    })
  })

  describe('Selection::param', function () {
    it('should get the param correctly', function () {
      var entity = {type: 'tag', params: ['one', 'two', 'three'], content: []}
      select(entity).param(2).should.eql('three')
    })

    it('should set the param correctly', function () {
      var entity = {type: 'tag', params: ['one', 'two', 'three'], content: []}
      var selection = select(entity)
      selection.params().should.eql(['one', 'two', 'three'])
      selection.param(2, 'four').should.equal(selection)
      selection.params().should.eql(['one', 'two', 'four'])
      selection.param(2).should.equal('four')
      entity.params.should.eql(['one', 'two', 'four'])
    })

    it('should throw an error when modifying a filtered selection', function () {
      var entity = {type: 'tag', params: [], content: []}
      var selection = select(entity).filter('whatever')
      selection.params().should.eql([])
      chai.expect(function () {
        selection.param(2, 'four')
      }).to.throw()
    })
  })

  describe('Selection::content', function () {
    it('should get the content correctly', function () {
      var entity = {type: 'tag', content: ['one', 'two', 'three'], params: []}
      select(entity).content().should.eql(['one', 'two', 'three'])
    })

    it('should set the content correctly', function () {
      var entity = {type: 'tag', content: ['one', 'two', 'three'], params: []}
      var selection = select(entity)
      selection.content().should.eql(['one', 'two', 'three'])
      var newContent = ['four', 'five']
      selection.content(newContent).should.equal(selection)
      selection.content().should.equal(newContent)
      entity.content.should.equal(newContent)
    })

    it('should throw an error when modifying a filtered selection', function () {
      var entity = {type: 'tag', params: [], content: []}
      var selection = select(entity).filter('whatever')
      selection.content().should.eql([])
      chai.expect(function () {
        selection.content(['name'])
      }).to.throw()
    })
  })

  describe('Selection::has', function () {
    it('should check if an entity has a direct child correctly', function () {
      var entity = {
        type: 'tag',
        content: [
          {type: 'tagA', params: [], content: []},
          {type: 'tagB', params: [], content: [
              {type: 'tagC', params: [], content: []}
          ]}
        ],
        params: []
      }

      select(entity).has('tagA').should.equal(true)
      select(entity).has('tagA', {}).should.equal(true)
      select(entity).has('tagA', {recursive: false}).should.equal(true)
      select(entity).has('tagA', {recursive: true}).should.equal(true)

      select(entity).has('tagB').should.equal(true)
      select(entity).has('tagB', {}).should.equal(true)
      select(entity).has('tagB', {recursive: false}).should.equal(true)
      select(entity).has('tagB', {recursive: true}).should.equal(true)
    })

    it('should check if an entity has a child using the recursive option correctly', function () {
      var entity = {
        type: 'tag',
        content: [
          {type: 'tagA', params: [], content: []},
          {type: 'tagB', params: [], content: [
              {type: 'tagC', params: [], content: []}
          ]}
        ],
        params: []
      }

      select(entity).has('tagC').should.equal(false)
      select(entity).has('tagC', {}).should.equal(false)
      select(entity).has('tagC', {recursive: false}).should.equal(false)
      select(entity).has('tagC', {recursive: true}).should.equal(true)

      select(entity).has('tagD').should.equal(false)
      select(entity).has('tagD', {}).should.equal(false)
      select(entity).has('tagD', {recursive: false}).should.equal(false)
      select(entity).has('tagD', {recursive: true}).should.equal(false)
    })
  })

  describe('Selection::hasParam', function () {
    it('should check if an entity has params correctly', function () {
      var entity = {type: 'tag', content: [], params: ['Param']}
      select(entity).hasParams().should.equal(true)
    })

    it('should check if an entity has no params correctly', function () {
      var entity = {type: 'tag', content: [], params: []}
      select(entity).hasParams().should.equal(false)
    })
  })

  describe('Selection::hasContent', function () {
    it('should check if an entity has content correctly', function () {
      var entity = {type: 'tag', content: ['Content'], params: []}
      select(entity).hasContent().should.equal(true)
    })

    it('should check if an entity has no content correctly', function () {
      var entity = {type: 'tag', content: [], params: []}
      select(entity).hasContent().should.equal(false)
    })
  })

  describe('Selection::parent', function () {
    it('should return undefined when the parent is unknown', function () {
      var entity = {type: 'tag', content: [], params: []}
      should.not.exist(select(entity).parent())
    })

    it('should return the parent when known', function () {
      var child = {type: 'tag', content: [], params: []}
      var parent = {type: 'tag', content: [child], params: []}
      select(child, parent).parent().should.equal(parent)
    })

    it('should know the parent when a subselection is performed', function () {
      var entity = {type: 'tag', content: [{type: 'tagA', content: [], params: []}], params: []}
      var selection = select(entity)
      selection.select('tagA').parent().should.equal(selection)
    })

    it('should keep track of parents when doing deep selections', function () {
      var entity = {type: 'tag', content: [{type: 'tagA', content: [{type: 'tagB', params: [], content: []}], params: []}], params: []}
      var selection = select(entity)
      selection.select('tagB', {recursive: true}).parent().parent().should.equal(selection)
    })

    it('should know the parent when a multiple subselection is performed', function () {
      var entity = {
        type: 'tag',
        content: [
          {type: 'tagA', content: [], params: []},
          {type: 'tagA', content: [], params: []}
        ],
        params: []
      }

      var selection = select(entity)

      selection.selectAll('tagA').forEach(function (tagA) {
        tagA.parent().should.equal(selection)
      })
    })

    it('should refer to the filtered parent for selections after filtering', function () {
      var entity = {
        type: 'tag',
        params: [],
        content: [
          {type: 'one', params: [], content: []},
          {type: 'two', params: [], content: []},
          {type: 'three', params: [], content: []},
          'String content'
        ]
      }

      var parent = select(entity).filter('one')

      parent.select('one').parent().should.equal(parent)
    })
  })

  describe('Selection::ps', function () {
    it('should convert the parameter array to a string for single parameter', function () {
      select({type: 'tag', params: ['one'], content: []}).ps().should.equal('one')
    })

    it('should convert the parameter array to a string for multiple parameters', function () {
      select({type: 'tag', params: ['one', 'two', 'three'], content: []}).ps().should.equal('one two three')
    })

    it('should set the parameter array', function () {
      select({type: 'tag', params: [], content: []}).ps('one two three').params().should.eql(['one', 'two', 'three'])
    })

    it('should throw an error when modifying a filtered selection', function () {
      var entity = {type: 'tag', params: [], content: []}
      var selection = select(entity).filter('whatever')
      selection.ps().should.eql('')
      chai.expect(function () {
        selection.ps('name')
      }).to.throw()
    })
  })

  describe('Selection::cs', function () {
    it('should convert the content array to a string for single content', function () {
      select({type: 'tag', params: [], content: ['one']}).cs().should.equal('one')
    })

    it('should convert the content array to a string for multiple contents', function () {
      select({type: 'tag', params: [], content: ['one', 'two', 'three']}).cs().should.equal('one\ntwo\nthree')
    })

    it('should set the content array', function () {
      select({type: 'tag', params: [], content: []}).cs('one\ntwo\nthree').content().should.eql(['one', 'two', 'three'])
    })

    it('should throw an error when modifying a filtered selection', function () {
      var entity = {type: 'tag', params: [], content: []}
      var selection = select(entity).filter('whatever')
      selection.cs().should.eql('')
      chai.expect(function () {
        selection.cs('name')
      }).to.throw()
    })
  })

  describe('Selection::select', function () {
    it('should be able to select items by tag', function () {
      var entity = {content: [{type: 'tag', params: [], content: [{type: 'tagA', params: [], content: []}]}]}
      select(entity).select('tag').type().should.equal('tag')
      select(entity).select('tag').params().should.eql([])
      select(entity).select('tag').content().should.eql([
        {
          type: 'tagA',
          params: [],
          content: []
        }
      ])
    })

    it('should be able to select items by tag with required equal to true (and no error should be thrown)', function () {
      var entity = {content: [{type: 'tag', params: [], content: [{type: 'tagA', params: [], content: []}]}]}
      select(entity).select('tag', {required: true}).type().should.equal('tag')
      select(entity).select('tag', {required: true}).params().should.eql([])
      select(entity).select('tag', {required: true}).content().should.eql([
        {
          type: 'tagA',
          params: [],
          content: []
        }
      ])
    })

    it('should throw error when selected required tag that does not exist', function () {
      var entity = {content: [{type: 'tag', params: [], content: [{type: 'tagA', params: [], content: []}]}]}
      var selection = select(entity)
      expect(function () { selection.select('button', {required: true}) }).to.throw()
    })

    it("should return the empty selection when something is selected that doesn't exist", function () {
      var selection = select({type: 'tag', params: [], content: []})
      selection.select('tagA').entity().should.eql({
        type: '',
        params: [],
        content: []
      })
    })
  })

  describe('Selection::selectAll', function () {
    it('should selectAll correctly', function () {
      var entity = {
        content: [{
          type: 'tag',
          params: [],
          content: [
            {type: 'tagA', params: [], content: []},
            {type: 'tagA', params: [], content: []},
            {type: 'tagA', params: [], content: []}
          ]
        }
      ]}

      select(entity).select('tag').selectAll('tagA').should.eql([
        select(entity).selectAll('tagA', {recursive: true})[0],
        select(entity).selectAll('tagA', {recursive: true})[1],
        select(entity).selectAll('tagA', {recursive: true})[2]
      ])
    })

    it('should selectAll for an array of types correctly', function () {
      var entity = {
        content: [{
          type: 'tag',
          params: [],
          content: [
            {type: 'tagA', params: [], content: []},
            {type: 'tagB', params: [], content: []},
            {type: 'tagA', params: [], content: []}
          ]
        }
      ]}

      select(entity).select('tag').selectAll(['tagA', 'tagB']).should.eql([
        select(entity).selectAll('tagA', {recursive: true})[0],
        select(entity).selectAll('tagB', {recursive: true})[0],
        select(entity).selectAll('tagA', {recursive: true})[1]
      ])
    })
  })

  describe('Selection::isEmpty', function () {
    it('should return true when the content array is empty', function () {
      select({type: 'tag', params: [], content: []}).isEmpty().should.equal(true)
    })

    it('should return true when the content array has whitespace only strings', function () {
      select({type: 'tag', params: [], content: ['', '   ', '   ']}).isEmpty().should.equal(true)
    })

    it('should return false when the content array not empty', function () {
      select({type: 'tag', params: [], content: ['content']}).isEmpty().should.equal(false)
    })
  })

  describe('Selection::filter', function () {
    it('should return a new selection with some of the children kept', function () {
      var entity = {
        type: 'tag',
        params: [],
        content: ['one', 'two', 'three']
      }

      select(entity).filter(function (child) {
        return child === 'two'
      }).content().should.eql(['two'])
    })

    it('should filter by type (keep none)', function () {
      var entity = {
        type: 'tag',
        params: [],
        content: [
          {type: 'one', params: [], content: []},
          {type: 'two', params: [], content: []},
          {type: 'one', params: [], content: []},
          'String content'
        ]
      }

      select(entity).filter('four').content().should.eql([])
    })

    it('should filter by type (keep one)', function () {
      var entity = {
        type: 'tag',
        params: [],
        content: [
          {type: 'one', params: [], content: []},
          {type: 'two', params: [], content: []},
          {type: 'one', params: [], content: []},
          'String content'
        ]
      }

      select(entity).filter('two').content().should.eql([
        {type: 'two', params: [], content: []}
      ])
    })

    it('should filter by type (keep multiple)', function () {
      var entity = {
        type: 'tag',
        params: [],
        content: [
          {type: 'one', params: [], content: []},
          {type: 'two', params: [], content: []},
          {type: 'one', params: [], content: []},
          'String content'
        ]
      }

      select(entity).filter('one').content().should.eql([
        {type: 'one', params: [], content: []},
        {type: 'one', params: [], content: []}
      ])
    })

    it('should filter by an array of types (keep multiple)', function () {
      var entity = {
        type: 'tag',
        params: [],
        content: [
          {type: 'one', params: [], content: []},
          {type: 'two', params: [], content: []},
          {type: 'three', params: [], content: []},
          'String content'
        ]
      }

      select(entity).filter(['one', 'three']).content().should.eql([
        {type: 'one', params: [], content: []},
        {type: 'three', params: [], content: []}
      ])
    })

    it('should filter by an array of types (empty query)', function () {
      var entity = {
        type: 'tag',
        params: [],
        content: [
          {type: 'one', params: [], content: []},
          {type: 'two', params: [], content: []},
          {type: 'three', params: [], content: []},
          'String content'
        ]
      }

      select(entity).filter([]).content().should.eql([])
    })

    it('should filter by an array of types (keep none)', function () {
      var entity = {
        type: 'tag',
        params: [],
        content: [
          {type: 'one', params: [], content: []},
          {type: 'two', params: [], content: []},
          {type: 'three', params: [], content: []},
          'String content'
        ]
      }

      select(entity).filter(['four']).content().should.eql([])
    })
  })

  describe('Selection::add', function () {
    it('should add text content', function () {
      var entity = {
        type: 'tag',
        params: [],
        content: []
      }

      var selection = select(entity)

      selection.add('text').should.equal(selection)
      entity.content.should.eql(['text'])
    })

    it('should add entity content', function () {
      var entity = {
        type: 'tag',
        params: [],
        content: []
      }

      var selection = select(entity)

      selection.add({type: 'type1', params: [], content: []}).should.equal(selection)
      selection.add({type: 'type2', params: [], content: []}).should.equal(selection)
      entity.content.should.eql([
        {type: 'type1', params: [], content: []},
        {type: 'type2', params: [], content: []}
      ])
    })
  })

  describe('Selection::append', function () {
    it('should add entity content', function () {
      var entity = {
        type: 'tag',
        params: [],
        content: []
      }

      var selection = select(entity)

      var child1 = {type: 'type1', params: [], content: []}
      var child2 = {type: 'type2', params: [], content: []}

      selection.append(child1).should.eql(select(child1, selection))
      selection.append(child2).should.eql(select(child2, selection))
      entity.content.should.eql([
        {type: 'type1', params: [], content: []},
        {type: 'type2', params: [], content: []}
      ])
    })
  })

  describe('Selection::addParam', function () {
    it('should add params to the underlying entity', function () {
      var entity = {
        type: 'tag',
        params: [],
        content: []
      }

      var selection = select(entity)

      var child1 = {type: 'type1', params: [], content: []}
      var child2 = {type: 'type2', params: [], content: []}

      selection.addParam('one').should.equal(selection)
      selection.addParam('two').should.equal(selection)
      entity.params.should.eql(['one', 'two'])
    })
  })

  describe('Selection::remove', function () {
    it('should remove entities by type', function () {
      var child1 = {type: 'child1', params: [], content: []}
      var child2 = {type: 'child2', params: [], content: []}
      var child3 = {type: 'child1', params: [], content: []}

      var entity = {
        type: 'tag',
        params: [],
        content: [
          child1,
          child2,
          child3
        ]
      }

      var selection = select(entity)

      selection.remove('child1').should.equal(child1)
      entity.content.should.eql([child2, child3])
      selection.remove('child1').should.equal(child3)
      entity.content.should.eql([child2])
      should.not.exist(selection.remove('child1'))
      entity.content.should.eql([child2])
    })

    it('should remove a single entities by type recursively', function () {
      var child3 = {type: 'child3', params: [], content: []}
      var child4 = {type: 'child4', params: [], content: []}
      var child5 = {type: 'child5', params: [], content: []}
      var child1 = {type: 'child1', params: [], content: []}
      var child2 = {type: 'child2', params: [], content: ['text', child3, child4]}

      var entity = {
        type: 'tag',
        params: [],
        content: [
          child1,
          'text',
          child5,
          child2
        ]
      }

      var selection = select(entity)

      selection.remove('child4', {recursive: true}).should.eql(child4)
      entity.content.should.eql([
        child1,
        'text',
        child5,
        {type: 'child2', params: [], content: ['text', child3]}
      ])
      should.not.exist(selection.remove('child4', {recursive: true}))
    })

    it('should remove multiple entities by type', function () {
      var child1 = {type: 'child1', params: [], content: []}
      var child2 = {type: 'child2', params: [], content: []}
      var child3 = {type: 'child1', params: [], content: []}

      var entity = {
        type: 'tag',
        params: [],
        content: [
          child1,
          child2,
          child3
        ]
      }

      var selection = select(entity)

      selection.remove(['child1', 'child2']).should.eql([child1, child2])
      entity.content.should.eql([child3])
      selection.remove(['child1', 'child2']).should.eql([child3, undefined])
      entity.content.should.eql([])
      selection.remove(['child1', 'child2']).should.eql([undefined, undefined])
      entity.content.should.eql([])
    })

    it('should remove multiple entities by type recursively', function () {
      var child3 = {type: 'child3', params: [], content: []}
      var child4 = {type: 'child4', params: [], content: []}
      var child5 = {type: 'child5', params: [], content: []}
      var child1 = {type: 'child1', params: [], content: []}
      var child2 = {type: 'child2', params: [], content: ['text', child3, child4]}

      var entity = {
        type: 'tag',
        params: [],
        content: [
          child1,
          'text',
          child5,
          child2
        ]
      }

      var selection = select(entity)

      selection.remove(['child1', 'child4'], {recursive: true}).should.eql([child1, child4])
      entity.content.should.eql([
        'text',
        child5,
        {type: 'child2', params: [], content: ['text', child3]}
      ])
      selection.remove(['child1', 'child4'], {recursive: true}).should.eql([undefined, undefined])
    })
  })

  describe('Selection::removeAll', function () {
    it('should remove entities by type', function () {
      var child1 = {type: 'child1', params: [], content: []}
      var child2 = {type: 'child2', params: [], content: []}
      var child3 = {type: 'child1', params: [], content: []}

      var entity = {
        type: 'tag',
        params: [],
        content: [
          child1,
          child2,
          child3
        ]
      }

      var selection = select(entity)

      selection.removeAll('child1').should.eql([child1, child3])
      entity.content.should.eql([child2])
      selection.removeAll('child1').should.eql([])
      entity.content.should.eql([child2])
    })

    it('should remove a single entities by type recursively', function () {
      var child3 = {type: 'child3', params: [], content: []}
      var child4 = {type: 'child4', params: [], content: []}
      var child5 = {type: 'child4', params: [], content: []}
      var child1 = {type: 'child1', params: [], content: []}
      var child2 = {type: 'child2', params: [], content: ['text', child3, child4]}

      var entity = {
        type: 'tag',
        params: [],
        content: [
          child1,
          'text',
          child5,
          child2
        ]
      }

      var selection = select(entity)

      selection.removeAll('child4', {recursive: true}).should.eql([child4, child5])
      entity.content.should.eql([
        child1,
        'text',
        {type: 'child2', params: [], content: ['text', child3]}
      ])
      selection.removeAll('child4', {recursive: true}).should.eql([])
    })

    it('should remove multiple entities by type', function () {
      var child1 = {type: 'child1', params: [], content: []}
      var child2 = {type: 'child2', params: [], content: []}
      var child3 = {type: 'child3', params: [], content: []}
      var child4 = {type: 'child1', params: [], content: []}
      var child5 = {type: 'child2', params: [], content: []}
      var child6 = {type: 'child3', params: [], content: []}

      var entity = {
        type: 'tag',
        params: [],
        content: [
          child1,
          child2,
          child3,
          child4,
          child5,
          child6
        ]
      }

      var selection = select(entity)

      selection.removeAll(['child1', 'child2']).should.eql([[child1, child4], [child2, child5]])
      entity.content.should.eql([child3, child6])
      selection.removeAll(['child1', 'child2']).should.eql([[], []])
      entity.content.should.eql([child3, child6])
      selection.removeAll(['child3']).should.eql([[child3, child6]])
      entity.content.should.eql([])
    })

    it('should remove multiple entities by type recursively', function () {
      var child3 = {type: 'child3', params: [], content: []}
      var child4 = {type: 'child4', params: [], content: []}
      var child5 = {type: 'child4', params: [], content: []}
      var child1 = {type: 'child1', params: [], content: []}
      var child2 = {type: 'child2', params: [], content: ['text', child3, child4]}

      var entity = {
        type: 'tag',
        params: [],
        content: [
          child1,
          'text',
          child5,
          child2
        ]
      }

      var selection = select(entity)

      selection.removeAll(['child1', 'child4'], {recursive: true}).should.eql([[child1], [child5, child4]])
      entity.content.should.eql([
        'text',
        {type: 'child2', params: [], content: ['text', child3]}
      ])
      selection.removeAll(['child1', 'child4'], {recursive: true}).should.eql([[], []])
    })
  })

  describe('Selection::transform', function () {
    it('should act on each of the child elements', function () {
      var entity = {
        type: 'tag',
        params: [],
        content: ['one', {type: 'two', params: [], content: []}, 'three']
      }

      function transformer (value) {
        return Promise.resolve(value.type ? value.type() : value)
      }

      return select(entity).transform(transformer).then(function (res) {
        res.should.eql(['one', 'two', 'three'])
      })
    })
  })
})
