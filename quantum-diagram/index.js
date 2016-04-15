var dagre = require('dagre')
var quantum = require('quantum-js')

var fontCharWidth = 9.5
var padding = 12
var textHeight = 35
var labelTextHeight = 24

function path (points, close) {
  return 'M' + points.map(function (d) { return d[0] + ',' + d[1]}).join(',') + (close ? 'z' : '')
}

function diagram (entity, page, transform) {
  function createRect (layout, cls, radius) {
    return page.create('rect')
      .class(cls)
      .attr('x', layout.x - layout.width / 2)
      .attr('y', layout.y - layout.height / 2)
      .attr('width', layout.width)
      .attr('height', layout.height)
      .attr('rx', radius)
  }

  var showDescriptions = !quantum.select(entity).has('hideDescriptions')

  // Create a new directed graph
  var g = new dagre.graphlib.Graph({compound: true})

  var gr = {
    rankdir: 'TB'
  }

  g.setGraph(gr)

  g.setDefaultEdgeLabel(function () { return {} })

  function handleGroup (groupEntity, groupName, parent) {
    if (groupName) g.setNode(groupName, {label: groupName, group: true})
    if (parent) g.setParent(groupName, parent)

    quantum.select(groupEntity).selectAll('item').forEach(function (item, i) {
      var rows = showDescriptions ? item.textContent().content : []

      var maxWidth = item.params[1].length

      rows.forEach(function (row) {
        maxWidth = Math.max(row.length, maxWidth)
      })

      g.setNode(item.params[0], {
        label: item.params[1],
        details: {
          rows: rows
        },
        height: textHeight + rows.length * textHeight,
        width: maxWidth * fontCharWidth + padding * 2
      })

      if (groupName) g.setParent(item.params[0], groupName)

    })

    groupEntity.selectAll('group').forEach(function (group) {
      handleGroup(group, group.ps(), groupName)
    })
  }

  handleGroup(entity)

  var edges = {}

  quantum.select(entity).selectAll('link').forEach(function (link) {
    var labelText = link.cs()
    g.setEdge(link.params[0], link.params[2], {
      label: labelText,
      height: labelText.length > 0 ? labelTextHeight : 0,
      width: labelText.length * fontCharWidth + padding,
      labelpos: 'c'
    })
    edges[link.params[0] + ':' + link.params[2]] = link
  })

  dagre.layout(g)

  var markerEnd = page.create('marker')
    .attr('id', 'arrow-end')
    .attr('orient', 'auto')
    .attr('markerWidth', 4)
    .attr('markerHeight', 4)
    .attr('refX', 4)
    .attr('refY', 2)
    .add(page.create('path')
      .class('qm-diagram-arrow')
      .attr('d', 'M0,0 V4 L4,2 Z'))

  var markerStart = page.create('marker')
    .attr('id', 'arrow-start')
    .attr('orient', 'auto')
    .attr('markerWidth', 4)
    .attr('markerHeight', 4)
    .attr('refX', 0)
    .attr('refY', 2)
    .add(page.create('path')
      .class('qm-diagram-arrow')
      .attr('d', 'M0,2 L4,4 L4,0 Z'))

  var svg = page.create('svg').class('qm-diagram-svg')
    .attr('width', Math.ceil(gr.width))
    .attr('viewBox', '0 0 ' + Math.ceil(gr.width) + ' ' + Math.ceil(gr.height))
    .add(page.create('defs')
      .add(markerEnd)
      .add(markerStart))

  g.nodes().forEach(function (v) {
    var layout = g.node(v)

    if (layout.group) {
      svg.add(createRect(layout, 'qm-diagram-group', 1))

      var text = page.create('text')
        .class('qm-diagram-text qm-group-label')
        .attr('x', layout.x - layout.width / 2 + padding)
        .attr('y', layout.y - layout.height / 2 + textHeight / 2)
        .text(layout.label)

      svg.add(text)

    } else {
      svg.add(createRect(layout, 'qm-diagram-rectangle', 1))

      var text = page.create('text')
        .class('qm-diagram-text')
        .attr('x', layout.x)
        .attr('y', layout.y - layout.height / 2 + textHeight / 2)
        .text(layout.label)

      svg.add(text)

      layout.details.rows.forEach(function (row, i) {
        var linePoints = [
          [layout.x - layout.width / 2, layout.y - layout.height / 2 + textHeight * (i + 1)],
          [layout.x + layout.width / 2, layout.y - layout.height / 2 + textHeight * (i + 1)]
        ]

        var divider = page.create('path')
          .class('qm-diagram-divider')
          .attr('d', path(linePoints, false))

        svg.add(divider)

        var text = page.create('text')
          .class('qm-diagram-row-text')
          .attr('x', layout.x)
          .attr('y', layout.y - layout.height / 2 + textHeight / 2 + textHeight * (i + 1))
          .text(row)

        svg.add(text)
      })
    }

  })

  g.edges().forEach(function (e) {
    var layout = g.edge(e)

    var points = layout.points.map(function (point) {
      return [point.x, point.y]
    })

    var join = edges[e.v + ':' + e.w].param(1)

    var line = page.create('path')
      .class('qm-diagram-path')
      .attr('d', path(points))

    var labelRect = createRect(layout, 'qm-diagram-edge-label-rect', 5)

    var label = page.create('text')
      .class('qm-diagram-edge-label-text')
      .attr('x', layout.x)
      .attr('y', layout.y - layout.height / 2 + textHeight / 2)
      .text(layout.label)

    if (join[0] === '<') {
      line.attr('marker-start', 'url(#arrow-start)')
    }

    if (join.indexOf('--') > -1) {
      line.class(line.class() + ' qm-diagram-path-dashed')
    }

    if (join[join.length - 1] === '>') {
      line.attr('marker-end', 'url(#arrow-end)')
    }

    svg
      .add(line)
      .add(labelRect)
      .add(label)
  })

  page.asset('quantum-diagram.css', __dirname + '/client/quantum-diagram.css')
  return page.create('div').class('qm-diagram').add(svg)

}

module.exports = function (options) {
  return {
    diagram: diagram
  }
}

module.exports.assets = {
  'quantum-diagram.css': __dirname + '/client/quantum-diagram.css'
}
