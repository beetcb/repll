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
    this.instance.on('complete', () => callback())
  },
  refresh(string) {
    this.instance.refresh(string)
  },
}
