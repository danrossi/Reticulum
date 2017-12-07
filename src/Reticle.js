/*! Reticulum - v2.1.2
 * http://skezo.github.io/examples/basic.html
 *
 * Copyright (c) 2015 Skezo;
 * Licensed under the MIT license */

 /**
  Refactoring to Es6 for Three.Js module import by Daniel Rossi
 */
import { RingBufferGeometry, Color, Mesh } from 'three';

import ReticleUtil from './ReticleUtil';

let _globalColorTo = 0,
_colorTo = 0,
_hit = false;

export default class Reticle {

  constructor(camera, options) {
    this.camera = camera;
    this.initiate(options);
  }

  //Reticle
  initiate( options ) {
      const parameters = options || {};

      parameters.hover = parameters.hover || {};
      parameters.click = parameters.click || {};

      this.active             = true;
      this.visible            = parameters.visible            !== false; //default to true;
      this.restPoint          = parameters.restPoint          || this.camera.far-10.0;
      this.globalColor        = parameters.color              || 0xcc0000;
      this.innerRadius        = parameters.innerRadius        || 0.0004;
      this.outerRadius        = parameters.outerRadius        || 0.003;
      this.worldPosition      = new THREE.Vector3();
      this.ignoreInvisible    = parameters.ignoreInvisible    !== false; //default to true;

      //Hover
      this.innerRadiusTo      = parameters.hover.innerRadius  || 0.02;
      this.outerRadiusTo      = parameters.hover.outerRadius  || 0.024;
      this.globalColorTo      = parameters.hover.color        || this.color;
      this.hit                = false;
      //Click
      //Animation options
      this.speed              = parameters.hover.speed        || 5;
      this.moveSpeed          = 0;

      //Colors
      this.globalColor = new Color( this.globalColor );
      this.color = this.globalColorCopy;
      this.globalColorTo = new Color( this.globalColorTo );
      this.colorTo = this.globalColorToCopy;

      //Geometry
      const geometry = new RingBufferGeometry( this.innerRadius, this.outerRadius, 32, 3, 0, Math.PI * 2 ),
      geometryScale = new RingBufferGeometry( this.innerRadiusTo, this.outerRadiusTo, 32, 3, 0, Math.PI * 2 );

      //buffer geometry morphing
      geometry.morphAttributes.position = [ geometryScale.attributes.position ];

      const material = ReticleUtil.createShaderMaterial(this.color);
      material.morphTargets = true;
      material.fog = false;

      this.mesh = new Mesh(geometry, material);

      this.mesh.visible = this.visible;
  }

  set globalColorTo(value) {
    _globalColorTo = value;
  }

  get globalColorTo() {
    return _globalColorTo;
  }

  set colorTo(value) {
    _colorTo = value;
  }

  get colorTo() {
    return _colorTo;
  }

  get globalColorCopy() {
    return this.globalColor.clone();
  }

  get globalColorToCopy() {
    return this.globalColorTo.clone();
  }

  set hit(value) {
    _hit = value;
  }

  get hit() {
    return _hit;
  }

  update(delta) {
      //If not active
      if(!this.active) return;

      const accel = delta * this.speed;

      if( this.hit ) {
          this.moveSpeed += accel;
          this.moveSpeed = Math.min(this.moveSpeed, 1);
      } else {
          this.moveSpeed -= accel;
          this.moveSpeed = Math.max(this.moveSpeed, 0);
      }
      //Morph
      this.mesh.morphTargetInfluences[ 0 ] = this.moveSpeed;
      //Set Color
      this.color = this.globalColorCopy;
      //console.log( this.color.lerp( this.colorTo, this.moveSpeed ) )
      this.mesh.material.color = this.color.lerp( this.colorTo, this.moveSpeed );
  }
}
