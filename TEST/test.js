const c = require('chalk')
const strLen = require('string-length')

const { replLive, onInput, onTab, refresh } = require('../lib/replLive')
const { EOL } = require('os')

// Needed pass real len when use astral symbols
const prompt = c`{blue › }`
const replL = replLive(prompt, strLen(prompt))

// Listen input key-by-key
onInput((input) => {
  refresh(
    c`{green.bold ${EOL}INPUT}: ${input}${EOL}ALL: ${replL.input}${EOL}CURSOR: {red ${JSON.stringify(replL.cursorPos)}}`
  )
})

// Complete action
onTab(() => {
  const input = replL.input
  const query = ['feat: ', 'fix: ']
  const chosen = query.filter((e) => e.startsWith(input)).join(EOL)
  refresh(chosen)
})
