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

function changelogHeader (changelogHeaders) {
  const entityTypes = Object.keys(changelogHeaders)
  return (selection, transformer) => {
    // Check if the selection has one of the changelog types
    if (entityTypes.some(entityType => selection.has(entityType))) {
      let current = selection
      const sections = []

      // Move down the tree of entries to the bottom, adding each level as a 'section'
      while (entityTypes.some(entityType => current.has(entityType))) {
        current = current.select(entityTypes)
        const type = current.type()
        const baseType = type.replace('?', '')

        const section = dom.create('span')
          .class(`qm-changelog-custom-${baseType}`)
          // Render the header using the 'api' entity transform
          .add(changelogHeaders[type](current, transformer))

        sections.push(section)
      }
      return dom.create('span')
        .class('qm-changelog-custom-header')
        // Add all the built sections for the tree to the changelog header
        .add(sections)
    }
  }
}

// Define the function that gets the custom langugae
module.exports = function customLanguage () {
  const changelogHeaders = {
    custom: customHeader
  }

  return {
    assets: assets,
    name: languageName,
    // Export the transforms we want to render with
    transforms: {
      custom: customBuilder,
      thing: thingBuilder
    },
    // Export the changelog options
    changelog: {
      // Export the entity types to look for
      entityTypes: Object.keys(changelogHeaders),
      // Export the function for building the changelog header
      createHeaderDom: changelogHeader(changelogHeaders)
    }
  }
}
