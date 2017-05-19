function redirectorFunction (url, current, version) {
  if (url.indexOf((current + '/'), url.length - (current + '/').length) !== -1) {
    return '../' + version + '/'
  } else {
    return version + '/'
  }
}

function createOption (version, current) {
  var option = document.createElement('option')
  option.value = redirectorFunction(window.location.pathname, current, version)
  option.innerHTML = version
  return option
}

function goToVersion (event) {
  var url = event.target.value
  if (url) {
    window.location = url
  }
  return false
}

function getCurrentVersion (url, current, versions) {
  var pathSplit = url.split('/').filter(function (x) { return x })
  var pathVersion = pathSplit[pathSplit.length - 1]
  return versions.indexOf(pathVersion) !== -1 ? pathVersion : current || versions[versions.length - 1]
}

function createDropdown (id, versions, current) {
  var url = window.location.pathname
  var currentVersion = getCurrentVersion(url, current, versions)
  var node = document.getElementById(id)
  versions.forEach(function (v) { return node.appendChild(createOption(v, currentVersion)) })
  node.value = redirectorFunction(window.location.pathname, currentVersion, currentVersion)
  node.addEventListener('change', goToVersion)
}

window.quantum = window.quantum || {}
window.quantum.docs = {
  createDropdown: createDropdown
}
