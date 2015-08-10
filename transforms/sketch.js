var dagre = require('dagre')

function flatten(arr) {
  return [].concat.apply([], arr)
}

function dist(p1, p2) {
  return Math.sqrt((p1[0]-p2[0]) * (p1[0]-p2[0]) + (p1[1]-p2[1]) * (p1[1]-p2[1]))
}

function interpolate(p1, p2, count) {
  var res = []
  for (var i = 0; i < count; i++) {
    var x = (p2[0] - p1[0]) * i / (count - 1) + p1[0]
    var y = (p2[1] - p1[1]) * i / (count - 1) + p1[1]
    res.push([x, y])
  }
  return res
}

function sketchy(points, wobbleFactor, spacing) {
  var res = points.map(function(point, i) {
    if (i < points.length-1) {
      return interpolate(point, points[i+1], dist(point, points[i+1]) / spacing)
    } else {
      return [point]
    }
  })
  return flatten(res)
}

function path(points, close) {
  return 'M' + points.map(function(d) { return d[0] + ',' + d[1]}).join(',') + (close ? 'z' : '')
}

exports.sketch = function(entity, page, transform) {
  return page.create('svg').class('sk-svg').add(entity.transform(transform))
}

exports.rectangle = function(entity, page, transform) {
  var points = [[0, 0], [0, 100], [100, 100], [100, 0], [0, 0]]

  return page.create('path')
    .class('sk-rectangle')
    .attr('d', path(sketchy(points, 3, 10)), true)
}

exports.graph = function(entity, page, transform) {

  // Create a new directed graph
  var g = new dagre.graphlib.Graph();

  // Set an object for the graph label
  g.setGraph({rankdir: 'LR'});

  // Default to assigning a new object as a label for each new edge.
  g.setDefaultEdgeLabel(function() { return {}; });

  entity.selectAll('node').forEach(function(node, i) {
    g.setNode(node.ps(), {
      label: node.select('name').ps(),
      width: Number(node.select('width').ps()),
      height: Number(node.select('height').ps())
    })

    node.selectAll('link').forEach(function(link) {
      g.setEdge(node.ps(), link.ps())
    })
  })

  dagre.layout(g)

  var svg = page.create('svg').class('sk-svg')

  g.nodes().forEach(function(v) {
    var layout = g.node(v)

    var points = [
      [layout.x - layout.width/2, layout.y - layout.height/2],
      [layout.x + layout.width/2, layout.y - layout.height/2],
      [layout.x + layout.width/2, layout.y + layout.height/2],
      [layout.x - layout.width/2, layout.y + layout.height/2],
      [layout.x - layout.width/2, layout.y - layout.height/2]
    ]

    var rect = page.create('path')
      .class('sk-rectangle')
      .attr('d', path(sketchy(points, 3, 10)))

    var text = page.create('text')
      .class('sk-text')
      .attr('x', layout.x)
      .attr('y', layout.y)
      .text(layout.label)

    svg.add(rect)
    svg.add(text)
  });

  g.edges().forEach(function(e) {

    var points = g.edge(e).points.map(function(point) {
      return [point.x, point.y]
    })

    //XXX: make these into actual arrows
    var line = page.create('path')
      .class('sk-path')
      .attr('d', path(points))

    svg.add(line)
  });

  return page.addAssets({css: { 'sketch.css': __dirname + '/sketch.css' }})
    .then(function() {
      return svg
    })
}
