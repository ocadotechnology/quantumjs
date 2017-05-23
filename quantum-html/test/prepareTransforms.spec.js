describe('prepareTransforms', () => {
  const { prepareTransforms } = require('..')
  it('flattens entityTransforms into a single namespaced object', () => {
    function t1 () {}
    function t2 () {}
    const entityTransforms = {
      a: {
        b: t1,
        c: t2
      }
    }
    prepareTransforms(entityTransforms).should.eql({
      'b': t1,
      'c': t2,
      'a.b': t1,
      'a.c': t2
    })
  })

  it('overrides root transform for multiple entityTransforms with the same name', () => {
    function t1 () {}
    function t2 () {}
    const entityTransforms = {
      a: {
        b: t1
      },
      c: {
        b: t2
      }
    }
    prepareTransforms(entityTransforms).should.eql({
      'b': t2,
      'a.b': t1,
      'c.b': t2
    })
  })

  it('handles more complex combinations', () => {
    function f1 () {}
    function f2 () {}
    function f3 () {}
    function f4 () {}
    function f5 () {}

    prepareTransforms({
      html: {
        div: f1,
        span: f2
      },
      docs: {
        div: f3,
        title: f4
      },
      override: {
        docs: {
          div: f5
        }
      }
    }).should.eql({
      'html.div': f1,
      'html.span': f2,
      'docs.div': f3,
      'override.docs.div': f5,
      'docs.title': f4,
      'div': f5,
      'span': f2,
      'title': f4
    })
  })
})
