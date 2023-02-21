import logger, { indent } from "shared/logger";
import { appendInitialChild, createInstance, createTextInstance, finalizeInitialChildren } from "react-dom-bindings/src/ReactDOMHostConfig";
import { NoFlags } from "./ReactFiberFlags";
import { HostComponent, HostRoot, HostText } from "./ReactWorkTags";

/**
 * 把当前的完成的fiber所有的子节点，对应的真实dom，都挂载到自己父parent真实dom节点上
 * @param {*} parent 当前完成的fiber的真实dom节点
 * @param {*} workInProgress 当前完成的fiber
 */
function appendAllChildren(parent, workInProgress) {
  // 大儿子
  let node = workInProgress.child
  while (node) {
    // appendInitialChild(parent, node.stateNode)
    // node = node.sibling
    // 考虑类组件和函数组件

    // 原生节点和文本节点
    if (node.tag === HostComponent || node.tag === HostText) {
      appendInitialChild(parent, node.stateNode)
    } else if (node.child !== null) {
      //如果第一个儿子不是一个原生节点，那可能是一个函数组件
      // 用儿子
      node = node.child
      continue;
    }
    if (node === workInProgress) {
      return
    }
    // 找叔叔
    // 如果当前节点没有弟弟
    // 就回到父亲上找
    while (node.sibling === null) {
      // 已经到当前的fiber了
      if (node.return === null || node.return === workInProgress) {
        return
      }
      node = node.return
    }
    node = node.sibling
  }
}

/**
 * 完成一个fiber节点
 * @param {*} current 老fiber
 * @param {*} workInProgress 新的构建的fiber
 */
export function completeWork(current, workInProgress) {
  // console.log('current, workInProgress: ', current, workInProgress);
  // logger
  indent.number -= 2
  logger(' '.repeat(indent.number) + 'completeWork', workInProgress)

  const newProps = workInProgress.pendingProps
  // 判断fiber的类型 标签的类型
  switch (workInProgress.tag) {
    // host Root
    case HostRoot:
      // 向上冒泡属性
      bubbleProperties(workInProgress)
      break
    // 文本
    case HostText:
      console.log('newProps: ', newProps);
      // 如果完成的fiber是文本节点，那就创建真实的文本节点
      // 传给fiber的stateNode
      workInProgress.stateNode = createTextInstance(newProps)
      // 向上冒泡属性
      bubbleProperties(workInProgress)
      break;
    case HostComponent:
      // 原生节点
      // 完成的是原生节点
      console.log('newProps: ', newProps);
      // 创建真实dom节点
      const { type } = workInProgress
      const instance = createInstance(type, newProps, workInProgress)
      // 初次挂载的新节点，目前只是处理创建的逻辑，后面此处会进行区分，初次挂载还是更新
      // 把自己所有的儿子都添加到自己的身上
      appendAllChildren(instance, workInProgress)
      workInProgress.stateNode = instance
      finalizeInitialChildren(instance, type, newProps)
      // 向上冒泡属性
      bubbleProperties(workInProgress)
      break

    default:
      break;
  }
}

// 冒泡 合并副作用
function bubbleProperties(completedWork) {
  // 儿子们的
  let subTreeFlags = NoFlags
  let child = completedWork.child
  // 有儿子
  // 遍历当前fiber的所有子节点，把所有的子节点的的副作用，以及子节点的子节点的副作用，全部合并起来
  while (child !== null) {
    // 处理flags
    subTreeFlags |= child.subTreeFlags
    subTreeFlags |= child.flags
    child = child.sibling
  }
  completedWork.subTreeFlags = subTreeFlags

}
