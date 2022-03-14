import { createElement, render, useState } from './mini-react'
let inputValue = 'wmb'
let showInput = true
const inputElement = createElement(
   'input',
   {
      value: inputValue,
      oninput: (e) => {
        inputValue = e.target.value
        renderer()
      }
   },
)
const buttonElement = createElement(
  'button',
  {
     value: inputValue,
     onclick: (e) => {
      showInput = false
      renderer()
     }
  },
  '删除我自己'
)
const App = ({ name }) => {
  return createElement('div', {
    title: "foo",
  },
  '你好我是app'
  )
}
const AppElement = createElement(App, {
  name: "foo",
})
const Counter = () => {
  const [ count, setCount ] = useState(0)
  return createElement('span', {
    ffz: 123,
    onclick: () => setCount(() => count+1),
  }, String(count))
}
const CounterElement = createElement(Counter, {nima: 3444})
function renderer () {
  const children = showInput ? [ inputElement, buttonElement ]: [ inputElement ]
  const element = createElement(
    'h1', 
    {
          title: 'foo'
    }, 
    'Hello' + inputValue,
    AppElement,
    CounterElement,
    ...children
  )
  console.log('element', element)
  const container = document.getElementById("root")
  render(element, container)
}
renderer()