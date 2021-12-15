import { Vector2d as Vtr } from "../classes/Vector2d";

const pi = Math.PI;
const randomAngle = () => 2 * pi * Math.random()
const randomAngleVtr = () => {
  const directionRadeons = randomAngle();
  return new Vtr(
    Math.cos( directionRadeons ),
    Math.sin( directionRadeons )
  );
}

export { randomAngle, pi, randomAngleVtr }