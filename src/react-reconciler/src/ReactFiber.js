
import { NoFlags } from './ReactFiberFlags'
import { HostRoot } from './ReactWorkTags'

/**
 *
 * @param {*} tag fiber 类型 (函数组件0 类组件1 原生组件5 根元素3)
 * @param {*} pendingProps 新属性，等待处理的属性
 * @param {*} key 唯一标识
 * @returns FiberNode
 */
function FiberNode(tag, pendingProps, key) {
  this.tag = tag
  this.key = key
  this.type = null // 类型，来自于虚拟dom节点的type （span div）
  // 每个虚拟dom--fiber节点--真实dom
  this.stateNode = null //此fiber对应的真实DOM节点 h1=>真实的h1dom

  this.return = null//指向父亲节点
  this.child = null//指向儿子节点
  this.sibling = null//指向弟弟节点

  // fiber 通过虚拟dom节点生成的，虚拟dom会提供pendingProps，用来创建fiber节点属性
  this.pendingProps = pendingProps//等待生效的属性
  this.memoizedProps = null//已经生效的属性

  // 每个fiber有自己的状态，每一种fiber存储的状态不一样
  // 类组件对应的fiber，存的是类的实例的状态，hostRoot存储的是要渲染的元素
  this.memoizedState = null

  // 每个fiber身上可能有更新队列（setState）
  this.updateQueue = null

  // 副作用标识，表示针对此fiber节点进行何种操作
  this.flags = NoFlags;
  // 子节点的副作用标识 --冒泡啥的需要
  this.subtreeFlags = NoFlags
  // 替身，轮替 双缓冲
  this.alternate = null
}
// We use a double buffering pooling technique because we know that we'll
// only ever need at most two versions of a tree. We pool the "other" unused
// node that we're free to reuse. This is lazily created to avoid allocating
// extra objects for things that are never updated. It also allow us to
// reclaim the extra memory if needed.


export function createFiber(tag, pendingProps, key) {
  return new FiberNode(tag, pendingProps, key)

}
export function createHostRootFiber() {
  return createFiber(HostRoot, null, null)
}

/**
 * 基于老的fiber和新的属性创建新的fiber
 * @param {*} current 老fiber
 * @param {*} pendingProps 新属性
 */
export function createWorkInProgress(current, pendingProps) {
  // 拿到老的轮替 开始为null
  let workInProgress = current.alternate
  // 没有的话创建新的
  if (workInProgress === null) {
    workInProgress = createFiber(current.tag, pendingProps, current.key)
    // 类型
    workInProgress.type = current.type
    // 静态dom节点
    workInProgress.stateNode = current.stateNode
    // 替身
    workInProgress.alternate = current
    current.alternate = workInProgress
  } else {
    // 有的话，更新
    workInProgress.pendingProps = pendingProps
    workInProgress.type = current.type
    workInProgress.flags = NoFlags
    workInProgress.subtreeFlags = NoFlags
  }
  // 属性拷贝
  workInProgress.child = current.child
  workInProgress.memoizedProps = current.memoizedProps
  workInProgress.memoizedState = current.memoizedState
  workInProgress.updateQueue = current.updateQueue
  workInProgress.sibling = current.sibling
  workInProgress.index = current.index
  return workInProgress
}
