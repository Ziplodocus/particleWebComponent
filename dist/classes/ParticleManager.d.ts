import { Particle } from "./Particle.js";
import { EventEmitter } from "../utility-classes/EventEmitter.js";
import { Vector2d } from "../utility-classes/Vector2d.js";
export declare type ParticleManagerOptions = {
    minSpeed: number;
    maxSpeed: number;
    minRadius: number;
    maxRadius: number;
    initialParticles: number;
    vicinity: number;
};
export declare class ParticleManager extends EventEmitter {
    particles: Set<Particle>;
    options: ParticleManagerOptions;
    bounds: {
        x: number;
        y: number;
    };
    pMap: Map<string, Set<Particle>>;
    boxSize: number;
    checked: Set<number>;
    nearParticles: Set<Particle>;
    constructor(options: ParticleManagerOptions, width: number, height: number);
    incrementTime: () => void;
    checkForBoundsCollision(p: Particle): void;
    checkParticleVicinity(p: Particle): void;
    randomPosition(): Vector2d;
    randomSpeed(): number;
    add(pos?: Vector2d): void;
    pBox(p: Particle): string;
}
