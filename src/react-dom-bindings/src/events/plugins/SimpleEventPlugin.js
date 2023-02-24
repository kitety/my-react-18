import { registerSimpleEvents, topLevelEventsToReactNames } from "../DOMEventProperties";
import { accumulateSinglePhaseListeners } from "../DOMPluginsEventSystem";
import { IS_CAPTURE_PHASE } from "../EventSystemFlags";
import { getEventTarget } from "../getEventTarget";
import { SyntheticMouseEvent } from '../SyntheticEvent'

/**
 * 把要执行的回调函数，添加到dispatchQueue中
 * @param {*} dispatchQueue 派发队列，里面放置监听函数
 * @param {*} domEventName dom事件名 click
 * @param {*} targetInst 目标fiber
 * @param {*} nativeEvent 原生事件
 * @param {*} nativeEventTarget 原生事件源
 * @param {*} eventSystemFlags 事件系统标识 0 冒泡 4 捕获
 * @param {*} container 目标容器 div#root
 */
function extractEvents(dispatchQueue, domEventName, targetInst, nativeEvent, nativeEventTarget, eventSystemFlags, container) {
  // reactName click--onClick
  const reactName = topLevelEventsToReactNames.get(domEventName)
  let SyntheticEventCtor;//合成事件构造函数
  switch (domEventName) {
    case 'click':
      // 点击 合成鼠标事件
      SyntheticEventCtor = SyntheticMouseEvent
      break;

    default:
      break;
  }
  //  是不是捕获
  const isCapturePhase = (eventSystemFlags & IS_CAPTURE_PHASE) !== 0
  // 累加单阶段监听
  const listeners = accumulateSinglePhaseListeners(targetInst, reactName, nativeEvent.type, isCapturePhase)
  // 如果有监听函数[onClickCapture,onClickCapture]=[childCapture,parentCapture]
  if (listeners.length > 0) {
    // 有等待需要执行的函数
    // SyntheticEventCtor 合成事件的构造函数
    const event = new SyntheticEventCtor(reactName, domEventName, null, nativeEvent, nativeEventTarget)
    // event 合成事件实例
    // listeners 监听函数的数组
    dispatchQueue.push({ event, listeners })
  }

}
// 注册 提取
export { registerSimpleEvents as registerEvents, extractEvents }
