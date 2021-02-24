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
 * Prase completion map
 * @param {array} selectedList selected completion items
 * @param {object} map completion map
 * @return {string} output to stdout
 */
exports.praseCompletion = (selectedList = [], map) => {
  const longest = selectedList.sort((a, b) => b.length - a.length)[0]
  return selectedList.reduce(
    (output, key) =>
      output +
      `${key.padEnd(longest.length + 2)}${map[key] ? '-- ' : ''}${map[key]}\n`,
    ''
  )
}

exports.stringBleach = string => string.replace(/\x1B\[(\d+;?)*m/g, '')

exports.wiseUpdate = (lastOutput, string) => {
  let [del, write] = [true, true]
  if (lastOutput === '') del = false
  if ('\n' + string === lastOutput) {
    write = false
    del = false
  }
  return [del, write, '\n' + string]
}
