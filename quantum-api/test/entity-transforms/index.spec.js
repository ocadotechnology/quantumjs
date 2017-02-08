describe('entity-transforms', () => {
  require('./api.spec')
  require('./changelog-list.spec')
  require('./changelog.spec')

  describe('builders', () => {
    require('./builders/body.spec')
    require('./builders/header.spec')
    // require('./builders/item-group.spec')
    // require('./builders/item.spec')
    // require('./builders/notice.spec')
  })

  describe('components', () => {
    require('./components/collapsible.spec')
    require('./components/header.spec')
    require('./components/type.spec')
  })
})
