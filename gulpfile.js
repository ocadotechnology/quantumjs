var gulp       = require('gulp')
var quantum  = require('quantum')
var html       = require('quantum-html')
var transforms = require('./transforms')
var browserSync = require('browser-sync').create()
var template    = require('quantum-template')

var copySource = [
  'src/quantum.svg'
]

function requireUncached(module){
  delete require.cache[require.resolve(module)]
  return require(module)
}

function build() {
  var templateVars = {
    version: require('./package.json').version
  }

  var htmlTransforms = {
    html: html.transforms,
    qm: requireUncached('./transforms/index'),
    sketch: requireUncached('./transforms/sketch'),
    entity: require('./transforms/entity-api')
  }

  return quantum.read('src/index.um', { base: 'src' })
    .map(template(templateVars))
    .map(html(htmlTransforms))
    .map(html.stringify())
    .map(quantum.write('target'))
}

gulp.task('build', build)

gulp.task('copy', function() {
  return gulp.src(copySource).pipe(gulp.dest('target'))
})

gulp.task('server', function() {
  browserSync.init({
    server: {
      baseDir: "./target"
    }
  })
})

gulp.task('watch', function(){
  gulp.watch('src/**/*').on('change', function(){
    build().then(browserSync.reload)
  })
  gulp.watch(copySource, ['copy'])
})

gulp.task('default', ['copy', 'build', 'watch', 'server'])