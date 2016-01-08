QuantumJS
=========

About
-----

Quantum is comprised of a simple markup language, and several modules for transforming the parsed markup into rendered web pages. Its goal is to be as readable as markdown whilst maintaing the flexibiliy of html.

The process of converting markup into rendered html happens in a customisable pipeline of transforms. The transforms convert the markup from one form to another, eventually ending up as html which can be written to a file.

Quantum can be used to decouple page content from the final page structure, allowing radical changes to be made to the way content is displayed without touching the content files. This is achieved through defining custom types and transform functions for those types.

Having the ability to manipulate the AST (abstract syntax tree) also opens up the possibility to add features that are not baked into the language, such as support for templating with basic logic, defining new types within a document, and even using diffs to describe what has changed between two versions of a document.

The code to set up the transforms follows a similar pattern to the above flowchart, making use of promises to provide a clean api for chaining transforms.

This readme includes no details about how to use the library itself as there is extensive documentation for the library available here: https://quantum.hexagonjs.io.
