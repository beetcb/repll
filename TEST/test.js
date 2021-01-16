const c = require('chalk')
const strLen = require('string-length')

const { replLive, onAny, refresh, onTab } = require('../index')
const { EOL } = require('os')

// Needed pass real len when use astral symbols
const prompt = c`{blue › }`
const repll = replLive(prompt, strLen(prompt))

onTab(v => {
  const optionList = ['feat: ', 'fix: ']
  const selectedList = optionList.filter(e => e.includes(v))
  return [selectedList, v]
})
