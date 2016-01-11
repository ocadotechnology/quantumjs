/*
     ____                    __                      _
    / __ \__  ______ _____  / /___  ______ ___      (_)____
   / / / / / / / __ `/ __ \/ __/ / / / __ `__ \    / / ___/
  / /_/ / /_/ / /_/ / / / / /_/ /_/ / / / / / /   / (__  )
  \___\_\__,_/\__,_/_/ /_/\__/\__,_/_/ /_/ /_(_)_/ /____/
                                              /___/

  Build Logger
  ============

  This module creates objects that collect the log output from a build.

*/

function BuildLogger (buildId) {
  this.buildId = buildId
  this.log = []
}

BuildLogger.prototype = {
  info: function (obj) {
    console.info(this.buildId, obj)
    this.log.push({type: 'info', message: obj})
  },
  warn: function (obj) {
    console.warn(this.buildId, obj)
    this.log.push({type: 'warn', message: obj})
  },
  error: function (obj) {
    console.error(this.buildId, obj)
    this.log.push({type: 'error', message: obj})
  },
  import: function (logJson) {
    this.log = this.log.concat(JSON.parse(logJson))
  },
  export: function () {
    return JSON.stringify(this.log)
  },
  toJson: function () {
    return JSON.stringify({
      buildId: this.buildId,
      log: this.log
    })
  }
}

module.exports = BuildLogger
