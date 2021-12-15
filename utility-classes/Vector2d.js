
export class Vector2d {
  constructor( x = 0, y = 0 ) {
    this.x = x;
    this.y = y;
  }
  get norm() {
    return Math.sqrt( this.x ** 2 + this.y ** 2 )
  }
  copy() {
    return new Vector2d( this.x, this.y )
  }
  set( x, y ) {
    this.x = x;
    this.y = y;
  }
  scale( scalar ) {
    this.x *= scalar;
    this.y *= scalar;
  }
  adjust( vtr ) {
    this.x += vtr.x;
    this.y += vtr.y;
  }
  perp() {
    return new Vector2d( -this.y, this.x )
  }
  mult( scalar ) {
    return new Vector2d( this.x * scalar, this.y * scalar );
  }
  dot( a ) {
    return this.x * a.x + this.y * a.y;
  }
  add( vtr ) {
    return new Vector2d( this.x + vtr.x, this.y + vtr.y )
  }
  minus( vtr ) {
    return this.add( vtr.mult( -1 ) );
  }
  getUnit() {
    return this.mult( 1 / this.norm );
  }
}