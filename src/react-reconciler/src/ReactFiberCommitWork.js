import { appendChild, commitUpdate, insertBefore, removeChild } from "react-dom-bindings/src/ReactDOMHostConfig";
import { MutationMask, Passive, Placement, Update } from "./ReactFiberFlags";
import { FunctionComponent, HostComponent, HostRoot, HostText } from "./ReactWorkTags";
import { HasEffect as HookHasEffect, Passive as HookPassive } from './ReactHookEffectTags'

// 真实节点的父亲 方便删除
let hostParent = null
/**
 * 提交删除副作用
 * @param {*} root 根节点
 * @param {*} parentFiber 父fiber
 * @param {*} childToDelete 删除的fiber
 */
function commitDeletionEffect(root, parentFiber, childToDelete) {
  let parent = parentFiber
  // 一直找，找到真实节点为止
  findParent: while (parent !== null) {
    switch (parent.tag) {
      case HostComponent:
        // 原生节点
        hostParent = parent.stateNode
        break findParent;

      case HostRoot:
        // 根节点
        hostParent = parent.stateNode.containerInfo
        break findParent;

      default:
        break;
    }
    parent = parent.return
  }
  commitDeletionEffectsOnFiber(root, parentFiber, childToDelete)
  hostParent = null
}
/**
 * 递归遍历删除effects
 * @param {*} finishedRoot 根
 * @param {*} nearestMountAncestor 父fiber
 * @param {*} deleteFiber 删除的fiber
 */
function recursivelyTraverseDeletionEffects(finishedRoot, nearestMountAncestor, parent) {
  let child = parent.child
  while (child !== null) {
    commitDeletionEffectsOnFiber(finishedRoot, nearestMountAncestor, child)
    child = child.sibling

  }
}
/**
 * 递归 有儿子先删除儿子的
 * @param {*} finishedRoot 根节点
 * @param {*} nearestMountAncestor 最近的挂载祖先
 * @param {*} childToDelete 删除的fiber
 */
function commitDeletionEffectsOnFiber(finishedRoot, nearestMountAncestor, deleteFiber) {
  switch (deleteFiber.tag) {
    // 原生和文本，可以直接删除
    case HostComponent:
    case HostText: {
      //向下递归 因为函数组件没有dom结构
      // 遍历执行子节点的删除
      // 当删除节点的时候，先删除子节点
      recursivelyTraverseDeletionEffects(finishedRoot, nearestMountAncestor, deleteFiber)
      // 再把自己删除
      if (hostParent !== null) {
        removeChild(hostParent, deleteFiber.stateNode)
      }
    }

      break;

    default:
      break;
  }
}

/**
 * 递归的循环遍历更改副作用
 * @param {*} root 根节点
 * @param {*} parentFiber 父fiber
 */
function recursivelyTraverseMutationEffects(root, parentFiber) {
  //先处理删除
  const deletions = parentFiber.deletions
  parentFiber.deletions = null
  if (deletions !== null) {
    // 有需要删除的子fiber
    for (let i = 0; i < deletions.length; i++) {
      const childToDelete = deletions[i];
      commitDeletionEffect(root, parentFiber, childToDelete)
    }
  }
  // 再去处理子节点
  if (parentFiber.subtreeFlags & MutationMask) {
    // 处理子fiber
    let { child } = parentFiber

    while (child !== null) {
      // 递归处理子fiber
      commitMutationEffectsOnFiber(child, root)
      child = child.sibling
    }
  }
}
function commitReconciliationEffect(finishedWork) {
  const { flags } = finishedWork
  // 执行插入操作
  if (flags & Placement) {
    // 执行插入操作，把此fiber对应的真实dom节点插入到父真实dom节点中
    commitPlacement(finishedWork)
    // 取反 去掉 Placement，把flags上的Placement标记去掉
    finishedWork.flags &= ~Placement
  }
}
//
function isHostParent(parent) {
  // 真实的只能是根和真实dom节点
  return parent.tag === HostComponent || parent.tag === HostRoot //div#root
}
/**
 * 找到有真实dom节点的父亲fiber
 * @param {*} fiber
 */
function getHostParentFiber(fiber) {
  let parent = fiber.return
  while (parent !== null) {
    if (isHostParent(parent)) {
      return parent
    }
    parent = parent.return
  }
  return parent

}

/**
 * 把子节点对应的真实dom插入到父真实dom中
 * 插入或者追加插入节点
 * @param {*} node 将要插入的fiber节点
 * @param {*} parent 父亲的真实dom节点
 */
function insertOrAppendPlacementNode(node, before, parent) {
  const { tag } = node
  // 是不是fiber节点原生和文本
  const isHost = tag === HostComponent || tag === HostText
  if (isHost) {
    const { stateNode } = node
    if (before) {
      // 插入在parent的孩子before前面插入stateNode
      insertBefore(parent, stateNode, before)
    } else {
      // 没有就在最后
      appendChild(parent, stateNode)

    }
  } else {
    // 不是原生 文本
    const { child } = node
    if (child !== null) {
      // 添加大儿子
      insertOrAppendPlacementNode(child, before, parent)
      let { sibling } = child
      while (sibling !== null) {
        // 添加兄弟
        insertOrAppendPlacementNode(sibling, before, parent)
        // 兄弟的兄弟
        sibling = sibling.sibling
      }
    }
  }

}
/**
 * 找到要插入的锚点，
 * 找到可以插在它前面的fiber的真实dom
 * @param {*} fiber
 */
function getHostSibling(fiber) {
  let node = fiber
  siblings: while (true) {
    while (node.sibling === null) {
      // return或者原生节点
      if (node.return === null || isHostParent(node.return)) {
        return null
      }
      node = node.return
    }
    node = node.sibling
    // 如果弟弟不是原生节点，也不是文本节点
    while (node.tag !== HostComponent && node.tag !== HostText) {
      // 如果子节点是个要插入的新节点，就找弟弟
      if (node.flags & Placement) {
        continue siblings
      } else {
        node = node.child
      }
    }
    //  不是插入的节点，就返回真实dom
    if (!(node.flags & Placement)) {
      return node.stateNode
    }
  }

}

/**
 * 把此fiber的真实dom，插入到父亲dom里
 * @param {*} finishedWork
 */
function commitPlacement(finishedWork) {
  // 父亲添加儿子
  // let parentFiber = finishedWork.return
  // parentFiber.stateNode.appendChild(finishedWork.stateNode)
  // fixed

  // 不能找父亲fiber，而是找有真实dom节点的父亲fiber
  const parentFiber = getHostParentFiber(finishedWork)

  switch (parentFiber.tag) {
    case HostRoot: {
      const parent = parentFiber.stateNode.containerInfo
      // 获取兄弟，插在兄弟之前
      // 找到最近的弟弟
      const before = getHostSibling(finishedWork)
      insertOrAppendPlacementNode(finishedWork, before, parent)
      break;

    }
    case HostComponent: {
      // 获取兄弟，插在兄弟之前
      // 找到最近的弟弟
      const parent = parentFiber.stateNode

      const before = getHostSibling(finishedWork)

      insertOrAppendPlacementNode(finishedWork, before, parent)
      break

    }

    default:
      break;
  }


}
/**
 * 遍历fiber树，执行副作用
 * @param {*} finishedWork fiber节点
 * @param {*} root 根
 */
export function commitMutationEffectsOnFiber(finishedWork, root) {
  // 拿到当前fiber的老fiber
  const current = finishedWork.alternate
  // 副作用
  const flags = finishedWork.flags

  switch (finishedWork.tag) {
    case FunctionComponent:
    case HostRoot:
    case HostText: {
      // 递归便利变更副作用
      // 先遍历他们的子节点，处理他们的子节点上的副作用
      recursivelyTraverseMutationEffects(root, finishedWork);
      // 再处理自己身上的副作用
      commitReconciliationEffect(finishedWork)
    }
      break;
    case HostComponent: {
      // 递归便利变更副作用
      // 先遍历他们的子节点，处理他们的子节点上的副作用
      recursivelyTraverseMutationEffects(root, finishedWork);
      // 再处理自己身上的副作用
      commitReconciliationEffect(finishedWork)
      // 处理dom更新
      // 有更新的话
      if (flags & Update) {
        const instance = finishedWork.stateNode
        if (instance !== null) {
          // dom元素存在 更新他
          const newProps = finishedWork.memoizedProps
          const oldProps = current !== null ? current.memoizedProps : newProps
          const type = finishedWork.type
          const updatePayload = finishedWork.updateQueue
          finishedWork.updateQueue = null
          if (updatePayload) {
            // 提交更新
            commitUpdate(instance, updatePayload, type, oldProps, newProps, finishedWork)
          }

        }
      }
    }
      break
    default:
      break
  }
}
// 执行卸载副作用
export function commitPassiveUnmountEffects(finishedWork) {

}
// 执行挂载副作用
export function commitPassiveMountEffects(root, finishedWork) {
  commitPassiveMountOnFiber(root, finishedWork)
}
function commitPassiveMountOnFiber(finishedRoot, finishedWork) {
  const flags = finishedWork.flags
  switch (finishedWork.tag) {
    case HostRoot: {
      // 逐渐的遍历子节点
      recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork)
      break
    }
    case FunctionComponent: {
      // 函数组件
      recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork)
      if (Passive & flags) {//1024
        // 执行副作用
        commitHookPassiveMountEffect(finishedWork, HookPassive | HookHasEffect)
      }
      break
    }
    default:
      break;
  }
}
function recursivelyTraversePassiveMountEffects(root, parentFiber) {
  if (parentFiber.subtreeFlags & Passive) {
    // 递归遍历子节点
    let child = parentFiber.child
    while (child !== null) {
      commitPassiveMountOnFiber(root, child)
      child = child.sibling
    }
  }
}

function commitHookPassiveMountEffect(finishedWork, hookFlags) {
  commitHookEffectListMount(hookFlags, finishedWork)
}

function commitHookEffectListMount(flags, finishedWork) {
  const updateQueue = finishedWork.updateQueue
  const lastEffect = updateQueue !== null ? updateQueue.lastEffect : null
  if (lastEffect !== null) {
    // 指向最后一个，拿到第一个
    const firstEffect = lastEffect.next
    let effect = firstEffect
    do {
      // 有这个tag
      if ((effect.tag & flags) === flags) {
        // Unmount
        const create = effect.create
        // 指向create，返回值是destroy
        effect.destroy = create()
      }
      effect = effect.next
    } while (effect !== firstEffect);
  }
}
