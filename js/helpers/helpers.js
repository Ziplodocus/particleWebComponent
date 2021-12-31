import { Vector2d } from "../utility-classes/Vector2d.js";
const pi = Math.PI;
const randomAngle = () => 2 * pi * Math.random();
const randomAngleVtr = () => {
    const directionRadeons = randomAngle();
    return new Vector2d(Math.cos(directionRadeons), Math.sin(directionRadeons));
};
export { randomAngle, pi, randomAngleVtr };
//# sourceMappingURL=helpers.js.map