import * as THREE from "three";

import { CUBE_CAMERA_RESOLUTION, CAMERA_FAR } from "./3d-constants";

import {
  LANDING_CUBE_MAP_POSITION,
  VIEW3D_MODE_CAR,
  VIEW3D_MODE_LANDING,
  CAR_SHAPES,
  ENV_CAR,
  ENV_LANDING,
  CAR_SHAPE_DEEP,
} from "../../../constants";
import { getCarShape } from "../../blueprint/BlueprintProvider";
/// this class can be used to render various cubemaps, future use could be rendering specific data maps
// TODO: effectively Obsolete
export class CubemapManager {
  // TODO: remove renderer?
  constructor(scene, renderer, materialManager, mirrorManager) {
    this.cubemapOptions = {
      wrapS: THREE.ClampToEdgeWrapping,
      wrapt: THREE.ClampToEdgeWrapping,
      // format: THREE.RGBFormat,
      format: THREE.RGBAFormat,
      magFilter: THREE.LinearFilter,
      minFilter: THREE.LinearMipMapLinearFilter,
      generateMipmaps: true,
      type: THREE.UnsignedByteType,
      anisotropy: 1,
      encoding: THREE.LinearEncoding,
      depthBuffer: true,
      stencilBuffer: false,
    };
    this.cubemapResolution = CUBE_CAMERA_RESOLUTION;

    this.ccCar1 = this.createCubeCamera();
    this.ccCar1.renderTarget.texture.name = "cc1";
    this.ccCar2 = this.createCubeCamera();
    this.ccCar2.renderTarget.texture.name = "cc2";
    this.ccLanding1 = this.createCubeCamera();
    this.ccLanding1.position.fromArray(LANDING_CUBE_MAP_POSITION);
    this.ccLanding1.renderTarget.texture.name = "landing1";
    this.ccLanding2 = this.createCubeCamera();
    this.ccLanding2.position.copy(this.ccLanding1.position);
    this.ccLanding2.renderTarget.texture.name = "landing2";

    //this.debuggingSphere = this.createDebuggingSphere();
    //this.debuggingSphere.visible = false;

    this.debuggingCube = this.createDebuggingCube();
    this.debuggingCube.visible = false;
    this.scene = scene;

    scene.add(this.ccCar1);
    scene.add(this.ccCar2);
    scene.add(this.ccLanding1);
    scene.add(this.ccLanding2);
    //scene.add(this.debuggingSphere);
    scene.add(this.debuggingCube);

    this.renderCar1 = true;
    this.renderLanding1 = true;

    this.renderer = renderer;
    this.materialManager = materialManager;
    this.clearBeforeCapture = true;
    this.baseTextures = {
      car: null,
      landing: null,
    };

    // handle these as javascript objects so shaders can directly reference them
    // this.bpcemPosition = { value: bpcemPosition };
    // this.bpcemSize = { value: bpcemSize };

    this.mirrorManager = mirrorManager;
    // this.clearReflectionMaps(VIEW3D_MODE_CAR);
    // this.clearReflectionMaps(VIEW3D_MODE_LANDING);
    // console.log('created cubemapmanager', this)
  }

  updateBoxParameters(bpcemPosition, bpcemSize) {
    this.bpcemPosition.value = bpcemPosition;
    this.bpcemSize.value = bpcemSize;
  }

  createDebuggingCube() {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      metalness: 1,
      roughness: 0,
      envMap: this.ccCar1.renderTarget.texture,
    });
    const envCube = new THREE.Mesh(geometry, material);
    envCube.position.fromArray([0, 100, -0]);
    envCube.userData = {
      locked: true,
    };
    return envCube;
  }

  createDebuggingSphere() {
    // console.log(this)
    const material = new THREE.MeshBasicMaterial({
      // change this to meshbasicmaterial
      color: 0xffffff,
      metalness: 1,
      roughness: 0,
      envMap: this.ccCar1.renderTarget.texture,
    });
    const envSphere = new THREE.Mesh(
      new THREE.SphereBufferGeometry(32, 32, 32),
      material
    );
    envSphere.position.fromArray([0, 100, -100]);
    envSphere.userData = {
      locked: true,
    };
    return envSphere;
  }

  createCubeCamera() {
    // const newCubeCamera = new PostProcessingCubeCamera(1, CAMERA_FAR, this.cubemapResolution, this.cubemapOptions);
    const newRT = new THREE.WebGLCubeRenderTarget(
      this.cubemapResolution,
      this.cubemapOptions
    );
    newRT.texture.mapping = THREE.CubeReflectionMapping;
    const newCubeCamera = new THREE.CubeCamera(0.01, CAMERA_FAR, newRT);
    // this needs further checking
    // const newCubeCamera = new BoxProjectingCubeCamera(0.1, CAMERA_FAR, newRT)
    return newCubeCamera;
  }

  clearReflectionMaps(viewMode) {
    // console.log('clearing envmaps', this.baseTextures)

    switch (viewMode) {
      case VIEW3D_MODE_CAR:
        this.materialManager.setEnvTexture(ENV_CAR, this.baseTextures.car);
        break;
      case VIEW3D_MODE_LANDING:
        this.materialManager.setEnvTexture(
          ENV_LANDING,
          this.baseTextures.landing
        );
        break;
      default:
        console.error("Unknown viewmode for reflection base texture update");
        break;
    }
    // console.log('Cleared env maps:', this.baseTextures)
    // console.warn("Clearing is obsolete");
  }

  setBoxParameters() {
    // since landing area is constant for now, we can just adjust the car size and position
    const { depth, width, height } = CAR_SHAPES.find(
      (shape) => shape.id === (getCarShape() || CAR_SHAPE_DEEP)
    ) || { depth: 100, width: 100, height: 100 };
    const bpcemSize = { x: width, y: height, z: depth };
    const bpcemPos = { x: 0, y: height / 2, z: -depth / 2 };

    this.materialManager.boxProjectionData.carSize.value = bpcemSize;
    this.materialManager.boxProjectionData.carPosition.value = bpcemPos;
    // console.log("Set box params:", this.materialManager)
  }

  updateReflectionMaps(blueprint, viewMode, numberOfSteps = 1) {
    if (this.clearBeforeCapture) {
      this.clearReflectionMaps(viewMode);
      // this.materialManager.noEnvironmentMapping.value = true;
    }

    this.mirrorManager.setMirrorsQualityMode(false);

    this.setBoxParameters(viewMode);

    const updateStart = new Date().getTime();

    for (let i = 0; i < numberOfSteps; i++) {
      const { meshes = [], metadata = {} } = blueprint || {};
      const { view = VIEW3D_MODE_CAR } = metadata;
      const carShape = (
        meshes.find((item) => item && item.hasOwnProperty("carShape")) || {}
      ).carShape;
      const { depth = 210, height = 224 } =
        CAR_SHAPES.find((shape) => shape.id === carShape) || {};
      const cubeMapPos = new THREE.Vector3(0.01, height / 2, -depth / 2);

      // TODO: Set all landing visible

      // change scene background alpha to visible before ENV MAP is created to avoid black env map with transparent glass
      //this.renderer.setClearColor( 0xffffff, 1 );

      // update cubeCamera positions
      this.ccCar1.position.copy(cubeMapPos);
      this.ccCar2.position.copy(cubeMapPos);

      this.debuggingSphere.position.copy(cubeMapPos);

      // update cubeCameras (pingpong style)

      if (viewMode === VIEW3D_MODE_CAR || viewMode === VIEW3D_MODE_LANDING) {
        let texture;

        if (this.renderCar1) {
          this.ccCar1.update(this.renderer, this.scene);
          texture = this.ccCar1.renderTarget.texture;
        } else {
          this.ccCar2.update(this.renderer, this.scene);
          texture = this.ccCar2.renderTarget.texture;
        }

        this.debuggingSphere.material.envMap = texture;

        this.renderCar1 = !this.renderCar1;

        // update material envMap textures
        // this.mirrorManager.setMirrorsCubemap(texture);
        this.materialManager.setEnvTexture(ENV_CAR, texture);
      }
      if (viewMode === VIEW3D_MODE_LANDING) {
        let texture2;

        if (this.renderLanding1) {
          this.ccLanding1.update(this.renderer, this.scene);
          texture2 = this.ccLanding1.renderTarget.texture;
        } else {
          this.ccLanding2.update(this.renderer, this.scene);
          texture2 = this.ccLanding2.renderTarget.texture;
        }

        this.renderLanding1 = !this.renderLanding1;

        // update material envMap textures
        // this.mirrorManager.setMirrorsCubemap(texture2);
        this.materialManager.setEnvTexture(ENV_LANDING, texture2);
      }
      this.materialManager.noEnvironmentMapping.value = false;
    }
    // console.log('ending enving')
    this.mirrorManager.setMirrorsQualityMode(true);
    console.log(
      "Env map update",
      numberOfSteps,
      "steps in",
      new Date().getTime() - updateStart,
      "ms"
    );
  }
}

export default CubemapManager;
