'use strict'
const quantum = require('quantum-js')

function replacer (variables, str) {
  let res = str
  variables.forEach((v) => {
    const val = (typeof (v.value) === 'object') ? JSON.stringify(v.value) : v.value
    res = res.replace('{{' + v.key + '}}', val)
  })
  return res
}

function processEntity (entity, dictionary, content) {
  let res = content.slice(0)
  if (entity && entity.content) {
    entity.content.forEach((child) => {
      const r = template(child, dictionary)
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
    let content = []
    let variableName = undefined
    let variable = undefined
    if (entity.type === 'for') {
      if (entity.params.length < 3) {
        throw new Error('for loop has wrong arguments: for ' + entity.params.join(' '))
      }

      const usesIndex = entity.params[1] !== 'in'

      const variable1 = {
        key: entity.params[0],
        value: undefined
      }
      const variable2 = usesIndex ? {
        key: entity.params[1],
        value: undefined
      } : undefined

      const source = usesIndex ? entity.params[3] : entity.params[2]

      let items = variables.filter((key) => key.key === source)[0]

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
  let keys = []
  const vars = variables || {}
  const resolvedPrefix = prefix || ''

  Object.keys(vars).forEach((key) => {
    const value = vars[key]
    if (value !== null && typeof (value) === 'object' && !Array.isArray(value)) {
      keys.push({
        key: resolvedPrefix + key,
        value: value
      })
      keys = keys.concat(prepareVariables(value, resolvedPrefix + key + '.'))
    } else {
      if (Array.isArray(value)) {
        value.forEach((v, i) => {
          keys.push({
            key: resolvedPrefix + key + '[' + i + ']',
            value: v
          })
        })
      }
      keys.push({
        key: resolvedPrefix + key,
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
  const defsList = quantum.select(parsed).selectAll('define', {recursive: true})
  const definitions = {}
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
    const selection = quantum.select(parsed)

    // XXX: add sub-entities name.ps, name.cs, age.ps, age.cs, etc
    const variables = [
      {key: 'ps', value: selection.ps()},
      {key: 'cs', value: selection.cs()}
    ]

    selection.params().forEach((param, i) => {
      variables.push({key: 'param[' + i + ']', value: param})
    })

    selection.content().forEach((param, i) => {
      variables.push({key: 'content[' + i + ']', value: param})
    })

    return template({type: '', ps: [], content: definitions[parsed.type].content}, variables).content
  } else {
    let content = undefined
    if (Array.isArray(parsed.content)) {
      content = []
      parsed.content.forEach((c) => {
        const res = applyDefinitions(c, definitions)
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

function pipeline (options) {
  const variables = prepareVariables(options ? options.variables : {})

  return (page) => {
    const definitions = digestDefinitions(page.content)

    return page.clone({
      content: applyVariables(applyDefinitions(page.content, definitions), variables)
    })
  }
}

// insert the page title by wrapping the passed in object
function wrapper (options) {
  return (obj) => {
    return quantum.read(options.templateFilename)
      .then((template) => {
        const contentEntity = quantum.select(template.content).select('content', {recursive: true})
        const position = contentEntity.parent.content.indexOf(contentEntity.original)
        const parentContent = contentEntity.parent.original.content
        parentContent.splice.apply(parentContent, [position, 1].concat(obj.content.content))
        obj.content = template.content
        return obj
      })
  }
}

module.exports = pipeline
module.exports.wrapper = wrapper
