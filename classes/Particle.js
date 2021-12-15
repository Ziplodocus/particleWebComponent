import { Color } from '../utility-classes/Color';
import { pi, randomAngleVtr } from '../helpers/helpers';
import { EventEmitter } from '../utility-classes/EventEmitter';

export class Particle extends EventEmitter {
	constructor( position, speed, radius ) {
		super();
		this.position = position;
		this.velocity = randomAngleVtr().mult( speed );
		this.color = new Color();
		this.lineColor = new Color();
		this.radius = radius;

		this.move = () => {
			this.position.adjust( this.velocity )
		};
		this.on( 'move', this.move )
		this.handleBoundCollision = e => {
			if ( e.direction === 'horizontal' ) {
				this.vx *= -1;
				this.x += e.adj;
			}
			if ( e.direction === 'vertical' ) {
				this.vy *= -1;
				this.y += e.adj;
			}
		}
		this.on( 'boundsCollide', this.handleBoundCollision )
		this.handleCollision = e => {
			this.velocity = e.v;
		}
		this.on( 'collision', this.handleCollision )
	}

	get x() { return this.position.x }
	get y() { return this.position.y }
	get vx() { return this.velocity.x }
	get vy() { return this.velocity.y }
	get speed() { return this.velocity.norm }
	get direction() { return Math.acos( this.vx / this.speed ) }
	get mass() { return 4 / 3 * pi * this.radius ** 3 }

	set x( posX ) { this.position.x = posX }
	set y( posY ) { this.position.y = posY }
	set vx( velX ) { this.velocity.x = velX }
	set vy( velY ) { this.velocity.y = velY }
}