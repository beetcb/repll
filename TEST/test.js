const c = require('chalk')
const strLen = require('string-length')
const {
  replLive,
  onInput,
  onTab,
  hesitateRefresh,
  refresh,
  onSubmit,
} = require('../index')

// Needed pass real len when use astral symbols
const prompt = c`{blue › }`
const repll = replLive(prompt, strLen(prompt))

onTab(v => {
  const optionList = ['feat: ', 'fix: ']
  const selectedList = optionList.filter(
    e => e.includes(v) && e.length > v.length
  )
  return [selectedList, v]
})

onInput(key => hesitateRefresh(0.5, repll.input))

// The cb func cloud be async in case you do some time-consuming task
// You should exit after the process
onSubmit(async result => {
  await new Promise((resolve) =>
    setTimeout(() => {
      resolve('process done!')
    }, 1000)
  )
  refresh(result)
  process.exit(0)
})
