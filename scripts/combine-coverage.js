const istanbul = require('istanbul')

const collector = new istanbul.Collector()
const reporter = new istanbul.Reporter()

process.argv.slice(2).map(require).forEach(x => collector.add(x))

reporter.addAll(['text', 'lcov', 'html'])
reporter.write(collector, false, () => {})
