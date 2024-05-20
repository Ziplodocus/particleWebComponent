import { ParticleManager } from './ParticleManager.js';
import { pi } from '../helpers/helpers.js';
import { Color } from '../utility-classes/Color.js';
import { Vector2d } from '../utility-classes/Vector2d.js';
const defaultOptions = {
    'fill-opacity': 0.5,
    'edge-opacity': 1,
    'mouse-edges': true,
    'fill': true,
    'fill-color': '',
    'outline': false,
    'edges': true,
    'pixel-density': 1,
    'min-speed': 0.1,
    'max-speed': 0.3,
    'min-radius': 1,
    'max-radius': 7,
    'initial-number': 15,
    'vicinity': 75
};
//Getting the size of the this and assigning it to an object
export class ParticleCanvas extends HTMLElement {
    connectedCallback() {
        this.refresh();
        this.ctx = this.canvas.getContext('2d');
        this.manager = new ParticleManager(this.managerOptions, this.canvas.width, this.canvas.height);
        this.mousePosition = new Vector2d();
        const sizeWatcher = new ResizeObserver(() => requestAnimationFrame(this.resize.bind(this)));
        sizeWatcher.observe(this);
        this.canvas.addEventListener('mouseenter', this.mouseEnterHandler);
        this.canvas.addEventListener('mousemove', this.hoverHandler, { passive: true });
        this.canvas.addEventListener('mouseleave', this.mouseLeaveHandler);
        this.canvas.addEventListener('click', this.mouseClickHandler);
        this.manager.on('inVicinity', this.inVicinityHandler);
        this.renderLoop();
    }
    disconnectedCallback() {
    }
    constructor() {
        super();
        this.renderLoop = () => {
            this.render();
            const callback = this.renderLoop;
            requestAnimationFrame(callback);
        };
        this.hoverHandler = (e) => {
            requestAnimationFrame(() => {
                this.mousePosition.set(
                // @ts-ignore
                e.layerX * this.options.pixelDensity, 
                // @ts-ignore
                e.layerY * this.options.pixelDensity);
            });
        };
        this.mouseClickHandler = (e) => {
            this.manager.add(this.mousePosition.copy());
        };
        this.mouseEnterHandler = (e) => {
            this.mousePosition.set(e.layerX * this.options.pixelDensity, e.layerY * this.options.pixelDensity);
            this.mousePosition["active"] = true;
        };
        this.mouseLeaveHandler = () => {
            this.mousePosition.set(0, 0);
            this.mousePosition["active"] = false;
        };
        this.inVicinityHandler = (e) => {
            if (this.options.edges)
                this.renderEdge(e.p, e.q);
        };
        this.options = {
            fill: this.setting('fill') === 'true',
            fillColor: this.setting('fill-color'),
            fillOpacity: Number(this.setting('fill-opacity')),
            outline: this.setting('outline') === 'true',
            edges: this.setting('edges') === 'true',
            edgeOpacity: Number(this.setting('edge-opacity')),
            mouseEdges: this.setting('mouse-edges') === 'true',
            pixelDensity: Number(this.setting('pixel-density')),
        };
        this.managerOptions = {
            minSpeed: Number(this.setting('min-speed')),
            maxSpeed: Number(this.setting('max-speed')),
            minRadius: Number(this.setting('min-radius')),
            maxRadius: Number(this.setting('max-radius')),
            initialNumber: Number(this.setting('initial-number')),
            vicinity: Number(this.setting('vicinity')),
        };
        const shadow = this.attachShadow({ mode: 'closed' });
        this.canvas = document.createElement('canvas');
        this.canvas.style.setProperty('display', 'block');
        this.canvas.style.setProperty('width', '100%');
        this.canvas.style.setProperty('height', '100%');
        shadow.appendChild(this.canvas);
    }
    attributeChangedCallback(name, prev, next) {
        if (next === null)
            return;
        switch (name) {
            case 'fill':
                this.options.fill = next === 'true';
                break;
            case 'fill-color':
                this.options.fillColor = next;
                break;
            case 'fill-opacity':
                this.options.fillOpacity = Number(next);
                break;
            case 'outline':
                this.options.outline = next === 'true';
                break;
            case 'edges':
                this.options.edges = next === 'true';
                break;
            case 'edge-opacity':
                this.options.edgeOpacity = Number(next);
                break;
            case 'mouse-edges':
                this.options.mouseEdges = next === 'true';
                break;
            case 'pixel-density':
                this.options.pixelDensity = Number(next);
                this.resize();
                break;
            case 'min-speed':
                this.manager.options.minSpeed = Number(next);
                break;
            case 'max-speed':
                this.manager.options.maxSpeed = Number(next);
                break;
            case 'min-radius':
                this.manager.options.minRadius = Number(next);
                break;
            case 'max-radius':
                this.manager.options.maxRadius = Number(next);
                break;
            case 'initial-number':
                this.manager.options.initialNumber = Number(next);
                break;
            case 'vicinity':
                this.manager.options.vicinity = Number(next);
                break;
        }
    }
    setting(key) {
        const attr = this.getAttribute(key);
        return attr !== null ? attr : defaultOptions[key].toString();
    }
    get area() {
        return this.canvas.width * this.canvas.height;
    }
    render() {
        this.setUpParticleRendering();
        this.manager.trigger('incrementTime');
        this.manager.particles.forEach(p => {
            this.renderParticle(p);
        });
        if (this.mousePosition["active"] && this.options.mouseEdges)
            this.renderMouseEdges();
    }
    refresh() {
        this.canvas.width = this.canvas.scrollWidth * this.options.pixelDensity;
        this.canvas.height = this.canvas.scrollHeight * this.options.pixelDensity;
        if (this.manager) {
            this.manager.bounds[0] = this.canvas.width;
            this.manager.bounds[1] = this.canvas.height;
        }
    }
    resize() {
        const oldCanvasSize = [this.canvas.width, this.canvas.height, this.area];
        this.refresh();
        if (!this?.manager)
            return;
        const sizeRatio = this.area / oldCanvasSize[2];
        this.manager.options.vicinity *= sizeRatio ** 0.5;
        this.manager.particles.forEach(p => {
            p.position.set(p.x * (this.canvas.width / oldCanvasSize[0]), p.y * (this.canvas.height / oldCanvasSize[1]));
        });
    }
    ;
    setUpParticleRendering() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.lineCap = 'round';
    }
    renderParticle(p) {
        const ctx = this.ctx;
        ctx.globalAlpha = this.options.fillOpacity;
        if (this.options.fill || this.options.outline) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, 2 * pi);
        }
        if (this.options.fill) {
            ctx.fillStyle = this.options.fillColor || p.color.rgba;
            ctx.fill();
        }
        if (this.options.outline) {
            ctx.strokeStyle = this.options.fillColor || p.color.rgba;
            ctx.lineWidth = p.radius / 3;
            ctx.stroke();
        }
        ctx.globalAlpha = 1;
    }
    //Draws edges between particles within a vicinity, and also to the tracked mouse position
    renderEdge(p, q) {
        const ctx = this.ctx;
        const diff = p.position.minus(q.position);
        const distance = diff.norm;
        const radii = p.radius + q.radius;
        const alpha = this.options.edgeOpacity - ((distance - radii) / ((this.manager.options.vicinity - radii) / this.options.edgeOpacity));
        ctx.strokeStyle = Color.avgColors([p.color, q.color]).rgba;
        ctx.globalAlpha = alpha;
        ctx.lineWidth = radii / 5;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(q.x, q.y);
        ctx.stroke();
        ctx.globalAlpha = 1;
    }
    renderMouseEdges() {
        this.manager.particles.forEach(p => {
            const distance = p.position.minus(this.mousePosition).norm;
            const opacity = this.options.edgeOpacity;
            if (distance > this.manager.options.vicinity * 1.5)
                return;
            const alpha = opacity - (distance / ((this.manager.options.vicinity * 1.5) / opacity));
            const ctx = this.ctx;
            ctx.strokeStyle = this.options.fillColor || p.color.rgba;
            ctx.globalAlpha = alpha;
            ctx.lineWidth = p.radius * 0.8;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(this.mousePosition.x, this.mousePosition.y);
            ctx.stroke();
            ctx.globalAlpha = 1;
        });
    }
}
ParticleCanvas.observedAttributes = [
    'fill-opacity',
    'edge-opacity',
    'mouse-edges',
    'fill',
    'fill-color',
    'outline',
    'edges',
    'pixel-density',
    'min-speed',
    'max-speed',
    'min-radius',
    'max-radius',
    'initial-number',
    'vicinity'
];
//# sourceMappingURL=ParticleCanvas.js.map