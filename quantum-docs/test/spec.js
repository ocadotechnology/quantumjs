'use strict'

const chai = require('chai')
const docs = require('..')
const quantum = require('quantum-js')

const Page = quantum.Page
const File = quantum.File

chai.should()

describe('pipeline', () => {
  it('should export the correct things', () => {
    docs.should.be.a.function
    docs.transforms.should.be.a.function
  })
})

describe('populateTableOfContents', () => {
  it('should populate a table of contents (default options)', () => {
    const page = new Page({
      file: new File({
        src: 'filename.um',
        dest: 'target/filename.um'
      }),
      content: {
        content: [{
          type: 'div',
          params: [],
          content: [
            {type: 'tableOfContents', params: [], content: []},
            {type: 'topic', params: ['Topic 1'], content: ['Content']},
            {type: 'topic', params: ['Topic 2'], content: ['Content']},
            {
              type: 'topic',
              params: ['Topic 3'],
              content: [
                {type: 'section', params: ['Section 1'], content: ['Content']},
                {type: 'section', params: ['Section 2'], content: ['Content']},
                {type: 'section', params: ['Section 3'], content: ['Content']}
              ]
            }
          ]
        }]
      }
    })

    docs()(page).should.eql(new Page({
      file: new File({
        src: 'filename.um',
        dest: 'target/filename.um'
      }),
      content: {
        content: [{
          type: 'div',
          params: [],
          content: [
            {
              type: 'tableOfContents',
              params: [],
              content: [
                {type: 'topic', params: ['Topic 1'], content: []},
                {type: 'topic', params: ['Topic 2'], content: []},
                {
                  type: 'topic',
                  params: ['Topic 3'],
                  content: [
                    {type: 'section', params: ['Section 1'], content: []},
                    {type: 'section', params: ['Section 2'], content: []},
                    {type: 'section', params: ['Section 3'], content: []}
                  ]
                }
              ]
            },
            {type: 'topic', params: ['Topic 1'], content: ['Content']},
            {type: 'topic', params: ['Topic 2'], content: ['Content']},
            {
              type: 'topic',
              params: ['Topic 3'],
              content: [
                {type: 'section', params: ['Section 1'], content: ['Content']},
                {type: 'section', params: ['Section 2'], content: ['Content']},
                {type: 'section', params: ['Section 3'], content: ['Content']}
              ]
            }
          ]
        }]
      }
    }))
  })

  it('should populate a table of contents (explicitly enabled)', () => {
    const page = new Page({
      file: new File({
        src: 'filename.um',
        dest: 'target/filename.um'
      }),
      content: {
        content: [{
          type: 'div',
          params: [],
          content: [
            {type: 'tableOfContents', params: [], content: []},
            {type: 'topic', params: ['Topic 1'], content: ['Content']},
            {type: 'topic', params: ['Topic 2'], content: ['Content']},
            {
              type: 'topic',
              params: ['Topic 3'],
              content: [
                {type: 'section', params: ['Section 1'], content: ['Content']},
                {type: 'section', params: ['Section 2'], content: ['Content']},
                {type: 'section', params: ['Section 3'], content: ['Content']}
              ]
            }
          ]
        }]
      }
    })

    docs({populateTableOfContents: {enabled: true}})(page).should.eql(new Page({
      file: new File({
        src: 'filename.um',
        dest: 'target/filename.um'
      }),
      content: {
        content: [{
          type: 'div',
          params: [],
          content: [
            {
              type: 'tableOfContents',
              params: [],
              content: [
                {type: 'topic', params: ['Topic 1'], content: []},
                {type: 'topic', params: ['Topic 2'], content: []},
                {
                  type: 'topic',
                  params: ['Topic 3'],
                  content: [
                    {type: 'section', params: ['Section 1'], content: []},
                    {type: 'section', params: ['Section 2'], content: []},
                    {type: 'section', params: ['Section 3'], content: []}
                  ]
                }
              ]
            },
            {type: 'topic', params: ['Topic 1'], content: ['Content']},
            {type: 'topic', params: ['Topic 2'], content: ['Content']},
            {
              type: 'topic',
              params: ['Topic 3'],
              content: [
                {type: 'section', params: ['Section 1'], content: ['Content']},
                {type: 'section', params: ['Section 2'], content: ['Content']},
                {type: 'section', params: ['Section 3'], content: ['Content']}
              ]
            }
          ]
        }]
      }
    }))
  })

  it('should populate a table of contents (explicitly disabled)', () => {
    const page = new Page({
      file: new File({
        src: 'filename.um',
        dest: 'target/filename.um'
      }),
      content: {
        content: [{
          type: 'div',
          params: [],
          content: [
            {type: 'tableOfContents', params: [], content: []},
            {type: 'topic', params: ['Topic 1'], content: ['Content']},
            {type: 'topic', params: ['Topic 2'], content: ['Content']},
            {
              type: 'topic',
              params: ['Topic 3'],
              content: [
                {type: 'section', params: ['Section 1'], content: ['Content']},
                {type: 'section', params: ['Section 2'], content: ['Content']},
                {type: 'section', params: ['Section 3'], content: ['Content']}
              ]
            }
          ]
        }]
      }
    })

    docs({populateTableOfContents: {enabled: false}})(page).should.eql(new Page({
      file: new File({
        src: 'filename.um',
        dest: 'target/filename.um'
      }),
      content: {
        content: [{
          type: 'div',
          params: [],
          content: [
            {
              type: 'tableOfContents',
              params: [],
              content: []
            },
            {type: 'topic', params: ['Topic 1'], content: ['Content']},
            {type: 'topic', params: ['Topic 2'], content: ['Content']},
            {
              type: 'topic',
              params: ['Topic 3'],
              content: [
                {type: 'section', params: ['Section 1'], content: ['Content']},
                {type: 'section', params: ['Section 2'], content: ['Content']},
                {type: 'section', params: ['Section 3'], content: ['Content']}
              ]
            }
          ]
        }]
      }
    }))
  })
})
