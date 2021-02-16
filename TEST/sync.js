const { replLive, onInput, onLine } = require('../index')

// Create a repll instance
let repll = replLive({
  'write › ': 'ha',
  'write more › ': '',
})

;(async () => {
  // Exit when the propmt becomes empty
  await repll.waitClosing()
  console.log('Now repll closes(under control 🎉)')
})()
