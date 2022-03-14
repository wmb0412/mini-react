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
requestIdleCallback(workLoop)
function performUnitOfWork (fiber) {
    // 1 给fiber添加dom
    if(!fiber.dom){
        fiber.dom = createDom(fiber)
    }
    if(fiber.parent){
        fiber.parent.dom.appendChild(fiber.dom)
    }
    
    // 2 给每个子节点创建对应的fiber
    const elements = fiber.props.children
    let index = 0
    let prevSibling = null
    while(index < elements.length){
        const element = elements[index]
        const newFiber = {
            type: element.type,
            props: element.props,
            parent: fiber,
            dom: null,
        }
        // 如果是第一个子元素，就赋值给child， 因为fiber的child只能有一个，剩下的子元素需要添加到fiber的child中的sibling中去
        if(index === 0){
            fiber.child = newFiber
        }else{
            // 不等于0 说明不是第一个子元素， 就要添加到第一个子元素的sibling中， prevSibling就是之前的子元素
            prevSibling.sibling = newFiber
        }
        // 保存上一个fiber
        prevSibling = newFiber
        index++
    }

    //  3 返回下一个工作单元 fiber
    // 有child就返回child
    if(fiber.child){
        return fiber.child
    }
    // 没有child就返回sibling的， 在没有就返回parent的sibling的直到结束
    let nextFiber = fiber
    while(nextFiber){
        if(nextFiber.sibling) return nextFiber.sibling
        nextFiber = nextFiber.parent
    }
    
}

function createDom (fiber) {
    const dom = fiber.type === 'TEXT_ELEMENT' ? document.createTextNode('') : document.createElement(fiber.type)
    fiber.props.children.forEach(child => {
        render(child, dom)
    })
    Object.keys(fiber.props).filter(key => key !== 'children')
    .forEach(key => {
        dom[key] = fiber.props[key]
    })
    return dom
}
/**
 * @param element 带有type和props属性的对象
 * @param { Element } container
 */
function render (element, container){
    nextUnitOfWork = {
        dom: container,
        props: {
            children: [ element ]
        }
    }
}
export default render