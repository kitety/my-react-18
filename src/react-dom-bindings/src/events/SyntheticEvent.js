import assign from "shared/assign"

function functionThatReturnsTrue() {
  return true
}
function functionThatReturnsFalse() {
  return false
}
const MouseEventInterface = {
  clientX: 0,
  clientY: 0,
}
function createSyntheticEvent(interfaces) {
  //
  /**
   * 合成事件的基类
   * @param {*} reactName  react属性名 onClick
   * @param {*} reactEventType click
   * @param {*} targetInst 事件源对应的fiber实例
   * @param {*} nativeEvent 原生事件对象
   * @param {*} nativeEventTarget 事件源真实dom
   */
  function SyntheticBaseEvent(reactName, reactEventType, targetInst, nativeEvent, nativeEventTarget) {
    // cache
    this._reactName = reactName
    this.type = reactEventType
    this._targetInst = targetInst
    this.nativeEvent = nativeEvent
    this.target = nativeEventTarget
    for (const propName in interfaces) {
      if (!interfaces.hasOwnProperty(propName)) {
        continue
      }
      // 属性拷贝
      this[propName] = nativeEvent[propName]
    }
    //是否已经阻止默认事件 函数
    this.isDefaultPrevented = functionThatReturnsFalse
    // 是否已经阻止继续冒泡 函数
    this.isPropagationStopped = functionThatReturnsFalse
    return this

  }
  // 兼容
  assign(SyntheticBaseEvent.prototype, {
    preventDefault: function () {
      const event = this.nativeEvent
      // 有就调用
      if (event.preventDefault) {
        event.preventDefault()
      } else {
        // ie
        event.returnValue = false
      }
      this.isDefaultPrevented = functionThatReturnsTrue
    },
    stopPropagation: function () {
      const event = this.nativeEvent
      // 有就调用
      if (event.stopPropagation) {
        event.stopPropagation()
      } else {
        // ie
        event.cancelBubble = false
      }
      this.isPropagationStopped = functionThatReturnsTrue
    },
  })
  return SyntheticBaseEvent
}
export const SyntheticMouseEvent = createSyntheticEvent(MouseEventInterface)
