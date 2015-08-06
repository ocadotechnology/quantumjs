/*
     ____                    __                      _
    / __ \__  ______ _____  / /___  ______ ___      (_)____
   / / / / / / / __ `/ __ \/ __/ / / / __ `__ \    / / ___/
  / /_/ / /_/ / /_/ / / / / /_/ /_/ / / / / / /   / (__  )
  \___\_\__,_/\__,_/_/ /_/\__/\__,_/_/ /_/ /_(_)_/ /____/
                                              /___/

  Select
  ======

  An api for working with entites, which makes it easier to extract information from them.
  It is possible to work with the parsed ast without the use of this api -- this api
  simply makes some things easier.

*/

var merge   = require('merge')
var Promise = require('bluebird')

// utils
function isString(x) {
  return typeof(x) === 'string' || x instanceof String
}

// duck type check for an entity
function looksLikeAnEntity(d) {
  return isString(d.type) && Array.isArray(d.params) && Array.isArray(d.content)
}

// A small selection api for making building renderers easier
function Selection(type, params, content) {
  this.type = type
  this.params = params
  this.content = content
}

Selection.prototype.select = function(type, required) {
  return select(this.selectAll(type, required)[0])
};

Selection.prototype.selectAll = function(type, required) {
  var res = this.content.filter(function(d){ return d.type==type }).map(select)
  if (required && res.length === 0) {
    throw new Error("the field " + type + " is required (and missing)")
  }
  return res
};

Selection.prototype.param = function(i) {
  return i === undefined ? this.params[0] : this.params[i]
};

Selection.prototype.nonEmpty = function() {
  return this.filter(function(d){
    return looksLikeAnEntity(d) || d.trim() !== ''
  })
};

Selection.prototype.entityContent = function() {
  return this.filter(function(d){
    return looksLikeAnEntity(d)
  })
};

Selection.prototype.textContent = function() {
  return this.filter(function(d){
    return !looksLikeAnEntity(d)
  })
};

// get the parameter string
Selection.prototype.ps = function(joinWith) {
  if (joinWith === undefined) {
    return this.params.join(' ')
  } else {
    return this.params.join(joinWith)
  }
};

// get the content string
Selection.prototype.cs = function(joinWith) {
  if (joinWith === undefined) {
    return this.content.filter(isString).join('\n')
  } else {
    return this.content.filter(isString).join(joinWith)
  }
};

// returns true if the selection has content
Selection.prototype.hasContent = function() {
  return this.content.length > 0
};

// transorms the content to some other form - depends entirely on the transform function - returns a promise
Selection.prototype.transform = function(transform) {
  return select.Promise.all(this.content.map(maybeSelect).map(transform))
};

Selection.prototype.filter = function(f) {
  return new Selection(this.type, this.params, this.content.filter(f))
};

Selection.prototype.clone = function() {
  return select(merge(true, this))
};

Selection.prototype.has = function(type) {
  return this.content.some(function(d){ return d.type == type })
};

Selection.prototype.json = function() {
  return JSON.stringify(this, null, 2)
}

function select(item) {
  if (item) {
    var params = item.params !== undefined ? item.params : []
    var content = item.content !== undefined ? item.content : []
    return new Selection(item.type, params, content)
  } else {
    return new Selection(undefined, [], [])
  }
}

function maybeSelect(item) {
  return looksLikeAnEntity(item) ? select(item) : item
}

// allows swapping out the promise implementation (if wanted)
select.Promise = Promise

module.exports = select
module.exports.isEntity = looksLikeAnEntity