export declare class Color {
    r: number;
    g: number;
    b: number;
    a: number;
    constructor(r?: number, g?: number, b?: number, a?: number);
    get rgba(): string;
    static avgColors(colorArr: Color[]): Color;
    static randHex(): number;
}
