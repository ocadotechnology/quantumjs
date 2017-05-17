function redirectorFunction (url, current, version) {
  if (url.indexOf((current + '/'), url.length - (current + '/').length) !== -1) {
    return '../' + version + '/'
  } else {
    return version + '/'
  }
}

function createOption (version, current) {
  const option = document.createElement('option')
  option.value = redirectorFunction(window.location.pathname, current, version)
  option.innerHTML = version
  return option
}

function goToVersion (event) {
  const url = event.target.value
  if (url) {
    window.location = url
  }
  return false
}

function getCurrentVersion (url, current, versions) {
  const pathSplit = url.split('/').filter(x => x)
  const pathVersion = pathSplit[pathSplit.length - 1]
  return versions.indexOf(pathVersion) !== -1 ? pathVersion : current || versions[versions.length - 1]
}

function createDropdown (id, versions, current) {
  const url = window.location.pathname
  const currentVersion = getCurrentVersion(url, current, versions)
  const node = document.getElementById(id)
  versions.forEach(v => node.appendChild(createOption(v, currentVersion)))
  node.value = redirectorFunction(window.location.pathname, currentVersion, currentVersion)
  node.addEventListener('change', goToVersion)
}

window.quantum = window.quantum || {}
window.quantum.docs = {
  createDropdown: createDropdown
}
