const { replLive, onFakeLine } = require('../index')

const repll = replLive(['write › '])

onFakeLine(fixedLine => {
  repll.refresh(fixedLine)
})
