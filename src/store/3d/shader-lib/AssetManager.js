
import EventEmitter from 'events';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { TEXTURE_ANISOTROPY } from './3d-constants';
import hash from 'object-hash';
import { sliceMesh } from "./3d-utils";

const JOBS_CONCURRENCY = 20; // ms

const JOB_TYPE_LOAD_MODEL = 'JOB_TYPE_LOAD_MODEL';
const JOB_TYPE_LOAD_TEXTURE = 'JOB_TYPE_LOAD_TEXTURE';
const JOB_STATE_IN_QUEUE = 'JOB_STATE_IN_QUEUE';
const JOB_STATE_PROCESSING = 'JOB_STATE_PROCESSING';
const JOB_STATE_READY = 'JOB_STATE_READY';
const JOB_STATE_FAILED = 'JOB_STATE_FAILED';
const JOB_STATE_INVALID_JOB = 'JOB_STATE_INVALID_JOB';

class AssetManager extends EventEmitter {
  constructor() {
    super()
    this.models = []
    this.textures = []
    this.jobs = []
    this.runningQueue = false
    this.isComplete = false
   
    this.fbxLoader = new FBXLoader();
    this.textureLoader = new THREE.TextureLoader();
    this.cubeTextureLoader = new THREE.CubeTextureLoader();
    this.assetLoadTimes = {
      textures: 0,
      meshes: 0
    }

    // Sometimes fbxLoader flips firstly loaded model.
    // Especially when fbx file is small.
    // Quick fix: Load empty file at startup.
    this.fbxLoader.load('general/empty.fbx', ()=>{return});
  }

  hasModel(id) {
    return id !== undefined && this.models !== undefined && this.models.length > 0 && this.models.find(item => item.id === id) !== undefined
  }

  hasTexture(id) {
    return id !== undefined && this.textures !== undefined && this.textures.length > 0 && this.textures.find(item => item.id === id) !== undefined
  }

  hasJob(id) {
    return id !== undefined && this.jobs !== undefined &&  this.jobs.length > 0 && this.jobs.find(item => item.id === id) !== undefined
  }
  
  clearTextures() {
    while(this.textures.length) {
      const texture = this.textures.pop()
      texture.data.dispose()
      delete texture.data
    }
  }

  /**
   * Adds new model to store
   * @param {*} model 
   */
  addModel(model) {
    if (!model || (model && !model.id)) return
    if (!this.hasModel(model.id)) {
      this.models.push(model)
    }
  }

  /**
   * Returns mesh (clone) by model and meshName.
   * If intersectBox is defined given mesh is sliced.
   * @param {*} modelId 
   * @param {*} meshName 
   * @param {*} intersectBox 
   */
  getMesh(modelId, meshName, intersectBox = null) {
    if (!modelId || !meshName) {
      return undefined
    }

    const { data } = this.models.find(item => item.id === modelId) || {};

    if (!data) {
      return undefined
    }
    
    let result = undefined

    data.traverse(node => {
      if ( node instanceof THREE.Mesh ) {
        if (!result && node.name === meshName) {
          if (intersectBox) {
            result = sliceMesh(node, intersectBox)
          } else {
            result = node.clone()
          }
          return
        }
      }
    });

    return result
  }

  addTexture(texture) {
    if (!texture) {
      return;
    }
    const { id, data, ...options } = texture
    
    if (id && data && !this.hasTexture(id)) {
      data.name = id;
      this.updateTexture(data, options)
      this.textures.push(texture);
    } else {
      //console.info('texture allready exists', texture)
    }
  }

  updateTexture(texture, options) {
    if (!texture) {
      return
    }

    const { wrapS, wrapT, rotation, repeat, offset, encoding, mapping, anisotropy = TEXTURE_ANISOTROPY } = options || {}

    !isNaN(wrapS) && (texture.wrapS = wrapS);
    !isNaN(wrapT) && (texture.wrapT = wrapT);
    !isNaN(mapping) && (texture.mapping = mapping);
    
    // set default wrap values if repeat parameter is set
    repeat && wrapS === undefined && (texture.wrapS = 1000);
    repeat && wrapT === undefined && (texture.wrapT = 1000);

    if (!isNaN(rotation)) {
      texture.center = new THREE.Vector2(0.5, 0.5)
      texture.rotation = rotation      
    }
    Array.isArray(repeat) && repeat.length === 2 && (texture.repeat.set(repeat[0], repeat[1]));
    Array.isArray(offset) && offset.length === 2 && (texture.offset.set(offset[0], offset[1]));
    
    // tested if encoding makes a shader variant
    // (!isNaN(encoding)) && (texture.encoding = encoding);
    texture.anisotropy = anisotropy;    

    texture.needsUpdate = true;
  }

  getTexture(id, options) {
    let texture
    if (options) {
      // unique id for combination
      const cloneId = hash({ id, options });
      const { data } = this.textures.find(item => item.id === cloneId) || {};
      if (data) {
        texture = data
      } else {
        const { data:orgTexture, ...orgOptions } = this.textures.find(item => item.id === id) || {};
        if (orgTexture) {
          const clone = orgTexture.clone()
          
          // Note that both orgOptions and options can contain rotation info
          let rotation = 0
          
          if (orgOptions && !isNaN(orgOptions.rotation)) {
            rotation += orgOptions.rotation
          }

          if (options && !isNaN(options.rotation)) {
            rotation += options.rotation
          }

          const cloneProperties = { 
            ...orgOptions, 
            ...options, 
            rotation,
            id: cloneId, 
            cloned: true, 
            cloneSource: id 
          }
          this.updateTexture(clone, cloneProperties)
          this.textures.push({ ...cloneProperties, data: clone });
          texture = clone
        }
      }
    } else {
      const { data } = this.textures.find(item => item.id === id) || {};
      if (!data) {
        console.error(`Texture not found, id: ${id}`);
      }
      texture = data
    }
    return texture
  }

  createJobId(type, id) {
    return `${type}_${id}`
  }

  addJob(job) {
    this.jobs.push({
      ...job,
      state: JOB_STATE_IN_QUEUE
    })
  }

  /**
   * remove ready, failed & queued items (Keep processed items).
   */
  cleanQueue() {    
    this.jobs = this.jobs.filter( item => item.state === JOB_STATE_PROCESSING )
  }

  stopQueue() {
    this.runningQueue = false;
    // remove unstarted jobs
    this.cleanQueue();
  }

  startQueue() {
    this.runningQueue = true;
    this.isComplete = false
    this.emit('loading', true, this.jobs.length)
    this.processNextJob();
  }

  countJobsByState(state) {
    let count = 0
    this.jobs.forEach(job => {
      if (job.state === state) {
        count++
      }
    });
    return count
  }

  processNextJob() {    
    if (this.runningQueue) {
      if (this.countJobsByState(JOB_STATE_PROCESSING) < JOBS_CONCURRENCY) {

        const job = this.jobs.find(item => item.state === JOB_STATE_IN_QUEUE);

        if (job) {
          
          const startTime = new Date().getTime();
          // If load model job
          if (job.type === JOB_TYPE_LOAD_MODEL && job.model && job.model.url) {
            job.state = JOB_STATE_PROCESSING

            const onLoad = (data) => {
              this.addModel({ ...job.model, data })
              job.state = JOB_STATE_READY;
              const timeSpent = new Date().getTime() - startTime;
              this.assetLoadTimes.meshes = timeSpent;
              // console.log("you what now?", timeSpent, startTime);
              this.processNextJob()
            }
            const onProgress = () => {
              // nothing here yet
            }
            const onError = (error) => {
              job.state = JOB_STATE_FAILED;
              this.processNextJob()
            }
            this.fbxLoader.load( job.model.url, onLoad, onProgress, onError )
          // else if load texture
          } else if (job.type === JOB_TYPE_LOAD_TEXTURE && job.texture && job.texture.url && job.texture.type) {

            job.state = JOB_STATE_PROCESSING

            const onLoad = (data) => {
              this.addTexture({ ...job.texture, data })
              job.state = JOB_STATE_READY;
              
              const timeSpent = new Date().getTime() - startTime;
              this.assetLoadTimes.textures = timeSpent;
              // this.assetLoadTimes.textures += new Date().getTime() - startTime;
              this.processNextJob()
            }
            const onProgress = () => {
              // nothing here yet
            }
            const onError = (error) => {
              job.state = JOB_STATE_FAILED;
              this.processNextJob()
            }

            if (job.texture.type === 'cube') {
              // console.log('assetmanager',job.texture);
              const urls = [
                'px.jpg',
                'nx.jpg',
                'py.jpg',
                'ny.jpg',
                'pz.jpg',
                'nz.jpg'
              ]
              this.cubeTextureLoader.setPath( job.texture.url ).load( urls, onLoad, onProgress, onError )
            } else {
              this.textureLoader.load( job.texture.url, onLoad, onProgress, onError )
            }
          } else {
            job.state = JOB_STATE_INVALID_JOB
            this.processNextJob()
          }

          this.processNextJob()

        }      
      }
  
      const total = this.jobs.length
      const inQueue = this.countJobsByState(JOB_STATE_IN_QUEUE)
      // const processing = this.countJobsByState(JOB_STATE_PROCESSING)
      const ready = this.countJobsByState(JOB_STATE_READY)
      const failed = this.countJobsByState(JOB_STATE_FAILED)
      const invalid = this.countJobsByState(JOB_STATE_INVALID_JOB)
  
      // console.log({ inQueue, processing, ready, failed, invalid, total })
  
      if (total) {
        const progress = (ready + failed + invalid) / total
        this.emit('progress', progress, inQueue, total);
      }
  
      if ( ready + failed + invalid === total ) { 
        this.stopQueue()
        this.emit('loading', false, 0)
        this.emit('complete');
        this.isComplete = true
        const totalTimes = (this.assetLoadTimes.meshes + this.assetLoadTimes.textures);
        if (totalTimes > 0){
          console.log('Asset load times: total', totalTimes , 'meshes:', this.assetLoadTimes.meshes, 'textures:', this.assetLoadTimes.textures );
        }
        this.assetLoadTimes.meshes = 0;
        this.assetLoadTimes.textures = 0;
      }
    }
  }

  loadAssets({ models = [], textures = [] } = {}) {

    this.stopQueue()

    this.assetLoadTimes.textures = 0;
    this.assetLoadTimes.meshes = 0;
    
    // temporary hack to move forward on shader changes:
    // moved to blueprintbuilder, now these will be added to all blueprints
    /*
    textures.push({
      id: DEFAULT_WHITE_TEXTURE_ID,
      type: 'texture',
      url: 'general/DEFAULT_WHITE.jpg'
    });

    textures.push({
        id: DEFAULT_AMBIENT_OCCLUSION_TEXTURE_ID,
        type: 'texture',
        url: 'general/DEFAULT_AO.jpg'
      });

    textures.push({
      id: DEFAULT_LIGHTMAP_TEXTURE_ID,
      type: 'texture',
      url: 'general/DEFAULT_LM.jpg'
    });
  

    textures.push({
      id: DEFAULT_NORMALMAP_TEXTURE_ID,
      type: 'texture',
      url: 'general/DEFAULT_NM.jpg'
    });
    */

    // create  model jobs
    for (const model of models) {
      const { id } = model;
      // see if texture is already loaded
      if (id && !this.hasModel(id)) {
        const jobId = this.createJobId(JOB_TYPE_LOAD_MODEL, id);
        // see if job already exists
        if (!this.hasJob(jobId)) {
          this.addJob({ id: jobId , type: JOB_TYPE_LOAD_MODEL, model })        
        }
      }
    }
    
    // add new texture jobs
    for (const texture of textures) {
      const { id } = texture;
      // see if texture is already loaded
      if (id && !this.hasTexture(id)) {
        const jobId = this.createJobId(JOB_TYPE_LOAD_TEXTURE, id);
        // see if job already exists
        if (!this.hasJob(jobId)) {
          this.addJob({ id: jobId, type: JOB_TYPE_LOAD_TEXTURE, texture })
        }
      }
    }
    this.startQueue();
  }
}

export default AssetManager