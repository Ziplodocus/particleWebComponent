import { Color } from '../utility-classes/Color.js';
import { EventEmitter, ZEvent } from '../utility-classes/EventEmitter.js';
import { Vector2d } from '../utility-classes/Vector2d.js';
export declare class Particle extends EventEmitter {
    position: Vector2d;
    velocity: Vector2d;
    color: Color;
    lineColor: Color;
    radius: number;
    constructor(position: Vector2d, speed: number, radius: number);
    get x(): number;
    get y(): number;
    get vx(): number;
    get vy(): number;
    get speed(): number;
    get direction(): number;
    get mass(): number;
    set x(posX: number);
    set y(posY: number);
    set vx(velX: number);
    set vy(velY: number);
    move: () => void;
    handleBoundCollision: (e: ZEvent) => void;
    handleCollision: (e: ZEvent) => void;
}
