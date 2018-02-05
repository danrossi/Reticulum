 import { EventDispatcher } from '../../../three.js/src/core/EventDispatcher';

 export default class ReticleEventDispatcher extends EventDispatcher {

 	constructor() {
 		super();
 	}

 	dispatchEvent( event, ...args ) {

		if ( this._listeners === undefined ) return;

		const listeners = this._listeners,
		listenerArray = listeners[ event.type ];

		if ( listenerArray !== undefined ) {

			event.target = this;

			const array = listenerArray.slice( 0 );

			for ( let i = 0, l = array.length; i < l; i += 1 ) {

				array[ i ].call( this, event, ...args );

			}

		}

	}		


 }