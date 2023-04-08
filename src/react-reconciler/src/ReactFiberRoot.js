import { createHostRootFiber } from './ReactFiber';
import { initialUpdateQueue } from './ReactFiberClassUpdateQueue';
import { NoLanes } from './ReactFiberLane';

// 本质就是一个真实dom节点，稍微包装了
function FiberRootNode(containerInfo) {
  this.containerInfo = containerInfo;// div#root
  // 此根上有哪些赛道等待被处理
  this.pendingLanes = NoLanes
}
// 创建fiber的根
export function createFiberRoot(containerInfo) {
  // fiber的根结点
  const root = new FiberRootNode(containerInfo)
  // 根fiber，HostRoot就是根节点div#root
  // 未初始化的fiber
  const uninitializedFiber = createHostRootFiber()

  // 双向指向
  // 当前的fiber树，根容器的current指向当前的根fiber，第一个fiber
  // 指的是当前根容器他的现在正在显示或者已经渲染好的fiber树
  root.current = uninitializedFiber;
  // 对应的dom节点，根fiber的stateNode，指向FiberRootNode
  uninitializedFiber.stateNode = root
  initialUpdateQueue(uninitializedFiber)

  return root
}
