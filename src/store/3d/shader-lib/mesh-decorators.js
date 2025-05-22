import * as THREE from 'three';
import { CAR_SHAPES } from '../../../constants';

export const pasteHideGroup = (hideGroup, mesh) => {
  if (!hideGroup || typeof hideGroup !== 'string' || !mesh) {
    return
  }
  hideGroup = hideGroup.toLowerCase()

  if (
    hideGroup === "a" || 
    hideGroup === "b" || 
    hideGroup === "c" || 
    hideGroup === "d" ||
    hideGroup === 'hidden'
  ) {

    const { carShape:shape } = mesh.userData

    const shapeData = CAR_SHAPES.find(item => item.id === shape)
    let p, n, isHidden = false;
    
    // TODO: Some adjustment (position (p) vector) is needed for different car shapes
    switch (hideGroup) {
      case 'a':
        p = new THREE.Vector3(0, 0, 0);
        n = new THREE.Vector3(0, 0, 1);
        break;

      case 'b':
        p = new THREE.Vector3(shapeData.width/2, 0, -shapeData.depth/2);
/*         if(shape === CAR_SHAPE_DEEP) {
          p = new THREE.Vector3(55, 0, -105);
        } else if(shape === CAR_SHAPE_SQUARE) {
          p = new THREE.Vector3(55, 0, -70);
        } else {
          p = new THREE.Vector3(79.75, 0, -70);
        } */
        n = new THREE.Vector3(1, 0, 0);
        break;

      case 'c':
        p = new THREE.Vector3(0, 0, -shapeData.depth);
/*         if(shape === CAR_SHAPE_DEEP) {
          p = new THREE.Vector3(0, 0, -210);
        } else if(shape === CAR_SHAPE_SQUARE) {
          p = new THREE.Vector3(0, 0, -140);          
        } else {
          p = new THREE.Vector3(0, 0, -140);
        } */
        n = new THREE.Vector3(0, 0, -1);
        break;

      case 'd':
        p = new THREE.Vector3(-shapeData.width/2, 0, -shapeData.depth/2);
/*         if(shape === CAR_SHAPE_DEEP) {
          p = new THREE.Vector3(-55, 0, -105);
        } else if(shape === CAR_SHAPE_SQUARE) {
          p = new THREE.Vector3(-55, 0, -70);            
        } else {
          p = new THREE.Vector3(-79.75, 0, -70);
        } */
        n = new THREE.Vector3(-1, 0, 0);
        break;
    
      case 'hidden':
        isHidden = true;
        break;

      default:
        break;
    }
    
    const onBeforeRender = function() {
      const v = new THREE.Vector3();
      return function onBeforeRender( renderer, scene, camera, geometry, material, group ) {

        const isCubeCamera = (camera.parent instanceof THREE.CubeCamera);
        // abit hacky way to detect is camera
        const isReflector = (camera.userData.recursion !== undefined);

        if ( !isReflector && !isCubeCamera && (isHidden || v.subVectors( camera.position, p ).dot( n ) > 0) ) {
          // Determines the part of the geometry to render.
          // So geometry.setDrawRange( 0, 0 ) means that nothing is rendered
          geometry.setDrawRange( 0, 0 );
        }
      };
    }();

    const onAfterRender = function( renderer, scene, camera, geometry, material, group ) {
      // Reset to default value after render
      geometry.setDrawRange( 0, Infinity );
    };
    
    mesh.onBeforeRender = onBeforeRender;
    mesh.onAfterRender = onAfterRender;
  }
}
