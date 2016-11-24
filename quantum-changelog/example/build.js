const fs = require('fs')
const quantum = require('quantum-js')
const html = require('quantum-html')
const changelog = require('..')

const htmlOptions = {
  transforms: {
    html: html.transforms(),
    changelog: changelog.transforms({
      issueUrl: '/issue/'
    })
  }
}

quantum.read.page('index.um')
  // .then(changelog(changelogOptions))
  .then(html(htmlOptions))
  .then(html.stringify())
  .then((page) => {
    fs.writeFileSync(page.file.dest, page.content)
  })
