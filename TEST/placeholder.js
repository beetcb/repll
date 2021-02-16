const { replLive, onLine, onInput } = require('../index')

// Create a repll instance
const repll = replLive({ '› ': 'LINE: 1' })

onLine(line => {
  return `LINE: ${line}`
})

onInput(() => {
  repll.refresh(`\nALL: ${repll.input}`)
})
