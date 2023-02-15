import assign from "shared/assign";
import { markUpdateLaneFromFiberToRoot } from "./ReactFiberConcurrentUpdates";
// 更新状态
export const UpdateState = 0;
export const ReplaceState = 1;
export const ForceUpdate = 2;
export const CaptureUpdate = 3;
// 每个fiber上放一个更新队列
export function initialUpdateQueue(fiber) {
  // 创建一个更新队列
  // pending 是一个双向循环链表
  const queue = {
    shared: {
      // 等待生效的队列
      pending: null
    }
  }
  fiber.updateQueue = queue
}
// 创建更新
export function createUpdate() {
  const update = { tag: UpdateState };
  return update
}
// 入队更新
export function enqueueUpdate(fiber, update) {
  const updateQueue = fiber.updateQueue;
  // 获取等待生效的队列
  // pending指向最后一个更新，next 第一个
  const pending = updateQueue.shared.pending;
  if (pending === null) {
    // 指向自己，形成环
    update.next = update
  } else {
    // 指向第一个
    update.next = pending.next;
    // 指向最后一个
    pending.next = update
  }
  // pending 指向最后一个更新，最后一个更新指向第一个
  // 单向循环链表
  updateQueue.shared.pending = update
  // 返回根节点 从当前的fiber一直到根节点
  // 现在还没涉及到更新优先级 当前fiber标记更新优先级冒泡到root
  return markUpdateLaneFromFiberToRoot(fiber)

}
/**
 * 根据老状态和更新队列中的更新，计算最新的状态
 * @param {*} workInProgress 要计算的fiber
 */
export function processUpdateQueue(workInProgress) {
  // 更新队列
  const queue = workInProgress.updateQueue
  // 拿到等待生效的队列
  const pendingQueue = queue.shared.pending
  // 如果有更新或者更新队列里有内容
  if (pendingQueue !== null) {
    // 清空等待生效的更新
    queue.shared.pending = null
    // 获取更新队列中的最后一个更新 update={payload:{element:'h1'}}
    const lastPendingUpdate = pendingQueue
    // next指向第一个更新
    const firstPendingQueue = lastPendingUpdate.next
    // 把更新链表断开，变为一个单链表
    lastPendingUpdate.next = null
    // 获取老状态 开始的时候为null
    let newState = workInProgress.memoizedState
    let update = firstPendingQueue
    while (update) {
      // 基于老状态和更新，计算得出新状态
      newState = getStateFromUpdate(update, newState)
      update = update.next
    }
    // 把最终计算到的状态给memoizedState
    workInProgress.memoizedState = newState
    console.log('newState: ', newState);// payload
  }

}
/**
 * state 0 1 2 3
 * 根据老状态和更新计算新状态
 * @param {*} update 更新的对象其实有很多种类型
 * @param {*} previousState 老状态
 */
function getStateFromUpdate(update, previousState) {
  switch (update.tag) {
    // 更新状态
    case UpdateState:
      const { payload } = update
      // 合并的不是vdom，合并的是{element:vdom}
      return assign({}, previousState, payload)
    default:
      break;
  }
}
