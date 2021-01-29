const replLive = require('./lib/replLive')
const {
  commonPrefix,
  praseCompletion,
} = require('./lib/utils')

let repll = null

const methodRegister = {
  replLive(prompt, placeholder) {
    repll = this.instance = new replLive(prompt)
    repll.writePlaceholder(placeholder)
    return repll
  },
  onInput(callback) {
    repll.on('key', key => callback(key))
  },
  onLine(callback) {
    repll.on('line', l => {
      const ph = callback(l)
      if (typeof ph === 'string') repll.writePlaceholder(ph)
    })
  },
  onFakeLine(callback) {
    repll.on('fakeLine', fixedLine => {
      callback(fixedLine)
    })
  },
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
  onArrow(callback) {
    repll.on('arrow', i => callback(i))
  },
  onAny(callback) {
    repll.on('any', data => callback(data))
  },
  onStop(callback, time) {
    repll.on('any', () => {
      clearTimeout(repll.lastTimer)
      if (repll.rl.line)
        repll.lastTimer = setTimeout(() => callback(), time * 1000)
    })
  },
  onSubmit(callback) {
    repll.on('submit', result => {
      callback(result)
    })
  },
}

module.exports = methodRegister
