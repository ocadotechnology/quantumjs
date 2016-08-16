# quantum-dom

A module intended for use with `quantum-js`

A simple virtual dom used by quantum as part of the html generation process.

## Examples

    const dom = require('quantum-dom')

    // examples
    const div = dom.create('div').class('my-class').text('Hello World')
    div.stringify() // '<div class="my-class">Hello World</div>

## Api

    dom.create(type: String): Element - creates an element
    dom.randomId(): String - returns a new random 32 character string for use as unique ids in pages
    dom.all(maybePromises: Array[Promise/Any]): Promise[Array[Any]]/Array[Any] - does the same as Promise.all, except when all the entries in the input array are not promises, in which case it returns an Array
    dom.stringify(element: Element) - turns an html element into a html page

    Element::id(): String - gets the id for the element
    Element::id(id: String): Element - sets the current id for the element
    Element::class(): String - gets the class for the element
    Element::class(class: String): Element - sets the current class for the element
    Element::classed(class: String): Boolean - checks if the element has a class (true means it does)
    Element::classed(class: String, add: Boolean): Element - adds or removes a class to an element (add=true to add, false to remove)
    Element::attr(name: String): String - gets one of the attributes
    Element::attr(name: String, value: String): Element - sets one of the attributes
