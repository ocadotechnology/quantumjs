module.exports = function (storage, interval) {
  function refresh () {
    // this function makes sure that up to date data is in the cache
    console.log('refreshing active builds and project list')

    storage
      .getProjects({skipCache: true})
      .then(function (projects) {
        console.log('refreshed projects list')
      })

    storage
      .getLatestRevisions({skipCache: true})
      .then(function (projects) {
        console.log('refreshed projects list')
      })

    storage
      .getActiveBuilds({skipCache: true})
      .then(function (activeBuilds) {
        activeBuilds.forEach(function (activeBuild) {
          storage.getActiveBuild(activeBuild.projectId, {skipCache: true})
            .then(function (res) {
              console.log('refreshed', res)
            })
        })
      })

    setTimeout(refresh, interval)
  }

  refresh()

}
