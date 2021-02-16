const { replLive, onInput, onLine } = require('../index')

// Create a repll instance
let repll = replLive({
  'write › ': 'ha',
  'write more › ': '',
})

;(async () => {
  await repll.waitClosing()
  replLive({
    'write › ': 'haha',
    'write more › ': '',
  })

  await repll.waitClosing()
  replLive({
    'write › ': 'hahaha',
    'write more › ': '',
  })
})()
