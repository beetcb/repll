const { replLive, onInput, onLine } = require('../index')

// Create a repll instance
let repll = replLive({
  'write › ': 'ha',
  'write more › ': 'placeholder',
})

// Listen input key-by-key
onInput(key => {
  // Output in real-time
  repll.refresh(`KEY: ${key}\nLINE: ${repll.input}`)
})
