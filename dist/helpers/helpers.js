import { Vector2d } from "../utility-classes/Vector2d.js";
export const pi = Math.PI;
export const randomAngle = () => 2 * pi * Math.random();
export const randomAngleVtr = () => {
    const directionRadeons = randomAngle();
    return new Vector2d([
        Math.cos(directionRadeons),
        Math.sin(directionRadeons)
    ]);
};
export const ts = (name) => {
    total[name] = 0;
};
let total = {};
export const t = (name) => {
    let startTime = performance.mark(name).startTime;
    return () => {
        const endTime = performance.mark(name).startTime;
        total[name] += endTime - startTime;
    };
};
export const tc = (name) => {
    console.log(name + ': ' + total[name]);
};
//# sourceMappingURL=helpers.js.map