const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const path = require('path')

const quantum = require('quantum-js')
const dom = require('quantum-dom')
const api = require('..')

chai.should()
chai.use(chaiAsPromised)

describe('function', () => {
  function transformer (selection) {
    return quantum.select.isSelection(selection) ? api()[selection.type()](selection, transformer) : selection
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

  it('should render a function that returns', () => {
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

    transformer(selection).should.eql(expected)
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
