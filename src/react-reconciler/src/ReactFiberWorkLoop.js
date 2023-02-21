// fiber工作循环
import { scheduleCallback } from 'scheduler'
import { createWorkInProgress } from './ReactFiber'
import { beginWork } from './ReactFiberBeginWork'
import { completeWork } from './ReactFiberCompleteWork'
// 正在进行的工作
let workInProgress = null

/**
 * 计划更新root
 * 源码中此处有一个人独调度的功能
 * @param {*} root
 * @returns
 */
export function scheduleUpdateOnFiber(root) {
  // 确保调度执行root上的更新
  ensureRootIsSchedule(root)
}
// 保证调度root的更新
function ensureRootIsSchedule(root) {
  // 执行root上的并发更新工作
  // 告诉浏览器执行performConcurrentWorkOnRoot函数，参数为root
  scheduleCallback(performConcurrentWorkOnRoot.bind(null, root))

}
/**
 * 根据虚拟dom，构建fiber树，创建真实dom节点，再插入容器
 * @param {*} root
 */
function performConcurrentWorkOnRoot(root) {
  // 用同步的方式渲染根节点，初次（第一次）渲染的时候，都是同步的
  renderRootSync(root)
}
function prepareFreshStack(root) {
  // 根据老的fiber创建新的fiber
  // 注意这这里返回的是新的
  workInProgress = createWorkInProgress(root.current, null)
  // console.log('workInProgress: ', workInProgress);
}

function renderRootSync(root) {
  console.log('root: ', root);
  //开始构建fiber树 创建一个新的
  prepareFreshStack(root)
  // 工作循环同步
  workLoopSync()
}
function workLoopSync() {
  while (workInProgress !== null) {
    performUnitOfWork(workInProgress)
  }
}
/**
 * 执行工作单元
 * @param {*} unitOfWork
 */
function performUnitOfWork(unitOfWork) {
  // console.log('unitOfWork: ', unitOfWork);
  //获取新fiber对应的老fiber
  const current = unitOfWork.alternate
  // 完成当前fiber的子fiber链表构建后
  // current老fiber->unitOfWork新fiber
  const next = beginWork(current, unitOfWork)
  // 属性拷贝，把等待生效的变为已经生效的
  unitOfWork.memorizedProps = unitOfWork.pendingProps
  if (next === null) {
    // workInProgress = null
    // 意味着没有子节点，当前fiber结束，已经完成了，完成工作单元
    // console.log('unitOfWork null: ', unitOfWork);
    completeUnitOfWork(unitOfWork)
  } else {
    // 有子节点，让子节点成为下一个工作单元
    workInProgress = next
  }

}

function completeUnitOfWork(unitOfWork) {
  let completedWork = unitOfWork
  // hello完成
  do {
    // 老的
    const current = completedWork.alternate
    const returnFiber = completedWork.return
    // 执行此fiber的完成工作。原生组件--创建真实dom节点
    completeWork(current, completedWork)
    const siblingFiber = completedWork.sibling
    // 有弟弟 构建弟弟的fiber子链表
    if (siblingFiber !== null) {
      workInProgress = siblingFiber
      return
    }
    // 没有弟弟 说明这就是最后节点，当前完成的就是父fiber的最后节点
    // 也就是说一个父fiber的所有子fiber全部完成
    // 父fiber也该完成了
    completedWork = returnFiber
    workInProgress = completedWork
  } while (completedWork !== null)
}
