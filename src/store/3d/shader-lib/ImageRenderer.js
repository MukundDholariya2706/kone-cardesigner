import EventEmitter from 'events';
import hash from 'object-hash';
import { DEFAULT_WIDTH, DEFAULT_HEIGHT, CAMERA_POSITION, CAMERA_TARGET, CAMERA_NEAR, CAMERA_VIEW_ANGLE } from './3d-constants';
import { getCaptureCameraProperties } from './3d-utils';
import { similar } from '../blueprint/blueprint-utils';
import { Box3Helper, CameraHelper, Color, PerspectiveCamera } from 'three';


class ImageRenderer extends EventEmitter {
  constructor(sceneManager) {
    super()
    this.rendering = false;
    this.sceneManager = sceneManager
    this.assetManager = sceneManager.assetManager
    this.renderIndex = -1
    this.renderItems = []
    this.results = []
    this.orginalBlueprint = undefined
    this.startTime = 0;
    this.cameras = new Map();
    this.forcedBlueprint = null // a bit stupid debugging tool
    // this.debug = {
    //   cameraFrustums: new Map(),
    //   targetBounds: new Map()
    // };
    // this.orginalbackground = undefined
  }

  renderImage(
    {
      id,
      blueprint,
      position = [CAMERA_POSITION.x, CAMERA_POSITION.y, CAMERA_POSITION.z], 
      target = [CAMERA_TARGET.x, CAMERA_TARGET.y, CAMERA_TARGET.z], 
      width = DEFAULT_WIDTH,
      height = DEFAULT_HEIGHT,
      resolutionMultiplier=1,
      cameraNear = CAMERA_NEAR,
      fov = CAMERA_VIEW_ANGLE,
      focus, // componentType
      trim = false,
      dryRun = false
    },
    callback
  ) {

    const shotStartTime = new Date().getTime();
    const shot = () => {
      let bounds = undefined;
      if (focus) {
        const cameraProperties = getCaptureCameraProperties({
          scene: this.sceneManager.scene,
          fov,
          filter: mesh => (mesh.userData && similar(mesh.userData.componentType, focus)),
        })
  
        position = [ ...cameraProperties.position ];
        target = [ ...cameraProperties.target ];
        width = cameraProperties.width;
        height = cameraProperties.height;
        bounds = cameraProperties.bb;
      }

      let camera = undefined;
      if (!this.cameras.has(id)){
        camera = new PerspectiveCamera(fov, width / height);
        const frustum = new CameraHelper(camera)
        // is this missing from current threejs?
        // frustum.setColors(new Color(0, 0, 0.5), new Color(0.5, 0, 0), new Color(0.5, 1, 0), new Color(0.5, 1, 0), new Color(0.5, 1, 0))
        this.cameras.set(id, {camera, frustum });
        let boundsObject = undefined;
        if (bounds !== undefined){
          boundsObject = new Box3Helper(bounds, new Color(0, 1, 0));
          this.sceneManager.scene.add(boundsObject);
        }
        this.sceneManager.scene.add(frustum);
        frustum.visible = false;
        if (boundsObject) boundsObject.visible = false;
        // console.log("New camera", id);
        // if (id === "horizontalImage"){
        if (false) {
          // if (id === "copImage"){
          frustum.visible = true;
          if (boundsObject) boundsObject.visible = true;
          this.forcedBlueprint = blueprint;
          console.log("Leaving setup for 3D view:", id)
        }
      } else {
        camera = this.cameras.get(id).camera;
      }

      this.sceneManager.renderingManager.setSize(width * resolutionMultiplier, height * resolutionMultiplier, 1);

      camera.position.fromArray(position)
      camera.near = cameraNear
      camera.lookAt(target[0], target[1], target[2])
      camera.fov = fov;
      camera.aspect = width / height;
      // console.log(camera.aspect);
      camera.updateProjectionMatrix();
      // this.sceneManager.renderer.render(this.sceneManager.scene, this.sceneManager.camera);

      // we don't seem to even need cropping since the camera properties utility will calculate the bounds
      //const dataBlob = 
      const onReady = (data) => {
        const shotEndTime = new Date().getTime();

        // this will show up in QA
        // console.groupCollapsed(id, 'ready in', shotEndTime - shotStartTime, 'ms')
        // console.groupEnd();
        //console.log(id, 'ready in', shotEndTime - shotStartTime, 'ms')
        callback(null, { id, data: data, width, height })  
      }
      if (!dryRun){
        this.sceneManager.renderingManager.renderImage(onReady, camera);
      } else {
        console.log("ImageRenderer dryrun");
        onReady();
      }

     
    }

    const onComplete = () => {
      this.sceneManager.removeListener('complete', onComplete);
      shot();
    }

    if (this.sceneManager.blueprint && blueprint && hash(this.sceneManager.blueprint) === hash(blueprint) && this.assetManager.runningQueue === false) {
      shot();
    } else {
      this.sceneManager.addListener('complete', onComplete)
      this.sceneManager.build(blueprint) // sync fn
    }
  }

  resetScene() {
    const resetCamera = () => {
      this.sceneManager.camera.near = CAMERA_NEAR
      this.sceneManager.camera.fov = CAMERA_VIEW_ANGLE
      //Reset scene background alpha to visible
      // this.sceneManager.renderer.setClearColor( 0xffffff, 1 );
      // this.sceneManager.scene.background = SCENE_BACKGROUND_COLOR
    }

    const onComplete = () => {
      this.sceneManager.removeListener('complete', onComplete);
      this.rendering = false;
      console.groupCollapsed(`%cImageRenderer complete (${(new Date()).getTime() - this.startTime}ms)`, 'color: orange');
      //console.log(`%cImageRenderer complete (${(new Date()).getTime() - this.startTime}ms)`, 'color: orange');
      console.groupEnd();
      this.emit('complete', this.results)
    }

    // there should be no need to reset the camera because it's not manipulated
    // resetCamera(); 
    // Skip build, if scenaManager allready has correct state,
    if (this.sceneManager.blueprint && this.orginalBlueprint && hash(this.sceneManager.blueprint) === hash(this.orginalBlueprint)) {

      this.rendering = false;      
      console.log(`ImageRenderer complete (${(new Date()).getTime() - this.startTime}ms)`);
      this.emit('complete', this.results)
    
    // reset sceneManager to orginal state
    } else if (this.orginalBlueprint) {      

      this.sceneManager.addListener('complete', onComplete)
      this.sceneManager.forcedBlueprint = this.forcedBlueprint;
      // console.log(this.forcedBlueprint, this.sceneManager.forcedBlueprint);
      this.sceneManager.build(this.orginalBlueprint)
      onComplete();

    } else {
      this.rendering = false;

      // camera needs to be reset when reloading the page in design specification
      console.log(`ImageRenderer complete (${(new Date()).getTime() - this.startTime}ms)`);
      this.emit('complete', this.results)
    }
  }

  next() {
    this.renderIndex++
    const item = this.renderItems[this.renderIndex]
    const startTime = new Date().getTime();
    if (!item) {
      this.resetScene()
    } else {
      this.renderImage(item, (error, result) => {
        if (error) {
          console.error(error)
        } else {
          this.results.push(result)
        }

        //console.log(`%cImageRenderer index ${result.id} (${(new Date()).getTime() - startTime}ms)`, 'color: red');
        // Set timeout for now because download page loader won't display
        // correctly in all cases otherwise. TODO fix real issue in the download page
        setTimeout(() => {
          this.next()
        }, 0)
      })
    }
  }

  renderImages( items ) {
    this.rendering = true;
    this.orginalBlueprint = this.sceneManager.blueprint
    this.startTime = (new Date()).getTime();
    this.renderIndex = -1
    this.renderItems = items
    this.results = []
    this.next()
  }

}

export default ImageRenderer