const quantum = require('quantum-js')
const html = require('quantum-html')
const changelog = require('quantum-changelog')

const changelogOptions = {

}

const htmlTransforms = {
  html: html.transforms,
  changelog: changelog(changelogOptions).transforms
}

quantum.read('index.um')
  .map(changelog(changelogOptions))
  .map(html(htmlTransforms))
  .map(html.stringify())
  .map(quantum.write('target'))
