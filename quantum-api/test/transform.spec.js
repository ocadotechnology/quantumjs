'use strict'
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const path = require('path')

const quantum = require('quantum-js')
const dom = require('quantum-dom')
const api = require('..').transforms

chai.should()
chai.use(chaiAsPromised)

describe('transforms', () => {
  function optionTransformer (options) {
    return (selection) => {
      return quantum.select.isSelection(selection) ? api(options)[selection.type()](selection, optionTransformer(options)) : selection
    }
  }

  const transformer = optionTransformer()

  // XXX: Work out why the api transform isn't synchronous but doesn't return a promise
  // Uses of this can be replaced by `transformer(selection).should.eql(expected)` when the 'bug' is resolved
  function asyncExpectation (selection, expected, done) {
    const content = transformer(selection)
    const waitMs = 5
    const check = () => {
      content.should.eql(expected)
      done()
    }
    setTimeout(check, waitMs)
  }

  it('should render a return block (no description)', () => {
    const selection = quantum.select({
      type: 'returns',
      params: ['Lemon'],
      content: []
    })

    const expected = dom.create('div').class('qm-api-collapsible qm-api-item qm-api-returns qm-api-item-no-description')
      .add(dom.create('div').class('qm-api-collapsible-heading')
        .add(dom.create('div').class('qm-api-collapsible-toggle')
          .add(dom.create('i').class('qm-api-chevron-icon')))
        .add(dom.create('div').class('qm-api-collapsible-head')
          .add(dom.create('div').class('qm-api-item-head')
            .add(dom.create('div').class('qm-api-item-header qm-api-type-header')
              .add(dom.create('span').class('qm-api-header-details')
                .add(dom.create('span').class('qm-api-type-name')
                  .add(dom.create('span').text('Lemon'))))
              .add(dom.create('span').class('qm-api-header-tags'))))))
      .add(dom.create('div').class('qm-api-collapsible-content')
        .add(dom.create('div').class('qm-api-item-content')
          .add(dom.create('div').class('qm-api-description').text(''))
          .add(dom.create('div').class('qm-api-extras'))))

    transformer(selection).should.eql(expected)
  })

  it('should render a return block (with description)', () => {
    const selection = quantum.select({
      type: 'returns',
      params: ['Lemon'],
      content: [{
        type: 'description',
        params: [],
        content: ['Description']
      }]
    })

    const expected = dom.create('div').class('qm-api-collapsible qm-api-item qm-api-returns')
      .add(dom.create('div').class('qm-api-collapsible-heading')
        .add(dom.create('div').class('qm-api-collapsible-toggle')
          .add(dom.create('i').class('qm-api-chevron-icon')))
        .add(dom.create('div').class('qm-api-collapsible-head')
          .add(dom.create('div').class('qm-api-item-head')
            .add(dom.create('div').class('qm-api-item-header qm-api-type-header')
              .add(dom.create('span').class('qm-api-header-details')
                .add(dom.create('span').class('qm-api-type-name')
                  .add(dom.create('span').text('Lemon'))))
              .add(dom.create('span').class('qm-api-header-tags'))))))
      .add(dom.create('div').class('qm-api-collapsible-content')
        .add(dom.create('div').class('qm-api-item-content')
          .add(dom.create('div').class('qm-api-description')
            .add([
              dom.asset({url: '/assets/quantum-html.css', file: path.resolve(__dirname, '../../quantum-html/assets/quantum-html.css'), shared: true}),
              dom.create('div').class('qm-html-paragraph')
                .add(dom.textNode('Description '))
            ]))
          .add(dom.create('div').class('qm-api-extras'))))

    transformer(selection).should.eql(expected)
  })

  it('should render a function', () => {
    const selection = quantum.select({
      type: 'function',
      params: ['banana'],
      content: []
    })

    transformer(selection).should.eql(
      dom.create('div')
        .class('qm-api-collapsible qm-api-item qm-api-function qm-api-item-no-description')
        .add(dom.create('div').class('qm-api-collapsible-heading')
          .add(dom.create('div').class('qm-api-collapsible-toggle')
            .add(dom.create('i').class('qm-api-chevron-icon')))
          .add(dom.create('div').class('qm-api-collapsible-head')
            .add(dom.create('div').class('qm-api-item-head')
              .add(dom.create('div').class('qm-api-item-header qm-api-function-header')
                .add(dom.create('span').class('qm-api-header-details')
                  .add(dom.create('span').class('qm-api-function-name').text('banana'))
                  .add(dom.create('span').class('qm-api-function-params')))
                .add(dom.create('span').class('qm-api-header-tags'))))))
        .add(dom.create('div').class('qm-api-collapsible-content')
          .add(dom.create('div').class('qm-api-item-content')
            .add(dom.create('div').class('qm-api-description').text(''))
            .add(dom.create('div').class('qm-api-extras'))))
    )
  })

  it('should render a function that returns', (done) => {
    const selection = quantum.select({
      type: 'function',
      params: ['lemon'],
      content: [
        { type: 'returns', params: ['Lemon'], content: [] }
      ]
    })

    const returnBlock = dom.create('div').class('qm-api-returns-group')
      .add(dom.create('h2').text('Returns'))
      .add(dom.create('div').class('qm-api-collapsible qm-api-item qm-api-returns qm-api-item-no-description')
        .add(dom.create('div').class('qm-api-collapsible-heading')
          .add(dom.create('div').class('qm-api-collapsible-toggle')
            .add(dom.create('i').class('qm-api-chevron-icon')))
          .add(dom.create('div').class('qm-api-collapsible-head')
            .add(dom.create('div').class('qm-api-item-head')
              .add(dom.create('div').class('qm-api-item-header qm-api-type-header')
                .add(dom.create('span').class('qm-api-header-details')
                  .add(dom.create('span').class('qm-api-type-name')
                    .add(dom.create('span').text('Lemon'))))
                .add(dom.create('span').class('qm-api-header-tags'))))))
        .add(dom.create('div').class('qm-api-collapsible-content')
          .add(dom.create('div').class('qm-api-item-content')
            .add(dom.create('div').class('qm-api-description').text(''))
            .add(dom.create('div').class('qm-api-extras')))))

    const expected = dom.create('div')
      .class('qm-api-collapsible qm-api-item qm-api-function')
      .add(dom.create('div').class('qm-api-collapsible-heading')
        .add(dom.create('div').class('qm-api-collapsible-toggle')
          .add(dom.create('i').class('qm-api-chevron-icon')))
        .add(dom.create('div').class('qm-api-collapsible-head')
          .add(dom.create('div').class('qm-api-item-head')
            .add(dom.create('div').class('qm-api-item-header qm-api-function-header')
              .add(dom.create('span').class('qm-api-header-details')
                .add(dom.create('span').class('qm-api-function-name').text('lemon'))
                .add(dom.create('span').class('qm-api-function-params'))
                .add(dom.create('span').class('qm-api-function-returns')
                  .add(dom.create('span').text('Lemon'))))
              .add(dom.create('span').class('qm-api-header-tags'))))))
      .add(dom.create('div').class('qm-api-collapsible-content')
        .add(dom.create('div').class('qm-api-item-content')
          .add(dom.create('div').class('qm-api-description').text(''))
          .add(dom.create('div').class('qm-api-extras'))
          .add(returnBlock)))

    asyncExpectation(selection, expected, done)
  })

  // TODO: Add these tests

  // it('should not sort function params', () => {
  // })

  // TODO: Do this for all types?
  // it('should render constructors', () => {
  // })

  // it('should render optional entities correctly', () => {
  // })

  // it('should sort entities based on their params', () => {
  // })

  // it('should sort entities based on their tags', () => {
  // })

  // it('should group entities by type', () => {
  // })

  // it('should render deprecated/removed messages', () => {
  // })

  // it('should render type links', () => {
  // })

  // it('should render parameterised type links', () => {
  // })

  // it('should render as something else if the type parameter matches', () => {
  // })

  // it('should render extra content in the api', () => {
  // })

  // TODO: Should contain
  // it('should render a complete api', () => {
  // })

  it('should sort group contents in the correct order', (done) => {
    // XXX: Should this need to be wrapped in an @api to work?
    const selection = quantum.select({
      type: 'api',
      params: [],
      content: [
        {
          type: 'group',
          params: ['Group'],
          content: [
            {
              type: 'object',
              params: ['b object'],
              content: [
                { type: 'removed', params: [], content: [] }
              ]
            },
            { type: 'object', params: ['f object'], content: [] },
            {
              type: 'object',
              params: ['e object'],
              content: [
                { type: 'added', params: [], content: [] }
              ]
            },
            {
              type: 'object',
              params: ['d object'],
              content: [
                { type: 'deprecated', params: [], content: [] }
              ]
            },
            {
              type: 'object',
              params: ['c object'],
              content: [
                { type: 'updated', params: [], content: [] }
              ]
            },
            { type: 'object', params: ['a object'], content: [] }
          ]
        }
      ]
    })

    const createTag = (type) => {
      if (type) {
        return dom.create('span').class(`qm-api-tag qm-api-tag-${type}`).text(type)
      }
    }

    const createObject = (name, tagName) => {
      return dom.create('div')
        .class('qm-api-collapsible qm-api-item qm-api-object qm-api-item-no-description')
        .add(dom.create('div').class('qm-api-collapsible-heading')
          .add(dom.create('div').class('qm-api-collapsible-toggle')
            .add(dom.create('i').class('qm-api-chevron-icon')))
          .add(dom.create('div').class('qm-api-collapsible-head')
            .add(dom.create('div').class('qm-api-item-head')
              .add(dom.create('div').class('qm-api-item-header qm-api-property-header')
                .add(dom.create('span').class(`qm-api-header-details${tagName ? ' qm-api-' + tagName : ''}`)
                  .add(dom.create('span').class('qm-api-property-name').text(name))
                  .add(dom.create('span').class('qm-api-property-type')))
                .add(dom.create('span').class('qm-api-header-tags')
                  .add(createTag(tagName)))))))
        .add(dom.create('div').class('qm-api-collapsible-content')
          .add(dom.create('div').class('qm-api-item-content')
            .add(dom.create('div').class('qm-api-description').text(''))
            .add(dom.create('div').class('qm-api-extras'))))
    }

    const expected = dom.create('div')
      .class('qm-api-item-content')
        .add(dom.create('div').class('qm-api-description').text(''))
        .add(dom.create('div').class('qm-api-extras'))
        .add(dom.asset({url: '/assets/quantum-api.css', file: path.resolve(__dirname, '../assets/quantum-api.css'), shared: true}))
        .add(dom.asset({url: '/assets/quantum-api.js', file: path.resolve(__dirname, '../assets/quantum-api.js'), shared: true}))
        .add(dom.create('div').class('qm-api-group-container')
          .add(dom.create('div').class('qm-api-group')
            .add(dom.create('h2').text('Group'))
            .add(dom.create('div').class('qm-api-group-content')
              .add(dom.create('div').class('qm-api-description').text(''))
              .add(createObject('e object', 'added'))
              .add(createObject('c object', 'updated'))
              .add(createObject('a object'))
              .add(createObject('f object'))
              .add(createObject('d object', 'deprecated'))
              .add(createObject('b object', 'removed'))
        )))

    asyncExpectation(selection, expected, done)
  })
})

// @describe function
//
//   @it should render a function
//     @@um
//       @function add
//
//     @@html
//       <div class="qm-api-collapsible qm-api-item qm-api-function qm-api-item-no-description"><div class="qm-api-collapsible-heading"><div class="qm-api-collapsible-toggle"><i class="qm-api-chevron-icon"></i></div><div class="qm-api-collapsible-head"><div class="qm-api-item-head"><div class="qm-api-item-header qm-api-function-header"><span class="qm-api-header-details"><span class="qm-api-function-name">add</span><span class="qm-api-function-params"></span></span><span class="qm-api-header-tags"></span></div></div></div></div><div class="qm-api-collapsible-content"><div class="qm-api-item-content"><div class="qm-api-description"></div><div class="qm-api-extras"></div></div></div></div>
//
//
//   @it should render a function that returns
//     @@um
//       @function add
//         @returns Number: The two numbers added together
//
//     @@html
//       <div class="qm-api-collapsible qm-api-item qm-api-function"><div class="qm-api-collapsible-heading"><div class="qm-api-collapsible-toggle"><i class="qm-api-chevron-icon"></i></div><div class="qm-api-collapsible-head"><div class="qm-api-item-head"><div class="qm-api-item-header qm-api-function-header"><span class="qm-api-header-details"><span class="qm-api-function-name">add</span><span class="qm-api-function-params"></span><span class="qm-api-function-returns"><span>Number</span></span></span><span class="qm-api-header-tags"></span></div></div></div></div><div class="qm-api-collapsible-content"><div class="qm-api-item-content"><div class="qm-api-description"></div><div class="qm-api-extras"></div><div class="qm-api-returns-group"><h2>Returns</h2><div class="qm-api-collapsible qm-api-item qm-api-returns"><div class="qm-api-collapsible-heading"><div class="qm-api-collapsible-toggle"><i class="qm-api-chevron-icon"></i></div><div class="qm-api-collapsible-head"><div class="qm-api-item-head"><div class="qm-api-item-header qm-api-type-header"><span class="qm-api-header-details"><span class="qm-api-type-name"><span>Number</span></span></span><span class="qm-api-header-tags"></span></div></div></div></div><div class="qm-api-collapsible-content"><div class="qm-api-item-content"><div class="qm-api-description">The two numbers added together</div><div class="qm-api-extras"></div></div></div></div></div></div></div></div>
//
//
//   @it should render a function with params
//     @@um
//       @function add
//         @param a Number: The first number to add
//         @param b Number: The second number to add
//         @returns Number: The two numbers added together
//
//     @@html
//       <div class="qm-api-collapsible qm-api-item qm-api-function"><div class="qm-api-collapsible-heading"><div class="qm-api-collapsible-toggle"><i class="qm-api-chevron-icon"></i></div><div class="qm-api-collapsible-head"><div class="qm-api-item-head"><div class="qm-api-item-header qm-api-function-header"><span class="qm-api-header-details"><span class="qm-api-function-name">add</span><span class="qm-api-function-params"><span class="qm-api-function-param"><span class="qm-api-function-param-name">a</span><span class="qm-api-function-param-type"><span>Number</span></span></span><span class="qm-api-function-param"><span class="qm-api-function-param-name">b</span><span class="qm-api-function-param-type"><span>Number</span></span></span></span><span class="qm-api-function-returns"><span>Number</span></span></span><span class="qm-api-header-tags"></span></div></div></div></div><div class="qm-api-collapsible-content"><div class="qm-api-item-content"><div class="qm-api-description"></div><div class="qm-api-extras"></div><div class="qm-api-returns-group"><h2>Returns</h2><div class="qm-api-collapsible qm-api-item qm-api-returns"><div class="qm-api-collapsible-heading"><div class="qm-api-collapsible-toggle"><i class="qm-api-chevron-icon"></i></div><div class="qm-api-collapsible-head"><div class="qm-api-item-head"><div class="qm-api-item-header qm-api-type-header"><span class="qm-api-header-details"><span class="qm-api-type-name"><span>Number</span></span></span><span class="qm-api-header-tags"></span></div></div></div></div><div class="qm-api-collapsible-content"><div class="qm-api-item-content"><div class="qm-api-description">The two numbers added together</div><div class="qm-api-extras"></div></div></div></div></div></div></div></div>
//
//
//   @it should render a function with optional params
//     @@um
//       @function add
//         @param a Number: The first number to add
//         @param? b Number: The second number to add
//         @returns Number: The two numbers added together
//
//     @@html
//       <div class="qm-api-collapsible qm-api-item qm-api-function"><div class="qm-api-collapsible-heading"><div class="qm-api-collapsible-toggle"><i class="qm-api-chevron-icon"></i></div><div class="qm-api-collapsible-head"><div class="qm-api-item-head"><div class="qm-api-item-header qm-api-function-header"><span class="qm-api-header-details"><span class="qm-api-function-name">add</span><span class="qm-api-function-params"><span class="qm-api-function-param"><span class="qm-api-function-param-name">a</span><span class="qm-api-function-param-type"><span>Number</span></span></span><span class="qm-api-function-param qm-api-optional"><span class="qm-api-function-param-name">b</span><span class="qm-api-function-param-type"><span>Number</span></span></span></span><span class="qm-api-function-returns"><span>Number</span></span></span><span class="qm-api-header-tags"></span></div></div></div></div><div class="qm-api-collapsible-content"><div class="qm-api-item-content"><div class="qm-api-description"></div><div class="qm-api-extras"></div><div class="qm-api-param-group"><h2>Arguments</h2><div class="qm-api-collapsible qm-api-item qm-api-param"><div class="qm-api-collapsible-heading"><div class="qm-api-collapsible-toggle"><i class="qm-api-chevron-icon"></i></div><div class="qm-api-collapsible-head"><div class="qm-api-item-head"><div class="qm-api-item-header qm-api-property-header"><span class="qm-api-header-details"><span class="qm-api-property-name">a</span><span class="qm-api-property-type"><span>Number</span></span></span><span class="qm-api-header-tags"></span></div></div></div></div><div class="qm-api-collapsible-content"><div class="qm-api-item-content"><div class="qm-api-description">The first number to add</div><div class="qm-api-extras"></div></div></div></div><div class="qm-api-collapsible qm-api-item qm-api-param"><div class="qm-api-collapsible-heading"><div class="qm-api-collapsible-toggle"><i class="qm-api-chevron-icon"></i></div><div class="qm-api-collapsible-head"><div class="qm-api-item-head qm-api-optional"><div class="qm-api-item-header qm-api-property-header"><span class="qm-api-header-details"><span class="qm-api-property-name">b</span><span class="qm-api-property-type"><span>Number</span></span></span><span class="qm-api-header-tags"></span></div></div></div></div><div class="qm-api-collapsible-content"><div class="qm-api-item-content"><div class="qm-api-description">The second number to add</div><div class="qm-api-extras"></div></div></div></div></div><div class="qm-api-returns-group"><h2>Returns</h2><div class="qm-api-collapsible qm-api-item qm-api-returns"><div class="qm-api-collapsible-heading"><div class="qm-api-collapsible-toggle"><i class="qm-api-chevron-icon"></i></div><div class="qm-api-collapsible-head"><div class="qm-api-item-head"><div class="qm-api-item-header qm-api-type-header"><span class="qm-api-header-details"><span class="qm-api-type-name"><span>Number</span></span></span><span class="qm-api-header-tags"></span></div></div></div></div><div class="qm-api-collapsible-content"><div class="qm-api-item-content"><div class="qm-api-description">The two numbers added together</div><div class="qm-api-extras"></div></div></div></div></div></div></div></div>
//
//   @it should render a function with a description
//     @@um
//       @function add
//         @description: Adds two numbers together
//         @param a Number: The first number to add
//         @param? b Number: The second number to add
//         @returns Number: The two numbers added together
//
//     @@html
//       <div class="qm-api-collapsible qm-api-item qm-api-function"><div class="qm-api-collapsible-heading"><div class="qm-api-collapsible-toggle"><i class="qm-api-chevron-icon"></i></div><div class="qm-api-collapsible-head"><div class="qm-api-item-head"><div class="qm-api-item-header qm-api-function-header"><span class="qm-api-header-details"><span class="qm-api-function-name">add</span><span class="qm-api-function-params"><span class="qm-api-function-param"><span class="qm-api-function-param-name">a</span><span class="qm-api-function-param-type"><span>Number</span></span></span><span class="qm-api-function-param qm-api-optional"><span class="qm-api-function-param-name">b</span><span class="qm-api-function-param-type"><span>Number</span></span></span></span><span class="qm-api-function-returns"><span>Number</span></span></span><span class="qm-api-header-tags"></span></div></div></div></div><div class="qm-api-collapsible-content"><div class="qm-api-item-content"><div class="qm-api-extras"></div><div class="qm-api-description">Adds two numbers together</div><div class="qm-api-param-group"><h2>Arguments</h2><div class="qm-api-collapsible qm-api-item qm-api-param"><div class="qm-api-collapsible-heading"><div class="qm-api-collapsible-toggle"><i class="qm-api-chevron-icon"></i></div><div class="qm-api-collapsible-head"><div class="qm-api-item-head"><div class="qm-api-item-header qm-api-property-header"><span class="qm-api-header-details"><span class="qm-api-property-name">a</span><span class="qm-api-property-type"><span>Number</span></span></span><span class="qm-api-header-tags"></span></div></div></div></div><div class="qm-api-collapsible-content"><div class="qm-api-item-content"><div class="qm-api-description">The first number to add</div><div class="qm-api-extras"></div></div></div></div><div class="qm-api-collapsible qm-api-item qm-api-param"><div class="qm-api-collapsible-heading"><div class="qm-api-collapsible-toggle"><i class="qm-api-chevron-icon"></i></div><div class="qm-api-collapsible-head"><div class="qm-api-item-head qm-api-optional"><div class="qm-api-item-header qm-api-property-header"><span class="qm-api-header-details"><span class="qm-api-property-name">b</span><span class="qm-api-property-type"><span>Number</span></span></span><span class="qm-api-header-tags"></span></div></div></div></div><div class="qm-api-collapsible-content"><div class="qm-api-item-content"><div class="qm-api-description">The second number to add</div><div class="qm-api-extras"></div></div></div></div></div><div class="qm-api-returns-group"><h2>Returns</h2><div class="qm-api-collapsible qm-api-item qm-api-returns"><div class="qm-api-collapsible-heading"><div class="qm-api-collapsible-toggle"><i class="qm-api-chevron-icon"></i></div><div class="qm-api-collapsible-head"><div class="qm-api-item-head"><div class="qm-api-item-header qm-api-type-header"><span class="qm-api-header-details"><span class="qm-api-type-name"><span>Number</span></span></span><span class="qm-api-header-tags"></span></div></div></div></div><div class="qm-api-collapsible-content"><div class="qm-api-item-content"><div class="qm-api-description">The two numbers added together</div><div class="qm-api-extras"></div></div></div></div></div></div></div></div>
//
//   @it should render a function with an event
//     @@um
//       @function add
//         @event name Type: The second number to add
//
//     @@html
//       <div class="qm-api-collapsible qm-api-item qm-api-function"><div class="qm-api-collapsible-heading"><div class="qm-api-collapsible-toggle"><i class="qm-api-chevron-icon"></i></div><div class="qm-api-collapsible-head"><div class="qm-api-item-head"><div class="qm-api-item-header qm-api-function-header"><span class="qm-api-header-details"><span class="qm-api-function-name">add</span><span class="qm-api-function-params"></span></span><span class="qm-api-header-tags"></span></div></div></div></div><div class="qm-api-collapsible-content"><div class="qm-api-item-content"><div class="qm-api-description"></div><div class="qm-api-extras"></div><div class="qm-api-event-group"><h2>Events</h2><div class="qm-api-collapsible qm-api-item qm-api-event"><div class="qm-api-collapsible-heading"><div class="qm-api-collapsible-toggle"><i class="qm-api-chevron-icon"></i></div><div class="qm-api-collapsible-head"><div class="qm-api-item-head"><div class="qm-api-item-header qm-api-property-header"><span class="qm-api-header-details"><span class="qm-api-property-name">name</span><span class="qm-api-property-type"><span>Type</span></span></span><span class="qm-api-header-tags"></span></div></div></div></div><div class="qm-api-collapsible-content"><div class="qm-api-item-content"><div class="qm-api-description">The second number to add</div><div class="qm-api-extras"></div></div></div></div></div></div></div></div>
//
//   @it should render a function with a group
//     @@um
//       @function add
//         @group Some Group
//           @param p Type: Some param
//
//     @@html
//       <div class="qm-api-collapsible qm-api-item qm-api-function"><div class="qm-api-collapsible-heading"><div class="qm-api-collapsible-toggle"><i class="qm-api-chevron-icon"></i></div><div class="qm-api-collapsible-head"><div class="qm-api-item-head"><div class="qm-api-item-header qm-api-function-header"><span class="qm-api-header-details"><span class="qm-api-function-name">add</span><span class="qm-api-function-params"></span></span><span class="qm-api-header-tags"></span></div></div></div></div><div class="qm-api-collapsible-content"><div class="qm-api-item-content"><div class="qm-api-description"></div><div class="qm-api-extras"></div><div class="qm-api-group-container"></div></div></div></div>
