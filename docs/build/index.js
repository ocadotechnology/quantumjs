var path = require('path')
var liveServer = require('live-server')
var Progress = require('progress')
var chalk = require('chalk')
var flatten = require('flatten')

var Promise = require('bluebird')
var fs = Promise.promisifyAll(require('fs-extra'))
var glob = Promise.promisify(require('glob'))

var hexagon = require('hexagon-js')
var quantum = require('quantum-js')
var api = require('quantum-api')
var changelog = require('quantum-changelog')
var html = require('quantum-html')
var template = require('quantum-template')
var version = require('quantum-version')
var watch = require('quantum-watch')

function requireUncached (module) {
  delete require.cache[require.resolve(module)]
  return require(module)
}

function getOptions (dev) {
  var apiOptions = {
    typeLinks: {
      'Array': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array',
      'Boolean': 'https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean',
      'Date': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date',
      'Element': 'https://developer.mozilla.org/en/docs/Web/API/Element',
      'Function': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function',
      'HTMLElement': 'https://developer.mozilla.org/en/docs/Web/API/HTMLElement',
      'Node': 'https://developer.mozilla.org/en/docs/Web/API/Node',
      'Number': 'https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number',
      'Object': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object',
      'String': 'https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String',
      'SVGElement': 'https://developer.mozilla.org/en/docs/Web/API/SVGElement',
      'Builder': '/core/',
      'Selection': '/core/'
    }
  }

  var buildTags = {
    added: {
      order: 8
    },
    updated: {
      order: 7
    },
    deprecated: {
      order: 5
    },
    removed: {
      order: 4
    },
    enhancement: {
      keyText: 'Enhancement',
      iconClass: 'fa fa-fw fa-magic',
      order: 6,
      retain: false,
      removeEntity: false
    },
    bugfix: {
      keyText: 'Bug Fix',
      iconClass: 'fa fa-fw fa-bug',
      order: 3,
      retain: false,
      removeEntity: false
    },
    docs: {
      keyText: 'Documentation',
      iconClass: 'fa fa-fw fa-book',
      order: 2,
      retain: false,
      removeEntity: false
    },
    info: {
      keyText: 'Information',
      iconClass: 'fa fa-fw fa-info',
      order: 1,
      retain: false,
      removeEntity: false
    }
  }

  var changelogOptions = {
    tags: buildTags
  }

  var htmlTransforms = {
    html: html.transforms,
    qm: requireUncached('../transforms/index'),
    sketch: requireUncached('../transforms/sketch'),
    api: requireUncached('quantum-api')(apiOptions),
    changelog: changelog(changelogOptions).transforms
  }

  return Promise.props({
    changelogOptions: changelogOptions,
    htmlTransforms: htmlTransforms
  })
}

function progressSequence (desc, completeStyle, list, func) {
  var bar = new Progress(desc + ' :current/:total [:bar] :percent :etas', { total: list.length, width: 50, complete: completeStyle})
  bar.tick(0)
  return Promise.all(list)
    .map(function (f) {
      return func(f)
        .then(function (res) {
          bar.tick()
          return res
        })
    }, {concurrency: 5})
}

function getTemplateVariables () {
  return Promise.props({
    version: require('../package.json').version,
    examples: {
      exampleList: [1, 2, 3],
      exampleObject: {name: 'Bob', age: 25},
    },
    example: {
      property1: [1, 2, 3],
      property2: 4
    }
  })
}

function buildPages (objs) {
  var start = Date.now()
  return Promise.all([getTemplateVariables(), getOptions()]).spread(function (templateVariables, options) {
    return progressSequence('Building pages', chalk.green('='), objs, function (obj) {
      return Promise.resolve(obj)
        .then(template({variables: templateVariables}))
        .then(changelog(options.changelogOptions))
        .then(function (res) { return Array.isArray(res) ? res : [res] })
        .then(flatten)
        .map(html(options.htmlTransforms))
        .map(html.stringify())
        .map(quantum.write('target'))
    })
  }).then(function (res) {
    var diff = (Date.now() - start)
    var mins = (diff - diff % 60000) / 60000
    var sec = (diff - (diff - diff % 60000)) / 1000
    console.log(chalk.blue('Done!', mins + 'm', sec + 's'))
    return res
  })
}

function watchPages () {
  return watch('content/pages/**/index.um', { base: 'content/pages'}, buildPages).then(function (fun) {
    return fun()
  })
}

function buildHexagon () {
  var favicons = require('./favicon.js')
  return hexagon.light
    .assets(favicons(path.join(__dirname, '../content/assets/favicons')))
    .build({embedAssets: true, dest: 'target/resources'})
}

function startServer () {
  liveServer.start({
    port: 3000,
    root: 'target',
    wait: 50,
    open: false
  })
}

function copyResources () {
  return Promise.all([
    fs.copyAsync('node_modules/font-awesome/css/', 'target/resources/font-awesome/css/'),
    fs.copyAsync('node_modules/font-awesome/fonts/', 'target/resources/font-awesome/fonts/'),
    fs.copyAsync('content/resources/', 'target/resources/'),
  ])
}

function copyServer () {
  return fs.copyAsync('server/', 'target/')
}

if (process.argv[2] === 'build-hexagon') {
  buildHexagon()
} else if (process.argv[2] === 'build-release') {
  buildHexagon()
    .then(copyResources)
    .then(function () {
      return quantum.read('content/pages/**/index.um')
        .then(buildPages)
    })
    .then(copyServer)
} else {
  buildHexagon()
    .then(copyResources)
    .then(watchPages)
    .then(startServer)
}
