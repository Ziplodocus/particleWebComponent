# particleWebComponent
A flexible and customizable web component which simulates particles floating around in an enclosed space

## Usage

Import and bundle as required.

For standalone version I would recommend downloading the release from github and linking a type="module" script tag with a src of particleCanvas.js

When the module is imported...
Define a canvas element and add the 'is' attribute e.g
``<canvas is=particle-canvas><canvas>``

I would recommend defining the size of the canvas with CSS. The width and height tags will be added based on the set size and 'resolution' of the canvas.

The canvas can resize and the contents will adjust appropriately.

## Options

There are two additional data attributes that take string encoded JSON. These override the default options for rendering and particle behaviour:

I would hope that the ptions are self explanatory for the most part, or after a little experimentation.
``
data-canvas-options={
  fill: boolean,
  outline: boolean,
  edges: boolean,
  mouseEdges: boolean,
  fillColor: css valid color value,
  outlineColor: css valid color value,
  fillOpacity: 0-1 (float),
  edgeOpacity: 0-1 (float),
  pixelDensity: (int),
}
``

``
data-particle-options {
  minSpeed: (float),
  maxSpeed: (float),
  minRadius: (float),
  maxRadius: (float),
  InitialParticles: (int),
  vicinity: (float)
}
``

For example to create a a canvas with nothing but 25 blue bubbles floating around slowly the following could be used:
``
<canvas is="particle-canvas" 
  data-canvas-options="{
    fill: false,
    outline: true,
    outlineColor: blue,
    edges: false,
    mouseEdges: false
  }"
  data-particle-options="{
    initialParticles: 25,
    minSpeed: 0.3,
    maxSpeed: 0.6
  }"></canvas>
``
