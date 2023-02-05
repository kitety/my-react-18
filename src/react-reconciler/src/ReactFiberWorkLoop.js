// fiber工作循环
import { scheduleCallback } from 'scheduler'
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
  console.log('root: ', root);
  // 用同步的方式渲染根节点，初次（第一次）渲染的时候，都是同步的
  renderRootSync(root)
}
function renderRootSync(root) {
  //开始构建fiber树
}
