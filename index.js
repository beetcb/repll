const replLive = require('./lib/replLive')
const {
  commonPrefix,
  completeSimulation,
  praseCompletion,
} = require('./lib/utils')

const instance = {
  replLive(prompt, len) {
    this.instance = new replLive(prompt, len)
    return this.instance
  },
  onInput(callback) {
    this.instance.on('key', key => callback(key))
  },
  onTab(callback) {
    this.instance.on('complete', input => {
      const [selectedList, optionMap] = callback(input)
      const rl = this.instance.rl
      const len = selectedList.length
      let changedList = [selectedList, input]

      if (!len) {
        this.instance.refresh()
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
  onSubmit(callback) {
    this.instance.on('submit', result => {
      callback(result)
    })
  },
  refresh(string) {
    this.instance.refresh(string)
  },
  hesitateRefresh(time, string) {
    clearTimeout(this.lastTimer)
    this.lastTimer = setTimeout(() => {
      this.instance.refresh(string)
    }, time * 1000)
  },
}

module.exports = instance
