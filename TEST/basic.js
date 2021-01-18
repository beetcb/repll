const { replLive, onInput, refresh } = require('../index')

// Create a repll instance
const repll = replLive(`› `)

// Listen input key-by-key
onInput(key => {
  // Output in real-time
  refresh(`KEY: ${key}\nALLINPUT: ${repll.input}`)
})
