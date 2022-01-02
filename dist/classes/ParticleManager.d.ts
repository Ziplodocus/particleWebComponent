import { Particle } from "./Particle.js";
import { EventEmitter, ZEvent } from "../utility-classes/EventEmitter.js";
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
    particles: Particle[];
    options: ParticleManagerOptions;
    bounds: {
        x: number;
        y: number;
    };
    constructor(options: ParticleManagerOptions, width: number, height: number);
    incrementTime: (e: ZEvent) => void;
    checkForBoundsCollision(p: Particle): void;
    checkParticleVicinity(p: Particle): void;
    randomPosition(): Vector2d;
    randomSpeed(): number;
    add(pos?: Vector2d): void;
}
