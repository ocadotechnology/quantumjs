'use strict'
const chai = require('chai')
chai.use(require('chai-spies'))
chai.should()

const cli = require('../lib/cli')
const chalk = require('chalk')

describe('cli', () => {
  it('should warn when no config file exists', () => {
    const origWarning = console.warn
    console.warn = chai.spy()

    console.warn.should.not.have.been.called()
    cli([process.cwd(), 'quantum', 'list'])
    console.warn.should.have.been.called.with(chalk.yellow('[warning] No Config file provided, using default values.') + '\n  Config can be provided in quantum.config.js')
    console.warn = origWarning
  })
})
