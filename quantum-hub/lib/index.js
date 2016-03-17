/*
     ____                    __                      _
    / __ \__  ______ _____  / /___  ______ ___      (_)____
   / / / / / / / __ `/ __ \/ __/ / / / __ `__ \    / / ___/
  / /_/ / /_/ / /_/ / / / / /_/ /_/ / / / / / /   / (__  )
  \___\_\__,_/\__,_/_/ /_/\__/\__,_/_/ /_/ /_(_)_/ /____/
                                              /___/

  Hub
  ===

  This file is the entry point for this module - it exposes
  the public api for quantum-hub.

*/

// Storage engines the services can be configured with
exports.layeredStorageEngine = require('./storage-engine/layered')
exports.leveldbStorageEngine = require('./storage-engine/leveldb')
exports.externalCacheStorageEngine = require('./storage-engine/external-cache')
exports.googleStorageEngine = require('./storage-engine/google')

// Expose the services
exports.server = require('./server')
exports.externalCache = require('./external-cache')
