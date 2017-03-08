function redirectorFunction (url, current, version) {
  if (url.indexOf((current + '/'), url.length - (current + '/').length) !== -1) {
    return '../' + version + '/'
  } else {
    return version + '/'
  }
}

function createDropdown (id, versions, current) {
  new hx.Menu('#' + id, {
    items: JSON.stringify(versions),
    renderer: function (e, v) {
      hx.select(e)
        .append('a')
        .attr('href', redirectorFunction(window.location.pathname, current, v))
        .text(v)
    }
  })
}

window.quantum = window.quantum || {}
window.quantum.docs = {
  createDropdown: createDropdown
}
