import { markUpdateLaneFromFiberToRoot } from "./ReactFiberConcurrentUpdates";

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
  const update = {};
  return update
}
// 入队更新
export function enqueueUpdate(fiber, update) {
  const updateQueue = fiber.updateQueue;
  // 获取等待生效的队列
  // pending指向最后一个更新，next 第一个
  const pending = updateQueue.shared.pending;
  if (pending === null) {
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
