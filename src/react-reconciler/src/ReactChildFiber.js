// createChildReconcile 创建子协调的方法
/**
 *
 * @param {*} shouldTrackSideEffects 是否跟踪副作用，新的不需要比较，没有老的属性，因为不用diff
 */
function createChildReconciler(
  shouldTrackSideEffects,
) {
  function reconcileChildFibers() {

  }
  return reconcileChildFibers
}
// 没有老fiber，初次挂载用这个
export const mountChildFibers = createChildReconcile(false)
// 有老fiber更新的时候用这个
export const reconcileChildFibers = createChildReconcile(true)
