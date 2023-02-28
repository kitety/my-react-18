// createChildReconciler 创建子协调的方法
import isArray from "shared/isArray";
import { REACT_ELEMENT_TYPE } from "shared/ReactSymbols";
import { createFiberFromElement, createFiberFromText, createWorkInProgress } from "./ReactFiber";
import { ChildDeletion, Placement } from "./ReactFiberFlags";

/**
 *
 * @param {*} shouldTrackSideEffects 是否跟踪副作用，新的不需要比较，没有老的属性，因为不用diff
 */
function createChildReconciler(
  shouldTrackSideEffects,
) {
  // 删除儿子
  /**
   *
   * @param {*} returnFiber 父亲
   * @param {*} child 将删除的老节点
   */
  function deleteChild(returnFiber, childToDelete) {
    // 没有副作用就删除
    if (!shouldTrackSideEffects) {
      return
    }
    // 有副作用
    const deletions = returnFiber.deletions
    // 没有
    if (deletions === null) {
      returnFiber.deletions = [childToDelete]
      // 子节点删除
      returnFiber.flags |= ChildDeletion
    } else {
      // 添加
      returnFiber.deletions.push(ChildToDelete)
    }
  }
  /**
   *
   * @param {*} fiber 老fiber
   * @param {*} props 新属性
   */
  function useFiber(fiber, props) {
    const clone = createWorkInProgress(fiber, props)
    clone.index = 0
    clone.sibling = null
    return clone
  }
  //  test 减少操作
  // shouldTrackSideEffects = true
  // 协调单个的子节点
  /**
  *
  * @param {*} returnFiber 根fiber #root
  * @param {*} currentFirstChild 老的function component对应的fiber
  * @param {*} element 新的虚拟dom
  * @returns 返回我们新的第一个子fiber
  */
  function reconcileSingleElement(returnFiber, currentFirstChild, element) {
    // 新的虚拟dom的key，唯一标识
    const key = element.key;
    let child = currentFirstChild;
    // 复用老的数据
    while (child !== null) {
      // 有老fiber
      // 判断老fiber对应的key和新的虚拟dom的key是否一样
      if (child.key === key) {
        // 一样
        // 判断老fiber的类型和新的虚拟dom的类型是否一样
        if (child.type === element.type) {// p div
          // type key一样的话，就可以复用老的fiber
          const existing = useFiber(child, element.props)
          existing.return = returnFiber
          return existing
        }
      } else {
        // 单节点的情况
        // key不一样，需要删除掉老的fiber
        deleteChild(returnFiber, child)
      }
      child = child.sibling
    }


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
    // 跟踪并且老fiber是个空的，说明是新的fiber
    if (shouldTrackSideEffects && newFiber.alternate === null) {
      // 插入，要在最后的提交阶段插入节点
      // react的渲染氛围渲染和提交节点，渲染就是创建fiber树，提交就是把fiber树变成真实dom
      newFiber.flags |= Placement
    }
    return newFiber

  }
  function createChild(returnFiber, newChild) {
    // 根据虚拟dom，创建fiber
    // 直接是数字或者字符串
    if ((typeof newChild === 'string' && newChild !== '') || (typeof newChild === 'number')) {
      const created = createFiberFromText(`${newChild}`)
      created.return = returnFiber
      return created
    }
    if (typeof newChild === 'object' && newChild !== null) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE:
          const created = createFiberFromElement(newChild)
          created.return = returnFiber
          return created

        default:
          break;
      }
      return null

    }
  }
  /**
   * fiber节点设置索引
   * @param {*} newFiber
   * @param {*} newIndex
   */
  function placeChild(newFiber, newIndex) {
    newFiber.index = newIndex
    // true，跟踪副作用
    if (shouldTrackSideEffects) {
      // 如果一个fiber上有个placement，说明此节点需要创建真实dom，并且插入到父亲容器
      //如果父亲fiber节点是初次挂载，shouldTrackSideEffects为false，不用flags
      // 这种情况就在完成阶段吧所有的子节点全部添加到自己的身上
      newFiber.flags |= Placement
    }
  }
  /**
   * 协调数组
   * @param {*} returnFiber
   * @param {*} currentFirstChild
   * @param {*} newChild
   */
  function reconcileChildrenArray(returnFiber, currentFirstChild, newChild) {
    // 返回的第一个新儿子
    let resultingFirstChild = null
    // 上一个新fiber
    let previousNewFiber = null
    let newIndex = 0
    for (; newIndex < newChild.length; newIndex++) {
      // 创建儿子的fiber
      const newFiber = createChild(returnFiber, newChild[newIndex])

      if (newFiber === null) {
        continue
      }
      // 新fiber放到索引的地方
      placeChild(newFiber, newIndex)
      // 如果previousNewFiber为null，说明为第一个fiber，大儿子没出现，她就是大儿子
      if (previousNewFiber === null) {
        // 大儿子
        resultingFirstChild = newFiber
      } else {
        //不是大儿子，那就把newFiber添加到上一个节点的后面
        previousNewFiber.sibling = newFiber
      }
      // 让newFiber成为上一个子fiber
      previousNewFiber = newFiber

    }
    // 返回大儿子
    return resultingFirstChild
  }
  /**
   * 比较子fibers dom diff就在这里 用老的子fiber链表和新的虚拟dom比较的过程
   * @param {*} returnFiber 新的父fiber 父亲
   * @param {*} currentFirstChild current指的是老的，老fiber的第一个子fiber 老儿子
   * @param {*} newChild 新的子虚拟dom h1这个虚拟dom 新儿子
   * 老儿子和新儿子比较，添加到父亲上
   */
  function reconcileChildFibers(returnFiber, currentFirstChild, newChild) {
    // 现在需要处理更新的逻辑了 处理dom diff
    // 1. 单节点diff
    // 暂时只考虑新的节点只有一个的情况
    if (typeof newChild === 'object' && newChild !== null) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE:
          // 放置单个儿子
          // 新的儿子是独生子，并且是虚拟dom
          return placeSingleChild(reconcileSingleElement(returnFiber, currentFirstChild, newChild))

        default:
          break;
      }
    }
    //  newChild [hello text,span 虚拟dom]
    // 是个数组
    if (isArray(newChild)) {

      return reconcileChildrenArray(returnFiber, currentFirstChild, newChild)
    }
    return null
  }
  return reconcileChildFibers
}
// 有老fiber更新的时候用这个
export const reconcileChildFibers = createChildReconciler(true)
// 没有老fiber，初次挂载用这个
export const mountChildFibers = createChildReconciler(false)

