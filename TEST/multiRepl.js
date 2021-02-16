const { replLive, onInput, onLine } = require('../index')

// Create a repll instance
let repll = replLive({
  'write › ': 'ha',
  'write more › ': '',
})

;(async () => {
  await repll.waitClosing()
  console.log('noHello')
  replLive({
    'write › ': 'hahaha',
    'write more › ': '',
  })
  await repll.waitClosing()
  console.log('noHello')
})()
