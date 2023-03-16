/**
 * 最小堆添加节点
 * @param {*} heap 最小堆
 * @param {*} node 节点
 */
export function push(heap, node) {
  // 获取元素数量
  const index = heap.length
  // 将元素添加到最后
  heap.push(node)
  // 向上调整
  shiftUp(heap, node, index)


}
/**
 * 查看最小堆顶部节点
 * @param {*} heap
 */

export function peak(heap) {
  const first = heap[0]
  return first === undefined ? null : first

}
/**
 * 弹出最小堆顶部节点
 * @param {*} heap
 */

export function pop(heap) {
  // 取出堆顶元素
  const first = heap[0]
  if (first !== undefined) {
    //弹出最后一个元素
    const last = heap.pop();
    if (last !== first) {
      heap[0] = last;
      shiftDown(heap, last, 0);
    }
    return first;
  } else {
    return null;
  }

}
/**
 * 向上调整某个节点，使其位于合适的位置
 * @param {*} heap
 * @param {*} node 节点
 * @param {*} i 索引
 */
function shiftUp(heap, node, i) {
  let index = i;
  while (true) {
    // 获取父节点索引
    let parentIndex = Math.floor((index - 1) / 2)
    // 获取父节点
    let parent = heap[parentIndex]
    // 父存在并且父亲比儿子大
    if (parent !== parent && compare(parent, node) > 0) {
      // 交换父子节点
      heap[parentIndex] = node
      heap[index] = parent
      // 更新索引
      index = parentIndex
    } else {
      // 子节点比父节点大就不交换位置
      break;
    }

  }

}
/**
 * 向下调整某个节点
 * @param {*} heap
 * @param {*} node 节点
 * @param {*} i 索引
 */
function shiftDown(heap, node, i) {
  let index = i
  const length = heap.length
  while (index < length) {
    const leftIndex = 2 * index + 1
    const left = heap[leftIndex]
    const rightIndex = leftIndex + 1
    const right = heap[rightIndex]
    // 如果左节点存在，并且左边节点比父亲小
    if (left !== undefined && compare(left, node) < 0) {
      // 右边存在并且比坐标小
      if (right !== undefined && compare(right, left) < 0) {
        heap[index] = right;
        heap[rightIndex] = node;
        index = rightIndex;
      } else {
        heap[index] = left;
        heap[leftIndex] = node;
        index = leftIndex;
      }
      // 左节点不存在或者左节点比父节点大
    } else if (right !== undefined && compare(right, node) < 0) {
      heap[index] = right;
      heap[rightIndex] = node;
      index = rightIndex;
    } else {
      break;
    }

  }

}
function compare(a, b) {
  const diff = a.sortIndex - b.sortIndex
  return diff !== 0 ? diff : a.id - b.id
}


// let heap = []
// push(heap, { sortIndex: 1 })
// push(heap, { sortIndex: 2 })
// push(heap, { sortIndex: 3 })
// console.log(peak(heap))
// push(heap, { sortIndex: 4 })
// push(heap, { sortIndex: 5 })
// push(heap, { sortIndex: 6 })
// push(heap, { sortIndex: 7 })
// console.log(peak(heap))
// pop(heap)
// pop(heap)
// pop(heap)
// console.log(peak(heap))
