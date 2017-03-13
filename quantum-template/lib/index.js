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
          const valIsObj = (typeof value === 'object') && (value !== null)
          if (valIsObj) {
            Object.keys(value).forEach(key => {
              variables.push({
                key: `${variable1.key}.${key}`,
                value: value[key]
              })
            })
          }
          content = processEntity(entity, variables, content)
          if (valIsObj) {
            Object.keys(value).forEach(_ => variables.pop())
          }
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
      variables.push({key: `param[${i}]`, value: param})
    })

    selection.content().forEach((param, i) => {
      variables.push({key: `content[${i}]`, value: param})
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

// Processes the page for wrapping templates.
function wrapper (pageContent, wrapperOptions) {
  const selection = quantum.select({
    type: '',
    params: [],
    content: pageContent.content
  })

  if (selection.has('template')) {
    const template = selection.select('template')

    // find out the name of the entity to replace with the page content
    const contentEntityType = template.has('contentEntityName') ?
      template.select('contentEntityName').ps() : 'content'

    // find the place to mount the rest of the page's content
    const contentEntity = template.select('content').select(contentEntityType, {recursive: true})

    const parentContent = contentEntity.parent().content()

    // find out where the mount point is
    const position = parentContent.indexOf(contentEntity.entity())

    // get the content to place at the mount point (ie remove all @templates from the page)
    const nonTemplateContent = selection.filter(x => x.type !== 'template')

    // make the replacement
    parentContent.splice.apply(parentContent, [position, 1].concat(nonTemplateContent.content()))

    return {
      content: template.select('content').content()
    }
  } else {
    return pageContent
  }
}

function fileTransform (options) {
  const variables = prepareVariables(options ? options.variables : {})
  const wrapperOptions = {}

  return (file) => {
    const definitions = digestDefinitions(file.content)

    return file.clone({
      content: applyVariables(applyDefinitions(wrapper(file.content, wrapperOptions), definitions), variables)
    })
  }
}

module.exports = {
  fileTransform,
  wrapper
}
