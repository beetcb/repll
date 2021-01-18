const { replLive, onInput, refresh } = require('../index')

// Create a repll instance
const repll = replLive(`› `)

// Listen input key-by-key
onInput(input => {
  // Output in real-time
  refresh(`\nINPUT: ${input}
  \nALLINPUT: ${repll.input}`)
})
