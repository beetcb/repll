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
- `ll`: we doing `r e p` **looply** and **livly**, so you can interact with user in real-time

We also support:

- `tab completion`: not bash like, we won't endlessly prompt out the possibilities. Moreover, repll support adding detailed introduction by using an completion `object`
- `placeholder`: can be used to give user tips on what to do
- `stop detection`: when user stops input, we will calculate the pause time, compare it with the time you provide

### Get started!

#### Installation

```bash
npm i repll
```

The installation process will be super fast because repll does not need any dependencies

#### Usage

```js
const { replLive, onInput, refresh } = require('repll')

// Create a repll instance
const repll = replLive([`› `])

// Listen input key-by-key
onInput(input => {
  // Output in real-time
  refresh(`\nINPUT: ${input}
  \nALLINPUT: ${repll.input}`)
})
```

The arrow function passed to `onInput` acts as an `evaluate` function in repl, in this case, it will output what user inputs

### Methods explained

- **replLive**(prompt, placeholder)

  - prompt `array`: set input prompt sequence, the first line's prompt will be `prompt[0]`, second's `prompt[1]` ...
  - placeholder `string`: set input placeholder
  - _Return_: a `replLive` class's instance

  You must call this function first to init and generate a `repll` entity, which keeps tracking user's ccumulated input with `repll.input`

- **refresh**(string)

  - string `string`: info to output to stdout

  Please note, the global console module's method (like `console.log`) may not be the results you were hoping for, you'll need `refresh` to make up for it (pr just using refresh instead)

  ```js
  onInput(input => {
    // Using refresh to fix console.table output
    refresh()
    console.table([
      { a: 1, b: 'Y' },
      { a: 'Z', b: 2 },
    ])
  })
  ```

  Some of the `console.xxx` methods formats output pretty good, it can be very useful!
  Also, they supports <span style="color: green">color</span> ! (tips: you can colorize the output easily using [`chauk`](https://github.com/chalk/chalk)
  )

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
