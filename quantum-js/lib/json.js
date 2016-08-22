'use-strict'
/*

     ____                    __                      _
    / __ \__  ______ _____  / /___  ______ ___      (_)____
   / / / / / / / __ `/ __ \/ __/ / / / __ `__ \    / / ___/
  / /_/ / /_/ / /_/ / / / / /_/ /_/ / / / / / /   / (__  )
  \___\_\__,_/\__,_/_/ /_/\__/\__,_/_/ /_/ /_(_)_/ /____/
                                              /___/

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
