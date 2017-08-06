/*! Reticulum - v2.1.2
 * http://skezo.github.io/examples/basic.html
 *
 * Copyright (c) 2015 Skezo;
 * Licensed under the MIT license */

 /**
  Refactoring to Es6 for Three.Js module import by Daniel Rossi
 */

 import ReticleUtil from './ReticleUtil';
 import Fuse from './Fuse';
 import Reticle from './Reticle';

 let INTERSECTED = null;

 export default class Reticulum {

   constructor(camera, renderer, options) {
     this.collisionList = [];
     this.vector = null;
     this.clock = null;
     this.reticle = null;
     this.fuse = null;
     this.frustum = null;
     this.parentContainer = null;

     //Settings from user
     this.settings = {
         camera:             null, //Required
         proximity:          false,
         isClickEnabled:     true,
         lockDistance:       false
     };

     this.vibrate = ReticleUtil.vibrate;

     this.camera = camera;
     this.initiate(camera, renderer, options);
   }

   initiate(camera, renderer, options) {
       //Update Settings:
       options = options || {};

       //settings.camera = camera; //required
       this.settings.proximity = options.proximity || settings.proximity;
       this.settings.lockDistance = options.lockDistance || settings.lockDistance;
       this.settings.isClickEnabled = options.clickevents || settings.isClickEnabled;
       options.reticle = options.reticle || {};
       options.fuse = options.fuse || {};

       //Raycaster Setup
       this.raycaster = new THREE.Raycaster();
       this.vector = new THREE.Vector2(0, 0);
       //Update Raycaster
       if(options.near && options.near >= 0 ) {
           this.raycaster.near = options.near;
       }
       if(options.far && options.far >= 0 ) {
           this.raycaster.far = options.far;
       }

       //Create Parent Object for reticle and fuse
       const parentContainer = new THREE.Object3D();
       camera.add( parentContainer );

       //Proximity Setup
       if( this.settings.proximity ) {
         this.frustum = renderer.getFrustum();
       }

       //Enable Click / Tap Events
       if( this.settings.isClickEnabled ) {
           document.body.addEventListener('touchend', (e) => this.touchClickHandler(e), false);
           document.body.addEventListener('click', (e) => this.touchClickHandler(e), false);
       }

       //Clock Setup
       this.clock = new THREE.Clock(true);

       //Initiate Reticle
       this.reticle = new Reticle(camera, options.reticle);

       //set depth and scale
       this.depthScale = this.resetPoint;

       //Add to camera
       this.parentContainer.add( this.reticle.mesh );

       //Initiate Fuse
       this.fuse = new Fuse(options.fuse);
       this.parentContainer.add( this.fuse.mesh );

   }

   proximity() {

       let showReticle = false;

       //Use frustum to see if any targetable object is visible
       //http://stackoverflow.com/questions/17624021/determine-if-a-mesh-is-visible-on-the-viewport-according-to-current-camera



       for( let i = 0, l = collisionList.length; i < l; i += 1) {

           const newObj = collisionList[i];

           if(!newObj.reticulumData.gazeable) {
               continue;
           }

           if( this.reticle.ignoreInvisible && !newObj.visible) {
               continue;
           }

           if( this.frustum.intersectsObject( newObj ) ) {
               showReticle = true;
               break;
           }

       }
       this.reticle.mesh.visible = showReticle;

   }

   detectHit() {
       /*try {
           raycaster.setFromCamera( vector, settings.camera );
       } catch (e) {
           //Assumes PerspectiveCamera for now...
           //Support for Three.js < rev70
           raycaster.ray.origin.copy( settings.camera.position );
           raycaster.ray.direction.set( vector.x, vector.y, 0.5 ).unproject( settings.camera ).sub( settings.camera.position ).normalize();
       }*/

       this.raycaster.setFromCamera( this.vector, this.camera );

       //
       const intersects = raycaster.intersectObjects(collisionList),
       intersectsCount = intersects.length;
       //Detect
       if (intersectsCount) {

           let newObj = null;

           //Check if what we are hitting can be used
           for( let i =0, l = intersectsCount; i < l; i += 1) {
               newObj = intersects[ i ].object;
               //If new object is not gazeable skip it.
               if (!newObj.reticulumData.gazeable) {
                   if( newObj == INTERSECTED ) { //TO DO: move this else where
                       this.gazeOut(INTERSECTED);
                   }
                   newObj = null;
                   continue;
               }
               //If new object is invisible skip it.
               if( this.reticle.ignoreInvisible && !newObj.visible) {
                   newObj = null;
                   continue;
               }
               //No issues let use this one
               break;
           }

           //There is no valid object
           if (newObj === null) return;

           //Is it a new object?
           if( INTERSECTED != newObj ) {
               //If old INTERSECTED i.e. not null reset and gazeout
               if ( INTERSECTED ) {
                   this.gazeOut(INTERSECTED);
               };

               //Updated INTERSECTED with new object
               INTERSECTED = newObj;
               //Is the object gazeable?
               //if (INTERSECTED.gazeable) {
               //Yes
               this.gazeOver(INTERSECTED);
               //}
           } else {
               //Ok it looks like we are in love
               gazeLong(INTERSECTED);
           }

       } else {
           //Is the object gazeable?
           //if (INTERSECTED.gazeable) {
           if (INTERSECTED) {
               //GAZE OUT
               this.gazeOut(INTERSECTED);
           }
           //}
           INTERSECTED = null;

       }
   }

   gazeOut(threeObject) {
      threeObject.userData.hitTime = 0;
      //if(threeObject.fuse) {
      this.fuse.out();
      //}

      this.reticle.hit = false;
      this.reticle.setDepthAndScale();

      if ( threeObject.onGazeOut != null ) {
          threeObject.onGazeOut();
      }
  }

  gazeOver(threeObject) {
      const threeObjectData = threeObject.reticulumData;
      this.reticle.colorTo = threeObjectData.reticleHoverColor || this.reticle.globalColorTo;

      //Fuse
      this.fuse.over(threeObjectData.fuseDuration, threeObjectData.fuseVisible);

      if (threeObjectData.fuseColor) {
        this.fuse.color = threeObjectData.fuseColor;
      }

      threeObject.userData.hitTime = this.clock.getElapsedTime();

      //Reticle
      //Vibrate
      ReticleUtil.vibrate( this.reticle.vibrateHover );
      //Does object have an action assigned to it?
      if (threeObject.onGazeOver != null) {
          threeObject.onGazeOver();
      }
  }

  gazeLong( threeObject ) {
      let distance;
      const elapsed = clock.getElapsedTime(),
      gazeTime = elapsed - threeObject.userData.hitTime;
      //There has to be a better  way...
      //Keep updating distance while user is focused on target
      if( this.reticle.active ) {

          if(!this.settings.lockDistance){
              this.reticle.worldPosition.setFromMatrixPosition( threeObject.matrixWorld );
              distance = this.camera.position.distanceTo( this.reticle.worldPosition );
              distance -= threeObject.geometry.boundingSphere.radius;
          }

          this.reticle.hit = true;

          if(!this.settings.lockDistance) {
            this.depthScale = distance;
          }
      }

      //Fuse
      if( gazeTime >= fuse.duration && !fuse.active ) {
          //Vibrate
          ReticleUtil.vibrate( this.fuse.vibratePattern );
          //Does object have an action assigned to it?
          if (threeObject.onGazeLong != null) {
              threeObject.onGazeLong();
          }
          //Reset the clock
          threeObject.userData.hitTime = elapsed;
      } else {
          this.fuse.update(gazeTime);
      }
  }

  gazeClick( threeObject ) {
      const clickCancelFuse = threeObject.reticulumData.clickCancelFuse != null ? threeObject.reticulumData.clickCancelFuse : this.fuse.clickCancel;
      //Cancel Fuse
      if( clickCancelFuse ) {
          //Reset the clock
          threeObject.userData.hitTime = this.clock.getElapsedTime();
          //Force gaze to end...this might be to assumptions
          this.fuse.update( this.fuse.duration );
      }

      //Does object have an action assigned to it?
      if (threeObject.onGazeClick != null) {
          threeObject.onGazeClick();
      }
  }

  //This function is called on click or touch events
  touchClickHandler(e) {
      if( this.reticle.hit && INTERSECTED ) {
          e.preventDefault();
          this.gazeClick(INTERSECTED);
      }
  }

  add(threeObject, options) {
      const parameters = options || {};

      //Stores object options for reticulum
      threeObject.reticulumData = {};
      threeObject.reticulumData.gazeable = true;
      //Reticle
      threeObject.reticulumData.reticleHoverColor = null;
      if(parameters.reticleHoverColor) {
          threeObject.reticulumData.reticleHoverColor = new THREE.Color(parameters.reticleHoverColor);
      }
      //Fuse
      threeObject.reticulumData.fuseDuration              = parameters.fuseDuration           || null;
      threeObject.reticulumData.fuseColor                 = parameters.fuseColor              || null;
      threeObject.reticulumData.fuseVisible               = parameters.fuseVisible            === undefined ? null : parameters.fuseVisible;
      threeObject.reticulumData.clickCancelFuse           = parameters.clickCancelFuse        === undefined ? null : parameters.clickCancelFuse;
      //Events
      threeObject.onGazeOver                              = parameters.onGazeOver             || null;
      threeObject.onGazeOut                               = parameters.onGazeOut              || null;
      threeObject.onGazeLong                              = parameters.onGazeLong             || null;
      threeObject.onGazeClick                             = parameters.onGazeClick            || null;


      //Add object to list
      this.collisionList.push(threeObject);
  }

  remove(threeObject) {
      const index = collisionList.indexOf(threeObject);
      threeObject.reticulumData.gazeable = false;
      if (index > -1) {
          this.collisionList.splice(index, 1);
      }
  }

  update() {
      const delta = this.clock.getDelta(); //
      this.detectHit();

      //Proximity
      if(this.settings.proximity) {
          this.proximity();
      }

      //Animation
      this.reticle.update(delta);

  }


  set depthScale(value) {
    ReticleUtil.setDepthAndScale(value, this.parentContainer, this.camera);
  }
}
