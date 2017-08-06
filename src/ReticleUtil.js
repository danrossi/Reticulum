/*! Reticulum - v2.1.2
 * http://skezo.github.io/examples/basic.html
 *
 * Copyright (c) 2015 Skezo;
 * Licensed under the MIT license */

 /**
  Refactoring to Es6 for Three.Js module import by Daniel Rossi
 */
 
export default class ReticleUtil {
  static clampBottom( x, a ) {
      return x < a ? a : x;
  }


  //Sets the depth and scale of the reticle - reduces eyestrain and depth issues
  static setDepthAndScale( depth, crosshair, camera ) {
        //var crosshair = this.mesh;
        const z = Math.abs( depth ), //Default to user far setting
         cameraZ =  camera.position.z,
        //Force reticle to appear the same size - scale
        //http://answers.unity3d.com/questions/419342/make-gameobject-size-always-be-the-same.html
        scale = Math.abs( cameraZ - z ) - Math.abs( cameraZ );

        //Set Depth
        crosshair.position.x = 0;
        crosshair.position.y = 0;
        crosshair.position.z = ReticleUtil.clampBottom( z, camera.near+0.1 ) * -1;

        //Set Scale
        crosshair.scale.set( scale, scale, scale );
  }

  static get vibrate() {
    return navigator.vibrate ? navigator.vibrate.bind(navigator) : function(){};
  }

  setColor(threeObject, color) {
      threeObject.material.color.setHex( color );
  }
}
