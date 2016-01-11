/*
     ____                    __                      _
    / __ \__  ______ _____  / /___  ______ ___      (_)____
   / / / / / / / __ `/ __ \/ __/ / / / __ `__ \    / / ___/
  / /_/ / /_/ / /_/ / / / / /_/ /_/ / / / / / /   / (__  )
  \___\_\__,_/\__,_/_/ /_/\__/\__,_/_/ /_/ /_(_)_/ /____/
                                              /___/

  Server
  ======

  The entry point for the server. Handles corrent initialisation
  for the cluster.

*/

var cluster = require('cluster')
var Master = require('./master')
var Worker = require('./worker')

exports.start = function (options) {
  if (cluster.isMaster) {
    new Master(options)
  } else {
    new Worker(options)
  }
}
