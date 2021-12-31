export class Color {
    constructor(r = Color.randHex(), g = Color.randHex(), b = Color.randHex(), a = 1) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
    get rgba() { return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`; }
    //returns a new color from the average values of an array of other colors,
    static avgColors(colorArr) {
        const vals = { r: 0, g: 0, b: 0 };
        colorArr.forEach(color => {
            for (let val in vals) {
                vals[val] += Math.pow(color[val], 2);
            }
        });
        for (let val in vals) {
            vals[val] = Math.sqrt(vals[val] / colorArr.length);
        }
        return new Color(vals.r, vals.g, vals.b);
    }
    static randHex() {
        return Math.round(Math.random() * 255);
    }
}
//# sourceMappingURL=Color.js.map