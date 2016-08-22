/*
     ____                    __                      _
    / __ \__  ______ _____  / /___  ______ ___      (_)____
   / / / / / / / __ `/ __ \/ __/ / / / __ `__ \    / / ___/
  / /_/ / /_/ / /_/ / / / / /_/ /_/ / / / / / /   / (__  )
  \___\_\__,_/\__,_/_/ /_/\__/\__,_/_/ /_/ /_(_)_/ /____/
                                              /___/

  Parse
  =====

  This file defines the parser. The parsing takes a fairly classical approach -
  it happens in two steps. The first phase is tokenising the input string, the second
  is processing the token stream to produce an abstract syntax tree.

  The abstract syntax tree is made of entities that have a type, parameters and content.
  The parameters are a list of strings. The content is a list of entities or strings (or a mixture).

*/

// the states the parser can be in
const TYPE = 0
const CONTENT = 1
const PARAMS = 2
const INLINE_PARAMS = 3
const INLINE_CONTENT = 4

// turns the input into an array of tokens
function tokenize (str) {
  let pos = 0
  let row = 1
  let col = 1
  let newline = true
  let state = CONTENT
  let start = 0
  let consumingSameLineContent = false
  let escapedInlineCounter = 0
  let escapedParamCounter = 0
  let consumingEscapedParams = false
  let consumingUnparsed = false // true when in an @@ block
  let unparsedIndentStart = undefined

  const indent = [0]
  const tokens = []

  function consume (type, next) {
    tokens.push({type: type, value: str.substring(start, pos)})
    state = next
    start = pos + 1
  }

  function consumeIfNonEmpty (type, next, escaped) {
    let v = str.substring(start, pos)
    if (v.length > 0) {
      if (escaped) {
        const l = escaped.length
        for (let i = 0; i < l; i++) {
          const es = escaped[i]
          v = v.replace(es, es[1])
        }
      }
      tokens.push({type: type, value: v})
    }
    state = next
    start = pos + 1
  }

  function emit (type, value) {
    if (arguments.length > 1) {
      tokens.push({type: type, value: value})
    } else {
      tokens.push({type: type})
    }
  }

  function shuffleIfNext (character) {
    if (str[pos + 1] === character) {
      pos++
      start++
      return true
    } else {
      return false
    }
  }

  function err (msg) {
    let start = str.lastIndexOf('\n', pos - 1)
    start = str.lastIndexOf('\n', start - 1)
    start = str.lastIndexOf('\n', start - 1)

    const nextNewline = str.indexOf('\n', pos)
    const errorLineEnd = nextNewline === -1 ? pos : nextNewline

    let end = str.indexOf('\n', errorLineEnd + 1)
    if (end === -1) {
      end = str.length - 1
    } else {
      end = str.indexOf('\n', end + 1)
      if (end === -1) {
        end = str.length - 1
      } else {
        end = str.indexOf('\n', end + 1)
        if (end === -1) {
          end = str.length - 1
        }
      }
    }

    const indentSpaces = (new Array(col)).join(' ')

    const message = 'Syntax error at line ' + row + ', col ' + col + ': ' + msg
    const context = str.substring(start, errorLineEnd) + '\n' + indentSpaces + '^^^^^^^^\n' + str.substring(errorLineEnd + 1, end)
    const err = new Error(message + '\n' + context)
    err.type = 'quantum-parse'
    err.context = context
    err.fullText = str
    err.line = row
    err.col = col
    err.msg = msg
    err.pos = pos

    throw err
  }

  while (pos < str.length) {
    // indentation and comment handling.
    if (newline) {
      while (newline && pos < str.length) {
        let ind = 0
        while (str[pos + ind] === ' ' && pos + ind < str.length) {
          ind++
        }

        // if it was an empty content line, then add it to the list of empty
        // content to emit on the next non empty line
        if (str[pos + ind] === '\n') {
          pos += ind + 1
          row++
          emit('EMPTY_CONTENT', str.substring(start, pos - 1))
        } else if (str[pos + ind] !== '#') {
          if (ind > indent[indent.length - 1]) {
            emit('INDENT', ind - indent[indent.length - 1])
            indent.push(ind)
          } else if (ind < indent[indent.length - 1]) {
            while (indent[indent.length - 1] > ind) {
              const prev = indent.pop()
              emit('DEDENT', prev - indent[indent.length - 1])

              if (consumingUnparsed && unparsedIndentStart === indent[indent.length - 1]) {
                consumingUnparsed = false
              }
            }

            if (indent.length > 0 && (indent[indent.length - 1] !== ind)) {
              err('indentation mismatch: this line dedents with an indentation of ' + ind + ' spaces, but an indentation of ' + indent[indent.length - 1] + ' spaces was expected')
            }
          }
          pos += ind

          if (str[pos] === '\\' && str[pos + 1] === '#') {
            pos++
          }
          newline = false
        } else {
          while (str[pos] !== '\n' && pos < str.length) {
            pos++
          }
          emit('COMMENT', str.substring(start + ind + 1, pos))
          pos++
          row++
        }

        start = pos
      }
    }

    if (pos >= str.length) {
      return tokens
    }

    const s = str[pos]

    if (state === TYPE) {
      if (s === ' ') {
        consume('TYPE', PARAMS)
        while (shuffleIfNext(' ') && pos < str.length) {}
      } else if (s === ':') {
        consume('TYPE', CONTENT)
        shuffleIfNext(' ')
        consumingSameLineContent = true
        emit('START_SAME_LINE_CONTENT')
      } else if (s === '[') {
        consume('TYPE', INLINE_CONTENT)
        emit('START_INLINE_CONTENT')
      } else if (s === '(') {
        consume('TYPE', INLINE_PARAMS)
      } else if (s === '\n') {
        consume('TYPE', CONTENT)
        if (consumingSameLineContent) {
          emit('END_SAME_LINE_CONTENT')
          consumingSameLineContent = false
        }
      }
    } else if (state === PARAMS) {
      if (s === '[') {
        escapedParamCounter++
        consumingEscapedParams = true
      } else if (consumingEscapedParams && (s === ']')) {
        escapedParamCounter--
        if (escapedParamCounter === 0) {
          consumingEscapedParams = false
        }
      } else if (s === ':' && !consumingEscapedParams) {
        consume('PARAMS', CONTENT)
        shuffleIfNext(' ')
        shuffleIfNext(']')
        consumingSameLineContent = true
        emit('START_SAME_LINE_CONTENT')
      } else if (s === '\n') {
        escapedParamCounter = 0
        consumingEscapedParams = false
        consume('PARAMS', CONTENT)
        if (consumingSameLineContent) {
          emit('END_SAME_LINE_CONTENT')
          consumingSameLineContent = false
        }
      }
    } else if (state === CONTENT) {
      if (s === '@' && !consumingUnparsed) {
        consumeIfNonEmpty('CONTENT', TYPE)
        if (str[pos + 1] === '@') {
          consumingUnparsed = true
          unparsedIndentStart = indent[indent.length - 1]
          pos++
          start++
        }
      } else if (s === '\n') {
        if (consumingSameLineContent) {
          consumeIfNonEmpty('CONTENT', CONTENT)
          emit('END_SAME_LINE_CONTENT')
          consumingSameLineContent = false
          consumingUnparsed = false
        } else {
          consume('CONTENT', CONTENT)
        }
      }
    } else if (state === INLINE_PARAMS) {
      if (s === ')') {
        if (str[pos + 1] === '[') {
          consume('PARAMS', INLINE_CONTENT)
          emit('START_INLINE_CONTENT')
          start++
          pos++
        } else {
          consume('PARAMS', CONTENT)
        }
      }
    } else if (state === INLINE_CONTENT) {
      if (s === '\\' && (str[pos + 1] === '[' || str[pos + 1] === ']')) {
        pos++
      } else if (s === '[') {
        escapedInlineCounter++
      } else if (s === ']') {
        if (escapedInlineCounter === 0) {
          consumeIfNonEmpty('CONTENT', CONTENT, ['\\]', '\\['])
          emit('END_INLINE_CONTENT')

          if (str[pos + 1] === '\n') {
            const currentIndent = indent[indent.length - 1]
            let nextLineIsIndented = true
            for (let i = 0; i <= currentIndent; i++) {
              if (str[pos + 2 + i] !== ' ') {
                nextLineIsIndented = false
              }
            }
            if (!nextLineIsIndented) {
              pos += currentIndent + 1
              start += currentIndent + 1
            }
          }
        } else {
          escapedInlineCounter--
        }
      } else if (s === '\n') {
        consume('CONTENT', INLINE_CONTENT)
      }
    }

    if (s === '\n') {
      col = 0
      row++
      newline = true
    } else {
      col++
    }

    pos++
  }

  if (state === TYPE) {
    emit('TYPE', str.substring(start, pos))
  } else if (state === PARAMS) {
    emit('PARAMS', str.substring(start, pos))
  } else if (state === INLINE_PARAMS) {
    err('missing closing ) bracket?')
  } else if (state === INLINE_CONTENT) {
    err('missing closing ] bracket?')
  } else if (state === CONTENT) {
    if (start < pos) {
      emit('CONTENT', str.substring(start, pos))
    }
  }

  return tokens
}

function splitParams (params) {
  let i = 0
  const l = params.length
  let count = 0
  const res = []
  let start = i
  let wasEscaped = false
  while (i < l) {
    if (params[i] === '[') {
      if (count === 0) {
        wasEscaped = true
      }
      count++
    } else if (params[i] === ']') {
      count--
    } else if (params[i] === ' ' && count === 0) {
      if (wasEscaped) {
        res.push(params.substring(start + 1, i - 1))
        wasEscaped = false
      } else {
        res.push(params.substring(start, i))
      }
      start = i + 1
    }
    i++
  }

  if (start < i) {
    if (wasEscaped) {
      res.push(params.substring(start + 1, i - 1))
    } else {
      res.push(params.substring(start, i))
    }
  }

  return res
}

// turns tokens into abstract syntax tree (json)
function ast (tokens) {
  let token = tokens[0]

  const state = {
    content: []
  }

  let current = state
  let active = current
  const stack = []
  let lineStackSize = 0 // when inline entities are used this gets incremented so that when you
  // go onto a new line we can go back to the correct location in the stack

  const l = tokens.length
  let i = 0
  let absoluteIndent = 0
  let currentIndent = 0
  let extraIndent = 0
  let prevWasType = false
  let nextParamsAreEscaped = false
  const emptyLines = []
  let handlingInlineContent = false // true when between an START_INLINE_CONTENT and END_INLINE_CONTENT
  /*
    notCreatedInlineContent
    This istrue when the inline content entry has not yet been created in the parsed
    content (which is done for the first content encountered between START_INLINE_CONTENT
    and END_INLINE_CONTENT)
  */
  let notCreatedInlineContent = true

  while (i < l) {
    token = tokens[i]
    if (token.type === 'TYPE') {
      if (token.value === '') {
        nextParamsAreEscaped = true
      } else {
        prevWasType = true

        active = {
          type: token.value,
          params: [],
          content: []
        }

        while (emptyLines.length) {
          current.content.push(emptyLines.pop())
        }

        current.content.push(active)
      }
    } else if (token.type === 'PARAMS') {
      if (nextParamsAreEscaped) {
        active.content.push(token.value)
        nextParamsAreEscaped = false
      } else {
        active.params = splitParams(token.value)
      }
    } else if (token.type === 'CONTENT') {
      if (token.value === '') {
        emptyLines.push(token.value)
      } else {
        while (emptyLines.length) {
          current.content.push(emptyLines.pop())
        }

        prevWasType = false

        if (handlingInlineContent) {
          if (notCreatedInlineContent) {
            current.content.push(token.value)
            notCreatedInlineContent = false
          } else {
            current.content[current.content.length - 1] += ' ' + token.value
          }
        } else {
          let ex = ''
          for (let k = 0; k < extraIndent; k++) {
            ex += ' '
          }
          current.content.push(ex + token.value)
        }
      }
    } else if (token.type === 'EMPTY_CONTENT') {
      emptyLines.push(token.value)
    } else if (token.type === 'START_SAME_LINE_CONTENT') {
      lineStackSize++
      stack.push(current)
      current = active
    } else if (token.type === 'END_SAME_LINE_CONTENT') {
      // keep the active as it is, even though the current is being droped back a couple of levels
      // this is so that you can do @one: @two: @three\n @four, and have @four be a child of @three (not @one)
      active = current

      // drop back down the stack until you reach where we were at the start of the line
      while (lineStackSize) {
        current = stack.pop()
        lineStackSize--
      }
      prevWasType = true
    } else if (token.type === 'START_INLINE_CONTENT') {
      handlingInlineContent = true
      notCreatedInlineContent = true
      lineStackSize++
      stack.push(current)
      current = active
    } else if (token.type === 'END_INLINE_CONTENT') {
      handlingInlineContent = false
      active = current
      current = stack.pop()
      lineStackSize--
      prevWasType = true
    } else if (token.type === 'INDENT') {
      stack.push(current)
      current = active
      absoluteIndent += token.value

      if (prevWasType) {
        currentIndent = absoluteIndent
      }

      extraIndent = absoluteIndent - currentIndent
    } else if (token.type === 'DEDENT') {
      current = stack.pop()
      absoluteIndent -= token.value
      extraIndent = absoluteIndent - currentIndent
    }
    i++
  }

  return state
}

function parse (str) {
  return ast(tokenize(str))
}

module.exports = parse
module.exports.tokenize = tokenize
module.exports.ast = ast
