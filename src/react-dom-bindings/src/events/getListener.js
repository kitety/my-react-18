import { getFiberCurrentPropsFromNode } from "../client/ReactDomComponentTree"

/**
 * 获取次fiber上对应的回调函数
 * @param {*} instance
 * @param {*} registrationName
 */
export function getListener(instance, registrationName) {
  const { stateNode } = instance
  if (!stateNode) {
    return null
  }
  const props = getFiberCurrentPropsFromNode(stateNode)
  if (!props) {
    return null
  }
  const listener = props[registrationName]// props.onClick
  return listener

}
