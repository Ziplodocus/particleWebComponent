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
    constructor(options, bounds) {
        super();
        this.particles = new Set();
        this.options = { ...defaultParticleOptions, ...options };
        this.setCellSize();
        this.setBounds(bounds);
        this.checked = new Set();
        for (let i = this.options.initialNumber; i > 0; i--) {
            this.add();
        }
        this.on('incrementTime', this.incrementTime.bind(this));
    }
    incrementTime() {
        this.particles.forEach((p) => {
            p.move();
            this.updateParticleCell(p);
            this.checkForBoundsCollision(p);
            this.checkParticleVicinity(p);
        });
        this.checked.clear();
    }
    ;
    checkForBoundsCollision(p) {
        const isLeft = p.x - p.radius <= 0;
        const isRight = p.x + p.radius >= this.bounds.x;
        const isOver = p.y - p.radius <= 0;
        const isUnder = p.y + p.radius >= this.bounds.y;
        if (isLeft || isRight) {
            p.trigger('boundsCollide', {
                direction: 'horizontal',
                adj: isLeft ? p.radius - p.x : this.bounds.x - p.x - p.radius
            });
        }
        if (isUnder || isOver) {
            p.trigger('boundsCollide', {
                direction: 'vertical',
                adj: isOver ? p.radius - p.y : this.bounds.y - p.y - p.radius
            });
        }
    }
    checkParticleVicinity(p) {
        const coords = this.getParticleCoords(p);
        /*
        Get the particles from the surrounding 'cells' and handle the interactions between them
        */
        for (let x = coords.x - 1; x <= coords.x + 1; x++) {
            for (let y = coords.y - 1; y <= coords.y + 1; y++) {
                const cell = this.getCell(new Vector2d(x, y));
                if (!cell)
                    continue;
                cell.forEach((q) => this.handleNearbyParticle(p, q));
            }
        }
        this.checked.add(p.id);
    }
    /**
    * Determines the action required based on the distance between the two particles
    */
    handleNearbyParticle(p, q) {
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
    }
    randomPosition() {
        const randX = Math.random() * (this.bounds.x - 2 * this.options.maxRadius) + this.options.maxRadius;
        const randY = Math.random() * (this.bounds.y - 2 * this.options.maxRadius) + this.options.maxRadius;
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
        this.updateParticleCell(p);
    }
    updateParticleCell(p) {
        const newCoords = this.getParticleCoords(p);
        const hasOldCell = p?.cellCoords !== undefined;
        const hasChangedCell = !hasOldCell ||
            newCoords.x !== p.cellCoords.x ||
            newCoords.y !== p.cellCoords.y;
        if (!hasChangedCell)
            return;
        if (hasOldCell) {
            const oldCell = this.getCell(p.cellCoords);
            oldCell.delete(p);
        }
        p.cellCoords = newCoords;
        const newCell = this.getCell(newCoords);
        newCell.add(p);
    }
    getParticleCoords(p) {
        return new Vector2d(Math.min(Math.max(0, Math.floor(p.x / this.cellSize)), this.grid.length - 1), Math.min(Math.max(0, Math.floor(p.y / this.cellSize)), this.grid[0].length - 1));
    }
    getCell(coords) {
        if (coords.x >= this.grid.length || coords.y >= this.grid[0].length ||
            coords.x < 0 || coords.y < 0)
            return undefined;
        let cell = this.grid[coords.x][coords.y];
        if (cell === undefined) {
            cell = new Set();
            this.grid[coords.x][coords.y] = cell;
        }
        return cell;
    }
    /**
     * Update the cell size. Dependent on the minRadius and vicinity options.
     * setGrid should also be called after this function
     */
    setCellSize() {
        this.cellSize = Math.ceil(Math.max(2 * this.options.minRadius, this.options.vicinity));
    }
    /**
     * Updates the grid and the particle's cell.
     * Call if the bounds or cellsize change
     */
    setGrid() {
        // Tracks local positions of particles
        this.grid = (new Array(Math.ceil(this.bounds.x / this.cellSize))).fill(undefined);
        this.grid = this.grid.map((_) => new Array(Math.ceil(this.bounds.y / this.cellSize)));
        this.particles.forEach((p) => {
            p.cellCoords = undefined;
            this.updateParticleCell(p);
        });
    }
    /**
     * Helper that also updates the grid when the bounds are updated.
     */
    setBounds(bounds) {
        this.bounds = bounds;
        this.setGrid();
    }
}
//# sourceMappingURL=ParticleManager.js.map