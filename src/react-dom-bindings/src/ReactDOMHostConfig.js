import { preCacheFiberNode, updateFiberProps } from "./client/ReactDomComponentTree";
import { diffProperties, setInitialProperties, updateProperties } from "./ReactDOMComponent";

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
/**
 * 原生组件初次挂载的时候，同伙这个方法创建dom元素
 * @param {*} type 类型 span
 * @param {*} props 属性
 * @param {*} internalInstanceHandle 对应的fiber
 * @returns
 */
export function createInstance(type, props, internalInstanceHandle) {
  const domElement = document.createElement(type)
  // 属性的添加一会写
  // 预先缓存fiber节点到dom元素上
  preCacheFiberNode(internalInstanceHandle, domElement)
  // 把属性直接保存在dom上
  updateFiberProps(domElement, props)
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

/**
 * 在parent的before之前插入child,在某个节点的前面插入一个节点，找到一个锚点
 * @param {*} parent
 * @param {*} child
 * @param {*} beforeChild
 */
export function insertBefore(parent, child, beforeChild) {
  parent.insertBefore(child, beforeChild)
}
export function prepareUpdate(dom, type, oldProps, newProps) {
  // 比较属性差异
  return diffProperties(dom, type, oldProps, newProps)
}

export function commitUpdate(domElement, updatePayload, type, oldProps, newProps, finishedWork) {
  updateProperties(domElement, updatePayload, type, oldProps, newProps, finishedWork)
  updateFiberProps(domElement, newProps)
}

export function removeChild(hostParent, deleteDom) {
  hostParent.removeChild(deleteDom)
}
