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

- `r`: **read** input key-by-key ( when you paste something, don't worry, we will handle it )
- `e`: **evaluate** input ( we do not evaluate javascript, that's boring, the `eval` function is provided **by you** )
- `p`: **print** whatever you wanna output
- `ll`: we doing `r e p` **looply** and **livly**, so it can interact with user in real-time

We also support:

- `tab completion`: not bash like, we won't endlessly prompt out the possibilities. Moreover, repll support adding detailed introduction by using an completion `object`
- `placeholder`: can be used to give user tips on what to do
- `stop detection`: when user stops input, we will calculate the pause time, compare it with the time you provide
- `multi-line input`: in raw mode, `enter` keypress works weird by default, repll fix that

### Get started!

#### Installation

```bash
npm i repll --production
```

Under the hood, repll does not need any dependencies, the `--production` flag is used to prevent you from installing the dependencies we use to test (like `chalk`, `node-fetch` ... )

#### Usage

```js
const { replLive, onInput, onTab, refresh } = require('repll')

// Create a repll instance
const repll = replLive(`› `)

// Listen input key-by-key
onInput(input => {
  // Output in real-time
  refresh(`\nINPUT: ${input}
  \nALLINPUT: ${repll.input}`)
})
```

the arrow function passed to `onInput` acts as an `evaluate` function in repl, in this case, it will output what user inputs

### Methods && Properties explained

#### Methods

- replLive(prompt, len, placeholder)

  - prompt `string`: set input prompt
  - len `length`: the length of the prompt
  - placeholder `string`: set input placeholder
  - _Return_: a `replLive` class's instance

  You must call this function first to init and generate a `repll` entity

- onInput(callback(key))

  - callback `Function`: take in user input key, evaluate it as you wish, repll with excute it for you

  This callback gets called each time user inputs a key

- onAny(callback(data))

  - callback `Function`: take in user input key's data object, it can extend `onInput` because some modifier key can't fire `onInput`

  This callback gets called each time user inputs a any key

- onArrow(callback(arrowKey))

  - callback `Function`: take in array key type (up|down|left|right)

  This callback gets called each time user press a arrow key

- onStop(callback(data), time)

  - callback `Function`: will be called when the user pause for a period of time
  - time `number`: if `time period of pausing input` seconds > `time` seconds, the callback function is executed

  You'd better use this function instead of `onInput` when you make a network request

- onTab(callback(input))

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

  This callback gets called each time user press the `tab`

- onSubmit(callback(result))

  - callback `Function`: take in all of the user input

  This callback gets called when user press <ctrl-s>, this is where the program should end

- refresh(string)

  - string `string`: info to output to stdout

  This is where you can interact with user, you can style the output easily using [`chauk`](https://github.com/chalk/chalk) or handle it all by yourself

### Related projects

- [`repl`](https://nodejs.org/dist/latest-v15.x/docs/api/repl.html): nodejs built-in module, seems to be livly, but things start to get static when you pass `completer` into it

- [`ink`](https://github.com/vadimdemedes/ink): awesome project, requires a dependency on [react](https://github.com/facebook/react), also supports read user input livly
