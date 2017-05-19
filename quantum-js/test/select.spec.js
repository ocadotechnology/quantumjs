const chai = require('chai')
const { select, Selection, isSelection, isEntity, isText } = require('..')

const should = chai.should()
const expect = chai.expect

describe('select', () => {
  it('throws an error when something that is not an entity is passed in', () => {
    expect(() => {
      select(123)
    }).to.throw()
  })

  it('returns a Selection', () => {
    select({type: 'tag', params: [], content: []}).should.be.an.instanceof(Selection)
  })

  it('isSelection works', () => {
    isSelection(new Selection()).should.equal(true)
    isSelection({}).should.equal(false)
  })

  it('flattens', () => {
    select(select({type: 'tag', params: [], content: []})).should.be.an.instanceof(Selection)
  })

  describe('isEntity', () => {
    it('returns true for an object that looks like an entity', () => {
      isEntity({type: 'tag', params: [], content: []}).should.equal(true)
    })

    it('returns false for an object has missing or incorrect type field', () => {
      isEntity({params: [], content: []}).should.equal(false)
      isEntity({type: 123, params: [], content: []}).should.equal(false)
      isEntity({type: () => 0, params: [], content: []}).should.equal(false)
      isEntity({type: {}, params: [], content: []}).should.equal(false)
      isEntity({type: [], params: [], content: []}).should.equal(false)
      isEntity({type: undefined, params: [], content: []}).should.equal(false)
      isEntity({type: null, params: [], content: []}).should.equal(false)
      isEntity({type: true, params: [], content: []}).should.equal(false)
    })

    it('returns false for an object has missing or incorrect params field', () => {
      isEntity({type: 'tag', content: []}).should.equal(false)
      isEntity({type: 'tag', params: 123, content: []}).should.equal(false)
      isEntity({type: 'tag', params: () => 0, content: []}).should.equal(false)
      isEntity({type: 'tag', params: {}, content: []}).should.equal(false)
      isEntity({type: 'tag', params: '', content: []}).should.equal(false)
      isEntity({type: 'tag', params: undefined, content: []}).should.equal(false)
      isEntity({type: 'tag', params: null, content: []}).should.equal(false)
      isEntity({type: 'tag', params: true, content: []}).should.equal(false)
    })

    it('returns false for an object has missing or incorrect content field', () => {
      isEntity({type: 'tag', params: []}).should.equal(false)
      isEntity({type: 'tag', params: [], content: 123}).should.equal(false)
      isEntity({type: 'tag', params: [], content: () => 0}).should.equal(false)
      isEntity({type: 'tag', params: [], content: {}}).should.equal(false)
      isEntity({type: 'tag', params: [], content: ''}).should.equal(false)
      isEntity({type: 'tag', params: [], content: undefined}).should.equal(false)
      isEntity({type: 'tag', params: [], content: null}).should.equal(false)
      isEntity({type: 'tag', params: [], content: true}).should.equal(false)
    })
  })

  describe('isText', () => {
    it('returns true for a string', () => {
      isText('some text').should.equal(true)
    })

    it('returns false for things that are not strings', () => {
      isText(null).should.equal(false)
      isText(undefined).should.equal(false)
      isText({}).should.equal(false)
      isText([]).should.equal(false)
      isText(23).should.equal(false)
      isText(() => 0).should.equal(false)
      isText(false).should.equal(false)
      isText(true).should.equal(false)
    })
  })

  describe('Selection::entity', () => {
    it('returns the original entity', () => {
      const entity = {type: 'tag', params: [], content: []}
      select(entity).entity().should.equal(entity)
    })
  })

  describe('Selection::type', () => {
    it('gets the type correctly', () => {
      const entity = {type: 'tag', params: [], content: []}
      select(entity).type().should.equal('tag')
    })

    it('sets the type correctly', () => {
      const entity = {type: 'tag', params: [], content: []}
      const selection = select(entity)
      selection.type().should.equal('tag')
      selection.type('name').should.equal(selection)
      selection.type().should.equal('name')
      entity.type.should.equal('name')
    })

    it('throws an error when modifying a filtered selection', () => {
      const entity = {type: 'tag', params: [], content: []}
      const selection = select(entity).filter('whatever')
      selection.type().should.equal('tag')
      chai.expect(() => {
        selection.type('name')
      }).to.throw()
    })
  })

  describe('Selection::params', () => {
    it('gets the params correctly', () => {
      const entity = {type: 'tag', params: ['one', 'two', 'three'], content: []}
      select(entity).params().should.eql(['one', 'two', 'three'])
    })

    it('sets the params correctly', () => {
      const entity = {type: 'tag', params: ['one', 'two', 'three'], content: []}
      const selection = select(entity)
      selection.params().should.eql(['one', 'two', 'three'])
      const newParams = ['four', 'five']
      selection.params(newParams).should.equal(selection)
      selection.params().should.equal(newParams)
      entity.params.should.equal(newParams)
    })

    it('throws an error when modifying a filtered selection', () => {
      const entity = {type: 'tag', params: [], content: []}
      const selection = select(entity).filter('whatever')
      selection.params().should.eql([])
      chai.expect(() => {
        selection.params(['name'])
      }).to.throw()
    })
  })

  describe('Selection::param', () => {
    it('gets the param correctly', () => {
      const entity = {type: 'tag', params: ['one', 'two', 'three'], content: []}
      select(entity).param(2).should.eql('three')
    })

    it('sets the param correctly', () => {
      const entity = {type: 'tag', params: ['one', 'two', 'three'], content: []}
      const selection = select(entity)
      selection.params().should.eql(['one', 'two', 'three'])
      selection.param(2, 'four').should.equal(selection)
      selection.params().should.eql(['one', 'two', 'four'])
      selection.param(2).should.equal('four')
      entity.params.should.eql(['one', 'two', 'four'])
    })

    it('throws an error when modifying a filtered selection', () => {
      const entity = {type: 'tag', params: [], content: []}
      const selection = select(entity).filter('whatever')
      selection.params().should.eql([])
      chai.expect(() => {
        selection.param(2, 'four')
      }).to.throw()
    })
  })

  describe('Selection::content', () => {
    it('gets the content correctly', () => {
      const entity = {type: 'tag', content: ['one', 'two', 'three'], params: []}
      select(entity).content().should.eql(['one', 'two', 'three'])
    })

    it('sets the content correctly', () => {
      const entity = {type: 'tag', content: ['one', 'two', 'three'], params: []}
      const selection = select(entity)
      selection.content().should.eql(['one', 'two', 'three'])
      const newContent = ['four', 'five']
      selection.content(newContent).should.equal(selection)
      selection.content().should.equal(newContent)
      entity.content.should.equal(newContent)
    })

    it('throws an error when modifying a filtered selection', () => {
      const entity = {type: 'tag', params: [], content: []}
      const selection = select(entity).filter('whatever')
      selection.content().should.eql([])
      chai.expect(() => {
        selection.content(['name'])
      }).to.throw()
    })
  })

  describe('Selection::has', () => {
    it('checks if an entity has a direct child correctly', () => {
      const entity = {
        type: 'tag',
        content: [
          {type: 'tagA', params: [], content: []},
          {
            type: 'tagB',
            params: [],
            content: [
              {type: 'tagC', params: [], content: []}
            ]
          }
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

    it('checks if an entity has a child using the recursive option correctly', () => {
      const entity = {
        type: 'tag',
        content: [
          {type: 'tagA', params: [], content: []},
          {
            type: 'tagB',
            params: [],
            content: [
              {type: 'tagC', params: [], content: []}
            ]
          }
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

  describe('Selection::hasParam', () => {
    it('checks if an entity has params correctly', () => {
      const entity = {type: 'tag', content: [], params: ['Param']}
      select(entity).hasParams().should.equal(true)
    })

    it('checks if an entity has no params correctly', () => {
      const entity = {type: 'tag', content: [], params: []}
      select(entity).hasParams().should.equal(false)
    })
  })

  describe('Selection::hasContent', () => {
    it('checks if an entity has content correctly', () => {
      const entity = {type: 'tag', content: ['Content'], params: []}
      select(entity).hasContent().should.equal(true)
    })

    it('checks if an entity has no content correctly', () => {
      const entity = {type: 'tag', content: [], params: []}
      select(entity).hasContent().should.equal(false)
    })
  })

  describe('Selection::parent', () => {
    it('returns undefined when the parent is unknown', () => {
      const entity = {type: 'tag', content: [], params: []}
      should.not.exist(select(entity).parent())
    })

    it('returns the parent when known', () => {
      const child = {type: 'tag', content: [], params: []}
      const parent = {type: 'tag', content: [child], params: []}
      select(child, parent).parent().should.equal(parent)
    })

    it('knows the parent when a subselection is performed', () => {
      const entity = {type: 'tag', content: [{type: 'tagA', content: [], params: []}], params: []}
      const selection = select(entity)
      selection.select('tagA').parent().should.equal(selection)
    })

    it('keeps track of parents when doing deep selections', () => {
      const entity = {type: 'tag', content: [{type: 'tagA', content: [{type: 'tagB', params: [], content: []}], params: []}], params: []}
      const selection = select(entity)
      selection.select('tagB', {recursive: true}).parent().parent().should.equal(selection)
    })

    it('knows the parent when a multiple subselection is performed', () => {
      const entity = {
        type: 'tag',
        content: [
          {type: 'tagA', content: [], params: []},
          {type: 'tagA', content: [], params: []}
        ],
        params: []
      }

      const selection = select(entity)

      selection.selectAll('tagA').forEach((tagA) => {
        tagA.parent().should.equal(selection)
      })
    })

    it('refers to the filtered parent for selections after filtering', () => {
      const entity = {
        type: 'tag',
        params: [],
        content: [
          {type: 'one', params: [], content: []},
          {type: 'two', params: [], content: []},
          {type: 'three', params: [], content: []},
          'String content'
        ]
      }

      const parent = select(entity).filter('one')

      parent.select('one').parent().should.equal(parent)
    })
  })

  describe('Selection::ps', () => {
    it('converts the parameter array to a string for single parameter', () => {
      select({type: 'tag', params: ['one'], content: []}).ps().should.equal('one')
    })

    it('converts the parameter array to a string for multiple parameters', () => {
      select({type: 'tag', params: ['one', 'two', 'three'], content: []}).ps().should.equal('one two three')
    })

    it('sets the parameter array', () => {
      select({type: 'tag', params: [], content: []}).ps('one two three').params().should.eql(['one', 'two', 'three'])
    })

    it('throws an error when modifying a filtered selection', () => {
      const entity = {type: 'tag', params: [], content: []}
      const selection = select(entity).filter('whatever')
      selection.ps().should.eql('')
      chai.expect(() => {
        selection.ps('name')
      }).to.throw()
    })
  })

  describe('Selection::cs', () => {
    it('converts the content array to a string for single content', () => {
      select({type: 'tag', params: [], content: ['one']}).cs().should.equal('one')
    })

    it('converts the content array to a string for multiple contents', () => {
      select({type: 'tag', params: [], content: ['one', 'two', 'three']}).cs().should.equal('one\ntwo\nthree')
    })

    it('sets the content array', () => {
      select({type: 'tag', params: [], content: []}).cs('one\ntwo\nthree').content().should.eql(['one', 'two', 'three'])
    })

    it('throws an error when modifying a filtered selection', () => {
      const entity = {type: 'tag', params: [], content: []}
      const selection = select(entity).filter('whatever')
      selection.cs().should.eql('')
      chai.expect(() => {
        selection.cs('name')
      }).to.throw()
    })
  })

  describe('Selection::select', () => {
    it('selects items by tag', () => {
      const entity = {content: [{type: 'tag', params: [], content: [{type: 'tagA', params: [], content: []}]}]}
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

    it('selects items by tag with required equal to true (and no error should be thrown)', () => {
      const entity = {content: [{type: 'tag', params: [], content: [{type: 'tagA', params: [], content: []}]}]}
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

    it('throws error when selected required tag that does not exist', () => {
      const entity = {content: [{type: 'tag', params: [], content: [{type: 'tagA', params: [], content: []}]}]}
      const selection = select(entity)
      expect(() => {
        selection.select('button', {required: true})
      }).to.throw()
    })

    it("returns the empty selection when something is selected that doesn't exist", () => {
      const selection = select({type: 'tag', params: [], content: []})
      selection.select('tagA').entity().should.eql({
        type: '',
        params: [],
        content: []
      })
    })
  })

  describe('Selection::selectUpwards', () => {
    it('selects all entities correctly', () => {
      const entity = {
        content: [
          {
            type: 'parent',
            params: [],
            content: [
              {
                type: 'child1',
                params: [],
                content: [
                  {
                    type: 'child2',
                    params: [],
                    content: []
                  }
                ]
              }
            ]
          }
        ]
      }

      select(entity)
        .select('parent')
        .select('child1')
        .select('child2')
        .selectUpwards('parent')
        .entity()
        .should.equal(entity.content[0])
    })
  })

  describe('Selection::selectAll', () => {
    it('selects all entities correctly', () => {
      const entity = {
        content: [
          {
            type: 'tag',
            params: [],
            content: [
              {type: 'tagA', params: [], content: []},
              {type: 'tagA', params: [], content: []},
              {type: 'tagA', params: [], content: []}
            ]
          }
        ]
      }

      select(entity).select('tag').selectAll('tagA').should.eql([
        select(entity).selectAll('tagA', {recursive: true})[0],
        select(entity).selectAll('tagA', {recursive: true})[1],
        select(entity).selectAll('tagA', {recursive: true})[2]
      ])
    })

    it('returns an empty array when nothing can be found', () => {
      const entity = {
        content: [
          {
            type: 'tag',
            params: [],
            content: [
              {type: 'tagA', params: [], content: []},
              {type: 'tagA', params: [], content: []},
              {type: 'tagA', params: [], content: []},
              'non entity'
            ]
          }
        ]
      }

      select(entity).selectAll(['tagD'], {recursive: true}).should.eql([])
    })

    it('selects all entities for an array of types correctly', () => {
      const entity = {
        content: [
          {
            type: 'tag',
            params: [],
            content: [
              {type: 'tagA', params: [], content: []},
              {type: 'tagB', params: [], content: []},
              {type: 'tagA', params: [], content: []}
            ]
          }
        ]
      }

      select(entity).select('tag').selectAll(['tagA', 'tagB']).should.eql([
        select(entity).selectAll('tagA', {recursive: true})[0],
        select(entity).selectAll('tagB', {recursive: true})[0],
        select(entity).selectAll('tagA', {recursive: true})[1]
      ])
    })
  })

  describe('Selection::isEmpty', () => {
    it('returns true when the content array is empty', () => {
      select({type: 'tag', params: [], content: []}).isEmpty().should.equal(true)
    })

    it('returns true when the content array has whitespace only strings', () => {
      select({type: 'tag', params: [], content: ['', '   ', '   ']}).isEmpty().should.equal(true)
    })

    it('returns false when the content array not empty', () => {
      select({type: 'tag', params: [], content: ['content']}).isEmpty().should.equal(false)
    })
  })

  describe('Selection::filter', () => {
    it('returns a new selection with some of the children kept', () => {
      const entity = {
        type: 'tag',
        params: [],
        content: ['one', 'two', 'three']
      }

      select(entity).filter((child) => {
        return child === 'two'
      }).content().should.eql(['two'])
    })

    it('filters by type (keep none)', () => {
      const entity = {
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

    it('filters by type (keep one)', () => {
      const entity = {
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

    it('filters by type (keep multiple)', () => {
      const entity = {
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

    it('filters by an array of types (keep multiple)', () => {
      const entity = {
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

    it('filters by an array of types (empty query)', () => {
      const entity = {
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

    it('filters by an array of types (keep none)', () => {
      const entity = {
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

  describe('Selection::add', () => {
    it('adds text content', () => {
      const entity = {
        type: 'tag',
        params: [],
        content: []
      }

      const selection = select(entity)

      selection.add('text').should.equal(selection)
      entity.content.should.eql(['text'])
    })

    it('adds entity content', () => {
      const entity = {
        type: 'tag',
        params: [],
        content: []
      }

      const selection = select(entity)

      selection.add({type: 'type1', params: [], content: []}).should.equal(selection)
      selection.add({type: 'type2', params: [], content: []}).should.equal(selection)
      entity.content.should.eql([
        {type: 'type1', params: [], content: []},
        {type: 'type2', params: [], content: []}
      ])
    })
  })

  describe('Selection::addAfter', () => {
    it('throws an error if there is no parent', () => {
      const childEntity = {
        type: 'child',
        params: [],
        content: []
      }
      const selection = select(childEntity)
      should.throw(() => selection.addAfter('added after'))
    })

    it('does nothing if the child no longer exists in the parent', () => {
      const childEntity = {
        type: 'child',
        params: [],
        content: []
      }
      const parentEntity = {
        type: 'parent',
        params: [],
        content: [
          'Surrounding',
          childEntity,
          'Content'
        ]
      }

      const selection = select(parentEntity)
      const childSelection = selection.select('child')

      selection.select('child').remove()

      childSelection.addAfter('added after').should.equal(childSelection)
      parentEntity.content.should.eql([
        'Surrounding',
        'Content'
      ])
    })

    it('adds text content', () => {
      const childEntity = {
        type: 'child',
        params: [],
        content: []
      }
      const parentEntity = {
        type: 'parent',
        params: [],
        content: [
          'Surrounding',
          childEntity,
          'Content'
        ]
      }

      const selection = select(parentEntity)
      const childSelection = selection.select('child')

      childSelection.addAfter('added after').should.equal(childSelection)
      parentEntity.content.should.eql([
        'Surrounding',
        childEntity,
        'added after',
        'Content'
      ])
    })

    it('adds entity content', () => {
      const entity = {
        type: 'tag',
        params: [],
        content: []
      }

      const childEntity = {
        type: 'child',
        params: [],
        content: []
      }
      const parentEntity = {
        type: 'parent',
        params: [],
        content: [
          'Surrounding',
          childEntity,
          'Content'
        ]
      }

      const selection = select(parentEntity)
      const childSelection = selection.select('child')

      childSelection.addAfter(entity).should.equal(childSelection)
      parentEntity.content.should.eql([
        'Surrounding',
        childEntity,
        entity,
        'Content'
      ])
    })

    it('adds array content', () => {
      const entity1 = {
        type: 'tag1',
        params: [],
        content: []
      }

      const entity2 = {
        type: 'tag2',
        params: [],
        content: []
      }

      const childEntity = {
        type: 'child',
        params: [],
        content: []
      }

      const parentEntity = {
        type: 'parent',
        params: [],
        content: [
          'Surrounding',
          childEntity,
          'Content'
        ]
      }

      const selection = select(parentEntity)
      const childSelection = selection.select('child')

      childSelection.addAfter([entity1, entity2]).should.equal(childSelection)
      parentEntity.content.should.eql([
        'Surrounding',
        childEntity,
        entity1,
        entity2,
        'Content'
      ])
    })
  })

  describe('Selection::addParam', () => {
    it('adds params to the underlying entity', () => {
      const entity = {
        type: 'tag',
        params: [],
        content: []
      }

      const selection = select(entity)

      selection.addParam('one').should.equal(selection)
      selection.addParam('two').should.equal(selection)
      entity.params.should.eql(['one', 'two'])
    })
  })

  describe('Selection::removeChild', () => {
    it('returns true when it removes a child', () => {
      const childEntity = {
        type: 'child',
        params: [],
        content: []
      }

      const parentEntity = {
        type: 'parent',
        params: [],
        content: [
          'Surrounding',
          childEntity,
          'Content'
        ]
      }

      const selection = select(parentEntity)
      selection.removeChild(childEntity).should.equal(true)
      parentEntity.content.should.eql(['Surrounding', 'Content'])
    })

    it('removes string content', () => {
      const parentEntity = {
        type: 'parent',
        params: [],
        content: [
          'Surrounding',
          'child',
          'Content'
        ]
      }

      const selection = select(parentEntity)
      selection.removeChild('child').should.equal(true)
      parentEntity.content.should.eql(['Surrounding', 'Content'])
    })

    it('returns false when the entity being removed is not a child', () => {
      const childEntity = {
        type: 'child',
        params: [],
        content: []
      }

      const parentEntity = {
        type: 'parent',
        params: [],
        content: [
          'Surrounding',
          'Content'
        ]
      }

      const selection = select(parentEntity)
      selection.removeChild(childEntity).should.equal(false)
      parentEntity.content.should.eql(['Surrounding', 'Content'])
    })
  })

  describe('Selection::remove', () => {
    it('returns true when it removes the content', () => {
      const childEntity = {
        type: 'child',
        params: [],
        content: []
      }

      const parentEntity = {
        type: 'parent',
        params: [],
        content: [
          'Surrounding',
          childEntity,
          'Content'
        ]
      }

      const selection = select(parentEntity)
      const childSelection = selection.select('child')
      childSelection.remove()
      parentEntity.content.should.eql(['Surrounding', 'Content'])
      should.throw(() => childSelection.remove())
    })

    it('handles the case where one selection removes and one still references', () => {
      const childEntity = {
        type: 'child',
        params: [],
        content: []
      }

      const parentEntity = {
        type: 'parent',
        params: [],
        content: [
          'Surrounding',
          childEntity,
          'Content'
        ]
      }

      const selection = select(parentEntity)
      const childSelection1 = selection.select('child')
      const childSelection2 = selection.select('child')
      childSelection1.remove()
      parentEntity.content.should.eql(['Surrounding', 'Content'])
      childSelection2.remove()
    })
  })

  describe('Selection::removeChildOfType', () => {
    it('removes entities by type', () => {
      const child1 = {type: 'child1', params: [], content: []}
      const child2 = {type: 'child2', params: [], content: []}
      const child3 = {type: 'child1', params: [], content: []}

      const entity = {
        type: 'tag',
        params: [],
        content: [
          child1,
          child2,
          child3
        ]
      }

      const selection = select(entity)

      selection.removeChildOfType('child1').should.equal(child1)
      entity.content.should.eql([child2, child3])
      selection.removeChildOfType('child1').should.equal(child3)
      entity.content.should.eql([child2])
      should.not.exist(selection.removeChildOfType('child1'))
      entity.content.should.eql([child2])
    })

    it('removes a single entities by type recursively', () => {
      const child3 = {type: 'child3', params: [], content: []}
      const child4 = {type: 'child4', params: [], content: []}
      const child5 = {type: 'child5', params: [], content: []}
      const child1 = {type: 'child1', params: [], content: []}
      const child2 = {type: 'child2', params: [], content: ['text', child3, child4]}

      const entity = {
        type: 'tag',
        params: [],
        content: [
          child1,
          'text',
          child5,
          child2
        ]
      }

      const selection = select(entity)

      selection.removeChildOfType('child4', {recursive: true}).should.eql(child4)
      entity.content.should.eql([
        child1,
        'text',
        child5,
        {type: 'child2', params: [], content: ['text', child3]}
      ])
      should.not.exist(selection.removeChildOfType('child4', {recursive: true}))
    })

    it('removes multiple entities by type', () => {
      const child1 = {type: 'child1', params: [], content: []}
      const child2 = {type: 'child2', params: [], content: []}
      const child3 = {type: 'child1', params: [], content: []}

      const entity = {
        type: 'tag',
        params: [],
        content: [
          child1,
          child2,
          child3
        ]
      }

      const selection = select(entity)

      selection.removeChildOfType(['child1', 'child2']).should.eql([child1, child2])
      entity.content.should.eql([child3])
      selection.removeChildOfType(['child1', 'child2']).should.eql([child3, undefined])
      entity.content.should.eql([])
      selection.removeChildOfType(['child1', 'child2']).should.eql([undefined, undefined])
      entity.content.should.eql([])
    })

    it('removes multiple entities by type recursively', () => {
      const child3 = {type: 'child3', params: [], content: []}
      const child4 = {type: 'child4', params: [], content: []}
      const child5 = {type: 'child5', params: [], content: []}
      const child1 = {type: 'child1', params: [], content: []}
      const child2 = {type: 'child2', params: [], content: ['text', child3, child4]}

      const entity = {
        type: 'tag',
        params: [],
        content: [
          child1,
          'text',
          child5,
          child2
        ]
      }

      const selection = select(entity)

      selection.removeChildOfType(['child1', 'child4'], {recursive: true}).should.eql([child1, child4])
      entity.content.should.eql([
        'text',
        child5,
        {type: 'child2', params: [], content: ['text', child3]}
      ])
      selection.removeChildOfType(['child1', 'child4'], {recursive: true}).should.eql([undefined, undefined])
    })
  })

  describe('Selection::removeAllChildrenOfType', () => {
    it('removes entities by type', () => {
      const child1 = {type: 'child1', params: [], content: []}
      const child2 = {type: 'child2', params: [], content: []}
      const child3 = {type: 'child1', params: [], content: []}

      const entity = {
        type: 'tag',
        params: [],
        content: [
          child1,
          child2,
          child3
        ]
      }

      const selection = select(entity)

      selection.removeAllChildrenOfType('child1').should.eql([child1, child3])
      entity.content.should.eql([child2])
      selection.removeAllChildrenOfType('child1').should.eql([])
      entity.content.should.eql([child2])
    })

    it('removes a single entities by type recursively', () => {
      const child3 = {type: 'child3', params: [], content: []}
      const child4 = {type: 'child4', params: [], content: []}
      const child5 = {type: 'child4', params: [], content: []}
      const child1 = {type: 'child1', params: [], content: []}
      const child2 = {type: 'child2', params: [], content: ['text', child3, child4]}

      const entity = {
        type: 'tag',
        params: [],
        content: [
          child1,
          'text',
          child5,
          child2
        ]
      }

      const selection = select(entity)

      selection.removeAllChildrenOfType('child4', {recursive: true}).should.eql([child4, child5])
      entity.content.should.eql([
        child1,
        'text',
        {type: 'child2', params: [], content: ['text', child3]}
      ])
      selection.removeAllChildrenOfType('child4', {recursive: true}).should.eql([])
    })

    it('removes multiple entities by type', () => {
      const child1 = {type: 'child1', params: [], content: []}
      const child2 = {type: 'child2', params: [], content: []}
      const child3 = {type: 'child3', params: [], content: []}
      const child4 = {type: 'child1', params: [], content: []}
      const child5 = {type: 'child2', params: [], content: []}
      const child6 = {type: 'child3', params: [], content: []}

      const entity = {
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

      const selection = select(entity)

      selection.removeAllChildrenOfType(['child1', 'child2']).should.eql([[child1, child4], [child2, child5]])
      entity.content.should.eql([child3, child6])
      selection.removeAllChildrenOfType(['child1', 'child2']).should.eql([[], []])
      entity.content.should.eql([child3, child6])
      selection.removeAllChildrenOfType(['child3']).should.eql([[child3, child6]])
      entity.content.should.eql([])
    })

    it('removes multiple entities by type recursively', () => {
      const child3 = {type: 'child3', params: [], content: []}
      const child4 = {type: 'child4', params: [], content: []}
      const child5 = {type: 'child4', params: [], content: []}
      const child1 = {type: 'child1', params: [], content: []}
      const child2 = {type: 'child2', params: [], content: ['text', child3, child4]}

      const entity = {
        type: 'tag',
        params: [],
        content: [
          child1,
          'text',
          child5,
          child2
        ]
      }

      const selection = select(entity)

      selection.removeAllChildrenOfType(['child1', 'child4'], {recursive: true}).should.eql([[child1], [child5, child4]])
      entity.content.should.eql([
        'text',
        {type: 'child2', params: [], content: ['text', child3]}
      ])
      selection.removeAllChildrenOfType(['child1', 'child4'], {recursive: true}).should.eql([[], []])
    })
  })

  describe('Selection::transformContext', () => {
    it('returns an object by default', () => {
      select({type: '', params: [], content: []})
        .transformContext().should.eql({})
    })

    it('stores and get the transformContext', () => {
      const obj = {}
      select({type: '', params: [], content: []})
        .transformContext(obj)
        .transformContext().should.equal(obj)
    })

    it('is when filtering', () => {
      const obj = {}
      select({type: '', params: [], content: []})
        .transformContext(obj)
        .filter(d => true)
        .transformContext().should.equal(obj)
    })
  })

  describe('Selection::transform', () => {
    it('acts on each of the child elements', () => {
      const entity = {
        type: 'tag',
        params: [],
        content: ['one', {type: 'two', params: [], content: []}, 'three']
      }

      function transformer (value) {
        return Promise.resolve(value.type ? value.type() : value)
      }

      return select(entity).transform(transformer).then((res) => {
        res.should.eql(['one', 'two', 'three'])
      })
    })

    it('acts on each of the child (non promise)', () => {
      const entity = {
        type: 'tag',
        params: [],
        content: ['one', {type: 'two', params: [], content: []}, 'three']
      }

      function transformer (value) {
        if (value === 'one') { return undefined }
        return value.type ? value.type() : value
      }

      return select(entity).transform(transformer)
        .should.eql([undefined, 'two', 'three'])
    })
  })
})
