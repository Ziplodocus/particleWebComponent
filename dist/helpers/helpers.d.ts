import { Vector2d } from "../utility-classes/Vector2d.js";
declare const pi: number;
declare const randomAngle: () => number;
declare const randomAngleVtr: () => Vector2d;
export { randomAngle, pi, randomAngleVtr };
export declare const ts: (name: string) => void;
export declare const t: (name: string) => () => void;
export declare const tc: (name: string) => void;
