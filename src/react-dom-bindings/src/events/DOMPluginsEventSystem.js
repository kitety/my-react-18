// 事件系统的dom插件

import { HostComponent } from "react-reconciler/src/ReactWorkTags";
import { addEventBubbleListener, addEventCaptureListener } from "./EventListener";
import { allNativeEvents } from "./EventRegistry";
import { IS_CAPTURE_PHASE } from "./EventSystemFlags";
import { getEventTarget } from "./getEventTarget";
import { getListener } from "./getListener";
import * as SimpleEventPlugin from './plugins/SimpleEventPlugin';
import { createEventListenerWrapperWithPriority } from "./ReactDomEventListener";
SimpleEventPlugin.registerEvents()

const listeningMarker = `__reactListening__${Math.random().toString(36).slice(2)}`
// 所有原生的事件
export function listenToAllSupportedEvents(rootContainerElement) {
  //  根容器div#root只监听一次
  if (!rootContainerElement[listeningMarker]) {
    rootContainerElement[listeningMarker] = true
    // console.log('listenToAllSupportedEvents container: ', rootContainerElement);
    allNativeEvents.forEach((domEventName) => {
      // console.log('domEventName: ', domEventName);
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
  // console.log('dispatchQueue: ', dispatchQueue);
  processDispatchQueue(dispatchQueue, eventSystemFlags)


}
function processDispatchQueue(dispatchQueue, eventSystemFlags) {
  // 判断是否在捕获阶段
  const inCapturePhase = (eventSystemFlags & IS_CAPTURE_PHASE) !== 0
  for (let i = 0; i < dispatchQueue.length; i++) {
    const { event, listeners } = dispatchQueue[i];
    processDispatchQueueItemsInOrder(event, listeners, inCapturePhase)

  }
}
function executeDispatch(event, listener, currentTarget) {
  // 合成事件的currentTarget是不断变化的
  // event nativeEventTarget是原始的事件源，永远不变
  // event currentTarget 当前的事件源，随着回调的执行不断变化
  // 都点span currentTarget是span和h1,nativeEventTarget 都是span
  event.currentTarget = currentTarget
  listener(event)
}
function processDispatchQueueItemsInOrder(event, dispatchListeners, inCapturePhase) {
  // dispatchListeners [child，parent]
  if (inCapturePhase) {
    // 捕获阶段
    // 倒序
    for (let i = dispatchListeners.length - 1; i >= 0; i--) {
      const {
        instance,
        listener,
        currentTarget,
      } = dispatchListeners[i]
      // 阻止传播
      if (event.isPropagationStopped()) {
        return
      }
      // listener(event)
      executeDispatch(event, listener, currentTarget);
    }
  } else {
    // 冒泡阶段
    for (let i = 0; i < dispatchListeners.length; i++) {
      const {
        instance,
        listener,
        currentTarget,
      } = dispatchListeners[i]
      // 阻止冒泡 传播的话
      if (event.isPropagationStopped()) {
        return
      }
      // listener(event)
      executeDispatch(event, listener, currentTarget);
    }
  }
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
  // 从发生点一直往上的找
  while (instance) {
    const { stateNode, tag } = instance// stateNode dom节点
    // 原生
    if (tag === HostComponent && stateNode !== null) {
      const listener = getListener(instance, reactEventName)
      if (listener) {
        // listeners.push(listener)
        listeners.push(createDispatchListener(instance, listener, stateNode))
      }
    }
    // 一直返回 找父节点
    instance = instance.return
  }
  return listeners
}
function createDispatchListener(
  instance,
  listener,
  currentTarget,
) {
  return {
    instance,
    listener,
    currentTarget,
  };
}
