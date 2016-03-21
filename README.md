# QuantumJS

Documentation: https://quantum.hexagonjs.io

A fast, customisable static site generator.

QuantumJS has one main goal: convert structured markup into HTML.

QuantumJS is a static site generator with the following design goals:

 - Extensible & customisable
 - No enforced directory structure
 - Clean separation of content from final styled output
 - Simplicity
 - Speed
 - Output format agnostic (be able to output to HTML, PDF, Markdown, etc)

This repository contains the parser for the language along with some common transforms:

|Directory|Description|
|----------|-----------|
| quantum-js | The language parser, and utilities for working with the parsed AST |
| quantum-dom | A virtual DOM library which quantum uses to build the HTML |
| quantum-watch | An API for watching quantum files for changes, notifying you when they do |
| quantum-template | A transform which adds common templating abilities |
| quantum-version | A transform that lets you write versioned content with incremental changes |
| quantum-html | A transform for converting AST to quantum virtual DOM |
| quantum-api | A set of HTML entity transforms for writing API documentation (for JavaScript and CSS) |
| quantum-changelog | A set of HTML entity transforms for writing changelogs (and a transform for generating changelogs automatically from API docs) |
| quantum-diagram | A set of HTML entity transforms for creating graphviz style diagrams |
| quantum-docs | A set of HTML entity transforms for building technical documentation sites |
| quantum-cli | A command line tool for building quantum-based sites using a single config file |
| quantum-hub | A server for hosting multiple quantum based sites |
| docs | Contains the documentation site (https://quantum.hexagonjs.io) |
