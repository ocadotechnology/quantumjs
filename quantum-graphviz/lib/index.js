const Promise = require('bluebird')
const childProcess = Promise.promisifyAll(require('child_process'))
const streamToBuffer = Promise.promisify(require('stream-to-buffer'))
const dom = require('quantum-dom')

function gv(quantumSelection, transform) {
  const typeArg = '-Tsvg'
  const mimeType = 'image/svg+xml'
  const content = quantumSelection.cs()
  return new Promise((resolve, reject) => {
    const graphViz = childProcess.spawn('dot', [typeArg])
    graphViz.stdin.end(content)
    graphViz.on('error', reject)
    graphViz.on('exit', (code) => handleExit(graphViz, code, mimeType).then(resolve).catch(reject))
  })
}

function handleExit(graphViz, code, mimeType) {
  if (code) {
    return streamToBuffer(graphViz.stderr).then((buffer) => Promise.reject(new Error(buffer.toString())))
  } else {
    return streamToBuffer(graphViz.stdout).then((buffer) => dom.create('div').add(buffer.toString()))
  }
}

module.exports.transforms = (options) => Object.freeze({ gv })
