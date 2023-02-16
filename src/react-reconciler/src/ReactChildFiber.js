// createChildReconciler 创建子协调的方法

import { REACT_ELEMENT_TYPE } from "shared/ReactSymbols";
import { createFiberFromElement } from "./ReactFiber";
import { Placement } from "./ReactFiberFlags";

/**
 *
 * @param {*} shouldTrackSideEffects 是否跟踪副作用，新的不需要比较，没有老的属性，因为不用diff
 */
function createChildReconciler(
  shouldTrackSideEffects,
) {
  // 协调单个的子节点
  function reconcileSingleElement(returnFiber, currentFirstFiber, element) {
    // 因为我们现在实现的初次挂载，老节点的currentFirstFiber是null，所以可以直接根据虚拟dom创建新的fiber节点
    const created = createFiberFromElement(element)
    // 指向父亲
    created.return = returnFiber
    return created
  }
  /**
   * 设置副作用，增删改查
   * @param {*} newFiber
   * @returns
   */
  function placeSingleChild(newFiber) {
    // true，跟踪副作用
    if (shouldTrackSideEffects) {
      // 插入，要在最后的提交阶段插入节点
      // react的渲染氛围渲染和提交节点，渲染就是创建fiber树，提交就是把fiber树变成真实dom
      newFiber.flags |= Placement
    }
    return newFiber

  }
  /**
   * 比较子fibers dom diff就在这里 用老的子fiber链表和新的虚拟dom比较的过程
   * @param {*} returnFiber 新的父fiber 父亲
   * @param {*} currentFirstFiber current指的是老的，老fiber的第一个子fiber 老儿子
   * @param {*} newChild 新的子虚拟dom h1这个虚拟dom 新儿子
   * 老儿子和新儿子比较，添加到父亲上
   */
  function reconcileChildFibers(returnFiber, currentFirstFiber, newChild) {
    // 暂时只考虑新的节点只有一个的情况
    if (typeof newChild === 'object' && newChild !== null) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE:
          // 放置单个儿子
          // 新的儿子是独生子，并且是虚拟dom
          return placeSingleChild(reconcileSingleElement(returnFiber, currentFirstFiber, newChild))

        default:
          break;
      }
    }
  }
  return reconcileChildFibers
}
// 有老fiber更新的时候用这个
export const reconcileChildFibers = createChildReconciler(true)
// 没有老fiber，初次挂载用这个
export const mountChildFibers = createChildReconciler(false)

