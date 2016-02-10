What is a storage engine?
=========================

It is the minimum set of things that have to be implemented to be able
to store the data that this app needs to store. The storage engine acts
as an interface into any chosen storage solution - like leveldb, cassandra
etc.

A storage engine simply has to export a function that returns an object with these methods:

**All of these methods should return a promise**

    module.exports = function () {
      return {
        /* write a blob to storage */
        putBlobStream: function (kind, id, stream) {}
        /* read a blob from storage and dump it on the local disk */
        blobToDisk: function (kind, id, filename) {}
        /* put something to storage */
        putBlob: function (kind, id, data) {}
        /* get something from storage */
        getBlob: function (kind, id) {}
        /* deletes a blob from storage */
        deleteBlob: function (kind, id) {}
        /* put something to storage */
        put: function (kind, id, data) {}
        /* get something from storage */
        get: function (kind, id) {}
        /* delete something from storage */
        delete: function (kind, id) {}
        /* get all of a kind from storage as {key, value} objects */
        getAll: function (kind) {}
      }
    }
