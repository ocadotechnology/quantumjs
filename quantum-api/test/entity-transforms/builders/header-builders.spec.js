const chai = require('chai')
const quantum = require('quantum-js')
const dom = require('quantum-dom')
const headerBuilders = require('../../../lib/entity-transforms/builders/header')
const header = require('../../../lib/entity-transforms/components/header')
const type = require('../../../lib/entity-transforms/components/type')

chai.should()

describe('header-builders', () => {
  describe('nameHeaderDetails', () => {
    it('nameHeaderDetails render correctly', () => {
      const selection = quantum.select({
        type: '',
        params: ['Name'],
        content: []
      })

      headerBuilders.nameHeaderDetails(selection).should.eql(
        dom.create('span')
          .class('qm-api-header-name')
          .id('name')
          .text('Name')
      )
    })
  })

  describe('typeHeaderDetails', () => {
    it('typeHeaderDetails render correctly', () => {
      const selection = quantum.select({
        type: '',
        params: ['Type'],
        content: []
      })

      headerBuilders.typeHeaderDetails(selection, {}).should.eql(
        dom.create('span')
          .class('qm-api-header-type')
          .id('type')
          .add(type('Type', {}))
      )
    })
  })

  describe('propertyHeaderDetails', () => {
    it('propertyHeaderDetails render correctly', () => {
      const selection = quantum.select({
        type: '',
        params: ['value', 'Type'],
        content: []
      })

      headerBuilders.propertyHeaderDetails(selection, {}).should.eql(
        dom.create('span')
          .class('qm-api-header-property')
          .id('value')
          .add(dom.create('span').class('qm-api-header-property-name').add('value'))
          .add(dom.create('span').class('qm-api-header-property-type').add(type('Type', {})))
      )
    })

    it('propertyHeaderDetails should render with missing params', () => {
      const selection = quantum.select({
        type: '',
        params: [],
        content: []
      })

      headerBuilders.propertyHeaderDetails(selection, {}).should.eql(
        dom.create('span')
          .class('qm-api-header-property')
          .add(dom.create('span').class('qm-api-header-property-name').add(''))
          .add(dom.create('span').class('qm-api-header-property-type').add(type(undefined, {})))
      )
    })
  })

  describe('functionHeaderDetails', () => {
    it('functionHeaderDetails render correctly', () => {
      const selection = quantum.select({
        type: '',
        params: ['functionName'],
        content: [
          {type: 'param', params: ['param1', 'Type1'], content: []},
          {type: 'param?', params: ['param2', 'Type2'], content: []}
        ]
      })

      headerBuilders.functionHeaderDetails(selection, {}).should.eql(
        dom.create('span')
          .id('functionname')
          .class('qm-api-header-function')
          .add(dom.create('span').class('qm-api-header-function-name').add('functionName'))
          .add(dom.create('span').class('qm-api-header-function-params')
            .add(dom.create('span').class('qm-api-header-function-param')
              .add(dom.create('span').class('qm-api-header-function-param-name').add('param1'))
              .add(dom.create('span').class('qm-api-header-function-param-type').add(type('Type1', {}))))
            .add(dom.create('span').class('qm-api-header-function-param qm-api-optional')
              .add(dom.create('span').class('qm-api-header-function-param-name').add('param2'))
              .add(dom.create('span').class('qm-api-header-function-param-type').add(type('Type2', {})))))
      )
    })

    it('functionHeaderDetails render a returns block', () => {
      const selection = quantum.select({
        type: '',
        params: ['functionName'],
        content: [
          {type: 'returns', params: ['ReturnType'], content: []}
        ]
      })

      headerBuilders.functionHeaderDetails(selection, {}).should.eql(
        dom.create('span')
          .id('functionname')
          .class('qm-api-header-function')
          .add(dom.create('span').class('qm-api-header-function-name').add('functionName'))
          .add(dom.create('span').class('qm-api-header-function-params'))
          .add(dom.create('span').class('qm-api-header-function-returns').add(type('ReturnType', {})))
      )
    })

    it('functionHeaderDetails render a constructor', () => {
      const selection = quantum.select({
        type: 'constructor',
        params: [],
        content: []
      })

      headerBuilders.functionHeaderDetails(selection, {}).should.eql(
        dom.create('span')
          .class('qm-api-header-function')
          .add(dom.create('span').class('qm-api-header-function-name').add('constructor'))
          .add(dom.create('span').class('qm-api-header-function-params'))
      )
    })
  })

  describe('prototypeHeaderDetails', () => {
    it('prototypeHeaderDetails render correctly', () => {
      const selection = quantum.select({
        type: '',
        params: ['Type'],
        content: []
      })

      headerBuilders.prototypeHeaderDetails(selection, {}).should.eql(
        dom.create('span')
          .id('type')
          .class('qm-api-header-prototype')
          .add(dom.create('span').class('qm-api-prototype-name').text('Type'))
      )
    })

    it('prototypeHeaderDetails with missing name', () => {
      const selection = quantum.select({
        type: '',
        params: [],
        content: []
      })

      headerBuilders.prototypeHeaderDetails(selection, {}).should.eql(
        dom.create('span')
          .class('qm-api-header-prototype')
          .add(dom.create('span').class('qm-api-prototype-name').text(''))
      )
    })

    it('prototypeHeaderDetails extends', () => {
      const selection = quantum.select({
        type: '',
        params: ['Type'],
        content: [
          {
            type: 'extends',
            params: ['EventEmitter'],
            content: []
          }
        ]
      })

      headerBuilders.prototypeHeaderDetails(selection, {}).should.eql(
        dom.create('span')
          .id('type')
          .class('qm-api-header-prototype')
          .add(dom.create('span').class('qm-api-prototype-name').text('Type'))
          .add(dom.create('span').class('qm-api-prototype-extends').text('extends'))
          .add(dom.create('span').class('qm-api-prototype-extender').add(type('EventEmitter', {})))
      )
    })
  })

  describe('nameHeader', () => {
    it('should be wrapped in a header', () => {
      const selection = quantum.select({
        type: '',
        params: ['Name'],
        content: []
      })

      headerBuilders.nameHeader()(selection).should.eql(
        header('name', headerBuilders.nameHeaderDetails(selection), selection)
      )
    })
  })

  describe('typeHeader', () => {
    it('should be wrapped in a header', () => {
      const selection = quantum.select({
        type: '',
        params: ['Type'],
        content: []
      })

      headerBuilders.typeHeader()(selection).should.eql(
        header('type', headerBuilders.typeHeaderDetails(selection, {}), selection)
      )
    })
  })

  describe('propertyHeader', () => {
    it('should be wrapped in a header', () => {
      const selection = quantum.select({
        type: '',
        params: ['name', 'Type'],
        content: []
      })

      headerBuilders.propertyHeader()(selection).should.eql(
        header('property', headerBuilders.propertyHeaderDetails(selection, {}), selection)
      )
    })

    it('should use the passed in type links', () => {
      const selection = quantum.select({
        type: '',
        params: ['name', 'Type'],
        content: []
      })

      headerBuilders.propertyHeader({typeLinks: {Type: '/some/docs'}})(selection).should.eql(
        header('property', headerBuilders.propertyHeaderDetails(selection, {Type: '/some/docs'}), selection)
      )
    })
  })

  describe('functionHeader', () => {
    it('should be wrapped in a header', () => {
      const selection = quantum.select({
        type: '',
        params: ['name'],
        content: []
      })

      headerBuilders.functionHeader()(selection).should.eql(
        header('function', headerBuilders.functionHeaderDetails(selection, {}), selection)
      )
    })

    it('should use the passed in type links', () => {
      const selection = quantum.select({
        type: '',
        params: ['name'],
        content: [
          {type: 'param', params: ['name', 'Type'], content: []}
        ]
      })

      headerBuilders.functionHeader({typeLinks: {Type: '/some/docs'}})(selection).should.eql(
        header('function', headerBuilders.functionHeaderDetails(selection, {Type: '/some/docs'}), selection)
      )
    })
  })

  describe('prototypeHeader', () => {
    it('should be wrapped in a header', () => {
      const selection = quantum.select({
        type: '',
        params: ['name'],
        content: []
      })

      headerBuilders.prototypeHeader()(selection).should.eql(
        header('prototype', headerBuilders.prototypeHeaderDetails(selection, {}), selection)
      )
    })

    it('should be wrapped in a header', () => {
      const selection = quantum.select({
        type: '',
        params: ['name'],
        content: [
          {type: 'extends', params: ['Type'], content: []}
        ]
      })

      headerBuilders.prototypeHeader({typeLinks: {Type: '/some/docs'}})(selection).should.eql(
        header('prototype', headerBuilders.prototypeHeaderDetails(selection, {Type: '/some/docs'}), selection)
      )
    })
  })
})
