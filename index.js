const replLive = require('./lib/replLive')
const {
  commonPrefix,
  completeSimulation,
  praseCompletion,
} = require('./lib/utils')

let repll = null

const methodRegister = {
  replLive(prompt, len, placeholder) {
    repll = this.instance = new replLive(prompt, len)
    repll.writePlaceholder(placeholder)
    return repll
  },
  onInput(callback) {
    repll.on('key', key => callback(key))
  },
  onLine(callback) {
    repll.on('line', l => {
      const ph = callback(l)
      repll.writePlaceholder(ph) 
    })
  },
  onTab(callback) {
    repll.on('complete', input => {
      const [selectedList, optionMap] = callback(input)
      const rl = repll.rl
      const len = selectedList.length
      let changedList = [selectedList, input]

      if (!len) {
        repll.refresh()
        return
      } else if (len > 1) {
        const prefix = commonPrefix(selectedList)
        const checkPrefix = prefix && prefix.length > input.length
        // If option list has common prefix, write it
        if (checkPrefix) {
          rl.write(prefix)
        }
        changedList = [[]]
        // Construct a string for output
        const refreshContent = praseCompletion(selectedList, optionMap)
        if (refreshContent && !checkPrefix) repll.refresh(refreshContent)
      }
      completeSimulation(rl, changedList)
    })
  },
  onArrow(callback) {
    repll.on('arrow', i => callback(i))
  },
  onAny(callback) {
    repll.on('any', data => callback(data))
  },
  onSubmit(callback) {
    repll.on('submit', result => {
      callback(result)
    })
  },
  refresh(string) {
    repll.refresh(string)
  },
  hesitateRefresh(time, string) {
    clearTimeout(this.lastTimer)
    this.lastTimer = setTimeout(() => {
      repll.refresh(string)
    }, time * 1000)
  },
}

module.exports = methodRegister
