/*
     ____                    __                      _
    / __ \__  ______ _____  / /___  ______ ___      (_)____
   / / / / / / / __ `/ __ \/ __/ / / / __ `__ \    / / ___/
  / /_/ / /_/ / /_/ / / / / /_/ /_/ / / / / / /   / (__  )
  \___\_\__,_/\__,_/_/ /_/\__/\__,_/_/ /_/ /_(_)_/ /____/
                                              /___/

  Stringify
  =========

  Turns quantum ast back into quantum markup.

*/

var select = require('./select')

function entityToString (entity, indent) {
  if (entity.content) {
    var sameLineContent = entity.content.length === 1 && select.isText(entity.content[0])

    var params = entity.params.length > 0 ? ' ' + entity.params.join(' ') : ''

    if (sameLineContent) {
      return indent + '@' + entity.type + params + ': ' + entity.content[0]
    } else if (entity.content.length >= 1) {
      return indent + '@' + entity.type + params + '\n' + entity.content.map(function (e) {
        return entityToString(e, indent + '  ')
      }).join('\n')
    } else {
      return indent + '@' + entity.type + params
    }
  } else {
    return entity.length > 0 ? indent + entity : ''
  }
}

module.exports = function (ast, options) {
  return ast.content.map(function (entity) {
    return entityToString(entity, '')
  }).join('\n') + '\n'
}
