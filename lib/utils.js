/**
 * Find common prefix of a given arrrys(fill with strings)
 * Copied from https://github.com/nodejs/node/blob/master/lib/internal/readline/utils.js#L367
 * @param {arrry} strings Array of strings
 */
exports.commonPrefix = strings => {
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
exports.completeSimulation = (rl, list) => {
  rl.completer = (v, cb) => cb(null, list)
  rl._tabComplete(true)
  rl.completer = (v, cb) => cb(null, [[]])
}

/**
 * Prase completion map
 * @param {array} selectedList selected completion items
 * @param {object} map completion map
 * @return {string} output to stdout
 */
exports.praseCompletion = (selectedList = [], map) =>
  selectedList.reduce(
    (output, key) => output + `${key.padEnd(10)}-- ${map[key]}\n`,
    ''
  )
