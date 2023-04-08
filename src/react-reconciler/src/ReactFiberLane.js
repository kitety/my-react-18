
// lane values below should be kept in sync with getLabelForLane(), used by react-devtools-timeline.
// If those values are changed that package should be rebuilt and redeployed.

export const TotalLanes = 31;

export const NoLanes = /*                        */ 0b0000000000000000000000000000000;
export const NoLane = /*                          */ 0b0000000000000000000000000000000;

export const SyncHydrationLane = /*               */ 0b0000000000000000000000000000001;
export const SyncLane = /*                        */ 0b0000000000000000000000000000010;

export const InputContinuousHydrationLane = /*    */ 0b0000000000000000000000000000100;
export const InputContinuousLane = /*             */ 0b0000000000000000000000000001000;

export const DefaultHydrationLane = /*            */ 0b0000000000000000000000000010000;
export const DefaultLane = /*                     */ 0b0000000000000000000000000100000;

export const SyncUpdateLanes = /*                */ 0b0000000000000000000000000101010;

export const TransitionHydrationLane = /*                */ 0b0000000000000000000000001000000;
export const TransitionLanes = /*                       */ 0b0000000011111111111111110000000;
export const TransitionLane1 = /*                        */ 0b0000000000000000000000010000000;
export const TransitionLane2 = /*                        */ 0b0000000000000000000000100000000;
export const TransitionLane3 = /*                        */ 0b0000000000000000000001000000000;
export const TransitionLane4 = /*                        */ 0b0000000000000000000010000000000;
export const TransitionLane5 = /*                        */ 0b0000000000000000000100000000000;
export const TransitionLane6 = /*                        */ 0b0000000000000000001000000000000;
export const TransitionLane7 = /*                        */ 0b0000000000000000010000000000000;
export const TransitionLane8 = /*                        */ 0b0000000000000000100000000000000;
export const TransitionLane9 = /*                        */ 0b0000000000000001000000000000000;
export const TransitionLane10 = /*                       */ 0b0000000000000010000000000000000;
export const TransitionLane11 = /*                       */ 0b0000000000000100000000000000000;
export const TransitionLane12 = /*                       */ 0b0000000000001000000000000000000;
export const TransitionLane13 = /*                       */ 0b0000000000010000000000000000000;
export const TransitionLane14 = /*                       */ 0b0000000000100000000000000000000;
export const TransitionLane15 = /*                       */ 0b0000000001000000000000000000000;
export const TransitionLane16 = /*                       */ 0b0000000010000000000000000000000;

export const RetryLanes = /*                            */ 0b0000111100000000000000000000000;
export const RetryLane1 = /*                             */ 0b0000000100000000000000000000000;
export const RetryLane2 = /*                             */ 0b0000001000000000000000000000000;
export const RetryLane3 = /*                             */ 0b0000010000000000000000000000000;
export const RetryLane4 = /*                             */ 0b0000100000000000000000000000000;

export const SomeRetryLane = RetryLane1;

export const SelectiveHydrationLane = /*          */ 0b0001000000000000000000000000000;

export const NonIdleLanes = /*                          */ 0b0001111111111111111111111111111;

export const IdleHydrationLane = /*               */ 0b0010000000000000000000000000000;
export const IdleLane = /*                        */ 0b0100000000000000000000000000000;

export const OffscreenLane = /*                   */ 0b1000000000000000000000000000000;

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
