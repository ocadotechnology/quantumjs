var topSection = hx.select('.qm-docs-top-section')
var sidebar = hx.select('.qm-docs-sidebar')
var bottomSection = hx.select('.qm-docs-bottom-section')

function checkSidebarPosition () {
  var sidebarHeight = sidebar.height()

  if (!topSection.empty()) {
    var headerBottom = topSection.box().bottom
    sidebar.classed('qm-docs-sidebar-at-top', headerBottom > 46)
  }

  if (!bottomSection.empty()) {
    var footerTop = bottomSection.box().top
    sidebar.classed('qm-docs-sidebar-at-bottom', sidebarHeight + 46 > footerTop)
  }
}

hx.select(window).on('scroll', checkSidebarPosition)

checkSidebarPosition()
