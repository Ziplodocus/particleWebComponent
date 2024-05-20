
export class Color {
  data: [r: number, g: number, b: number, a: number];

  get r() {
    return this.data[0];
  }

  get g() {
    return this.data[1];
  }

  get b() {
    return this.data[2];
  }

  get a() {
    return this.data[3];
  }

  set r(r: number) {
    this.data[0] = r;
  }

  set g(g: number) {
    this.data[1] = g;
  }

  set b(b: number) {
    this.data[2] = b;
  }

  set a(a: number) {
    this.data[3] = a;
  }

  constructor(r = Color.randHex(), g = Color.randHex(), b = Color.randHex(), a = 1) {
    this.data = [r, g, b, a];
  }

  get rgba(): string { return `rgba(${this.data.join(', ')})`; }


  //returns a new color from the average values of an array of other colors,
  static avgColors(colors: Color[]): Color {
    const avg: [r: number, g: number, b: number] = [0, 0, 0];

    colors.forEach(color => {
      for (let val in avg) {
        avg[val] += color.data[val] ** 2;
      }
    });

    for (let val in avg) {
      avg[val] = (avg[val] / colors.length) ** 0.5;
    }

    return new Color(avg[0], avg[1], avg[2]);
  }

  static randHex(): number {
    return Math.round(Math.random() * 255);
  }
}