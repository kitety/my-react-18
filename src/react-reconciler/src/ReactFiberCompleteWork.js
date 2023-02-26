import logger, { indent } from "shared/logger";
import { appendInitialChild, createInstance, createTextInstance, finalizeInitialChildren, prepareUpdate } from "react-dom-bindings/src/ReactDOMHostConfig";
import { NoFlags, Update } from "./ReactFiberFlags";
import { FunctionComponent, HostComponent, HostRoot, HostText } from "./ReactWorkTags";

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
function markUpdate(workInProgress) {
  // 更新 添加更新副作用
  workInProgress.flags |= Update

}
/**
 * 在fiber的完成阶段准备更新dom
 * @param {*} current button的老fiber
 * @param {*} workInProgress button的新fiber
 * @param {*} type 类型
 * @param {*} newProps 新的属性
 */
function updateHostComponent(current, workInProgress, type, newProps) {
  console.log('updateHostComponent: ', current, workInProgress, type, newProps);
  const oldProps = current.memoizedProps //老的属性
  const instance = workInProgress.stateNode //节点
  // 比较新老属性，收集属性的差异
  const updatePayload = prepareUpdate(instance, type, oldProps, newProps)
  // const updatePayload = ['id', 'button1', 'children', '6']
  // 让原生组件的新fiber的更新队列等于差异 [] array
  workInProgress.updateQueue = updatePayload
  if (updatePayload) {
    markUpdate(workInProgress)
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
  console.log('newProps: ', newProps);
  // 判断fiber的类型 标签的类型
  switch (workInProgress.tag) {
    // host Root
    case HostRoot:
      // 向上冒泡属性
      bubbleProperties(workInProgress)
      break
    // function component
    case FunctionComponent:
      // 向上冒泡属性
      bubbleProperties(workInProgress)
      break
    // 文本
    case HostText:
      // 如果完成的fiber是文本节点，那就创建真实的文本节点
      // 传给fiber的stateNode
      workInProgress.stateNode = createTextInstance(newProps)
      // 向上冒泡属性
      bubbleProperties(workInProgress)
      break;
    case HostComponent:
      // 更新阶段就更新 更新和挂载不一样
      // 原生节点
      // 完成的是原生节点
      // 创建真实dom节点
      const { type } = workInProgress
      // 老fiber存在并且老fiber有真实dom，就走更新
      if (current !== null && workInProgress.stateNode !== null) {
        updateHostComponent(current, workInProgress, type, newProps)
      } else {
        const instance = createInstance(type, newProps, workInProgress)
        // 初次挂载的新节点，目前只是处理创建的逻辑，后面此处会进行区分，初次挂载还是更新
        // 把自己所有的儿子都添加到自己的身上
        // *** h1 添加 hello span
        appendAllChildren(instance, workInProgress)
        workInProgress.stateNode = instance
        finalizeInitialChildren(instance, type, newProps)
      }

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
  let subtreeFlags = NoFlags
  let child = completedWork.child
  // 有儿子
  // 遍历当前fiber的所有子节点，把所有的子节点的的副作用，以及子节点的子节点的副作用，全部合并起来
  while (child !== null) {
    // 处理flags
    subtreeFlags |= child.subtreeFlags
    subtreeFlags |= child.flags
    child = child.sibling
  }
  completedWork.subtreeFlags = subtreeFlags

}
