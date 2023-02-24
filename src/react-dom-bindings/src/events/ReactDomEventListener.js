import { getClosestInstanceFromNode } from "../client/ReactDomComponentTree";
import { dispatchEventForPluginEventSystem } from "./DOMPluginsEventSystem";
import { getEventTarget } from "./getEventTarget";

export function createEventListenerWrapperWithPriority(targetContainer, domEventName, eventSystemFlags) {
  const listenerWrapper = dispatchDiscreteEvent
  return listenerWrapper.bind(null, domEventName, eventSystemFlags, targetContainer)
}
/**
 * 派发离散的事件的监听函数
 * 离散 不会连续触发 例如click
 * 连续 滚动 缩放
 * Discrete 离散的
 * @param {*} domEventName 事件名 click
 * @param {*} eventSystemFlags 阶段 0 冒泡 4 捕获
 * @param {*} container 容器
 * @param {*} nativeEvent 原生事件
 */
function dispatchDiscreteEvent(domEventName, eventSystemFlags, container, nativeEvent) {
  dispatchEvent(domEventName, eventSystemFlags, container, nativeEvent)
}

/**
 * 此方法就是委托给容器的回调，当容器#root在捕获或者说冒泡的时候，执行
 * 派发事件
 * @param {*} domEventName
 * @param {*} eventSystemFlags
 * @param {*} container
 * @param {*} nativeEvent
 */
export function dispatchEvent(domEventName, eventSystemFlags, container, nativeEvent) {
  // 获取事件源 能够触发肯定已经完成了
  const nativeEventTarget = getEventTarget(nativeEvent)
  // 从这个节点找到最近的fiber节点
  const targetInst = getClosestInstanceFromNode(nativeEventTarget)
  // 为了插件系统派发事件
  dispatchEventForPluginEventSystem(domEventName, eventSystemFlags, nativeEvent, targetInst, container)
}
