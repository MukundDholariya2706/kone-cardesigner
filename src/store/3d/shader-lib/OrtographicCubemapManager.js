import * as THREE from 'three';
import SimpleRawVertexShader from './shader-lib/utility-shaders/simple-raw-3d-vert-glsl'
import CubeHelperFragmentShader from './shader-lib/utility-shaders/cube-texture-helper-frag-glsl'
import WorldNormalShader from './shader-lib/utility-shaders/draw-world-normals-frag.glsl'

import { CUBE_CAMERA_RESOLUTION } from './3d-constants'
import {
    LANDING_CUBE_MAP_POSITION,
    CAR_SHAPES, ENV_CAR, ENV_LANDING, LANDING_CUBE_MAP_SIZE, CAR_SHAPE_DEEP
} from '../../constants'
import { getCarShape } from '../blueprint/BlueprintProvider';
import { OrthographicCubeCamera } from './OrthographicCubeCamera';


/// this class can be used to render various cubemaps, future use could be rendering specific data maps
export class OrtographicCubemapManager {

    constructor(scene, renderer, materialManager, mirrorManager, regularCubeManager) {

        this.scene = scene;
        this.renderer = renderer;
        this.materialManager = materialManager;


        this.debug = {
            showRoughness: false,
            showOldCube: false,
            showCameraFrustums: false,
            showNormals: false,
        }

        /*
        this.debug.material = new THREE.MeshPhysicalMaterial({
            color: 0xFFFFFF,
            metalness: 1,
            roughness: 0,
            envMap: regularCubeManager.ccCar1.renderTarget.texture
        })
        */

        //this.debug.showRoughness = false;
        this.debug.carMaterial = new THREE.ShaderMaterial(
            {
                vertexShader: SimpleRawVertexShader,
                fragmentShader: CubeHelperFragmentShader,
                uniforms: {
                    cubemap: { value: null },
                    roughness: { value: 0.0 },
                    maxMIPLevel: { value: 10 },
                    filterR: { value: false },
                    filterG: { value: false },
                    filterB: { value: false },
                },
                name: "DebugCarMaterial"
            }
        );
        this.debug.landingMaterial = new THREE.ShaderMaterial(
            {
                vertexShader: SimpleRawVertexShader,
                fragmentShader: CubeHelperFragmentShader,
                uniforms: {
                    cubemap: { value: null },
                    roughness: { value: 0.0 },
                    maxMIPLevel: { value: 10 },
                    filterR: { value: false },
                    filterG: { value: false },
                    filterB: { value: false },
                },
                name: "DebugLandingMaterial"
            }            
        );
        this.debug.defaultMapMaterial = new THREE.ShaderMaterial(
            {
                vertexShader: SimpleRawVertexShader,
                fragmentShader: CubeHelperFragmentShader,
                uniforms: {
                    cubemap: { value: null },
                    roughness: { value: 0.0 },
                    maxMIPLevel: { value: 10 },
                    filterR: { value: false },
                    filterG: { value: false },
                    filterB: { value: false },
                },
                name: "DebugMapMaterial"
            }
        );

        this.debug.carMaterial.side = THREE.BackSide;
        this.debug.landingMaterial.side = THREE.BackSide;
        this.debug.defaultMapMaterial.side = THREE.BackSide;
        //this.debug.textureHelper = this.createTextureHelper();
        this.debug.textureHelper = {
            car: this.createDebuggingCube(this.debug.carMaterial),
            landing: this.createDebuggingCube(this.debug.landingMaterial),
            debug: this.createDebuggingCube(this.debug.carMaterial.clone()),
            //defaultSphere: this.createDebuggingSphere(this.debug.defaultMapMaterial)
        }
        scene.add(this.debug.textureHelper.car);
        scene.add(this.debug.textureHelper.landing);
        scene.add(this.debug.textureHelper.debug);
        //scene.add(this.debug.textureHelper.defaultSphere);

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
            stencilBuffer: false
        }
        this.cubemapResolution = CUBE_CAMERA_RESOLUTION;
        this.clearBeforeCapture = true;
        this.baseTextures = {
            car: null,
            landing: null
        }

        this.mirrorManager = mirrorManager;
        this.cameras = {
            car: {
                diffuseCamera: this.createCamera('Car diffuse camera'),
                ormCamera: this.createCamera('Car ORM camera'),
                normalCamera: this.createCamera('Car normal camera'),
            },
            landing: {
                diffuseCamera: this.createCamera('Landing diffuse camera'),
                ormCamera: this.createCamera('Landing ORM camera'),
                normalCamera: this.createCamera('Landing normal camera'),
            }
        }

        this.carStandardCamera = this.createStandardCamera('Car standard camera');
        this.landingStandardCamera = this.createStandardCamera('Landing standard camera');

        Object.values(this.cameras.landing).forEach(element => {
            element.setTransformParameters(this.materialManager.boxProjectionData.landingSize.value, this.materialManager.boxProjectionData.landingPosition.value);
        });
        const debugScaleFactor = 0.75;
        this.debug.textureHelper.landing.scale.set(LANDING_CUBE_MAP_SIZE[0] * debugScaleFactor, LANDING_CUBE_MAP_SIZE[1] * debugScaleFactor, LANDING_CUBE_MAP_SIZE[2] * debugScaleFactor);
        this.debug.textureHelper.landing.position.set(LANDING_CUBE_MAP_POSITION[0], LANDING_CUBE_MAP_POSITION[1], LANDING_CUBE_MAP_POSITION[2]);

        //this.debug.textureHelper.defaultSphere.position.set();

        this.defaultNormalCamera = this.createCamera();

        //this.debug.material.uniforms.cubemap.value = regularCubeManager.ccCar1.renderTarget.texture;
        this.debug.carMaterial.uniforms.cubemap.value = this.cameras.car.diffuseCamera.lastUpdatedTarget.texture;
        this.debug.landingMaterial.uniforms.cubemap.value = this.cameras.landing.diffuseCamera.lastUpdatedTarget.texture;

        this.debug.textureHelper.car.visible = false;
        this.debug.textureHelper.landing.visible = false;
        this.debug.textureHelper.debug.visible = false;
        //this.debug.textureHelper.defaultSphere.visible = false;
        Object.values(this.cameras.car.diffuseCamera.cameraHelpers).forEach(element => {
            scene.add(element);
        });
        Object.values(this.cameras.landing.diffuseCamera.cameraHelpers).forEach(element => {
            scene.add(element);
        });
        this.showCameraHelpers(false);
        this.captureDefaultNormals();
        //this.pmrem = new PMREMGenerator(renderer);

        // don't allocate for now
        //this.customMipmapGenerator = new CustomMipmapGenerator(renderer, scene, this.cameras.car.diffuseCamera.lastUpdatedTarget.texture);
        //this.customMipmapGenerator.testCubeMap.value = this.cameras.car.diffuseCamera.lastUpdatedTarget.texture;
        // console.log('created custom cubemapmanager', this)
    }

    createCamera(name) {
        const camera = new OrthographicCubeCamera(0.1, 1000, CUBE_CAMERA_RESOLUTION, this.cubemapOptions);
        camera.name = name;
        return camera;
    }

    createStandardCamera(name){
        const cubeRenderTarget = new THREE.WebGLCubeRenderTarget( CUBE_CAMERA_RESOLUTION, { generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter } );        
        const camera = new THREE.CubeCamera(0.1, 1000, cubeRenderTarget);
        camera.name = name;
        return camera;
    }

    // put a cube on the last layer to limit visibility
    captureDefaultNormals(){
        const defaultCube = this.createDefaultNormalCube();
        this.scene.add(defaultCube);
        this.defaultNormalCamera.update(this.renderer, this.scene);
        //this.defaultNormalCamera.cameraHelpers.ny.visible = true;
        this.materialManager.defaultNormalCubemap.value = this.defaultNormalCamera.texture;


        this.defaultNormalCamera.layers.disableAll();
        this.defaultNormalCamera.layers.enable(31);
        defaultCube.layers.disableAll();
        defaultCube.layers.enable(31);
    }

    createDefaultNormalCube() {
        const geometry = new THREE.BoxGeometry(100, 100, 100);
        const defaultCubeMaterial = new THREE.ShaderMaterial(
            {
                vertexShader: SimpleRawVertexShader,
                fragmentShader: WorldNormalShader,
                side: THREE.BackSide,
                name: "DefaultNormalCube"
            });
        const envCube = new THREE.Mesh(geometry, defaultCubeMaterial);
        envCube.userData = {
            locked: true
        }
        return envCube;
    }

    createDebuggingSphere(material) {
        const geometry = new THREE.SphereGeometry(50, 32, 32); // scale this up with the car
        const envSphere = new THREE.Mesh(geometry, material);
        envSphere.userData = {
            locked: true
        }
        return envSphere;
    }

    createDebuggingCube(material) {
        // does this actually default to deep always?
        const { depth, width, height } =
            CAR_SHAPES.find(shape => shape.id === (getCarShape() || CAR_SHAPE_DEEP)) ||
            { depth: 100, width: 100, height: 100 }
        const geometry = new THREE.BoxGeometry(1, 1, 1); // scale this up with the car
        const envCube = new THREE.Mesh(geometry, material)
        envCube.userData = {
            locked: true
        }
        return envCube;
    }

    showCameraHelper(helperId, show) {
        this.cameras.carCamera.cameraHelpers[helperId].visible = show;
    }

    showCameraHelpers(show) {
        const carHelpers = this.cameras.car.diffuseCamera.cameraHelpers;
        const landingHelpers = this.cameras.landing.diffuseCamera.cameraHelpers;
        Object.values(carHelpers).forEach(element => {
            element.visible = show;
        });
        Object.values(landingHelpers).forEach(element => {
            element.visible = show;
        });
    }

    setBoxParameters() {
        // since landing area is constant for now, we can just adjust the car size and position
        const { depth, width, height } = CAR_SHAPES.find(shape => shape.id === (getCarShape() || CAR_SHAPE_DEEP)) || { depth: 100, width: 100, height: 100 }
        const bpcemSize = { x: width, y: height, z: depth };
        const bpcemPos = { x: 0, y: height / 2, z: -depth / 2 }

        //console.log(bpcemSize, bpcemPos);
        this.materialManager.boxProjectionData.carSize.value = bpcemSize;
        this.materialManager.boxProjectionData.carPosition.value = bpcemPos;

        const debugScaleFactor = 0.75;
        this.debug.textureHelper.car.position.set(
            bpcemPos.x, bpcemPos.y, bpcemPos.z
        );
        /*
        this.debug.textureHelper.defaultSphere.position.set(
            bpcemPos.x, bpcemPos.y, bpcemPos.z
        );
        */
        this.debug.textureHelper.car.scale.set(bpcemSize.x * debugScaleFactor, bpcemSize.y * debugScaleFactor, bpcemSize.z * debugScaleFactor);
        Object.values(this.cameras.car).forEach(element => {
            element.setTransformParameters(bpcemSize, bpcemPos);
        });
        
    }

    updateRoughnessMaps() {
        this.materialManager.ormOnly.value = true;
        this.cameras.car.ormCamera.update(this.renderer, this.scene);
        this.cameras.landing.ormCamera.update(this.renderer, this.scene);
        this.materialManager.ormOnly.value = false;
    }

    updateReflectionMaps() {
        this.materialManager.diffuseOnly.value = true;
        this.cameras.car.diffuseCamera.update(this.renderer, this.scene);
        this.cameras.landing.diffuseCamera.update(this.renderer, this.scene);
        this.materialManager.diffuseOnly.value = false;
    }

    updateNormalMaps() {
        this.materialManager.normalOnly.value = true;
        this.cameras.car.normalCamera.update(this.renderer, this.scene);
        this.cameras.landing.normalCamera.update(this.renderer, this.scene);
        this.materialManager.normalOnly.value = false;
    }

    updateMaps() {
        this.setBoxParameters();
        const hadRealtimeReflections = this.mirrorManager.realtimeReflections;
        this.mirrorManager.setMirrorsQualityMode(false);
        this.updateRoughnessMaps();
        this.updateNormalMaps();
        this.updateReflectionMaps();
        
        this.debug.carMaterial.uniforms.cubemap.value = this.cameras.car.diffuseCamera.lastUpdatedTarget.texture;
        this.debug.landingMaterial.uniforms.cubemap.value = this.cameras.landing.diffuseCamera.lastUpdatedTarget.texture;

        this.materialManager.setOrthoEnvTextures(ENV_CAR, this.cameras.car.diffuseCamera.texture, this.cameras.car.ormCamera.texture, this.cameras.car.normalCamera.texture);
        this.materialManager.setOrthoEnvTextures(ENV_LANDING, this.cameras.landing.diffuseCamera.texture, this.cameras.landing.ormCamera.texture, this.cameras.landing.normalCamera.texture);
        this.materialManager.standardCarEnvTexture.value = this.carStandardCamera.renderTarget.texture;
        
        this.mirrorManager.setMirrorsQualityMode(hadRealtimeReflections);
        this.carStandardCamera.update(this.renderer, this.scene);
        this.debug.defaultMapMaterial.uniforms.cubemap.value = this.carStandardCamera.renderTarget.texture;
        //console.log("Custom cubemap update in", endTime - startTime, " ms");
    }
}

export default OrtographicCubemapManager;