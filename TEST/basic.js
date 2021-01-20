const { replLive, onInput, refresh } = require('../index')

// Create a repll instance
const repll = replLive(['write › ', 'write more › '])

// Listen input key-by-key
onInput(key => {
  // Output in real-time
  refresh(`KEY: ${key}\nALLINPUT: ${repll.history[0]}`)
})
