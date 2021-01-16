const replLive = require('./lib/replLive')

module.exports = {
  replLive(prompt, len) {
    this.instance = new replLive(prompt, len)
    return this.instance
  },
  onInput(callback) {
    this.instance.on('input', input => callback(input))
  },
  onTab(callback) {
    this.instance.on('complete', input => {
      // See https://github.com/nodejs/node/blob/master/lib/readline.js#L508
      // Do something using `input`
      this.instance.rl.completer = (v, cb) => {
        cb(null, callback(v))
      }
    })
  },
  onArrow(callback) {
    this.instance.on('arrow', i => callback(i))
  },
  onAny(callback) {
    this.instance.on('any', data => callback(data))
  },
  refresh(string) {
    this.instance.refresh(string)
  },
}
