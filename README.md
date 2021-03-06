# QuantumJS

[![Build Status](https://travis-ci.org/ocadotechnology/quantumjs.svg?branch=master)](https://travis-ci.org/ocadotechnology/quantumjs)
[![Coverage Status](https://coveralls.io/repos/github/ocadotechnology/quantumjs/badge.svg)](https://coveralls.io/github/ocadotechnology/quantumjs)

Documentation: <link goes here>

A fast, customisable static site generator.

QuantumJS has one main goal: convert structured markup into HTML.

QuantumJS is a static site generator with the following design goals:

 - Extensible & customisable
 - No enforced directory structure
 - Clean separation of content from final styled output
 - Simplicity
 - Speed

This repository contains the parser for the language along with some common transforms:

|Directory|Description|
|----------|-----------|
| quantum-core | The language parser, the cli, and utilities for working with the parsed AST |
| quantum-dom | A virtual DOM library which quantum uses to build the HTML |
| quantum-template | A transform which adds common templating abilities |
| quantum-version | A transform that lets you write versioned content with incremental changes |
| quantum-html | A transform for converting AST to quantum virtual DOM |
| quantum-code-highlight | A few HTML entity transforms for syntax highlighting blocks of code |
| quantum-api | A set of HTML entity transforms for writing API documentation (for JavaScript and CSS) |
| quantum-diagram | A set of HTML entity transforms for creating graphviz style diagrams |
| quantum-docs | A set of HTML entity transforms for building technical documentation sites |
| docs | Contains the documentation site (https://ocadotechnology.github.io/quantumjs/) |
