import { createElement } from './mini-react'
const element = createElement(
    'h1', 
    {
          title: 'foo'
    }, 
    'Hello'
  )
console.log('element', element)
// const container = document.getElementById("root")
//   ReactDOM.render(element, container)