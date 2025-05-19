
import { MIRROR_CLIP_BIAS, MIRROR_COLOR, MIRROR_RECURSION, QUALITY_3D_HIGH, QUALITY_3D_LOW, QUALITY_3D_MEDIUM } from './3d-constants';
import { PostProcessingReflectorContainer } from './PostProcessingReflector'

class MirrorManager {

  constructor() {    
    this.mirrors = []
    this.quality = QUALITY_3D_MEDIUM
    this.realtimeReflections = true;
  }

  setQuality(quality) {
    if (this.quality === quality) {
      return
    }
    this.quality = quality

    while(this.mirrors.length) {
      const mirror = this.mirrors.pop()
      mirror.data.realtimeMirror.geometry.dispose();
      mirror.data.lowQualityMirror.geometry.dispose();
      delete mirror.data
    }
    this.realtimeReflections = quality !== QUALITY_3D_LOW;
  }

  getMirror(id) {
    const { data } = this.mirrors.find(item => item.id === id) || {};
    if (data) {
      return data
    }
    return undefined
  }
  
  hasMirror(id) {
    return id && this.mirrors && this.mirrors.length > 0 && (this.mirrors.find(item => item.id === id) !== undefined)
  }

  createMirrors(mirrorDefinitions, lowQualityMat) {
    if (!mirrorDefinitions) {
      return
    }
    const mirrorCount = mirrorDefinitions.length
    for (const mirrorDefinition of mirrorDefinitions) {
      if (!mirrorDefinition || !mirrorDefinition.id) {
        continue
      }
      const { id } = mirrorDefinition
      if (this.hasMirror(id)) {
        // this.updateMirror(mirrorDefinition, mirrorCount)
      } else {        
        this.createMirror(mirrorDefinition, lowQualityMat, mirrorCount)
      }
    }
  }

  createMirror(mirrorDefinition, lowQualityMat, mirrorCount) {
    const { id } = mirrorDefinition
    if (!id || this.hasMirror(id)) {
      return
    }

    const textureSize = (this.quality === QUALITY_3D_LOW && 1024) || 2048
    const {
      width = 100,
      height = 100,
      clipBias = MIRROR_CLIP_BIAS,
      textureWidth = textureSize,
      textureHeight = textureSize,
      color = lowQualityMat.color ? lowQualityMat.color.getHex() : MIRROR_COLOR,
      recursion = (mirrorCount<4) ?(mirrorCount-1) :MIRROR_RECURSION
    } = mirrorDefinition

    let multisampling;

    // multisampling seemed a bit too processor heavy
    switch (this.quality) {
      case QUALITY_3D_HIGH:
        multisampling = 4;
        break;
      case QUALITY_3D_MEDIUM:
        multisampling = 2;
        break;
      case QUALITY_3D_LOW:        
        multisampling = 0;
        break;    
      default:
        console.error("Unknown quality for mirror multisampling:", this.quality);
        break;
    }
    multisampling = 0;

    // const mirror = new PostProcessingReflector( mirrorGeometry, {
      const mirrorOptions = {
        clipBias,
        textureWidth,
        textureHeight,
        color: Number(color),
        recursion,
        multisampling
        // shader: this.shader
      };
    const mirror = new PostProcessingReflectorContainer( width, height, lowQualityMat, mirrorOptions);

    this.mirrors.push({ ...mirrorDefinition, data: mirror })
    // console.log('made amirror', mirror)
    // relink the intensity value so we can manipulate them with ease
    // mirror.material.uniforms.intensity = this.shader.uniforms.intensity
    mirror.name = mirrorDefinition.id
    return mirror
  }

  showMirrors(show){
    this.mirrors.forEach(element => {
      element.data.visible = show;
    });
  }

  // we want to turn off the onbeforerender call if capturing cubemaps and use cubemap instead
  setMirrorsQualityMode(highQuality){
    this.realtimeReflections = highQuality;
    this.mirrors.forEach(element => {
      element.data.setQualityMode(highQuality);
    });
  }
  
  setMirrorsCubemap(cubeTexture){
    this.mirrors.forEach(element => {
      element.data.lowQualityMaterial.envMap = cubeTexture
    });
  }

}

export default MirrorManager