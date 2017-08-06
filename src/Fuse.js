/*! Reticulum - v2.1.2
 * http://skezo.github.io/examples/basic.html
 *
 * Copyright (c) 2015 Skezo;
 * Licensed under the MIT license */

 /**
  Refactoring to Es6 for Three.Js module import by Daniel Rossi
 */
import ReticleUtil from './ReticleUtil';

export default class Fuse {
    constructor(options) {
      this.initiate(options);
    }

    initiate( options ) {
        const parameters = options || {};

        this.visible        = parameters.visible            !== false; //default to true;
        this.globalDuration = parameters.duration           ||  2.5;
        this.vibratePattern = parameters.vibrate            ||  100;
        this.color          = parameters.color              ||  0x00fff6;
        this.innerRadius    = parameters.innerRadius        ||  reticle.innerRadiusTo;
        this.outerRadius    = parameters.outerRadius        ||  reticle.outerRadiusTo;
        this.clickCancel    = parameters.clickCancelFuse    === undefined ? false : parameters.clickCancelFuse; //default to false;
        this.phiSegments    = 3;
        this.thetaSegments  = 32;
        this.thetaStart     = Math.PI/2;
        this.duration       = this.globalDuration;

        //var geometry = new THREE.CircleGeometry( reticle.outerRadiusTo, 32, Math.PI/2, 0 );
        const geometry = new THREE.RingGeometry( this.innerRadius, this.outerRadius, this.thetaSegments, this.phiSegments, this.thetaStart, Math.PI/2 );

        //Make Mesh
        this.mesh = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( {
            color: this.color,
            side: THREE.BackSide,
            fog: false
            //depthWrite: false,
            //depthTest: false
        }));

        //Set mesh visibility
        this.mesh.visible = this.visible;

        //Change position and rotation of fuse
        this.mesh.position.z = 0.0001; // Keep in front of reticle
        this.mesh.rotation.y = 180*(Math.PI/180); //Make it clockwise

        //Add to reticle
        //reticle.mesh.add( this.mesh );
        //parentContainer.add( this.mesh );
        //geometry.dispose();
    }

    out() {
        this.active = false;
        this.mesh.visible = false;
        this.update(0);
    }

    over(duration, visible) {
        this.duration = duration || this.globalDuration;
        this.active = true;
        this.update(0);
        this.mesh.visible = visible || this.visible;
    }

    update(elapsed) {

        if(!this.active) return;

        //--RING
        const gazedTime = elapsed/this.duration,
        thetaLength = gazedTime * (Math.PI*2),
        vertices = this.mesh.geometry.vertices,
        radiusStep = ( ( this.outerRadius - this.innerRadius ) / this.phiSegments );

        let count = 0,
          radius = this.innerRadius;

        for ( let i = 0; i <= this.phiSegments; i += 1 ) {

            for ( let o = 0; o <= this.thetaSegments; o+= 1 ) {
                const vertex = vertices[ count ],
                segment = this.thetaStart + o / this.thetaSegments * thetaLength;
                vertex.x = radius * Math.cos( segment );
                vertex.y = radius * Math.sin( segment );
                count++;
            }
            radius += radiusStep;
        }

        this.mesh.geometry.verticesNeedUpdate = true;

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
