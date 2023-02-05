// 后面实现优先队列
export function scheduleCallback(callback) {
  // 空闲的时候执行回调函数
  requestIdleCallback(callback);
}
