const readline = require('readline')
const { EOL } = require('os')
const EventEmitter = require('events')
const { exit } = require('process')

// Read input key-by-key
readline.emitKeypressEvents(process.stdin)
process.stdin.setRawMode(true)

let rl = null
class liveRead extends EventEmitter {
  constructor(prompt = '› ', len) {
    super(
      (() => {
        // Set prompt interface
        rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout,
          // Nice looking prompt
          prompt: EOL + prompt,
          // Disable defalut tab behavior
          // completer: () => [[], ''],
        })
        rl.prompt()
        rl.input.setEncoding('utf8')
        rl.cursor += len || prompt.length

        // Use _previousKey : not `keypress` nor `data` event
        const handleKey = (input) => {
          // Track total input
          this.input = rl.line

          // Handle paste
          if (input.length > 1) {
            this.emit('input', input)
            return
          }
          
          const data = rl['_previousKey']
          const i = `${data.ctrl ? '^' : '' + data.name}`

          // Register Event: 'arrow' 'delete' 'complete' 'end' 'key'
          switch (i) {
            // Arrow key
            case /(up|down|left|right)/.test(i) ? i : null: {
              this.emit(`arrow`, i)
              break
            }
            // Cut whole line before the cursor
            case '^u': {
              this.input = ''
              rl.cursor = this.promptPos
              readline.cursorTo(rl.output, this.promptPos)
              break
            }
            // Close rl interface
            case '^c': {
              rl.close()
              exit()
            }
            // Fire complete signal
            case 'tab': {
              this.emit('complete')
              break
            }
            case `^return`: {
              this.emit('commit')
              break
            }
            default: {
              this.emit('input', data.name || data.sequence)
            }
          }
        }

        process.stdin.on('data', handleKey)
      })()
    )
    // Track real-time input
    this.key = ''
    // Track real-time cursor position
    this.promptPos = rl.cursor
    // Reserve last time output for less reprint
    this.lastOutput = ''
  }

  /**
   * Refresh output
   * inspired by https://github.com/nodejs/node/blob/v15.6.0/lib/readline.js#L403
   * @param {string} string given string to output
   */
  refresh = (string) => {
    const { del, write, message } = wiseUpdate(this.lastOutput, string)
    const { cursorTo, moveCursor, clearScreenDown } = readline
    const out = rl.output

    const colLen = process.stdout.columns
    const rolUp = message.split(EOL).length - 1
    // Handle multi line input: add 0.01 to tell the line break
    const outputLine = message.split(EOL).reduce((count, e) => count + Math.floor(e.length / (colLen + 0.01)), 0)
    const rolDel = this.lastOutput.split(EOL).length - 1

    // console.log(rl)

    // Delete last time output message
    if (del) {
      ;[...Array(rolDel)].fill(null).forEach(() => {
        moveCursor(out, 0, 1)
        out.write('\u001B[2K')
      })
      moveCursor(out, 0, -rolDel)
    }
    if (write) {
      out.write(message, () => {
        if (rl.cursor === colLen - 1) {
          rl.cursor = 0
        }
        cursorTo(out, 0)
        moveCursor(out, rl.cursor, -rolUp - outputLine)
      })
      this.lastOutput = message
    }
  }
}

function wiseUpdate(lastOutput, string) {
  let [del, write] = [true, true]
  if (lastOutput === '') del = false
  if (EOL + string === this.lastOutput) {
    write = false
    del = false
  }
  return { del, write, message: EOL + string }
}

module.exports = liveRead
