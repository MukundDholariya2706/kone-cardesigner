import { TYP_HL_PRODUCT, TYP_LCS_PRODUCT, TYP_EID_PRODUCT, TYP_DOP_PRODUCT, TYP_DIN_PRODUCT, TYP_FB, TYP_COP_PRODUCT_1,
       TYP_CDL_PRODUCT, TYP_HIB_PRODUCT, TYP_HI_PRODUCT } from "../../constants"
import { COP_CAPTURE_LIGHTS, DEFAULT_CAPTURE_LIGHTS } from "../3d/3d-light-setups"

/** 
 * Checks if given componentType is landing device or not
*/
export function isLandingDevice(componentType) {
  if ( 
    componentType === TYP_HI_PRODUCT ||
    componentType === TYP_HL_PRODUCT ||
    componentType === TYP_HIB_PRODUCT ||
    componentType === TYP_LCS_PRODUCT ||
    componentType === TYP_FB ||
    componentType === TYP_EID_PRODUCT ||
    componentType === TYP_DOP_PRODUCT ||
    componentType === TYP_DIN_PRODUCT ||
    componentType === TYP_CDL_PRODUCT 
  ) {
    return true
  }
  return false
}

/**
 * Returns array of landing component from given design
 * @param {Object} design 
 */
export function getLandingComponentsFromDesign(design) {
  const { components } = design || {}

  if (!components || !components.length) {
    return []
  }

  let result = []

  for (const component of components) {
    if (isLandingDevice(component.componentType)) {
      result.push(component)
    }
  }

  return result
}

/**
 * 
 * @param {*} val1 
 * @param {*} val2 
 */
export function similar( val1, val2 ) {
  const val1Type = Array.isArray(val1) ? 'array' : typeof val1
  const val2Type = Array.isArray(val2) ? 'array' : typeof val2

  if (val1Type === 'string' && val2Type === 'string') {
    return val1 === val2
  }

  if (val1Type === 'array' && val2Type === 'string') {
    return val1.indexOf(val2) !== -1
  }

  if (val1Type === 'string' && val2Type === 'array') {
    return val2.indexOf(val1) !== -1
  }

  if (val1Type === 'array' && val2Type === 'array') {
    for (let i = 0; i < val1.length; i++) {
      for (let j = 0; j < val2.length; j++) {
        if (val1[i] === val2[j]) {
          return true
        }
      }
    }
    return false
  }

  return false
}

/**
 * returns true if each function in given array returns true
 * @param {Array} items 
 */
export function and(...items) {
  if (!Array.isArray(items)) {
    return false
  }
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (typeof item === 'function' && !item()) {
      return false
    }
    if (typeof item === 'boolean' && !item) {
      return false
    }
  }
  return true
}

/**
 * returns true if each function in given array returns true
 * @param {Array} items 
 */
export function or(...items) {
  if (!Array.isArray(items)) {
    return false
  }
  if (items.length === 0) {
    return true
  }
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (typeof item === 'function' && item()) {
      return true
    }
    if (typeof item === 'boolean' && item) {
      return true
    }
  }
  return false
}

function joinItemTest(join, hash) {
  if (typeof join !== "string" || typeof hash !== 'object') {
    return false
  }

  const not = join.charAt(0) === '!'

  if (not) {
    join = join.substring(1);
    return hash[join.toUpperCase()] !== true
  }
  
  return hash[join.toUpperCase()] === true
}

export function joinTest(join, hash, all = true) {
  if (typeof join !== 'string' && !Array.isArray(join)) {
    return false
  }

  const joinItems = (typeof join === 'string') ? [join] : join

  if (joinItems.length === 0) {
    return true
  }

  if (!all) {
    return or( ...joinItems.map(item => joinItemTest(item, hash)) )
  }

  return and( ...joinItems.map(item => joinItemTest(item, hash)) )
}

/**
 * Filters design components
 * @param {*} param0 
 */
export function createCaptureDesignFilter({ componentTypes = [TYP_COP_PRODUCT_1] } = {}) {
  return (design) => {    
    return {
      ...design,
      components: design.components.filter(component => {        
        return similar(component.componentType, componentTypes)
      })
    }
  }
}

/**
 * Filters blueprint items
 * @param {*} param0 
 */
export function createCaptureBlueprintFilter({ componentTypes = [TYP_COP_PRODUCT_1], lights = COP_CAPTURE_LIGHTS } = {}) {

  return (blueprint) => {
    return {
      ...blueprint,
      meshes: blueprint.meshes.filter(mesh => {     
        return similar(mesh.componentType, componentTypes) && !similar(mesh.tags, ['elevator-b'])
      }).map(mesh => {
        if (mesh.hideGroup) {
          delete mesh.hideGroup
        }
        return mesh
      }),
      materials: blueprint.materials.map(material => {
        if (material.hasOwnProperty('envMap')) {
          // material.envMap = 'ENV_LANDING'
          material.envMap = 'ENV_IMAGE_CAPTURE'
        }
        return material
      }),
      lights,
      textures: [
        ...blueprint.textures,
        { 
          // id: 'ENV_LANDING',
          id: 'ENV_IMAGE_CAPTURE',
          type: 'cube',
          // mapping: 305, // = THREE.SphericalReflectionMapping
          // url: 'general/spherical-maps/SphericalReflectionMapping.jpg',
          mapping: 301, // = THREE.SphericalReflectionMapping
          url: 'general/cubemaps/',
          //url: 'general/cubemaps/imageGenCube', // now actual texture files are loaded intentionally, images will stay brighter
        }
      ]
    }
  }
}

export function createCaptureTransformMutator({ position = [0, 0, 0], rotation = [0, -Math.PI / 2, 0] } = {}) {
  return (mesh) => {
    // skip placed meshes
    if (!mesh.place) {
      mesh.position = [...position]
      mesh.rotation = [...rotation]
    }
    return mesh
  }
}

export function createCaptureBlueprintFilters({ componentTypes = [TYP_COP_PRODUCT_1] }) {
  const lights = similar(componentTypes, TYP_COP_PRODUCT_1) ? COP_CAPTURE_LIGHTS : DEFAULT_CAPTURE_LIGHTS;
  return {
    disableDynamicEnvMaps: true,
    designFilter: createCaptureDesignFilter({ componentTypes }),
    transformMutator: createCaptureTransformMutator(),
    blueprintFilter: createCaptureBlueprintFilter({ componentTypes, lights }),
  }
}