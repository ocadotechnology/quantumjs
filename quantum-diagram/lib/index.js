'use strict'
const dagre = require('dagre')
const quantum = require('quantum-js')
const dom = require('quantum-dom')
const path = require('path')

const fontCharWidth = 9.5
const padding = 12
const textHeight = 35
const labelTextHeight = 24

function transforms (opts) {
  const svgPath = (points, close) => {
    return `M${points.map((d) => d[0] + ',' + d[1]).join(',')}${(close ? 'z' : '')}`
  }

  const diagram = (selection, transform) => {
    function createRect (layout, cls, radius) {
      return dom.create('rect')
        .class(cls)
        .attr('x', layout.x - layout.width / 2)
        .attr('y', layout.y - layout.height / 2)
        .attr('width', layout.width)
        .attr('height', layout.height)
        .attr('rx', radius)
    }

    const showDescriptions = !selection.has('hideDescriptions')

    // Create a new directed graph
    const g = new dagre.graphlib.Graph({compound: true})

    const gr = {
      rankdir: 'TB'
    }

    g.setGraph(gr)

    g.setDefaultEdgeLabel(() => {
    })

    function handleGroup (groupSelection, groupName, parent) {
      if (groupName) {
        g.setNode(groupName, {label: groupName, group: true})
      }
      if (parent) {
        g.setParent(groupName, parent)
      }

      groupSelection.selectAll('item').forEach((item, i) => {
        const rows = showDescriptions ? item.filter(quantum.select.isText).content() : []

        let maxWidth = item.param(1).length

        rows.forEach((row) => {
          maxWidth = Math.max(row.length, maxWidth)
        })

        g.setNode(item.param(0), {
          label: item.param(1),
          details: {
            rows: rows
          },
          height: textHeight + rows.length * textHeight,
          width: maxWidth * fontCharWidth + padding * 2
        })

        if (groupName) {
          g.setParent(item.param(0), groupName)
        }
      })

      groupSelection.selectAll('group').forEach((group) => {
        handleGroup(group, group.ps(), groupName)
      })
    }

    handleGroup(selection)

    const edges = {}

    selection.selectAll('link').forEach((link) => {
      const labelText = link.has('description') ? link.select('description').cs() : link.cs()
      const color = link.has('color') ? link.select('color').ps() : '#000000'
      g.setEdge(link.param(0), link.param(2), {
        label: labelText,
        color: color,
        height: labelText.length > 0 ? labelTextHeight : 0,
        width: labelText.length * fontCharWidth + padding,
        labelpos: 'c'
      })
      edges[link.param(0) + ':' + link.param(2)] = link
    })

    dagre.layout(g)

    const defs = dom.create('defs')

    const svg = dom.create('svg').class('qm-diagram-svg')
      .attr('width', Math.ceil(gr.width))
      .attr('viewBox', '0 0 ' + Math.ceil(gr.width) + ' ' + Math.ceil(gr.height))
      .add(defs)

    g.nodes().forEach((v) => {
      const layout = g.node(v)

      if (layout.group) {
        svg.add(createRect(layout, 'qm-diagram-group', 1))

        const text = dom.create('text')
          .class('qm-diagram-text qm-group-label')
          .attr('x', layout.x - layout.width / 2 + padding)
          .attr('y', layout.y - layout.height / 2 + textHeight / 2)
          .text(layout.label)

        svg.add(text)
      } else {
        svg.add(createRect(layout, 'qm-diagram-rectangle', 1))

        const text = dom.create('text')
          .class('qm-diagram-text')
          .attr('x', layout.x)
          .attr('y', layout.y - layout.height / 2 + textHeight / 2)
          .text(layout.label)

        svg.add(text)

        layout.details.rows.forEach((row, i) => {
          const linePoints = [
            [layout.x - layout.width / 2, layout.y - layout.height / 2 + textHeight * (i + 1)],
            [layout.x + layout.width / 2, layout.y - layout.height / 2 + textHeight * (i + 1)]
          ]

          const divider = dom.create('path')
            .class('qm-diagram-divider')
            .attr('d', svgPath(linePoints, false))

          svg.add(divider)

          const text = dom.create('text')
            .class('qm-diagram-row-text')
            .attr('x', layout.x)
            .attr('y', layout.y - layout.height / 2 + textHeight / 2 + textHeight * (i + 1))
            .text(row)

          svg.add(text)
        })
      }
    })

    g.edges().forEach((e) => {
      const layout = g.edge(e)

      const colorId = dom.randomId()

      const markerEnd = dom.create('marker')
        .attr('id', 'arrow-end-' + colorId)
        .attr('orient', 'auto')
        .attr('markerWidth', 4)
        .attr('markerHeight', 4)
        .attr('refX', 4)
        .attr('refY', 2)
        .add(dom.create('path')
          .attr('fill', layout.color)
          .attr('d', 'M0,0 V4 L4,2 Z'))
        .class('qm-diagram-arrow')

      const markerStart = dom.create('marker')
        .attr('id', 'arrow-start-' + colorId)
        .attr('orient', 'auto')
        .attr('markerWidth', 4)
        .attr('markerHeight', 4)
        .attr('refX', 0)
        .attr('refY', 2)
        .add(dom.create('path')
          .attr('fill', layout.color)
          .attr('d', 'M0,2 L4,4 L4,0 Z'))
        .class('qm-diagram-arrow')

      defs
        .add(markerEnd)
        .add(markerStart)

      const points = layout.points.map((point) => {
        return [point.x, point.y]
      })

      const join = edges[e.v + ':' + e.w].param(1)

      const line = dom.create('path')
        .class('qm-diagram-path')
        .attr('d', svgPath(points))
        .attr('stroke', layout.color)

      const labelRect = createRect(layout, 'qm-diagram-edge-label-rect', 5)

      const label = dom.create('text')
        .class('qm-diagram-edge-label-text')
        .attr('x', layout.x)
        .attr('y', layout.y - layout.height / 2 + textHeight / 2)
        .text(layout.label)

      if (join[0] === '<') {
        line.attr('marker-start', `url(#arrow-start-${colorId})`)
      }

      if (join.indexOf('--') > -1) {
        line.class(line.class() + ' qm-diagram-path-dashed')
      }

      if (join[join.length - 1] === '>') {
        line.attr('marker-end', `url(#arrow-end-${colorId})`)
      }

      svg
        .add(line)
        .add(labelRect)
        .add(label)
    })

    return dom.create('div').class('qm-diagram')
      .add(svg)
      .add(dom.asset({
        url: '/assets/quantum-diagram.css',
        file: path.join(__dirname, '../assets/quantum-diagram.css'),
        shared: true
      }))
  }

  return Object.freeze({
  diagram})
}

module.exports.transforms = transforms
