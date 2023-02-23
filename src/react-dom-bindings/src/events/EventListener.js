// div#root 事件代理的地方
export function addEventCaptureListener(target, domEventName, listener) {
  target.addEventListener(domEventName, listener, true)
  return listener
}
export function addEventBubbleListener(target, domEventName, listener) {
  target.addEventListener(domEventName, listener, false)
  return listener
}
