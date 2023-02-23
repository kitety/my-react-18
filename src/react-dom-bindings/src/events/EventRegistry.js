// 事件注册 靠插件来操作的
export const allNativeEvents = new Set();

/**
 * 注册两个阶段的事件
 * 页面触发事件click的时候，会走事件处理函数
 * 事件处理函数需要找到dom元素对应的要执行的react事件 onClick onClickCapture
 * @param {*} registrationName React事件名 onClick
 * @param {*} dependencies 原生事件的数组[click]
 */
export function registerTwoPhaseEvent(registrationName, dependencies) {
  // 直接注册事件
  // 冒泡
  registerDirectEvent(registrationName, dependencies)
  // 捕获
  registerDirectEvent(registrationName + 'Capture', dependencies)
}

export function registerDirectEvent(registrationName, dependencies) {
  for (let i = 0; i < dependencies.length; i++) {
    // 添加click
    allNativeEvents.add(dependencies[i])
  }
}
