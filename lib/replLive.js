const readline = require('readline')
const { EOL } = require('os')
const EventEmitter = require('events')

let rl = null
class replLive extends EventEmitter {
  constructor(prompt = ['› ']) {
    super(
      (() => {
        // Set prompt interface
        rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout,
          // Nice looking prompt
          prompt: EOL + prompt[0],
          completer: () => [[]],
        })

        // Clean up && move cursor to the top of the screen
        rl.output.write('\u001B[1J')
        readline.cursorTo(rl.output, 0, 0)
        rl.prompt()
        rl.input.setEncoding('utf8')

        // Use _previousKey: neither `keypress` nor `data` event
        const handleKey = input => {
          const data = rl['_previousKey']
          // Emit everything to extend use case
          this.emit('any', data)
          // Track total input
          // this.input = `${rl.history ? rl.history.join(EOL) : ''}${rl.line}`
          // Handle paste
          if (input.length > 1 && !data.code) {
            this.emit('key', input)
            return
          }
          const i = `${data.ctrl ? '^' : ''}${data.name}`
          // Register Event: 'any' 'arrow' 'complete' 'submit' 'key'
          switch (i) {
            case '^c': {
              this.write('\u001B[?25h')
              this.removeAllListeners()
              process.exit()
            }
            // Arrow key
            case /(up|down|left|right)/.test(i) ? i : null: {
              this.emit(`arrow`, i)
              break
            }
            case '^u': {
              this.refresh()
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
              // Disable default arrow up/down, fix nextline's cursor issue
              rl.history = []
              // Create new prompt
              const nextPrompt = prompt[this.inputLine]

              if (nextPrompt)
                rl.setPrompt(
                  `${EOL}${
                    // Hide cursor
                    nextPrompt.replace('<hide>', function (match) {
                      if (match) return '\u001B[?25l'
                      return '\u001B[?25h'
                    })
                  }`
                )
              this.refreshNewLine()
              rl.prompt()
              this.history.push(this.input)
              this.input = ''
              this.fakeLineBreak = 1
              this.emit('line', ++this.inputLine)
              break
            }
            // Can not detect ^return, use ^d instead
            case '^d': {
              this.emit('submit', this.input)
              break
            }
            // TEST: shift + enter
            case data.sequence === '\x1BOM' ? i : null: {
              readline.clearScreenDown(rl.output)
              const cols = process.stdout.columns * this.fakeLineBreak++
              const lineBreak = cols - rl.line.length
              // Faking a new line, hard-coded
              Array(lineBreak)
                .fill(null)
                .forEach(() => rl.write(' '))
              this.input = rl.line.replace(/\s{3,}/, EOL)
              this.emit('shiftEnter')
              break
            }
            default: {
              this.input = rl.line
              this.key = data.sequence
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
    // Reserve last time output for less reprint
    this.lastOutput = ''
    // Count input lines
    this.inputLine = 1
    // Export readline instance
    this.rl = rl
    // Faking line break
    this.fakeLineBreak = 1
    // Recording line history
    this.history = []
  }

  /**
   * Refresh output
   * inspired by https://github.com/nodejs/node/blob/v15.6.0/lib/readline.js#L403
   * @param {string} string given string to output
   */
  refresh = (string = '', noEOL) => {
    const { del, write, message } = noEOL
      ? { write: true, message: ' '.repeat(this.placeholder.length) }
      : wiseUpdate(string)
    const { rows, cols } = rl.getCursorPos()
    const { cursorTo, moveCursor, clearScreenDown } = readline
    const out = rl.output
    // Delete last time output
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
      // This prevent cursor from flickering
      cursorTo(out, cols, rows + (this.inputLine - 1) * 2)
      this.lastOutput = message
    }
  }
  /**
   * Write placeholder to stdout
   * @param {string} placeholder
   */
  writePlaceholder(placeholder) {
    this.placeholder = placeholder || this.placeholder || ''
    rl.output.write(`\u001B[90m${this.placeholder}\u001B[39m`)
    readline.moveCursor(rl.output, -this.placeholder.length)
  }
  // Refresh input, clear stdout
  refreshInput() {
    this.refresh(null, true)
  }
  // Fix cursor pos caused by fakeLineBreak
  refreshNewLine() {
    readline.moveCursor(rl.output, 0, -(this.fakeLineBreak - 1))
  }
  write = (string, object) => {
    rl.write(string, object)
    this.refreshInput()
  }
}

function wiseUpdate(string) {
  let [del, write] = [true, true]
  if (this.lastOutput === '') del = false
  if (EOL + string === this.lastOutput) {
    write = false
    del = false
  }
  return { del, write, message: EOL + string }
}

module.exports = replLive
