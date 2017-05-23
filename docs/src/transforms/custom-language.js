const dom = require('quantum-dom')
const path = require('path')
const api = require('quantum-api')

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
const things = api.builders.itemGroup(languageName, 'thing', 'Things')

function customDetails (selection, transformer) {
  // render the param string as the header details (e.g. for '@thing something' it would be 'something')
  return dom.create('div').text(selection.ps())
}
// Create the transform for the item header
const customHeader = api.builders.header('custom', customDetails)

// Create the @custom item transform
const customBuilder = api.builders.item({
  class: 'api-custom', // Set the class to add to the item
  header: customHeader, // Set the header renderer
  content: [ api.builders.body.description, things ] // Set the content to display (and the order)
})

// Create the @thing item transform
const thingBuilder = api.builders.item({
  class: 'api-thing',
  header: customHeader,
  content: [ api.builders.body.description ]
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
    // Export the entityTransforms we want to render with
    entityTransforms: {
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
