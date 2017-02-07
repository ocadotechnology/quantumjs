'use strict'
describe('combined tests', () => {
  const chai = require('chai')
  const chaiAsPromised = require('chai-as-promised')
  const path = require('path')
  const currDir = process.cwd()
  after(() => {
    process.chdir(currDir)
  })

  beforeEach(() => {
    chai.use(chaiAsPromised)
    chai.should()
  })

  describe('quantum-api', () => {
    before(() => {
      process.chdir(path.join(__dirname, '../quantum-api/'))
    })
    require('../quantum-api/test/index.spec')
  })
  describe('quantum-code-highlight', () => {
    before(() => {
      process.chdir(path.join(__dirname, '../quantum-code-highlight/'))
    })
    require('../quantum-code-highlight/test/index.spec')
  })
  describe('quantum-diagram', () => {
    before(() => {
      process.chdir(path.join(__dirname, '../quantum-diagram/'))
    })
    require('../quantum-diagram/test/index.spec')
  })
  describe('quantum-docs', () => {
    before(() => {
      process.chdir(path.join(__dirname, '../quantum-docs/'))
    })
    require('../quantum-docs/test/index.spec')
  })
  describe('quantum-dom', () => {
    before(() => {
      process.chdir(path.join(__dirname, '../quantum-dom/'))
    })
    require('../quantum-dom/test/index.spec')
  })
  describe('quantum-html', () => {
    before(() => {
      process.chdir(path.join(__dirname, '../quantum-html/'))
    })
    require('../quantum-html/test/index.spec')
  })
  describe('quantum-js', () => {
    before(() => {
      process.chdir(path.join(__dirname, '../quantum-js/'))
    })
    require('../quantum-js/test/index.spec')
  })
  describe('quantum-markdown', () => {
    before(() => {
      process.chdir(path.join(__dirname, '../quantum-markdown/'))
    })
    require('../quantum-markdown/test/index.spec')
  })
  describe('quantum-template', () => {
    before(() => {
      process.chdir(path.join(__dirname, '../quantum-template/'))
    })
    require('../quantum-template/test/index.spec')
  })
  describe('quantum-version', () => {
    before(() => {
      process.chdir(path.join(__dirname, '../quantum-version/'))
    })
    require('../quantum-version/test/index.spec')
  })
})