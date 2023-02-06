import logger from "shared/logger";
import { HostComponent, HostRoot, HostText } from "./ReactWorkTags";

// 根节点
function updateHostRoot(current, workInProgress) {
  // 需要知道他的子虚拟dom，知道他的儿子的虚拟dom信息
  processUpdateQueue(workInProgress)// 给workInProgress.memoriedState={element}赋值
  const nextState = workInProgress.memoriedState
  // 虚拟dom
  const nextChildren = nextState.element
  // 协调子节点 dom-diff算法
  reconcileChildren(current, workInProgress, nextChildren)
  return workInProgress.child// {type：'h1',tag:5} 根据element创建一个fiber，赋值给child

}
// 原生节点
function updateHostComponent(current, workInProgress) { }
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
