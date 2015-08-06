/*
     ____                    __                      _
    / __ \__  ______ _____  / /___  ______ ___      (_)____
   / / / / / / / __ `/ __ \/ __/ / / / __ `__ \    / / ___/
  / /_/ / /_/ / /_/ / / / / /_/ /_/ / / / / / /   / (__  )
  \___\_\__,_/\__,_/_/ /_/\__/\__,_/_/ /_/ /_(_)_/ /____/
                                              /___/

  Create
  ======

  Api for building parsed ast easily. Most useful when building transformations
  that convert from ast to ast.

*/

function Entity(type) {
  this.type = type
  this.params = []
  this.content = []
}

Entity.prototype = {
  parameters: function(params) {
    this.params = params
    return this
  },
  add: function(entity) {
    this.content.push(entity)
    return this
  },
  build: function() {
    return {
      type: type,
      params: params,
      content: content.map(function(item){
        if(item instanceof Entity) {
          return item.build()
        } else {
          return item
        }
      })
    }
  }
}

module.exports = function(type) {
  return new Entity(type)
}