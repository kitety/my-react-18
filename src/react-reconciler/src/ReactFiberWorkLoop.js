// fiber工作循环
import { scheduleCallback } from 'scheduler'
import { createWorkInProgress } from './ReactFiber'
import { beginWork } from './ReactFiberBeginWork'
import { commitLayoutEffect, commitMutationEffectsOnFiber, commitPassiveMountEffects, commitPassiveUnmountEffects } from './ReactFiberCommitWork'
import { completeWork } from './ReactFiberCompleteWork'
import { finishQueuingConcurrentUpdates } from './ReactFiberConcurrentUpdates'
import { ChildDeletion, MutationMask, NoFlags, Passive, Placement, Update } from './ReactFiberFlags'
import { FunctionComponent, HostComponent, HostRoot, HostText } from './ReactWorkTags'
// 正在进行的工作
let workInProgress = null
let workInProgressRoot = null
// 此根节点上有没有useEffect类型的副作用
let rootDoseHasPassiveEffect = false
let rootWithPendingPassiveEffects = null// 具有useEffect类型的副作用的根节点 fiberRootNode

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
// 宏任务，不会立刻执行
function ensureRootIsSchedule(root) {
  if (workInProgressRoot) {
    return
  }
  workInProgressRoot = root
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
  // 开始提交，就是执行副作用，修改真实dom
  // alternate
  // 完成的工作，最新构建的fiber树
  const finishedWork = root.current.alternate
  root.finishedWork = finishedWork
  commitRoot(root)
  workInProgressRoot = null
}
//
function flushPassiveEffect() {
  if (rootWithPendingPassiveEffects !== null) {
    const root = rootWithPendingPassiveEffects
    // 执行卸载副作用
    commitPassiveUnmountEffects(root.current)
    // 执行挂载副作用
    commitPassiveMountEffects(root, root.current)
  }
}
function commitRoot(root) {
  printFinishedWork(root.finishedWork)
  // 拿到完成的工作
  // finishedWork就是刚才构建的fiber树的 根节点
  const { finishedWork } = root
  if (((finishedWork.subtreeFlags & Passive) !== NoFlags) || ((finishedWork.flags & Passive) !== NoFlags)) {
    // 自己有副作用或者孩子有副作用
    // 标记变量
    if (!rootDoseHasPassiveEffect) {
      rootDoseHasPassiveEffect = true
      // 刷新副作用
      // 开启下一个宏任务，在绘制之后执行
      scheduleCallback(flushPassiveEffect)
    }

  }
  // console.log('finishedWork: ', finishedWork);
  // 更新 插入 有flags
  // 判断子树有没有副作用
  const subtreeHasEffects = (finishedWork.subtreeFlags & MutationMask) !== NoFlags
  const rootHasEffects = (finishedWork.flags & MutationMask) !== NoFlags
  // 如果子树或自己有副作用，就提交
  if (subtreeHasEffects || rootHasEffects) {
    // 有flags，说明有更新，需要插入
    // 在fiber上变更操作的副作用
    // dom执行变动之后，root.current指向新的fiber树
    commitMutationEffectsOnFiber(finishedWork, root)
    // 执行useEffectLayout
    commitLayoutEffect(finishedWork, root)
    if (rootDoseHasPassiveEffect) {
      rootDoseHasPassiveEffect = false
      rootWithPendingPassiveEffects = root
    }

  }
  // dom变更后，root current 指向新的fiber树
  root.current = finishedWork
}
function prepareFreshStack(root) {
  // 根据老的fiber创建新的fiber
  // 注意这这里返回的是新的
  workInProgress = createWorkInProgress(root.current, null)
  // console.log('workInProgress: ', workInProgress);
  // 完成并发队列更新 完成收集
  finishQueuingConcurrentUpdates()
}

function renderRootSync(root) {
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
  unitOfWork.memoizedProps = unitOfWork.pendingProps
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

function printFinishedWork(fiber) {
  const { flags, deletions } = fiber
  if (flags & ChildDeletion) {
    fiber.flags &= (~ChildDeletion)
    const str = '子节点删除' + deletions.map(fiber => `${fiber.type}#${fiber.memoizedProps.id}`).join()
    console.log(str);
  }
  let child = fiber.child
  while (child !== null) {
    printFinishedWork(child)
    child = child.sibling
  }
  if (fiber.flags !== NoFlags) {
    console.log(getFlags(fiber), getTag(fiber.tag), typeof fiber.type === 'function' ? fiber.type.name : fiber.type, fiber.memoizedProps)
  }
}
function getFlags(fiber) {
  const { flags, deletions } = fiber

  if (flags === (Placement | Update)) {
    return '移动'
  }
  if (flags === Placement) {
    return '插入'
  }
  if (flags === Update) {
    return '更新'
  }
  if (flags === ChildDeletion) {
    return '子节点删除' + deletions.map(fiber => `${fiber.type}#${fiber.memoizedProps.id}`).join()
  }

  return flags
}

function getTag(tag) {
  switch (tag) {
    case FunctionComponent:
      return 'FunctionComponent'
    case HostRoot:
      return 'HostRoot'
    case HostComponent:
      return 'HostComponent'
    case HostText:
      return 'HostText'
    default:
      break
  }
}
