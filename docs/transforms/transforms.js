exports.sellingPoint = function (entity, page, transform) {
  return page.create('div').class('selling-point')
    .add(page.create('div').class('selling-point-title').text(entity.ps()))
    .add(page.create('div').class('selling-point-text').add(entity.transform(transform)))
}
