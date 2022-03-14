import { createElement, render } from './mini-react'
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
    name: "foo",
  },
  '你好我是app'
  )
}
const AppElement = createElement(App, {
  name: "foo",
})
function renderer () {
  const children = showInput ? [ inputElement, buttonElement ]: [ inputElement ]
  const element = createElement(
    'h1', 
    {
          title: 'foo'
    }, 
    'Hello' + inputValue,
    AppElement,
    ...children
  )
  console.log('element', element)
  const container = document.getElementById("root")
  render(element, container)
}
renderer()