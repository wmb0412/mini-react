// 下一个工作单元
let nextUnitOfWork = null
function workLoop(idleDeadline){
    let shouldYield = false
    while(!shouldYield && nextUnitOfWork){
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
        shouldYield = idleDeadline.timeRemaining() < 1
    }
    requestIdleCallback(workLoop)
}
/**
 * @param element 带有type和props属性的对象
 * @param { Element } container
 */
function render (element, container){
    const dom = element.type === 'TEXT_ELEMENT' ? document.createTextNode('') : document.createElement(element.type)
    element.props.children.forEach(child => {
        render(child, dom)
    })
    Object.keys(element.props).filter(key => key !== 'children')
    .forEach(key => {
        dom[key] = element.props[key]
    })
    container.appendChild(dom)
}
export default render