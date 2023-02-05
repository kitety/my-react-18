import { HostRoot } from './ReactWorkTags'

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
