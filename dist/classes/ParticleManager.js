import { Particle } from "./Particle.js";
import { EventEmitter } from "../utility-classes/EventEmitter.js";
import { Vector2d } from "../utility-classes/Vector2d.js";
const defaultParticleOptions = {
    minSpeed: 0.3,
    maxSpeed: 0.5,
    minRadius: 2,
    maxRadius: 8,
    initialNumber: 15,
    vicinity: 50
};
export class ParticleManager extends EventEmitter {
    constructor(options, width, height) {
        super();
        this.particles = new Set();
        this.options = { ...defaultParticleOptions, ...options };
        this.bounds = [width, height];
        this.boxSize = Math.ceil(Math.max(2 * this.options.minRadius, this.options.vicinity));
        this.checked = new Set();
        this.nearParticles = new Set();
        // Tracks local positions of particles
        this.pMap = (new Array(Math.ceil(this.bounds[0] / this.boxSize)))
            .fill(new Array(Math.ceil(this.bounds[1] / this.boxSize)));
        for (let i = this.options.initialNumber; i > 0; i--) {
            this.add();
        }
        this.on('incrementTime', this.incrementTime.bind(this));
    }
    incrementTime() {
        this.particles.forEach((p) => {
            p.move();
            const coords = this.getParticleBox(p);
            if (coords.x !== p.x || coords.y !== p.y) {
                let box = this.pMap[p.box.x][p.box.y];
                box.delete(p);
                box = this.pMap[coords.x][coords.y];
                p.box = coords;
                if (box === undefined) {
                    this.pMap[coords.x][coords.y] = new Set([p]);
                }
                else {
                    box.add(p);
                }
            }
            this.checkParticleVicinity(p);
            this.checkForBoundsCollision(p);
        });
        this.checked.clear();
    }
    ;
    checkForBoundsCollision(p) {
        const isLeft = p.x - p.radius <= 0;
        const isRight = p.x + p.radius >= this.bounds[0];
        const isOver = p.y - p.radius <= 0;
        const isUnder = p.y + p.radius >= this.bounds[1];
        if (isLeft || isRight) {
            p.trigger('boundsCollide', {
                direction: 'horizontal',
                adj: isLeft ? p.radius - p.x : this.bounds[0] - p.x - p.radius
            });
        }
        if (isUnder || isOver) {
            p.trigger('boundsCollide', {
                direction: 'vertical',
                adj: isOver ? p.radius - p.y : this.bounds[1] - p.y - p.radius
            });
        }
    }
    checkParticleVicinity(p) {
        const box = this.getParticleBox(p);
        /*
        Determine which particles are close enough to interact
        with and add them to a set
        */
        this.nearParticles = new Set();
        for (let i = box.x - 1; i <= box.x + 1; i++) {
            for (let j = box.y - 1; j <= box.y + 1; j++) {
                const part = this.pMap?.[i]?.[j];
                if (!part)
                    continue;
                part.forEach(nearParticle => this.nearParticles.add(nearParticle));
            }
        }
        /*
        Check vicinity only for particles in neighbouring boxes
        */
        this.nearParticles.forEach((q) => {
            // Skip already checked particles
            if (this.checked.has(q.id))
                return;
            if (p === q)
                return;
            //calcing values
            const perp = p.position.minus(q.position);
            const distance = perp.norm;
            const radii = p.radius + q.radius;
            const inVicinity = (distance <= this.options.vicinity);
            // Checks if particle is in 'vicinity'
            // Additional else if required in case 'vicinity' is less than the radius
            if (inVicinity)
                this.trigger('inVicinity', { p, q });
            else if (this.options.vicinity > radii)
                return;
            // Checks if the interaction is a collision
            const isCollision = (distance <= radii);
            if (!isCollision)
                return;
            const perpunit = isCollision && perp.getUnit();
            const tangunit = isCollision && perp.perp().getUnit();
            handleOverlap();
            //u1 is the initial velocity of this particle and u2 the initial velocity of the colliding particle
            //Projection of initial velocity along the perpendicular and tangent direction of the point of contact
            const upp = p.velocity.dot(perpunit);
            const uqp = q.velocity.dot(perpunit);
            const upt = p.velocity.dot(tangunit);
            const uqt = q.velocity.dot(tangunit);
            /*
            New velocity in the direction of the perpendicular
            The velocity tangent to the point of collision does not change,
            but the perpendicular does, hence turning the 2dimensional problem
            into a 1dimensional, (1 dimensional collision equation)
            */
            const totalMass = p.mass + q.mass;
            const vpp = (q.mass * (uqp - upp) + p.mass * upp + q.mass * uqp) / totalMass;
            const vqp = (p.mass * (upp - uqp) + p.mass * upp + q.mass * uqp) / totalMass;
            //Projecting the perp and tang velocities back onto cartesian coordinates
            const xUnit = new Vector2d(1, 0);
            const yUnit = new Vector2d(0, 1);
            const pvx = perpunit.mult(vpp).dot(xUnit) + tangunit.mult(upt).dot(xUnit);
            const pvy = perpunit.mult(vpp).dot(yUnit) + tangunit.mult(upt).dot(yUnit);
            const qvx = perpunit.mult(vqp).dot(xUnit) + tangunit.mult(uqt).dot(xUnit);
            const qvy = perpunit.mult(vqp).dot(yUnit) + tangunit.mult(uqt).dot(yUnit);
            const pv = new Vector2d(pvx, pvy);
            const qv = new Vector2d(qvx, qvy);
            //Setting the new velocities on the particles
            p.trigger('collision', { v: pv });
            q.trigger('collision', { v: qv });
            // Shifts particles to the point of minimal( not zero! ) contact if they are overlapped
            function handleOverlap() {
                const diff = radii - distance;
                const ratio = p.radius / radii;
                const padj = perpunit.mult((1 - ratio) * diff);
                p.position.adjust(padj);
                const qadj = perpunit.mult(ratio * -diff);
                q.position.adjust(qadj);
            }
        });
        this.checked.add(p.id);
    }
    randomPosition() {
        const randX = Math.random() * (this.bounds[0] - 2 * this.options.maxRadius) + this.options.maxRadius;
        const randY = Math.random() * (this.bounds[1] - 2 * this.options.maxRadius) + this.options.maxRadius;
        return new Vector2d(randX, randY);
    }
    randomSpeed() {
        return Math.random() * (this.options.maxSpeed - this.options.minSpeed) + this.options.minSpeed;
    }
    add(pos = this.randomPosition()) {
        const speed = this.randomSpeed();
        const radius = this.options.minRadius
            + (this.options.maxRadius - this.options.minRadius)
                * ((speed - this.options.minSpeed)
                    / (this.options.maxSpeed - this.options.minSpeed + 0.000001));
        const p = new Particle(pos, speed, radius, this.particles.size);
        this.particles.add(p);
        const coords = this.getParticleBox(p);
        p.box = coords;
        let box = this.pMap[coords.x][coords.y];
        if (box === undefined) {
            this.pMap[coords.x][coords.y] = new Set([p]);
        }
        else {
            box.add(p);
        }
    }
    getParticleBox(p) {
        return new Vector2d(Math.min(Math.max(0, Math.floor(p.x / this.boxSize)), this.pMap.length - 1), Math.min(Math.max(0, Math.floor(p.y / this.boxSize)), this.pMap[0].length - 1));
    }
}
//# sourceMappingURL=ParticleManager.js.map