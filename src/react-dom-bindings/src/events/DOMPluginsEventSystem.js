// 事件系统的dom插件

import { HostComponent } from "react-reconciler/src/ReactWorkTags";
import { addEventBubbleListener, addEventCaptureListener } from "./EventListener";
import { allNativeEvents } from "./EventRegistry";
import { IS_CAPTURE_PHASE } from "./EventSystemFlags";
import { getEventTarget } from "./getEventTarget";
import { getListener } from "./getListener";
import * as SimpleEventPlugin from './plugins/SimpleEventPlugin';
import { createEventListenerWrapperWithPriority } from "./ReactDomEventListenber";
SimpleEventPlugin.registerEvents()

const listeningMarker = `__reactListening__${Math.random().toString(36).slice(2)}`
// 所有原生的事件
export function listenToAllSupportedEvents(rootContainerElement) {
  //  根容器div#root只监听一次
  if (!rootContainerElement[listeningMarker]) {
    rootContainerElement[listeningMarker] = true
    console.log('listenToAllSupportedEvents container: ', rootContainerElement);
    allNativeEvents.forEach((domEventName) => {
      console.log('domEventName: ', domEventName);
      listenToNativeEvent(domEventName, true, rootContainerElement)
      listenToNativeEvent(domEventName, false, rootContainerElement)
    })
  }
}
/**
 * 注册原生事件
 * @param {*} domEventName 事件名
 * @param {*} isCapturePhaseListener 是不是捕获阶段 true false
 * @param {*} target target div#root 容器事件
 */
function listenToNativeEvent(domEventName, isCapturePhaseListener, target) {
  // 默认0 表示冒泡  4 捕获
  let eventSystemFlags = 0
  if (isCapturePhaseListener) {
    eventSystemFlags |= IS_CAPTURE_PHASE
  }
  addTrappedEventListener(target, domEventName, eventSystemFlags, isCapturePhaseListener)
}

function addTrappedEventListener(targetContainer, domEventName, eventSystemFlags, isCapturePhaseListener) {
  const listener = createEventListenerWrapperWithPriority(targetContainer, domEventName, eventSystemFlags)
  // 捕获
  if (isCapturePhaseListener) {
    addEventCaptureListener(targetContainer, domEventName, listener)
  } else {
    addEventBubbleListener(targetContainer, domEventName, listener)
  }
}

/**
 * 为事件系统派发事件
 * @param {*} domEventName
 * @param {*} eventSystemFlags
 * @param {*} nativeEvent
 * @param {*} targetInst
 * @param {*} container
 */
export function dispatchEventForPluginEventSystem(domEventName, eventSystemFlags, nativeEvent, targetInst, container) {
  dispatchEventsForPlugins(domEventName, eventSystemFlags, nativeEvent, targetInst, container)
}
// 派发事件为插件
function dispatchEventsForPlugins(domEventName, eventSystemFlags, nativeEvent, targetInst, container) {
  // 注意事件的存储
  // 事件源
  const nativeEventTarget = getEventTarget(nativeEvent)
  // 派发事件的数组
  const dispatchQueue = []
  extractEvents(dispatchQueue, domEventName, targetInst, nativeEvent, nativeEventTarget, eventSystemFlags, container)
  console.log('dispatchQueue: ', dispatchQueue);


}
/**
 * 提取事件
 * @param {*} dispatchQueue
 * @param {*} domEventName
 * @param {*} targetInst
 * @param {*} nativeEvent
 * @param {*} nativeEventTarget
 * @param {*} eventSystemFlags
 * @param {*} container
 */
function extractEvents(dispatchQueue, domEventName, targetInst, nativeEvent, nativeEventTarget, eventSystemFlags, container) {
  SimpleEventPlugin.extractEvents(dispatchQueue, domEventName, targetInst, nativeEvent, nativeEventTarget, eventSystemFlags, container)

}

export function accumulateSinglePhaseListeners(targetFiber, reactName, nativeEventType, isCapturePhase) {
  const captureName = reactName + 'Capture';
  const reactEventName = isCapturePhase ? captureName : reactName
  const listeners = []
  let instance = targetFiber
  while (instance) {
    const { stateNode, tag } = instance
    // 原生
    if (tag === HostComponent && stateNode !== null) {
      const listener = getListener(instance, reactEventName)
      if (listener) {
        listeners.push(listener)
      }
    }
    // 一直返回 找父节点
    instance = instance.return
  }
  return listeners
}
