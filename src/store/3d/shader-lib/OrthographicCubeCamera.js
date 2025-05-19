import { Vector3,Object3D, OrthographicCamera } from 'three';
import * as THREE from 'three';

class OrthographicCubeCamera extends Object3D {

	constructor( near, far, resolution, renderTargetOptions, layers ) {

		super();

		// this requires quite the bunch of rendertargets
        this.renderTarget = new THREE.WebGLCubeRenderTarget(resolution, renderTargetOptions);
        this.swapRenderTarget = new THREE.WebGLCubeRenderTarget(resolution, renderTargetOptions);
		

        this.renderTarget.texture.mapping = THREE.CubeReflectionMapping;
        this.swapRenderTarget.texture.mapping = THREE.CubeReflectionMapping;
		this.lastUpdatedTarget = this.renderTarget;
		this.texture = this.lastUpdatedTarget.texture;

		const defaultExtent = 50;

		this.type = 'OrthographicCubeCamera';
		this.layers = layers !== undefined ? layers : new THREE.Layers();

		this.cameraPX = new OrthographicCamera(-defaultExtent, defaultExtent, defaultExtent, -defaultExtent, near, far)
		this.cameraPX.layers = this.layers;
		this.cameraPX.up.set( 0, - 1, 0 );
		this.cameraPX.lookAt( new Vector3( 1, 0, 0 ) );
		this.add( this.cameraPX );

		this.cameraNX = new OrthographicCamera(-defaultExtent, defaultExtent, defaultExtent, -defaultExtent, near, far)
		this.cameraNX.layers = this.layers;
		this.cameraNX.up.set( 0, - 1, 0 );
		this.cameraNX.lookAt( new Vector3( - 1, 0, 0 ) );
		this.add( this.cameraNX );

		this.cameraPY = new OrthographicCamera(-defaultExtent, defaultExtent, defaultExtent, -defaultExtent, near, far)
		this.cameraPY.layers = this.layers;
		this.cameraPY.up.set( 0, 0, 1 );
		this.cameraPY.lookAt( new Vector3( 0, 1, 0 ) );
		this.add( this.cameraPY );

		this.cameraNY = new OrthographicCamera(-defaultExtent, defaultExtent, defaultExtent, -defaultExtent, near, far)
		this.cameraNY.layers = this.layers;
		this.cameraNY.up.set( 0, 0, - 1 );
		this.cameraNY.lookAt( new Vector3( 0, - 1, 0 ) );
		this.add( this.cameraNY );

		this.cameraPZ = new OrthographicCamera(-defaultExtent, defaultExtent, defaultExtent, -defaultExtent, near, far)
		this.cameraPZ.layers = this.layers;
		this.cameraPZ.up.set( 0, - 1, 0 );
		this.cameraPZ.lookAt( new Vector3( 0, 0, 1 ) );
		this.add( this.cameraPZ );

        this.cameraNZ = new OrthographicCamera(-defaultExtent, defaultExtent, defaultExtent, -defaultExtent, near, far)
		this.cameraNZ.layers = this.layers;
		this.cameraNZ.up.set( 0, - 1, 0 );
		this.cameraNZ.lookAt( new Vector3( 0, 0, - 1 ) );
		this.add( this.cameraNZ );
		
		this.cameraHelpers = {
			px: new THREE.CameraHelper(this.cameraPX),
			nx: new THREE.CameraHelper(this.cameraNX),
			py: new THREE.CameraHelper(this.cameraPY),
			ny: new THREE.CameraHelper(this.cameraNY),
			pz: new THREE.CameraHelper(this.cameraPZ),
			nz: new THREE.CameraHelper(this.cameraNZ)
		}
	}


	setTransformParameters(boxSize, boxPosition){

		const offsetFromSurface = 15;

		//console.log("Setting orthocamera size to ", boxSize, boxPosition)
		this.cameraPX.bottom = -boxSize.y / 2;
		this.cameraPX.top = boxSize.y / 2;
		this.cameraPX.left = -boxSize.z / 2;
		this.cameraPX.right = boxSize.z / 2;
		this.cameraPX.far = boxSize.x;
		this.cameraPX.near = (boxSize.x / 2) - offsetFromSurface;
		this.cameraPX.updateProjectionMatrix();

		this.cameraNX.bottom = -boxSize.y / 2;
		this.cameraNX.top = boxSize.y / 2;
		this.cameraNX.left = -boxSize.z / 2;
		this.cameraNX.right = boxSize.z / 2;
		this.cameraNX.far = boxSize.x;
		this.cameraNX.near = (boxSize.x / 2) - offsetFromSurface;
		this.cameraNX.updateProjectionMatrix();

		this.cameraPZ.bottom = -boxSize.y / 2;
		this.cameraPZ.top = boxSize.y / 2;
		this.cameraPZ.left = -boxSize.x / 2;
		this.cameraPZ.right = boxSize.x / 2;
		this.cameraPZ.far = boxSize.z;
		this.cameraPZ.near = (boxSize.z / 2) - offsetFromSurface;
		this.cameraPZ.updateProjectionMatrix();

		this.cameraNZ.bottom = -boxSize.y / 2;
		this.cameraNZ.top = boxSize.y / 2;
		this.cameraNZ.left = -boxSize.x / 2;
		this.cameraNZ.right = boxSize.x / 2;
		this.cameraNZ.far = boxSize.z;
		this.cameraNZ.near = (boxSize.z / 2) - offsetFromSurface;
		this.cameraNZ.updateProjectionMatrix();

		this.cameraPY.bottom = -boxSize.z / 2;
		this.cameraPY.top = boxSize.z / 2;
		this.cameraPY.left = -boxSize.x / 2;
		this.cameraPY.right = boxSize.x / 2;
		this.cameraPY.far = boxSize.y;
		this.cameraPY.near = (boxSize.y / 2) - offsetFromSurface;
		this.cameraPY.updateProjectionMatrix();

		this.cameraNY.bottom = -boxSize.z / 2;
		this.cameraNY.top = boxSize.z / 2;
		this.cameraNY.left = -boxSize.x / 2;
		this.cameraNY.right = boxSize.x / 2;
		this.cameraNY.far = boxSize.y;
		this.cameraNY.near = (boxSize.y / 2) - offsetFromSurface;
		this.cameraNY.updateProjectionMatrix();

        this.position.set(boxPosition.x, boxPosition.y, boxPosition.z);

		Object.values(this.cameraHelpers).forEach(element => {
			element.update();
		});

	}

	updateHelpers(){
		Object.values(this.cameraHelpers).forEach(element => {
			element.update();
		});
	}


	update( renderer, scene ) {

		if ( this.parent === null ) this.updateMatrixWorld();

		let renderTarget = undefined;

		if (this.lastUpdatedTarget === this.renderTarget){
			renderTarget = this.swapRenderTarget;
		} else {
			renderTarget = this.renderTarget;
		}
		

		const [ cameraPX, cameraNX, cameraPY, cameraNY, cameraPZ, cameraNZ ] = this.children;

		const currentXrEnabled = renderer.xr.enabled;
		const currentRenderTarget = renderer.getRenderTarget();

		renderer.xr.enabled = false;

		const generateMipmaps = renderTarget.texture.generateMipmaps;

		renderTarget.texture.generateMipmaps = false;

		renderer.setRenderTarget( renderTarget, 0 );
		renderer.render( scene, cameraPX );

		renderer.setRenderTarget( renderTarget, 1 );
		renderer.render( scene, cameraNX );

		renderer.setRenderTarget( renderTarget, 2 );
		renderer.render( scene, cameraPY );

		renderer.setRenderTarget( renderTarget, 3 );
		renderer.render( scene, cameraNY );

		renderer.setRenderTarget( renderTarget, 4 );
		renderer.render( scene, cameraPZ );

		renderTarget.texture.generateMipmaps = generateMipmaps;

		renderer.setRenderTarget( renderTarget, 5 );
		renderer.render( scene, cameraNZ );

		this.lastUpdatedTarget = renderTarget;
		this.texture = renderTarget.texture;
		renderer.setRenderTarget( currentRenderTarget );

		renderer.xr.enabled = currentXrEnabled;

        //console.log("Rendered ortho cubecamera", this.name, this)

	}

}

export { OrthographicCubeCamera };
