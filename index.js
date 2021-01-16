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
