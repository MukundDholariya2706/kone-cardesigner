import EventEmitter from 'events';
import * as THREE from 'three';
import CameraControls from 'camera-controls';
import nr from 'normalize-range';
import AssetManager from './AssetManager';
import MaterialManager from './MaterialManager';
import MirrorManager from './MirrorManager';
import ImageRenderer from './ImageRenderer';
import { pasteHideGroup } from './mesh-decorators'
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib';

import { CAMERA_VIEW_ANGLE, CAMERA_NEAR, CAMERA_FAR, CAMERA_TARGET, DEFAULT_WIDTH, DEFAULT_HEIGHT, 
   CAMERA_MIN_DISTANCE, CAMERA_MAX_DISTANCE, CAMERA_ZOOM_STEP,  CAMERA_DEFAULT_DISTANCE, CAMERA_ROTATION, CAMERA_TARGET_SQUARE, CAMERA_TARGET_SQUARE_10_13,
  CAMERA_TARGET_HOMELIFT_9_12_24, CAMERA_TARGET_WIDE, CAMERA_TARGET_NANOSPACE, CAMERA_TARGET_DEEP_AU, CAMERA_TARGET_WIDE_AU, CAMERA_TARGET_LANDING, CAMERA_ROTATION_LANDING, CAMERA_DEFAULT_DISTANCE_LANDING, CAMERA_MIN_LANDING_VIEW_DISTANCE,
  CAMERA_MAX_LANDING_VIEW_DISTANCE, LIGHT_SPOT_LIGHT, LIGHT_RECT_AREA_LIGHT, SHOW_AXES_HELPER, QUALITY_3D_MEDIUM, QUALITY_3D_HIGH, QUALITY_3D_LOW, LIGHT_AMBIENT_LIGHT, LIGHT_DIRECTIONAL_LIGHT, LIGHT_HEMISPHERE_LIGHT, LIGHT_POINT_LIGHT,
  CAMERA_TARGET_INDIA_11_10,
  CAMERA_TARGET_INDIA_11_13,
  CAMERA_TARGET_INDIA_13_24,
  CAMERA_TARGET_INDIA_16_15,
  CAMERA_TARGET_INDIA_11_20,
  CAMERA_TARGET_INDIA_16_13,
  CAMERA_TARGET_ENA_19_16, CAMERA_TARGET_ENA_20_13, CAMERA_TARGET_ENA_17_25,
  CAMERA_TARGET_TRANSYS_12_23, CAMERA_TARGET_TRANSYS_12_26, CAMERA_TARGET_TRANSYS_14_24, CAMERA_TARGET_TRANSYS_15_27, CAMERA_TARGET_WIDE_23_17_26,CAMERA_TARGET_INDIA_17_18,CAMERA_TARGET_WIDE_16_20 } from './3d-constants';

import { CAR_SHAPE_DEEP, CAR_SHAPE_SQUARE, CAR_SHAPE_SQUARE_10_13_24, CAR_SHAPE_HOMELIFT_9_12_24,  CAR_SHAPE_WIDE, CORNER, ENV_CAR, CORNER_START, CORNER_START_REVERSE, 
  CORNER_REVERSE, VIEW3D_MODE_CAR, VIEW3D_MODE_LANDING, TYP_CAR_WALL_B, TYP_CAR_WALL_C, TYP_CAR_WALL_D, TYP_CAR_GLASS_WALL_C, LOCAL_STORAGE_3D_QUALITY, CAR_SHAPE_NANOSPACE_11_10_21, CAR_SHAPE_DEEP_AU_14_20_24,
  CAR_SHAPE_WIDE_AU_14_16_24, TYP_CAR_GLASS_WALL_FRAME, TYP_CAR_FRONT_WALL_A, CAR_SHAPE_WIDE_ENA_20_13_24, CAR_SHAPE_WIDE_ENA_19_16_24, CAR_SHAPE_4500HMC_ENA_17_25_24, CORNER_START_NOFIXING_REVERSE, CORNER_START_NOFIXING, TYP_HL_DISPLAY,
  CAR_SHAPE_INDIA_16_13_22, CAR_SHAPE_INDIA_11_10_22, CAR_SHAPE_INDIA_11_20_22, CAR_SHAPE_INDIA_11_13_22, CAR_SHAPE_INDIA_13_24_22, CAR_SHAPE_INDIA_16_15_22,
  CAR_SHAPE_TRANSYS_12_23_24, CAR_SHAPE_TRANSYS_12_26_24, CAR_SHAPE_TRANSYS_14_24_24, CAR_SHAPE_TRANSYS_15_27_24, TYP_COP_PRODUCT_1, CAR_SHAPE_WIDE_23_17_26,CAR_SHAPE_INDIA_17_18_22,CAR_SHAPE_WIDE_16_20_24
} from '../../../constants';
import {computeTangents, EasingFunctions, findMeshesByComponentType, fixIntersections, getCameraLookPosition } from './3d-utils';
import { get3DQuality, getLeadingZeros } from '../../../utils/generalUtils';

import * as Live3DEditor from '../../../utils/live-3d-editor'
import {  Box3, Vector3 } from 'three';
import RenderingManager from './RenderingManager'
import CubemapManager from './CubemapManager'
import OrtographicCubemapManager from './OrtographicCubemapManager';

import { PostProcessingReflectorContainer } from './PostProcessingReflector';

import { clamp } from 'three/src/math/MathUtils';

CameraControls.install( { THREE: THREE } );

class SceneManager extends EventEmitter {
  constructor() {
    super()

    this.quality = get3DQuality()

    // console.log(this.quality, ls3dQuality)

    this.blueprint = null
    this.forcedBlueprint = null
    
    this.assetManager = new AssetManager()
    this.assetManager.addListener('complete', () => {
      this.materialManager.createMaterials( this.blueprint && this.blueprint.materials )      
      // console.log(this.blueprint);
      this.updateScene()
    })
    this.materialManager = new MaterialManager(this.assetManager)
    this.mirrorManager = new MirrorManager()
    this.mirrorManager.setQuality(this.quality)

    this.imageRenderer = new ImageRenderer(this)
    this.scene = new THREE.Scene()
    //Scenic wall city fog
    //this.scene.background = SCENE_BACKGROUND_COLOR;
    this.scene.fog = new THREE.Fog(0xFFFFFF, 6500, 20000)


    RectAreaLightUniformsLib.init();

    if(!process.env.RUNNING_TEST) {

      this.camera = new THREE.PerspectiveCamera( CAMERA_VIEW_ANGLE, (DEFAULT_WIDTH / DEFAULT_HEIGHT), CAMERA_NEAR, CAMERA_FAR )      
      this.resetCamera()

      // console.log(this);
      this.renderingManager = new RenderingManager(this.scene, 
        this.camera, 
        this.materialManager,
        this.mirrorManager,
        this.quality);
      this.canvas = this.renderingManager.renderer.domElement;
      this.cameraController = new CameraControls(this.camera, this.canvas);
      //TODO: maybe refactor this so that all rendering is accessed via renderingmanager, not scenemanager
      this.renderer = this.renderingManager.renderer;

      this.cubemapManager = new CubemapManager(this.scene, this.renderer, this.materialManager, this.mirrorManager);
      this.customCubemapManager = new OrtographicCubemapManager(this.scene, this.renderer, this.materialManager, this.mirrorManager, this.cubemapManager);

      // Disable zoom only in production mode
      if (process.env.NODE_ENV === 'production') {
        this.cameraController.minPolarAngle = Math.PI / 4
        this.cameraController.maxPolarAngle = 3 * Math.PI / 4   
        this.cameraController.minDistance = CAMERA_MIN_DISTANCE;
        this.cameraController.maxDistance = CAMERA_MAX_DISTANCE;
      }
       else {
        // quick and dirty way to see mipmapping debug values, these could be actually controlled by a more sophisticated system with constant definitions (eg. LAYER.HELPERS = 2)
        this.camera.layers.enable(2);
      }
      this.cameraController.lastPolarAngle = this.cameraController.polarAngle;
      this.cameraController.lastAzimuthAngle = this.cameraController.azimuthAngle;

      this.cameraController.lastMovementDelta = 0;
      this.cameraController.lastPosition = this.cameraController.getPosition();

      // Clipping plane helper
/*       if (SHOW_CLIPPING_PLANE_HELPER) {   
        const clipPlaneHelpers = new THREE.Group();
        for (let i = 0; i < clipPlanes.length; i++) {
        clipPlaneHelpers.add( new THREE.PlaneHelper( clipPlanes[i], 150, 0xff0000 ) );
        }
        clipPlaneHelpers.visible = true;
        this.scene.add( clipPlaneHelpers );
      } */

      if (SHOW_AXES_HELPER) {
        const axesHelper = new THREE.AxesHelper(100)
        axesHelper.userData = {
          locked: true
        }
        this.scene.add( axesHelper )
      }

      this.clock = new THREE.Clock();
      this.animationRequestId = undefined
      this.renderRequested = true
      this.cubeCaptureRequested = true // this is mainly for live 3D editor, we don't want to update the maps all the time
      this.animating = false;

      this.animations = []

      this.animate()
    }
  }

  setQuality(quality) {
    if (!quality || this.quality === quality || [QUALITY_3D_LOW, QUALITY_3D_MEDIUM, QUALITY_3D_HIGH].indexOf(quality) === -1) {
      return
    }

    console.log('*** CHANGE 3D QUALITY TO', quality)
    
    localStorage.setItem(LOCAL_STORAGE_3D_QUALITY, quality);
    
    this.quality = quality
    this.scene.remove.apply(this.scene, this.scene.children);
    this.materialManager.clearMaterials()
    this.materialManager.setReflectionQuality(quality);
    this.assetManager.clearTextures()
    this.mirrorManager.setQuality(quality)
    this.renderingManager.setQuality(quality);
    Live3DEditor.updatePostProcessingEditor();
    // console.log("Set quality", this.renderer);
  }

  addAnimation(animation, mesh) {
    this.animations.push({
      ...animation,
      mesh: mesh
    })
  }

  removeAnimation(mesh) {
    const index = this.animations.findIndex(item => item.mesh === mesh)
    if (index !== -1) {
      const item = this.animations.splice(index, 1)
      if (!item.completed) {

      }
      delete item.mesh
    }
  }

  hasActiveAnimation(mesh) {
    const index = this.animations.findIndex(item => item.mesh === mesh)
    if (index !== -1) {
      const animation = this.animations[index]
      return animation.initialized === true
    }
    return false
  }

  dispose() {
    console.log('TODO: Dispose')
  }

  disposeMesh(mesh) {

    const { animation } = mesh.userData

    if (animation) {
      this.removeAnimation(mesh)
    }

    mesh.geometry.dispose()

    // stop disposing materials, shit-ton of shader losses
    // if (Array.isArray(mesh.material)) {
    //   mesh.material.forEach(material => {
    //     material.dispose()
    //   })
    // } else {
    //   mesh.material.dispose()
    // }
  }

  setSize(width, height) {
    this.canvas.style.width = width + 'px'
    this.canvas.style.height = height + 'px'
    this.canvas.style.position = 'absolute'
    this.canvas.style.top = 0
    this.canvas.style.left = 0
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    // this.renderer.setSize(width, height)
    // this.renderingManager.setSize(width * window.devicePixelRatio, height * window.devicePixelRatio);
    this.renderingManager.setSize(width, height);
    // this.renderer.setSize(width / window.devicePixelRatio, height / window.devicePixelRatio)
    this.renderRequested = true
  }

  updateAnimations(clock) {
    if (!this.animations.length) {
      return
    }

    const time = clock.getElapsedTime()

    for (let index = 0; index < this.animations.length; index++) {
      const animation = this.animations[index];

      if (animation.completed) {
        continue
      }

      if (!animation.initialized) {
        animation.startTime = time
        animation.startPosition = animation.mesh.position.clone()
        animation.delay = isNaN(animation.delay) ? 0 : animation.delay
        animation.start = Array.isArray(animation.start) ? animation.start : [0, 0, 0]
        animation.end = Array.isArray(animation.end) ? animation.end : [0, 0, 0]
        animation.vMove = new THREE.Vector3(
          animation.end[0] - animation.start[0],
          animation.end[1] - animation.start[1],
          animation.end[2] - animation.start[2]
        )
        animation.initialized = true
      }
      
      if ( (time - animation.startTime) >= animation.delay && (time - animation.startTime) < (animation.duration + animation.delay) ) {
        let pos = EasingFunctions.easeInOutQuad(
          (time - (animation.startTime + animation.delay)) / animation.duration
        )
        const vPos = new THREE.Vector3().addScaledVector(animation.vMove, pos)
        vPos.add(animation.startPosition)
        animation.mesh.position.copy(vPos)
        this.renderRequested = true
        this.animating = true;
        // console.log('anim')
      } else if ((time - animation.startTime) > animation.delay) {
        const vPosFinal = new THREE.Vector3().copy(animation.vMove)
        vPosFinal.add(animation.startPosition)
        animation.mesh.position.copy(vPosFinal)
        animation.completed = true
        this.renderRequested = true
        this.animating = true;
        // console.log('anim')
      }
    }
  }

  /**
   * Main loop for 3d rendering.
   */
  animate() {
    const delta = this.clock.getDelta()
    const hasCameraControllerUpdated = this.cameraController.update( delta )
    this.animationRequestId = requestAnimationFrame(() => this.animate())
    this.updateAnimations(this.clock)
    // console.log('anim')

    const deltaOnStart = this.cameraController.lastMovementDelta;
    
    if (hasCameraControllerUpdated){
      const currentPosition = this.cameraController.getPosition();
      this.cameraController.lastMovementDelta += currentPosition.distanceTo(this.cameraController.lastPosition);
      this.cameraController.lastPosition = currentPosition;      
      this.renderRequested = true;
      // console.log('cameraupdate')
    } else if (this.renderRequested && this.renderingManager.hasDynamicAntialiasing()) {
      // if not moving around, use max antialias
      this.cameraController.lastMovementDelta = 0;
      // this.renderingManager.setAntialiasQuality(5);
    }

    if (this.renderingManager.hasDynamicAntialiasing()) {
      const leadingZeros = getLeadingZeros(this.cameraController.lastMovementDelta / 10)
      const limits = this.renderingManager.getAntialiasLimits();
      const currentQuality = this.renderingManager.getAntialiasQuality();
      if (this.animating || deltaOnStart < this.cameraController.lastMovementDelta) {
        if (currentQuality !== limits.min){
          this.renderingManager.setAntialiasQuality(limits.min);
          this.renderRequested = true;
        }
      } else {
        const targetLevel = clamp(leadingZeros, limits.min, limits.max)
        if (targetLevel !== currentQuality) {
          this.renderingManager.setAntialiasQuality(targetLevel);
          this.renderRequested = true;
        }
      }

      // console.log(leadingZeros, limit, targetLevel, currentQuality)
    }
    if (this.renderRequested) {
      this.renderRequested = false
      this.renderingManager.renderToScreen();
      if (this.cubeCaptureRequested){
        this.cubeCaptureRequested = false;
        this.customCubemapManager.updateMaps(); // this seems to be a bit unreliable for some reason
        this.renderingManager.renderToScreen();
      }
    }
    if (hasCameraControllerUpdated){
      this.cameraController.lastMovementDelta /= 2;
    }
    this.animating = false;
  }

  build(blueprint) {

    this.blueprint = blueprint

    // keep the blueprint for debugging
    if(this.forcedBlueprint !== null){
      console.warn("Forced blueprint", blueprint);
      this.blueprint = this.forcedBlueprint
    }
    if (!blueprint) return
    this.assetManager.loadAssets(blueprint)  
  }

  updateMeshProperties() {
    
  }

  /**
   * Removes unused meshes. Adds missing meshes. Updates mesh positions, rotations, scales, & materials.
   */
  updateScene(friendlyName) {
    const updateTiming = {
      totalTime: 0,
      removeUnuseds: 0,
      addMeshes: 0,
      addMirrors: 0,
      addLights: 0,
      updateProperties: 0,
      updateConnectedMeshes: 0,
      updateEnvironmentMaps: 0
    }
    // console.log('*** UPDATE SCENE ***')
    updateTiming.totalTime = (new Date()).getTime();
    
    const { meshes = [], mirrors = [], lights = [], metadata = {}  } = this.blueprint || {}    
    const { view = VIEW3D_MODE_CAR } = metadata;

    const unusedMeshes = []
    const unusedMirrors = []
    const unusedLights = []
    const unusedHelpers = []
    const existingMeshIds = []
    const existingMirrorIds = []
    const existingLightIds = []
    const connectedMeshes = []
    this.scene.traverse( node => {
      if ( node instanceof THREE.Object3D ) {

        //const { id, isMirror = false, locked = false } = node.userData || {}
        const { id, locked = false } = node.userData || {}
        
        // if mesh is mirror (mesh)
        if (node instanceof PostProcessingReflectorContainer) {
          if (mirrors.find(item => item.id === id)) {
            existingMirrorIds.push(id)
          } else {
            !locked && unusedMirrors.push(node)
          }
        // if mesh is ... mesh
        } else if (node instanceof THREE.Mesh) {
          if (meshes.find(item => item.id === id)) {
            existingMeshIds.push(id)
          } else {
            !locked && unusedMeshes.push(node)
          }
        }
      }

      if ( node instanceof THREE.Light ) {
        const { id, locked = false } = node.userData || {}

        if (id && lights.find(item => item.id === id)) {
          existingLightIds.push(id)
        } else {
          !locked && unusedLights.push(node)
        }
      }

    })

    updateTiming.removeUnuseds = (new Date()).getTime();
    //console.log("Unuseds:", unusedMeshes, unusedMirrors, unusedLights, unusedHelpers);
    unusedMeshes.forEach(mesh => {
      this.scene.remove(mesh)
      this.disposeMesh(mesh)
    })

    unusedMirrors.forEach(mirrorContainer => {
      this.disposeMesh(mirrorContainer.realtimeMirror)
      this.disposeMesh(mirrorContainer.lowQualityMirror)
      this.scene.remove(mirrorContainer)
    })

    unusedLights.forEach(light => {
      this.scene.remove(light)
    })

    unusedHelpers.forEach(helper => {
      this.scene.remove(helper)
    })
    updateTiming.removeUnuseds = (new Date()).getTime() - updateTiming.removeUnuseds;
    updateTiming.addMeshes = (new Date()).getTime();

    // add missing meshes
    if (meshes && meshes.length) { 
      for (const meshDefinition of meshes) {
        const { id, modelId, name, intersectBox, animation } = meshDefinition
        // see if mesh already exists
        if (existingMeshIds.indexOf(id) === -1) {
          const mesh = this.assetManager.getMesh(modelId, name, intersectBox)
          if (mesh) {
            mesh.userData = { ...meshDefinition }
            this.scene.add(mesh)
            if (animation) {
              this.addAnimation(animation, mesh)
            }
          } else {
            console.warn(`Requested mesh not found (modelId: ${modelId}, meshName: ${name})`)
          }
        }
      }
    }
    updateTiming.addMeshes = (new Date()).getTime() - updateTiming.addMeshes;
    updateTiming.addMirrors = (new Date()).getTime();
    // add missing mirrors
    if (mirrors && mirrors.length) {
      for (const mirrorDefinition of mirrors) {
        const { id } = mirrorDefinition
        if (existingMirrorIds.indexOf(id) === -1) {
          let mirror;
          if (this.mirrorManager.hasMirror(id)){
            mirror = this.mirrorManager.getMirror(id);
          } else {
            const tint = mirrorDefinition.tint;
            const matId = "mirror-" + id;
            const mirrorMaterialData = this.materialManager.addMirrorMaterial(matId, tint);
            mirror = this.mirrorManager.createMirror(mirrorDefinition, mirrorMaterialData.data, this.scene)
          }
            
          if (mirror) {
//            console.log('mirror',mirror)
            mirror.userData = { ...mirrorDefinition, isMirror: true }          
            //TODO: fix this 
            // console.log('added mirror', mirror)
            this.scene.add(mirror)
            //this.scene.add(mirror.realtimeMirror)
            //this.scene.add(mirror.lowQualityMirror)
          } else {
            console.warn(`Requested mirror not found (id: ${id}`)
          }
        }
      }
    }
    updateTiming.addMirrors = (new Date()).getTime() - updateTiming.addMirrors;
    updateTiming.addLights = (new Date()).getTime();
    // add missing lights
    if (lights && lights.length) { 
      for (const lightDefinition of lights) {
        const { id, type } = lightDefinition
        // see if mesh already exists
        if (id && existingLightIds.indexOf(id) === -1) {
          if (type === LIGHT_SPOT_LIGHT) {
            const { position, color = 0xfdf8f2, intensity = 1.5, distance = 260, angle = 0.75, penumbra = 0.8, decay = 1, showHelper = false, lookAt } = lightDefinition
            const light = new THREE.SpotLight( color, intensity, distance, angle, penumbra, decay );
            light.position.fromArray(position)
            if (Array.isArray(lookAt) && lookAt.length === 3) {
              light.target.position.set(lookAt[0], lookAt[1], lookAt[2])
            } else {
              light.target.position.set(light.position.x, 0, light.position.z)
            }
            light.target.updateMatrixWorld();
            light.userData = { ...lightDefinition }
            this.scene.add( light );

            if (showHelper) {
              this.scene.add( new THREE.SpotLightHelper( light ) );              
            }
          }
          
          if (type === LIGHT_RECT_AREA_LIGHT) {
            const { position, color = 0xfdf8f2, intensity = 1.5, width = 10, height = 10, showHelper = false, lookAt, rotation } = lightDefinition
            const light = new THREE.RectAreaLight( color, intensity,  width, height );
            light.position.fromArray( position )
            if (Array.isArray(lookAt) && lookAt.length === 3) {
              light.lookAt( lookAt[0], lookAt[1], lookAt[2] );
            } else {
              light.lookAt( light.position.x, 0, light.position.z );
            }
            if (rotation && Array.isArray(rotation) && rotation.length === 3) {
              light.rotation.fromArray( rotation )
            }
            light.updateMatrixWorld();
            this.scene.add( light );
            
            // if (showHelper) {
            //   light.add( new THREE.RectAreaLightHelper( light ) );
            // }
          }

          if (type === LIGHT_AMBIENT_LIGHT) {
            //const { color = 0x404040, intensity = 0.5 } = lightDefinition
            const { color = 0xfdf8f2, intensity = 0.5,  } = lightDefinition
            const light = new THREE.AmbientLight( color, intensity );
            light.updateMatrixWorld();
            this.scene.add( light );
          }

          if (type === LIGHT_HEMISPHERE_LIGHT) {
            const { skyColor = 0xffffbb, groundColor = 0x080820, intensity = 1 } = lightDefinition
            const light = new THREE.HemisphereLight( skyColor, groundColor, intensity );
            light.updateMatrixWorld();
            this.scene.add( light );
          }

          if (type === LIGHT_POINT_LIGHT) {
            const { position, color = 0xfdf8f2, intensity = 1, distance = 100, decay = 1, showHelper = false } = lightDefinition
            const light = new THREE.PointLight( color, intensity, distance, decay );
            light.position.fromArray(position)
            light.updateMatrixWorld();
            this.scene.add( light );
            if (showHelper) {
              this.scene.add( new THREE.PointLight( light ) );              
            }
          }

          if (type === LIGHT_DIRECTIONAL_LIGHT) {
            //const { color = 0x404040, intensity } = lightDefinition
            const { color = 0xfdf8f2, intensity } = lightDefinition
            const light = new THREE.DirectionalLight( color, intensity );
            light.updateMatrixWorld();
            this.scene.add( light );
          }

/*           if (type === LIGHT_DIRECTIONAL_LIGHT) {
            const { position, lookAt, color = 0xffffff, intensity = 0.5, showHelper = false } = lightDefinition
            const light = new THREE.DirectionalLight( color, intensity );
            light.position.fromArray( position )
            if (Array.isArray(lookAt) && lookAt.length === 3) {
              light.target.position.set(lookAt[0], lookAt[1], lookAt[2])
            } else {
              light.target.position.set(0, 0, 0)
            }

            light.target.updateMatrixWorld();
            light.updateMatrixWorld();
            this.scene.add( light );
            //this.scene.add( light.target );

            if (showHelper) {
              light.add( new THREE.DirectionalLightHelper( light, 50 ) );
            }
          } */
        }
      }
    }
    this.materialManager.updateLights(this.scene);
    updateTiming.addLights = (new Date()).getTime() - updateTiming.addLights;
    updateTiming.updateProperties = (new Date()).getTime();
    // Update properties for meshes (& mirrors)
    this.scene.traverse(node => {
      if ( node instanceof THREE.Object3D ) {
        
        const { id, isMirror } = node.userData
        // console.log(node)
        if (node instanceof THREE.Mesh){
          if (node.geometry.attributes.anisotropicTangent === undefined){
            computeTangents(node)
          }
        }
        if (id) {
          const definition = isMirror ? mirrors.find(item => item.id === id) : meshes.find(item => item.id === id)
          const { position, rotation, scale, material, hideGroup, renderOrder, connect } = definition || {}
          node.userData = {...definition}
          if (!isNaN(renderOrder)) {
            node.renderOrder = renderOrder
          }
          if (position && Array.isArray(position) && position.length === 3) {
            if (!this.hasActiveAnimation(node)) {
              node.position.fromArray(position)
            }
          }
          if (rotation && Array.isArray(rotation) && rotation.length === 3) {
            node.rotation.fromArray(rotation)
          }
          if (scale && Array.isArray(scale) && scale.length === 3) {
            node.scale.fromArray(scale)
          }
          if (material) {
            this.updateMeshMaterials(node, Array.isArray(material) ? material : [material]  )
          }
          if (hideGroup) {
            pasteHideGroup(hideGroup, node)
          } else if(!isMirror) {
            if (node.onBeforeRender && node.onBeforeRender !== THREE.Object3D.prototype.onAfterRender) {
              node.onBeforeRender = THREE.Object3D.prototype.onAfterRender
            }
            if (node.onAfterRender && node.onAfterRender !== THREE.Object3D.prototype.onAfterRender) {
              node.onAfterRender = THREE.Object3D.prototype.onAfterRender
            }
          }
          if (connect) {
            connectedMeshes.push(node)
          }
        }
      }
    });
    updateTiming.updateProperties = (new Date()).getTime() - updateTiming.updateProperties;
    updateTiming.updateConnectedMeshes = (new Date()).getTime();

    // Update connected meshesh (position & scale)
    for (const connectedMesh of connectedMeshes) {
      const { id, isMirror } = connectedMesh.userData        
      const definition = isMirror ? mirrors.find(item => item.id === id) : meshes.find(item => item.id === id)
      const { connect } = definition || {}
      const { position, scale, rotation } = this.getPositionAndScaleFromConnections(connectedMesh, connect)
      
      if (scale && scale.isVector3) {
        connectedMesh.scale.copy( scale )
      }
      if (position && position.isVector3) {
        connectedMesh.position.copy( position )
      }
      if (rotation && rotation.isEuler) {
        connectedMesh.rotation.copy( rotation )
      }
    }

    // see if we have some problematic intersections
    fixIntersections("TYP_TENANT_DIRECTORY_1", ["TYP_COP_HORIZONTAL", "TYP_COP_PRODUCT_1"], this.scene, { lockX: true });


    updateTiming.updateConnectedMeshes = (new Date()).getTime() - updateTiming.updateConnectedMeshes;

    // Optimization ideas
    // see. https://discoverthreejs.com/tips-and-tricks/
    // set object.matrixAutoUpdate = false for static or rarely moving objects and manually call object.updateMatrix() when their position/quaternion/scale are updated

    updateTiming.compileShaders = (new Date()).getTime();

    this.renderingManager.compileShaders();

    updateTiming.compileShaders = (new Date()).getTime() - updateTiming.compileShaders;

    updateTiming.updateEnvironmentMaps = (new Date()).getTime();

    // we want something to be placed in the reflection maps so threejs doesn't trigger a shader rebuild for all shaders (env->no env)
    this.cubemapManager.baseTextures.car = this.assetManager.getTexture( ENV_CAR );
    this.cubemapManager.baseTextures.landing = this.assetManager.getTexture( ENV_CAR ); 
  
    // console.log('reflaupdate start')
    //this.customCubemapManager.adjustCenter();
    const originalHelperVisibility = this.customCubemapManager.debug.textureHelper.visible
    if (originalHelperVisibility){
      this.customCubemapManager.debug.textureHelper.visible = false;
    }
    
    // left this here for demo purposes, remove when not needed
    //this.cubemapManager.updateReflectionMaps(this.blueprint, view, 3);
    
    this.customCubemapManager.updateMaps();
    this.customCubemapManager.debug.textureHelper.visible = originalHelperVisibility;
    // console.log('reflaupdate')

    updateTiming.updateEnvironmentMaps = (new Date()).getTime() - updateTiming.updateEnvironmentMaps;
    // change scene background alpha to transparent after ENV MAP is created
    //this.renderer.setClearColor( 0xffffff, 0 );

    this.canvas.setAttribute('loadedscene', window.testString);
    this.renderRequested = true

    updateTiming.totalTime = (new Date()).getTime() - updateTiming.totalTime;
    if (process.env.NODE_ENV === "development") {

      Live3DEditor.initializeLive3DEditingGUI(this, () => {
        this.renderRequested = true;
      }, () => {
        this.renderRequested = true;
        this.cubeCaptureRequested = true;
      });
    }
    Live3DEditor.updateMaterialEditor(this.scene);
    console.groupCollapsed(`*** SCENE UPDATE COMPLETE *** (${updateTiming.totalTime}ms)`)
    console.log(updateTiming)
    console.groupEnd();
    this.emit('complete');
  }  

  /**
   * Updates mesh materials by give material ids
   * @param {*} mesh Mesh object
   * @param {*} materialIds Array of ids
   */
  updateMeshMaterials(mesh, materialIds) {

    if (!mesh) {
      return
    }

    if (!mesh.material && !materialIds) {
      return;
    }
    
    materialIds = materialIds || []
    const currentMaterialIds = []

    if (Array.isArray(mesh.material)) {
      mesh.material.forEach(material => {
        currentMaterialIds.push(material.userData.id)
      })
    } else if (mesh.material) {
      currentMaterialIds.push(mesh.material.userData.id)
    }

    let changed = false;
    for (let index = 0; index < Math.max(materialIds.length, currentMaterialIds.length); index++) {
      if (!materialIds[index] || !currentMaterialIds[index] || materialIds[index] !== currentMaterialIds[index] ) {
        changed = true;
        break;
      }
    }

    if (!changed) {
      return
    }

    const newMaterials = []

    materialIds.forEach(id => {
      newMaterials.push(this.materialManager.getMaterial(id))
    })

    if (!materialIds.length) {
      mesh.material = null;  
    }

    mesh.material = 
      newMaterials.length === 1 
        ? newMaterials[0] 
        : newMaterials

  }

  resetCamera() {
    if (this.cameraController) {
      this.cameraController.setTarget( CAMERA_TARGET.x, CAMERA_TARGET.y, CAMERA_TARGET.z, false )
      this.cameraController.rotateTo( CAMERA_ROTATION.azimuthAngle, CAMERA_ROTATION.polarAngle, false )
      this.cameraController.dollyTo( CAMERA_DEFAULT_DISTANCE, false )
    }
  }

  /**
   * Sets camera target (xyz) by given shape id (CAR_SHAPE_DEEP | CAR_SHAPE_SQUARE | CAR_SHAPE_WIDE)
   * @param {*} shape 
   */
  setCameraTargetByShape(shape, animate = false) {    
    if (this.cameraController) {

      if (localStorage.getItem('copOnly')) {
        this.cameraController.setTarget(0, 120, 0, false);
        this.cameraController.rotateTo( CAMERA_ROTATION_LANDING.azimuthAngle, CAMERA_ROTATION_LANDING.polarAngle, false);
        return;
      }

      switch (shape) {
        case CAR_SHAPE_DEEP:
          this.cameraController.setTarget( CAMERA_TARGET.x, CAMERA_TARGET.y, CAMERA_TARGET.z, animate )
          break;
        case CAR_SHAPE_SQUARE:
          this.cameraController.setTarget( CAMERA_TARGET_SQUARE.x, CAMERA_TARGET_SQUARE.y, CAMERA_TARGET_SQUARE.z, animate )
          break;
        case CAR_SHAPE_SQUARE_10_13_24:
          this.cameraController.setTarget( CAMERA_TARGET_SQUARE_10_13.x, CAMERA_TARGET_SQUARE_10_13.y, CAMERA_TARGET_SQUARE_10_13.z, animate )
          break;
        case CAR_SHAPE_WIDE:
          this.cameraController.setTarget( CAMERA_TARGET_WIDE.x, CAMERA_TARGET_WIDE.y, CAMERA_TARGET_WIDE.z, animate )
          break;
        case CAR_SHAPE_WIDE_AU_14_16_24:
          this.cameraController.setTarget( CAMERA_TARGET_WIDE_AU.x, CAMERA_TARGET_WIDE_AU.y, CAMERA_TARGET_WIDE_AU.z, animate )
          break;
        case CAR_SHAPE_DEEP_AU_14_20_24:
          this.cameraController.setTarget( CAMERA_TARGET_DEEP_AU.x, CAMERA_TARGET_DEEP_AU.y, CAMERA_TARGET_DEEP_AU.z, animate )
          break;
        case CAR_SHAPE_WIDE_23_17_26:
          this.cameraController.setTarget( CAMERA_TARGET_WIDE_23_17_26.x, CAMERA_TARGET_WIDE_23_17_26.y, CAMERA_TARGET_WIDE_23_17_26.z, animate )
          break;
        case CAR_SHAPE_HOMELIFT_9_12_24:
          this.cameraController.setTarget( CAMERA_TARGET_HOMELIFT_9_12_24.x, CAMERA_TARGET_HOMELIFT_9_12_24.y, CAMERA_TARGET_HOMELIFT_9_12_24.z, animate )
          break;
        case CAR_SHAPE_NANOSPACE_11_10_21:
          this.cameraController.setTarget( CAMERA_TARGET_NANOSPACE.x, CAMERA_TARGET_NANOSPACE.y, CAMERA_TARGET_NANOSPACE.z, animate )
          break;
        case CAR_SHAPE_WIDE_ENA_19_16_24:
          this.cameraController.setTarget( CAMERA_TARGET_ENA_19_16.x, CAMERA_TARGET_ENA_19_16.y, CAMERA_TARGET_ENA_19_16.z, animate )
          break;
        case CAR_SHAPE_WIDE_ENA_20_13_24:
          this.cameraController.setTarget( CAMERA_TARGET_ENA_20_13.x, CAMERA_TARGET_ENA_20_13.y, CAMERA_TARGET_ENA_20_13.z, animate )
          break;
        case CAR_SHAPE_4500HMC_ENA_17_25_24:
          this.cameraController.setTarget( CAMERA_TARGET_ENA_17_25.x, CAMERA_TARGET_ENA_17_25.y, CAMERA_TARGET_ENA_17_25.z, animate )
          break;
        case CAR_SHAPE_INDIA_11_10_22:
          this.cameraController.setTarget( CAMERA_TARGET_INDIA_11_10.x, CAMERA_TARGET_INDIA_11_10.y, CAMERA_TARGET_INDIA_11_10.z, animate )
          break;
          case CAR_SHAPE_INDIA_11_13_22:
          this.cameraController.setTarget( CAMERA_TARGET_INDIA_11_13.x, CAMERA_TARGET_INDIA_11_13.y, CAMERA_TARGET_INDIA_11_13.z, animate )
          break;
          case CAR_SHAPE_INDIA_13_24_22:
          this.cameraController.setTarget( CAMERA_TARGET_INDIA_13_24.x, CAMERA_TARGET_INDIA_13_24.y, CAMERA_TARGET_INDIA_13_24.z, animate )
          break;
          case CAR_SHAPE_INDIA_16_15_22:
          this.cameraController.setTarget( CAMERA_TARGET_INDIA_16_15.x, CAMERA_TARGET_INDIA_16_15.y, CAMERA_TARGET_INDIA_16_15.z, animate )
          break;
        case CAR_SHAPE_INDIA_11_20_22:
          this.cameraController.setTarget( CAMERA_TARGET_INDIA_11_20.x, CAMERA_TARGET_INDIA_11_20.y, CAMERA_TARGET_INDIA_11_20.z, animate )
          break;
        case CAR_SHAPE_INDIA_16_13_22:
          this.cameraController.setTarget( CAMERA_TARGET_INDIA_16_13.x, CAMERA_TARGET_INDIA_16_13.y, CAMERA_TARGET_INDIA_16_13.z, animate )
          break;
        case CAR_SHAPE_INDIA_17_18_22:
          this.cameraController.setTarget( CAMERA_TARGET_INDIA_17_18.x, CAMERA_TARGET_INDIA_17_18.y, CAMERA_TARGET_INDIA_17_18.z, animate )
          break;
        case CAR_SHAPE_TRANSYS_12_23_24:
          this.cameraController.setTarget( CAMERA_TARGET_TRANSYS_12_23.x, CAMERA_TARGET_TRANSYS_12_23.y, CAMERA_TARGET_TRANSYS_12_23.z, animate )
          break;
        case CAR_SHAPE_TRANSYS_12_26_24:
          this.cameraController.setTarget( CAMERA_TARGET_TRANSYS_12_26.x, CAMERA_TARGET_TRANSYS_12_26.y, CAMERA_TARGET_TRANSYS_12_26.z, animate )
          break;
        case CAR_SHAPE_TRANSYS_14_24_24:
          this.cameraController.setTarget( CAMERA_TARGET_TRANSYS_14_24.x, CAMERA_TARGET_TRANSYS_14_24.y, CAMERA_TARGET_TRANSYS_14_24.z, animate )
          break;
        case CAR_SHAPE_TRANSYS_15_27_24:
          this.cameraController.setTarget( CAMERA_TARGET_TRANSYS_15_27.x, CAMERA_TARGET_TRANSYS_15_27.y, CAMERA_TARGET_TRANSYS_15_27.z, animate )
          break;    
          case CAR_SHAPE_WIDE_16_20_24:
            this.cameraController.setTarget( CAMERA_TARGET_WIDE_16_20.x, CAMERA_TARGET_WIDE_16_20.y, CAMERA_TARGET_WIDE_16_20.z, animate )
            break;
        default:
          break;
      }
    }
  }

  /**
   * Sets camera target, target & distance based on given view type and car shape
   * @param {*} view 
   * @param {*} shape 
   * @param {*} animate 
   */
  setCameraView(view, shape = CAR_SHAPE_DEEP, animate = false) 
  {    
    if (view === VIEW3D_MODE_CAR) {
      this.setCameraTargetByShape(shape, animate)
      this.cameraController.rotateTo( CAMERA_ROTATION.azimuthAngle, CAMERA_ROTATION.polarAngle, animate)
      this.cameraController.dollyTo( CAMERA_DEFAULT_DISTANCE, animate)  
      this.cameraController.minAzimuthAngle = -Infinity
      this.cameraController.maxAzimuthAngle = Infinity
      if (process.env.NODE_ENV === 'production') {
        this.cameraController.minPolarAngle = Math.PI / 4
        this.cameraController.maxPolarAngle = 3 * Math.PI / 4   
        this.cameraController.minDistance = CAMERA_MIN_DISTANCE;
        this.cameraController.maxDistance = CAMERA_MAX_DISTANCE;
      } 
    }

    if (view === VIEW3D_MODE_LANDING) {
      this.cameraController.setTarget( CAMERA_TARGET_LANDING.x, CAMERA_TARGET_LANDING.y, CAMERA_TARGET_LANDING.z, animate )
      this.cameraController.rotateTo( CAMERA_ROTATION_LANDING.azimuthAngle, CAMERA_ROTATION_LANDING.polarAngle, animate)
      this.cameraController.dollyTo( CAMERA_DEFAULT_DISTANCE_LANDING, animate)
      this.cameraController.minAzimuthAngle = - Math.PI / 4
      this.cameraController.maxAzimuthAngle = Math.PI / 4
      if (process.env.NODE_ENV === 'production') {
        this.cameraController.minPolarAngle = Math.PI / 4
        this.cameraController.maxPolarAngle = 3 * Math.PI / 4
        this.cameraController.minDistance = CAMERA_MIN_LANDING_VIEW_DISTANCE;
        this.cameraController.maxDistance = CAMERA_MAX_LANDING_VIEW_DISTANCE;
      }
    }
  }

  /**
   * Turn camera to given wall (type)
   * @param {*} type 
   */
  lookAtWall(type) {
    const radianRange = nr.curry(-Math.PI, Math.PI);
    const wrappedRange = radianRange.wrap(this.cameraController._sphericalEnd.theta)
    const baseRotation = this.cameraController._sphericalEnd.theta - wrappedRange;

    switch (type) {
      case 'A':
      case TYP_CAR_FRONT_WALL_A:
        if (wrappedRange > 0) {
          this.cameraController.rotateTo( baseRotation + Math.PI, Math.PI/2, true ) 
        } else {
          this.cameraController.rotateTo( baseRotation - Math.PI, Math.PI/2, true ) 
        }
        break
      case 'B':
      case TYP_CAR_WALL_B:
        this.cameraController.rotateTo( baseRotation - Math.PI/2, Math.PI/2, true )
        break;
      case 'C':
      case TYP_CAR_WALL_C:
      case TYP_CAR_GLASS_WALL_C:
      case TYP_CAR_GLASS_WALL_FRAME:
        this.cameraController.rotateTo( baseRotation, Math.PI/2, true )
        break;
      case 'D':
      case TYP_CAR_WALL_D:
        this.cameraController.rotateTo( baseRotation + Math.PI/2, Math.PI/2, true )
        break;
      default:
        break;
    }
  }
  
  /**
   * Finds out upper corner positions from meshs vertices array
   * @param {*} param0 
   */
  getConnectionPositions(mesh) {
    
    const positions = mesh.geometry.attributes.position.array
    let maxY = -Number.MAX_VALUE
    let minZ = Number.MAX_VALUE
    let maxZ = Number.MAX_VALUE

    const tolerance = 0.01

    let start = new THREE.Vector3(-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE)
    let end = new THREE.Vector3(-Number.MAX_VALUE, -Number.MAX_VALUE, Number.MAX_VALUE) 
    let startIndex = -1
    let endIndex = -1
    
    for (let i = 0; i < positions.length; i = i + 3) {
      const y = positions[i + 1];      
      maxY = Math.max(maxY, y)
    }

    for (let i = 0; i < positions.length; i = i + 3) {
      const y = positions[i + 1];
      const z = positions[i + 2];
      if (y > maxY - tolerance) {
        maxZ = Math.max(maxZ, z)
        minZ = Math.min(minZ, z)
      }
    }
    
    for (let index = 0; index < positions.length; index = index + 3) {
      const x = positions[index];
      const y = positions[index + 1];
      const z = positions[index + 2];
      if (y > maxY - tolerance) {
          // is max z (in y tolerance)
        if (z > start.z) {
          start = new THREE.Vector3(x,y,z)
          startIndex = index
        }

        // is in min z tolerance
        if (z < minZ + tolerance) {
          // is max x (in y + z tolerance)
          if (x > end.x) {
            end = new THREE.Vector3(x,y,z)
            endIndex = index
          }
        }
      }
    }

    return { start, startIndex, end, endIndex }
  }    

  /**
   * Returns position, scale and rotation for the mesh
   * by given connect definitions
   * @param {*} mesh 
   * @param {*} connect 
   */
  getPositionAndScaleFromConnections(mesh, connect = {}) {
    const { from, to } = connect

    let fromPos, toPos;

    mesh.updateMatrixWorld()
    
    const { start:meshStart, end:meshEnd } = this.getConnectionPositions(mesh)

    this.scene.traverse(node => {
      if ( node instanceof THREE.Mesh ) {
        const { id } = node.userData
        if ( from && id === from ) {
          const {piece} = node.userData;
          node.updateMatrixWorld()
          if(piece === CORNER_START_REVERSE || piece === CORNER_REVERSE || piece === CORNER_START_NOFIXING_REVERSE) {
            fromPos = node.localToWorld( this.getConnectionPositions(node).start )
          } else {
            fromPos = node.localToWorld( this.getConnectionPositions(node).end )
          }
        }
        if ( to && id === to ) {
          const {piece} = node.userData;
          node.updateMatrixWorld()
          if(piece === CORNER || piece === CORNER_START || piece === CORNER_START_NOFIXING) {
            toPos = node.localToWorld( this.getConnectionPositions(node).start )
          } else {
            toPos = node.localToWorld( this.getConnectionPositions(node).end )
          }

        }
      }
    })

    // in
    if (!fromPos && !toPos) {
      console.log('SceneManager: invalid connect ids')
      return {
        position: undefined,
        scale: undefined,
        rotation: undefined
      }
    }

    // if "from" position only
    if (fromPos && !toPos) {
      const direction = mesh.position.clone().normalize()
      const angle = direction.angleTo( new THREE.Vector3(0, 0, -1) ) * -1
      const position = fromPos.clone().sub( meshStart.clone().applyAxisAngle( new THREE.Vector3(0, 1, 0), angle ) )
      // keep orginal scale & rotation
      return {
        position,
        scale: undefined,
        rotation: undefined
      }
    }

    const scale = toPos.clone().distanceTo(fromPos) / meshEnd.clone().distanceTo(meshStart)
    const direction = toPos.clone().sub(fromPos).normalize()
    const angle = direction.angleTo( new THREE.Vector3(0, 0, -1) ) * -1
    const rotation = new THREE.Euler( 0, angle, 0 )
    const position = fromPos.clone().sub( meshStart.clone().applyAxisAngle( new THREE.Vector3(0, 1, 0), angle ) )

    return {
      position,
      scale: new THREE.Vector3(1, 1, scale), // scale z-axis only
      rotation
    }
  }

  createHelper(v) {
    const helper = new THREE.AxesHelper( 10 )
    helper.position.copy( v )
    this.scene.add( helper )
  }

  /**
   * Take a snapshot
   */
  snapshot(readyCallback) {
    this.renderingManager.renderImage(readyCallback);
  }

  /**
   * Focuses the camera on COP buttons
   */
  // TODO: generalize this, we could focus on anything we want later on
  focusOnCopButtons(fallbackCopWall) {
    const copMeshes = findMeshesByComponentType(this.scene, TYP_COP_PRODUCT_1);
    const buttonMesh = copMeshes.find(x => x.userData["place"] === "buttons");
    if (this.cameraController) {
      if (buttonMesh !== undefined){
        // pivot or bounds center?
        buttonMesh.geometry.computeBoundingBox(); // for safety
        const boundingBox = new Box3().setFromObject(buttonMesh);
        if (boundingBox === undefined){
          console.warn("Could not calculate COP buttons bounding box, using fallback focus");
          this.lookAtWall(fallbackCopWall);
          this.cameraController.dollyTo(40,true);
        } else {
          const boundsCenter = new Vector3();
          boundingBox.getCenter(boundsCenter);
          this.focusOnPosition(boundsCenter, 40);
        }
      } else {
        console.warn("Could not find COP buttons mesh, using fallback focus");
        this.lookAtWall(fallbackCopWall);
        this.cameraController.dollyTo(40,true);
      }
    }
  }

  focusOnPosition(position, dollyDistance = undefined){
    let targetDistance = this.cameraController.distance;
    if (dollyDistance !== undefined){
      targetDistance = dollyDistance;
    }    
    const newCameraPosition = getCameraLookPosition(this.cameraController.getTarget(), position);
    this.cameraController.setPosition(newCameraPosition.x, newCameraPosition.y, newCameraPosition.z, true);
    this.cameraController.dollyTo(targetDistance, true);
  }


  /**
   * Zooms camera in by "step" (CAMERA_ZOOM_STEP)
   */
  zoomIn() {
    if (this.cameraController) {
      this.cameraController.dolly( CAMERA_ZOOM_STEP, true )
    }
  }

  /**
   * Zooms camera out by "step" (CAMERA_ZOOM_STEP)
   */    
  zoomOut() {
    if (this.cameraController) {
      this.cameraController.dolly( -CAMERA_ZOOM_STEP, true )
    }
  }
  
  /**
   * Rotates camera camera 45 degrees
   */      
  rotate() {
    if (this.cameraController) {
      this.cameraController.rotate( Math.PI/4, 0, true )
    }
  }

}

export default SceneManager