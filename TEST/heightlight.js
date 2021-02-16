const { replLive, onInput } = require('../index')
const c = require('chalk')

const repll = replLive({
  'repll› ': 'Type const or number to get the heightlight',
})

onInput(() => {
  const input = repll.input
  const define = input.match(/const$/)
  const number = input.match(/\d+$/)
  if (define) {
    heightlight(define[0], 'cyan')
  }
  if (number) {
    heightlight(number[0], 'green')
  }
})

function heightlight(string, color) {
  repll.hl(string.length, c`{${color} ${string}}`)
}
