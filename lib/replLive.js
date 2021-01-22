const readline = require('readline')
const { EOL } = require('os')
const EventEmitter = require('events')
const { timeStamp } = require('console')

let rl = null
class replLive extends EventEmitter {
  constructor(prompt = ['› ']) {
    super(
      (() => {
        // Set prompt interface
        rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout,
          prompt: EOL + prompt[0],
          // Disable tab
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
          this.input = rl.line
          // Handle paste(fixed /\n$/ text)
          this.emit('any', data)
          if (input.length > 1 && !data.code) {
            if (rl.history) {
              this.write(null, { name: 'up' })
              rl.history = []
              rl.historyIndex = -1
            }
            this.refreshInput()
            this.emit('key', input)
            return
          }
          const i = `${data.ctrl ? '^' : ''}${data.name}`
          // Register Event: 'arrow' 'complete' 'submit' 'key' 'any' 'shiftEnter'
          switch (i) {
            case '^c':
            case '^d': {
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
              // Disable default arrow up/down
              rl.history = []
              this.prompt(prompt[this.inputLine])
              this.history.push(this.lastLine)
              this.lastLine = ''
              this.fakeLineBreak = 1
              this.emit('line', ++this.inputLine)
              break
            }
            // Can not detect ^return, use ^s instead
            case '^s': {
              this.emit('submit')
              break
            }
            // TEST: shift + enter
            case data.sequence === '\x1BOM' ? i : null: {
              // readline.clearScreenDown(rl.output)
              this.refresh()
              const cols = process.stdout.columns * this.fakeLineBreak++
              const lineBreak = cols - rl.line.length
              this.lineFake(lineBreak)
              this.input = rl.line.replace(/\s{3,}/, EOL)
              this.emit('shiftEnter')
              break
            }
            default: {
              this.lastLine = rl.line
              if (rl.line.length === 1) this.refreshInput()
              this.emit('key', data.sequence)
            }
          }
        }

        process.stdin.on('data', handleKey)
      })()
    )
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
  refresh = (string = '', noEOL, nextLine) => {
    // Row is relative to current line, not window
    const { rows, cols } = rl.getCursorPos()
    const { cursorTo, moveCursor, clearScreenDown } = readline
    const out = rl.output
    let mode = []
    if (string) {
      mode = wiseUpdate(string)
    } else if (noEOL) {
      mode = [false, true, ' '.repeat(this.placeholder.length)]
    } else {
      mode = [true]
    }
    const [del, write, message] = mode
    // Ready for next line
    if (nextLine) {
      cursorTo(rl.output, 0, 2 * this.inputLine)
      clearScreenDown(out)
    }
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
  // Faking a new line(a bad practice)
  lineFake(len) {
    for (let i = 0; i < len; i++) {
      rl.write(' ')
    }
  }
  // Refresh input, clear stdout
  refreshInput() {
    this.refresh(false, true)
  }
  write = (string, object) => {
    rl.write(string, object)
    this.refreshInput()
  }
  clear = len => {
    if (!len) return rl.write(null, { name: 'u', ctrl: true })
    for (let i = 0; i < len; i++) {
      rl.write(null, { name: 'backspace' })
    }
    this.refreshInput()
  }
  prompt(nextPrompt) {
    this.refresh(false, false, true)
    if (nextPrompt) {
      rl.setPrompt(
        `${EOL}${nextPrompt.replace('<hide>', function (match) {
          if (match) return '\u001B[?25l'
          return '\u001B[?25h'
        })}`
      )
    } else {
      rl.setPrompt(EOL + '› ')
    }
    rl.prompt()
  }
}

function wiseUpdate(string) {
  let [del, write] = [true, true]
  if (this.lastOutput === '') del = false
  if (EOL + string === this.lastOutput) {
    write = false
    del = false
  }
  return [del, write, EOL + string]
}

module.exports = replLive
