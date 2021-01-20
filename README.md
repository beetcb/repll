<p align="center">
  <a href="https://github.com/beetcb/repll">
    <img src="assets/demo.svg" alt="demo" width="600">
  </a>
  <h3 align="center">repll: customizable & livly repl</h3>
  <p align="center">
    <a href="https://github.com/beetcb/repll/blob/master/TEST/tldr.js">View Demo Source Code</a>
  </p>
</p>

### Features

- `r`: **read** input key-by-key ( when you paste something, don't worry, we will handle it as a longer `key` )
- `e`: **evaluate** input ( we do not evaluate javascript, that's boring, the `eval` function is provided **by you** )
- `p`: **print** whatever you wanna output ( without even press `Enter` )
- `ll`: we keep doing `r e p` **looply** and **livly**, so you can interact with user in real-time

We also support:

- `tab completion`: not bash like, we won't endlessly prompt out the possibilities. Moreover, repll support adding detailed introduction by using a `completion object`
- `stop detection`: when user stops input, we will calculate the pause time, compare it with the time you provide
- `fake line`: sometimes, you want to process input just in one line(by hitting enter, you don't wanna create a new prompt). But readline won't let you do that line feed, repll implement that by using `onFakeLine`, press `<shift-enter>` to try it!
- `livly prompt`: by passing a prompt string sequence to repll, every time you press enter, a brand new prompt prompts up!
- `livly placeholder`: can be used to give user tips on what to do, it has `livly` feature too!

### Get started!

#### Installation

```bash
npm i repll
```

The installation process is super fast because repll does not need any dependencies

#### Usage

```js
const { replLive, onInput } = require('repll')

// Create a repll instance
const repll = replLive([`› `])

// Listen input key-by-key
onInput(input => {
  // Output in real-time
  repll.refresh(`\nINPUT: ${input}
  \nALLINPUT: ${repll.input}`)
})
```

The arrow function passed to `onInput` acts as an `evaluate` function in repl, in this case, it will output what user inputs

### Global methods explained

> Note: Those methods can be directly required from `repll` module:

```js
// Require global methods
const { replLive, onTab } = require('repll')
```

- **replLive**(prompt, placeholder)

  - prompt `array`: set input prompt sequence, the first line's prompt will be `prompt[0]`, second's `prompt[1]` ... You are even able to hide the cursor by passing a `string` ends with `<hide>`
  - placeholder `string`: set input placeholder
  - _Return_: a `replLive` class's instance

  You must call this function first to init and generate a `repll` entity, which contains some very useful properties and methods:

  - `repll.input`: a `string`, which keeps tracking user's ccumulated input in current line
  - `repll.write(string, object)`: a `Function`, same as readline's write method, it can type inputs for user
  - `repll.history` an `array`, when you have multiple lines of input, it records each line for user

- **onTab**(callback(input))

  - callback `Function`: take in user accumulated input, generate a sequence for completing

  example:

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
  exameple:

  ```js
  onLine(line => {
    return `LINE: ${line}`
  })
  ```

  View full example at here: [./TEST/placeholder.js](./TEST/placeholder.js)

- **onFakeLine**

  - callback `Function`

  By default, when you press enter, readline creates a new line for you.
  repll listens to the `shfit + enter` keypress to trigger the `onFakeLine` event, which allows you to simulate a (fake new)line feed on the current line

- **onInput**(callback(key))

  - callback `Function`: take in user input key, evaluate it as you wish, repll with excute it for you

  This callback gets called each time user inputs a key

- **onAny**(callback(data))

  - callback `Function`: take in user input key's data object, it can extend `onInput` because some modifier key can't fire `onInput`

  This callback gets called each time user inputs a any key

- **onArrow**(callback(arrowKey))

  - callback `Function`: take in array key type (up|down|left|right)

  This callback gets called each time user press a arrow key

- **onStop**(callback(data), time)

  - callback `Function`: will be called when the user pause for a period of time
  - time `number`: if `time period of pausing input` seconds > `time` seconds, the callback function is executed

  You'd better use this function instead of `onInput` when you make a network request.
  The tldr demo uses this method, it's powerful!

- **onSubmit**(callback(result))

  - callback `Function`: take in all of the user input

  This callback gets called when user press <ctrl-d>, this is where the program should end

### Related projects

- [`repl`](https://nodejs.org/dist/latest-v15.x/docs/api/repl.html): nodejs built-in module, seems to be livly, but things start to get static when you pass `completer` into it

- [`ink`](https://github.com/vadimdemedes/ink): awesome project, requires a dependency on [react](https://github.com/facebook/react), also supports read user input livly
