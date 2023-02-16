import logger from "shared/logger";
import { mountChildFibers, reconcileChildFibers } from "./ReactChildFiber";
import { processUpdateQueue } from "./ReactFiberClassUpdateQueue";
import { HostComponent, HostRoot, HostText } from "./ReactWorkTags";
/**
 * 根据新的虚拟dom生成新的fiber链表
 * @param {*} current 老的父fiber
 * @param {*} workInProgress 新的父fiber
 * @param {*} nextChildren 新的子虚拟dom
 */
function reconcileChildren(current, workInProgress, nextChildren) {
  // 如果此新fiber没有老的fiber，那新fiber就是新创建的（不是更新的，是创建的）
  if (current === null) {
    // 挂在子fiber链表
    workInProgress.child = mountChildFibers(workInProgress, null, nextChildren)
  } else {
    // 更新
    // 有老fiber的话，需要dom diff，拿老的子fiber链表和新的子虚拟dom比较，进行最小化的更新
    workInProgress.child = reconcileChildFibers(workInProgress, current.child, nextChildren)
  }

}

// 根节点
function updateHostRoot(current, workInProgress) {
  // 需要知道他的子虚拟dom，知道他的儿子的虚拟dom信息
  // 处理更新队列
  processUpdateQueue(workInProgress)// 给workInProgress.memoriedState={element}赋值，从更新队列里面拿出来
  const nextState = workInProgress.memoizedState
  // 虚拟dom {element: {…}}
  // 新的子虚拟dom
  const nextChildren = nextState.element // h1
  // 协调子节点 dom-diff算法
  //根据新的虚拟dom，生成子fiber链表
  reconcileChildren(current, workInProgress, nextChildren)
  return workInProgress.child// {type：'h1',tag:5} 根据element创建一个fiber，赋值给child

}
// 原生节点
function updateHostComponent(current, workInProgress) {
  return null
}
/**
 * 目标是根据虚拟dom，构建新的fiber子链表 child sibling
 * @param {*} current 老fiber
 * @param {*} workInProgress 新fiber
 * @returns
 */
export function beginWork(current, workInProgress) {
  logger('beginWork', workInProgress)
  console.log('workInProgress: ', workInProgress);
  switch (workInProgress.tag) {
    // 根节点
    case HostRoot:
      // 更新子fiber树
      return updateHostRoot(current, workInProgress)
    case HostComponent:
      return updateHostComponent(current, workInProgress)
    case HostText:
      // 文本节点没有子节点
      return null

    default:
      return null;
  }
  return null
}