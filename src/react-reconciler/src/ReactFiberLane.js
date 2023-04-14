export const TotalLanes = 31;
export const NoLanes = 0b0000000000000000000000000000000;
export const NoLane = 0b0000000000000000000000000000000;
export const SyncLane = 0b0000000000000000000000000000001;
export const InputContinuousHydrationLane = 0b0000000000000000000000000000010;
export const InputContinuousLane = 0b0000000000000000000000000000100;
export const DefaultHydrationLane = 0b0000000000000000000000000001000;
export const DefaultLane = 0b0000000000000000000000000010000;
export const SelectiveHydrationLane = 0b0001000000000000000000000000000;
export const IdleHydrationLane = 0b0010000000000000000000000000000;
export const IdleLane = 0b0100000000000000000000000000000;
export const OffscreenLane = 0b1000000000000000000000000000000;
const NonIdleLanes = 0b0001111111111111111111111111111;
//没有时间戳
export const NoTimestamp = -1;
// 标记根的更新
export function markRootUpdated(root, updateLane) {
  // pendingLeans此根上等待生效的lane
  root.pendingLanes |= updateLane
}
// 获取当前优先级最高的车道
export function getNextLanes(root) {
  // 获取所有更新的车道
  const pendingLanes = root.pendingLanes;
  if (pendingLanes === NoLanes) {
    return NoLanes
  }
  const nextLanes = getHighestPriorityLanes(pendingLanes);
  return nextLanes

}

function getHighestPriorityLanes(lanes) {
  return getHighestPriorityLane(lanes)
}
// 找到最右边的1 只能返回一个车道
export function getHighestPriorityLane(lanes) {
  return lanes & -lanes
}
/**
 * 源码此处的逻辑有大的改动
 */

// 是否包含非空闲的工作
export function includesNonIdleWork(lanes) {
  return (lanes & NonIdleLanes) !== NoLanes;
}
export function isSubsetOfLanes(set, subset) {
  return (set & subset) === subset;
}
export function mergeLanes(a, b) {
  return a | b;
}
