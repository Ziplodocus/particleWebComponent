import { Particle } from "./Particle.js";
import { EventEmitter } from "../utility-classes/EventEmitter";
import { Vector2d } from "../utility-classes/Vector2d";

export class ParticleManager extends EventEmitter {
  constructor( options, width, height ) {
    super()
    const defaultOptions = {
      minSpeed: 0.2,
      maxSpeed: 0.5,
      minRadius: 3,
      maxRadius: 5,
      initialParticles: 10,
      vicinity: 50
    }
    this.particles = []
    this.options = { ...defaultOptions, ...options }
    this.bounds = { x: width, y: height }

    for ( let i = this.options.initialParticles; i > 0; i-- ) {
      this.add();
    }

    this.forParticleInLoop = ( e ) => {
      const p = e.details;
      this.checkParticleVicinity( p );
      this.checkForBoundsCollision( p );
      p.trigger( 'move' );
    }
    this.on( 'incrementTime', this.forParticleInLoop )
  }
  checkForBoundsCollision( p ) {
    const isLeft = p.x - p.radius <= 0;
    const isRight = p.x + p.radius >= this.bounds.x;
    const isOver = p.y - p.radius <= 0;
    const isUnder = p.y + p.radius >= this.bounds.y;
    if ( isLeft || isRight ) {
      p.trigger( 'boundsCollide', {
        direction: 'horizontal',
        adj: isLeft ? p.radius - p.x : this.bounds.x - p.x - p.radius
      } )
    }
    if ( isUnder || isOver ) {
      p.trigger( 'boundsCollide', {
        direction: 'vertical',
        adj: isOver ? p.radius - p.y : this.bounds.y - p.y - p.radius
      } )
    }
  }
  checkParticleVicinity( p ) {
    let i = this.particles.indexOf( p );
    this.particles.forEach( q => {
      if ( p == q ) return;
      //calcing values
      const perp = p.position.minus( q.position );
      const distance = perp.norm;
      const isInVicinity = ( distance <= this.options.vicinity )
      if ( isInVicinity ) {
        this.trigger( 'inVicinity', { p, q } )
      } else return;
      // Calculate unit vectors only if required
      const radii = p.radius + q.radius;
      const isOverlap = ( distance < radii );
      const isCollision = ( distance <= radii );
      const perpunit = isCollision && perp.getUnit();
      const tangunit = isCollision && perp.perp().getUnit();

      // Shifts particles to the point of minimal( not zero! ) contact if they are overlapped
      if ( isOverlap ) {
        const diff = radii - distance;
        const ratio = p.radius / radii;
        const padj = perpunit.mult( ( 1 - ratio ) * diff );
        p.position.adjust( padj );
        const qadj = perpunit.mult( ratio * -diff );
        q.position.adjust( qadj );
      }

      //Handles if this particle collides with another, redirecting both
      if ( isCollision ) {
        //u1 is the initial velocity of this particle and u2 the initial velocity of the colliding particle
        //Projection of initial velocity along the perpendicular and tangent direction of the point of contact
        const upp = p.velocity.dot( perpunit );
        const uqp = q.velocity.dot( perpunit );
        const upt = p.velocity.dot( tangunit );
        const uqt = q.velocity.dot( tangunit );

        /*
          New velocity in the direction of the perpendicular 
          The velocity tangent to the point of collision does not change,
          but the perpendicular does, hence turning the 2dimensional problem 
          into a 1dimensional, (1 dimensional collision equation)
        */
        const totalMass = p.mass + q.mass;
        const vpp = ( q.mass * ( uqp - upp ) + p.mass * upp + q.mass * uqp ) / totalMass;
        const vqp = ( p.mass * ( upp - uqp ) + p.mass * upp + q.mass * uqp ) / totalMass;

        //Projecting the perp and tang velocities back onto cartesian coordinates
        const xUnit = new Vector2d( 1, 0 );
        const yUnit = new Vector2d( 0, 1 );
        const pvx = perpunit.mult( vpp ).dot( xUnit ) + tangunit.mult( upt ).dot( xUnit );
        const pvy = perpunit.mult( vpp ).dot( yUnit ) + tangunit.mult( upt ).dot( yUnit );
        const qvx = perpunit.mult( vqp ).dot( xUnit ) + tangunit.mult( uqt ).dot( xUnit );
        const qvy = perpunit.mult( vqp ).dot( yUnit ) + tangunit.mult( uqt ).dot( yUnit );
        const pv = new Vector2d( pvx, pvy );
        const qv = new Vector2d( qvx, qvy );
        //Setting the new velocities on the particles
        p.trigger( 'collision', { v: pv } );
        q.trigger( 'collision', { v: qv } );
      }
    } )
  }
  randomPosition() {
    const randX = Math.random() * ( this.bounds.x - 2 * this.options.maxRadius ) + this.options.maxRadius;
    const randY = Math.random() * ( this.bounds.y - 2 * this.options.maxRadius ) + this.options.maxRadius;
    return new Vector2d( randX, randY );
  }
  randomSpeed() {
    const ops = this.options;
    return Math.random() * ( ops.maxSpeed - ops.minSpeed ) + ops.minSpeed;
  }
  add( pos = this.randomPosition() ) {
    const speed = this.randomSpeed();
    const radius = this.options.minRadius + ( this.options.maxRadius - this.options.minRadius ) * ( ( speed - this.options.minSpeed ) / ( this.options.maxSpeed - this.options.minSpeed + 0.000001 ) )
    this.particles.push( new Particle( pos, speed, radius ) );
  }
}