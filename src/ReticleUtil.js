/*! Reticulum - v2.1.2
 * http://skezo.github.io/examples/basic.html
 *
 * Copyright (c) 2015 Skezo;
 * Licensed under the MIT license */
/**
 Refactoring to Es6 for Three.Js module import by Daniel Rossi
*/

//import { RawShaderMaterial } from 'three';


import { RawShaderMaterial } from '../../three.js/src/materials/RawShaderMaterial';

export default class ReticleUtil {

    /**
     * Basic vertex shader for raw shader material
     */
    static get vertexShader() {
        return `
            attribute vec2 uv;
            attribute vec4 position;
            uniform mat4 projectionMatrix;
            uniform mat4 modelViewMatrix;
            void main() {
              gl_Position = projectionMatrix * modelViewMatrix * position;
            }
        `;
    }

    /**
     * Basic fragment shader for raw shader material
     */
    static get fragmentShader() {
        return `
            precision highp float;
            uniform vec3 color;
            uniform float opacity;
            void main() {
              gl_FragColor = vec4(color, opacity);
            }
        `;
    }

    /**
     * use raw shader material for fuse and recticle
     */
    static createShaderMaterial(color) {
      return new RawShaderMaterial( {
        uniforms: {
                color: {
                    type: 'c',
                    value: new THREE.Color(color)
                },
                opacity: {
                    type: 'f',
                    value: 1
                }
          },
          vertexShader: ReticleUtil.vertexShader,
          fragmentShader: ReticleUtil.fragmentShader,
      });
    }

    static clampBottom(x, a) {
        return x < a ? a : x;
    }

    //Sets the depth and scale of the reticle - reduces eyestrain and depth issues
    static setDepthAndScale(depth, crosshair, camera) {
        //var crosshair = this.mesh;
        const z = Math.abs(depth), //Default to user far setting
            cameraZ = camera.position.z,
            //Force reticle to appear the same size - scale
            //http://answers.unity3d.com/questions/419342/make-gameobject-size-always-be-the-same.html
            scale = Math.abs(cameraZ - z) - Math.abs(cameraZ);
        //Set Depth
        crosshair.position.x = 0;
        crosshair.position.y = 0;
        crosshair.position.z = ReticleUtil.clampBottom(z, camera.near + 0.1) * -1;
        //Set Scale
        crosshair.scale.set(scale, scale, scale);
    }

    /*static get vibrate() {
        return navigator.vibrate ? navigator.vibrate.bind(navigator) : function() {};
    }*/

    static setColor(threeObject, color) {
        threeObject.material.color.setHex(color);
    }
}