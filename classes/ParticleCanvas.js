import { ParticleManager } from './ParticleManager';
import { pi } from '../scripts/helpers';
import { Color } from './Color.js';
import { Vector2d } from './Vector2d';

//Getting the size of the this and assigning it to an object
export class ParticleCanvas extends HTMLCanvasElement {
	constructor() {
		super()
		// set up defaults all of them!!!
		const defaultOptions = {
			fillOpacity: 0.5,
			edgeOpacity: 1,
			mouseEdge: true,
			fill: true,
			fillColor: false,
			outline: false,
			outlineColor: false,
			edges: true,
			pixelDensity: 1
		}
		const canvasOptions = JSON.parse( this.getAttribute( 'data-canvas-options' ) )
		const particleOptions = JSON.parse( this.getAttribute( 'data-particle-options' ) )
		this.options = { ...defaultOptions, ...canvasOptions }
		this.width = this.computedStyle( 'width' ).replace( 'px', '' ) * this.options.pixelDensity
		this.height = this.computedStyle( 'height' ).replace( 'px', '' ) * this.options.pixelDensity
		this.bounds = this.getBoundingClientRect()
		this.ctx = this.getContext( '2d' )
		this.ctx.lineCap = "round";
		this.particleManager = new ParticleManager( particleOptions, this.width, this.height )
		this.mousePosition = new Vector2d();

		const sizeWatcher = new ResizeObserver( this.createResizeHandler() );
		sizeWatcher.observe( this );

		this.addEventListener( 'optionChange', this.handleOptionChange )
		this.addEventListener( 'resize', this.createResizeHandler(), { passive: true } )
		this.addEventListener( 'mouseenter', this.createMouseEnterHandler() )
		this.addEventListener( 'mousemove', this.createHoverHandler(), { passive: true } )
		this.addEventListener( 'mouseleave', this.createMouseLeaveHandler() )
		this.particleManager.on( 'inVicinity', this.createInVicinityHandler() )
		this.addEventListener( 'click', e => {
			this.particleManager.add( this.mousePosition.copy() )
		} )

		const renderLoop = () => {
			this.setUpParticleRendering();
			this.particleManager.particles.forEach( p => {
				this.particleManager.trigger( 'incrementTime', { details: p } )
			} )
			this.particleManager.particles.forEach( p => {
				this.renderParticle( p );
			} )
			this.renderMouseEdges();
			requestAnimationFrame( renderLoop )
		}
		renderLoop()
	}
	get area() {
		return this.width * this.height
	}
	createResizeHandler() {
		let resizeId;
		return ( entries ) => {
			entries.forEach( entry => {
				if ( this !== entry.target ) return;
				clearTimeout( resizeId );
				resizeId = setTimeout( this.createResizer(), 200 );
			} )
		}
	}
	createHoverHandler() {
		return e => {
			requestAnimationFrame( () => {
				const mod = this.options.pixelDensity;
				this.mousePosition.set( e.offsetX * mod, e.offsetY * mod );
			} )
		}
	}
	createMouseEnterHandler() {
		return () => {
			this.mousePosition[ "active" ] = true;
		}
	}
	createMouseLeaveHandler() {
		return () => {
			this.mousePosition[ "active" ] = false;
		}
	}
	createInVicinityHandler() {
		return e => {
			if ( this.options.edges ) this.renderEdge( e.p, e.q );
		}
	}
	refresh() {
		this.width = this.computedStyle( 'width' ).replace( 'px', '' ) * this.options.pixelDensity;
		this.height = this.computedStyle( 'height' ).replace( 'px', '' ) * this.options.pixelDensity;
		this.bounds = this.getBoundingClientRect();
	}
	createResizer() {
		return () => {
			const oldCanvasSize = { width: this.width, height: this.height, area: this.area };
			this.refresh();

			const sizeRatio = this.area / oldCanvasSize.area;
			this.particleManager.options.vicinity *= sizeRatio ** 0.5;

			this.particleManager.particles.forEach( p => {
				p.position.set(
					p.x * ( this.width / oldCanvasSize.width ),
					p.y * ( this.height / oldCanvasSize.height )
				)
			} )
			this.particleManager.bounds.x = this.width;
			this.particleManager.bounds.y = this.height;

			this.height = Math.floor( this.options.pixelDensity * this.height );
			this.width = Math.floor( this.options.pixelDensity * this.width );
		}
	}
	setUpParticleRendering() {
		this.ctx.clearRect( 0, 0, this.width, this.height );
	}
	renderParticle( p ) {
		const ctx = this.ctx;
		const opn = this.options;
		if ( opn.fill || opn.outline ) {
			ctx.beginPath();
			ctx.arc( p.x, p.y, p.radius, 0, 2 * pi );
		}
		if ( opn.fill ) {
			ctx.fillStyle = opn.fillColor || p.color.rgba;
			ctx.fill();
		}
		if ( opn.outline ) {
			ctx.strokeStyle = opn.outlineColor || p.lineColor.rgba;
			ctx.lineWidth = p.radius / 3;
			ctx.stroke();
		}
	}
	//Draws edges between particles within a vicinity, and also to the tracked mouse position
	renderEdge( p, q ) {
		const ctx = this.ctx;
		const diff = p.position.minus( q.position );
		const distance = diff.norm;
		const alpha = this.options.edgeOpacity - ( distance / ( this.particleManager.options.vicinity / this.options.edgeOpacity ) );
		const radii = p.radius + q.radius;
		let edgeColor = '';
		switch ( true ) {
			case ( this.options.outlineColor ):
				edgeColor = this.options.outlineColor;
				break
			case ( this.options.outline ):
				edgeColor = Color.avgColors( [ p.lineColor, q.lineColor ] ).rgba;
				break
			case ( this.options.fillColor ):
				edgeColor = this.options.fillColor;
				break
			default:
				edgeColor = Color.avgColors( [ p.color, q.color ] ).rgba;
		}
		ctx.strokeStyle = edgeColor;
		ctx.globalAlpha = alpha;
		ctx.lineWidth = radii / 5;
		ctx.beginPath();
		ctx.moveTo( p.x, p.y );
		ctx.lineTo( q.x, q.y );
		ctx.stroke()
		ctx.globalAlpha = 1;
	}
	renderMouseEdges() {
		if ( !this.mousePosition[ "active" ] ) return
		this.particleManager.particles.forEach( p => {
			const distance = p.position.minus( this.mousePosition ).norm;
			if ( distance > this.particleManager.options.vicinity * 1.5 ) return;
			const alpha = this.options.edgeOpacity - ( distance / ( ( this.particleManager.options.vicinity * 1.5 ) / this.options.edgeOpacity ) );
			let edgeColor = '';
			switch ( true ) {
				case ( this.options.outlineColor ):
					edgeColor = this.options.outlineColor;
					break
				case ( this.options.outline ):
					edgeColor = p.lineColor.rgba;
					break
				case ( this.options.fillColor ):
					edgeColor = this.options.fillColor;
					break
				default:
					edgeColor = p.color.rgba;
			}
			const ctx = this.ctx;
			ctx.strokeStyle = edgeColor;
			ctx.globalAlpha = alpha;
			ctx.lineWidth = p.radius * 0.8;
			ctx.beginPath();
			ctx.moveTo( p.x, p.y );
			ctx.lineTo( this.mousePosition.x, this.mousePosition.y );
			ctx.stroke()
			ctx.globalAlpha = 1;
		} )
	}
	computedStyle( prop ) {
		return getComputedStyle( this ).getPropertyValue( prop );
	}
}

window.customElements.define( 'particle-canvas', ParticleCanvas, { extends: 'canvas' } );