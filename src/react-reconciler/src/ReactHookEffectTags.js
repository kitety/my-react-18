export const NoFlags = /*   */ 0b0000;

// Represents whether effect should fire.
// 有effect
export const HasEffect = /* */ 0b0001;

// Represents the phase in which the effect (not the clean-up) fires.
export const Insertion = /* */ 0b0010;
// useLayoutEffect
export const Layout = /*    */ 0b0100;

// 是useEffect
export const Passive = /*   */ 0b1000;
