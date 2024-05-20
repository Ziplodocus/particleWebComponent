
export class Vector2d {
  vec: [number, number];

  constructor(x = 0, y = 0) {
    this.vec = [x, y];
  }

  get x(): number {
    return this.vec[0];
  }

  get y(): number {
    return this.vec[1];
  }

  set x(x: number) {
    this.vec[0] = x;
  }

  set y(y: number) {
    this.vec[1] = y;
  }

  get norm(): number {
    return (this.x ** 2 + this.y ** 2) ** 0.5;
  }

  copy(): Vector2d {
    return new Vector2d(this.x, this.y);
  }

  set(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }

  scale(scalar: number): void {
    this.x *= scalar;
    this.y *= scalar;
  }

  adjust(vtr: Vector2d): void {
    this.x += vtr.x;
    this.y += vtr.y;
  }

  perp(): Vector2d {
    return new Vector2d(-this.y, this.x);
  }

  mult(scalar: number): Vector2d {
    return new Vector2d(this.x * scalar, this.y * scalar);
  }

  dot(a: Vector2d): number {
    return this.x * a.x + this.y * a.y;
  }

  add(vtr: Vector2d): Vector2d {
    return new Vector2d(this.x + vtr.x, this.y + vtr.y);
  }

  minus(vtr: Vector2d): Vector2d {
    return this.add(vtr.mult(-1));
  }

  getUnit(): Vector2d {
    return this.mult(1 / this.norm);
  }
}

