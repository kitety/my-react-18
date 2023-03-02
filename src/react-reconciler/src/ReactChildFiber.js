// createChildReconciler 创建子协调的方法
import isArray from "shared/isArray";
import { REACT_ELEMENT_TYPE } from "shared/ReactSymbols";
import { createFiberFromElement, createFiberFromText, createWorkInProgress } from "./ReactFiber";
import { ChildDeletion, Placement } from "./ReactFiberFlags";
import { HostText } from "./ReactWorkTags";

/**
 *
 * @param {*} shouldTrackSideEffects 是否跟踪副作用，新的不需要比较，没有老的属性，因为不用diff。提升性能
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
      returnFiber.deletions.push(childToDelete)
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

  // 删除currentFirstChild 和他之后的兄弟节点
  function deleteRemainingChildren(returnFiber, currentFirstChild) {
    if (!shouldTrackSideEffects) {
      return null
    }
    let childToDelete = currentFirstChild
    while (childToDelete !== null) {
      deleteChild(returnFiber, childToDelete)
      childToDelete = childToDelete.sibling
    }
    return null
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
          // 删除其他的子节点 其他的弟弟 这里只针对一个的情况
          deleteRemainingChildren(returnFiber, child.sibling)
          // type key一样的话，就可以复用老的fiber
          const existing = useFiber(child, element.props)
          existing.return = returnFiber
          return existing
        } else {
          // 类型不同
          // 删除包括当前fiber在内的所有的老fiber，生成新的fiber
          // 有点像同级比较

          // key一样的老fiber，但是类型不同，不能复用老fiber，把剩下的全部删除
          // 删除剩下的儿子
          deleteRemainingChildren(returnFiber, child)
        }
      } else {
        // 单节点的情况
        // key不一样，需要删除掉老的fiber
        deleteChild(returnFiber, child)
      }
      child = child.sibling
    }


    // 因为我们现在实现的初次挂载，老节点的currentFirstFiber是null，所以可以直接根据虚拟dom创建新的fiber节点
    // 老fiber没有用到就没有了 回收。如果有老fiber的话
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
   * @param {*} lastPlacedIndex 上一个不需要移动的老fiber的索引
   * @param {*} newIndex
   */
  function placeChild(newFiber, lastPlacedIndex, newIndex) {
    newFiber.index = newIndex
    // 不用副作用就返回
    if (!shouldTrackSideEffects) { return lastPlacedIndex }
    // 有老的存在了 就不执行插入的逻辑了 因为这是一个更新的节点 老的真实dom
    const current = newFiber.alternate
    if (current !== null) {
      const oldIndex = current.index
      // 小于 需要移动老fiber的dom节点
      if (oldIndex < lastPlacedIndex) {
        // 老节点插入就是移动
        newFiber.flags |= Placement
        return lastPlacedIndex
      } else {
        // 不需要移动 返回较大值
        return oldIndex
      }
    }
    // true，跟踪副作用
    // 如果一个fiber上有个placement，说明此节点需要创建真实dom，并且插入到父亲容器
    //如果父亲fiber节点是初次挂载，shouldTrackSideEffects为false，不用flags
    // 这种情况就在完成阶段吧所有的子节点全部添加到自己的身上
    // 新的节点
    newFiber.flags |= Placement
    return lastPlacedIndex
  }
  function updateElement(returnFiber, current, element) {
    // 进来的时候已经比较过key一样了
    const elementType = element.type
    if (current !== null && current.type == elementType) {
      //key一样 type一样 复用
      const existing = useFiber(current, element.props)
      existing.return = returnFiber
      return existing
    }
    // key一样 type不一样 不能复用
    // 删老的，加新的
    const created = createFiberFromElement(element)
    created.return = returnFiber
    return created
  }
  /**
   * 尝试更想你或者复用老fiber
   * @param {*} returnFiber 父亲
   * @param {*} oldFiber 老fiber
   * @param {*} newChild 新的虚拟dom
   */
  function updateSlot(returnFiber, oldFiber, newChild) {
    // 老fiber的key
    const key = oldFiber !== null ? oldFiber.key : null
    // 新的虚拟dom是存在的
    if (typeof newChild === 'object' && newChild !== null) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE: {
          // 是元素，比较key
          if (newChild.key === key) {
            return updateElement(returnFiber, oldFiber, newChild)
          }
          return null
        }
        default:
          return null
      }
    }
    return null
  }
  /**
   * 映射剩下的节点在一个Map
   * @param {*} returnFiber
   * @param {*} currentFirstChild 第一个老节点
   */
  function mapRemainingChildren(returnFiber, currentFirstChild) {
    const existingChildren = new Map();
    let existingChild = currentFirstChild
    while (existingChild !== null) {
      if (existingChild.key !== null) {
        existingChildren.set(existingChild.key, existingChild)
      } else {
        existingChildren.set(existingChild.index, existingChild)
      }
      existingChild = existingChild.sibling
    }
    return existingChildren

  }
  function updateTextNode(returnFiber, current, textContent) {
    // 没有老fiber或者老fiber不是文本节点
    if (current === null || current.tag !== HostText) {
      // 创建
      const created = createFiberFromText(textContent)
      created.return = returnFiber
      return created
    }
    // 更新
    const existing = useFiber(current, textContent)
    existing.return = returnFiber
    return existing
  }
  /**
   *
   * @param {*} existingChildren map
   * @param {*} returnFiber
   * @param {*} newIndex 索引
   * @param {*} newChildren  array
     */
  function updateFromMap(existingChildren, returnFiber, newIndex, newChild) {
    // 如果是字符串或者数字
    if ((typeof newChild === 'string' && newChild !== '') || typeof newChild === 'number') {
      const matchedFiber = existingChildren.get(newIndex) || null
      return updateTextNode(returnFiber, matchedFiber, `${newChild}`)
    }
    //对象
    if (typeof newChild === 'object' && newChild !== null) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE: {
          const matchedFiber = existingChildren.get(newChild.key === null ? newIndex : newChild.key) || null
          return updateElement(returnFiber, matchedFiber, newChild)
        }
        default:
          break;
      }
    }

  }
  /**
   * 协调数组
   * @param {*} returnFiber
   * @param {*} currentFirstChild
   * @param {*} newChildren
   */
  function reconcileChildrenArray(returnFiber, currentFirstChild, newChildren) {
    console.log('returnFiber, currentFirstChild, newChild: ', returnFiber, currentFirstChild, newChildren);
    // 返回的第一个新儿子
    let resultingFirstChild = null
    // 上一个新fiber
    let previousNewFiber = null
    let newIndex = 0// 遍历新的虚拟dom的索引
    let oldFiber = currentFirstChild// 第一个老fiber
    let nextOldFiber = null // 下一个老fiber
    let lastPlacedIndex = 0 // 上一个不需要移动老节点的索引
    // 更新 oldFiber 有值
    //第一次循环
    // 老fiber有值，新的虚拟dom也有值
    for (; oldFiber !== null && newIndex < newChildren.length; newIndex++) {
      // 暂存下一个老fiber
      // 要变化，因为索引在变化
      // 引用，因为怕sibling被其他地方改掉
      nextOldFiber = oldFiber.sibling
      // 试图更新或者试图复用老的fiber
      const newFiber = updateSlot(returnFiber, oldFiber, newChildren[newIndex])
      //如果值为null，就break
      if (newFiber === null) {
        break
      }
      if (shouldTrackSideEffects) {
        // 老的存在而新的alternate不存在，就要删除原来的老的
        // 创建的是新的fiber，没有复用老fiber 在提交阶段删除真实dom
        if (oldFiber && newFiber.alternate === null) {
          // 删除
          deleteChild(returnFiber, oldFiber)
        }
      }
      // 指定新fiber的位置
      lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIndex)
      // 构建新的fiber树
      if (previousNewFiber === null) {
        // 头
        resultingFirstChild = newFiber // li A，li A.sibling=pb
      } else {
        previousNewFiber.sibling = newFiber // p b
      }
      // previousNewFiber始终指向最新的
      previousNewFiber = newFiber
      oldFiber = nextOldFiber
    }
    // 如果说新的虚拟dom已经循环完毕，那么老fiber就应该删除3>2
    if (newIndex === newChildren.length) {
      // 删除老的fiber
      deleteRemainingChildren(returnFiber, oldFiber)
      return resultingFirstChild
    }
    //判断
    if (oldFiber === null) {
      // 插入的情况
      // 有新增的也会有插入的情况
      for (; newIndex < newChildren.length; newIndex++) {
        // 创建儿子的fiber
        const newFiber = createChild(returnFiber, newChildren[newIndex])

        if (newFiber === null) {
          continue
        }
        // 新fiber放到索引的地方
        lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIndex)
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
    }
    // 开始处理移动情况
    const existingChildren = mapRemainingChildren(returnFiber, oldFiber)
    // 开始遍历剩下的虚拟dom子节点
    for (; newIndex < newChildren.length; newIndex++) {
      // 从map创建更新
      const newFiber = updateFromMap(existingChildren, returnFiber, newIndex, newChildren[newIndex])
      // 有新fiber
      if (newFiber !== null) {
        if (shouldTrackSideEffects) {
          // 如果要跟踪副作用，并且有老的fiber
          if (newFiber.alternate !== null) {
            // 删除掉老的fiber
            existingChildren.delete(newFiber.key === null ? newIndex : newFiber.key)
          }
        }
        // 指定新的fiber的存放位置，并且给lastPlacedIndex赋值
        lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIndex)
        // 构建新的fiber树
        if (previousNewFiber === null) {
          // 头
          resultingFirstChild = newFiber // li A，li A.sibling=pb
        } else {
          previousNewFiber.sibling = newFiber // p b
        }
        // previousNewFiber始终指向最新的
        previousNewFiber = newFiber
      }
    }
    if (shouldTrackSideEffects) {
      // 全部处理完后，剩下的需要删除的fiber
      existingChildren.forEach(child => deleteChild(returnFiber, child))
    }
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

