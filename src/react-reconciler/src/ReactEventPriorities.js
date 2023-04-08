import { DefaultLane, IdleLane, InputContinuousLane, NoLane, SyncLane, getHighestPriorityLane, includesNonIdleWork } from "./ReactFiberLane";

// 事件优先级
// 离散事件优先级 click onchange 1
export const DiscreteEventPriority = SyncLane;
// 连续事件优先级 mouseMove 4
export const ContinuousEventPriority = InputContinuousLane;
// 默认事件优先级 16
export const DefaultEventPriority = DefaultLane;
// 空闲事件优先级 很大的优先级
export const IdleEventPriority = IdleLane;

// 获取当前的更新优先级
let currentUpdatePriority = NoLane
// 取值
export function getCurrentUpdatePriority() {
  return currentUpdatePriority
}
// 设置值
export function setCurrentUpdatePriority(newPriority) {
  currentUpdatePriority = newPriority;
}
/**
 * 判断事件优先级是不是比lane小，小意味着优先级高
 * @param {*} a 事件优先级
 * @param {*} b lane优先级
 * @returns
 */
export function isHigherEventPriority(
  a,
  b,
) {
  return a !== 0 && a < b;
}



export function lanesToEventPriority(lanes) {
  // 最高优先级的lane
  const lane = getHighestPriorityLane(lanes);
  // 是不是比这个还要高
  if (!isHigherEventPriority(DiscreteEventPriority, lane)) {
    return DiscreteEventPriority;//1
  }
  if (!isHigherEventPriority(ContinuousEventPriority, lane)) {
    return ContinuousEventPriority;//4
  }
  if (includesNonIdleWork(lane)) {
    return DefaultEventPriority;//16
  }
  return IdleEventPriority;
}

