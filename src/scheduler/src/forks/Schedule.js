import { IdlePriority, ImmediatePriority, LowPriority, NormalPriority, UserBlockingPriority } from "../SchedulerPriorities";
import { peak, pop, push } from "./SchedulerMinHeap";

// 任务id计数器
let taskIdCounter = 1;
// 任务最小堆
const taskQueue = [];
let scheduleHostCallback = null
// 开始执行任务时间
let startTime = -1
let currentTask = null
// 帧的间隔时间 每帧申请5毫秒时间
// 5毫秒时间没有完成，也会将控制权还给浏览器
const frameInterval = 5
const channel = new MessageChannel()
const port1 = channel.port1
const port2 = channel.port2
// 监听到就执行
port1.onmessage = performWorkUntilDeadline
function getCurrentTime() {
  return performance.now()
}
// Max 31 bit integer. The max integer size in V8 for 32-bit systems.
// Math.pow(2, 30) - 1
// 0b111111111111111111111111111111
var maxSigned31BitInt = 1073741823;

// Times out immediately 立刻过期
var IMMEDIATE_PRIORITY_TIMEOUT = -1;
// Eventually times out 用户阻塞优先级
var USER_BLOCKING_PRIORITY_TIMEOUT = 250;
// 正常优先级的时间
var NORMAL_PRIORITY_TIMEOUT = 5000;
// 低优先级的时间
var LOW_PRIORITY_TIMEOUT = 10000;
// Never times out 空闲优先级的超时时间
var IDLE_PRIORITY_TIMEOUT = maxSigned31BitInt;

/**
 *
 * @param {*} priorityLevel 优先级级别
 * @param {*} callback 回调
 * 优先级高的任务会优先执行，但是有超时时间
 */
function scheduleCallback(priorityLevel, callback) {
  const currentTime = getCurrentTime()
  // 此任务的开始时间
  const startTime = currentTime
  // 超时时间
  let timeout
  switch (priorityLevel) {
    case ImmediatePriority:
      timeout = IMMEDIATE_PRIORITY_TIMEOUT;
      break;
    case UserBlockingPriority:
      timeout = USER_BLOCKING_PRIORITY_TIMEOUT;
      break;
    case IdlePriority:
      timeout = IDLE_PRIORITY_TIMEOUT;
      break;
    case LowPriority:
      timeout = LOW_PRIORITY_TIMEOUT;
      break;
    case NormalPriority:
    default:
      timeout = NORMAL_PRIORITY_TIMEOUT;
      break;
  }
  // 过期时间
  const expirationTime = startTime + timeout
  const newTask = {
    id: taskIdCounter++,
    callback,// 回调函数
    priorityLevel,// 优先级
    startTime,// 开始时间
    expirationTime,// 过期时间
    sortIndex: expirationTime,// 排序依据 过去时间
  }
  // 最小堆添加任务 排序依据是过期时间
  push(taskQueue, newTask)
  // flushWork 执行任务，刷新任务，司机接人
  requestHostCallback(flushWork)
  return newTask
}
// 刷新工作
/**
 * 开始执行队列中的任务
 * @param {*} startTime
 */
function flushWork(startTime) {
  return workLoop(startTime)

}
// 是否放弃执行
function shouldYieldToHost() {
  // 当前时间剪去开始的时间就是流逝的时间
  const timeElapsed = getCurrentTime() - startTime
  // 小于5毫秒，就继续执行，
  if (timeElapsed < frameInterval) {
    // 时间片到期
    return false
  }
  // 大于5ms 就放弃执行
  return true

}
// 工作循环
function workLoop(startTime) {
  let currentTime = startTime
  // 取出优先级最高的任务 局长
  currentTask = peak(taskQueue)
  while (currentTask !== null) {
    //如果此任务的过期时间大于当前时间，没有过期，但是没有时间了，就放弃执行
    if (currentTask.expirationTime > currentTime && shouldYieldToHost()) {
      // 跳出
      break
    }
    //取出当前任务的回调函数 performConcurrentWorkOnRoot
    const callback = currentTask.callback
    // 是函数才执行
    if (typeof callback === 'function') {
      currentTask.callback = null
      // 执行工作
      // 返回：null | 返回继续执行的回调（当前工作没完成）
      const didUserCallbackTimeout = currentTask.expirationTime <= currentTime
      const continuationCallback = callback(didUserCallbackTimeout)
      if (typeof continuationCallback === 'function') {
        // 返回一个需要继续执行的函数，表示还没结束
        currentTask.callback = continuationCallback
        // 还有任务要执行
        return true
      }
      // 如果任务已经完成，就不需要执行，弹出任务
      if (currentTask === peak(taskQueue)) {
        pop(taskQueue)
      }

    } else {
      pop(taskQueue)
    }
    // 取出下一个任务
    currentTask = peak(taskQueue)

  }
  // 循环结束还有未完成的任务 hasMoreWork为true
  if (currentTask !== null) {
    return true
  }
  // 没有任何要完成的任务了
  return false

}
// 请求原生callback
function requestHostCallback(flushWork) {
  // 缓存回调函数
  scheduleHostCallback = flushWork
  // MessageChannel 来触发的
  // 执行工作直到截止时间
  schedulePerformWorkUntilDeadline()
}
function schedulePerformWorkUntilDeadline() {
  port2.postMessage(null)
}
// 执行工作直到过期
function performWorkUntilDeadline() {
  if (scheduleHostCallback) {
    // 先获取开始执行任务时间 相对时间
    startTime = getCurrentTime()
    // 是否有更多的工作
    let hasMoreWork = true
    try {
      // 执行flushWork 判断有没有返回值
      hasMoreWork = scheduleHostCallback(startTime)
    } finally {
      // 如果有更多的工作，继续执行
      if (hasMoreWork) {
        // 递归调用 继续执行 但是要重新申请时间，这样的话就进入下个循环里面
        schedulePerformWorkUntilDeadline()
      } else {
        // 清空
        scheduleHostCallback = null
      }
    }
  }

}

export {
  scheduleCallback as unstable_scheduleCallback,
  shouldYieldToHost as shouldYield,
  IdlePriority as unstable_IdlePriority,
  ImmediatePriority as unstable_ImmediatePriority,
  LowPriority as unstable_LowPriority,
  NormalPriority as unstable_NormalPriority,
  UserBlockingPriority as unstable_UserBlockingPriority,
};

