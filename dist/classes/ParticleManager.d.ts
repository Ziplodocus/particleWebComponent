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
    bounds: Vector2d;
    grid: (Set<Particle> | undefined)[][];
    cellSize: number;
    checked: Set<number>;
    nearParticles: Set<Particle>;
    constructor(options: ParticleManagerOptions, bounds: Vector2d);
    incrementTime(): void;
    checkForBoundsCollision(p: Particle): void;
    checkParticleVicinity(p: Particle): void;
    /**
    * Determines the action required based on the distance between the two particles
    */
    handleNearbyParticle(p: Particle, q: Particle): void;
    randomPosition(): Vector2d;
    randomSpeed(): number;
    add(pos?: Vector2d): void;
    updateParticleCell(p: Particle): void;
    getParticleCoords(p: Particle): Vector2d;
    getCell(coords: Vector2d): Set<Particle> | undefined;
    /**
     * Update the cell size. Dependent on the minRadius and vicinity options.
     * setGrid should also be called after this function
     */
    setCellSize(): void;
    /**
     * Updates the grid and the particle's cell.
     * Call if the bounds or cellsize change
     */
    setGrid(): void;
    /**
     * Helper that also updates the grid when the bounds are updated.
     */
    setBounds(bounds: Vector2d): void;
}
