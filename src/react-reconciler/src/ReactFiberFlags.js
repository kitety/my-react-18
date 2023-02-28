
// Don't change these values. They're used by React Dev Tools.
export const NoFlags = /*                      */ 0b000000000000000000000000000;
export const PerformedWork = /*                */ 0b000000000000000000000000001;
export const Placement = /*                    */ 0b000000000000000000000000010;
export const DidCapture = /*                   */ 0b000000000000000000010000000;
export const Hydrating = /*                    */ 0b000000000000001000000000000;

// You can change the rest (and add more).
export const Update = /*                       */ 0b000000000000000000000000100;
/* Skipped value:                                 0b000000000000000000000001000; */

export const ChildDeletion = /*                */ 0b000000000000000000000010000;
export const MutationMask =
  Placement |
  Update | ChildDeletion
