import {
	Color,
	LinearFilter,
	MathUtils,
	Matrix4,
	Mesh,
	PerspectiveCamera,
	Plane,
	RGBAFormat,
	ShaderMaterial,
	UniformsUtils,
	Vector3,
	Vector4,
	WebGLRenderTarget,
	Object3D,
	PlaneGeometry
} from 'three';

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader'
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";


// dunno if this is smart to keep the helper class here
class PostProcessingReflectorContainer extends Object3D{
	constructor(width, height, lowQualityMaterial, options = {}){
		super();
		const mirrorGeometry = new PlaneGeometry( width, height, 1, 1 );
		// can the geometry be shared?;
		this.realtimeMirror = new PostProcessingReflector(mirrorGeometry, options);
		this.lowQualityMirror = new Mesh(mirrorGeometry, lowQualityMaterial)
		this.type = "PostProcessingReflectorContainer"
		this.add(this.realtimeMirror);
		this.add(this.lowQualityMirror);
	}

	setQualityMode(high){
		this.realtimeMirror.visible = high;
		this.lowQualityMirror.visible = !high;
	}
}

class PostProcessingReflector extends Mesh {

	constructor( geometry, options = {}, onBeforeRenderCallback ) {

		super( geometry );

		this.type = 'Reflector';

		const scope = this;

		const color = ( options.color !== undefined ) ? new Color( options.color ) : new Color( 0x7F7F7F );
		const textureWidth = options.textureWidth || 512;
		const textureHeight = options.textureHeight || 512;
		const clipBias = options.clipBias || 0;
		const shader = options.shader || PostProcessingReflector.ReflectorShader;

		//

		const reflectorPlane = new Plane();
		const normal = new Vector3();
		const reflectorWorldPosition = new Vector3();
		const cameraWorldPosition = new Vector3();
		const rotationMatrix = new Matrix4();
		const lookAtPosition = new Vector3( 0, 0, - 1 );
		const clipPlane = new Vector4();

		const view = new Vector3();
		const target = new Vector3();
		const q = new Vector4();

		const textureMatrix = new Matrix4();
		const virtualCamera = new PerspectiveCamera();

		const parameters = {
			minFilter: LinearFilter,
			magFilter: LinearFilter,
			format: RGBAFormat,
            samples: options.multisampling,
		};

		let renderTarget;
		if (options.multisampling > 0){
			renderTarget = new WebGLRenderTarget( textureWidth, textureHeight, parameters );
			renderTarget.samples = options.multisampling;
			// console.log('created multisampling mirror RT', options, renderTarget);
		} else {
			renderTarget = new WebGLRenderTarget( textureWidth, textureHeight, parameters );
		}
         
        // multirendertarget made performance absolutely abysmal

		if ( ! MathUtils.isPowerOfTwo( textureWidth ) || ! MathUtils.isPowerOfTwo( textureHeight ) ) {

			renderTarget.texture.generateMipmaps = false;

		}



		const composer = new EffectComposer(null, renderTarget);
		const renderPass = new RenderPass(null, virtualCamera);
        const fxaaPass = new ShaderPass(FXAAShader);
		fxaaPass.uniforms['resolution'].value.x = 1 / ( textureWidth * 1);
		fxaaPass.uniforms['resolution'].value.y = 1 / ( textureHeight * 1);
		// renderPass.clear = true;
		composer.renderToScreen = false;
        // set the mirror to use savepass result as texture
        // this.savePass = new SavePass(renderTarget);
		// this.savePass.clear = true;
		composer.addPass(renderPass);
		composer.addPass(fxaaPass);
		// composer.addPass(this.savePass);

		this.realtimeMaterial = new ShaderMaterial( {
			uniforms: UniformsUtils.clone( shader.uniforms ),
			fragmentShader: shader.fragmentShader,
			vertexShader: shader.vertexShader
		} );
		this.realtimeMaterial.uniforms[ 'tDiffuse' ].value = composer.readBuffer.texture;
        // material.uniforms[ 'tDiffuse' ].value = this.renderTarget;
		this.realtimeMaterial.uniforms[ 'color' ].value = color;
		this.realtimeMaterial.uniforms[ 'textureMatrix' ].value = textureMatrix;
		
		this.material = this.realtimeMaterial;

		// this.material = material;
		this.renderReflection = function ( renderer, scene, camera ) {

			
			scope.material = scope.realtimeMaterial;
			reflectorWorldPosition.setFromMatrixPosition( scope.matrixWorld );
			cameraWorldPosition.setFromMatrixPosition( camera.matrixWorld );

			rotationMatrix.extractRotation( scope.matrixWorld );

			normal.set( 0, 0, 1 );
			normal.applyMatrix4( rotationMatrix );

			view.subVectors( reflectorWorldPosition, cameraWorldPosition );

			// Avoid rendering when reflector is facing away

			if ( view.dot( normal ) > 0 ) return;

			view.reflect( normal ).negate();
			view.add( reflectorWorldPosition );

			rotationMatrix.extractRotation( camera.matrixWorld );

			lookAtPosition.set( 0, 0, - 1 );
			lookAtPosition.applyMatrix4( rotationMatrix );
			lookAtPosition.add( cameraWorldPosition );

			target.subVectors( reflectorWorldPosition, lookAtPosition );
			target.reflect( normal ).negate();
			target.add( reflectorWorldPosition );

			virtualCamera.position.copy( view );
			virtualCamera.up.set( 0, 1, 0 );
			virtualCamera.up.applyMatrix4( rotationMatrix );
			virtualCamera.up.reflect( normal );
			virtualCamera.lookAt( target );

			virtualCamera.far = camera.far; // Used in WebGLBackground

			virtualCamera.updateMatrixWorld();
			virtualCamera.projectionMatrix.copy( camera.projectionMatrix );

			// Update the texture matrix
			textureMatrix.set(
				0.5, 0.0, 0.0, 0.5,
				0.0, 0.5, 0.0, 0.5,
				0.0, 0.0, 0.5, 0.5,
				0.0, 0.0, 0.0, 1.0
			);
			textureMatrix.multiply( virtualCamera.projectionMatrix );
			textureMatrix.multiply( virtualCamera.matrixWorldInverse );
			textureMatrix.multiply( scope.matrixWorld );

			// Now update projection matrix with new clip plane, implementing code from: http://www.terathon.com/code/oblique.html
			// Paper explaining this technique: http://www.terathon.com/lengyel/Lengyel-Oblique.pdf
			reflectorPlane.setFromNormalAndCoplanarPoint( normal, reflectorWorldPosition );
			reflectorPlane.applyMatrix4( virtualCamera.matrixWorldInverse );

			clipPlane.set( reflectorPlane.normal.x, reflectorPlane.normal.y, reflectorPlane.normal.z, reflectorPlane.constant );

			const projectionMatrix = virtualCamera.projectionMatrix;

			q.x = ( Math.sign( clipPlane.x ) + projectionMatrix.elements[ 8 ] ) / projectionMatrix.elements[ 0 ];
			q.y = ( Math.sign( clipPlane.y ) + projectionMatrix.elements[ 9 ] ) / projectionMatrix.elements[ 5 ];
			q.z = - 1.0;
			q.w = ( 1.0 + projectionMatrix.elements[ 10 ] ) / projectionMatrix.elements[ 14 ];

			// Calculate the scaled plane vector
			clipPlane.multiplyScalar( 2.0 / clipPlane.dot( q ) );

			// Replacing the third row of the projection matrix
			projectionMatrix.elements[ 2 ] = clipPlane.x;
			projectionMatrix.elements[ 6 ] = clipPlane.y;
			projectionMatrix.elements[ 10 ] = clipPlane.z + 1.0 - clipBias;
			projectionMatrix.elements[ 14 ] = clipPlane.w;

			// Render
            

			// renderTarget.texture.encoding = renderer.outputEncoding;

			scope.visible = false;

            // any sense in making multiple composers all the time?
			renderer.state.buffers.depth.setMask( true ); // make sure the depth buffer is writable so it can be properly cleared, see #18897

			// if ( renderer.autoClear === false ) renderer.clear();

			composer.renderer = renderer;
			renderPass.scene = scene;

            composer.render();

			// const currentRenderTarget = renderer.getRenderTarget();

			// const currentXrEnabled = renderer.xr.enabled;
			// const currentShadowAutoUpdate = renderer.shadowMap.autoUpdate;

			// renderer.xr.enabled = false; // Avoid camera modification
			// renderer.shadowMap.autoUpdate = false; // Avoid re-computing shadows

            
			// renderer.setRenderTarget( renderTarget );

			// renderer.render( scene, virtualCamera );

			// renderer.xr.enabled = currentXrEnabled;
			// renderer.shadowMap.autoUpdate = currentShadowAutoUpdate;

			// renderer.setRenderTarget( currentRenderTarget );

			// Restore viewport


            // not sure if this is even neccessary
			const viewport = camera.viewport;

			if ( viewport !== undefined ) {

				renderer.state.viewport( viewport );

			}

			scope.visible = true;
            // console.log('mirror rendering', scope, renderer);
		};

		
        this.onBeforeRender = this.renderReflection;

	}

}

PostProcessingReflector.prototype.isReflector = true;

PostProcessingReflector.ReflectorShader = {

	uniforms: {

		'color': {
			value: null
		},

		'tDiffuse': {
			value: null
		},

		'textureMatrix': {
			value: null
		}

	},

	vertexShader: /* glsl */`
		uniform mat4 textureMatrix;
		varying vec4 vUv;

		#include <common>
		#include <logdepthbuf_pars_vertex>

		void main() {

			vUv = textureMatrix * vec4( position, 1.0 );

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

			#include <logdepthbuf_vertex>

		}`,

	fragmentShader: /* glsl */`
		uniform vec3 color;
		uniform sampler2D tDiffuse;
		varying vec4 vUv;

		#include <logdepthbuf_pars_fragment>

		float blendOverlay( float base, float blend ) {

			return( base < 0.5 ? ( 2.0 * base * blend ) : ( 1.0 - 2.0 * ( 1.0 - base ) * ( 1.0 - blend ) ) );

		}

		vec3 blendOverlay( vec3 base, vec3 blend ) {

			return vec3( blendOverlay( base.r, blend.r ), blendOverlay( base.g, blend.g ), blendOverlay( base.b, blend.b ) );

		}

		void main() {

			#include <logdepthbuf_fragment>

			vec4 base = texture2DProj( tDiffuse, vUv );
			gl_FragColor = base;
			//gl_FragColor = vec4( blendOverlay( base.rgb, color ), 1.0 );
			gl_FragColor.rgb *= color;

		}`
};

export { PostProcessingReflectorContainer };