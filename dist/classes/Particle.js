import { Color } from '../utility-classes/Color.js';
import { pi, randomAngleVtr } from '../helpers/helpers.js';
import { EventEmitter } from '../utility-classes/EventEmitter.js';
export class Particle extends EventEmitter {
    constructor(position, speed, radius, id) {
        super();
        this.move = () => {
            this.position.adjust(this.velocity);
        };
        this.handleBoundCollision = (e) => {
            if (e.direction === 'horizontal') {
                this.vx *= -1;
                this.x += e.adj;
            }
            else if (e.direction === 'vertical') {
                this.vy *= -1;
                this.y += e.adj;
            }
        };
        this.handleCollision = (e) => {
            this.velocity = e.v;
        };
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
}
//# sourceMappingURL=Particle.js.map