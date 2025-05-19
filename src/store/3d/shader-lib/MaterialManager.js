import * as THREE from 'three';
import { DEFAULT_LIGHT_MAP_INTENSITY, DEFAULT_ENV_MAP_INTENSITY, CUSTOM_ENV_MAP_BLUR_STEPS, QUALITY_3D_HIGH, QUALITY_3D_MEDIUM, QUALITY_3D_LOW,
REFLECTION_BOUNCES_HIGH, REFLECTION_BOUNCES_MEDIUM, REFLECTION_BOUNCES_LOW } from './3d-constants';
import { DEFAULT_WHITE_TEXTURE_ID, ENV_CAR, ENV_LANDING, LANDING_CUBE_MAP_POSITION, LANDING_CUBE_MAP_SIZE } from '../../constants';
import { mapTypes, defaultMaps } from './material-property-types';

import CustomFragShader from './shader-lib/custom-other/custom_other_frag.glsl'
import CustomVertShader from './shader-lib/custom-other/custom_other_vert.glsl'
import { CarDesignerMaterial } from './legacy-interfaces/CarDesignerMaterial';

const mirrorParams = {
  "id": "generic-mirror",
  "category": "mesh",
  "finish": "generic-mirror",
  "type": "standard",
  //"map": "T_Metal_B",
  // "color": "0xC4C4C5",
  "color": "0xFFFFFF", // test
  // "color": "0xFF0000", // test
  //"roughnessMap": "T_Grime_2",
  "envMap": "ENV_CAR",
  "envMapIntensity": 1.0,
  "metalness": 1,
  "roughness": 0.03,
  "materialId": 1,
  // "model": "Car_Deep_11_21_24",
  // "mesh": "Wall_B_Deep",
  // "join": [
  //   "CL96FFL"
  // ],
  // "lightMap": "Wall_CL96_FFL_Deep_LM",
  // "aoMap": "Wall_Deep_AO"
}

const genericParams = {
  "id": "generic-dummy",
  "category": "mesh",
  "type": "standard",
  "envMap": "ENV_CAR",
  "materialId": 1,
}

class MaterialManager {
  constructor(assetManager) {
    this.assetManager = assetManager
    this.materials = []
    this.useLegacyEnvmaps = false;

    // deprecated
    this.envTextures = {
      [ENV_CAR]: null,
      [ENV_LANDING]: null,
    }


    this.orthoEnvTextures = {
      [ENV_CAR]: {
        mainCache: [],
        mainArray: { value: [] },
        orm: { value: null },
        normal: { value: null }
      },
      [ENV_LANDING]: {
        mainCache: [],
        mainArray: { value: [] },
        orm: { value: null },
        normal: { value: null }
      },
    }

    this.standardCarEnvTexture = { value: null };
    this.standardLandingEnvTexture = { value: null };
    // this nifty little thing is actually an object that all shaders listen to, neat
    this.emissionOnly = { value: false };
    // another nifty one, we can capture the car without reflections as a base for reflection mapping
    this.noEnvironmentMapping = { value: false };
    // in order to calculate interreflection mips we need to capture the roughness
    this.ormOnly = { value: false };
    // when bouncing around, we kind of need to know what is the normal vector so we can use reflect
    this.normalOnly = { value: false };
    // taking the diffuse itself allows us to bypass any specular reflections and stuff
    this.diffuseOnly = { value: false };
    // with the boxy reflection thing, anisotropy looked shiiit
    this.anisotropyEnabled = { value: false };

    // a stupid workaround to render opacity separately, the halfFloat format breaks it so we'll just shift it to R for png gen
    this.opacityToR = { value: false };

    // this is for development purposes ;)
    this.reflectionDebug = { value: false };
    this.overblowDebug = { value: false };
    this.anisotropyDebug = { value: false };
    this.magic1 = { value: 1 };
    this.magic2 = { value: 1 };
    this.magic3 = { value: 1 };
    
    
    this.boxProjectionData = {
      carSize: { value: new THREE.Vector3( 159.9, 240, 140 ) },
      carPosition: { value: new THREE.Vector3( 0, 120, -70 ) },

      landingSize:  { value: new THREE.Vector3(
        LANDING_CUBE_MAP_SIZE[0],
        LANDING_CUBE_MAP_SIZE[1],
        LANDING_CUBE_MAP_SIZE[2]
      )},

      landingPosition:  { value: new THREE.Vector3(
        LANDING_CUBE_MAP_POSITION[0],
        LANDING_CUBE_MAP_POSITION[1],
        LANDING_CUBE_MAP_POSITION[2]
      )},
      orthographic: { value: true },
      bounces: { value: 6 } // set this to 1 for debugging reasons
    }
    this.defaultNormalCubemap = { value: null }

    for (let index = 0; index < CUSTOM_ENV_MAP_BLUR_STEPS; index++) {
      this.orthoEnvTextures.ENV_CAR.mainCache.push({value: null})
      this.orthoEnvTextures.ENV_LANDING.mainCache.push({value: null})
    }

    // we will have to track the dynamics manually, onbeforecompile won't fire afterwards
    this.numberOfSpotLights = { value: 0 };
    this.numberOfRectLights = { value: 0 };
    
    //console.log(this)
  }

  updateLights(scene){
    const spotLights = scene.getObjectsByProperty("type", "SpotLight");
    const rectLights = scene.getObjectsByProperty("type", "RectAreaLight");

    this.numberOfSpotLights.value = spotLights.length;
    this.numberOfRectLights.value = rectLights.length;
    // traverse the scene and find correct lights

  }

  clearMaterials() {
    while (this.materials.length) {
      const material = this.materials.pop()
      material.data.dispose()
      delete material.data
    }
  }

  getMaterial(id) {
    const { data } = this.materials.find(item => item.id === id) || {};
    if (data) {
      return data
    }
    return undefined
  }
  
  hasMaterial(id) {
    return id && this.materials && this.materials.length && this.materials.find(item => item.id === id) !== undefined
  }

  createMaterials(materialDefinitions) {
    //console.log('creating mats', materialDefinitions)
    if (!materialDefinitions) {
      return
    }
    // TODO: this the default, could be considered obsolete
    if (this.mirrorMat === undefined){
      this.mirrorMat = this.addMirrorMaterial().data;
    }
    for (const materialDefinition of materialDefinitions) {
      if (!materialDefinition || !materialDefinition.id) {
        continue
      }
      const { id } = materialDefinition
      if (this.hasMaterial(id)) {
        this.updateMaterial(materialDefinition)
      } else {        
        const newMaterial = this.createMaterial(materialDefinition)
        this.materials.push({ ...materialDefinition, data: newMaterial })
      }
    }
  }

  setMaterialEncodings(material){
    mapTypes.forEach(element => {
      if (material[element] !== null && material[element] !== undefined){
        switch (element) {
          case 'map':
          case 'emissiveMap':
          //case 'envMap': // generated env maps are in linear color space
            material[element].encoding = THREE.sRGBEncoding;
            break;
          default:
            material[element].encoding = THREE.LinearEncoding;
            break;
        }        
      }
    });
    //console.log(material);
  }

  hasEmissive(materialDefinition){
    if (materialDefinition.emissive === undefined) return false;
    const emissionColor = new THREE.Color(Number(materialDefinition.emissive));
    return emissionColor.r + emissionColor.g + emissionColor.b > 0.0;
  }

  createDefaultMaterial(){
    return this.createMaterial(genericParams);
  }

  // I'm not sure if this makes a lot of sense, preferably the mirrors would use common materials
  createMirrorMaterial(id = undefined, tint = undefined){
    const params = {
        ...mirrorParams,
      };
    // const newMirror = this.createMaterial(mirrorParams);
    params.color = tint ? tint : params.color;
    params.id = id ? id : params.id;
    let mirrorMaterial = this.getMaterial(params.id);
    if (mirrorMaterial === undefined){
      mirrorMaterial = this.createMaterial(params);
    } else {
      console.log("already had mirror material", params);
    }
    return { params: params, data: mirrorMaterial};
  }

  addMirrorMaterial(id, tint){
     const materialData = this.createMirrorMaterial(id, tint);
     this.materials.push({ ...materialData.params, data: materialData.data })
     return materialData;
  }

  createMaterial(materialDefinition) {
    const { id, finish } = materialDefinition

    if (!id || this.hasMaterial(id)) {
      return
    }

    let specialOverride = materialDefinition.shaderOverride;
    if (this.hasEmissive(materialDefinition)){
      specialOverride = 'emissive';
    }

    if (materialDefinition.colorWrite === false){
      specialOverride = 'occlusion';
    }

    if (specialOverride !== undefined){
      
      const specialMaterial = new THREE.ShaderMaterial();
      specialMaterial.carDesignerSpecial = true;
      specialMaterial.vertexShader = CustomVertShader;
      specialMaterial.fragmentShader = CustomFragShader;
      //specialMaterial.colorWrite = materialDefinition.colorWrite ? materialDefinition.colorWrite : true;
      //specialMaterial.alphaMap = materialDefinition.alphaMap;
      if (materialDefinition.alphaMap){
        specialMaterial.uniforms.alphaMap = { value: this.assetManager.getTexture(materialDefinition.alphaMap) };
      } else {
        specialMaterial.uniforms.alphaMap = { value: this.assetManager.getTexture(DEFAULT_WHITE_TEXTURE_ID) };
      }
      specialMaterial.uniforms.opacity = { value: materialDefinition.opacity !== undefined ? materialDefinition.opacity : 1};
      specialMaterial.uniforms.uv2AlphaMap = { value: materialDefinition.useUv2WithAlphaMap ? materialDefinition.useUv2WithAlphaMap : true };
      if (materialDefinition.emissiveMap){
        specialMaterial.uniforms.emissiveMap = { value: this.assetManager.getTexture(materialDefinition.emissiveMap) };
      } else {
        specialMaterial.uniforms.emissiveMap = { value: this.assetManager.getTexture(DEFAULT_WHITE_TEXTURE_ID) };
      }
      if (materialDefinition.map){
        specialMaterial.uniforms.colorMap = { value: this.assetManager.getTexture(materialDefinition.map) };
      } else {
        specialMaterial.uniforms.colorMap = { value: this.assetManager.getTexture(DEFAULT_WHITE_TEXTURE_ID) };
      }
      specialMaterial.uniforms.emissive = { value: materialDefinition.emissive !== undefined ? new THREE.Color(Number(materialDefinition.emissive)).convertSRGBToLinear() : new THREE.Color(0,0,0) };
      specialMaterial.uniforms.emissiveIntensity = { value: materialDefinition.emissiveIntensity !== undefined ? materialDefinition.emissiveIntensity : 1 };
      specialMaterial.uniforms.bloomIntensity = { value: materialDefinition.bloomIntensity !== undefined ? materialDefinition.bloomIntensity : 0 };
      specialMaterial.uniforms.emissionOnly = this.emissionOnly;
      specialMaterial.uniforms.normalOnly = this.normalOnly;
      specialMaterial.uniforms.opacityToR = this.opacityToR;
      specialMaterial.uniforms.color = { value: materialDefinition.color !== undefined ? new THREE.Color(Number(materialDefinition.color)).convertSRGBToLinear() : new THREE.Color(1,1,1) };
      specialMaterial.transparent = true; // not always the case, but shouldn't hurt
      if (materialDefinition.useTriplanarMapping){
        specialMaterial.uniforms.useTriplanarMapping = { value: materialDefinition.useTriplanarMapping };
        specialMaterial.uniforms.triplanarMappingScale = { value: materialDefinition.triplanarMappingScale };
      }
      
      
      if (specialOverride === 'occlusion'){
        specialMaterial.colorWrite = false;
        specialMaterial.transparent = false;
      }
      if (specialOverride === 'shadow'){
        specialMaterial.uniforms.hide = this.ormOnly;
        specialMaterial.uniforms.color = { value: new THREE.Color(0,0,0) };
      }
      
      specialMaterial.userData = { ...materialDefinition }
      if (!specialMaterial.userData.finish){
        specialMaterial.name = specialMaterial.userData.mesh;
      } else {
        specialMaterial.name = finish;
      }
      // console.log('Shader override', specialOverride, materialDefinition, '->', specialMaterial);
      return specialMaterial;
    }
    const materialParameters = this.createMaterialParameters(materialDefinition);
    this.populateUndefinedParameters(materialParameters, id + " - " + finish);
    // console.log('material pars:', finish, materialParameters)
    this.setMaterialEncodings(materialParameters);
    
    let material;
    const useOldMat = false;
    if (useOldMat){
      material = new THREE.MeshPhysicalMaterial(materialParameters);
    } else {
      material = new CarDesignerMaterial(materialParameters, this, materialDefinition);
    }
    material.color && material.color.convertSRGBToLinear();
    material.emissive && material.emissive.convertSRGBToLinear();
    material.userData = { ...materialDefinition }
    if (!material.userData.finish){
      material.name = material.userData.mesh;
    } else {
      material.name = finish;
    }

    // material.needsUpdate = true

    //console.log("Creating new material ", material);
    // this.shaderBuilder.build(material, this);
    // moved this out of here for reusability (mirrors etc)
    // this.materials.push({ ...materialDefinition, data: material })
    // const rand = Math.random();
    return material;
  }

  populateUndefinedParameters(params, name){
    // console.log('populating undefined params:', params);

    const hasBumpMap = params['bumpMap']
    const hasNormalMap = params['normalMap']

    for (const defaultPair of defaultMaps) {
      // stupid checks to add either one of the default surface distortions, not both
      if (defaultPair.type === 'normalMap' && hasBumpMap){
        // console.log('ignoring default normalmap because there is bumpmap', params)
        continue;
      }
      else if (defaultPair.type === 'bumpMap' && hasNormalMap){
        // console.log('ignoring default bumpmap because there is normalmap', params)
        continue;
      } else if (!params.hasOwnProperty(defaultPair.type) || params[defaultPair.type] === undefined){

        let defaultOptions = {};

        switch (defaultPair.type) {
          case 'map':
          case 'emissiveMap':
          //case 'envMap': // the captured one is in linear color space
            defaultOptions.encoding = THREE.sRGBEncoding            
            break;
          default:
            defaultOptions.encoding = THREE.LinearEncoding
            break;
        }

        const replacement = this.assetManager.getTexture(defaultPair.id, defaultOptions);
        params[defaultPair.type] = replacement;
        //console.log('placed', replacement.name, 'to', defaultPair.type, 'for', name)
      } 
    }
    // see if there are other params than maps that could cause concern
  }

  createMaterialParameters(data) {
    
    let textureOptions
    
    if (data.textureRotation) {
      textureOptions = { ...textureOptions, rotation: data.textureRotation }
    }

    const params = {
      reflectivity: 0.5
    }

    for (const mapType of mapTypes) {
      if (data.hasOwnProperty(mapType)) {   
        let texture
        // use "dynamic" env map if map is defined in envTextures
        if ( mapType === 'envMap' && [ENV_CAR, ENV_LANDING].indexOf(data[mapType]) !== -1) {
          //... set env later texture = this.getEnvTexture(data.envMap)
        } else if (data[mapType]) {
          texture = this.assetManager.getTexture(data[mapType], textureOptions);
        }

        if (texture) {
          if (['map', 'emissiveMap', /* 'envMap' */].indexOf(mapType) !== -1) {
            texture.encoding = THREE.sRGBEncoding
          } else {
            texture.encoding = THREE.LinearEncoding
          }
        }
        // placing null doesn't accomplish anything
        params[mapType] = texture || undefined
      }
    }
    //params.color = new THREE.Color(1, 0, 0)
    !isNaN(data.color) && (params.color = Number(data.color));
    !isNaN(data.emissive) && (params.emissive = Number(data.emissive));
    data.colorWrite !== undefined && (params.colorWrite = data.colorWrite);
    data.clippingPlanes !== undefined && (params.clippingPlanes = data.clippingPlanes);
    data.stencilWrite !== undefined && (params.stencilWrite = data.stencilWrite);
    data.visible !== undefined && (params.visible = data.visible);
    data.transparent !== undefined && (params.transparent = data.transparent);
    data.depthWrite !== undefined && (params.depthWrite = data.depthWrite);    
    !isNaN(data.alphaTest) && (params.alphaTest = data.alphaTest);
    !isNaN(data.refractionRatio) && (params.refractionRatio = data.refractionRatio);
    !isNaN(data.bumpScale) && (params.bumpScale = data.bumpScale);

    !isNaN(data.metalness) && (params.metalness = data.metalness);    
    // Note that in order for the material roughness property to correctly blur out 
    // the environment map, the shader must have access to mipmaps of the env texture. 
    !isNaN(data.roughness) && (params.roughness = data.roughness);
    !isNaN(data.opacity) && (params.opacity = data.opacity);
    !isNaN(data.reflectivity) && (params.reflectivity = data.reflectivity);
    !isNaN((data.envMapIntensity || DEFAULT_ENV_MAP_INTENSITY)) && (params.envMapIntensity = data.envMapIntensity || DEFAULT_ENV_MAP_INTENSITY);
    !isNaN(data.emissiveIntensity) && (params.emissiveIntensity = data.emissiveIntensity);    
    !isNaN((data.lightMapIntensity || DEFAULT_LIGHT_MAP_INTENSITY)) && (params.lightMapIntensity = data.lightMapIntensity || DEFAULT_LIGHT_MAP_INTENSITY);
    !isNaN(data.reflectivity) && (params.reflectivity = data.reflectivity);
    !isNaN(data.transmission) && (params.transmission = data.transmission);
    !isNaN(data.clearcoat) && (params.clearcoat = data.clearcoat);
    !isNaN(data.clearcoatRoughness) && (params.clearcoatRoughness = data.clearcoatRoughness);
    
    !isNaN(data.blending) && (params.blending = data.blending);
    !isNaN(data.blendEquation) && (params.blendEquation = data.blendEquation);
    !isNaN(data.blendSrc) && (params.blendSrc = data.blendSrc);
    !isNaN(data.blendDst) && (params.blendDst = data.blendDst);

    // Normal map y-direction conversion from DirectX to OpenGL
    if (data.normalScale && data.normalScale.length === 2) {
      params.normalScale = new THREE.Vector2(data.normalScale[0], -data.normalScale[1])
    } else {
      params.normalScale = new THREE.Vector2(1,-1)
    }

    params.dithering = true;
  
    return params;
  }

  updateMaterial(materialDefinition) {
    const { id, color, emissive, textureRotation } = materialDefinition
    const material = this.getMaterial(id)
    if (!material) {
      return
    }

    for (const mapType of mapTypes) {
      if (materialDefinition[mapType] !== material.userData[mapType]) {
        if (materialDefinition[mapType]) {
          if ( mapType === 'envMap' && [ENV_CAR, ENV_LANDING].indexOf(materialDefinition[mapType]) !== -1 ) {
            //... set env later material[mapType] = this.getEnvTexture(materialDefinition.envMap)
          } else {
            material[mapType] = this.assetManager.getTexture(materialDefinition[mapType])
          }
        } else {
          material[mapType] = null
        }
      }
    }

    // color change
    if ( color !== material.userData.color ) {
      if (isNaN(color)) {
        material.color = null
      } else {
        material.color = new THREE.Color(Number(color)).convertSRGBToLinear()
      }
    }

    // emissive (color) change
    if ( emissive !== material.userData.emissive ) {
      if (isNaN(emissive)) {
        material.emissive = null
      } else {
        material.emissive = new THREE.Color(Number(emissive)).convertSRGBToLinear()
      }
    }

    material.userData = { ...materialDefinition }
  }

  /**
   * Return env texture by id
   * @param {*} id 
   */
  getEnvTexture(id) {
    if ( !this.envTextures[id] && this.assetManager.getTexture(id) ) {
      // if dynamic
      this.envTextures[id] = this.assetManager.getTexture(id);
    }
    return this.envTextures[id] 
  }


  /**
   * Sets env texture and updates related materials 
   * @param {*} id envMap id
   * @param {*} texture texture data
   */
  setEnvTexture(id, texture) {
    this.envTextures[id] = texture
    if (this.boxProjectionData.orthographic) return;
    for (const material of this.materials) {
      const { envMap, data } = material
      if (envMap === id && data) {
        data.envMap = texture
      }
    }
  }

  setCustomBlurOrthoEnvTextures(id, diffuseArray, ormTexture, normalTexture) {
    if (!this.boxProjectionData.orthographic) return;
    //console.log("Setting ortho env textures:", diffuseArray, this.orthoEnvTextures[id].mainCache);
    this.orthoEnvTextures[id].mainArray.length = 0;
      for (let index = 0; index < diffuseArray.renderTargets.length; index++) {
        const texture = diffuseArray.renderTargets[index].texture;
        this.orthoEnvTextures[id].mainCache[index].value = texture;
        this.orthoEnvTextures[id].mainArray.value.push(texture);
      }
    this.orthoEnvTextures[id].orm.value = ormTexture
    this.orthoEnvTextures[id].normal.value = normalTexture
    for (const material of this.materials) {
      const { envMap, data} = material
      if (envMap === id && data) {
        // unfortunately updating by reference was not possible for an array, shame
        //console.log('wat', data)
        //data.shader.uniforms.diffuseCubemapArray = this.orthoEnvTextures[id].mainArray;
        data.envMap = diffuseArray.renderTargets[0].texture
      }
    }
  }


  setOrthoEnvTextures(id, diffuseTexture, ormTexture, normalTexture) {
    if (!this.boxProjectionData.orthographic) return;
    //console.log("Setting ortho env textures:", diffuseArray, this.orthoEnvTextures[id].mainCache);
    this.orthoEnvTextures[id].orm.value = ormTexture
    this.orthoEnvTextures[id].normal.value = normalTexture
    for (const material of this.materials) {
      const { envMap, data} = material
      if (envMap === id && data) {
        // unfortunately updating by reference was not possible for an array, shame
        //console.log('wat', data)
        //data.shader.uniforms.diffuseCubemapArray = this.orthoEnvTextures[id].mainArray;
        //diffuseTexture.encoding = sRGBEncoding;
        data.envMap = diffuseTexture
        // console.log('set envmap', material, data.envMap);
      }
    }
  }

  setReflectionQuality(quality){
    switch (quality) {
      case QUALITY_3D_HIGH:
        this.boxProjectionData.bounces.value = REFLECTION_BOUNCES_HIGH;
        break;
      case QUALITY_3D_MEDIUM:
        this.boxProjectionData.bounces.value = REFLECTION_BOUNCES_MEDIUM;
        break;
      case QUALITY_3D_LOW:
        this.boxProjectionData.bounces.value = REFLECTION_BOUNCES_LOW;
        break;    
      default:
        console.error("Unknown quality for reflections:", quality);
        break;
    }
    console.log("Set reflection bounces to", this.boxProjectionData.bounces)
  }

}

export default MaterialManager