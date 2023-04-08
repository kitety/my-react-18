import { HostRoot } from './ReactWorkTags';
//  更新队列缓存
const concurrentQueues = [];
// 并发队列索引
let concurrentQueuesIndex = 0

/**
 * 把更新放在更新队列里面
 * 根fiber的更新{payload:<h1/>}
 *
 * 函数组件的更新
 * 函数组件fiber的memoizedState=hook链表头=updateQueue{action:更新函数state=>state+'A'}
 */
export function finishQueuingConcurrentUpdates() {
  // 缓存索引
  const endIndex = concurrentQueuesIndex

  concurrentQueuesIndex = 0
  let i = 0;
  // 拿到之前存的数据
  // 引用类型，这一次就拿到全部的数据
  while (i < endIndex) {
    const fiber = concurrentQueues[i++] // 函数组件对应的fiber
    const queue = concurrentQueues[i++] //要更新的hook对应的更新的队列
    const update = concurrentQueues[i++] ///更新对象
    const lane = concurrentQueues[i++] ///lane
    if (queue !== null && update !== null) {
      // 拿到数据
      const pending = queue.pending
      // 构成循环链表
      if (pending === null) {
        // 第一次
        update.next = update
      } else {
        // 第二次 就是环断开
        update.next = pending.next
        pending.next = update
      }
      // pending指向最后面的update
      queue.pending = update


    }
  }
}

/**
 * 把更新对象添加到更新队列中
 * @param {*} fiber 函数组件对应的fiber
 * @param {*} queue 要更新的hook对应的更新的队列
 * @param {*} update 更新对象
 */
export function enqueueConcurrentHookUpdate(fiber, queue, update, lane) {
  enqueueUpdate(fiber, queue, update, lane)
  // 从fiber找到根
  return getRootForUpdatedFiber(fiber)
}
// 从fiber找到根
function getRootForUpdatedFiber(sourceFiber) {
  let node = sourceFiber
  let parent = sourceFiber.return
  while (parent !== null) {
    node = parent
    parent = parent.return
  }
  // 根节点 fiberRootNode div#root
  return node.tag === HostRoot ? node.stateNode : null
}
// 入队
/**
 * 把更新先缓存到concurrentQueue数组中
 * @param {*} fiber
 * @param {*} queue
 * @param {*} update
 */
function enqueueUpdate(fiber, queue, update, lane) {
  // 012 setNumber1  345 setNumber2  678 setNumber3
  // 三个一组缓存
  concurrentQueues[concurrentQueuesIndex++] = fiber// 函数组件对应的fiber
  concurrentQueues[concurrentQueuesIndex++] = queue//要更新的hook对应的更新的队列
  concurrentQueues[concurrentQueuesIndex++] = update//更新对象
  concurrentQueues[concurrentQueuesIndex++] = lane//lane

}
/*
 * 本来此文件要处理更新优先级的问题
 * 目前只实现向上找到根节点
*/
export function markUpdateLaneFromFiberToRoot(sourceFiber) {
  // 当前fiber
  let node = sourceFiber;
  // 当前fiber父节点
  let parent = sourceFiber.return
  while (parent !== null) {
    node = parent
    parent = parent.return
  }
  // 一直找到parent为null
  if (node.tag === HostRoot) {
    // FiberRootNode
    return node.stateNode
  }
  return null
}

/**
 * 并发，把更新入队
 * @param {*} fiber 入队的fiber 根fiber
 * @param {*} queue sharedQueue 待生效的队列
 * @param {*} update 更新
 * @param {*} lane 更新车道
 */
export function enqueueConcurrentClassUpdate(fiber, queue, update, lane) {
  enqueueUpdate(fiber, queue, update, lane)
  // 从fiber找到根
  return getRootForUpdatedFiber(fiber)
}

