# Contributing

We welcome contributions to this project!

There are a couple of ways you can help out:

 1. Fix a bug. If you find a bug that you want to fix, you can submit
    a pull request to this repository.

 2. Add new features. Check the issue tracker for tasks tagged with 'Idea' or
    'New Feature'. If you have a new idea that isn't yet in the issue tracker, add
    an issue, and we can discuss.

 3. Improve the documentation. If you come across something that isn't well documented
    and want to help improve the documentation, submit a pull request to this repository.
    The documentation lives in the `docs/` folder.

 4. Add syntax highlighting support for your favorite text editor. A couple of editors have
    support already, but the more the better!

## How the project is structured

Each folder contains a module that gets published to npm

When working on multiple modules, it can be useful to link them so that changes you make are picked
up automatically when you require the module. There is a script in the script folder called `link` for
doing this. To run it do:

    ./scripts/link

If you want to undo the links, run the unlink script:

    ./scripts/unlink

## Running the tests

Run this in the relevant module folder

    npm test

For example, to run the tests for quantum-js:

    cd quantum-js
    npm test

Coverage data is output to the `coverage/` folder within the module directory

The tests are also run whenever you push to github.
