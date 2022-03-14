// 下一个工作单元
let nextUnitOfWork = null
// 用来收集dom的修改操作
let wipRoot = null
// 上次提交到 DOM 节点的 fiber 树
let currentRoot = null
// 删除的fiber
let deletions = null

const isEvent = key => key.startsWith('on')
const isProperty = key => key !== 'children' && !isEvent(key)
const isNew = (prev, next) => key => prev[key] !== next[key]

function workLoop(idleDeadline){
    let shouldYield = false
    while(!shouldYield && nextUnitOfWork){
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
        shouldYield = idleDeadline.timeRemaining() < 1
    }
    // 修改完成 需要追加到dom上
    if(wipRoot && !nextUnitOfWork){
        commitRoot()
    }
    requestIdleCallback(workLoop)
}
requestIdleCallback(workLoop)
function commitRoot() {
    deletions.forEach(commitWork)
    commitWork(wipRoot.child)
    currentRoot = wipRoot
    wipRoot = null
}
function commitWork(fiber){
    if(!fiber){
        return
    }
    const domParent = fiber.parent.dom
    if(fiber.effectTag === 'PLACEMENT' && fiber.dom){
        domParent.append(fiber.dom)
    }else if(fiber.effectTag === 'DELETION' && fiber.dom){
        domParent.removeChild(fiber.dom)
    }else if( fiber.effectTag === 'UPDATE' && fiber.dom){
        updateDom(
            fiber.dom,
            fiber.alternate.props,
            fiber.props
          )
    }
    
    commitWork(fiber.child)
    commitWork(fiber.sibling)
}

function updateDom (dom, prevProps, nextProps) {
    // 移除老的props
    Object.keys(prevProps)
        // 排除children
        .filter(isProperty)
        // 排除nextProps没用到的props
        .filter(key => !(key in nextProps))
        .forEach(key => dom[key] = '')
    
    // 设置新的props or 更新的props
    Object.keys(nextProps)
        .filter(isProperty)
        .filter(isNew(prevProps, nextProps))
        .forEach(key => dom[key] = nextProps[key])

    // 移除事件
    Object.keys(prevProps)
        .filter(isEvent)
        .filter(key => !(key in nextProps))
        .filter(isNew(prevProps, nextProps))
        .forEach(key => {
            const eventType = key.toLowerCase().substring(2)
            dom.removeEventListener(eventType, prevProps[key])
        })
    // 添加新的事件
    Object.keys(nextProps)
        .filter(isEvent)
        .filter(isNew(prevProps, nextProps))
        .forEach(key => {
            const eventType = key.toLowerCase().substring(2)
            dom.addEventListener(eventType, nextProps[key])
        })
}
function performUnitOfWork (fiber) {
    // 1 给fiber添加dom
    if(!fiber.dom){
        fiber.dom = createDom(fiber)
    }

    // 2 给每个子节点创建对应的fiber
    const elements = fiber.props.children
    reconcileChildren(fiber, elements)
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
function reconcileChildren(wipFiber, elements){
    let index = 0
    let oldFiber = wipFiber.alternate && wipFiber.alternate.child
    let prevSibling = null
    while(index < elements.length || oldFiber){
        const element = elements[index]
        let newFiber = null
        // 比较oldFiber和新的element
        const sameType = oldFiber && element && element.type === oldFiber.type
        if(sameType){
            newFiber = {
                type: element.type,
                props: element.props,
                parent: wipFiber,
                dom: oldFiber.dom,
                alternate: oldFiber,
                effectTag: 'UPDATE',

            }
        }else if(!sameType && element){
            newFiber = {
                type: element.type,
                props: element.props,
                parent: wipFiber,
                dom: null,
                alternate: oldFiber,
                effectTag: 'PLACEMENT',

            }

        }else if(!sameType && oldFiber){
            oldFiber.effectTag = "DELETION"
            deletions.push(oldFiber)
        }
        if (oldFiber) {
            // 下一个oldFiber
            oldFiber = oldFiber.sibling;
        }
        // 如果是第一个子元素，就赋值给child， 因为fiber的child只能有一个，剩下的子元素需要添加到fiber的child中的sibling中去
        if(index === 0){
            wipFiber.child = newFiber
        }else{
            // 不等于0 说明不是第一个子元素， 就要添加到第一个子元素的sibling中， prevSibling就是之前的子元素
            prevSibling.sibling = newFiber
        }
        // 保存上一个fiber
        prevSibling = newFiber
        index++
    }
}
function createDom (fiber) {
    const dom = fiber.type === 'TEXT_ELEMENT' ? document.createTextNode('') : document.createElement(fiber.type)
    Object.keys(fiber.props)
    .filter(key => key !== 'children')
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
    deletions = []
    wipRoot = {
        dom: container,
        props: {
            children: [ element ]
        },
        alternate: currentRoot,
    }
    nextUnitOfWork = wipRoot
}
export default render