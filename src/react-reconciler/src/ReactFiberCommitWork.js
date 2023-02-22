import { appendChild, insertBefore } from "react-dom-bindings/src/ReactDOMHostConfig";
import { MutationMask, Placement } from "./ReactFiberFlags";
import { HostComponent, HostRoot, HostText } from "./ReactWorkTags";

function recursivelyTraverseMutationEffects(root, parentFiber) {
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
      insertOrAppendPlacementNode(child, parent)
      let { sibling } = child
      while (sibling !== null) {
        // 添加兄弟
        insertOrAppendPlacementNode(sibling, parent)
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
      console.log('before: ', before);
      insertOrAppendPlacementNode(finishedWork, before, parent)
      break;

    }
    case HostComponent: {
      // 获取兄弟，插在兄弟之前
      // 找到最近的弟弟
      const before = getHostSibling(finishedWork)
      console.log('before: ', before);
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
  switch (finishedWork.tag) {
    case HostRoot:
    case HostComponent:
    case HostText: {
      // 递归便利变更副作用
      // 先遍历他们的子节点，处理他们的子节点上的副作用
      recursivelyTraverseMutationEffects(root, finishedWork);
      // 再处理自己身上的副作用
      commitReconciliationEffect(finishedWork)
    }
      break;
    default:
      break
  }
}
