import { createUpdate, enqueueUpdate } from './ReactFiberClassUpdateQueue'
import { createFiberRoot } from './ReactFiberRoot'
import { requestUpdateLane, scheduleUpdateOnFiber } from './ReactFiberWorkLoop'
export function createContainer(containerInfo) {
  return createFiberRoot(containerInfo)
}
/**
 * 更新容器，把虚拟dom element变成真实dom，插入到container容器中
 * @param {*} element 虚拟dom
 * @param {*} container dom容器 FiberRootNode
 */
export function updateContainer(element, container) {
  // 获取当前的根fiber 比如RootFiber
  const current = container.current
  // 请求一个更新车道 16
  const lane = requestUpdateLane(current)
  // 创建更新
  const update = createUpdate(lane);
  // 更新的数据 虚拟dom
  update.payload = {
    element
  }
  // 把更新添加到根fiber的更新队列上,返回根节点
  const root = enqueueUpdate(current, update, lane);
  // console.log('scheduleUpdateOnFiber root: ', root);
  // 在fiber树上上调度更新
  scheduleUpdateOnFiber(root, current, lane)

}
