import { registerSimpleEvents, topLevelEventsToReactNames } from "../DOMEventProperties";
import { accumulateSinglePhaseListeners } from "../DOMPluginsEventSystem";
import { IS_CAPTURE_PHASE } from "../EventSystemFlags";

function extractEvents(dispatchQueue, domEventName, targetInst, nativeEvent, nativeEventTarget, eventSystemFlags, container) {
  //  是不是捕获
  const isCapturePhase = (eventSystemFlags & IS_CAPTURE_PHASE) !== 0
  // reactName
  const reactName = topLevelEventsToReactNames.get(domEventName)
  // 累加单阶段监听
  const listeners = accumulateSinglePhaseListeners(targetInst, reactName, nativeEvent.type, isCapturePhase)
  console.log('listeners: ', listeners);

}
// 注册 提取
export { registerSimpleEvents as registerEvents, extractEvents }
