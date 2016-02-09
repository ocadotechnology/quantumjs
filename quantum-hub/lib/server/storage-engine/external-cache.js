/*
     ____                    __                      _
    / __ \__  ______ _____  / /___  ______ ___      (_)____
   / / / / / / / __ `/ __ \/ __/ / / / __ `__ \    / / ___/
  / /_/ / /_/ / /_/ / / / / /_/ /_/ / / / / / /   / (__  )
  \___\_\__,_/\__,_/_/ /_/\__/\__,_/_/ /_/ /_(_)_/ /____/
                                              /___/

  External Cache Storage Engine
  =============================

  Uses a remote external cache as a storage engine - this does all the
  http calls needed to talk to the external cache

*/

var merge = require('merge')
var cluster = require('cluster')
var Promise = require('bluebird')
var request = require('request-promise')
var fs = require('fs-extra')

module.exports = function (opts) {
  if (!cluster.isMaster) return

  var options = merge({
    host: '0.0.0.0',
    port: 3040
  }, opts)

  function makeUrl(type, kind, id) {
    if (id) {
      return 'http://' + options.host + ':' + options.port + '/' + type + '/' + encodeURIComponent(kind) + '/' + encodeURIComponent(id)
    } else {
      return 'http://' + options.host + ':' + options.port + '/' + type + '/' + encodeURIComponent(kind)
    }
  }

  return {
    /* write a blob to storage */
    putBlobStream: function (kind, id, stream) {
      return new Promise(function (req, res) {
        var outStream = request.put({
            url: makeUrl('blob', kind, id),
            method: 'PUT'
        })
        stream.pipe(outStream)
        outStream.on('end', function () {
          resolve()
        })
        outStream.on('error', function (err) {
          reject(err)
        })
      })
    },
    /* read a blob from storage and dump it on the local disk */
    blobToDisk: function (kind, id, filename) {
      return new Promise(function (req, res) {
        var outStream = fs.createOutputStream(filename)
        request({
            url: makeUrl('blob', kind, id),
            method: 'GET'
        }).pipe(outStream)
        outStream.on('end', function () {
          resolve()
        })
        outStream.on('error', function (err) {
          reject(err)
        })
      })
    },
    /* put something to storage */
    putBlob: function (kind, id, data) {
      return request({
        url: makeUrl('blob', kind, id),
        method: 'PUT',
        body: data
      })
    },
    /* get something to storage */
    getBlob: function (kind, id) {
      return request({
        url: makeUrl('blob', kind, id),
        method: 'GET'
      }).then(function(res){
        return res === "" ? undefined : res
      })
    },
    /* deletes a blob */
    deleteBlob: function (kind, id) {
      return request({
        url: makeUrl('blob', kind, id),
        method: 'DELETE',
        json: true
      })
    },

    /* put something to storage */
    put: function (kind, id, data) {
      return request({
        url: makeUrl('entity', kind, id),
        method: 'PUT',
        json: data
      })
    },
    /* get something to storage */
    get: function (kind, id) {
      return request({
        url: makeUrl('entity', kind, id),
        method: 'GET',
        json: true
      })
    },
    /* delete something from storage */
    delete: function (kind, id) {
      return request({
        url: makeUrl('entity', kind, id),
        method: 'DELETE',
        json: true
      })
    },
    /* get all of a kind from storage */
    getAll: function (kind) {
      return request({
        url: makeUrl('entity', kind),
        method: 'GET',
        json: true
      })
    }

  }
}
