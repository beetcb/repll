const { replLive, onLine, onInput, refresh } = require('../index')

// Create a repll instance
const prompt = `› `
const repll = replLive(prompt, prompt.length, 'LINE: 1')

onLine(line => {
  return `LINE: ${line}`
})

onInput(() => {
  refresh(`\nALL: ${repll.input}`)
})
