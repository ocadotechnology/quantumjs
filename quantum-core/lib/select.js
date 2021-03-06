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

function maybePromiseAll (arr) {
  return arr.some(x => x ? x.then : false) ? select.Promise.all(arr) : arr
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
  addAfter: function (content) {
    if (this._parent) {
      const parentContent = this._parent.content()
      const index = parentContent.indexOf(this._entity)
      if (index > -1) {
        if (Array.isArray(content)) {
          parentContent.splice.apply(parentContent, [index + 1, 0].concat(content))
        } else {
          parentContent.splice(index + 1, 0, content)
        }
      }
      return this
    } else {
      throw new Error("Can't add content after this element - it has no parent")
    }
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
      return this._entity.content.filter(isText).join('\n')
    }
  },
  has: function (type, options) {
    if (options && options.recursive) {
      const parent = this
      return this._entity.content.some((child) => child.type === type) ||
        this._entity.content.some((child) => {
          return isEntity(child) && select(child, parent).has(type, options)
        })
    } else {
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
    const res = []
    if (Array.isArray(type)) {
      const types = type
      const a = this._entity.content
      const l = a.length
      for (let i = 0; i < l; i++) {
        const child = a[i]
        if (types.indexOf(child.type) > -1) {
          res.push(select(child, parent))
        }
      }
    } else {
      const a = this._entity.content
      const l = a.length
      for (let i = 0; i < l; i++) {
        const child = a[i]
        if (child.type === type) {
          res.push(select(child, parent))
        }
      }
    }

    if (options && options.recursive) {
      const a = this._entity.content
      const l = a.length
      for (let i = 0; i < l; i++) {
        const child = a[i]
        if (isEntity(child)) {
          select(child, parent).selectAll(type, options).forEach(d => res.push(d))
        }
      }
    }

    if (options && options.required && res.length === 0) {
      throw new Error(`the field ${type} is options (and missing)`)
    }

    return res
  },
  selectUpwards: function (type) {
    let s = this
    while (s.parent()) {
      s = s.parent()
      if (s.type() === type) {
        return s
      }
    }
    return emptySelection()
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
  remove: function () {
    if (this._parent) {
      if (this._parent.removeChild(this._entity)) {
        this._parent = undefined
      }
    } else {
      throw new Error("An entity with no parent can't be removed")
    }
  },
  removeChild: function (childEntity) {
    const childIndex = this._entity.content.indexOf(childEntity)
    if (childIndex > -1) {
      this._entity.content.splice(childIndex, 1)
      return true
    } else {
      return false
    }
  },
  removeChildOfType: function (type, options) {
    if (Array.isArray(type)) {
      const self = this
      // OPTIM: remove the use of map
      return type.map((t) => self.removeChildOfType(t, options))
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
            const removed = select(child).removeChildOfType(type, options)
            if (removed) {
              return removed
            }
          }
          i++
        }
      }
    }
  },
  removeAllChildrenOfType: function (type, options) {
    if (Array.isArray(type)) {
      const self = this
      // OPTIM: remove the use of map
      return type.map((t) => self.removeAllChildrenOfType(t, options))
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
            select(child).removeAllChildrenOfType(type, options).forEach((removed) => {
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
    return maybePromiseAll(this._entity.content.map((child) => {
      return transformer(isEntity(child) ? select(child, this) : child)
    }))
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

module.exports.select = select
module.exports.isEntity = isEntity
module.exports.isSelection = isSelection
module.exports.isText = isText
module.exports.Selection = Selection
