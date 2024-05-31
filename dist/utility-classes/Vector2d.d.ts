export declare class Vector2d {
    vec: [number, number];
    constructor(vec: [number, number]);
    get x(): number;
    get y(): number;
    set x(x: number);
    set y(y: number);
    get norm(): number;
    copy(): Vector2d;
    set(x: number, y: number): void;
    scale(scalar: number): void;
    adjust(vtr: Vector2d): void;
    perp(): Vector2d;
    mult(scalar: number): Vector2d;
    dot(a: Vector2d): number;
    add(vtr: Vector2d): Vector2d;
    minus(vtr: Vector2d): Vector2d;
    getUnit(): Vector2d;
}
