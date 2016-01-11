exports.header = function (entity, page, transform) {
  return page.create('div').class('qm-header')
    .add(page.create('div').class('qm-header-section')
      .add(page.create('span').class('qm-header-title').text(entity.select('title').ps()))
      .add(page.create('span').class('qm-header-nav').add(entity.select('nav').transform(transform)))
  )
}

exports.section = function (entity, page, transform) {
  return page.create('div').class('qm-section').add(entity.transform(transform))
}

exports.topicsection = function (entity, page, transform) {
  return page.create('div').class('qm-topic-section')
    .add(page.create('h3').text(entity.ps()).attr('id', entity.ps().toLowerCase().split(' ').join('-')))
    .add(page.create('div').class('qm-topic-section-content')
      .add(entity.transform(transform)))
}

exports.content = function (entity, page, transform) {
  return page.create('div').class('qm-content').add(entity.transform(transform))
}

exports.footer = function (entity, page, transform) {
  return page.create('div').class('qm-footer').add(entity.transform(transform))
}

exports.infobox = function (entity, page, transform) {
  return page.create('div').class('qm-infobox').add(entity.transform(transform))
}

exports.divider = function (entity, page, transform) {
  return page.create('div').class('qm-divider')
}
