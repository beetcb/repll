const replLive = require('./lib/replLive')
const { commonPrefix, praseCompletion } = require('./lib/utils')

let repll = null
const methodRegister = {
  /**
   * Create a repll instance
   * @param {object} map prompts-placeholders key-value pairs
   */
  replLive(map) {
    repll = this.instance = new replLive(map)
    return repll
  },

  /**
   * Call callback each time user inputs a key
   * @param {function} callback
   */
  onInput(callback) {
    repll.on('key', key => callback(key))
  },

  /**
   * Call callback when user press enter, generate a new line
   * @param {function} callback
   */
  onLine(callback) {
    repll.on('line', l => callback(l))
  },

  /**
   * Call callback when user press shfit + DownArrow, generate a fake line
   * @param {function} callback
   */
  onFakeLine(callback) {
    repll.on('fakeLine', fixedLine => {
      callback(fixedLine)
    })
  },

  /**
   * Call callback when user press tab
   * @param {function} callback
   */
  onTab(callback) {
    repll.on('complete', input => {
      const [selectedList, optionMap] = callback(input)
      const rl = repll.rl
      const len = selectedList.length
      const inputLen = repll.input.length
      let output = selectedList[0]

      if (!len) {
        repll.refresh()
        return
      } else if (len > 1) {
        const prefix = commonPrefix(selectedList)
        const checkPrefix = prefix && prefix.length > input.length
        // If option list has common prefix, write it
        if (checkPrefix) {
          rl.write(prefix.slice(inputLen))
        }
        output = null
        // Construct a string for output
        const refreshContent = praseCompletion(selectedList, optionMap)
        if (refreshContent && !checkPrefix) repll.refresh(refreshContent)
      }
      if (output) repll.write(output.slice(inputLen))
    })
  },

  /**
   * Call callback when user press arrow key
   * @param {function} callback
   */
  onArrow(callback) {
    repll.on('arrow', i => callback(i))
  },

  /**
   * Call callback each time user imputs something
   * @param {function} callback
   */
  onAny(callback) {
    repll.on('any', data => callback(data))
  },

  /**
   * Call callback when user pauses for a period of time
   * @param {function} callback
   * @param {number} time the time users has paused
   */
  onStop(callback, time) {
    repll.on('any', () => {
      clearTimeout(repll.lastTimer)
      if (repll.rl.line)
        repll.lastTimer = setTimeout(() => callback(), time * 1000)
    })
  },

  /**
   * Call callback when user submit, hit ctrl+s
   * @param {function} callback
   */
  onSubmit(callback) {
    repll.on('submit', result => {
      callback(result)
    })
  },
}

module.exports = methodRegister
