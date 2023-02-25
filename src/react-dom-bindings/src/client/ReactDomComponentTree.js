const randomKey = Math.random().toString(36).slice(2)
const internalInstanceKey = `__reactFiber$${randomKey}`
const internalPropsKey = `__reactProps$${randomKey}`
/**
 * 从这个节点找到最近的fiber节点
 * @param {*} targetNode 真实节点
 */
export function getClosestInstanceFromNode(targetNode) {
  const targetInstance = targetNode[internalInstanceKey]
  return targetInstance || null
  // 真实dom上没有fiber的话就返回null，不要返回undefined
}
/**
 * node提前缓存fiber节点
 * 创建真实dom的时候就会存入的
 * @param {*} hostInst
 * @param {*} node
 */
export function preCacheFiberNode(hostInst, node) {
  node[internalInstanceKey] = hostInst
}
export function updateFiberProps(node, props) {
  node[internalPropsKey] = props
}
// 获取dom上的props
export function getFiberCurrentPropsFromNode(node) {
  return node[internalPropsKey] || null
}
