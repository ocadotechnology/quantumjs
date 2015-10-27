var select       = require('quantum-js').select
var dom          = require('quantum-dom')
var html         = require('quantum-html')
var Promise      = require('bluebird')

/* Example:

  @changelog
    @process
      @inline

    @version 0.1.0
      @link:
      @description:

  @changelog 0.1.0
    @item Item Name
      @link(url)[Item Link]

      @description: Item description
      @extra
        @api
          @prototype thing
            @description: A thing


      @added [Added thing]
        @description: Added thing description
        @issue 500
        @extra
          @api
            @prototype thing
              @description: A thing

      @deprecated [Deprecated thing]
        @description: Deprecated thing description
        @alternative: Deprecated thing alternative thing

    @item Item Name
      @link(url)[Item Link 1]
      @link(url)[Item Link 2]

      @extra: Extra suff for item

      @added [Added thing]:
        @description: Added thing description
        @issue 500
        @issue 501
        @issue 502
        @issue 503
        @extra: Extra stuff for Added thing

      @deprecated [Deprecated thing]
        @description: Deprecated thing description
        @alternative: Deprecated thing alternative thing

      @removed [Removed thing]
        @description: This thing was removed
*/

module.exports = function (options) {

  function alternative (entity, page, transforms) {
    return page.create('div').class('qm-changelog-alternative')
      .add(page.create('div').class('qm-changelog-alternative-head').text('Alternative'))
      .add(page.create('div').class('qm-changelog-alternative-body')
        .add(entity.transform(transforms)))
  }

  function issue (entity, page, transforms) {
    return page.create('a')
      .attr('href', options.issueUrl + entity.ps())
      .text('#' + entity.ps())
  }


  function entry (entity, page, transforms) {
    var type = options.tags[entity.type]
    var icon = page.create('i').class('fa ' + type.icon + ' ' + type.class.replace('hx-', 'hx-text-'))

    if (!!options.issueUrl && entity.has('issue')) {
      var heading = page.create('span')
      entity.selectAll('issue').forEach( function (issueEntity, index) {
        heading = heading
          .add(index > 0 ? ', ' : entity.ps() + ': ')
          .add(issue(issueEntity, page, transforms))
      })
    } else {
      var heading = entity.ps()
    }

    if (entity.has('description')) {
      var description = page.create('div').class('qm-changelog-entry-description').add(entity.select('description').transform(transforms))
    }

    if (entity.has('alternative')) {
      var alternativeMessage = alternative(entity.select('alternative'), page, transforms)
    }

    if (entity.has('extra')) {
      var extra = page.create('div').class('qm-changelog-extra').add(entity.select('extra').transform(transforms))
    }

    return page.create('div').class('qm-changelog-entry hx-group hx-horizontal')
      .add(page.create('div').class('qm-changelog-entry-icon hx-section hx-fixed')
        .add(icon))
      .add(page.create('div').class('hx-section')
        .add(page.create('div').class('qm-changelog-entry-head')
          .add(heading))
        .add(page.create('div').class('qm-changelog-entry-content')
          .add(description)
          .add(alternativeMessage)
          .add(extra)))
  }


  function label (page, type, count) {
    return page.create('div').class('qm-changelog-label hx-label ' + type.class)
        .add(page.create('i').class('fa ' + type.icon))
        .add(page.create('span').text(count));
  }


  function link (entity, page, transforms) {
    return page.create('a').class('qm-changelog-item-link hx-btn hx-info')
      .attr('href', entity.ps())
      .add(entity.transform(transforms))
  }


  function item (entity, page, transforms) {


    var id = page.nextId()
    var tags = Object.keys(options.tags)

    var unprocessedEntries = entity.selectAll(tags).sort( function (a, b) {
      return options.tags[a.type].order - options.tags[b.type].order
    })

    var entries = page.create('div').class('qm-changelog-entries')
      .add(Promise.all( unprocessedEntries.map( function (entryEntity) {
        return entry(select(entryEntity), page, transforms)
      }))
    )

    var labels = page.create('div').class('qm-changelog-item-labels hx-section hx-no-margin')
    for (var key in options.tags) {
      var count = unprocessedEntries.reduce(function(total, e){ return e.type == key ? total + 1 : total }, 0);
      if (count > 0) {
        labels = labels.add(label(page, options.tags[key], count))
      }
    }

    if (entity.has('link')) {
      var links = Promise.all(entity.selectAll('link').map( function (linkEntity) {
          return link(select(linkEntity), page, transforms);
      }))
    }

    if (entity.has('description')) {
      var description = page.create('div').class('qm-changelog-description').add(entity.select('description').transform(transforms))
    }

    if (entity.has('extra')) {
      var extra = page.create('div').class('qm-changelog-extra').add(entity.select('extra').transform(transforms))
    }

    return page.create('div').class('qm-changelog-item hx-collapsible')
      .add(page.create('div').class('qm-changelog-item-head hx-collapsible-heading hx-collapsible-heading-no-hover hx-input-group hx-input-group-full-width')
        .add(page.create('button').class('hx-collapsible-toggle hx-btn hx-info'))
        .add(page.create('div').class('qm-changelog-item-title hx-section hx-no-margin')
          .text(entity.ps()))
        .add(labels)
        .add(links))
      .add(page.create('div').class('qm-changelog-item-body hx-collapsible-content')
        .add(description)
        .add(entries)
        .add(extra))
  }


  function changelog(entity, page, transforms) {
    var items = Promise.all(entity.selectAll('item').map( function (itemEntity) {
      return item(itemEntity, page, transforms);
    }))

    return page.addAssets({
        css: {
        'changelog.css': __dirname + '/client/changelog.css'
        },
        js: {
        'changelog.js': __dirname + '/client/changelog.js'
        }
      })
      .then(function() {
        return page.create('div').class('qm-changelog')
          .add(page.create('div').class('qm-changelog-header').text(entity.ps()))
          .add(page.create('div').class('qm-changelog-body')
            .add(items)
          )
      })
  }

  function wrapper(entity, page, transforms) {
    return page.create('div').class('qm-changelog-wrapper').add(entity.transform(transforms))
  }

  return {
    'changelog': changelog,
    'wrapper': wrapper,
    'entry': entry
  }
}