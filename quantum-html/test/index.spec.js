'use strict'
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
chai.should()
require('./module.spec')
require('./buildDOM.spec')
require('./buildHTML.spec')
require('./fileTransform.spec')
require('./HTMLPage.spec')
require('./htmlRenamer.spec')
require('./paragraphTransform.spec')
require('./prepareTransforms.spec')
require('./entityTransforms.spec')
