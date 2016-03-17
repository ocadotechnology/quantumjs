# quantum-hub

## About

This project is a server for hosting quantum based sites. It comes with built in revisioning, support for custom quantum pipelines, and all the features that the quantum-js family provides.



## Commands

### init

This sets up a new project in a directory, which consists of creating a quantum.json file with some default settings.

### register <hub-name> <hub-url>

This registers this project with some remote hub. The hub is where the pages can be published. The hub name is up to you.

### build

Builds the project into the target directory

### watch

Builds the project into the target directory, and watches for changes, rebuilding on any change. This also starts up a local web server.

### publish <hub-name>

Publishes the docs to the hub specified and updates the site to show this version. Returns the revision number. Every time you publish the revision number is incremented.

### set-revision <hub-name> <revision-number>

Sets the docs revision to a specific version - useful for rolling back to old editions.



## Project structure

This project contains several components that together form a tool for writing, publishing and serving documentation from a central hub.

### Shared (shared folder)

Code shared by the server and the client library (mostly to do with building a quantum site)

### Client (client folder)

A library for building docs locally and publishing to the central hub.

### Server (rest api + static file server)

A server that can be used as a central hub for documentation.
