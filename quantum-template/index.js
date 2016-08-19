var quantum = require('quantum-js')

function replacer (variables, str) {
  var res = str
  variables.forEach((v) => {
    let val
    if (typeof (v.value) === 'object') {
      val = JSON.stringify(v.value)
    } else {
      val = v.value
    }
    res = res.replace('{{' + v.key + '}}', val)
  })
  return res
}

function processEntity (entity, dictionary, content) {
  var res = content.slice(0)
  if (entity && entity.content) {
    entity.content.forEach((child) => {
      var r = template(child, dictionary)
      if (Array.isArray(r)) {
        res = res.concat(r)
      } else {
        res.push(r)
      }
    })
  }

  return res
}

function template (entity, variables) {
  if (typeof (entity) === 'string') {
    return replacer(variables, entity)
  } else {
    var content = []
    let variableName, variable
    if (entity.type === 'for') {
      if (entity.params.length < 3) {
        throw new Error('for loop has wrong arguments: for ' + entity.params.join(' '))
      }

      var variable1 = {
        key: entity.params[0],
        value: undefined
      }

      let source
      if (entity.params[1] !== 'in') {
        var variable2 = {
          key: entity.params[1],
          value: undefined
        }
        source = entity.params[3]
      } else {
        source = entity.params[2]
      }

      var items = variables.filter((key) => key.key === source)[0]

      if (items) {
        items = items.value
      }

      if (Array.isArray(items)) {
        variables.push(variable1)

        items.forEach((value) => {
          variable1.value = value
          content = processEntity(entity, variables, content)
        })

        variables.pop()
      } else if (items !== undefined) {
        variables.push(variable1)
        variables.push(variable2)

        Object.keys(items).forEach((key) => {
          variable1.value = key
          variable2.value = items[key]
          content = processEntity(entity, variables, content)
        })

        variables.pop()
        variables.pop()
      }

      return content
    } else if (entity.type === 'if') {
      variableName = entity.params[0]
      variable = variables.filter((key) => key.key === variableName)[0]

      if (variable && variable.value) {
        content = processEntity(entity, variables, content)
      }

      return content
    } else if (entity.type === 'ifnot') {
      variableName = entity.params[0]
      variable = variables.filter((key) => key.key === variableName)[0]

      if (!variable || !variable.value) {
        content = processEntity(entity, variables, content)
      }

      return content
    } else {
      content = processEntity(entity, variables, content)

      if (entity.type || entity.params) {
        return {
          type: entity.type,
          params: entity.params.map((str) => replacer(variables, str)),
          content: content
        }
      } else {
        return {
          content: content
        }
      }
    }
  }
}

function prepareVariables (variables, prefix) {
  var keys = []
  var vars = variables || {}
  prefix = prefix || ''

  Object.keys(vars).forEach((key) => {
    var value = vars[key]
    if (value !== null && typeof (value) === 'object' && !Array.isArray(value)) {
      keys.push({
        key: prefix + key,
        value: value
      })
      keys = keys.concat(prepareVariables(value, prefix + key + '.'))
    } else {
      if (Array.isArray(value)) {
        value.forEach((v, i) => {
          keys.push({
            key: prefix + key + '[' + i + ']',
            value: v
          })
        })
      }
      keys.push({
        key: prefix + key,
        value: value
      })
    }
  })

  return keys
}

function applyVariables (parsed, variables) {
  return template(parsed, variables)
}

function digestDefinitions (parsed) {
  var defsList = quantum.select(parsed).selectAll('define', {recursive: true})
  var definitions = {}
  defsList.forEach((def) => {
    definitions[def.ps()] = def.entity()
  })
  return definitions
}

function applyDefinitions (parsed, definitions) {
  if (typeof parsed === 'string') {
    return parsed
  } else if (parsed.type === 'define') {
    return undefined
  } else if (definitions.hasOwnProperty(parsed.type)) {
    var selection = quantum.select(parsed)

    // XXX: add sub-entities name.ps, name.cs, age.ps, age.cs, etc
    var variables = [
      {key: 'ps', value: selection.ps()},
      {key: 'cs', value: selection.cs()}
    ]

    return template({type: '', ps: [], content: definitions[parsed.type].content}, variables).content
  } else {
    let content
    if (Array.isArray(parsed.content)) {
      content = []
      parsed.content.forEach((c) => {
        var res = applyDefinitions(c, definitions)
        if (res !== undefined) {
          if (Array.isArray(res)) {
            content = content.concat(res)
          } else {
            content.push(res)
          }
        }
      })
    } else {
      content = parsed.content
    }

    if (parsed.type || parsed.params) {
      return {
        type: parsed.type,
        params: parsed.params,
        content: content
      }
    } else {
      return {
        content: content
      }
    }
  }
}

module.exports = (options) => {
  var variables = prepareVariables(options ? options.variables : {})

  return (page) => {
    var definitions = digestDefinitions(page.content)

    return page.clone({
      content: applyVariables(applyDefinitions(page.content, definitions), variables)
    })
  }
}

// insert the page title by wrapping the passed in object
module.exports.wrapper = (options) => {
  return (obj) => {
    return quantum.read(options.templateFilename)
      .then((template) => {
        var contentEntity = quantum.select(template.content).select('content', {recursive: true})
        var position = contentEntity.parent.content.indexOf(contentEntity.original)
        var parentContent = contentEntity.parent.original.content
        parentContent.splice.apply(parentContent, [position, 1].concat(obj.content.content))
        obj.content = template.content
        return obj
      })
  }
}
