const c = require('chalk')
const strLen = require('string-length')

const liveRead = require('../lib/liveRead')
const { EOL } = require('os')
const { rawListeners } = require('process')

// Needed pass real len when use astral symbols
const prompt = c`{blue › }`
const rt = new liveRead(prompt, strLen(prompt))

// Listen input key-by-key
rt.on('input', (input) => {
  if (input === 'a') {
    rt.refresh(`${EOL}A`)
  } else {
    rt.refresh(
      c`{green.bold ${EOL}INPUT}: ${input}${EOL}ALL: ${rt.input}${EOL}CURSOR: {red ${JSON.stringify(rt.cursorPos)}}`
    )
  }
})

// Complete action
rt.on('complete', () => {
  const input = rt.input
  const query = ['feat: ', 'fix: ']
  const chosen = query.filter((e) => e.startsWith(input)).join(EOL)
})
