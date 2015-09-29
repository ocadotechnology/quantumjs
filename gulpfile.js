var gulp        = require('gulp')
var browserSync = require('browser-sync').create()

var hexagon        = require('hexagon-js')
var quantum        = require('quantum-core')
var html           = require('quantum-html')
var template       = require('quantum-template')
var api            = require('quantum-api')
var version        = require('quantum-version')

var copySource = [
  'resources/**/*',
  'node_modules/font-awesome/css/**/*',
  '!node_modules/font-awesome/less/**/*',
  '!node_modules/font-awesome/scss/**/*',
  '!node_modules/font-awesome/*'
]

function requireUncached(module){
  delete require.cache[require.resolve(module)]
  return require(module)
}

function build() {
  var templateVars = {
    version: require('./package.json').version
  }

  var apiOptions = {}
  var hexagonOptions = {}
  var hexagonDocsOptions = {}

  var htmlTransforms = {
    html: html.transforms,
    qm: requireUncached('./transforms/index'),
    sketch: requireUncached('./transforms/sketch'),
    api: requireUncached('quantum-api')(apiOptions)
  }

  return quantum.read('content/pages/**/index.um', { base: 'content/pages' })
    .map(template(templateVars))
    .map(html(htmlTransforms))
    .map(html.stringify())
    .map(quantum.write('target'))
}

function buildHexagon() {
  return hexagon.build().then(hexagon.build.store('target/resources'))
}

gulp.task('build', build)

gulp.task('hexagon', buildHexagon)

gulp.task('copy', function() {
  return gulp.src(copySource).pipe(gulp.dest('target/resources'))
})

gulp.task('server', function() {
  browserSync.init({
    server: {
      baseDir: "./target"
    }
  })
})

gulp.task('watch', function(){
  gulp.watch(['content/**/*', 'resources/**/*', 'transforms/**/*']).on('change', function(){
    build().then(browserSync.reload)
  })
  gulp.watch(copySource, ['copy'])
})

gulp.task('default', ['copy', 'build', 'watch', 'server'])