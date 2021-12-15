
export class Color {
  constructor( r = Color.randHex(), g = Color.randHex(), b = Color.randHex(), a = 1 ) {
    this._r = r;
    this._g = g;
    this._b = b;
    this._a = a;
  }
  //Are these getters and setters pointless? should setters be named differently?
  get r() { return this._r }
  get g() { return this._g }
  get b() { return this._b }
  get a() { return this._a }
  get rgba() { return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})` }

  set r( re ) { this._r = re }
  set g( gr ) { this._g = gr }
  set b( bl ) { this._b = bl }
  set a( al ) { this._a = al }

  //returns a new color from the average values of an array of other colors,
  static avgColors( colorArr ) {
    const vals = { r: 0, g: 0, b: 0 };
    colorArr.forEach( color => {
      for ( let val in vals ) {
        vals[ val ] += color[ val ] ** 2;
      }
    } )
    for ( let val in vals ) {
      vals[ val ] = Math.sqrt( vals[ val ] / colorArr.length )
    }
    return new Color( vals.r, vals.g, vals.b );
  }

  static randHex() {
    return Math.round( Math.random() * 255 )
  }
}