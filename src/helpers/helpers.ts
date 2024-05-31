import { Vector2d } from "../utility-classes/Vector2d.js";

export const pi: number = Math.PI;

export const randomAngle = (): number => 2 * pi * Math.random();

export const randomAngleVtr = (): Vector2d => {
  const directionRadeons = randomAngle();
  return new Vector2d([
    Math.cos(directionRadeons),
    Math.sin(directionRadeons)
  ]);
};



export const ts = (name: string) => {
  total[name] = 0;
};
let total: Record<string, number> = {};

export const t = (name: string) => {
  let startTime = performance.mark(name).startTime;
  return () => {
    const endTime = performance.mark(name).startTime;
    total[name] += endTime - startTime;
  };
};

export const tc = (name: string) => {
  console.log(name + ': ' + total[name]);
};
