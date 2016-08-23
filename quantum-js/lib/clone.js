'use strict'
/*
     ____                    __                      _
    / __ \__  ______ _____  / /___  ______ ___      (_)____
   / / / / / / / __ `/ __ \/ __/ / / / __ `__ \    / / ___/
  / /_/ / /_/ / /_/ / / / / /_/ /_/ / / / / / /   / (__  )
  \___\_\__,_/\__,_/_/ /_/\__/\__,_/_/ /_/ /_(_)_/ /____/
                                              /___/

  Clone
  ===

  A function for cloning ast.

*/

const merge = require('merge')

// OPTIM: we know the shape of the ast, so this can be optimised
module.exports = (ast) => merge(true, ast)
