const dom = require('quantum-dom')
const path = require('path')
// Import the builder components we need
const { builders: { item, itemGroup, header, body: { description } } } = require('quantum-api')

// Equivalent to:
// const builders = require('quantum-api').builders
// const body = builders.body
// const item = builders.item
// const itemGroup = builders.itemGroup
// const header = builders.header
// const descriptions = body.description

// Define the stylesheet asset we're using
const assets = [
  dom.asset({
    url: '/custom-language.css',
    filename: path.join(__dirname, 'custom-language.css')
  })
]

// Define the name of the language
const languageName = 'custom'

// Create a group of @thing entities for the @custom item
const things = itemGroup(languageName, 'thing', 'Things')

function customDetails (selection, transforms) {
  // render the param string as the header details (e.g. for '@thing something' it would be 'something')
  return dom.create('div').text(selection.ps())
}
// Create the transform for the item header
const customHeader = header('custom', customDetails)

// Create the @custom item transform
const customBuilder = item({
  class: 'api-custom', // Set the class to add to the item
  header: customHeader, // Set the header renderer
  content: [ description, things ] // Set the content to display (and the order)
})

// Create the @thing item transform
const thingBuilder = item({
  class: 'api-thing',
  header: customHeader,
  content: [ description ]
})

// Define the function that gets the custom langugae
module.exports = function customLanguage () {
  return {
    assets: assets,
    name: languageName,
    // Export the transforms we want to render with
    transforms: {
      custom: customBuilder,
      thing: thingBuilder
    },
    // Export the transforms for the changelog headers
    changelogHeaderTransforms: {
      custom: customHeader,
      thing: customHeader
    }
  }
}
