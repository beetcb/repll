const readline = require('readline')
const { EOL } = require('os')
const EventEmitter = require('events')

// Read input key-by-key
process.stdin.setRawMode(true)

let rl = null
class replLive extends EventEmitter {
  constructor(prompt = '› ') {
    super(
      (() => {
        // Set prompt interface
        rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout,
          // Nice looking prompt
          prompt: EOL + prompt,
          completer: () => [[]],
        })

        // Clean up && move cursor to the top of the screen
        rl.output.write('\u001B[1J')
        readline.cursorTo(rl.output, 0, 0)
        rl.prompt()
        rl.input.setEncoding('utf8')

        // Use _previousKey : not `keypress` nor `data` event
        const handleKey = input => {
          const data = rl['_previousKey']
          // Emit everything to extend use case
          this.emit('any', data)
          // Track total input
          this.input = `${rl.history ? rl.history.join(EOL) : ''}${rl.line}`
          // Handle paste
          if (input.length > 1 && !data.code) {
            this.emit('key', input)
            return
          }
          const i = `${data.ctrl ? '^' : ''}${data.name}`
          // Register Event: 'any' 'arrow' 'complete' 'submit' 'key'
          switch (i) {
            case '^c': {
              rl.close()
            }
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
            // Fire complete signal
            case 'tab': {
              this.emit('complete', rl.line)
              break
            }
            case 'backspace': {
              // Show placeholder when input gets empty
              if (!rl.line) this.writePlaceholder()
              break
            }
            case 'return': {
              // Raw mode readline return won't refresh, repll fix that
              this.refreshInput()
              this.emit('line', ++this.inputLine)
              break
            }
            // Can not detect ^return, use ^s instead
            case '^s': {
              // User finished input by now!
              this.emit('submit', this.input)
              break
            }
            default: {
              this.key = data.sequence
              // We need to refresh input before onInput emit
              this.refreshInput()
              this.emit('key', data.sequence)
            }
          }
        }

        process.stdin.on('data', handleKey)
      })()
    )
    // Track real-time input
    this.key = ''
    // Track real-time cursor position
    this.promptPos = rl.getCursorPos().cols
    // Reserve last time output for less reprint
    this.lastOutput = ''
    // Count input lines
    this.inputLine = 1
    // Export readline instance
    this.rl = rl
  }

  /**
   * Refresh output
   * inspired by https://github.com/nodejs/node/blob/v15.6.0/lib/readline.js#L403
   * @param {string} string given string to output
   */
  refresh = (string = '') => {
    const { del, write, message } = wiseUpdate(this.lastOutput, string)
    const { rows, cols } = rl.getCursorPos()
    const { cursorTo, moveCursor, clearScreenDown } = readline
    const out = rl.output

    // Delete last time output message
    if (del) {
      moveCursor(out, -cols, rows)
      clearScreenDown(out)
      moveCursor(out, cols, -rows)
    }
    // Write output, Restore cursor
    if (write) {
      out.write(message, () => {
        cursorTo(out, cols, rows + (this.inputLine - 1) * 2)
      })
      this.lastOutput = message
    }
  }
  /**
   * Write placeholder to stdout
   * @param {string} placeholder
   */
  writePlaceholder(placeholder) {
    this.placeholder = placeholder || this.placeholder || ''
    // Color copied from `ansi-styles` project
    rl.output.write(`\u001B[90m${this.placeholder}\u001B[39m`)
    readline.moveCursor(rl.output, -this.placeholder.length)
  }
  refreshInput() {
    rl.write(' ')
    rl.write(null, { name: 'backspace' })
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

module.exports = replLive
