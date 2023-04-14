import assign from "shared/assign";
import { enqueueConcurrentClassUpdate } from "./ReactFiberConcurrentUpdates";
import { NoLanes, isSubsetOfLanes, mergeLanes } from "./ReactFiberLane";
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
    baseState: fiber.memoizedState,
    firstBaseUpdate: null,
    lastBaseUpdate: null,
    shared: {
      // 等待生效的队列
      pending: null
    }
  }
  fiber.updateQueue = queue
}
// 创建更新
export function createUpdate(lane) {
  const update = { tag: UpdateState, lane, next: null };
  return update
}
// 入队更新
export function enqueueUpdate(fiber, update, lane) {
  // 拿到更新队列
  const updateQueue = fiber.updateQueue
  // 获取共享队列
  const sharedQueue = updateQueue.shared
  // 并发
  return enqueueConcurrentClassUpdate(fiber, sharedQueue, update, lane)


  // const updateQueue = fiber.updateQueue;
  // // 获取等待生效的队列
  // // pending指向最后一个更新，next 第一个
  // const pending = updateQueue.shared.pending;
  // if (pending === null) {
  //   // 指向自己，形成环
  //   update.next = update
  // } else {
  //   // 指向第一个
  //   update.next = pending.next;
  //   // 指向最后一个
  //   pending.next = update
  // }
  // // pending 指向最后一个更新，最后一个更新指向第一个
  // // 单向循环链表
  // updateQueue.shared.pending = update
  // // 返回根节点 从当前的fiber一直到根节点
  // // 现在还没涉及到更新优先级 当前fiber标记更新优先级冒泡到root
  // return markUpdateLaneFromFiberToRoot(fiber)

}
/**
 * 根据老状态和更新队列中的更新计算最新的状态
 * @param {*} workInProgress 要计算的fiber
 */
export function processUpdateQueue(workInProgress, nextProps, renderLanes) {
  const queue = workInProgress.updateQueue;
  //老链表头
  let firstBaseUpdate = queue.firstBaseUpdate;
  //老链表尾巴
  let lastBaseUpdate = queue.lastBaseUpdate;
  //新链表尾部
  const pendingQueue = queue.shared.pending;
  //合并新老链表为单链表
  if (pendingQueue !== null) {
    queue.shared.pending = null;
    //新链表尾部
    const lastPendingUpdate = pendingQueue;
    //新链表尾部
    const firstPendingUpdate = lastPendingUpdate.next;
    //把老链表剪断，变成单链表
    lastPendingUpdate.next = null;
    //如果没有老链表
    if (lastBaseUpdate === null) {
      //指向新的链表头
      firstBaseUpdate = firstPendingUpdate;
    } else {
      lastBaseUpdate.next = firstPendingUpdate;
    }
    lastBaseUpdate = lastPendingUpdate
  }
  //如果链表不为空firstBaseUpdate=>lastBaseUpdate
  if (firstBaseUpdate !== null) {
    //上次跳过的更新前的状态
    let newState = queue.baseState;
    //尚未执行的更新的lane
    let newLanes = NoLanes;
    let newBaseState = null;
    let newFirstBaseUpdate = null;
    let newLastBaseUpdate = null;
    let update = firstBaseUpdate;//updateA
    do {
      //获取此更新车道
      const updateLane = update.lane;
      //如果说updateLane不是renderLanes的子集的话，说明本次渲染不需要处理过个更新，就是需要跳过此更新
      if (!isSubsetOfLanes(renderLanes, updateLane)) {
        //把此更新克隆一份
        const clone = {
          id: update.id,
          lane: updateLane,
          payload: update.payload
        }
        //说明新的跳过的base链表为空,说明当前这个更新是第一个跳过的更新
        if (newLastBaseUpdate === null) {
          //让新的跳过的链表头和链表尾都指向这个第一次跳过的更新
          newFirstBaseUpdate = newLastBaseUpdate = clone;
          //计算保存新的baseState为此跳过更新时的state
          newBaseState = newState;// ""
        } else {
          newLastBaseUpdate = newLastBaseUpdate.next = clone;
        }
        //如果有跳过的更新，就把跳过的更新所在的赛道合并到newLanes,
        //最后会把newLanes赋给fiber.lanes
        newLanes = mergeLanes(newLanes, updateLane);
      } else {
        //说明已经有跳过的更新了
        if (newLastBaseUpdate !== null) {
          const clone = {
            id: update.id,
            lane: 0,
            payload: update.payload
          }
          newLastBaseUpdate = newLastBaseUpdate.next = clone;
        }
        newState = getStateFromUpdate(update, newState, nextProps);
      }
      update = update.next;
    } while (update);
    //如果没能跳过的更新的话
    if (!newLastBaseUpdate) {
      newBaseState = newState;
    }
    queue.baseState = newBaseState;
    queue.firstBaseUpdate = newFirstBaseUpdate;
    queue.lastBaseUpdate = newLastBaseUpdate;
    workInProgress.lanes = newLanes;
    //本次渲染完会判断，此fiber上还有没有不为0的lane,如果有，会再次渲染
    workInProgress.memoizedState = newState;
  }
}
/**
 * 根据老状态和更新队列中的更新，计算最新的状态
 * @param {*} workInProgress 要计算的fiber
 */
export function processUpdateQueueOld(workInProgress) {
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
    // console.log('newState: ', newState);// payload
  }

}
/**
 * state 0 1 2 3
 * 根据老状态和更新计算新状态
 * @param {*} update 更新的对象其实有很多种类型
 * @param {*} prevState 老状态
 */
function getStateFromUpdate(update, prevState, nextProps) {
  switch (update.tag) {
    // 更新状态
    case UpdateState:
      const { payload } = update;
      let partialState;
      if (typeof payload === 'function') {
        partialState = payload.call(null, prevState, nextProps);
      } else {
        partialState = payload;
      }
      return assign({}, prevState, partialState);
    default:
      break;
  }
}
// clone 更新队列
export function cloneUpdateQueue(current, workInProgress) {
  // 新的
  const workInProgressQueue = workInProgress.updateQueue
  // 老的
  const currentQueue = current.updateQueue
  // 一样的 克隆一份 判断应用地址
  if (workInProgressQueue === currentQueue) {
    // 为啥需要克隆
    const clone = {
      baseState: currentQueue.baseState,
      firstBaseState: currentQueue.firstBaseState,
      lastBaseUpdate: currentQueue.lastBaseUpdate,
      shared: currentQueue.shared,
    }
    workInProgress.updateQueue = clone
  }


}
