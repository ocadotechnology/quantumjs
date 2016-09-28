'use strict'
/*

  Select
  ======

  An api for manipulating quantum ast.

*/

// utils
function isText (x) {
  return typeof (x) === 'string' || x instanceof String
}

// duck type check for an entity
function isEntity (d) {
  return isText(d.type) && Array.isArray(d.params) && Array.isArray(d.content)
}

function isSelection (d) {
  return d instanceof Selection
}

function Selection (entity, parent, isFiltered, renderContext) {
  this._entity = entity
  this._parent = parent
  this._isFiltered = isFiltered
  this._renderContext = renderContext
}

function checkNotFiltered (selection) {
  if (selection._isFiltered) {
    throw new Error('Filtered selections cannot be mutated. This means that .filter was called on this selection, which creates a filtered selection.')
  }
}

Selection.prototype = {
  entity: function () {
    return this._entity
  },
  type: function (type) {
    if (arguments.length > 0) {
      checkNotFiltered(this)
      this._entity.type = type
      return this
    } else {
      return this._entity.type
    }
  },
  param: function (i, param) {
    if (arguments.length > 1) {
      checkNotFiltered(this)
      this._entity.params[i] = param
      return this
    } else {
      return this._entity.params[i]
    }
  },
  params: function (params) {
    if (arguments.length > 0) {
      checkNotFiltered(this)
      this._entity.params = params
      return this
    } else {
      return this._entity.params
    }
  },
  addParam: function (param) {
    checkNotFiltered(this)
    this._entity.params.push(param)
    return this
  },
  content: function (content) {
    if (arguments.length > 0) {
      checkNotFiltered(this)
      this._entity.content = content
      return this
    } else {
      return this._entity.content
    }
  },
  add: function (content) {
    checkNotFiltered(this)
    this._entity.content.push(content)
    return this
  },
  append: function (content) {
    checkNotFiltered(this)
    this._entity.content.push(content)
    return select(content, this)
  },
  ps: function (ps) {
    if (arguments.length > 0) {
      checkNotFiltered(this)
      this._entity.params = ps.split(' ')
      return this
    } else {
      return this._entity.params.join(' ')
    }
  },
  cs: function (cs) {
    if (arguments.length > 0) {
      checkNotFiltered(this)
      this._entity.content = cs.split('\n')
      return this
    } else {
      // OPTIM: without the filter (and join?)
      return this._entity.content.filter(isText).join('\n')
    }
  },
  has: function (type, options) {
    if (options && options.recursive) {
      const parent = this
      // OPTIM: benchmark and test against not using some
      // OPTIM: don't use recursion here - try and do the loop in place
      return this._entity.content.some((d) => d.type === type) ||
        this._entity.content.some((child) => {
          return isEntity(child) && select(child, parent).has(type, options)
        })
    } else {
      // OPTIM: benchmark and test against not using some
      return this._entity.content.some((child) => child.type === type)
    }
  },
  hasParams: function () {
    return this._entity.params.length > 0
  },
  hasContent: function () {
    return this._entity.content.length > 0
  },
  isEmpty: function () {
    // OPTIM: remove the use of some (and perhaps trim?)
    return !this._entity.content.some((d) => {
      return isEntity(d) || d.trim() !== ''
    })
  },
  parent: function () {
    return this._parent
  },
  select: function (type, options) {
    return this.selectAll(type, options)[0] || emptySelection()
  },
  selectAll: function (type, options) {
    const parent = this
    let res = undefined
    if (Array.isArray(type)) {
      const types = type
      // OPTIM: do this without the filter and map
      res = this._entity.content.filter((d) => types.indexOf(d.type) > -1)
        .map((child) => select(child, parent))
    } else {
      // OPTIM: do this without the filter and map
      res = this._entity.content.filter((d) => d.type === type)
        .map((child) => select(child, parent))
    }

    if (options && options.recursive) {
      // OPTIM: do this without the forEach and the recursion
      this._entity.content.filter(isEntity).forEach((child) => {
        res = res.concat(select(child, parent).selectAll(type, options))
      })
    }

    if (options && options.required && res.length === 0) {
      throw new Error('the field ' + type + ' is options (and missing)')
    }

    return res
  },
  filter: function (f) {
    if (Array.isArray(f)) {
      return this.filter((entity) => f.indexOf(entity.type) > -1)
    } else if (isText(f)) {
      return this.filter((entity) => entity.type === f)
    } else {
      const filteredEntity = {
        type: this._entity.type,
        params: this._entity.params,
        content: this._entity.content.filter(f)
      }
      return new Selection(filteredEntity, this._parent, true, this._renderContext)
    }
  },
  remove: function (type, options) {
    if (Array.isArray(type)) {
      const self = this
      // OPTIM: remove the use of map
      return type.map((t) => self.remove(t, options))
    } else {
      let i = 0
      const content = this._entity.content
      while (i < content.length) {
        const entity = content[i]
        if (isEntity(entity) && entity.type === type) {
          content.splice(i, 1)
          return entity
        }
        i++
      }

      if (options && options.recursive) {
        i = 0
        while (i < content.length) {
          const child = content[i]
          if (isEntity(child)) {
            const removed = select(child).remove(type, options)
            if (removed) {
              return removed
            }
          }
          i++
        }
      }
    }
  },
  removeAll: function (type, options) {
    if (Array.isArray(type)) {
      const self = this
      // OPTIM: remove the use of map
      return type.map((t) => self.removeAll(t, options))
    } else {
      const result = []
      let i = 0
      const content = this._entity.content
      while (i < content.length) {
        const entity = content[i]
        if (isEntity(entity) && entity.type === type) {
          content.splice(i, 1)
          result.push(entity)
        } else {
          i++
        }
      }

      if (options && options.recursive) {
        i = 0
        while (i < content.length) {
          const child = content[i]
          if (isEntity(child)) {
            select(child).removeAll(type, options).forEach((removed) => {
              result.push(removed)
            })
          }
          i++
        }
      }

      return result
    }
  },
  transformContext: function (obj) {
    if (arguments.length > 0) {
      this._renderContext = obj
      return this
    } else {
      return this._renderContext
    }
  },
  transform: function (transformer) {
    return this._entity.content.map((child) => {
      return transformer(isEntity(child) ? select(child, this) : child)
    })
  }
}

function emptySelection () {
  return new Selection({type: '', params: [], content: []}, undefined, false, {})
}

function select (entity, parent) {
  if (Array.isArray(entity.content)) {
    return new Selection(entity, parent, false, {})
  } else if (entity instanceof Selection) {
    return entity
  } else {
    throw new Error("Something that doesn't look like an entity was selected")
  }
}

select.Promise = Promise // interchangeable promise implementation

module.exports = select
module.exports.isEntity = isEntity
module.exports.isSelection = isSelection
module.exports.isText = isText
module.exports.Selection = Selection
