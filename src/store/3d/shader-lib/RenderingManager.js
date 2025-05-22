import {DEFAULT_WIDTH, DEFAULT_HEIGHT} from './3d-constants'
import * as THREE from 'three';

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { SSAARenderPass } from "three/examples/jsm/postprocessing/SSAARenderPass";
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader'
import { GammaCorrectionShader } from "three/examples/jsm/shaders/GammaCorrectionShader";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { SeparableUnrealBloomPass } from './SeparableUnrealBloomPass'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { isMobile } from '../../../utils/device-utils';
import { CopyShader } from 'three/examples/jsm/shaders/CopyShader'
import { ClearPass } from 'three/examples/jsm/postprocessing/ClearPass'
import { TAARenderPass } from 'three/examples/jsm/postprocessing/TAARenderPass'

import SimpleCopyVertexShader from './utility-shaders/simple-copy-vert.glsl'
import BloomCombineFragShader from './utility-shaders/combine-bloom-frag.glsl'
import AlphaDebugFragmentShader from './utility-shaders/highlight-alpha-frag.glsl'


import { QUALITY_3D_HIGH, QUALITY_3D_MEDIUM, QUALITY_3D_LOW, SCENE_BACKGROUND_COLOR, RENDERER_TONE_MAPPING, RENDERER_TONE_MAPPING_EXPOSURE } from './3d-constants'

import { flipPixelArray } from './3d-utils'



export const RENDER_TYPE = {
    NO_POSTPROCESSING: "NO_POSTPROCESSING",
    COMPOSITE: "COMPOSITE",
    ONLY_BLOOM: "ONLY_BLOOM",
    NO_BLOOM: "NO_BLOOM"
};

const defaultBackground = SCENE_BACKGROUND_COLOR;
// const defaultBackground = new THREE.Color(0xFF0000);  // debugging color

export class RenderingManager {
    
    
    constructor(scene, camera, materialManager, mirrorManager, defaultQuality) {

        this.renderer = this.createRenderer();
        this.scene = scene;
        this.mainCamera = camera;

        this.currentQuality = defaultQuality;
        
        this.currentComposer = this.createComposer(this.currentQuality, THREE.HalfFloatType);
        this.opacityComposer = this.createOpacityComposer();
        
        const debugRT = new THREE.WebGLRenderTarget(DEFAULT_WIDTH, DEFAULT_HEIGHT)
        this.debugTextureComposer = new EffectComposer(this.renderer, debugRT);
        
         

        this.lastSize = {
            x: DEFAULT_WIDTH,
            y: DEFAULT_HEIGHT,
            pixelRatio: 1.0
        }
        this.materialManager = materialManager;
        this.currentComposer.enabled = true;
        this.renderer.autoClear = false;
        this.transparentBackground = false;
        this.mirrorManager = mirrorManager;
        this.dynamicAntialiasing = true;
        // this.renderer.setClearColor(SCENE_BACKGROUND_COLOR, 0);
        // this.scene.background = defaultBackground;
        //this.precompileMainShader(); // good idea but might need some promise hijinks
        console.log("Created renderingmanager, here are some stats:", this.renderer.capabilities, this)
    }

    hasDynamicAntialiasing(){
        // console.log(this.dynamicAntialiasing, this.currentComposer.taaPass)
        return this.dynamicAntialiasing && (this.currentComposer.taaPass !== undefined || this.currentComposer.ssaaPass !== undefined);
    }

    getAntialiasQuality(){
        return this.currentComposer.taaPass.sampleLevel;
    }

    getAntialiasLimits(){
        return { min: this.currentComposer.taaPass.minSampleLevel, max: this.currentComposer.taaPass.maxSampleLevel }
    }

    setAntialiasQuality(level){
        if (this.currentComposer.taaPass) this.currentComposer.taaPass.sampleLevel = level;
        if (this.currentComposer.ssaaPass) this.currentComposer.ssaaPass.sampleLevel = level;
        // console.log('set aa to', level)        
    }

    changeCamera(camera){
        // console.log("camera change");
        // change the camera from regular to target
        if (this.bloomComposer){
            this.bloomComposer.passes.forEach(element => {
                if (element.camera !== undefined){
                    element.camera = camera;
                    // console.log("camera change", element.camera.position, element.camera.rotation);
                }
            });
        }
        this.opacityComposer.passes.forEach(element => {
            if (element.camera !== undefined){
                element.camera = camera;
                // console.log("camera change", element, element.camera.position, element.camera.rotation);
            }
        });
        this.currentComposer.passes.forEach(element => {
            if (element.camera !== undefined){
                element.camera = camera;
                // console.log("camera change", element, element.camera.position, element.camera.rotation);
            }
        });
    }

    renderImage(readyCallback, camera = undefined){
        if (camera === undefined){
            camera = this.mainCamera
        }

        this.changeCamera(camera);

        // this.bloomComposer.camera
        this.scene.background = null;
        //const startTime = new Date().getTime();
        this.renderBloomPass();
        const colorBuffer = this.getPixelBuffer(this.currentComposer);
        this.materialManager.opacityToR.value = true;
        const alphaBuffer = this.getPixelBuffer(this.opacityComposer);
        this.materialManager.opacityToR.value = false;
        // which is better?
        /*
        const w = this.currentComposer.writeBuffer.width;
        const h = this.currentComposer.writeBuffer.height;
        */
        const w = this.renderer.domElement.width;
        const h = this.renderer.domElement.height;

        const combinedBuffer = this.combinePixelBuffers(colorBuffer, alphaBuffer, w, h);
        const dataUrl = this.createImageUrlFromBuffer(combinedBuffer, w, h);
        //console.log('Created dataurl in', (endTime - startTime), 'ms')
        this.scene.background = defaultBackground;
        this.changeCamera(this.mainCamera);
        readyCallback(dataUrl);
    }


    combinePixelBuffers(baseBuffer, secondaryBuffer, width, height){
        const combinedBuffer = new Uint8Array(width * height * 4);
        // loop the buffer, inserting values on the run
        for(let i = 0; i < baseBuffer.length; i += 4){
            combinedBuffer[i + 0] = baseBuffer[i + 0]; // R
            combinedBuffer[i + 1] = baseBuffer[i + 1]; // G
            combinedBuffer[i + 2] = baseBuffer[i + 2]; // B
            combinedBuffer[i + 3] = secondaryBuffer[i + 0]; // A
        }
        //this.currentComposer.renderer.domElement.getContext().getImageData()
        //console.log("Combined imagedata", combinedBuffer);
        return combinedBuffer;

    }

    createImageUrlFromBuffer(buffer, width, height){
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const imgData = context.createImageData(width, height);

        canvas.width = width;
        canvas.height = height;

        // loop the buffer, inserting values on the run
        for(let i = 0; i < buffer.length; i += 4){
            imgData.data[i + 0] = buffer[i + 0]; // R
            imgData.data[i + 1] = buffer[i + 1]; // G
            imgData.data[i + 2] = buffer[i + 2]; // B
            imgData.data[i + 3] = buffer[i + 3]; // A
        }
        //this.currentComposer.renderer.domElement.getContext().getImageData()
        context.putImageData(imgData, 0, 0)
        //context.drawImage();
        // canvas.toDataURL()
        return canvas.toDataURL();
    }

    createImageUrlFromRendertarget(rt){
        const buffer = this.getPixels(rt)
        return this.createImageUrlFromBuffer(buffer, rt.width, rt.height)
    }

    // create a quad, let the camera see it, compile shader and dispose of the quad
    precompileMainShader(){
        const dummyQuad = new THREE.PlaneGeometry();
        const mainMaterial = this.materialManager.createDefaultMaterial();
        const mesh = new THREE.Mesh(dummyQuad, mainMaterial);
        this.scene.add(mesh);
        this.compileShaders();
    }

    
  compileShaders(){
      const shadersAtStart = this.renderer.info.programs.length;
      this.renderer.compile(this.scene, this.mainCamera);
      const newShaders = this.renderer.info.programs.length - shadersAtStart;
      if (newShaders > 0){
          console.log('Compiled', newShaders, 'new shaders');
      }
  }

    renderBloomPass(){
        if (this.bloomComposer !== undefined){
            this.mirrorManager.showMirrors(false);
                this.materialManager.emissionOnly.value = true;
                this.scene.background = null
                this.bloomComposer.render();
                this.materialManager.emissionOnly.value = false;
                this.mirrorManager.showMirrors(true);
        }
    }


    renderToScreen(debug = false){
        
        const targetComposer = this.currentComposer
        
        //this.transparentBackground = false;
        // console.log('Set pixelratio to', this.renderer.getPixelRatio());
        this.renderBloomPass();
        this.scene.background = defaultBackground
        //this.scene.background = null
        targetComposer.render();
        if (debug) console.log("Development render call");
    }

    setQuality(qualityLevel){
        console.log("Setting quality to", qualityLevel);
        this.currentQuality = qualityLevel;
        
        this.currentComposer = this.createComposer(qualityLevel, THREE.HalfFloatType);
        this.opacityComposer = this.createOpacityComposer();

        this.setSize(this.lastSize.x, this.lastSize.y);
        // is the old one garbage collected or something?
        
    }

    createOpacityComposer(){
        const renderTargetParameters = {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat,
            type: THREE.UnsignedByteType
        }
        const opacityRenderTarget = new THREE.WebGLRenderTarget(DEFAULT_WIDTH, DEFAULT_HEIGHT, renderTargetParameters)
        const opacityComposer = new EffectComposer(this.renderer, opacityRenderTarget);
        opacityComposer.name = "opacityComposer"
        const renderPass = new RenderPass(this.scene, this.mainCamera);
        renderPass.name = 'Render pass'
        opacityComposer.renderPass = renderPass;
        const ssaaPass = new SSAARenderPass(this.scene, this.mainCamera)
        ssaaPass.name = 'SSAA pass'
        opacityComposer.ssaaPass = ssaaPass;
        opacityComposer.ssaaPass.enabled = true;
        opacityComposer.addPass(opacityComposer.renderPass);
        opacityComposer.addPass(opacityComposer.ssaaPass);
        return opacityComposer;
    }


    createComposer(qualityLevel, type, snapshot){
        const renderTargetParameters = {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat,
            // stencilBuffer: true,
            // type: THREE.HalfFloatType // float was a bit overkill
            // type: THREE.UnsignedShort4444Type
            type: type
        }

        // these are common for all:
        const clearPass = new ClearPass(0xff0000, 0.0);
        clearPass.clear = true;
        clearPass.name = 'Clear pass'
        const renderPass = new RenderPass(this.scene, this.mainCamera);
        renderPass.name = 'Render pass'
        const copyPass = new ShaderPass(CopyShader);
        copyPass.name = 'Copy pass'
        const fxaaPass = new ShaderPass(FXAAShader);
        fxaaPass.name = 'Fxaa pass'
        const taaPass = new TAARenderPass(this.scene, this.mainCamera)
        taaPass.name = 'Taa pass'
        taaPass.enabled = false; // taa was a bit unneccessary
        // taaPass.accumulate = true;
        
        const ssaaPass = new SSAARenderPass(this.scene, this.mainCamera)
        ssaaPass.sampleLevel = 1;
        ssaaPass.minSampleLevel = 1;
        ssaaPass.maxSampleLevel = 1;
        // taaPass.accumulate = true;
        // ssaaPass.enabled = !snapshot;
        // ssaaPass.enabled = false; // broke
        ssaaPass.name = 'SSAA pass'
        
        fxaaPass.enabled = false; // this looked like horseshit most of the time
        renderPass.clearAlpha = 0.0;
        renderPass.clearColor = new THREE.Color(0, 256, 256);
        renderPass.clear = true;
        // renderPass.clear = false;
        const gammaCorrectionPass = new ShaderPass(GammaCorrectionShader);
        gammaCorrectionPass.name = 'Gamma correction pass'

        // these could be removed outside of devenv
        const alphaDebugPass = new ShaderPass(
            new THREE.ShaderMaterial({
                uniforms: {
                    baseTexture: { value: null },
                    // bloomTexture: { value: highQualityComposer.bloomComposer.renderTarget2.texture }
                },
                vertexShader: SimpleCopyVertexShader,
                fragmentShader: AlphaDebugFragmentShader,
                defines: {}
            }), "baseTexture"
        );
        alphaDebugPass.enabled = false;
        alphaDebugPass.name = 'Alpha debug pass'

        const checkerboardAlphaPass = new ShaderPass(
            new THREE.ShaderMaterial({
                vertexShader: SimpleCopyVertexShader,
                fragmentShader: AlphaDebugFragmentShader,
                defines: {},
                transparent: true
            })
        );
        checkerboardAlphaPass.enabled = false;
        checkerboardAlphaPass.name = 'Checkerboard Alpha debug pass'

        let newComposer = null;
        switch (qualityLevel) {
            case QUALITY_3D_HIGH:

                // renderTargetParameters.samples = 1;

                const bloomRtParameters = {
                    minFilter: THREE.LinearFilter,
                    magFilter: THREE.LinearFilter,
                    format: THREE.RGBAFormat,
                    stencil: false,
                    // samples: 4, // samples don't matter
                    // type: THREE.HalfFloatType // float was a bit overkill
                    // type: THREE.UnsignedShort4444Type
                    type: type
                }

                // this.renderer.clear = false;

                const highRenderTarget = new THREE.WebGLRenderTarget(DEFAULT_WIDTH, DEFAULT_HEIGHT, renderTargetParameters)
                highRenderTarget.samples = renderTargetParameters.samples;
                
                const bloomRenderTarget = new THREE.WebGLRenderTarget(DEFAULT_WIDTH, DEFAULT_HEIGHT, bloomRtParameters)
                bloomRenderTarget.samples = 4; // redundant in a way
                const highQualityComposer = new EffectComposer(this.renderer, highRenderTarget);
                highQualityComposer.name = "highQualityComposer"
                // highQualityComposer.renderTarget
                
                this.bloomComposer = new EffectComposer(this.renderer, bloomRenderTarget );
                this.bloomComposer.name = "bloomComposer"

                highQualityComposer.clearPass = clearPass;
                highQualityComposer.renderPass = renderPass;
                // renderPass.enabled = false; // TAA is used for rendering
                highQualityComposer.fxaaPass = fxaaPass;
                highQualityComposer.taaPass = taaPass;
                taaPass.sampleLevel = 4;
                taaPass.minSampleLevel = 2;
                taaPass.maxSampleLevel = 4;
                highQualityComposer.ssaaPass = ssaaPass;
                ssaaPass.sampleLevel = 4;
                ssaaPass.minSampleLevel = 2;
                ssaaPass.maxSampleLevel = 4;
                highQualityComposer.alphaDebugPass = alphaDebugPass;
                highQualityComposer.checkerboardAlphaDebugPass = checkerboardAlphaPass;

                this.bloomComposer.bloomPass = new SeparableUnrealBloomPass(
                    new THREE.Vector2(DEFAULT_WIDTH, DEFAULT_HEIGHT), 1.5, 0.5, 0)


                highQualityComposer.gammaCorrectionPass = gammaCorrectionPass;
                highQualityComposer.combinePass = new ShaderPass(
                    new THREE.ShaderMaterial({
                        uniforms: {
                            baseTexture: { value: null },
                            bloomTexture: { value: this.bloomComposer.renderTarget2.texture }
                        },
                        vertexShader: SimpleCopyVertexShader,
                        fragmentShader: BloomCombineFragShader,
                        defines: {},
                        name: "CombinePass"
                    }), "baseTexture"
                );

                highQualityComposer.combinePass.name = 'Combine pass'

                
                // these could be removed outside of devenv
                highQualityComposer.bloomDebugPass = new ShaderPass(
                    new THREE.ShaderMaterial({
                        uniforms: {
                            baseTexture: { value: this.bloomComposer.renderTarget2.texture },
                        },
                        vertexShader: SimpleCopyVertexShader,
                        fragmentShader: AlphaDebugFragmentShader,
                        defines: {},
                        name: "BloomDebugPass"
                    })
                );
                highQualityComposer.bloomDebugPass.enabled = false;
                highQualityComposer.bloomDebugPass.name = 'Bloom debug pass'

                highQualityComposer.combinePass.needsSwap = true;

                this.bloomComposer.addPass(highQualityComposer.renderPass);
                this.bloomComposer.addPass(this.bloomComposer.bloomPass);
                this.bloomComposer.renderToScreen = false;
                highQualityComposer.copyPass = copyPass;

                highQualityComposer.addPass(highQualityComposer.clearPass);
                highQualityComposer.addPass(highQualityComposer.renderPass);
                if (!snapshot){
                    highQualityComposer.addPass(highQualityComposer.taaPass);
                    highQualityComposer.addPass(highQualityComposer.ssaaPass);
                }
                highQualityComposer.addPass(highQualityComposer.fxaaPass);
                highQualityComposer.addPass(highQualityComposer.gammaCorrectionPass);
                highQualityComposer.addPass(highQualityComposer.combinePass)
                highQualityComposer.addPass(highQualityComposer.alphaDebugPass);
                highQualityComposer.addPass(highQualityComposer.bloomDebugPass);
                highQualityComposer.addPass(highQualityComposer.checkerboardAlphaDebugPass);                
                highQualityComposer.addPass(highQualityComposer.copyPass);
                // highQualityComposer.finalPass.renderToScreen = true;
                newComposer = highQualityComposer;
                break;
            case QUALITY_3D_MEDIUM:

                // renderTargetParameters.samples = 1;
                const mediumRenderTarget = new THREE.WebGLRenderTarget(DEFAULT_WIDTH, DEFAULT_HEIGHT, renderTargetParameters)
                // const mediumRenderTarget = new THREE.WebGLMultisampleRenderTarget(DEFAULT_WIDTH, DEFAULT_HEIGHT, renderTargetParameters)
                mediumRenderTarget.samples = renderTargetParameters.samples;
                const mediumQualityComposer = new EffectComposer(this.renderer, mediumRenderTarget);
                mediumQualityComposer.clearPass = clearPass;
                mediumQualityComposer.renderPass = renderPass;
                // renderPass.enabled = false; // TAA is used for rendering
                mediumQualityComposer.name = "mediumQualityComposer"

                mediumQualityComposer.fxaaPass = fxaaPass;
                mediumQualityComposer.taaPass = taaPass;
                taaPass.sampleLevel = 2;
                taaPass.minSampleLevel = 1;
                taaPass.maxSampleLevel = 3;
                mediumQualityComposer.ssaaPass = ssaaPass;
                ssaaPass.sampleLevel = 2;
                ssaaPass.minSampleLevel = 1;
                ssaaPass.maxSampleLevel = 2;
                mediumQualityComposer.gammaCorrectionPass = gammaCorrectionPass;
                mediumQualityComposer.copyPass = copyPass;

                mediumQualityComposer.addPass(mediumQualityComposer.clearPass);
                mediumQualityComposer.addPass(mediumQualityComposer.renderPass);
                if (!snapshot){
                    mediumQualityComposer.addPass(mediumQualityComposer.taaPass);
                    mediumQualityComposer.addPass(mediumQualityComposer.ssaaPass);
                }
                mediumQualityComposer.addPass(mediumQualityComposer.fxaaPass);
                mediumQualityComposer.addPass(mediumQualityComposer.gammaCorrectionPass);
                mediumQualityComposer.addPass(mediumQualityComposer.copyPass);

                newComposer = mediumQualityComposer;
                break;
            case QUALITY_3D_LOW:

                // virtually identical but without multisampling, using fxaa for webgl1
                const lowRenderTarget = new THREE.WebGLRenderTarget(DEFAULT_WIDTH, DEFAULT_HEIGHT, renderTargetParameters)
                const lowQualityComposer = new EffectComposer(this.renderer, lowRenderTarget);
                lowQualityComposer.name = "lowQualityComposer"
                lowQualityComposer.clearPass = clearPass;
                lowQualityComposer.renderPass = renderPass;
                lowQualityComposer.fxaaPass = fxaaPass;
                lowQualityComposer.fxaaPass.enabled = true;
                lowQualityComposer.gammaCorrectionPass = gammaCorrectionPass;
                lowQualityComposer.copyPass = copyPass;

                lowQualityComposer.addPass(lowQualityComposer.clearPass);
                lowQualityComposer.addPass(lowQualityComposer.renderPass);
                lowQualityComposer.addPass(lowQualityComposer.fxaaPass);
                lowQualityComposer.addPass(lowQualityComposer.gammaCorrectionPass);
                lowQualityComposer.addPass(lowQualityComposer.copyPass);
                newComposer = lowQualityComposer;
                break;
            default:
                console.error("Unknown quality level:", qualityLevel)
                break;
        }
        renderTargetParameters.type = THREE.UnsignedByteType
        newComposer.snapshotRT = new THREE.WebGLRenderTarget(DEFAULT_WIDTH, DEFAULT_HEIGHT, renderTargetParameters);
        switch (qualityLevel) {
            case QUALITY_3D_LOW:
                break;
            default:
                newComposer.snapshotRT.samples = 5;
                break;
        }
        // console.log('new composer:', newComposer)
        return newComposer;
    }

    setSize(x, y){
        this.renderer.setSize(x, y);
        this.currentComposer.setSize(x, y);
        this.opacityComposer.setSize(x, y);
        if (this.currentComposer.fxaaPass !== undefined){
            this.currentComposer.fxaaPass.uniforms['resolution'].value.x = 1 / ( x );
            this.currentComposer.fxaaPass.uniforms['resolution'].value.y = 1 / ( y );
        }
        if (this.opacityComposer.fxaaPass !== undefined){
            this.opacityComposer.fxaaPass.uniforms['resolution'].value.x = 1 / ( x );
            this.opacityComposer.fxaaPass.uniforms['resolution'].value.y = 1 / ( y );
        }
        //console.log("Set new size for rendering manager ", this.currentComposer)
        this.lastSize.x = x;
        this.lastSize.y = y;
    }


    getStack(){
        const stack = []

        for (let index = 0; index < this.currentComposer.passes.length; index++) {
            const element = this.currentComposer.passes[index];
            if (element.enabled){
                stack.push(element.name)
            }
            // console.log(element)
        }
        return { names: stack.join(', '), values: this.currentComposer };
    }
    

  createRenderer(options) {

    if (isMobile) {
      options = { antialias: true, alpha: true, precision: "highp", preserveDrawingBuffer: true, ...options }
    } else {
      options = { antialias: true, alpha: true, preserveDrawingBuffer: true, ...options }
    }

    
    const renderer = new THREE.WebGLRenderer({
        options
    })
    
    renderer.toneMapping = RENDERER_TONE_MAPPING
    renderer.toneMappingExposure = RENDERER_TONE_MAPPING_EXPOSURE

    // removed from threejs
    // renderer.toneMappingWhitePoint = RENDERER_TONE_MAPPING_WHITE_POINT

    renderer.localClippingEnabled = true
    renderer.setSize(DEFAULT_WIDTH, DEFAULT_HEIGHT)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setClearAlpha(0);
    // Initial scene background with visible alpha

    // this should speed up compilation, verbose for clarity
    // use this if shaders seem to go haywire
    /*
    if (process.env.NODE_ENV === 'production'){
        renderer.debug.checkShaderErrors = false;
    } else {
        console.log(process.env.NODE_ENV, "Dev setup: checking shader errors")
        renderer.debug.checkShaderErrors = true;
    }
    */
    
    return renderer
  }

    renderDebugSnapshot(){
        const originalRenderState = this.currentComposer.renderToScreen;
        const canvas = this.currentComposer.renderer.domElement;
        this.currentComposer.render();

        const mainDataUrl = canvas.toDataURL();
        this.currentComposer.renderToScreen = originalRenderState;
        return mainDataUrl;
    }

    printDebugPixelArray(){
        const buffer = this.getPixelBuffer(this.currentComposer);
        console.log(buffer);
    }

    bufferToBase64(buffer){
        const b64 = Buffer.from(buffer).toString('base64');
        return b64;
    }

    getPixelBuffer(composer){
        const canvas = composer.renderer.domElement;
        const w = canvas.width;
        const h = canvas.height;
        
        let gl = composer.renderer.getContext();
        let renderTargetPixelBuffer = new Uint8Array(w * h * 4);
        composer.render();
        
        gl.readPixels(0,0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, renderTargetPixelBuffer);
        flipPixelArray(renderTargetPixelBuffer, w, h);
        return renderTargetPixelBuffer;
    }
}

export default RenderingManager;