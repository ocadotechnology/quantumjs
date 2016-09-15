'use strict'
/*

  Json
  ====

  A Page transform that converts a quantum page to a json page

*/

module.exports = () => {
  return (page) => {
    return page.clone({
      file: page.file.withExtension('.json'),
      content: JSON.stringify(page.content, null, 2)
    })
  }
}
