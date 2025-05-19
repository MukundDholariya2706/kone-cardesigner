import * as THREE from 'three';
import CSG from './3rd-party/THREE-CSGMesh/three-csg'
import { Box3, Box3Helper, Vector3 } from 'three';

// converts unreliably defined values to vec2
export function toVec2(value, valueName){
    
  let ret = undefined;
  if (value === undefined){
    ret = new THREE.Vector2(1, 1);
  }
  if (Array.isArray(value)){
    ret = new THREE.Vector2(value[0], value[1]);
  } else {
    console.warn(valueName, 'had unexpected type, changing to vec2 array')
    ret = new THREE.Vector2(value, value);
  }
  return ret;
}


/**
 * Returns sliced mesh by cutting a piece of the original mesh that intersects the box
 * @param {THREE.Mesh} mesh
 * @param {Object} intersectBox 
 */
export function sliceMesh(mesh, intersectBox) {
  const { width = 0, height = 0, depth = 0, position: { x = 0, y = 0, z = 0 } = {} } = intersectBox
  
  const cutter = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth));
  cutter.position.x = x
  cutter.position.y = y
  cutter.position.z = z
  cutter.updateMatrix()

  const wallBsp = new CSG.fromMesh(mesh)
  //console.log(wallBsp)
  const cutterBsp = new CSG.fromMesh(cutter)
  const intersectBsp = wallBsp.intersect(cutterBsp)

  const resultMesh = CSG.toMesh(intersectBsp, mesh.matrix, mesh.material)
  resultMesh.updateMatrix()
  resultMesh.name = mesh.name;
  resultMesh.position.copy(mesh.position);
  resultMesh.quaternion.copy(mesh.quaternion);
  //console.log(resultMesh)

  return resultMesh

}

/*
 * Easing Functions - inspired from http://gizma.com/easing/
 * only considering the t value for the range [0, 1] => [0, 1]
 */
export const EasingFunctions = {
  // no easing, no acceleration
  linear: t => t,
  // accelerating from zero velocity
  easeInQuad: t => t*t,
  // decelerating to zero velocity
  easeOutQuad: t => t*(2-t),
  // acceleration until halfway, then deceleration
  easeInOutQuad: t => t<.5 ? 2*t*t : -1+(4-2*t)*t,
  // accelerating from zero velocity 
  easeInCubic: t => t*t*t,
  // decelerating to zero velocity 
  easeOutCubic: t => (--t)*t*t+1,
  // acceleration until halfway, then deceleration 
  easeInOutCubic: t => t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1,
  // accelerating from zero velocity 
  easeInQuart: t => t*t*t*t,
  // decelerating to zero velocity 
  easeOutQuart: t => 1-(--t)*t*t*t,
  // acceleration until halfway, then deceleration
  easeInOutQuart: t => t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t,
  // accelerating from zero velocity
  easeInQuint: t => t*t*t*t*t,
  // decelerating to zero velocity
  easeOutQuint: t => 1+(--t)*t*t*t*t,
  // acceleration until halfway, then deceleration 
  easeInOutQuint: t => t<.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t
}

// flips an RGBA pixel array vertically
// TODO: if useful, add horizontal and support for extra formats
export function flipPixelArray(pixelArray, width, height){
  const halfHeight = height / 2 | 0;
  const bytesPerRow = width * 4;
  let tmpRow = new Uint8Array(width * 4);
  for(let y = 0; y < halfHeight; ++y){
    const topOffset = y * bytesPerRow;
    const bottomOffset = (height - y - 1) * bytesPerRow;

    tmpRow.set(pixelArray.subarray(topOffset, topOffset + bytesPerRow))

    pixelArray.copyWithin(topOffset, bottomOffset, bottomOffset + bytesPerRow)
    pixelArray.set(tmpRow, bottomOffset);
  }
}

// finds the smallest shift in single axis to be able to yield from the way of another object
function findOptimalVectorToYieldTo(ownBounds, targetBounds, axisLocks){
  // check the intersection area and figure out the most optimal direction to get out of the way
  const inters = ownBounds.clone();
  inters.intersect(targetBounds);
  const intersectionSize = new Vector3();
  inters.getSize(intersectionSize);
  const intersectionCenter = new Vector3()
  inters.getCenter(intersectionCenter);
  const targetCenter = new Vector3()
  targetBounds.getCenter(targetCenter);
  const difference = new Vector3();
  difference.subVectors(intersectionCenter, targetCenter);
  // console.log("diff:", difference, "size:", intersectionSize);

  // this seems a bit wasteful but should work
  const candidates = []

  // add a little bit of extra so the bounds don't touch later
  // const margin = 0.1;
  const margin = -2.7;
  let sign = 0;
  if (!axisLocks.lockX){
    sign = Math.sign(difference.x);
    candidates.push(new Vector3(intersectionSize.x * sign + margin * sign, 0, 0));
  }
  if (!axisLocks.lockY){
    sign = Math.sign(difference.y);
    candidates.push(new Vector3(0, intersectionSize.y * sign + margin * sign, 0));
  }
  if (!axisLocks.lockZ){
    sign = Math.sign(difference.z);
    candidates.push(new Vector3(0, 0, intersectionSize.z * sign + margin * sign));
  }

  let yieldVector = candidates[0];
  for (let index = 1; index < candidates.length; index++) {
    const element = candidates[index];
    // if this is 
    if (element.lengthSq() < yieldVector.lengthSq()){
      // console.log("shorter", index);
      yieldVector = element;
    }
  }
  // console.log("cheapest move:", yieldVector);
  return yieldVector;
}

function degrees_to_radians(degrees)
{
  const pi = Math.PI;
  return degrees * (pi/180);
}

/**
 * Calculates properties needed for optimal image capturing:
 * camera position & target, optimal image size (width, height)
 * @param {*} param0 
 */
export function getCaptureCameraProperties({ scene, fov = 45, filter = (mesh) => true, crop = true, width = 1024, height = 1024 }) {

  const bb = new Box3();
  scene.traverse(node => {
    if (node.isMesh && filter(node)) {
      node.geometry.computeBoundingBox();
      bb.expandByObject(node);
    }
  });

  const aspectRatio = ( bb.max.x - bb.min.x ) / ( bb.max.y - bb.min.y );
  const cameraDistance = 1.0; // we can use this if we want to zoom in or out a bit
  const sizes = new Vector3().subVectors(bb.max, bb.min);
  const maxExtent = Math.max(sizes.x, sizes.y, sizes.z);
  const cameraView = 2.0 * Math.tan(0.5 * degrees_to_radians(fov)); // Visible height 1 meter in front
  let distance = cameraDistance * maxExtent / cameraView; // Combined wanted distance from the object
  
  // wide ratio expands the frustum so we want to move closer
  if (aspectRatio > 1){
    distance /= aspectRatio;
  }
  const targetCenter = new Vector3();
  bb.getCenter(targetCenter);
  const target = [
    targetCenter.x,
    targetCenter.y,
    targetCenter.z
  ];
  const position = [
    targetCenter.x,
    targetCenter.y,
    targetCenter.z + distance
  ];

  if (crop) {
    width = Math.min(width, Math.floor( width * aspectRatio + 1));
    height = Math.min(height, Math.floor( height / aspectRatio + 1));
  }

  
  return {
    position,
    target,
    width,
    height,
    bb
  };
}

export function getCardesignerMeshes(scene){
  // sigh, not introduced in current threejs version yet
  // const meshes = scene.getObjectsByProperty("type", "Mesh")

  const meshes = []
  scene.children.forEach(element => {
    // we can pretty safely assume that if it is tied to a component, that's our guy
    if (element.userData["component"] !== undefined){
      meshes.push(element);
    }
  });
  return meshes;
}

export function findMeshesByComponent(scene, componentId){
  const cdMeshes = getCardesignerMeshes(scene);
  const matches = [];
  cdMeshes.forEach(element => {
    if (element.userData["component"] === componentId){
      matches.push(element);
    }
  });
  // console.log(matches);
  return matches;
}

export function findMeshesByComponentType(scene, componentType){
  const cdMeshes = getCardesignerMeshes(scene);
  const matches = [];
  //console.log(matches);
  cdMeshes.forEach(element => {
    if (element.userData["componentType"] === componentType){
      matches.push(element);
    }
  });
  //console.log(componentType, matches, cdMeshes);
  return matches;
}

function getUnifiedWorldBounds(objects){
  let componentBounds = undefined;
  objects.forEach(element => {
    element.geometry.computeBoundingBox();
    const worldBounds = new Box3().setFromObject(element);
    if (componentBounds === undefined){
      componentBounds = worldBounds;
    } else {
      componentBounds.expandByObject(element);
    }
    //console.log(element);
  });
  return componentBounds;
}

function findComponentTypeBounds(targetType, scene){
  
  const targetBounds = new Box3();
  const targetMeshes = [];
  const meshes = findMeshesByComponentType(scene, targetType);
  meshes.forEach(mesh => {
    targetMeshes.push(mesh);
    targetBounds.expandByObject(mesh);
  });
  return { componentObjects: targetMeshes, componentBounds: targetBounds };
}

// returns true if the object has yielded somewhere, we can recheck after that
function yieldToFirstContact(ownBoundsData, targetBoundsData, axisLocks, scene){
  // console.log(ownBoundsData, targetBoundsData);
  const dev = false;
  for (let index = 0; index < targetBoundsData.length; index++) {
    const element = targetBoundsData[index];
    // console.log(ownBoundsData.componentBounds, "vs", element.componentBounds);
    if (ownBoundsData.componentBounds.intersectsBox(element.componentBounds)){
      if (dev){
        const intersectionBox =  ownBoundsData.componentBounds.clone();
        intersectionBox.intersect(element.componentBounds);
        const intersectionHelper = new Box3Helper(intersectionBox, 0xff00ff);
        scene.add(intersectionHelper);
      }
      const yieldVector = findOptimalVectorToYieldTo(ownBoundsData.componentBounds, element.componentBounds, axisLocks);
      ownBoundsData.componentObjects.forEach(element => {
        element.position.add(yieldVector);
      });
      return true;
    }
  }
  return false;
}

export function fixIntersections(componentType, targetTypes, scene, axisLocks){

  //TODO: find out the locking axes somehow and generalize this, now it's just for the tenant directory
  const ownData = findComponentTypeBounds(componentType, scene);
  const targetData = []
  targetTypes.forEach(element => {
    targetData.push(findComponentTypeBounds(element, scene));
  });
   
  // console.log(targetData);
  if (targetData.length < 1){
    // console.log("Nothing to see");
  } else {

    // this is a bit dangerous, this could lead to a tennis match between components
    const maxTries = 5;
    for (let index = 0; index < maxTries; index++) {
      // console.log("trying");
      const yielded = yieldToFirstContact(ownData, targetData, axisLocks, scene);
      // update for next iteration
      if (yielded){
        ownData.componentBounds = getUnifiedWorldBounds(ownData.componentObjects);
      } else {
        break; // we're good for now
      }
    }
  }
}

// Since current version of cameracontrols doesn't have this, here is a very simple custom implementation
// basically: get vector from focus point to camera pivot, and take another step across
export function getCameraLookPosition(cameraTarget, focusPoint){
  const targetLocalCrossVector = focusPoint.sub(cameraTarget);
  const newPosition = cameraTarget.sub(targetLocalCrossVector);
  return newPosition;
}

// taken from newer (and older) threejs BufferGeometry.js
export function computeTangents (node) {

  let buffergeometry = node.geometry
  const errorMessageBase = '3d-utils computeTangents() failed: ';
  let index = buffergeometry.index;
  let attributes = buffergeometry.attributes;
  if (attributes.position === undefined){
    console.error( errorMessageBase + 'Missing required attribute: position' );
    return;
  }
  const positions = attributes.position.array;
  const nVertices = positions.length / 3;


  const testColorArray = new Float32Array(nVertices * 3);
  const testColor = new THREE.Color(0xffffff);
  // make a rainbow
  for ( let i = 0; i < nVertices; i++){
    //testColor.setHSL(1.0 * (i/nVertices), 0.7, 0.5);
    // here is how you can see different shades of red, fancy
    testColor.setRGB(i/nVertices, 0, 0)
    testColor.toArray(testColorArray, i*3)
  }
  buffergeometry.setAttribute('testColor', new THREE.BufferAttribute(testColorArray, 3));

  // based on http://www.terathon.com/code/tangent.html
  // (per vertex tangents)
  if (index === null){
    // note, this won't replace the copy in the rendering!
    buffergeometry = buffergeometry.toIndexed();
    // here is a quick and super-dirty way to check if the reference is in use still: just mess up the mesh
    //buffergeometry.setDrawRange(0, 20);
    index = buffergeometry.index;
    // yes, it is actually called triangle soup, or polysoup
    //BufferGeometryTrianglesoupToIndexed(buffergeometry);
    if (buffergeometry.index === null){
      console.error( errorMessageBase + 'Indexing unindexed buffergeometry failed for' + buffergeometry.uuid );
      console.error(buffergeometry);
      return;
    }
  }
  if (attributes.normal === undefined){
    console.error( errorMessageBase + 'Missing required attribute: normal' );
    return;
  }
  if (attributes.uv === undefined){
    console.error( errorMessageBase + 'Missing required attribute: uv' );
    return;
  }

  const indices = index.array;
  const normals = attributes.normal.array;
  const uvs = attributes.uv.array;


  if ( attributes.tangent === undefined ) {

    const emptyBufferAttribute = new THREE.BufferAttribute( new Float32Array( 4 * nVertices ), 4 );
    buffergeometry.setAttribute( 'tangent', emptyBufferAttribute);
    attributes = buffergeometry.attributes;
  }
  const tangents = attributes.tangent.array;

  const tan1 = [], tan2 = [];

  for ( let i = 0; i < nVertices; i ++ ) {

    tan1[ i ] = new THREE.Vector3();
    tan2[ i ] = new THREE.Vector3();

  }

  const vA = new THREE.Vector3(),
    vB = new THREE.Vector3(),
    vC = new THREE.Vector3(),

    uvA = new THREE.Vector2(),
    uvB = new THREE.Vector2(),
    uvC = new THREE.Vector2(),

    sdir = new THREE.Vector3(),
    tdir = new THREE.Vector3();

  function handleTriangle( a, b, c ) {

    vA.fromArray( positions, a * 3 );
    vB.fromArray( positions, b * 3 );
    vC.fromArray( positions, c * 3 );

    uvA.fromArray( uvs, a * 2 );
    uvB.fromArray( uvs, b * 2 );
    uvC.fromArray( uvs, c * 2 );

    vB.sub( vA );
    vC.sub( vA );

    uvB.sub( uvA );
    uvC.sub( uvA );

    const r = 1.0 / ( uvB.x * uvC.y - uvC.x * uvB.y );

    // silently ignore degenerate uv triangles having coincident or colinear vertices

    if ( ! isFinite( r ) ) return;

    sdir.copy( vB ).multiplyScalar( uvC.y ).addScaledVector( vC, - uvB.y ).multiplyScalar( r );
    tdir.copy( vC ).multiplyScalar( uvB.x ).addScaledVector( vB, - uvC.x ).multiplyScalar( r );

    tan1[ a ].add( sdir );
    tan1[ b ].add( sdir );
    tan1[ c ].add( sdir );

    tan2[ a ].add( tdir );
    tan2[ b ].add( tdir );
    tan2[ c ].add( tdir );

  }

  let groups = buffergeometry.groups;

  if ( groups.length === 0 ) {

    groups = [ {
      start: 0,
      count: indices.length
    } ];

  }

  for ( let i = 0, il = groups.length; i < il; ++ i ) {

    const group = groups[ i ];

    const start = group.start;
    const count = group.count;

    for ( let j = start, jl = start + count; j < jl; j += 3 ) {

      handleTriangle(
        indices[ j + 0 ],
        indices[ j + 1 ],
        indices[ j + 2 ]
      );

    }

  }

  const tmp = new THREE.Vector3(), tmp2 = new THREE.Vector3();
  const n = new THREE.Vector3(), n2 = new THREE.Vector3();

  function handleVertex( v ) {

    n.fromArray( normals, v * 3 );
    n2.copy( n );

    const t = tan1[ v ];

    // Gram-Schmidt orthogonalize

    tmp.copy( t );
    tmp.sub( n.multiplyScalar( n.dot( t ) ) ).normalize();

    // Calculate handedness

    tmp2.crossVectors( n2, t );
    const test = tmp2.dot( tan2[ v ] );
    const w = ( test < 0.0 ) ? - 1.0 : 1.0;

    tangents[ v * 4 ] = tmp.x;
    tangents[ v * 4 + 1 ] = tmp.y;
    tangents[ v * 4 + 2 ] = tmp.z;
    tangents[ v * 4 + 3 ] = w;

  }

  for ( let i = 0, il = groups.length; i < il; ++ i ) {

    const group = groups[ i ];

    const start = group.start;
    const count = group.count;

    for ( let j = start, jl = start + count; j < jl; j += 3 ) {

      handleVertex( indices[ j + 0 ] );
      handleVertex( indices[ j + 1 ] );
      handleVertex( indices[ j + 2 ] );

    }

  }

  
  const anisoTangentArray = new THREE.BufferAttribute( tangents, 4 );
  // this is here simply so that I don't have to care about shader stripping conflicts with USE_TANGENT
  buffergeometry.setAttribute( 'anisotropicTangent', anisoTangentArray);
  //console.log(buffergeometry);
  node.geometry = buffergeometry;
}

// Author: Fyrestar https://mevedia.com (https://github.com/Fyrestar/THREE.BufferGeometry-toIndexed)
// some changes by Samuli
THREE.BufferGeometry.prototype.toIndexed = function () {
	let list = [], vertices = {};

	let _src, attributesKeys, morphKeys;

	let prec = 0, precHalf = 0, length = 0;


	function floor( array, offset ) {

		if ( array instanceof Float32Array ) {

			return Math.floor( array[ offset ] * prec );

		// removed by samuli, I don't want to include anything extra by adding some float16 to repo
		//} 
		//else if ( array instanceof Float16Array ) {
		//	return Math.floor( array[ offset ] * precHalf );
		} else {

			return array[ offset ];

		}

	}

	function createAttribute( src_attribute ) {

		const dst_attribute = new THREE.BufferAttribute( new src_attribute.array.constructor( length * src_attribute.itemSize ), src_attribute.itemSize );

		const dst_array = dst_attribute.array;
		const src_array = src_attribute.array;

		// eslint-disable-next-line default-case
		switch ( src_attribute.itemSize ) {
			case 1:

				for ( let i = 0, l = list.length; i < l; i++ ) {

					dst_array[ i ] = src_array[ list[ i ] ];

				}

				break;
			case 2:

				for ( let i = 0, l = list.length; i < l; i++ ) {

					const index = list[ i ] * 2;

					const offset = i * 2;

					dst_array[ offset ] = src_array[ index ];
					dst_array[ offset + 1 ] = src_array[ index + 1 ];

				}

				break;
			case 3:

				for ( let i = 0, l = list.length; i < l; i++ ) {

					const index = list[ i ] * 3;

					const offset = i * 3;

					dst_array[ offset ] = src_array[ index ];
					dst_array[ offset + 1 ] = src_array[ index + 1 ];
					dst_array[ offset + 2 ] = src_array[ index + 2 ];


				}

				break;
			case 4:

				for ( let i = 0, l = list.length; i < l; i++ ) {

					const index = list[ i ] * 4;

					const offset = i * 4;

					dst_array[ offset ] = src_array[ index ];
					dst_array[ offset + 1 ] = src_array[ index + 1 ];
					dst_array[ offset + 2 ] = src_array[ index + 2 ];
					dst_array[ offset + 3 ] = src_array[ index + 3 ];


				}

				break;
		}

		return dst_attribute;

	}

	function hashAttribute( attribute, offset ) {

		const array = attribute.array;

		// eslint-disable-next-line default-case
		switch ( attribute.itemSize ) {
			case 1:

				return floor( array, offset );

			case 2:

				return floor( array, offset ) + '_' + floor( array, offset + 1 );

			case 3:

				return floor( array, offset ) + '_' + floor( array, offset + 1 ) + '_' + floor( array, offset + 2 );

			case 4:

				return floor( array, offset ) + '_' + floor( array, offset + 1 ) + '_' + floor( array, offset + 2 ) + '_' + floor( array, offset + 3 );

		}


	}


	function store( index, n ) {

		let id = '';

		for ( let i = 0, l = attributesKeys.length; i < l; i++ ) {

			const key = attributesKeys[ i ];
			const attribute = _src.attributes[ key ];

			const offset = attribute.itemSize * index * 3 + n * attribute.itemSize;

			id += hashAttribute( attribute, offset ) + '_';

		}

		for ( let i = 0, l = morphKeys.length; i < l; i++ ) {

			const key = morphKeys[ i ];
			const attribute = _src.morphAttributes[ key ];

			const offset = attribute.itemSize * index * 3 + n * attribute.itemSize;

			id += hashAttribute( attribute, offset ) + '_';

		}


		if ( vertices[ id ] === undefined ) {

			vertices[ id ] = list.length;

			list.push( index * 3 + n );

		}

		return vertices[ id ];

	}

	function storeFast( x, y, z, v ) {


		const id = Math.floor( x * prec ) + '_' + Math.floor( y * prec ) + '_' + Math.floor( z * prec );

		if ( vertices[ id ] === undefined ) {

			vertices[ id ] = list.length;


			list.push( v );

		}

		return vertices[ id ];

	}


	function indexBufferGeometry( src, dst, fullIndex ) {

		_src = src;

		attributesKeys = Object.keys( src.attributes );
		morphKeys = Object.keys( src.morphAttributes );



		const position = src.attributes.position.array;
		const faceCount = position.length / 3 / 3;

		const typedArray = faceCount * 3 > 65536 ? Uint32Array : Uint16Array;
		const indexArray = new typedArray( faceCount * 3 );


		// Full index only connects vertices where all attributes are equal

		if ( fullIndex ) {

			for ( let i = 0, l = faceCount; i < l; i++ ) {

				indexArray[ i * 3 ] = store( i, 0 );
				indexArray[ i * 3 + 1 ] = store( i, 1 );
				indexArray[ i * 3 + 2 ] = store( i, 2, );

			}

		} else {

			for ( let i = 0, l = faceCount; i < l; i++ ) {

				const offset = i * 9;

				indexArray[ i * 3 ] = storeFast( position[ offset ], position[ offset + 1 ], position[ offset + 2 ], i * 3 );
				indexArray[ i * 3 + 1 ] = storeFast( position[ offset + 3 ], position[ offset + 4 ], position[ offset + 5 ], i * 3 + 1 );
				indexArray[ i * 3 + 2 ] = storeFast( position[ offset + 6 ], position[ offset + 7 ], position[ offset + 8 ], i * 3 + 2 );

			}

		}


		// Index

		dst.index = new THREE.BufferAttribute( indexArray, 1 );

		length = list.length;


		// Attributes

		for ( let i = 0, l = attributesKeys.length; i < l; i++ ) {

			const key = attributesKeys[ i ];

			dst.attributes[ key ] = createAttribute( src.attributes[ key ] );

		}

		// Morph Attributes

		for ( let i = 0, l = morphKeys.length; i < l; i++ ) {

			const key = morphKeys[ i ];

			dst.morphAttributes[ key ] = createAttribute( src.morphAttributes[ key ] );

		}


		if ( src.boundingSphere ) {

			dst.boundingSphere = src.boundingSphere.clone();

		} else {

			dst.boundingSphere = new THREE.Sphere();
			dst.computeBoundingSphere();

		}


		if ( src.boundingBox ) {

			dst.boundingBox = src.boundingBox.clone();

		} else {

			dst.boundingBox = new THREE.Box3();
			dst.computeBoundingBox();

		}

		
		// Groups

		const groups = src.groups;

		for ( let i = 0, l = groups.length; i < l; i ++ ) {

			const group = groups[ i ];

			dst.addGroup( group.start, group.count, group.materialIndex );

		}


		// Release data

		vertices = {};
		list = [];

		_src = null;
		attributesKeys = [];
		morphKeys = [];

	}


	return function ( fullIndex, precision ) {

    //console.log("Starting toindex for " + this.uuid) 
		precision = precision || 6;

		prec = Math.pow( 10, precision );

		const geometry = new THREE.BufferGeometry();

		indexBufferGeometry( this, geometry, fullIndex === undefined ? true : fullIndex );
    //console.log("Ended toindex for " + this.uuid) 
		return geometry;

	}
}();
