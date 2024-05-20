export declare class Color {
    data: [r: number, g: number, b: number, a: number];
    get r(): number;
    get g(): number;
    get b(): number;
    get a(): number;
    set r(r: number);
    set g(g: number);
    set b(b: number);
    set a(a: number);
    constructor(r?: number, g?: number, b?: number, a?: number);
    get rgba(): string;
    static avgColors(colors: Color[]): Color;
    static randHex(): number;
}
