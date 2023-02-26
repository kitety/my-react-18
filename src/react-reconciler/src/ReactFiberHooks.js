import ReactSharedInternals from "shared/ReactSharedInternals"
import { enqueueConcurrentHookUpdate } from "./ReactFiberConcurrentUpdates"
import { scheduleUpdateOnFiber } from "./ReactFiberWorkLoop"
// 当前正在渲染中的fiber
let currentlyRenderingFiber = null
// 当前正在使用中的hook
let workInProgressHook = null
// 当前hook对应的老的hook
let currentHook = null
const { ReactCurrentDispatcher } = ReactSharedInternals
const HooksDispatcherOnMount = {
  // useReducer 挂载和更新的逻辑不一样的
  useReducer: mountReducer// 挂载reducer
}
const HooksDispatcherOnUpdate = {
  useReducer: updateReducer
}
function updateReducer(reducer) {
  // 获取新的hook
  const hook = updateWorkInProcessHook()
  // 获取新的hook的更新队列
  const queue = hook.queue
  // 老的hook
  const current = currentHook

  //重要是更新 基于老状态和更新队列，计算新状态
  // 获取将要生效的更新队列
  const pendingQueue = queue.pending
  // 先去初始化一个新状态,取值为当前的状态
  let newState = current.memoizedState // 0 老hook的状态
  // 循环
  if (pendingQueue !== null) {
    queue.pending = null
    const firstUpdate = pendingQueue.next;
    let update = firstUpdate;
    do {
      const action = update.action
      // 计算
      newState = reducer(newState, action)
      update = update.next
    } while (update !== null && update !== firstUpdate);
  }
  hook.memoizedState = newState
  console.log('newState: ', newState);
  return [hook.memoizedState, queue.dispatch]

}
/**
 * 构建新的hook
 */
function updateWorkInProcessHook() {
  // 获取将要构建的新的hook的老hook
  if (currentHook === null) {
    // 当前的第一个hook
    // 拿到老的fiber
    const current = currentlyRenderingFiber.alternate
    currentHook = current.memoizedState
  } else {
    currentHook = currentHook.next
  }
  // 根据老hook创建新hook 状态和队列取回来
  const newHook = {
    memoizedState: currentHook.memoizedState,
    queue: currentHook.queue,
    next: null
  }
  // 如果为空的话就赋值
  if (workInProgressHook === null) {
    // 第一个hook
    currentlyRenderingFiber.memoizedState = workInProgressHook = newHook
  } else {
    // 单向链表
    workInProgressHook = workInProgressHook.next = newHook
  }
  return workInProgressHook

}

function mountReducer(reducer, initialArgs) {
  const hook = mountWorkInProcessHook()
  hook.memoizedState = initialArgs
  const queue = {
    pending: null,
    dispatch: null,
  }
  // 队列
  hook.queue = queue
  const dispatch = (queue.dispatch = dispatchReducerAction.bind(null, currentlyRenderingFiber, queue))
  return [hook.memoizedState, dispatch]
}
/**
 * 执行派发动作的方法，更新状态，并且界面重新更新
 * @param {*} fiber function对应的fiber
 * @param {*} queue hook的更新队列
 * @param {*} action 派发的动作
 */
function dispatchReducerAction(fiber, queue, action) {
  console.log('fiber, queue, action: ', fiber, queue, action);
  // 在每个hook里面会放一个哦更新队列，更新队列是一个更新对象的循环链表 update.next=u2 u2.next=u1
  // 更新逻辑
  const update = {
    action,// { type: "increment" }
    next: null
  }
  // 调度的根
  // 入队并发hook更新
  // 把当前最新的更新添加到更新队列里面，并且返回当前的根fiber
  const root = enqueueConcurrentHookUpdate(fiber, queue, update)
  scheduleUpdateOnFiber(root)
}

/**
 * 挂载构建中的hook
 */
function mountWorkInProcessHook() {
  const hook = {
    memoizedState: null,// hook状态
    queue: null,// 存放本hook的更新队列，queue.pending=update的循环链表
    next: null,// 下一个hook，一个函数里面可能有很多hook，很多hook组成单项链表 h1-h2-h3
  }
  // 函数中的第一个hook
  if (workInProgressHook === null) {
    // 临时用workInProgress存储hook
    // 当前函数对应的fiber的状态，等于第一个hook对象   链表头
    currentlyRenderingFiber.memoizedState = workInProgressHook = hook
    // 不同类型的fiber存储的东西就是不一样的，函数组件存储的是hook 单链表
    // 根组件存储的是子虚拟dom
    // 原生组件存的是。。。
  } else {
    // 不是第一个 单项链表
    workInProgressHook.next = hook // 上一个的next指向当前的hook
    workInProgressHook = hook // 当前的hook变成上一个，workInProgressHook指向最新的，最后一个
    // 等价
    // workInProgressHook = workInProgressHook.next = hook
  }
  return workInProgressHook
}

/**
 * 渲染函数组件，支持hooks
 * @param {*} current 老fiber
 * @param {*} workInProgress 新fiber
 * @param {*} Component 组件定义
 * @param {*} props 参数
 * @returns 虚拟dom或者说React元素
 */
export function renderWithHooks(current, workInProgress, Component, props) {
  console.log('current: ', current);
  currentlyRenderingFiber = workInProgress// function 对应的fiber
  // 有老的fiber和老的hook链表，就是更新的逻辑
  if (current !== null && current.memoizedState !== null) {
    ReactCurrentDispatcher.current = HooksDispatcherOnUpdate//在更新阶段的hooks

  } else {
    ReactCurrentDispatcher.current = HooksDispatcherOnMount//在挂载阶段的hooks

  }
  // 支持hooks
  // 在函数组件执行前给ReactSharedInternals赋值
  // 执行前赋值
  const children = Component(props)
  // 清空
  currentlyRenderingFiber = null
  workInProgressHook = null
  return children
}
