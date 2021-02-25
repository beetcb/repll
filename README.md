<p align="center">
  <a href="https://github.com/beetcb/repll">
    <img src="https://git.beetcb.com/?path=/img/commitlive.svg" alt="demo" width="600"><br><br>
    <img alt="npm" src="https://img.shields.io/npm/v/repll">
    <img alt="npm" src="https://img.shields.io/badge/contribute-welcome-blue">
  </a>
  <h3 align="center">repll: customizable & livly repl</h3>
  <p align="center">
  The above is a tool called
  <a href="https://github.com/beetcb/commitlive">commitlive</a>, created using <code>repll</code>
  </p>
</p>

### Features

- `r`: **read** input key-by-key ( when you paste something, don't worry, we will handle it as a longer `key` )
- `e`: **evaluate** input ( we do not evaluate javascript, that's boring, the `eval` function is provided **by you** )
- `p`: **print** whatever you wanna output ( without even press `Enter` )
- `ll`: we keep doing `r e p` **looply** and **livly**, so you can interact with user in real-time

We also support:

- `input heilghting`: heightlight user's input at ease, this is what a repl should feels like
- `tab completion`: not bash like, we won't endlessly prompt out the possibilities. Moreover, repll support adding detailed introduction by using a `completion object`
- `stop detection`: when user stops input, we will calculate the pause time, compare it with the time you provide
- `fake line`: sometimes, you want to process input just in one line(by hitting enter, you don't wanna create a new prompt). But readline won't let you do that line feed, repll implement that by using `onFakeLine`, press `<shift-DownArrow>` to try it!
- `livly prompt`: by passing a prompt string sequence to repll, every time you press enter, a brand new prompt prompts up!
- `livly placeholder`: can be used to give user tips on what to do, it has `livly` feature too!
- `arrow key navigation`: you can using arrow keys to edit the text you input, we currently don't support `fake line` + `arrow key navigation`, this can lead to strange behavior, but the fact that it is still working 💊 (PR is welcome)

### Get started!

#### Installation

```bash
npm i repll
```

The installation process is super fast because repll does not need any dependencies

**You must have NodeJS v13.5.0+(v12.16.0+) installed considering compatibility issues**

#### Usage

```js
const { replLive, onInput } = require('repll')

// Create a repll instance
const repll = replLive({ 'prompt › ': 'placeholder' })

// Listen input key-by-key
onInput(input => {
  // Output in real-time
  repll.refresh(`\nINPUT: ${input}
  \nLINE: ${repll.input}`)
})
```

The arrow function passed to `onInput` acts as an `evaluate` function in repl, in this case, it will output what user inputs

### Global methods explained

> Note: Those methods can be directly required from `repll` module:

```js
// Require global methods
const { replLive, onTab } = require('repll')
```

- **replLive**(map)

  - `map`: a `Object` which contains `prompt-placeholder` key-value pairs, repll will close it's instance when all prompts are consumed, **Make sure to pass all the prompts you need, and try to use `repll.waitClosing()` to keep the closing flow in control**
  - _Return_: a `replLive` class's instance

  You must call this function first to init and generate a `repll` entity, which contains some very useful properties and methods:

  - `repll.input`: a `string`, which keeps tracking of user's accumulated input in current line
  - `repll.hl(len, string)`: a `Function`, it moves the cursor to the `len` left, cover user's input with a colorized `string`, it can be used to heightlighting user's input(NOTE: it won't change user's input, it covers a layer of colorized `string` **provided by you**)
  - `repll.write(string, object)`: a `Function`, same as readline's write method, it can type inputs for user. You can use it as an auto-completion
  - `repll.waitClosing()`: a `Function` which returns a `Promise`(will be resolved when prompt is running out), we can use it to [create a new repll instance](https://github.com/beetcb/repll/blob/master/TEST/multiRepl.js) or [write some sync code for good UX](https://github.com/beetcb/repll/blob/master/TEST/sync.js). **After it resolves, a repll's history array will return, you can catch it and do something like [inquirer](https://github.com/SBoudrias/Inquirer.js) does**
  - `repll.history` an `array`, when you have multiple lines of input, it records each line for user
  - `repll.inpuLine`: a `string`, it indicates which line user is currently on

- **onTab**(callback(input))

  - callback `Function`: take in user accumulated input, generate a sequence for completing

  i.e. :

  ```js
  onTab(v => {
    const optionMap = {
      'feat: ': 'add a new feature',
      'fix: ': 'patch a bug',
    }
    const selectedList = Object.keys(optionMap).filter(
      e => e.includes(v) && e.length > v.length
    )
    return [selectedList, optionMap]
  })
  ```

This callback gets called each time user press the `tab`, view full example at here: [./TEST/completion.js](./TEST/completion.js)

- **onLine**(callback(key))

  - callback `Function`: take in line number, if callback returns a `string`, it will be used as the new line's placeholder

  This function makes palceholder modifiable when user starts a new line.
  i.e. :

  ```js
  onLine(line => {
    return `LINE: ${line}`
  })
  ```

  View full example at here: [./TEST/placeholder.js](./TEST/placeholder.js)

- **onFakeLine**

  - callback `Function`

  By default, when you press enter, readline creates a new line for you.
  repll listens to the `shfit + DownArrow` keypress to trigger the `onFakeLine` event, which allows you to simulate a (fake new) line feed on the current line

- **onInput**(callback(key))

  - callback `Function`: take in user input key, evaluate it as you wish, repll with excute it for you

  This callback gets called each time user inputs a key

- **onAny**(callback(data))

  - callback `Function`: take in user input key's data object, it can extend `onInput` because some modifier key can't fire `onInput`

  This callback gets called each time user inputs a any key

- **onArrow**(callback(arrowKey))

  - callback `Function`: take in array key type (up|down|left|right)

  This callback gets called each time user press a arrow key

- **onStop**(callback(), time)

  - callback `Function`: will be called when the user pause for a period of time
  - time `number`: if `time period of pausing input` seconds > `time` seconds, the callback function is executed

  You'd better use this function instead of `onInput` when you make a network request.
  The tldr demo uses this method, it's powerful!

- **onSubmit**(callback())

  - callback `Function`

  This callback gets called when user press <ctrl-s>, this is where the program should end

### Related projects

- [`repl`](https://nodejs.org/dist/latest-v15.x/docs/api/repl.html): nodejs built-in module, seems to be livly, but things start to get static when you pass `completer` into it

- [`ink`](https://github.com/vadimdemedes/ink): awesome project, requires a dependency on [react](https://github.com/facebook/react), also supports read user input livly

- [`inquirer`](https://github.com/SBoudrias/Inquirer.js): super powerful interactive command line user interfacess collection
