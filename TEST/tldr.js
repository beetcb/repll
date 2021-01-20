const { replLive, onStop } = require('../index')
const fetch = require('node-fetch')
const c = require('chalk')

const prompt = c`{blue › }`
const repll = replLive([prompt], `Type a command you wanna search on tldr`)

// Pause 1 second -> request
onStop(async () => {
  repll.refresh(await tldr(repll.input))
}, 1)

async function tldr(input) {
  const res = await fetch(
    `https://api.github.com/repos/tldr-pages/tldr/contents/pages/common/${input}.md?ref=master`
  )
  if (res.status === 200) {
    const data = await res.json()
    return Buffer.from(data.content, 'base64')
      .toString()
      .replace(/(?:[\t ]*(?:\r?\n|\r))+/g, '\n')
      .replace(/\-\s/g, c`{yellow - }`)
      .replace(/`.+`/g, match => c`{green ${match}}`)
  } else {
    repll.refresh(c`\n{cyan command not found!}`)
  }
}
