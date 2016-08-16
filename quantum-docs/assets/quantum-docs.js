var topSection = hx.select('.qm-docs-top-section')
var sidebarLeft = hx.select('.qm-docs-sidebar-left')
var sidebarRight = hx.select('.qm-docs-sidebar-right')
var bottomSection = hx.select('.qm-docs-bottom-section')
var footerSection = hx.select('.qm-docs-bottom-section')

function checkSidebarPositions () {
  if (!topSection.empty()) {
    var headerBottom = topSection.box().bottom
    sidebarLeft.classed('qm-docs-sidebar-at-top', headerBottom > 46)
    sidebarRight.classed('qm-docs-sidebar-at-top', headerBottom > 46)
  }

  var topSectionBottom = Math.max(46, topSection.box().bottom)
  var footerTop = bottomSection.empty() ? window.innerHeight : Math.min(window.innerHeight, bottomSection.box().top)

  sidebarLeft.style('max-height', (footerTop - topSectionBottom) + 'px')
  sidebarLeft.style('max-height', (footerTop - topSectionBottom) + 'px')
}

hx.select(window)
  .on('scroll', checkSidebarPositions)
  // .on('resize', checkSidebarPositions) //XXX: bug in hexagon - should ise the browser resize handler for window, not special hacky resize handler code

sidebarLeft.classed('qm-docs-sidebar-at-top', true)
sidebarRight.classed('qm-docs-sidebar-at-top', true)
checkSidebarPositions()
