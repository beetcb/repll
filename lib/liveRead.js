const readline = require('readline')
const { EOL } = require('os')
const EventEmitter = require('events')

// Read input key-by-key
readline.emitKeypressEvents(process.stdin)
process.stdin.setRawMode(true)

let rl = null
class liveRead extends EventEmitter {
  constructor(prompt = '> ') {
    super(
      (() => {
        // Set prompt interface
        rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout,
          prompt,
          // Disable defalut tab behavior
          completer: () => [[], ''],
        })
        rl.prompt()
        rl.input.setEncoding('utf8')

        // Register Event: 'arrow' 'delete' 'complete' 'end' 'key'

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
            })(),
            tab: input === '\t' || input === '\u001B[Z',
            backspace: input === '\u0008',
            delete: input === '\u007F' || input === '\u001B[3~',
          }

          const pressed = Object.keys(key).filter((e) => key[e] === true && e !== 'ctrl')[0]
          const i = `${key.ctrl ? '^' : ''}${/(\d|\w){1}/.test(input) ? input : pressed}`

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

        rl.input.on('data', handleKey)
      })()
    )
    // Track real-time input
    this.input = ''
    // Track real-time cursor position
    this.cursorPos = prompt.length
    // Reserve last time output for less reprint
    this.lastOutput = null
  }

  refreshPrompt = (string, isTab) => {
    const out = rl.output
    out.write(this.wiseUpdate(string), () => {
      readline.cursorTo(out, 0)
      readline.moveCursor(out, isTab ? this.cursorPos : ++this.cursorPos, -`${string}`.split(EOL).length)
    })
    this.lastOutput = string
  }

  wiseUpdate = (string) => {
    return EOL + string
  }
}

module.exports = liveRead
