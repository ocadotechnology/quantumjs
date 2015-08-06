/*

     ____                    __                      _
    / __ \__  ______ _____  / /___  ______ ___      (_)____
   / / / / / / / __ `/ __ \/ __/ / / / __ `__ \    / / ___/
  / /_/ / /_/ / /_/ / / / / /_/ /_/ / / / / / /   / (__  )
  \___\_\__,_/\__,_/_/ /_/\__/\__,_/_/ /_/ /_(_)_/ /____/
                                              /___/

  Dom
  ====

  This module provides an api for building up a virtual representation
  of the dom, which can then be rendered out to a html string.

*/

var Promise   = require('bluebird')
var fs        = Promise.promisifyAll(require('fs'))

// utility for creating ids
var uidCounter = 0
function nextId(){
  uidCounter++
  return 'id' + uidCounter
};


// an abstract representation of a dom node
function Element(page, type, uid) {
  this.page = page
  this.parent = undefined
  this.uid = uid
  this.type = type
  this.attrs = {}
  this.content = []
};

// sets the unique id (if you need to refer to the element in the future)
Element.prototype.uuid = function(id) {
  if(arguments.length === 0) {
    return this.uid
  } else {
    delete this.page.elements[this.uid]
    this.uid = id
    this.page.elements[this.uid] = this
    return this
  }
};

// sets an attribute for the element
Element.prototype.attr = function(name, value) {
  if(arguments.length === 1) {
    return this.attrs[name]
  } else {
    this.attrs[name] = value
    return this
  }
};

// sets the id for this element
Element.prototype.id = function(id) {
  if (arguments.length === 0) {
    return this.attr('id')
  } else {
    return this.attr('id', id)
  }
};

// sets the class attribute for this element
Element.prototype['class'] = function(cls) {
  if (arguments.length === 0) {
    return this.attr('class')
  } else {
    return this.attr('class', cls)
  }
};

// adds an element to this element, and returns this element
Element.prototype.add = function(element) {
  if (element.then){
    var self = this
    return element.then(function(el){
      self.add(el)
      return self
    })
  }
  element.parent = this
  if (Array.isArray(element)) {
    var self = this
    element.forEach(function(el) {
      self.content.push(el)
    })
  } else {
    this.content.push(element)
  }
  return this
};

// adds an element to this element and returns the added element
Element.prototype.append = function(element) {
  if (element.then){
    var self = this
    return element.then(function(el){
      self.add(el)
      return self
    })
  }
  element.parent = this
  if (Array.isArray(element)) {
    var self = this
    element.forEach(function(el) {
      self.content.push(el)
    })
  } else {
    this.content.push(element)
  }
  return element
};

// adds text to the content of the element
Element.prototype.text = function(text) {
  this.content.push(text)
  return this
};

Element.prototype.removeChild = function(element) {
  var index = this.content.indexOf(element)
  if (index > -1) {
    this.content.splice(index, 1)
    delete this.page.elements[element.uid]
  }
  return index > -1
};

// removes the element from its parent
Element.prototype.remove = function() {
  if (this.parent) {
    return this.parent.removeChild(this)
  } else {
    delete this.page.elements[this.uid]
    return true
  }
};

// turns the element into an html string
Element.prototype.render = function() {
  var self = this

  var attributes = Object.keys(this.attrs).map(function(k) {
    return k + '="' + self.attrs[k] + '"'
  }).join(' ')

  if (attributes.length > 0) {
    attributes = ' ' + attributes
  }

  var content = this.content.map(function(d){
    return d.render ? d.render() : d
  }).join('')

  return '<' + this.type + attributes + '>' + content + '</' + this.type + '>'
};

function TextElement (page, text, uid) {
  this.page = page
  this.parent = undefined
  this.uid = uid
  this.text = text
}

// turns the element into an html string
TextElement.prototype.render = function() {
  return this.text
};

// factory for elements, and a manager for retrieving elements by uid
function Page() {
  this.elements = {}
  this.html = this.create('html')
  this.head = this.html.append(this.create('head'))
  this.body = this.html.append(this.create('body'))
  this.bodyEnd = this.create('<--script-holder-->')
  this.styles = {}
  this.scripts = {}
};

// create an element
Page.prototype.create = function(type, uid) {
  if(uid === undefined) {
    uid = nextId()
  }
  var element = new Element(this, type, uid)
  this.elements[uid] = element
  return element
};

// create an element
Page.prototype.textNode = function(text, uid) {
  if(uid === undefined) {
    uid = nextId()
  }
  var element = new TextElement(this, text, uid)
  this.elements[uid] = element
  return element
};

// get an element by its uid
Page.prototype.get = function(uid) {
  return this.elements[uid]
}

// removes an element using the element itself, or by uid
Page.prototype.remove = function(element) {
  if(!(element instanceof Element)) {
    element = this.get(element)
  }

  if(element.parent !== undefined) {
    element.parent.removeChild(element)
  } else {
    delete this.elements[element.uid]
  }

  return this
};

Page.prototype.render = function() {
  var self = this

  Object.keys(this.styles).forEach(function(k) {
    self.head.append(self.create('style').text(self.styles[k]))
  })

  Object.keys(this.scripts).forEach(function(k) {
    self.body.append(self.create('script').text(self.scripts[k]))
  })

  this.bodyEnd.content.forEach(function(item) {
    self.body.append(item)
  })
  return '<!DOCTYPE html>\n' + this.html.render()
}

// loads the file specified
function loadAsset(filename) {
  return fs.readFileAsync(filename, 'utf-8')
}

// adds resources to the page from files. if an asset already exists it will not be reloaded
Page.prototype.addAssets = function(obj) {
  var promises = []
  var page = this;

  if (obj.js) {
    Object.keys(obj.js).forEach(function(k){
      if (!page.scripts[k]) {
        promises.push(loadAsset(obj.js[k])
          .then(function(p){
            page.scripts[k] = p
          }))
      }
    })
  }

  if (obj.css) {
    Object.keys(obj.css).forEach(function(k){
      if (!page.styles[k]) {
        promises.push(loadAsset(obj.css[k])
          .then(function(p){
            page.styles[k] = p
          }))
      }
    })
  }

  return Promise.all(promises)
    .then(function(){
      return page
    })
};

// utilities / shorthand for certain elements

Page.prototype.script = function(src, uid) {
  return this.create('script', uid)
    .attr('src', src)
};

Page.prototype.stylesheet = function(src, uid) {
  return this.create('link', uid)
    .attr('rel', 'stylesheet')
    .attr('type', 'text/css')
    .attr('href', src)
};

Page.prototype.addCommonMetaTags = function() {
  this.head.append(this.create('meta').attr('charset', 'UTF-8'))
  this.head.append(this.create('meta').attr('name', 'viewport').attr('content', 'width=device-width, initial-scale=1'))
  return this
}

module.exports = function() {
  return new Page()
};


