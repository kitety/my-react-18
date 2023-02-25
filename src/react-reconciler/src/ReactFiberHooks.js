import ReactSharedInternals from "shared/ReactSharedInternals"

const { ReactCurrentDispatcher } = ReactSharedInternals
const HooksDispatcherOnMount = {
  // useReducer 挂载和更新的逻辑不一样的
  useReducer: mountReducer// 挂载reducer
}
// 当前正在渲染中的fiber
let currentRenderingFiber = null
// 当前正在使用中的hook
let workInProgressHook = null

function mountReducer(reducer, initialArgs) {
  const hook = mountWorkInProcessHook()
  hook.memoizedState = initialArgs
  const queue = {
    pending: null
  }
  // 队列
  hook.queue = queue
  const dispatch = dispatchReducerAction.bind(null, currentRenderingFiber, queue)
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
    currentRenderingFiber.memorizedState = workInProgressHook = hook
    // 不同类型的fiber存储的东西就是不一样的，函数组件存储的是hook 单链表
    // 根组件存储的是子虚拟dom
    // 原生组件存的是。。。
  } else {
    // 不是第一个 单项链表
    workInProgressHook.next = hook // 上一个的next指向当前的hook
    workInProgressHook = hook // 当前的hook变成上一个，workInProgressHook指向最新的，最后一个
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
  currentRenderingFiber = workInProgress// function 对应的fiber
  // 支持hooks
  // 在函数组件执行前给ReactSharedInternals赋值
  // 执行前赋值
  ReactCurrentDispatcher.current = HooksDispatcherOnMount//在挂载阶段的hooks
  const children = Component(props)
  return children
}
