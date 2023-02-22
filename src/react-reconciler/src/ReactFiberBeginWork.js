import logger, { indent } from "shared/logger";
import { shouldSetTextContent } from "react-dom-bindings/src/ReactDOMHostConfig";
import { mountChildFibers, reconcileChildFibers } from "./ReactChildFiber";
import { processUpdateQueue } from "./ReactFiberClassUpdateQueue";
import { FunctionComponent, HostComponent, HostRoot, HostText, IndeterminateComponent } from "./ReactWorkTags";
import { renderWithHooks } from "./ReactFiberHooks";
/**
 * 根据新的虚拟dom生成新的fiber链表
 * @param {*} current 老的父fiber
 * @param {*} workInProgress 新的父fiber
 * @param {*} nextChildren 新的子虚拟dom
 */
function reconcileChildren(current, workInProgress, nextChildren) {
  // 如果此新fiber没有老的fiber，那新fiber就是新创建的（不是更新的，是创建的）
  // 比如开始渲染的时候的子节点
  // 如果这个父亲fiber是新创建的，那么他的子节点也是新创建的
  if (current === null) {
    // 挂在子fiber链表
    workInProgress.child = mountChildFibers(workInProgress, null, nextChildren)
  } else {
    // 更新
    // 有老fiber的话，需要dom diff，拿老的子fiber链表和新的子虚拟dom比较，进行最小化的更新
    workInProgress.child = reconcileChildFibers(workInProgress, current.child, nextChildren)
  }

}

// 根节点
function updateHostRoot(current, workInProgress) {
  // 需要知道他的子虚拟dom，知道他的儿子的虚拟dom信息
  // 处理更新队列
  processUpdateQueue(workInProgress)// 给workInProgress.memoriedState={element}赋值，从更新队列里面拿出来
  const nextState = workInProgress.memoizedState
  // 虚拟dom {element: {…}}
  // 新的子虚拟dom
  const nextChildren = nextState.element // h1
  // 协调子节点 dom-diff算法
  //根据新的虚拟dom，生成子fiber链表
  reconcileChildren(current, workInProgress, nextChildren)
  return workInProgress.child// {type：'h1',tag:5} 根据element创建一个fiber，赋值给child

}
// 原生节点
/**
 * 构建原生节点的子fiber链表
 * @param {*} current 老fiber
 * @param {*} workInProgress 新fiber h1
 * @returns
 */
function updateHostComponent(current, workInProgress) {
  const { type } = workInProgress
  const nextProps = workInProgress.pendingProps
  // 拿到儿子
  let nextChildren = nextProps.children
  // 单文本优化 是不是直接文本节点
  // 判断当前虚拟dom的儿子是不是文本的独生子
  const isDirectTextChild = shouldSetTextContent(type, nextProps)
  if (isDirectTextChild) {
    nextChildren = null
  }
  // 协调子节点 dom-diff算法
  //根据新的虚拟dom，生成子fiber链表
  reconcileChildren(current, workInProgress, nextChildren)
  return workInProgress.child// {type：'h1',tag:5} 根据element创建一个fiber，赋值给child
  return null
}
/**
 *
 * @param {*} current 老的fiber
 * @param {*} workInProgress 新的fiber
 * @param {*} type 组件 函数组件的定义
 */
export function mountIndeterminateComponent(current, workInProgress, Component) {
  console.log('current, workInProgress, type: ', current, workInProgress, Component);
  // 函数组件渲染的是返回值
  const props = workInProgress.pendingProps
  // 返回的是个虚拟dom
  // const value = Component(props)
  // hooks的写法
  const value = renderWithHooks(current, workInProgress, Component, props)
  console.log('value: ', value);
  // 改问函数组件
  workInProgress.tag = FunctionComponent
  reconcileChildren(current, workInProgress, value)
  return workInProgress.child
}
/**
 * 目标是根据虚拟dom，构建新的fiber子链表 child sibling
 * @param {*} current 老fiber
 * @param {*} workInProgress 新fiber
 * @returns
 */
export function beginWork(current, workInProgress) {
  logger(' '.repeat(indent.number) + 'beginWork', workInProgress)
  indent.number += 2

  // console.log('workInProgress: ', workInProgress);
  switch (workInProgress.tag) {
    // 函数式和class React中有这两种组件，其实本质都是函数

    case IndeterminateComponent:
      return mountIndeterminateComponent(current, workInProgress, workInProgress.type)
      break
    // 根节点
    case HostRoot:
      // 更新子fiber树
      return updateHostRoot(current, workInProgress)
    case HostComponent:
      return updateHostComponent(current, workInProgress)
    case HostText:
      // 文本节点没有子节点
      return null

    default:
      return null;
  }
  return null
}
