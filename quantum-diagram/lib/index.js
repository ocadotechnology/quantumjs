'use strict'

const dagre = require('dagre')
const quantum = require('quantum-js')
const dom = require('quantum-dom')
const path = require('path')

const stylesheetAsset = dom.asset({
  url: '/quantum-diagram.css',
  filename: path.join(__dirname, '../assets/quantum-diagram.css'),
  shared: true
})

const fontCharWidth = 9.5
const padding = 12
const textHeight = 35
const labelTextHeight = 24

function svgPath (points, close) {
  return 'M' + points.map(d => d.x + ',' + d.y).join(',') + (close ? 'z' : '')
}

function createRect (layout, cls, radius) {
  return dom.create('rect')
    .class(cls)
    .attr('x', layout.x - layout.width / 2)
    .attr('y', layout.y - layout.height / 2)
    .attr('width', layout.width)
    .attr('height', layout.height)
    .attr('rx', radius)
}

function extractNodes (selection, showDescriptions) {
  const nodes = []

  selection.selectAll('group', {recursive: true}).forEach(group => {
    const parent = group.parent()
    nodes.push({
      id: dom.randomId(),
      name: group.param(0),
      parentName: parent && parent.type() === 'group' ? parent.ps() : undefined,
      label: group.param(0),
      group: true,
      details: {}
    })
  })

  selection.selectAll('item', {recursive: true}).forEach(item => {
    const parent = item.parent()
    const rows = showDescriptions ? item.filter(quantum.isText).content() : []
    let maxWidth = item.param(1).length
    rows.forEach(row => {
      maxWidth = Math.max(row.length, maxWidth)
    })
    nodes.push({
      id: dom.randomId(),
      name: item.param(0),
      parentName: parent && parent.type() === 'group' ? parent.param(0) : undefined,
      label: item.param(1),
      group: false,
      rows: rows,
      details: {
        height: textHeight + rows.length * textHeight,
        width: maxWidth * fontCharWidth + padding * 2
      }
    })
  })

  const nodeMap = {}
  nodes.forEach(node => {
    nodeMap[node.name] = node
  })

  return {nodes, nodeMap}
}

function extractEdges (selection) {
  const edges = selection.selectAll('link').map(link => {
    const labelText = link.has('description') ? link.select('description').cs() : link.cs()
    const color = link.has('color') ? link.select('color').ps() : '#000000'
    return {
      sourceName: link.param(0),
      joinType: link.param(1),
      destName: link.param(2),
      id: dom.randomId(),
      color: color,
      label: labelText,
      details: {
        height: labelText.length > 0 ? labelTextHeight : 0,
        width: labelText.length * fontCharWidth + padding,
        labelpos: 'c'
      }
    }
  })

  const edgeMap = {}
  edges.forEach(edge => {
    edgeMap[edge.sourceName + ':' + edge.destName] = edge
  })

  return {edges, edgeMap}
}

function buildGraph (nodes, edges) {
  const graphOptions = { rankdir: 'TB' }
  const graph = new dagre.graphlib.Graph({compound: true})
  graph.setGraph(graphOptions)
  graph.setDefaultEdgeLabel(() => {})

  nodes.forEach(node => {
    graph.setNode(node.name, node.details)
    if (node.parentName) {
      graph.setParent(node.name, node.parentName)
    }
  })

  edges.forEach(edge => {
    graph.setEdge(edge.sourceName, edge.destName, edge.details)
  })

  return { graph, graphOptions }
}

function constructGroupDom (node, layout) {
  const rect = createRect(layout, 'qm-diagram-group', 1)

  const text = node.label ? dom.create('text')
    .class('qm-diagram-text qm-group-label qm-code-font')
    .attr('x', layout.x - layout.width / 2 + padding)
    .attr('y', layout.y - layout.height / 2 + textHeight / 2)
    .text(node.label) : undefined

  return [rect, text]
}

function constructNodeDom (node, layout) {
  const rect = createRect(layout, 'qm-diagram-rectangle', 1)

  const text = node.label ? dom.create('text')
    .class('qm-diagram-text qm-code-font')
    .attr('x', layout.x)
    .attr('y', layout.y - layout.height / 2 + textHeight / 2)
    .text(node.label) : undefined

  const rows = node.rows.map((row, i) => {
    const linePoints = [
      {x: layout.x - layout.width / 2, y: layout.y - layout.height / 2 + textHeight * (i + 1)},
      {x: layout.x + layout.width / 2, y: layout.y - layout.height / 2 + textHeight * (i + 1)}
    ]

    const divider = dom.create('path')
      .class('qm-diagram-divider')
      .attr('d', svgPath(linePoints, false))

    const text = dom.create('text')
      .class('qm-diagram-row-text qm-code-font')
      .attr('x', layout.x)
      .attr('y', layout.y - layout.height / 2 + textHeight / 2 + textHeight * (i + 1))
      .text(row)

    return [divider, text]
  })

  return [rect, text].concat(rows)
}

function constructEdgeDefs (edge) {
  const markerStart = dom.create('marker')
    .attr('id', `arrow-start-${edge.id}`)
    .attr('orient', 'auto')
    .attr('markerWidth', 4)
    .attr('markerHeight', 4)
    .attr('refX', 0)
    .attr('refY', 2)
    .add(dom.create('path')
      .attr('fill', edge.color)
      .attr('d', 'M0,2 L4,4 L4,0 Z'))
    .class('qm-diagram-arrow')

  const markerEnd = dom.create('marker')
    .attr('id', `arrow-end-${edge.id}`)
    .attr('orient', 'auto')
    .attr('markerWidth', 4)
    .attr('markerHeight', 4)
    .attr('refX', 4)
    .attr('refY', 2)
    .add(dom.create('path')
      .attr('fill', edge.color)
      .attr('d', 'M0,0 V4 L4,2 Z'))
    .class('qm-diagram-arrow')

  return [markerStart, markerEnd]
}

function constructEdgeDom (edge, layout) {
  const joinType = edge.joinType

  const line = dom.create('path')
    .class('qm-diagram-path')
    .classed('qm-diagram-path-dashed', joinType.indexOf('--') > -1)
    .attr('d', svgPath(layout.points))
    .attr('stroke', edge.color)
    .attr('marker-start', joinType[0] === '<' ? 'url(#arrow-start-' + edge.id + ')' : undefined)
    .attr('marker-end', joinType[joinType.length - 1] === '>' ? 'url(#arrow-end-' + edge.id + ')' : undefined)

  const labelRect = edge.label ? createRect(layout, 'qm-diagram-edge-label-rect', 5) : undefined

  const label = edge.label ? dom.create('text')
    .class('qm-diagram-edge-label-text qm-code-font')
    .attr('x', layout.x)
    .attr('y', layout.y - layout.height / 2 + textHeight / 2)
    .text(edge.label) : undefined

  return [line, labelRect, label]
}

function constructDom (graph, graphOptions, nodeMap, edgeMap) {
  const nodes = graph.nodes().map(v => {
    const node = nodeMap[v]
    const layout = graph.node(v)
    return node ? node.group ? constructGroupDom(node, layout) : constructNodeDom(node, layout) : undefined
  })

  const edgeDefs = graph.edges().map(e => {
    const edge = edgeMap[e.v + ':' + e.w]
    return constructEdgeDefs(edge)
  })

  const edges = graph.edges().map(e => {
    const edge = edgeMap[e.v + ':' + e.w]
    const nodeV = nodeMap[e.v]
    const nodeW = nodeMap[e.w]
    const layout = graph.edge(e)
    if (edge && nodeV && nodeW) {
      return constructEdgeDom(edge, layout)
    } else {
      // XXX: add a warning (html warning need adding)
    }
  })

  return dom.create('div').class('qm-diagram')
    .add(stylesheetAsset)
    .add(dom.create('svg').class('qm-diagram-svg')
      .attr('width', Math.ceil(graphOptions.width))
      .attr('viewBox', `0 0 ${Math.ceil(graphOptions.width)} ${Math.ceil(graphOptions.height)}`)
      .add(dom.create('defs').add(edgeDefs))
      .add(nodes)
      .add(edges))
}

function diagram (selection, transform) {
  const showDescriptions = !selection.has('hideDescriptions')

  const {nodes, nodeMap} = extractNodes(selection, showDescriptions)
  const {edges, edgeMap} = extractEdges(selection)
  const {graph, graphOptions} = buildGraph(nodes, edges)

  dagre.layout(graph)

  return constructDom(graph, graphOptions, nodeMap, edgeMap)
}

function entityTransforms (opts) {
  return Object.freeze({
    diagram
  })
}

module.exports = {
  entityTransforms
}
