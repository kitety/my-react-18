/**
 * 渲染函数组件，支持hooks
 * @param {*} current 老fiber
 * @param {*} workInProgress 新fiber
 * @param {*} Component 组件定义
 * @param {*} props 参数
 * @returns 虚拟dom或者说React元素
 */
export function renderWithHooks(current, workInProgress, Component, props) {
  const children = Component(props)
  return children
}
