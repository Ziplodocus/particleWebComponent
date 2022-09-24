import { Particle } from "./Particle.js";
import { EventEmitter, ZEvent } from "../utility-classes/EventEmitter.js";
import { Vector2d } from "../utility-classes/Vector2d.js";
import { t, ts, tc } from "../helpers/helpers.js";

export type ParticleManagerOptions = {
  minSpeed: number,
  maxSpeed: number,
  minRadius: number,
  maxRadius: number,
  initialParticles: number,
  vicinity: number;
};
const defaultParticleOptions: ParticleManagerOptions = {
  minSpeed: 0.3,
  maxSpeed: 0.5,
  minRadius: 2,
  maxRadius: 8,
  initialParticles: 15,
  vicinity: 50
};

export class ParticleManager extends EventEmitter {
  particles: Set<Particle>;
  options: ParticleManagerOptions;
  bounds: { x: number, y: number; };
  pMap: Map<string, Set<Particle>>;
  boxSize: number;
  checked: Set<number>;
  nearParticles: Set<Particle>;
  constructor(options: ParticleManagerOptions, width: number, height: number) {
    super();
    this.particles = new Set();
    this.options = { ...defaultParticleOptions, ...options };
    this.bounds = { x: width, y: height };
    this.pMap = new Map();
    this.boxSize = Math.ceil(Math.max(2 * this.options.minRadius, this.options.vicinity));
    this.checked = new Set();
    this.nearParticles = new Set();

    for (let i = this.options.initialParticles; i > 0; i--) {
      this.add();
    }

    this.on('incrementTime', this.incrementTime);
  }
  incrementTime = () => {
    this.particles.forEach((p) => {
      p.move();

      const coords = this.pBox(p);
      if (coords !== p.box) {
        let box = this.pMap.get(p.box);
        box.delete(p);
        box = this.pMap.get(coords);
        p.box = coords;

        if (box === undefined) {
          this.pMap.set(coords, new Set([p]));
        } else {
          box.add(p);
        }
      }

      this.checkParticleVicinity(p);
      this.checkForBoundsCollision(p);

    });
    this.checked.clear();
  };
  checkForBoundsCollision(p: Particle) {
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
  checkParticleVicinity(p: Particle) {
    const [w, l]: [number, number] = JSON.parse(this.pBox(p));

    /*
    Determine which particles are close enough to interact
    with and add them to a set
    */
    this.nearParticles = new Set();
    for (let i = w - 1; i <= w + 1; i++) {
      for (let j = l - 1; j <= l + 1; j++) {
        const part = this.pMap.get(`[${i}, ${j}]`) || [];
        this.nearParticles = new Set([...this.nearParticles, ...part]);
      }
    }

    /*
    Check vicinity only for particles in neighbouring boxes
    */
    this.nearParticles.forEach((q) => {
      // If the
      if (this.checked.has(q.id)) return;
      if (p === q) return;
      //calcing values
      const perp = p.position.minus(q.position);
      const distance = perp.norm;
      const radii = p.radius + q.radius;
      const isInVicinity = (distance <= this.options.vicinity);
      if (isInVicinity) {
        this.trigger('inVicinity', { p, q });
      } else if (this.options.vicinity > radii) return;

      const isCollision = (distance <= radii);
      //Handles if this particle collides with another, redirecting both
      if (isCollision) {
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
    });
    this.checked.add(p.id);
  }
  randomPosition() {
    const randX = Math.random() * (this.bounds.x - 2 * this.options.maxRadius) + this.options.maxRadius;
    const randY = Math.random() * (this.bounds.y - 2 * this.options.maxRadius) + this.options.maxRadius;
    return new Vector2d(randX, randY);
  }
  randomSpeed() {
    const ops = this.options;
    return Math.random() * (ops.maxSpeed - ops.minSpeed) + ops.minSpeed;
  }
  add(pos = this.randomPosition()) {
    const speed = this.randomSpeed();
    const radius =
      this.options.minRadius
      + (this.options.maxRadius - this.options.minRadius)
      * (
        (speed - this.options.minSpeed)
        / (this.options.maxSpeed - this.options.minSpeed + 0.000001)
      );
    const p = new Particle(pos, speed, radius, this.particles.size);
    this.particles.add(p);
    const coords = this.pBox(p);
    p.box = coords;
    let box = this.pMap.get(coords);
    if (box === undefined) {
      this.pMap.set(coords, new Set([p]));
    } else {
      box.add(p);
    }
  }
  pBox(p: Particle): string {
    return `[${Math.floor(p.x / this.boxSize)}, ${Math.floor(p.y / this.boxSize)}]`;
  }
}