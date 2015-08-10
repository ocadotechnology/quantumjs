var Promise = require('bluebird')

function isTypeEntity(entity) {
  return entity.type === 'entity'
}

// defines the @entity entity renderer for documenting entity renderers (which means... this could be
// used to document itself)
exports.entity = function(entity, page, transform) {

  var headerElement = page.create('div').class('qm-entity-header')
    .add(page.create('span').class('qm-entity-type').text('@' + entity.ps()))

  var params = entity.select('params').ps()
  if (params) {
    headerElement.add(page.create('span').class('qm-entity-params').text(params))
  }

  var content = entity.select('params').cs()
  if(content) {
    headerElement
      .add(page.create('span').text(':'))
      .add(page.create('span').class('qm-entity-content').text(content))
  }

  var headerPromise = headerElement
    .add(page.create('span').class('qm-entity-description').add(entity.select('description').transform(transform)))

  var subentitiesPromise = page.create('div')
    .class('qm-entity-subentites')
    .add(entity.filter(isTypeEntity).transform(transform))

  return Promise.all([headerPromise, subentitiesPromise])
    .spread(function(header, subentities){
      return page.create('div')
        .class('qm-entity')
        .add(header)
        .add(subentities)
    })
}