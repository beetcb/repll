const { replLive, onStoped, refresh } = require('../index')
const fetch = require('node-fetch')
const strLen = require('string-length')
const c = require('chalk')

const prompt = c`{blue › }`
const repll = replLive(
  prompt,
  strLen(prompt),
  `Type a command you wanna search on tldr`
)

onStoped(async () => {
  refresh(await tldr(repll.input))
}, 0.5)

async function tldr(input) {
  refresh(c`\n{cyan fetching on web ...}`)
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
  }
}
