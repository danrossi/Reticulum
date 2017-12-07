/*! Reticulum - v2.1.2
 * http://skezo.github.io/examples/basic.html
 *
 * Copyright (c) 2015 Skezo;
 * Licensed under the MIT license */

 /**
  Refactoring to Es6 for Three.Js module import by Daniel Rossi
 */
import { RingBufferGeometry, BackSide, Mesh } from 'three';

import ReticleUtil from './ReticleUtil';

export default class Fuse {
    constructor(options) {
      this.initiate(options);
    }

    initiate( options ) {
        const parameters = options || {};

        this.visible        = parameters.visible            !== false; //default to true;
        this.globalDuration = parameters.duration           ||  2.5;
        //this.vibratePattern = parameters.vibrate            ||  100;
        this.innerRadius    = parameters.innerRadius        ||  reticle.innerRadiusTo;
        this.outerRadius    = parameters.outerRadius        ||  reticle.outerRadiusTo;
        this.clickCancel    = parameters.clickCancelFuse    === undefined ? false : parameters.clickCancelFuse; //default to false;
        this.phiSegments    = 3;
        this.thetaSegments  = 32;
        this.thetaStart     = Math.PI/2;
        this.duration       = this.globalDuration;
        this.timeDone   = false;


        const geometry = new RingBufferGeometry( this.innerRadius, this.outerRadius, this.thetaSegments, this.phiSegments, this.thetaStart, Math.PI/2 ),
        material = ReticleUtil.createShaderMaterial(parameters.color ||  0x00fff6);
        material.side = BackSide;
        material.fog = false;

        this.mesh = new Mesh(geometry, material);

        //Set mesh visibility
        this.mesh.visible = this.visible;

        //Change position and rotation of fuse
        this.mesh.position.z = 0.0001; // Keep in front of reticle
        this.mesh.rotation.y = 180*(Math.PI/180); //Make it clockwise
    }

    out() {
        this.active = false;
        this.mesh.visible = false;
        this.timeDone = false;
        this.update(0);
    }

    over(duration, visible) {
        this.duration = duration || this.globalDuration;
        this.active = true;
        this.update(0);
        this.mesh.visible = visible || this.visible;
    }

    update(elapsed) {

        if(!this.active || this.timeDone) return;

        //--RING
        const gazedTime = elapsed/this.duration,
        thetaLength = gazedTime * (Math.PI*2),
        radiusStep = ( ( this.outerRadius - this.innerRadius ) / this.phiSegments );

        let count = 0,
          radius = this.innerRadius;

        for ( let i = 0; i <= this.phiSegments; i += 1 ) {

            for ( let o = 0; o <= this.thetaSegments; o+= 1 ) {
                const segment = this.thetaStart + o / this.thetaSegments * thetaLength;
                //buffer geometry position attribute update x,y
                this.mesh.geometry.attributes.position.setXY(count, radius * Math.cos(segment), radius * Math.sin(segment));
                count++;
            }
            radius += radiusStep;

        }

        //update buffer geometry position
        this.mesh.geometry.attributes.position.needsUpdate = true;

        //Disable fuse if reached 100%
        if (gazedTime >= 1) {
            this.active = false;
        }
        //--RING EOF
    }

    set color(fuseColor) {
      ReticleUtil.setColor(this.mesh, fuseColor);
    }
}
