const readline = require('readline')
const { EOL } = require('os')
const EventEmitter = require('events')

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
          completer: () => [[], ''],
        })
        rl.prompt()
        rl.input.setEncoding('utf8')

        // Referenced from `vadimdemedes/ink` module
        const handleKey = (input) => {
          const key = {
            up: input === '\u001B[A',
            down: input === '\u001B[B',
            left: input === '\u001B[D',
            right: input === '\u001B[C',
            return: input === '\r',
            ctrl: (() => {
              if (input <= '\u001A' && input !== '\r') {
                input = String.fromCharCode(input.charCodeAt(0) + 'a'.charCodeAt(0) - 1)
                return true
              }
              return false
            })(),
            tab: input === '\t' || input === '\u001B[Z',
            backspace: input === '\u0008',
            delete: input === '\u007F' || input === '\u001B[3~',
          }

          // Polyfill for tab
          if (key.ctrl && input === 'i') {
            key.tab = true
            key.ctrl = false
          }

          const pressed = Object.keys(key).filter((e) => key[e] === true && e !== 'ctrl')[0]
          const i = `${key.ctrl ? '^' : ''}${pressed ? pressed : input}`
          this.key = pressed ? '' : input

          // Register Event: 'arrow' 'delete' 'complete' 'end' 'key'
          switch (i) {
            // Arrow key
            case /(up|down|left|right)/.test(i) ? i : null: {
              const type = pressed
              // Let cursor follow arrow key action
              if (type === 'left') {
                this.cursorPos !== prompt.length && --this.cursorPos
              } else if (type === 'right') {
                this.cursorPos !== this.input.length + prompt.length && ++this.cursorPos
              }
              this.emit(`arrow`, pressed)
              break
            }
            // Cut whole line before the cursor
            case '^u': {
              this.input = ''
              this.cursorPos = prompt.length
              readline.cursorTo(rl.output, prompt.length)
              break
            }
            // Close rl interface
            case '^c':
              rl.close()
            // Handle delete
            case 'delete': {
              this.cursorPos !== prompt.length && --this.cursorPos
              this.input = this.input.slice(0, -1)
              this.emit('delete')
              break
            }
            // Fire complete demand
            case 'tab': {
              this.emit('complete')
              break
            }
            case 'return': {
              rl.output.write(EOL)
              readline.cursorTo(rl.output, prompt.length)
              readline.moveCursor(rl.output, 0, -1)
              this.cursorPos = prompt.length
            }
            case `^return`: {
              this.emit('commit')
              break
            }
            default: {
              this.input += input
              this.emit('input', input)
            }
          }
        }

        process.stdin.on('data', handleKey)
      })()
    )
    // Track real-time input
    this.key = ''
    // Track total input
    this.input = ''
    // Track real-time cursor position
    this.cursorPos = len || prompt.length
    // Reserve last time output for less reprint
    this.lastOutput = ''
  }

  refresh = (string, isTab) => {
    const { del, write, message } = wiseUpdate(this.lastOutput, string)
    const { cursorTo, moveCursor, clearScreenDown } = readline
    const out = rl.output

    const colLen = process.stdout.columns
    const rolUp = message.split(EOL).length - 1
    // Handle multi line input: add 0.01 to tell the line break
    const outputLine = message.split(EOL).reduce((count, e) => count + Math.floor(e.length / (colLen + 0.01)), 0)
    const rolDel = this.lastOutput.split(EOL).length - 1

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
        if (this.cursorPos === colLen) {
          this.cursorPos = 0
        }
        if (this.cursorPos === colLen - 1) {
          this.cursorPos = -1
        }
        cursorTo(out, 0)
        moveCursor(out, isTab ? this.cursorPos : (this.cursorPos += this.key.length), -rolUp - outputLine)
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
