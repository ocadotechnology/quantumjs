var topSection = hx.select('.qm-docs-top-section')
var sidebarLeft = hx.select('.qm-docs-sidebar-left')
var sidebarRight = hx.select('.qm-docs-sidebar-right')
var bottomSection = hx.select('.qm-docs-bottom-section')
var footerSection = hx.select('.qm-docs-bottom-section')

// XXX: remove reliance on hexagon

// function checkSidebarPositions () {
//   var topClientRect = topSection.box()
//   var bottomClientRect = bottomSection.box()
//
//   if (!topSection.empty()) {
//     var headerBottom = topClientRect.bottom
//     sidebarLeft.classed('qm-docs-sidebar-at-top', headerBottom > 46)
//     sidebarRight.classed('qm-docs-sidebar-at-top', headerBottom > 46)
//   }
//
//   var topSectionBottom = Math.max(46, topClientRect.bottom)
//   var footerTop = bottomSection.empty() ? window.innerHeight : Math.min(window.innerHeight, bottomClientRect.top)
//
//   sidebarLeft.style('max-height', (footerTop - topSectionBottom) + 'px')
//   sidebarLeft.style('max-height', (footerTop - topSectionBottom) + 'px')
// }
//
// window.addEventListener('scroll', checkSidebarPositions)
// window.addEventListener('resize', checkSidebarPositions)
//
// sidebarLeft.classed('qm-docs-sidebar-at-top', true)
// sidebarRight.classed('qm-docs-sidebar-at-top', true)
// checkSidebarPositions()

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

window.quantum = {
  docs: {
    createDropdown: createDropdown
  }
}
