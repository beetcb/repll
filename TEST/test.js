const c = require('chalk')
const strLen = require('string-length')

const { replLive, onAny, refresh } = require('../index')
const { EOL } = require('os')

// Needed pass real len when use astral symbols
const prompt = c`{blue › }`
const replL = replLive(prompt, strLen(prompt))

// Listen every input
onAny(data => {
  refresh(c`${EOL}{green ${JSON.stringify(data)}}`)
})
