import { setInitialProperties } from "./ReactDOMComponent";

// dom 操作
export function shouldSetTextContent(type, props) {
  // 字符串或数字
  return (
    typeof props.children === 'string' ||
    typeof props.children === 'number'
  );
}

/**
 * 创建文本实例
 * @param {*} content
 */
export function createTextInstance(content) {
  return document.createTextNode(content);
}

export function createInstance(type, props, workInProgress) {
  console.log('type, props, workInProgress: ', type, props, workInProgress);
  const domElement = document.createElement(type)
  // 属性的添加一会写

  return domElement
}

/**
 *
 * @param {*} domElement dom元素
 * @param {*} type 类型
 * @param {*} props props
 */
export function finalizeInitialChildren(domElement, type, props) {
  setInitialProperties(domElement, type, props);
}

/**
 *
 * @param {*} parent 父节点
 * @param {*} child 子节点
 */
export function appendInitialChild(parent, child) {
  parent.appendChild(child)
}

/**
 *
 * @param {*} parent 父亲
 * @param {*} child 儿子
 */
export function appendChild(parentInstance, child) {
  parentInstance.appendChild(child)
}
