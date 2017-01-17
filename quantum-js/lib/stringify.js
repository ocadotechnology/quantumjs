'use strict'
/*

  Stringify
  =========

  Turns quantum ast back into quantum markup.

*/

const select = require('./select')

function entityToString (entity, indent) {
  if (entity.content) {
    const sameLineContent = entity.content.length === 1 && select.isText(entity.content[0])

    const params = entity.params.length > 0 ? ' ' + entity.params.join(' ') : ''

    if (sameLineContent) {
      return indent + '@' + entity.type + params + ': ' + entity.content[0]
    } else if (entity.content.length >= 1) {
      return indent + '@' + entity.type + params + '\n' + entity.content.map((e) => entityToString(e, indent + '  ')).join('\n')
    } else {
      return indent + '@' + entity.type + params
    }
  } else {
    return entity.length > 0 ? indent + entity : ''
  }
}

module.exports = (ast, options) => {
  if (ast.type) {
    return entityToString(ast, '')
  } else {
    return ast.content.map((entity) => entityToString(entity, '')).join('\n') + '\n'
  }
}
