import { Color } from '../utility-classes/Color.js';
import { pi, randomAngleVtr } from '../helpers/helpers.js';
import { EventEmitter, ZEvent } from '../utility-classes/EventEmitter.js';
import { Vector2d } from '../utility-classes/Vector2d.js';

export class Particle extends EventEmitter {
	id: number;
	cellCoords?: Vector2d;
	position: Vector2d;
	velocity: Vector2d;
	color: Color;
	radius: number;
	mass: number;


	constructor(position: Vector2d, speed: number, radius: number, id: number) {
		super();

		this.id = id;
		this.position = position;
		this.velocity = randomAngleVtr().mult(speed);
		this.radius = radius;
		this.mass = 4 / 3 * pi * this.radius ** 3;

		this.color = new Color();

		this.on('boundsCollide', this.handleBoundCollision);
		this.on('collision', this.handleCollision);
	}

	get x() { return this.position.x; }
	get y() { return this.position.y; }
	get vx() { return this.velocity.x; }
	get vy() { return this.velocity.y; }
	get speed() { return this.velocity.norm; }
	get direction() { return Math.acos(this.vx / this.speed); }

	set x(posX) { this.position.x = posX; }
	set y(posY) { this.position.y = posY; }
	set vx(velX) { this.velocity.x = velX; }
	set vy(velY) { this.velocity.y = velY; }

	move = (): void => {
		this.position.adjust(this.velocity);
	};

	handleBoundCollision = (e: ZEvent): void => {
		if (e.direction === 'horizontal') {
			this.vx *= -1;
			this.x += e.adj;
		} else if (e.direction === 'vertical') {
			this.vy *= -1;
			this.y += e.adj;
		}
	};

	handleCollision = (e: ZEvent): void => {
		this.velocity = e.v;
	};
}