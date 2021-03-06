import { ParticleManager } from './ParticleManager.js';
import { Vector2d } from '../utility-classes/Vector2d.js';
import { ZEvent } from '../utility-classes/EventEmitter.js';
import { Particle } from './Particle.js';
declare type ParticleCanvasOptions = {
    fillOpacity: number;
    edgeOpacity: number;
    mouseEdges: boolean;
    fill: boolean;
    fillColor: string;
    outline: boolean;
    outlineColor: string;
    edges: boolean;
    pixelDensity: number;
};
export declare class ParticleCanvas extends HTMLCanvasElement {
    options: ParticleCanvasOptions;
    width: number;
    height: number;
    ctx: CanvasRenderingContext2D;
    particleManager: ParticleManager;
    mousePosition: Vector2d;
    constructor();
    get area(): number;
    createResizeHandler(): (entries: ResizeObserverEntry[]) => void;
    hoverHandler: (e: MouseEvent) => void;
    mouseClickHandler: (e: MouseEvent) => void;
    mouseEnterHandler: () => void;
    mouseLeaveHandler: () => void;
    inVicinityHandler: (e: ZEvent) => void;
    refresh(): void;
    resize: () => void;
    setUpParticleRendering(): void;
    renderParticle(p: Particle): void;
    renderEdge(p: Particle, q: Particle): void;
    renderMouseEdges(): void;
    computedStyle(prop: string): string;
}
export {};
