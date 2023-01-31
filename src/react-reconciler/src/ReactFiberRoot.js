import { createHostRootFiber } from './ReactFiber'

// 本质就是一个真实dom节点，稍微包装了
function FiberRootNode(containerInfo) {
  this.containerInfo = containerInfo;// div#root
}
// 创建fiber的根
export function createFiberRoot(containerInfo) {
  // fiber的根结点
  const root = new FiberRootNode(containerInfo)
  // 根fiber，HostRoot就是根节点div#root
  // 未初始化的fiber
  const uninitializedFiber = createHostRootFiber()

  // 双向指向，当前的fiber树，根容器的current指向当前的根fiber，第一个fiber
  root.current = uninitializedFiber;
  // 对应的dom节点，根fiber的stateNode，指向FiberRootNode
  uninitializedFiber.stateNode = root
  return root
}
