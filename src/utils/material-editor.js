
import * as THREE from "three";
import { ENV_LANDING, ENV_IMAGE_CAPTURE, ENV_CAR } from '../constants'

// tonemapping names
import { ACESFilmicToneMapping, CineonToneMapping, ReinhardToneMapping, 
  NoToneMapping, LinearToneMapping } from 'three/src/constants'


let mainFolder = null;

let currentFolders;

let updateCb;
let mapUpdateCb;
let gui;

let materialManager;

export function initializeMaterialEditor(parentGui, mm, cb, mapcb){
  updateCb = cb;
  mapUpdateCb = mapcb;
  gui = parentGui;
  materialManager = mm;
}

export function updateMaterialEditor(scene){
  if (!gui) return
  let wasClosed = true;
  if (mainFolder){
    wasClosed = mainFolder.closed;
    gui.removeFolder(mainFolder);
  }
  mainFolder = gui.addFolder("Materials");
  currentFolders = mainFolder.__folders;

  const targetMaterials = {}
  const specialMaterials = {}
  scene.traverse((node) => {
    if (node.material) {
      const materials = Array.isArray(node.material)
        ? node.material
        : [node.material];

      // this could stay over scene change
      for (const material of materials) {
        if (!targetMaterials[material.uuid] && material.type === "MeshPhysicalMaterial" && material.shader){
          // createMaterialFolder(material, cb);
          targetMaterials[material.uuid] = material;
        }
       
      }
    }
  });

  
  
  Object.entries(specialMaterials).forEach(entry => {
    //const newFolder = createSpecialFolder(entry[1]);
  })

  Object.entries(targetMaterials).forEach(entry => {
    const newFolder = createMaterialFolder(entry[1]);
    // console.log("Created folder", newFolder)
  })

  

  if (!wasClosed){
    mainFolder.open();
  }
  
  return mainFolder;
};



function handleColorChange( color, updateCb ) {
  return function ( value ) {

    if ( typeof value === 'string' ) {

      value = value.replace( '#', '0x' );

    }
    color.setHex( value );
    updateCb();

  };
}

function handleShaderRecompile(material, updateCb){
  return function(){
    // threejs stops updating stuff if similar has been done before, so this is a very naughty hack to keep it flipping stuff
    material.defines['updateFlipper'] = Date.now();
    // material.version += 1;
    material.needsUpdate = true;
    console.log("Set material for recompile", {material});
    updateCb();
  }
}



function getFolderName(material){

  let name;
  let namePrefix;
  let nameSuffix;
  
  if (material.userData.finish !== undefined){
    nameSuffix = `${material.userData.finish}`;
  }
  if (material.userData.mesh !== undefined){
    namePrefix = `${material.userData.mesh}`;
  } else if (material.userData.model !== undefined){
    namePrefix = `${material.userData.model}`;
  } else {
    nameSuffix += ` ${material.userData.materialId}`;
  }
  if (namePrefix !== undefined){
    name = `${namePrefix} - ${nameSuffix}`;
  } else {
    name = nameSuffix;
  }
  return name;
}



const createMaterialFolder = (material) => {
  const folder = mainFolder.addFolder(`${material.uuid}`);
  folder.name = getFolderName(material);
  
  const data = {
    color: material.color.getHex(),
    emissive: material.emissive.getHex(),
    bloomIntensity: material.shader.uniforms.bloomIntensity.value,
    // toneMappingExposure: material.shader.uniforms.tonemappingData.value.exposure,
    anisotropyStrength: material.shader.uniforms.anisotropyStrength.value,
    printInfo: function(){
      console.log(material);
    }
  };


  folder.add(data, 'printInfo')

  folder.add(data, "bloomIntensity", 0, 1, 0.01).onChange(function(value){
    material.shader.uniforms.bloomIntensity.value = value;
    material.userData = {...material.userData, bloomIntensity: value }
    updateCb();
  });

  // add editable material properties
  folder.addColor( data, 'color' ).onChange( handleColorChange(material.color, updateCb) ).onFinishChange(mapUpdateCb);
  folder.addColor( data, "emissive").onChange(handleColorChange(material.emissive, updateCb)).onFinishChange(mapUpdateCb);
  //console.log(material);
  folder.add(material, "metalness", 0, 1).onChange(updateCb).onFinishChange(mapUpdateCb);
  folder.add(material, "roughness", 0, 1).onChange(function(value){
    handleRoughnessChange(material, materialManager);
    updateCb();
  } 
  ).onFinishChange(mapUpdateCb);
  folder.add(material, "opacity", 0, 1).onChange(updateCb).onFinishChange(mapUpdateCb);
  folder.add(material, "transmission", 0, 1).onChange(updateCb).onFinishChange(mapUpdateCb);
  folder.add(material, "envMapIntensity", 0, 10).onChange(updateCb).onFinishChange(mapUpdateCb);
  folder.add(material, "lightMapIntensity", 0, 5).onChange(updateCb).onFinishChange(mapUpdateCb);
  folder.add(material, "emissiveIntensity", 0, 10).onChange(updateCb).onFinishChange(mapUpdateCb);
  folder.add(material, "reflectivity", 0, 1).onChange(updateCb).onFinishChange(mapUpdateCb);
  folder.add(material, "bumpScale", 0, 2).onChange(updateCb).onFinishChange(mapUpdateCb);
  folder.add(material, "clearcoat", 0, 1).onChange(updateCb).onFinishChange(mapUpdateCb);
  folder.add(material, "clearcoatRoughness", 0, 1).onChange(updateCb).onFinishChange(mapUpdateCb);

  folder.add(data, "anisotropyStrength", 0, 2, 0.01).onChange(function(value){
    material.shader.uniforms.anisotropyStrength.value = value;
    material.userData = {...material.userData, anisotropyStrength: value }
    if (!material.defines.USE_ANISOTROPIC_REFLECTIONS && value > 0){
      handleShaderRecompile(material, updateCb);
    } else {
      updateCb();
    }
  }).onFinishChange(mapUpdateCb);

  
  return folder;
};

function handleRoughnessChange(material, materialManager){
  const shader = material.shader;
  const envMap = material.userData.envMap;
  switch (envMap) {
    case ENV_CAR:
      shader.uniforms.useBoxProjection = { value: true };
      shader.uniforms.boxProjectionSize = materialManager.boxProjectionData.carSize;
      shader.uniforms.boxProjectionPosition = materialManager.boxProjectionData.carPosition;
      shader.uniforms.ormCubemap = materialManager.orthoEnvTextures[envMap].orm;
      shader.uniforms.normalCubemap = materialManager.orthoEnvTextures[envMap].normal;
      break;
    case ENV_LANDING:
      shader.uniforms.useBoxProjection = { value: true };
      shader.uniforms.boxProjectionSize = materialManager.boxProjectionData.landingSize;
      shader.uniforms.boxProjectionPosition = materialManager.boxProjectionData.landingPosition;
      shader.uniforms.ormCubemap = materialManager.orthoEnvTextures[envMap].orm;         
      shader.uniforms.normalCubemap = materialManager.orthoEnvTextures[envMap].normal;
      break;
    case ENV_IMAGE_CAPTURE:
      shader.uniforms.boxProjectionSize = materialManager.boxProjectionData.carSize;
      shader.uniforms.boxProjectionPosition = materialManager.boxProjectionData.carPosition;            
      break;
    case undefined:
      shader.uniforms.useBoxProjection = { value: false };
      break;
    default:
      console.error('Unknown environment mapping setup for', material.name, 'value:', envMap)
      break;
  }
}

export default updateMaterialEditor;
