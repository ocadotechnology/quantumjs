quantum-template
================

About
-----

Inserts variables into the parsed ast and makes it possible to do very basic logic in the markup files. Also provides a way to define reusable templates within the um markup itself by using the @define entity.

Example
-------

source.um
---------

    @h1: Template Test
    @p: Your name is {{name}}.
    @p: You can also use a {{nested.property}}.

    @for person in people
      @div
        @label: Name
        @input: {{person.name}}

    @if config.public
      @div: Content to show

    @ifnot config.public
      @div: Other content to show

    @define person
      @name: {{ps}}
      @age: {{cs}}

    @person Bob: 23
    @person Jan: 21
    @person Dan: 47

index.js
--------

    var quantum = require('quantum')
    var template  = require('quantum-template')
    var html      = require('quantum-html')

    var templateValues = {
      config: {public: true},
      name: 'Dave',
      people: [
        {name: 'Kate'},
        {name: 'Barry'},
        {name: 'Tony'}
      ]
    }

    quantum.read('source.um')
      .then(template({variables: templateValues}))
      .then(html())
      .then(html.stringify())
      .then(quantum.write('target'))

output.html
-----------


Running the tests
-----------------

    npm run test
    npm run coverage