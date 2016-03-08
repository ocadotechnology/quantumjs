var topSection = hx.select('.qm-docs-top-section')
var sidebarLeft = hx.select('.qm-docs-sidebar-left')
var sidebarRight = hx.select('.qm-docs-sidebar-right')
var bottomSection = hx.select('.qm-docs-bottom-section')

function checkSidebarPositions () {
  var sidebarLeftHeight = sidebarLeft.height()
  var sidebarRightHeight = sidebarRight.height()

  if (!topSection.empty()) {
    var headerBottom = topSection.box().bottom
    sidebarLeft.classed('qm-docs-sidebar-at-top', headerBottom > 46)
    sidebarRight.classed('qm-docs-sidebar-at-top', headerBottom > 46)
  }

  if (!bottomSection.empty()) {
    var footerTop = bottomSection.box().top
    sidebarLeft.classed('qm-docs-sidebar-at-bottom', sidebarLeftHeight + 46 > footerTop)
    sidebarRight.classed('qm-docs-sidebar-at-bottom', sidebarRightHeight + 46 > footerTop)
  }
}

hx.select(window).on('scroll', checkSidebarPositions)

checkSidebarPositions()
