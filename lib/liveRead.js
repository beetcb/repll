const readline = require('readline')
const { EOL } = require('os')
const EventEmitter = require('events')
const { read } = require('fs/promises')

// Read input key-by-key
readline.emitKeypressEvents(process.stdin)
process.stdin.setRawMode(true)

let rl = null
class liveRead extends EventEmitter {
  constructor(prompt) {
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

        rl.input.on('keypress', (key, data) => {
          const i = `${data.ctrl ? '^' : '' + data.name}`

          // Register Event: 'arrow' 'delete' 'complete' 'end' 'key'
          switch (i) {
            // Arrow key
            case /(up|down|left|right)/.test(data.name) ? data.name : null: {
              const type = data.name
              // Let cursor follow arrow key action
              if (type === 'left') {
                this.cursorPos !== prompt.length && --this.cursorPos
              } else if (type === 'right') {
                this.cursorPos !== this.input.length + prompt.length && ++this.cursorPos
              }
              this.emit(`arrow`, data.name)
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
            case 'backspace': {
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
              this.input += data.name || data.sequence
              this.emit('key', key, data)
            }
          }
        })
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
