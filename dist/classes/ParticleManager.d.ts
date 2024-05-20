import { Particle } from "./Particle.js";
import { EventEmitter } from "../utility-classes/EventEmitter.js";
import { Vector2d } from "../utility-classes/Vector2d.js";
export type ParticleManagerOptions = {
    minSpeed: number;
    maxSpeed: number;
    minRadius: number;
    maxRadius: number;
    initialNumber: number;
    vicinity: number;
};
export declare class ParticleManager extends EventEmitter {
    particles: Set<Particle>;
    options: ParticleManagerOptions;
    bounds: [width: number, height: number];
    pMap: (Set<Particle> | undefined)[][];
    boxSize: number;
    checked: Set<number>;
    nearParticles: Set<Particle>;
    constructor(options: ParticleManagerOptions, width: number, height: number);
    incrementTime(): void;
    checkForBoundsCollision(p: Particle): void;
    checkParticleVicinity(p: Particle): void;
    randomPosition(): Vector2d;
    randomSpeed(): number;
    add(pos?: Vector2d): void;
    getParticleBox(p: Particle): Vector2d;
}
