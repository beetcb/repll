const c = require('chalk')
const { replLive, onTab } = require('../index')

// Need to pass real prompt length when use astral symbols
const prompt = c`{blue › }`
const repll = replLive([prompt], `LINE: 1`)

// Tab completion
onTab(v => {
  const optionMap = {
    'feat: ': 'add a new feature',
    'fix: ': 'patch a bug',
  }
  const selectedList = Object.keys(optionMap).filter(
    e => e.includes(v) && e.length > v.length
  )

  return [selectedList, optionMap]
})
