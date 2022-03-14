
/**
 * @param { string } type 节点类型
 * @param { object } props 节点属性
 * @param { children } props 节点的子节点
 * @returns {object} 带有type和props的对象
 */
function createElement (type, props, ...children) {
    return {
        type,
        props: {
            ...props,
            children: children.map(child => typeof child === 'string' ?
                createTextElement(child): child ),
        }
    }
}
function createTextElement (text) {
    return {
        type: 'TEXT_ELEMENT',
        props: {
            nodeValue: text,
            children: []
        }
    }
}
export default createElement