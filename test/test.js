var watch = require('..')

watch('**/*.um', {base: 'whatever'}, function(objs) {
  console.log(objs)
})