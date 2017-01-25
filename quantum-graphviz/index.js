const bluebird = require('bluebird')
const childProcess = bluebird.promisifyAll(require('child_process'))
const streamToBuffer = bluebird.promisify(require('stream-to-buffer'))
const dom = require('quantum-dom')

function dot(quantumSelection, transform) {
  const typeArg = '-Tsvg'
  const mimeType = 'image/svg+xml'
  const content = quantumSelection.cs()
  return new Promise((resolve, reject) => {
    const graphViz = childProcess.spawn('dot', [typeArg])
    graphViz.stdin.end(content)
    graphViz.on('exit', (code) => handleExit(graphViz, code, mimeType).then(resolve).catch(reject))
  })
}

function handleExit(graphViz, code, mimeType) {
  if (code) {
    streamToBuffer(graphViz.stderr).then((buffer) => {
      Promise.reject(new Error(buffer.toString()))
    })
  } else {
    streamToBuffer(graphViz.stdout).then((buffer) => {
      const readable = buffer.toString('base64')
      const url = `data:${mimeType};base64,${readable}`
      return dom.create('img').attr('src', url)
    })
  }
}

module.exports.transforms = (options) => Object.freeze({ dot })
