import clone from 'clone';
import Socket from './Socket'
import { DOOR_2_OFFSET_X } from './transformations';
import { similar } from './blueprint-utils';
import { ELEVATOR_B } from "../../constants";

export default class Blueprint {
  
  constructor (data = {}) {
    this.data = data;
  }

  addModel(model) {
    if (!model) {
      return;
    }

    if (!this.data.hasOwnProperty('models')) {
      this.data.models = [];
    }

    const { id, file } = model;

    if (!id || !file || !file.url || this.data.models.find(item => item.id === id)) {
      return;
    }
    
    this.data.models.push({
      id,
      url: file.url
    });
  }

  addMesh(mesh, modelId) {
    if (!mesh || !modelId) {
      return;
    }

    if (!this.data.hasOwnProperty('meshes')) {
      this.data.meshes = [];
    }

    const { id } = mesh;

    if (!id || this.data.meshes.find(item => item.id === id)) {
      return;
    }

    this.data.meshes.push({
      ...clone(mesh),
      modelId
    });
  }

  addMaterials(materials) {
    if (!materials || !materials.length) {
      return;
    }
    if (!this.data.hasOwnProperty('materials')) {
      this.data.materials = [];
    }
    materials.forEach(m => {
      // ignore dublicates
      if (!this.data.materials.find(item => item.id === m.id )) {
        this.data.materials.push(clone(m));
      }
    })
  }

  addTextures(textures) {
    if (!textures) {
      return;
    }
    if (!this.data.hasOwnProperty('textures')) {
      this.data.textures = [];
    }
    for (const texture of textures) {
      // ignore dublicates
      if (!this.data.textures.find(item => item.id === texture.id )) {
        this.data.textures.push(clone(texture));
      }
    }
  }

  addMirror(mirror) {
    if (!mirror) {
      return;
    }
    if (!this.data.hasOwnProperty('mirrors')) {
      this.data.mirrors = [];
    }
    // Check texture dublicates
    if (!this.data.mirrors.find(item => item.id === mirror.id )) {
      this.data.mirrors.push(clone(mirror));
    }
  }
  
  addLight(light) {
    if (!light) {
      return;
    }
    if (!this.data.hasOwnProperty('lights')) {
      this.data.lights = [];
    }
    // Check texture dublicates
    if (!this.data.lights.find(item => item.id === light.id )) {
      this.data.lights.push(clone(light));
    }
  }

  /**
   * Returns sockets found in meshes.
   * Result can be filtered by given id and componentType
   */
  getSockets({ id, componentType, positions }) {
    if (!this.data.hasOwnProperty('meshes')) {
      return [];
    }
    let sockets = [];
    for (const mesh of this.data.meshes) {

      if (!mesh.hasOwnProperty('sockets') || !mesh.sockets || !mesh.sockets.length) {        
        continue;
      }      
      if (componentType && componentType !== mesh.componentType) {
        continue;
      }

      // if positions are defined, let's check that related positions can be found at mesh.positions
      if (positions && positions.length && mesh.positions && mesh.positions.length && !similar(positions, mesh.positions)) {
        continue;
      }
      
      for (const socket of mesh.sockets) {
        
        if (id && id !== socket.id) {
          continue;
        }

        sockets.push( new Socket({ 
          ...socket,
          parentPosition: mesh.position, 
          parentRotation: mesh.rotation,
          componentType: mesh.componentType,
          component: mesh.component,
          hideGroup: mesh.hideGroup,
        }) )

      }
      
    }
    return sockets;
  }

  /**
   * return mesh definitions that have place attribute
   */
  getPlacedMeshes() {
    if (!this.data.hasOwnProperty('meshes')) {
      return [];
    }
    let placedMeshes = []
    for (const mesh of this.data.meshes) {
      if (!mesh.hasOwnProperty('place') || !mesh.place) {
        continue;
      }
      placedMeshes.push(mesh)
    }
    return placedMeshes
  }

  /**
   * update transformations for placed meshes (socket <--> place connection)
   */
  updatePlacedMeshes() {
    const placedMeshes = this.getPlacedMeshes()
    for (const placedMesh of placedMeshes) {
      const sockets = this.getSockets({ id: placedMesh.place, componentType: placedMesh.componentType, positions: placedMesh.positions  })
      const socket = sockets[0]
      if (socket) {
        placedMesh.position = socket.getWorldPosition()
        placedMesh.rotation = socket.getWorldRotation()
        placedMesh.hideGroup = socket.hideGroup
      }
    }
  }

  updateDoor2LandingDevicePositions() {
    if (!this.data.hasOwnProperty('meshes')) {
      return
    }
    for (const mesh of this.data.meshes) {
      const { id, tags } = mesh
      if (similar(tags, ELEVATOR_B)) {
        let { position = [0, 0, 0] } = mesh
        position[0] += DOOR_2_OFFSET_X
        mesh.position = position
      }
    }
  }
  
  mutateMeshes(mutator) {
    if (!this.data.hasOwnProperty('meshes')) {
      return;
    }
    for (let index = 0; index < this.data.meshes.length; index++) {
      mutator(this.data.meshes[index])
    }
  }
}