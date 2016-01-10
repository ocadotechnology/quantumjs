var quantum = require('quantum-js')
var html = require('quantum-html')
var changelog = require('quantum-changelog')

var changelogOptions = {

}

var htmlTransforms = {
  html: html.transforms,
  changelog: changelog(changelogOptions).transforms
}

quantum.read('index.um')
  .map(changelog(changelogOptions))
  .map(html(htmlTransforms))
  .map(html.stringify())
  .map(quantum.write('target'))
