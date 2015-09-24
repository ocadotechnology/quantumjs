 // function setupMenu(node) {
 //    var selection = hx.select(node).classed('docs-menu-container', true)
 //      .append('div').class('hx-content')
 //      .append('div').class('hx-group hx-horizontal')

 //    //XXX: turn this into part of the json request
 //    selection.append('div').class('hx-section hx-fixed')
 //      .append('div').class('hx-margin hx-pad')
 //      .add(hx.detached('h3').text('About'))
 //        .add(hx.detached('a').class('docs-dropdown-link').attr('href', '/getting-started/').text('Installation / Getting Started'))
 //        .add(hx.detached('a').class('docs-dropdown-link').attr('href', '/core-concepts/').text('Core concepts'))
 //        .add(hx.detached('a').class('docs-dropdown-link').attr('href', '/examples/').text('Examples'))
 //      .add(hx.detached('h3').text('Transforms'))
 //        .add(hx.detached('a').class('docs-dropdown-link').attr('href', '/transform/html/').text('HTML'))
 //        .add(hx.detached('a').class('docs-dropdown-link').attr('href', '/transform/template/').text('Template'))
 //        .add(hx.detached('a').class('docs-dropdown-link').attr('href', '/transform/version/').text('Version'))
 //        .add(hx.detached('a').class('docs-dropdown-link').attr('href', '/transform/api/').text('Api'))
 //        .add(hx.detached('a').class('docs-dropdown-link').attr('href', '/transform/hexagon/').text('Version'))
 //      .add(hx.detached('h3').text('Other'))
 //        .add(hx.detached('a').class('docs-dropdown-link').attr('href', '/docs/faq/').text('FAQ'))



function setupMenu(element) {
  hx.select(element).text('Api')
}

new hx.Dropdown('#transforms-menu', setupMenu)

