const { replLive, onFakeLine } = require('../index')

const repll = replLive(['write › '])

onFakeLine(() => {
  repll.refresh(repll.input)
})
