### repll: node repl module's livly implementation

- `r`: **read** input key-by-key ( when you paste something, don't worry, we will handle it )
- `e`: **evaluate** input ( we do not evaluate javascript, that's boring, the `eval` function is provided **by you** )
- `p`: **print** whatever you wanna output
- `ll`: we doing `r e p` **looply** and **livly**, so it can interact with user in real-time

### Prerequisites: repll don't need any dependencies

nevertheless, you still need `node` and `npm` to use && install this module

### Get started!

1. installation:

```bash
npm i repll
```

2. usage:

```js
const { replLive, onInput, onTab, refresh } = require('../index')
const { EOL } = require('os')

// Create a repll instance
const repll = replLive(`› `)

// Listen input key-by-key
onInput(input => {
  // Output in real-time
  refresh(`${EOL}INPUT: ${input}
  ${EOL}ALLINPUT: ${repll.input}`)
})
```

the arrow function above acts as an `eval` function, in this case, it will output what user inputs

### Methods && events explained

##### methods

- replLive(prompt)

  - prompt `string`:
  - Return: a `replLive` class's instance

  You must call this function first to init and generate a `repll` entity

- onInput(callback(input))

  - callback `Function`: take in user input, evaluate it as you wish

  This callback gets called each time user inputs a key, similar to `input` Event

- onTab(callback(input))

  - callback `Function`: take in user input, generate a sequence for completing

  This callback gets called each time user press the `tab`, similar to `complete` Event

- refresh(string)

  - string `string`: info to output

  That is where you can interact with user, you can style the output easily using [`chauk`](https://github.com/chalk/chalk) or handle it all by yourself

##### events

- `input`: emit when user input a key or paste a string
- `complete`: emit when user press the
- `submit`: emit when user press `enter` with `ctrl`
- `arrow`: emit when user press one of the four arrow key

### Related projects

- [`repl`](https://nodejs.org/dist/latest-v15.x/docs/api/repl.html): nodejs built-in module, seems to be livly, but things start to get static when you pass `completer` into it

- [`ink`](https://github.com/vadimdemedes/ink): awesome project, requires a dependency on [react](https://github.com/facebook/react), also supports read user input livly
