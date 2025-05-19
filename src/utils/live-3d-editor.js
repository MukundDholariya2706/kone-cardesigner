import * as dat from "dat.gui";
import * as THREE from "three";
import * as MaterialEditor from './material-editor'
import * as PostProcessingEditor from './postprocessing-editor'
import * as CubemapEditor from './cubemap-editor'

let gui = null;

const currentFolders = {}


export const threeJsTextureFormatNames = [
  'AlphaFormat',
  'RedFormat',
  'RedIntegerFormat',
  'RGFormat',
  'RGIntegerFormat',
 
  'RGBIntegerFormat',
  'RGBAFormat',
  'RGBAIntegerFormat',
  'LuminanceFormat',
  'LuminanceAlphaFormat',
  'RGBEFormat',
  'DepthFormat',
  'DepthStencilFormat'
]

export function getTextureFormatFromName(name) {
  switch (name) {
    case 'AlphaFormat':
      return THREE.AlphaFormat;
    case 'RedFormat':
      return THREE.RedFormat;
    case 'RedIntegerFormat':
      return THREE.RedIntegerFormat;
    case 'RGFormat':
      return THREE.RGFormat;
    case 'RGIntegerFormat':
      return THREE.RGIntegerFormat;
   
    case 'RGBAFormat':
      return THREE.RGBAFormat;
    case 'RGBAIntegerFormat':
      return THREE.RGBAIntegerFormat;
    case 'LuminanceFormat':
      return THREE.LuminanceFormat;
    case 'LuminanceAlphaFormat':
      return THREE.LuminanceAlphaFormat;
    case 'DepthFormat':
      return THREE.DepthFormat;
    case 'DepthStencilFormat':
      return THREE.DepthStencilFormat;
    default:
      return -1
  }
}


export const initializeLive3DEditingGUI = (sceneManager, renderCallback, mapUpdateCallback) => {
   
  if (!gui) {
    const params = {
      // setting this explicitly would be preferrable
      // autoPlace: false,
      closed: true,
      name: "Live 3D Editor"
    }
    gui = new dat.GUI(params);
    gui.domElement.parentElement.style.cssText = "z-index:90000";
    gui.width = 400;

    const extras = {
      PrintInfo: function(){
        console.log('Current rendering status:', sceneManager.renderer.info)
      },

      // TODO: set call the rendering from here somehow
      
      // RenderPDFImages: function () {
      //   renderImages({
      //     blueprintBuilder: blueprintbuilder
      //   })
      // }

    }

    gui.add(extras, 'PrintInfo')
    // console.log(gui)
    currentFolders.postprocessingFolder = PostProcessingEditor.initializePostProcessingGUI(
      sceneManager.renderingManager, 
      sceneManager.materialManager, 
      renderCallback, 
      gui);
    currentFolders.materialFolder = MaterialEditor.initializeMaterialEditor(gui, 
      sceneManager.materialManager,
      renderCallback,
      mapUpdateCallback);

    currentFolders.cubemapFolder = CubemapEditor.initializeCubemapGUI(
      sceneManager,
      renderCallback,
      gui);
  }
}

export const updateMaterialEditor = (scene) => {
  currentFolders.materialFolder = MaterialEditor.updateMaterialEditor(scene);
}

export const updatePostProcessingEditor = () => {
  currentFolders.postprocessingFolder = PostProcessingEditor.updatePostProcessingEditor();
}

export default initializeLive3DEditingGUI;
