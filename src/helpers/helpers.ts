import { Vector2d } from "../utility-classes/Vector2d.js";

const pi: number = Math.PI;
const randomAngle = (): number => 2 * pi * Math.random()
const randomAngleVtr = (): Vector2d => {
  const directionRadeons = randomAngle();
  return new Vector2d(
    Math.cos(directionRadeons),
    Math.sin(directionRadeons)
  );
}

export { randomAngle, pi, randomAngleVtr }