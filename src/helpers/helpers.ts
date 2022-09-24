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

export const ts = (name:string) => {
  total[name] = 0;
}
let total : Record<string, number> = {};
export const t = (name : string) => {
  let startTime = performance.mark(name).startTime;
  return () => {
    const endTime = performance.mark(name).startTime;
    total[name] += endTime - startTime;
  }
}
export const tc = (name :string) => {
  console.log(name + ': ' + total[name]);
}
