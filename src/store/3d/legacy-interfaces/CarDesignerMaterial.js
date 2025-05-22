import { RawShaderMaterial, Color, GLSL3, DoubleSide, Vector2, MeshPhysicalMaterial, Matrix3 } from 'three';
// import { ShaderMaterial } from 'three/build/three.module';
// import simple_fragmentGlsl from '../shader-lib/custom-other/simple_fragment.glsl';
// import simple_vertexGlsl from '../shader-lib/custom-other/simple_vertex.glsl';
import custom_physical_fragmentGlsl from '../shader-lib/custom-physical/custom_physical_fragment.glsl';
import custom_physical_vertexGlsl from '../shader-lib/custom-physical/custom_physical_vertex.glsl';
import { ENV_CAR, ENV_LANDING, ENV_IMAGE_CAPTURE } from '../../../constants';
import { toVec2 } from '../shader-lib/3d-utils';

// patching notes:
// add this to three before final GLSL declaration in WebglProgram, this skips the prefix declarations
/*
  if (defines !== undefined && defines["CAR_DESIGNER_MATERIAL"] === true){
    // console.log("**********CAR DESIGNER MATERIAL")
    prefixVertex = "";
    prefixFragment = "";
  }
*/
// replace this in WebGLCubeUVMaps, impact is a bit unknown
/*
  if ( texture && texture.isTexture) {
    --->
  if ( texture && texture.isTexture && texture.isRenderTargetTexture === false ) {
*/

// raw or not?
// requires modified threejs, using shadermaterial things but stepping through the raw shader compilation
// can we get the regular meshphysical assignments via inheritance?
// class CarDesignerMaterial extends ShaderMaterial {

//TODO: just use single parameter set for this
class CarDesignerMaterial extends MeshPhysicalMaterial {

  constructor(parameters, materialManager, materialDefinition) {

    super(parameters);
    // for analysis
    this.paramData = parameters;
    this.isCarDesignerMaterial = true; // just a threejs convention
    this.defines["CAR_DESIGNER_MATERIAL"] = true; // get this to shader compilation
    this.glslVersion = GLSL3;
    this.needsUpdate = true;
    this.userData = { ...materialDefinition }
    const {
      useUv2WithAlphaMap = true,
      useUv1WithAoMap = false,

      useTriplanarMapping = false,
      triplanarMappingScale = new Vector2(0.03, 0.03),

      useTpmForMap = false,
      tpmScaleForMap,

      useTpmForNormalMap = false,
      tpmScaleForNormalMap,

      useTpmForRoughnessMap = false,
      tpmScaleForRoughnessMap,

      useTpmForMetalnessMap = false,
      tpmScaleForMetalnessMap,

      useTpmForBumpMap = false,
      tpmScaleForBumpMap,

      useTpmForEmissiveMap = false,
      tpmScaleForEmissiveMap,

      envMap,
      textureRotation,

      anisotropy = 0,

      iridescent = false,
      // went the lazy way and reused map for iridescent
      //iridescenceMap

      // tonemapping uses internal three enum
      // use "tonemappingExposure: " if you want something else than 1.0
      toneMapping = -1,
      toneMappingExposure = 1.0,

      bloomIntensity = 0.0,
      emissive2
    } = this.userData

    this.onBeforeCompile = shader => {
      // we don't need to bother with materials that don't write anything to the color buffer
      //if (!material.colorWrite) return;

      shader.uniforms.uv2AlphaMap = { value: useUv2WithAlphaMap }
      shader.uniforms.uv1AOMap = { value: useUv1WithAoMap }

      shader.uniforms.iridescent = { value: iridescent };

      shader.uniforms.orthographicCubemapping = materialManager.boxProjectionData.orthographic;
      shader.uniforms.reflectionBounces = materialManager.boxProjectionData.bounces;

      shader.uniforms.anisotropicReflections = { value: anisotropy > 0 }
      shader.uniforms.anisotropyStrength = { value: anisotropy }

      // if (
      // ) {
      //   material.defines.TILT_TRIPLANAR_MAPS = '';
      // }

      shader.uniforms.tpmData = {
        value: {
          useTpmMap: useTpmForMap || useTriplanarMapping,
          useTpmMetalnessMap: useTpmForMetalnessMap || useTriplanarMapping,
          useTpmRoughnessMap: useTpmForRoughnessMap || useTriplanarMapping,
          useTpmEmissiveMap: useTpmForEmissiveMap || useTriplanarMapping,
          useTpmNormalMap: useTpmForNormalMap || useTriplanarMapping,
          tilt: (useTriplanarMapping || useTpmForMap || useTpmForNormalMap || useTpmForRoughnessMap || useTpmForMetalnessMap || useTpmForBumpMap || useTpmForEmissiveMap) &&
            !isNaN(textureRotation) && textureRotation > 0
        }
      }

      shader.uniforms.mapTpmScale = { value: tpmScaleForMap ? toVec2(tpmScaleForMap, 'map tpm') : triplanarMappingScale };
      shader.uniforms.metalnessTpmScale = { value: tpmScaleForMetalnessMap ? toVec2(tpmScaleForMetalnessMap, 'metalness tpm') : triplanarMappingScale };
      shader.uniforms.roughnessTpmScale = { value: tpmScaleForRoughnessMap ? toVec2(tpmScaleForRoughnessMap, 'roughness tpm') : triplanarMappingScale };
      shader.uniforms.emissiveTpmScale = { value: tpmScaleForEmissiveMap ? toVec2(tpmScaleForEmissiveMap, 'emissive tpm') : triplanarMappingScale };
      shader.uniforms.normalTpmScale = { value: tpmScaleForNormalMap ? toVec2(tpmScaleForNormalMap, 'normal tpm') : triplanarMappingScale };

      // TODO: figure out this one better, check the resolution perhaps?
      // found something like this, how does it work?
      // const mip = Math.log2( Math.max( image.width, image.height ) ) + 1;
      shader.uniforms.maxMipLevel = { value: 12 };

      let envTarget = envMap;
      switch (envTarget) {
        case ENV_IMAGE_CAPTURE:
          envTarget = ENV_CAR;
        // eslint-disable-next-line no-fallthrough
        case ENV_CAR:
          shader.uniforms.useBoxProjection = { value: true };
          shader.uniforms.boxProjectionSize = materialManager.boxProjectionData.carSize;
          shader.uniforms.boxProjectionPosition = materialManager.boxProjectionData.carPosition;

          shader.uniforms.diffuseCubemapArray = materialManager.orthoEnvTextures[envTarget].mainArray;
          shader.uniforms.ormCubemap = materialManager.orthoEnvTextures[envTarget].orm;
          shader.uniforms.normalCubemap = materialManager.orthoEnvTextures[envTarget].normal;
          shader.uniforms.standardCubemap = materialManager.standardCarEnvTexture;
          break;
        case ENV_LANDING:
          shader.uniforms.useBoxProjection = { value: true };
          shader.uniforms.boxProjectionSize = materialManager.boxProjectionData.landingSize;
          shader.uniforms.boxProjectionPosition = materialManager.boxProjectionData.landingPosition;
          shader.uniforms.ormCubemap = materialManager.orthoEnvTextures[envTarget].orm;
          shader.uniforms.normalCubemap = materialManager.orthoEnvTextures[envTarget].normal;
          shader.uniforms.standardCubemap = materialManager.standardLandingEnvTexture;
          break;
        /*
      case ENV_IMAGE_CAPTURE:
        shader.uniforms.boxProjectionSize = materialManager.boxProjectionData.carSize;
        shader.uniforms.boxProjectionPosition = materialManager.boxProjectionData.carPosition;            
        break;
        */
        case undefined:
          shader.uniforms.useBoxProjection = { value: false };
          break;
        default:
          console.error('Unknown environment mapping setup for', this.name, 'value:', envMap)
          break;
      }

      // Add uv transformation matrix uniforms (
      // Note: material.map uv transformation matrix is already set by default (see. uvTransform)
      [
        'alphaMap',
        'bumpMap',
        'emissiveMap',
        'metalnessMap',
        'normalMap',
        'roughnessMap',
      ].forEach(mapType => {
        if (this[mapType]) {
          const uvTransformMatrix = new Matrix3();
          uvTransformMatrix.setUvTransform(this[mapType].offset.x, this[mapType].offset.y, this[mapType].repeat.x, this[mapType].repeat.y, this[mapType].rotation, this[mapType].center.x, this[mapType].center.y);
          const uniformName = mapType + 'UvTransform'
          shader.uniforms[uniformName] = { value: uvTransformMatrix };
        }
      })

      shader.uniforms.tonemappingData = {
        value: {
          type: parseInt(toneMapping),
          exposure: toneMappingExposure
        }
      }


      shader.uniforms.defaultNormalCubemap = materialManager.defaultNormalCubemap;
      shader.uniforms.emissionOnly = materialManager.emissionOnly;
      shader.uniforms.diffuseOnly = materialManager.diffuseOnly;
      shader.uniforms.ormOnly = materialManager.ormOnly;
      shader.uniforms.normalOnly = materialManager.normalOnly;
      shader.uniforms.opacityToR = materialManager.opacityToR;
      shader.uniforms.noEnvironmentMapping = materialManager.noEnvironmentMapping;
      shader.uniforms.reflectionDebug = materialManager.reflectionDebug;
      shader.uniforms.anisotropyEnabled = materialManager.anisotropyEnabled;
      shader.uniforms.anisotropyDebug = materialManager.anisotropyDebug;
      shader.uniforms.overblowDebug = materialManager.overblowDebug;
      shader.uniforms.magic1 = materialManager.magic1;
      shader.uniforms.magic2 = materialManager.magic2;
      shader.uniforms.magic3 = materialManager.magic3;


      if (emissive2 !== undefined ){
        console.log("plom", emissive2);
        // shader.uniforms.emissive2 = { value: new Color(emissive2) };
        shader.uniforms.emissive2 = { value: new Color( emissive2) };
        this.emissive = new Color(1, 1, 1);
      } else {
        shader.uniforms.emissive2 = { value: new Color( 0,0,0) };
      }

      shader.uniforms.use_bumpmap = this.bumpMap !== undefined;

      if (shader.uniforms.bloomIntensity === undefined) {
        shader.uniforms.bloomIntensity = { value: bloomIntensity }
      } else {
        shader.uniforms.bloomIntensity.value = bloomIntensity
      }

      this.shader = shader

      shader.vertexShader = custom_physical_vertexGlsl;
      shader.fragmentShader = custom_physical_fragmentGlsl;


      // required from dynamic hijinks:
      // shader.uniforms["numOfSpotlights"] = { value: shader.numSpotLights };
      shader.uniforms["numOfSpotlights"] = materialManager.numberOfSpotLights;
      
      shader.uniforms["numOfRectArealights"] = materialManager.numberOfRectLights;

      // console.log(shader);

    }


  }
}

export { CarDesignerMaterial };