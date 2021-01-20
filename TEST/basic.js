const { replLive, onInput } = require('../index')

// Create a repll instance
const repll = replLive(['write › ', 'write more › '])

// Listen input key-by-key
onInput(key => {
  // Output in real-time
  repll.refresh(`KEY: ${key}\nLINE: ${repll.input}`)
})
