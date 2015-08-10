module.exports = function(hljs){

  var INLINE_CONTENT = {
    className: 'content',
    begin: '\\[', end: '\\]',
    endsWithParent: true,
    endsParent: true
  }

  var PARAMS = {
    className: 'params',
    variants: [
      {begin: '\\(', end: '\\)[^\\[]', endsWithParent: true, endsParent: true, contains: [INLINE_CONTENT]},
      {begin: ' ', end: ':|$', excludeEnd: true, endsWithParent: true, endsParent: true}
    ]
  }

  return {
    aliases: ['quantum'],
    contains: [
      hljs.HASH_COMMENT_MODE,
      {
        className: 'keyword',
        variants: [
          { begin: '@', end: ':|$', excludeEnd: true}
        ],
        contains: [
          PARAMS,
          INLINE_CONTENT
        ]
      }
    ]
  };
}