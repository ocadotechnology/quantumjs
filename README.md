# QuantumJS

Documentation: https://quantum.hexagonjs.io

A fast, customisable static site generator.

QuantumJS has one main goal: convert structured markup into html.

QuantumJS is a static site generator with the following design goals

 - extensible & customisable
 - no enforced directory structure
 - clean separation of content from final styled output
 - simplicity
 - speed
 - output format agnostic (be able to output to html, pdf, markdown, ect)

This respository contains the parser for the language along with some common transforms:

|directory|description|
|----------|-----------|
| quantum-js | The language parser, and utilities for working with the parsed ast |
| quantum-dom | A virtual dom library which quantum uses to build the html |
| quantum-watch | An api for watching quantum files for changes, notifying you when they do |
| quantum-template | A transform which adds common templating abilities |
| quantum-version | A transform that lets you write versioned content with incremental changes |
| quantum-html | A transform for converting ast to quantum virtual dom |
| quantum-api | A set of html entity transforms for writing api documentation (for javascript and css) |
| quantum-changelog | A set of html entity transforms for writing changelogs (and a transform for generating changelogs automatically from api docs) |
| quantum-diagram | A set of html entity transforms for creating graphviz style diagrams |
| quantum-docs | A set of html entity transforms for building technical documentation sites |
| docs | Contains the documentation site (https://quantum.hexagonjs.io) |
