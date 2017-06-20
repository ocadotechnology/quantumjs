'use strict'
/*

  Clone
  ===

  A function for cloning ast.

*/

const merge = require('merge')

// OPTIM: we know the shape of the ast, so this can be optimised
module.exports = (ast) => merge(true, ast)
