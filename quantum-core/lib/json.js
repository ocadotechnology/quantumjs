'use strict'
/*

  Json
  ====

  A Page transform that converts a quantum page to a json page

*/

module.exports = () => {
  return (file) => {
    return file.clone({
      info: file.info.withExtension('.json'),
      content: JSON.stringify(file.content, null, 2)
    })
  }
}
