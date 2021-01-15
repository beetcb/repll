const readline = require('readline')
const { EOL } = require('os')
const EventEmitter = require('events')
const { exit } = require('process')

// Read input key-by-key
process.stdin.setRawMode(true)

let rl = null
class replLive extends EventEmitter {
  constructor(prompt = '› ', len) {
    super(
      (() => {
        // Set prompt interface
        rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout,
          // Nice looking prompt
          prompt: EOL + prompt,
          completer: () => [[], ''],
        })

        // Clean up && move cursor the top of the screen
        rl.output.write('\u001B[1J')
        readline.cursorTo(rl.output, 0, 0)
        rl.prompt()
        rl.input.setEncoding('utf8')

        // Use _previousKey : not `keypress` nor `data` event
        const handleKey = (input) => {
          // Track cursor position
          this.cursorPos = rl.getCursorPos()
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
              const key = data.name || data.sequence
              this.key = key
              this.emit('input', key)
            }
          }
        }

        process.stdin.on('data', handleKey)
      })()
    )
    // Track real-time input
    this.key = ''
    // Track real-time cursor position
    this.promptPos = len || prompt.length
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
    const { rows, cols } = this.cursorPos
    const { cursorTo, moveCursor, clearScreenDown } = readline
    const out = rl.output

    // Delete last time output message
    if (del) {
      moveCursor(out, 0, rows)
      clearScreenDown(out)
      moveCursor(out, 0, -rows)
    }
    // Write output, Restore cursor
    if (write) {
      out.write(message, () => {
        cursorTo(out, cols, rows)
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

module.exports = {
  replLive(prompt, len) {
    this.instance = new replLive(prompt, len)
    return this.instance
  },
  onInput(callback) {
    this.instance.on('input', (input) => callback(input))
  },
  onTab(callback) {
    this.instance.on('complete', () => callback())
  },

  refresh(string) {
    this.instance.refresh(string)
  },
}
