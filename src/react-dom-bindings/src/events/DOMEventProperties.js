import { registerTwoPhaseEvent } from "./EventRegistry";
export const topLevelEventsToReactNames =
  new Map();

// 简单事件事件名
const simpleEventPluginEvents = [
  // 'abort',
  // 'auxClick',
  // 'cancel',
  // 'canPlay',
  // 'canPlayThrough',
  'click',
  // 'close',
  // 'contextMenu',
  // 'copy',
  // 'cut',
  // 'drag',
  // 'dragEnd',
  // 'dragEnter',
  // 'dragExit',
  // 'dragLeave',
  // 'dragOver',
  // 'dragStart',
  // 'drop',
  // 'durationChange',
  // 'emptied',
  // 'encrypted',
  // 'ended',
  // 'error',
  // 'gotPointerCapture',
  // 'input',
  // 'invalid',
  // 'keyDown',
  // 'keyPress',
  // 'keyUp',
  // 'load',
  // 'loadedData',
  // 'loadedMetadata',
  // 'loadStart',
  // 'lostPointerCapture',
  // 'mouseDown',
  // 'mouseMove',
  // 'mouseOut',
  // 'mouseOver',
  // 'mouseUp',
  // 'paste',
  // 'pause',
  // 'play',
  // 'playing',
  // 'pointerCancel',
  // 'pointerDown',
  // 'pointerMove',
  // 'pointerOut',
  // 'pointerOver',
  // 'pointerUp',
  // 'progress',
  // 'rateChange',
  // 'reset',
  // 'resize',
  // 'seeked',
  // 'seeking',
  // 'stalled',
  // 'submit',
  // 'suspend',
  // 'timeUpdate',
  // 'touchCancel',
  // 'touchEnd',
  // 'touchStart',
  // 'volumeChange',
  // 'scroll',
  // 'toggle',
  // 'touchMove',
  // 'waiting',
  // 'wheel',
];

// 注册 click onClick
function registerSimpleEvent(domEventName, reactName) {
  // onClick可以从此元素的fiber属性上取到
  //在源码里，让真实dom元素的 updateFiberProps
  // pendingProps= 虚拟dom props
  // node [internalProps]=props
  // 把原生事件名和处理函数的名字，进行映射绑定
  topLevelEventsToReactNames.set(domEventName, reactName) // click onClick
  // 注册两个阶段的事件
  registerTwoPhaseEvent(reactName, [domEventName]) // onClick [click]
}
// 注册简单事件
export function registerSimpleEvents() {
  for (let i = 0; i < simpleEventPluginEvents.length; i++) {
    const eventName = simpleEventPluginEvents[i]// click
    const domEventName = eventName.toLowerCase()// click
    const capitalizeEvent = eventName.charAt(0).toUpperCase() + eventName.slice(1) // Click
    // 注册 click onClick
    registerSimpleEvent(domEventName, `on${capitalizeEvent}`)
  }

}
