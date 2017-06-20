const dom = require('quantum-dom')

// creates a sign in block for the @signIn entity
function signIn (selection) {
  return dom.create('div').class('sign-in')
    .add(dom.create('input').class('username-input'))
    .add(dom.create('input').class('password-input'))
    .add(dom.create('button').class('sign-in-button').text('Sign in'))
}

function entityTransforms () {
  return Object.freeze({
    signIn
  })
}

module.exports = {
  entityTransforms
}
