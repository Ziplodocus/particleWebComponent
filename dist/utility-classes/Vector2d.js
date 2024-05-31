export class Vector2d {
    constructor(vec) {
        this.vec = vec;
    }
    get x() {
        return this.vec[0];
    }
    get y() {
        return this.vec[1];
    }
    set x(x) {
        this.vec[0] = x;
    }
    set y(y) {
        this.vec[1] = y;
    }
    get norm() {
        return (this.x ** 2 + this.y ** 2) ** 0.5;
    }
    copy() {
        return new Vector2d([this.vec[0], this.vec[1]]);
    }
    set(x, y) {
        this.x = x;
        this.y = y;
    }
    scale(scalar) {
        this.x *= scalar;
        this.y *= scalar;
    }
    adjust(vtr) {
        this.x += vtr.x;
        this.y += vtr.y;
    }
    perp() {
        return new Vector2d([-this.y, this.x]);
    }
    mult(scalar) {
        return new Vector2d([this.x * scalar, this.y * scalar]);
    }
    dot(a) {
        return this.x * a.x + this.y * a.y;
    }
    add(vtr) {
        return new Vector2d([this.x + vtr.x, this.y + vtr.y]);
    }
    minus(vtr) {
        return this.add(vtr.mult(-1));
    }
    getUnit() {
        return this.mult(1 / this.norm);
    }
}
//# sourceMappingURL=Vector2d.js.map