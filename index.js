const replLive = require('./lib/replLive')

const instance = {
  replLive(prompt, len) {
    this.instance = new replLive(prompt, len)
    return this.instance
  },
  onInput(callback) {
    this.instance.on('input', input => callback(input))
  },
  onTab(callback) {
    this.instance.on('complete', input => {
      const [selectedList, target] = callback(input)
      const rl = this.instance.rl
      const len = selectedList.length
      let changedList = [selectedList, target]

      if (!len) {
        this.instance.refresh()
        return
      } else if (len > 1) {
        const prefix = commonPrefix(selectedList)
        const checkPrefix = prefix && prefix.length > target.length
        // If option list has common prefix, write it
        if (checkPrefix) {
          rl.write(prefix)
        }
        changedList = [[]]
        // Construct a string for output
        const refreshContent = selectedList.reduce(
          (s, e) => `${s ? '' : '\n'}${s}${e}\n`,
          ''
        )
        if (refreshContent && !checkPrefix)
          this.instance.refresh(refreshContent)
      }
      completeSimulation(rl, changedList)
    })
  },
  onArrow(callback) {
    this.instance.on('arrow', i => callback(i))
  },
  onAny(callback) {
    this.instance.on('any', data => callback(data))
  },
  refresh(string) {
    this.instance.refresh(string)
  },
}

module.exports = instance

/**
 * Find common prefix of a given arrrys(fill with strings)
 * Copied from https://github.com/nodejs/node/blob/master/lib/internal/readline/utils.js#L367
 * @param {arrry} strings Array of strings
 */
function commonPrefix(strings) {
  if (strings.length === 1) {
    return strings[0]
  }
  const sorted = strings.slice().sort()
  const min = sorted[0]
  const max = sorted[sorted.length - 1]
  for (let i = 0; i < min.length; i++) {
    if (min[i] !== max[i]) {
      return min.slice(0, i)
    }
  }
  return min
}

/**
 * Simulate tab completion
 * See: https://github.com/nodejs/node/blob/master/lib/readline.js#L543
 * @param {object} rl readline instance
 * @param {array} list
 */
function completeSimulation(rl, list) {
  rl.completer = (v, cb) => cb(null, list)
  rl._tabComplete(true)
  rl.completer = (v, cb) => cb(null, [[]])
}
