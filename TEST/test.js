const liveRead = require('../lib/liveRead')
const { EOL } = require('os')
const rt = new liveRead(`GIT > `)

// Listen input key-by-key
rt.on('input', (input) => {
  rt.refresh(`${EOL}INPUT: ${input}${EOL}ALL: ${rt.input}`)
})

// Complete action
rt.on('complete', () => {
  const input = rt.input
  const query = ['feat: ', 'fix: ']
  const chosen = query.filter((e) => e.startsWith(input)).join(EOL)
  rt.refresh(chosen, true)
})
