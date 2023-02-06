import { createUpdate, enqueueUpdate } from './ReactFiberClassUpdateQueue'
import { createFiberRoot } from './ReactFiberRoot'
import { scheduleUpdateOnFiber } from './ReactFiberWorkLoop'
export function createContainer(containerInfo) {
  return createFiberRoot(containerInfo)
}
/**
 * 更新容器，把虚拟dom element变成真实dom，插入到container容器中
 * @param {*} element 虚拟dom
 * @param {*} container dom容器 FiberRootNode
 */
export function updateContainer(element, container) {
  // 获取当前的根fiber FiberNode
  const current = container.current
  // 创建更新
  const update = createUpdate();
  // 更新的数据 虚拟dom
  update.payload = {
    element
  }
  // 把更新添加到根fiber的更新队列上,返回根节点
  const root = enqueueUpdate(current, update);
  // console.log('root: ', root);
  // 在fiber上调度更新
  scheduleUpdateOnFiber(current)

}
