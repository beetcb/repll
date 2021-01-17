const c = require('chalk')
const strLen = require('string-length')
const {
  replLive,
  onInput,
  onTab,
  hesitateRefresh,
  refresh,
  onSubmit,
  onLine,
  onStoped,
} = require('../index')

// Need to pass real prompt length when use astral symbols
const prompt = c`{blue › }`
const repll = replLive(prompt, strLen(prompt), `LINE: 1`)

// When user stops inputing
onStoped(() => {
  refresh(repll.input)
}, 0.5)

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

// The cb func cloud be async if you do some time-consuming task
// You should exit after the process
onSubmit(async result => {
  await new Promise(resolve =>
    setTimeout(() => {
      resolve('process done!')
    }, 1000)
  )
  refresh(result)
  process.exit(0)
})
