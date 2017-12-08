/*! Reticulum - v2.1.2
 * http://skezo.github.io/examples/basic.html
 *
 * Copyright (c) 2015 Skezo;
 * Licensed under the MIT license */
/**
 Refactoring to Es6 for Three.Js module import by Daniel Rossi
*/

//import { RawShaderMaterial, ShaderMaterial } from 'three';


import { RawShaderMaterial } from '../../three.js/src/materials/RawShaderMaterial';

export default class ReticleUtil {

    /**
     * Basic vertex shader for raw shader material
     
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
    }*/

    /**
     * Trimmed down customised vertex shader with morph targets
     */
    static get vertexMorphShader() {
        return `
        precision highp float;
        precision highp int;
    
        #include <morphtarget_pars_vertex>
      
        #ifdef USE_MORPHTARGETS
            attribute vec3 morphTarget0;
            attribute vec3 morphTarget1;
            attribute vec3 morphTarget2;
            attribute vec3 morphTarget3;
            attribute vec3 morphTarget4;
            attribute vec3 morphTarget5;
            attribute vec3 morphTarget6;
            attribute vec3 morphTarget7;
        #endif

        varying vec2 vUv;
        attribute vec2 uv;
        attribute vec3 position;
        uniform mat4 projectionMatrix;
        uniform mat4 modelViewMatrix;
            
        void main() {
            #include <begin_vertex>
            #include <morphtarget_vertex>
            #include <project_vertex>
        }
        `;
    }
    
    /**
     * Basic fragment shader for raw shader material
     */
    static get fragmentShader() {
        return `
            precision highp float;
            precision highp int;
            uniform vec3 color;
            uniform float opacity;
            void main() {
              gl_FragColor = vec4(color, opacity);
            }
        `;
    }

    /**
     * Morph target shader material
     */
    static createMorphShaderMaterial(color, opacity, transparent) {
        const material = ReticleUtil.createShaderMaterial(color, opacity, transparent);
        material.morphTargets = true;
        material.defines = { "USE_MORPHTARGETS": "" };
        return material;
    }

    /**
     * use raw shader material for fuse and recticle
     */
    static createShaderMaterial(color, opacity, transparent) {
      //console.log(THREE.ShaderLib);
      return new RawShaderMaterial( {
        uniforms: {
                color: {
                    type: 'c',
                    value: new THREE.Color(color)
                },
                opacity: {
                    type: 'f',
                    value: opacity
                }
          },
          transparent: transparent,
          vertexShader: ReticleUtil.vertexMorphShader,
          //fragmentShader: THREE.ShaderLib.basic.fragmentShader
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