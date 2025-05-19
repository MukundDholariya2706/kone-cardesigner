import hash from 'object-hash';
import clone from 'clone';
import jsonLogic from 'json-logic-js';
import Blueprint from "./Blueprint";
import { getHandrailPieces } from './handRailConstructor';
import { getBufferRailPieces } from './bufferRailConstructor';
import { getGapAndLaminateListPieces } from './gapsLaminateLists';
import { getTransformation } from './transformations'

import { 
  TYP_CAR_LIGHT_CUBE, MATERIAL_CATEGORY_MASTER, MATERIAL_CATEGORY_ADJUSTMENT, TYP_CAR_HANDRAIL, TYP_COP_PRODUCT_1, TYP_COP_2,
  TYP_CAR_CEILING, TYP_CAR_MIRROR, TYP_CAR_SEAT, TYP_CAR_TENANT_DIRECTORY, TYP_CAR_INFOSCREEN, TYP_CAR_MEDIASCREEN, TYP_CAR_BUFFER_RAIL,
  TYP_CAR_LAMINATE_LIST, ENV_DYNAMIC, ENV_CAR, ENV_LANDING, HORIZONTAL, TYP_CAR_WALL_B, TYP_CAR_WALL_C, TYP_CAR_WALL_D, TYP_CAR_SKIRTING,        
  VIEW3D_MODE_CAR, VIEW3D_MODE_LANDING, CAR_WALL_STRUCTURE_B1, CAR_WALL_STRUCTURE_BX, CAR_WALL_STRUCTURE_B2, CAR_WALL_STRUCTURE_D1, 
  CAR_WALL_STRUCTURE_DX, CAR_WALL_STRUCTURE_D2, CAR_WALL_STRUCTURE_C1, CAR_WALL_STRUCTURE_CX, CAR_WALL_STRUCTURE_C2, CAR_SHAPES,
  TYP_COP_HORIZONTAL, MIDDLE_BETWEEN_DOORS, ELEVATOR_A, ELEVATOR_B, LOCAL_STORAGE_PROJECT_LOCATION, TYP_CAR_MIRROR_2, TYP_CDL_PRODUCT, GLASS_COMPONENTS, SLINGPARTS,
   FIXED_SIZE_HANDRAILS, AIR_PURIFIER_PARTS, DEFAULT_WHITE_TEXTURE_ID, DEFAULT_AMBIENT_OCCLUSION_TEXTURE_ID, DEFAULT_LIGHTMAP_TEXTURE_ID, DEFAULT_NORMALMAP_TEXTURE_ID
} from "../../constants";

import { QUALITY_3D_HIGH, QUALITY_3D_MEDIUM, QUALITY_3D_LOW, LIGHT_SPOT_LIGHT } from '../3d/3d-constants';
import { isLandingDevice, similar, and, joinTest } from './blueprint-utils';
import { materialPropertyTypes } from '../3d/material-property-types';
import { isTrueTypeCar } from '../../utils/design-utils'


/**
 * Creates the blueprint for the {@link SceneBuilder}
 * @module BlueprintBuilder Blueprint builder
 * @class
 */
export default class BlueprintBuilder {

  constructor (store) {
    this.setStore(store)
    this.meshIds = {}
  }

  setStore(store) {
    this.store = store || {
      components: [],
      models: [],
      materials: [],
      textures: [],
      transformations: [],
      rules:[]
    }
  }

  /**
   * Returns list of predefined design components
   * @param {*} design 
   */
  getPredefinedDesignComponents(design, options = {}) {
    if (!design || options.disableDefaultComponents) {
      return [];
    }

    let { userHasInteract, view = VIEW3D_MODE_CAR } = options;
    let { carType } = design;
    const isTTC = isTrueTypeCar( carType )

    let components = [
      {
        componentType: 'TYP_GENERAL',
        component: "general",
        finishType: 'MAT_GENERAL',
        finish: 'general',
      },
      {
        componentType: 'TYP_BLOCK',
        component: "blocks",
        finishType: 'MAT_BLOCK',
        finish: 'blocks',
      },
      {
        componentType: 'TYP_BLOCK',
        component: "block-a",
        finishType: 'MAT_BLOCK',
        finish: 'blocks',
      },
      {
        componentType: 'TYP_BLOCK',
        component: "block-d",
        finishType: 'MAT_BLOCK',
        finish: 'blocks',
      },
      {
        componentType: 'TYP_BLOCK',
        component: "block-b",
        finishType: 'MAT_BLOCK',
        finish: 'blocks',
      },
      {
        componentType: 'TYP_OCCLUDE_BOX',
        component: "doors-a-occlude-box",
        finishType: 'MAT_OCCLUDE_BOX',
        finish: 'occlude-box',
      },
      {
        componentType: 'TYP_AIR_PURIFIER_STICKER',
        component: "AIR_PURIFIER_STICKER",
      },
      {
        componentType: 'TYP_AIR_PURIFIER_EFFECT1',
        component: "AIR_PURIFIER_EFFECT1",
      },
      {
        componentType: 'TYP_AIR_PURIFIER_EFFECT2',
        component: "AIR_PURIFIER_EFFECT2",
      },
    ]
    
    if (!userHasInteract) {
      components.push({
        componentType: 'TYP_INFO',
        component: "info-arrow",
        finishType: 'MAT_INFO',
        finish: 'info',
      })
    }

    // use c wall oclude box only for landing view
    if (view === VIEW3D_MODE_CAR) {
      components.push({
        componentType: 'TYP_OCCLUDE_BOX',
        component: "doors-c-occlude-box",
        finishType: 'MAT_OCCLUDE_BOX',
        finish: 'occlude-box',
      })
    }

    if (view === VIEW3D_MODE_LANDING) {
      components.push({
        componentType: 'TYP_OCCLUDE_BOX',
        component: "landing-occlude-box",
        finishType: 'MAT_OCCLUDE_BOX',
        finish: 'occlude-box',
      })
    }
    
    if (isTTC) {
      components.push({
        componentType: 'TYP_BLOCK',
        component: "block-c-ttc",
        finishType: 'MAT_BLOCK',
        finish: 'blocks',
      })
    } else {
      components.push({
        componentType: 'TYP_BLOCK',
        component: "block-c",
        finishType: 'MAT_BLOCK',
        finish: 'blocks',
      })
    }
    return components
  }
  
  /**
   * Checks if mesh is included in current design
   * @param {Object} mesh 
   * @param {Object} design 
   * @param {Object} options 
   */
  isMeshIncluded(mesh, design, componentHash, options = {}) {
    if (!mesh || !design) {
      return false
    }

    const { component, componentType, join, tags, positions, carShapes, validPositions, name:meshName } = mesh
    const { view, removeSling=false } = options
    const { removeAirPurifierEffect=false } = options
    const { components = [], carShape } = design

    // filter out handrails by default
    if (similar(componentType, [TYP_CAR_HANDRAIL, TYP_CAR_BUFFER_RAIL, TYP_CAR_LAMINATE_LIST]) && !component.every(cItem => FIXED_SIZE_HANDRAILS.includes(cItem))) {
      return false
    }

    if(removeSling && similar(meshName,[ ...SLINGPARTS ])) {
      return false
    }

    if(removeAirPurifierEffect && similar(meshName,[ ...AIR_PURIFIER_PARTS ])) {
      return false
    }

    if (similar(componentType, TYP_CAR_MIRROR) && positions && positions.length === 1) {
      const mirrorDesign = design.components.find(item => item.componentType === TYP_CAR_MIRROR);
      if (!mirrorDesign || !mirrorDesign.positions || mirrorDesign.positions.indexOf(positions[0]) === -1) {
        return false
      }
    }

    // if view is defined show only correctly tagged items
    if (view && !tags) {
      return false
    }
    
    // check if view can be found in tags
    if (view && tags && (tags.indexOf(view) === -1) && view !== VIEW3D_MODE_LANDING) {
      return false
    }

    // filter by carShape if defined in mesh
    if (carShape && carShapes && carShapes.length && carShapes.indexOf(carShape) === -1) {
      return false
    }
    
    // filter by validPositions
    if (validPositions && validPositions.length && componentType ) {
      const validComponents = components.filter(
        item => similar(item.componentType, componentType)
      ).filter(
        item => {
          return similar(item.positions, validPositions)
        }
      );
      if (!validComponents.length) {
        return false
      }
    }

    // filter by joins, component & componentType
    const result = and(
      () => !join || joinTest(join, componentHash),
      () => !component || joinTest(component, componentHash, false),
      () => !componentType || joinTest(componentType, componentHash, false),
    )

    return result
  }

  /**
   * Returns finish from the store by given finish (id)
   * @param {string} finish 
   */
  getMaterialByFinish(finish) {
    if (!finish) {
      return undefined
    }
    const materials = this.store.materials || [];
    const finishes = materials.filter(item => item.finish === finish)
    if (!finishes.length) {
      return undefined
    }
    return finishes[0]
  }

  createMaterialId(material) {
    const filterMaterialDefinition = {}
    materialPropertyTypes.forEach(name => {
      if (material.hasOwnProperty(name)) {
        filterMaterialDefinition[name] = material[name]
      }
    })
    return hash(filterMaterialDefinition);
  }

  /**
   * Compose material dynamically based on given component & material id
   * result is array of used materials
   * @param {Object} props { component, material }
   */
  composeMaterials({ mesh, finish = 'none', modelId, componentType, design, componentHash, options = {} }) {
    //console.log({ mesh, finish, modelId, componentType, design, componentHash })
    const isHorizontalPanel = (
      [TYP_CAR_WALL_B, TYP_CAR_WALL_C, TYP_CAR_WALL_D].indexOf(componentType) !== -1 && 
      design.panelOrientation === HORIZONTAL
    )

    const finishes = [finish]

    // This is used for store info about mesh materials that inherit from master materials
    // Note: materialId 1 is always inherited
    const meshMaterialMasterMaterialInheritance = [true]

    const { component, name:meshName, tags = [] } = mesh
    
    const isCar     = (tags.indexOf('car') === 0)
    const isLanding = (tags.indexOf('landing') === 0)
    
    const envMapDecorator = (m) => {
      if (options.disableDynamicEnvMaps) {
        return m
      }

      if (m && m.envMap && m.envMap === ENV_DYNAMIC) {
        isCar && (m.envMap = ENV_CAR);
        isLanding && (m.envMap = ENV_LANDING);
      }
      return m
    }

    const materials = this.store.materials || [];
    
    const defaultMaterial = {
      // nothing here yet
    }

    // TODO: OPTIMIZATION: Create finish hash table, access items by ids, 
    // finishesCache[<category>][<finish>][<materialId>]
    // product.getFinish({ <category>, <finish>, <materialId>, ... })

    // find mesh materials
    const meshMaterials = materials.filter(item => 
      item.model &&
      item.mesh &&
      modelId && 
      meshName &&
      item.model === modelId &&
      item.mesh === meshName &&
      // if item.join is defined check also that "joined" components exists in design
      ( 
        !item.join || 
        !Array.isArray(item.join) ||
        !item.join.length ||
        item.join.filter(joinItem => {
          return componentHash[joinItem.toUpperCase()]
        }).length === item.join.length ||
        joinTest(item.join,componentHash )
      )
    );
    
    // override given finish, if mesh material has parent property
    for (const meshMaterial of meshMaterials) {
      if (meshMaterial.parent) {
        finishes[
          !isNaN(meshMaterial.materialId) && meshMaterial.materialId > 0 ? meshMaterial.materialId - 1 : 0
        ] = meshMaterial.parent
      }
    }

    // find out is mesh material inherited form master material
    for (const meshMaterial of meshMaterials) {      
      if (!isNaN(meshMaterial.materialId) && meshMaterial.inherit === true) {        
        meshMaterialMasterMaterialInheritance[meshMaterial.materialId - 1] = true
      }
    }

    const masterMaterialFilter = material => {
      if (material.category !== MATERIAL_CATEGORY_MASTER) return false;
      if (finishes.indexOf(material.finish) === -1) return false;
      // check joins if exists
      if (material.join && material.join.length) {
        return material.join.filter(joinItem => {
          // return componentHash[joinItem.toUpperCase()]
          return joinTest(joinItem,componentHash )
        }).length === material.join.length
      }
      return true
    }

    // find master materials and add textureRotation parameter if needed
    const masterMaterials = materials.filter(masterMaterialFilter).map(item => {
    
      if (item.parent) {
        item = {
          ...this.getMaterialByFinish(item.parent),
          ...item
        }
      }

      if (!isHorizontalPanel && componentType !== TYP_CAR_SKIRTING && componentType !== TYP_CAR_BUFFER_RAIL) {
        return {
          ...item,
          materialId: !isNaN(item.materialId) ? item.materialId : 1
        }
      }

      // Test if finish can be tilted
      const test = { FINISH: item.finish }
      if (this.store.rules && this.store.rules.panelOrientation && !jsonLogic.apply(this.store.rules.panelOrientation, test)) {
        return item
      }

      return {
        ...item,
        textureRotation: Math.PI / 2,
        materialId: !isNaN(item.materialId) ? item.materialId : 1
      }
    })

    // find adjustment materials (only for material)
    const adjustmentMaterials = materials.filter(
      item => (
        item.category === MATERIAL_CATEGORY_ADJUSTMENT &&
        item.hasOwnProperty('parent') &&
        finishes.indexOf(item.parent) !== -1 && 
        (item.components || []).includes(component)
      )
    ).map(item => {
      return {
        ...item,
        materialId: !isNaN(item.materialId) && item.materialId > 0 ? item.materialId : 1
      }
    });

    // if (single) material
    if (Math.max(masterMaterials.length, adjustmentMaterials.length, meshMaterials.length) < 2) {      
      
      // combine materials    
      const combinedMaterial = envMapDecorator({
        ...defaultMaterial,
        ...masterMaterials[0],
        ...adjustmentMaterials[0],
        ...meshMaterials[0]
      })

      return [{
        ...combinedMaterial,
        // unique id for combination
        id: this.createMaterialId(combinedMaterial)
      }]
    
    // if multimaterial
    } else {
      
      const all = [
        ...masterMaterials,
        ...adjustmentMaterials,
        ...meshMaterials,
      ]

      let maxMaterialId = 1

      all.forEach(item => {
        if (!isNaN(item.materialId)) {
          maxMaterialId = Math.max(maxMaterialId, item.materialId)
        }
      })

      const result = []

      for (let materialId = 1; materialId < maxMaterialId + 1; materialId++) {
        // combine materials
        const combinedMaterial = envMapDecorator({
          ...defaultMaterial,
          ...(masterMaterials.find(item => item.materialId === materialId || (item.materialId === undefined && materialId === 1) || meshMaterialMasterMaterialInheritance[materialId-1] )),
          ...(adjustmentMaterials.find(item => item.materialId === materialId || (item.materialId === undefined && materialId === 1) )),
          ...(meshMaterials.find(item => item.materialId === materialId || (item.materialId === undefined && materialId === 1) )),
        })
        
        result.push({
          ...combinedMaterial,
          // unique id for combination
          id: this.createMaterialId(combinedMaterial)
        })
      }
      // console.log('---', meshName, finish, result, componentHash)
      return result
    }
  }

  /**
   * Collect used textures from material
   * @param {Object[]} material 
   */
  getTexturesByMaterials(materials, { quality = QUALITY_3D_MEDIUM } = {}) {

    if (!Array.isArray(materials)) {
      materials = [materials]
    }
    
    let textures = [];

    materials.forEach(material => {

      if (material.alphaMap) textures.push(material.alphaMap)
      // The red channel of this texture is used as the ambient occlusion map. Default is null.
      if (material.aoMap) textures.push(material.aoMap)
      if (material.bumpMap) textures.push(material.bumpMap)
      if (material.displacementMap) textures.push(material.displacementMap)
      if (material.emissiveMap) textures.push(material.emissiveMap)
      if (material.envMap) textures.push(material.envMap)
      if (material.lightMap) textures.push(material.lightMap)
      if (material.map) textures.push(material.map)
      // The blue channel of this texture is used to alter the metalness of the material.
      if (material.metalnessMap) textures.push(material.metalnessMap)
      if (material.normalMap) textures.push(material.normalMap)
      // The green channel of this texture is used to alter the roughness of the material.
      if (material.roughnessMap) textures.push(material.roughnessMap)
    })

    const key = (quality === QUALITY_3D_LOW && 'small') || (quality === QUALITY_3D_MEDIUM && 'medium') || (quality === QUALITY_3D_HIGH && 'file') || 'file';
    // remove dublicates (ES6 way), textureId to texture object, filter nulls
    return [...new Set(textures)].map(textureId => this.store.textures.find(texture => texture.id === textureId)).filter(texture => texture).map(texture => {
      const { file, small, medium, ...rest } = texture;
      let { url, localStorage: localStorageKey } = texture[key] || texture.file;

      // if localStorageKey is defined get dataUrl from localStorage
      if (!url && localStorageKey) {        
        url = localStorage.getItem(localStorageKey)
      }

      return { ...rest, url }
    });
  }

  /**
   * Returns transformation information (position, rotation, ...) 
   * @param {*} options 
   */
  getTransformation({ mesh: { component, offset = [0, 0, 0], positions:meshPositions }, componentType, positions, design, componentHash }) {
    
    if (!component) {
      return undefined;
    }
    // Calculate transformation for landing devices
    // { position, rotation, scale, translate, rotate }
    let transformation = getTransformation({ componentType, design, positions, offset, component });

    if (transformation) {
      return transformation;
    }

    
    const transformations = this.store.transformations || [];
    const { carShape } = design
    
    // COMPONENT + POSITION | JOIN
    // Check if component specific transformation can be found
    transformation = transformations.find(item => {
      // check transformation by component & positions      
      if (component && item.components && similar(component, item.components) && (!carShape || !item.carShapes || !item.carShapes.length || item.carShapes.indexOf(carShape) !== -1)) {
        // COMPONENT + POSITION
        if (positions && positions.length && item.positions) {

          // check if mesh has positions defined. If is, check if the transformation is matching the positions
          let meshPositionCheck = false
          if(meshPositions && meshPositions.length>0) {
            if( meshPositions.find(meshpos => item.positions.indexOf(meshpos) !== -1) ) {
              meshPositionCheck = true
            }
          } else {
            meshPositionCheck = true
          }

          for (const position of item.positions) {
            if (positions.indexOf(position) !== -1 && meshPositionCheck &&
              ( 
                !item.join || 
                !Array.isArray(item.join) ||
                !item.join.length ||
                item.join.filter(joinItem => {
                  if(joinItem.charAt(0) !=='!') {
                    return componentHash[joinItem.toUpperCase()]
                  }
                  return !componentHash[joinItem.substring(1).toUpperCase()]          
                }).length === item.join.length
              ) 
            ) {
              return true
            }
          }
          
        // COMPONENT + JOIN
        } else if (item.join && item.join.length) {
          
          // for (const joinComponent of item.join) {
/*             if (!design.components.find(c => c.component === joinComponent)) {
              return false
            }  */
            // console.log(joinComponent)
            if(
                ( 
                  !item.join || 
                  !Array.isArray(item.join) ||
                  !item.join.length ||
                  item.join.filter(joinItem => {
                    if(joinItem.charAt(0) !=='!') {
                      return componentHash[joinItem.toUpperCase()]
                    }
                    return !componentHash[joinItem.substring(1).toUpperCase()]          
                  }).length === item.join.length
                )
              ) { return true}
          // }
          return false
        }
      }      
      return false
    });

    // COMPONENT TYPE (+ POSITION if defined)
    // Check if component type specific transformation can be found
    // TODO: negation is not implemented yet
    if (!transformation && componentType) {
      transformation = transformations.find(item => {        
        // check transformation by componentType & positions
        if (componentType && item.componentTypes && item.componentTypes.indexOf(componentType) !== -1 && (!carShape || !item.carShapes || !item.carShapes.length || item.carShapes.indexOf(carShape) !== -1)) {

          if (positions && item.positions) {

            // check if mesh has positions defined. If is, check if the transformation is matching the positions
            let meshPositionCheck = false
            if(meshPositions && meshPositions.length>0) {
              if( meshPositions.find(meshpos => item.positions.indexOf(meshpos) !== -1) ) {
                meshPositionCheck = true
              }
            } else {
              meshPositionCheck = true
            }

            for (const position of item.positions) {
              
              if (positions.indexOf(position) !== -1 && meshPositionCheck &&
                  ( 
                    !item.join || 
                    !Array.isArray(item.join) ||
                    !item.join.length ||
                    item.join.filter(joinItem => {
                      if(joinItem.charAt(0) !=='!') {
                        return componentHash[joinItem.toUpperCase()]
                      }
                      return !componentHash[joinItem.substring(1).toUpperCase()]          
                    }).length === item.join.length
                  )
                ) {
                return true
              }
            }
          } else {
            return true
          }
        }
        return false
      });
    }

    // COMPONENT TYPE + JOIN
    if (!transformation && componentType && design && design.components) {

      transformation = transformations.find(item => {               
        if (item.join && item.join.length && item.componentTypes && item.componentTypes.length && item.componentTypes.indexOf(componentType) !== -1 && (!carShape || !item.carShapes || !item.carShapes.length || item.carShapes.indexOf(carShape) !== -1)) {

          if ( 
            !item.join || 
            !Array.isArray(item.join) ||
            !item.join.length ||
            item.join.filter(joinItem => {
              if(joinItem.charAt(0) !=='!') {
                return componentHash[joinItem.toUpperCase()]
              }
              return !componentHash[joinItem.substring(1).toUpperCase()]          
            }).length === item.join.length
          ) {
            return true
          }     
          return false
        }
        return false
      })
    }

    if (!transformation) {
      return undefined
    }

    const { position, rotation, scale, translate, rotate, hideGroup } = transformation;

    const result = {}

    position && (result.position = position)
    rotation && (result.rotation = rotation)
    scale && (result.scale = scale)
    translate && (result.translate = translate)
    rotate && (result.rotate = rotate)
    hideGroup && (result.hideGroup = hideGroup)

    return result
  }


  /**
   * Adds tag to mesh related data if position-info is found in positions definition
   * @param {*} modelId 
   * @param {*} meshIds 
   * @param {*} cv 
   */
  addDynamicHideGroup({ componentType,  positions, options }) {
    if (!componentType || !positions || !Array.isArray(positions)) {
      return;
    }
    const item = {}
    if ( componentType === TYP_COP_PRODUCT_1 || componentType === TYP_COP_2 || componentType === TYP_CAR_SEAT
           || componentType === TYP_CAR_TENANT_DIRECTORY || componentType === TYP_CAR_MEDIASCREEN
          || componentType === TYP_CAR_INFOSCREEN || componentType === TYP_COP_HORIZONTAL) {
      if (positions.indexOf('B1') !== -1 || positions.indexOf('BX') !== -1 || positions.indexOf('B2') !== -1) {
        item.hideGroup = "b"
      }
      else if (positions.indexOf('D1') !== -1 || positions.indexOf('DX') !== -1 || positions.indexOf('D2') !== -1) {
        item.hideGroup = "d"
      }
      else if (positions.indexOf('C1') !== -1 || positions.indexOf('CX') !== -1 || positions.indexOf('C2') !== -1) {
        item.hideGroup = "c"
      }
      else if (positions.indexOf('A1') !== -1 || positions.indexOf('AX') !== -1 || positions.indexOf('A2') !== -1) {
        item.hideGroup = "a"
      }
    }
    if ( componentType === TYP_CDL_PRODUCT && options?.view === 'car') {
      if (positions.indexOf('C1') !== -1 || positions.indexOf('CX') !== -1 || positions.indexOf('C2') !== -1) {
        item.hideGroup = "c"
      }
      else if (positions.indexOf('A1') !== -1 || positions.indexOf('AX') !== -1 || positions.indexOf('A2') !== -1) {
        item.hideGroup = "a"
      }
    }

    return item;
  }

  getCustomFinish(design, componentType, component) {
    if (design && design.components && componentType === TYP_CAR_LIGHT_CUBE) {
      const ceilingComponent = design.components.find(item => item.componentType === TYP_CAR_CEILING)
      if (ceilingComponent) {
        return `light-cube-deep-${ceilingComponent.component || 'none'}`
      }
    }
    return undefined
  }

  addMeshToBlueprint(blueprint, model, mesh, design, componentHash, options = {}, designComponent) {

    if (!designComponent) {
      designComponent = design.components.find(item => item.component === mesh.component) || {}
    }

    // fing out mesh finish          
    const componentType = designComponent.componentType
    const component =  designComponent.component
    const positions =  designComponent.positions || []
    let finish = this.getCustomFinish(design, componentType, component) || designComponent.finish || 'none'

    // override finish if finishFrom defined
    // finishFrom can be component id or component type
    if (mesh.finishFrom) {
      const dc = design.components.find( item => item.component === mesh.finishFrom || item.componentType === mesh.finishFrom )
      if (dc) {
        finish = dc.finish
      }
    }

    // special treatment for handrail pieces in KSCH40/KSCH70 when the COP it self is being added
    if( component === 'KSCH40' || component === 'KSCH70' ) {
      // console.log({blueprint, model, mesh, design, componentHash, options, designComponent})
      if( mesh.piece && !mesh.hideGroup ) {
        return 
      }
    }


    // console.log({blueprint, model, mesh, design, componentHash, options, designComponent})
    // override finish
    if (mesh.finish) {
      finish = mesh.finish
    }

    const materials = this.composeMaterials({ mesh, finish, modelId: model.id, componentType, design, componentHash, options })
    const materialIds = materials.map(item => item.id)
    const textures = this.getTexturesByMaterials(materials, options)

    blueprint.addModel(model)
    blueprint.addMaterials(materials)
    blueprint.addTextures(textures)
    blueprint.addMesh({
      ...mesh,
      id: this.getUniqueMeshId(mesh.id),
      component,
      componentType,
      carShape: design.carShape,
      positions: designComponent.positions,
      material: materialIds.length === 1 ? materialIds[0] : materialIds,
      ...this.getTransformation({ mesh, componentType, positions, design, componentHash }),
      ...this.addDynamicHideGroup({ componentType, positions, options })
    }, model.id)
  }

  /**
   * Returns mesh definitions by component id 
   * where "piece" attribute is defined
   * @param {*} componentId 
   */
  getMeshPiecesByComponent(componentId, options) {
    const result = {}    
    // collect models & meshes
    for (const model of this.store.models) {
      for (const mesh of model.meshes) {
        if (options?.useJoins) {
          if (!mesh.join || joinTest(mesh.join, options.componentHash)) {
            if (similar(componentId, mesh.component)) {
              // !result.hasOwnProperty('model') && (result.model = clone(model));
              if (mesh.hasOwnProperty('piece')) {
                result[mesh.piece] = {
                  ...clone(mesh),
                  modelId: model.id
                }
              }
            }
          }          
          
        } else {
          if (similar(componentId, mesh.component)) {
            // !result.hasOwnProperty('model') && (result.model = clone(model));
            if (mesh.hasOwnProperty('piece')) {
              result[mesh.piece] = {
                ...clone(mesh),
                modelId: model.id
              }
            }
          }
        }
      }
    }
    return result
  }

  hasHandrail(design = {}) {
    const { components = [] } = design
    return (components.find(item => {return (item.componentType === TYP_CAR_HANDRAIL && !FIXED_SIZE_HANDRAILS.includes(item.component))}) !== undefined)
  }

  hasBufferRail(design) {
    const { components = [] } = design
    return (components.find(item => item.componentType === TYP_CAR_BUFFER_RAIL) !== undefined)
  }

  hasLaminateList(design) {
    const { components = [] } = design
    return (components.find(item => item.componentType === TYP_CAR_LAMINATE_LIST) !== undefined)
  }

  getHandrailComponentId(design) {
    const { components = [] } = design
    const hr = components.find(item => item.componentType === TYP_CAR_HANDRAIL)
    if (hr) {
      return hr.component
    }
    return undefined
  }

  getHorizontalCopComponentId(design) {
    const { components = [] } = design
    const horCop = components.find(item => item.componentType === TYP_COP_HORIZONTAL)
    if (horCop) {
      return horCop.component
    }
    return undefined
  }

  getBufferRailComponentId(design) {
    const { components = [] } = design
    const br = components.find(item => item.componentType === TYP_CAR_BUFFER_RAIL)
    if (br) {
      return br.component
    }
    return undefined
  }

  getLaminateListComponentId(design) {
    const { components = [] } = design
    const ll = components.find(item => item.componentType === TYP_CAR_LAMINATE_LIST)
    if (ll) {
      return ll.component
    }
    return undefined
  }

  /**
   * Returns object that defines currently used design components, componentTypes and positions
   * CAR_SHAPE.<carShape> = true
   * CAR_TYPE.<carType> = true
   * <component> = true
   * <componentType> = true
   * <component>.<position> = true
   * <componentType>.<position> = true
   * <partComponent> = true
   * <partType> = true (sub design component component type)
   * <partType>.<partComponent> = true
   * <finishType> = true
   * <finishType>.<finish> = true
   * <finishType>.CUSTOM = true
   * <finishType>.MIXED = true
   * <finishType>.MATERIALS.<material> = true
   * @param {Object} design 
   */
  createComponentHash(design, productStore) {
    if (!design) return;

    const data = {};
    const { components, carShape, carType, product, extraFeatures, sapId, showAirPurifierModel, regulations } = design;
    const { finishes = [], finishIndexesById = {} } = this.store;

    const productMarket = ((productStore || {}).businessSpecification || {}).market || '';
    const productRelease = (productStore || {}).productRelease || '';
    const productFromProductStore = (productStore || {}).product || '';
    productMarket && productRelease && (data[`PRODUCT.${productMarket.toUpperCase()}.${productRelease.toUpperCase()}`] = true);
    productMarket && (data[`PRODUCT.${productMarket.toUpperCase()}`] = true);

    const selectedCountry = localStorage.getItem(LOCAL_STORAGE_PROJECT_LOCATION);
    selectedCountry && (data[`COUNTRY.${selectedCountry.toUpperCase()}`] = true);

    carShape && (data[`CAR_SHAPE.${carShape.toUpperCase()}`] = true);
    carType && (data[`CAR_TYPE.${carType.toUpperCase()}`] = true);

    sapId && (data[`DESIGN.${sapId.toUpperCase()}`] = true);

    product && (data[`PRODUCT.${product.toUpperCase()}`] = true);
    !product && productFromProductStore && (data[`PRODUCT.${productFromProductStore.toUpperCase()}`] = true);

    showAirPurifierModel && (data[`SHOWAIRPURIFIERMODEL`] = true);
    
    (regulations && regulations.length > 0) && ( regulations.forEach(item => {
      data[`REGULATIONS.${item.toUpperCase()}`] = true;
    })  );

    (extraFeatures && extraFeatures.length>0) && ( extraFeatures.forEach(item => {
      data[`EXTRAFEATURES.${item.toUpperCase()}`] = true;
    })  );

    const productExtraFeatures = (productStore || {}).extraFeatures || [];
        
    (productExtraFeatures && productExtraFeatures.length>0) && ( productExtraFeatures.forEach(item => {
      data[`PRODUCT.EXTRAFEATURES.${item.toUpperCase()}`] = true;
    })  );

    const digitalServices = design?.services || [];
        
    (digitalServices && digitalServices.length>0) && ( digitalServices.forEach(item => {
      data[`DESIGN.SERVICES.${item.toUpperCase()}`] = true;
    })  );


    for (const c of components) {
      const { component, componentType, positions, parts, finish, finishType } = c;

      // if(component === null) continue

      (component !== null) && (typeof component === 'string') && (data[component.toUpperCase()] = true);
      (typeof componentType === 'string') && (data[componentType.toUpperCase()] = true);
      (component !== null) && (typeof component === 'string' && typeof componentType === 'string') && (data[`${componentType.toUpperCase()}.${component.toUpperCase()}`] = true);
      (typeof componentType === 'string') && (finish !== null) && (typeof finish === 'string') && (data[`${componentType.toUpperCase()}.${finish.toUpperCase()}`] = true);
      if (Array.isArray(positions)) {
        for (const position of positions) {
          if (typeof position !== 'string') continue;
          (component !== null) && (typeof component === 'string') && (data[`${component.toUpperCase()}.${position.toUpperCase()}` ] = true);
          (typeof componentType === 'string') && (data[`${componentType.toUpperCase()}.${position.toUpperCase()}` ] = true);
        }
      }
      if (Array.isArray(parts)) {

        (typeof componentType === 'string') && (parts.length > 0) && (data[`${componentType.toUpperCase()}.PARTS`] = true);

        for (const part of parts) {
          const { type: partType, finish: partFinish, component: partComponent, componentType: partComponentType } = part;

          // <part.component>
          (typeof partComponent === 'string') && (data[`${partComponent.toUpperCase()}`] = true);

          // <part.finish>
          (typeof partFinish === 'string') && (data[`${partFinish.toUpperCase()}` ] = true);
          
          // <part.type>
          (typeof partType === 'string') && (data[`${partType.toUpperCase()}` ] = true);

          // <part.type>.<part.component>
          (typeof partType === 'string') && (typeof partComponent === 'string') && (data[`${partType.toUpperCase()}.${partComponent.toUpperCase()}` ] = true);

          // <part.componentType>.<part.component>
          (typeof partComponentType === 'string') && (typeof partComponent === 'string') && (data[`${partComponentType.toUpperCase()}.${partComponent.toUpperCase()}` ] = true);

          // <part.type>.<part.finish>
          (typeof partType === 'string') && (typeof partFinish === 'string') && (data[`${partType.toUpperCase()}.${partFinish.toUpperCase()}` ] = true);

          // <part.componentType>.<part.finish>
          (typeof partComponentType === 'string') && (typeof partFinish === 'string') && (data[`${partComponentType.toUpperCase()}.${partFinish.toUpperCase()}` ] = true);

          // <component>.<part.type>.<part.finish>
          (component !== null) && (typeof partType === 'string') && (typeof partFinish === 'string') && (data[`${component.toUpperCase()}.${partType.toUpperCase()}.${partFinish.toUpperCase()}` ] = true);
        }
      }

      if (finishType && finish) {
        // <finishType> = true
        data[ `${finishType.toUpperCase()}` ] = true;

        // <finishType>.<finish> = true
        data[ `${finishType.toUpperCase()}.${finish.toUpperCase()}` ] = true;

        const finishIndex = finishIndexesById[finish];

        if (!isNaN(finishIndex)) {
          const f = finishes[finishIndex] || {};

          const { custom, mixed, materials } = f;

          if (custom) {
            // <finishType>.CUSTOM = true
            data[ `${finishType.toUpperCase()}.CUSTOM` ] = true;
          }

          if (mixed) {
            // <finishType>.MIXED = true
            data[ `${finishType.toUpperCase()}.MIXED` ] = true;
          }

          if (Array.isArray(materials)) {
            for (let i = 0; i < materials.length; i++) {
              const material = materials[i];
              // <finishType>.MATERIALS.<material> = true
              data[ `${finishType.toUpperCase()}.MATERIALS.${material.toUpperCase()}` ] = true;
            }
          }
        }
      }
    }
    console.log(data)
    return data;
  }

  /**
   * Returns object that defines intersection box measurements
   * for mesh slicing. Mainly used with multipart walls
   * @param {string} carShape 
   * @param {string} type 
   */
  getIntersectBox(carShape, type, product, backWallPanelingType) {

    const shapeInfo = CAR_SHAPES.find(item => item.id === carShape)

    let width
    
    const shiftPanels = 0.5
    if(type.indexOf('B') !== -1 || type.indexOf('D') !== -1 ) {
      width = shapeInfo.depth+shiftPanels*2 || 0
    } else {
      width = shapeInfo.width || 0
    }

    //console.log(type, shapeInfo.depth, width)

    const test = {
      WALL_PIECE: type,
      WIDTH: width,
      PRODUCT: product,
      PANELINGTYPE: backWallPanelingType
    }
    const panelWidth = this.store.rules.wallPanelsMixedFinish 
                          ?jsonLogic.apply(this.store.rules.wallPanelsMixedFinish, test)
                          :1
    // console.log({type, width, shapeInfo, panelWidth})
    switch (type) {

      case CAR_WALL_STRUCTURE_B1:
        return { width: 8, height: shapeInfo.height, depth: panelWidth[0], position: { x: shapeInfo.width/2, y: shapeInfo.height/2, z: -shapeInfo.depth+panelWidth[0]/2 } };
      case CAR_WALL_STRUCTURE_D2:
        return { width: 8, height: shapeInfo.height, depth: panelWidth[0], position: { x: -shapeInfo.width/2, y: shapeInfo.height/2, z: -shapeInfo.depth+panelWidth[0]/2 } };

      case CAR_WALL_STRUCTURE_BX:
        if (product === 'home') {
          return { width: 8, height: shapeInfo.height, depth: panelWidth[0], position: { x: shapeInfo.width/2, y: shapeInfo.height/2, z: -55.75 } };
        } else {
          return { width: 8, height: shapeInfo.height, depth: panelWidth[0], position: { x: shapeInfo.width/2, y: shapeInfo.height/2, z: -shapeInfo.depth/2 } };
        }
      case CAR_WALL_STRUCTURE_DX:
        if (product === 'home') {
          return { width: 8, height: shapeInfo.height, depth: panelWidth[0], position: { x: -shapeInfo.width/2, y: shapeInfo.height/2, z: -55.75 } };
        } else {
          return { width: 8, height: shapeInfo.height, depth: panelWidth[0], position: { x: -shapeInfo.width/2, y: shapeInfo.height/2, z: -shapeInfo.depth/2 } };
        }

      case CAR_WALL_STRUCTURE_B2:
        return { width: 8, height: shapeInfo.height, depth: panelWidth[0], position: { x: shapeInfo.width/2, y: shapeInfo.height/2, z: -panelWidth[0]/2+shiftPanels } };
      case CAR_WALL_STRUCTURE_D1:
        return { width: 8, height: shapeInfo.height, depth: panelWidth[0], position: { x: -shapeInfo.width/2, y: shapeInfo.height/2, z: -panelWidth[0]/2+shiftPanels } };

      case CAR_WALL_STRUCTURE_C1:
        return { width: panelWidth[0], height: shapeInfo.height, depth: 18, position: { x: -panelWidth[1], y: shapeInfo.height/2, z: -shapeInfo.depth } };

      case CAR_WALL_STRUCTURE_CX:
        return { width: panelWidth[0], height: shapeInfo.height, depth: 18, position: { x: 0, y: shapeInfo.height/2, z: -shapeInfo.depth } };
        
      case CAR_WALL_STRUCTURE_C2:
        return { width: panelWidth[0], height: shapeInfo.height, depth: 18, position: { x: panelWidth[1], y: shapeInfo.height/2, z: -shapeInfo.depth } };
 
      default:
        return null
    }
  }

  getDesignComponentsByMesh(mesh, design) {
    const { component, componentType, part } = mesh
    const { components = [] } = design

    const dcs = components.filter(item => {
      if ( similar(component, item.component) && (!componentType || similar(componentType, item.componentType)) ) {
        return true
      }
      return false
    });

    if (!part) {
      return dcs
    }

    // if mesh has part definition copy finish from design component's parts
    return dcs.map(item => {
      const partDc = item.parts && item.parts.length && item.parts.find(pItem => (similar(part, pItem.component)));
      return partDc ? { ...item, finish: partDc.finish } : item;
    })
  }

  getUniqueMeshId(id) {
    if (!this.meshIds.hasOwnProperty(id)) {
      this.meshIds[id] = true
      return id
    }
    let index = 1
    while(this.meshIds.hasOwnProperty(`${id}-${index}`)) {
      index++
    }
    id = `${id}-${index}`
    this.meshIds[id] = true
    return id    
  }

  addDefaultTextures(blueprint){
    const defaultTextures = [
      {
        id: DEFAULT_WHITE_TEXTURE_ID,
        type: 'texture',
        url: 'general/DEFAULT_WHITE.jpg'
      },
      {
        id: DEFAULT_AMBIENT_OCCLUSION_TEXTURE_ID,
        type: 'texture',
        url: 'general/DEFAULT_AO.jpg'
      },
      {
        id: DEFAULT_LIGHTMAP_TEXTURE_ID,
        type: 'texture',
        url: 'general/DEFAULT_LM.jpg'
      },
      {
        id: DEFAULT_NORMALMAP_TEXTURE_ID,
        type: 'texture',
        url: 'general/DEFAULT_NM.jpg'
      }
    ]
    blueprint.addTextures(defaultTextures);
  }
  
  /**
   * Creates blueprint based on supplied design & options
   * @param {*} design 
   */
  build(design, options = {}) {
    if (!design) {
      return undefined
    }

    this.meshIds = {}

    // clone design
    design = clone(design);

    design.components = [
      ...this.getPredefinedDesignComponents(design, options),
      ...design.components
    ]

    if (options && typeof options.designFilter === 'function') {
      design = options.designFilter(design, options)
    }

    const componentHash = this.createComponentHash(design, options.product)
    const blueprint = new Blueprint();

    this.addDefaultTextures(blueprint);
    // collect models & meshes
    for (const model of this.store.models) {
      try {
        for (const mesh of model.meshes) {
          if (this.isMeshIncluded(mesh, design, componentHash, options)) {
            
            const dcs = this.getDesignComponentsByMesh(mesh, design)
            for (const dc of dcs) {

              // Special handling for multipart walls
              if ( similar(mesh.componentType, [TYP_CAR_WALL_B, TYP_CAR_WALL_C, TYP_CAR_WALL_D])) {
                const multipartWallComponent = design.components.find(item => similar(item.componentType, mesh.componentType) && item.parts && item.parts.length > 1)
                if (multipartWallComponent) {
                  for (const part of multipartWallComponent.parts) {
                    const backWallPanelingType = design?.backWallPanelingType || 0
                    const intersectBox = this.getIntersectBox(design.carShape, part.type, options?.product?.product, backWallPanelingType)
                    this.addMeshToBlueprint(blueprint, model, { ...mesh, id: `${mesh.id}-${part.type}-${backWallPanelingType}`, finish: part.finish, intersectBox }, design, componentHash, options, dc)
                  }
                } else {
                  this.addMeshToBlueprint(blueprint, model, mesh, design, componentHash, options, dc)
                }

              // Default (non multipart) handling for meshes
              } else {

                // if dc has multiple positions, 
                // create mesh for each
                // e.g. jamb indicator
                if (dc.positions?.length > 1 && !similar(TYP_CAR_MIRROR_2, mesh.componentType) && !similar(GLASS_COMPONENTS, mesh.component)) {
  
                  for (const position of dc.positions) {
                    this.addMeshToBlueprint(blueprint, model, mesh, design, componentHash, options, {
                      ...dc,
                      positions: [position]
                    });                    
                  }
                } else {
                  this.addMeshToBlueprint(blueprint, model, mesh, design, componentHash, options, dc);
                }
                // this.addMeshToBlueprint(blueprint, model, mesh, design, componentHash, options, dc);

                // Dublicate landing devices for second door
                // Don't dublicate shared devices (items with MIDDLE_BETWEEN_DOORS position)
                // Don't dublicate items with specified position (tags: 'elevator-a', 'elevator-b')
                if (isLandingDevice(dc.componentType) && !similar(dc.positions, MIDDLE_BETWEEN_DOORS) && !similar(mesh.tags, [ELEVATOR_A, ELEVATOR_B] ) && options?.view === 'landing') {
                  const tags = mesh.tags ? [ ...mesh.tags, ELEVATOR_B ] : [ ELEVATOR_B ]
                  if (dc.positions?.length > 1) {
                    for (const position of dc.positions) {
                      this.addMeshToBlueprint(blueprint, model, { ...mesh, id: `${mesh.id}_ELEVATOR_B`, tags }, design, componentHash, { ...options }, {
                        ...dc,
                        positions: [position]
                      });                    
                    }
                  } else {
                    this.addMeshToBlueprint(blueprint, model, { ...mesh, id: `${mesh.id}_ELEVATOR_B`, tags }, design, componentHash, { ...options }, dc)
                  }
                }
              }
            }
          }
        }
      } catch (error) {
        console.error(`Could not load ${model.id}.`, error.message)
      }
    }

    if (options && typeof options.transformMutator === 'function') {
      blueprint.mutateMeshes(options.transformMutator)
    }

    // update transformations for placed meshes (socket <--> place connection)
    blueprint.updatePlacedMeshes()
    blueprint.updateDoor2LandingDevicePositions()

    // Create handrail for KSCH40 and KSCH70
    if (options?.hasHorizontalCop()) {
      const horCopId = this.getHorizontalCopComponentId(design)
      // get handrail building blocks (pieces)

      if(horCopId === 'KSCH40' || horCopId === 'KSCH70') {

        const pieces = this.getMeshPiecesByComponent(horCopId, { useJoins:true, componentHash } )
        // to avoid issues when handrail needs to be changed even thought the component doesn't change
        const hrTypeDefinition = pieces?.body?.name || (new Date()).getTime()
        // get definitions (position, rotation, etc...) for meshes
        const definitions = getHandrailPieces(design, this.store.product, this.store.rules, {...options, calculateForKSSH:true, hrTypeDefinition})

        // create dynamic mesh definitions
        const meshes = []
        for (const definition of definitions) {        
          const piece = pieces[definition.piece]
          meshes.push({
            ...clone(piece),
            ...definition
          })
        }
        try {
          for (const mesh of meshes) {
            const model = this.store.models.find(item => item.id === mesh.modelId)
            if (model) {
              const dcs = this.getDesignComponentsByMesh(mesh, design)
              //hacksor test
              const horCopIndex = design?.components?.findIndex(item => item.componentType === TYP_COP_HORIZONTAL)
              for (const dc of dcs) { 
                const dcFinish = design.components[horCopIndex].finish
                const dcPosition = dc.positions.indexOf('BX') !== -1 ? ['B'] : ['D']
                this.addMeshToBlueprint(blueprint, model, mesh, design, componentHash, options, {...dc, finish:dcFinish, positions:dcPosition})
              }
            }
          }
        } catch (error) {
          console.error("Could not load handrails.", error.message)
        }
      }
    }

    // Create handrails
    if (this.hasHandrail(design)) {
      // get handrail building blocks (pieces)
      const pieces = this.getMeshPiecesByComponent(this.getHandrailComponentId(design))
      
      // get definitions (position, rotation, etc...) for meshes
      const definitions = getHandrailPieces(design, this.store.product, this.store.rules, options)
      // create dynamic mesh definitions
      const meshes = []
      for (const definition of definitions) {        
        const piece = pieces[definition.piece]
        meshes.push({
          ...clone(piece),
          ...definition
        })
      }

      try {
        for (const mesh of meshes) {
          const model = this.store.models.find(item => item.id === mesh.modelId)
          if (model) {
            const dcs = this.getDesignComponentsByMesh(mesh, design)
            //hacksor test
            // const horCopIndex = design?.components?.findIndex(item => item.componentType === TYP_COP_HORIZONTAL)
            for (const dc of dcs) { 
              let dcFinish = dc.finish

              this.addMeshToBlueprint(blueprint, model, mesh, design, componentHash, options, {...dc, finish:dcFinish})
            }
          }
        }
      } catch (error) {
        console.error("Could not load handrails.", error.message)
      }
    }

    // Create buffer rails
    if (this.hasBufferRail(design)) {
      // get buffer rail building blocks (pieces)
      const pieces = this.getMeshPiecesByComponent(this.getBufferRailComponentId(design))

      // get definitions (position, rotation, etc...) for meshes
      const definitions = getBufferRailPieces(design, this.store.product, this.store.rules)

      // create dynamic mesh definitions
      const meshes = []
      for (const definition of definitions) {
        const piece = pieces[definition.piece]        
        meshes.push({
          ...piece,
          ...definition
        })
      }

      try {
        for (const mesh of meshes) {
          const model = this.store.models.find(item => item.id === mesh.modelId)
          if (model) {
            const dcs = this.getDesignComponentsByMesh(mesh, design)
            for (const dc of dcs) {
              this.addMeshToBlueprint(blueprint, model, mesh, design, componentHash, options, dc)
            }
          }
        }
      } catch (error) {
        console.error("Could not load buffer rails.", error.message)
      }
    }

    // Add gaps and laminatelists  

    let gapAndLLPieces;
    
    if (this.hasLaminateList(design)) {
      gapAndLLPieces = this.getMeshPiecesByComponent(this.getLaminateListComponentId(design))
      gapAndLLPieces.gap = this.getMeshPiecesByComponent('GAP').gap;
    } else {
      gapAndLLPieces = this.getMeshPiecesByComponent('GAP');
    }

    // get definitions (position, rotation, etc...) for meshes
    const gapAndLLDefinitions = getGapAndLaminateListPieces(design, this.store.product, this.store.rules, this.store.finishes)
    // create dynamic mesh definitions
    const gapAndLLMeshes = []
    for (const definition of gapAndLLDefinitions) {
      const piece = gapAndLLPieces[definition.piece]        
      gapAndLLMeshes.push({
        ...piece,
        ...definition
      })
    }
    try {
      for (const mesh of gapAndLLMeshes) {
        const model = this.store.models.find(item => item.id === mesh.modelId)
        if (model) {
          const dcs = this.getDesignComponentsByMesh(mesh, design)
          if (dcs.length) {
            for (const dc of dcs) {
              this.addMeshToBlueprint(blueprint, model, mesh, design, componentHash, options, dc)
            }            
          } else {
            // note: gaps don't have designComponent definition
            this.addMeshToBlueprint(blueprint, model, mesh, design, componentHash, options, null)            
          }
        }
      }
    } catch (error) {
      console.error("Could not load  gap/laminatelist.", error.message)
    }
 
    // Add mirrors
    for (const mirror of this.store.mirrors) {
      if (this.isMeshIncluded(mirror, design, componentHash, options)) {

        //TODO: change this to get the real finish from somewhere

        const matchingComponent = design.components.find((item) => item.component === mirror.component);

        let materialFinishName = '';

        if (matchingComponent.finish){
          materialFinishName = matchingComponent.finish;
        }

        // console.error(mirror);
        const mirrorMat = this.getMaterialByFinish(materialFinishName);
        const mirrorClone = clone(mirror);
        if (mirrorMat){
          mirrorClone.tint = mirrorMat.color;
        }
        blueprint.addMirror(mirrorClone);
      }
    }
    
    // Add lights
    if (options.quality === QUALITY_3D_HIGH || options.quality === QUALITY_3D_MEDIUM) {
      for (const light of this.store.lights) {
        const { component, join, carShape, view = VIEW3D_MODE_CAR } = light;
        if ( !join && componentHash && component && joinTest(component,componentHash, false) && design.carShape && (view === VIEW3D_MODE_LANDING || (carShape && design.carShape === carShape)) && view === options.view ) {
          blueprint.addLight( light )
        }
        if ( join && componentHash && !component && joinTest(join,componentHash, false) && design.carShape && (view === VIEW3D_MODE_LANDING || (carShape && design.carShape === carShape)) && view === options.view ) {
          blueprint.addLight( light )
        }
        if ( join && componentHash && component && joinTest(component,componentHash, false) && joinTest(join,componentHash, false) && design.carShape && (view === VIEW3D_MODE_LANDING || (carShape && design.carShape === carShape)) && view === options.view ) {
          blueprint.addLight( light )
        }

      }

    } else if ( options.quality === QUALITY_3D_LOW ) {     

      blueprint.addLight({
        id: LIGHT_SPOT_LIGHT,
        type: LIGHT_SPOT_LIGHT,
        color: 0xfdf8f2,
        intensity: 1.5,
        penumbra: 1,
        angle: 1.54,
        decay: 2,
        distance: 500,
        position: [0, 210, -70],
      })
    }
    
    blueprint.data.metadata = {
      view: options.view || VIEW3D_MODE_CAR
    }    

    if (options && typeof options.blueprintFilter === 'function') {
      // console.log('here',options.blueprintFilter(blueprint.data, options))
      return options.blueprintFilter(blueprint.data, options);
    }
    

    if (!process.env.RUNNING_TEST) {
      console.groupCollapsed('Built a new blueprint:', design.id, blueprint.data.metadata.view)
      console.log('Design:', design)
      console.log('Blueprint:', blueprint.data)
      console.groupEnd()
    }
    
    return blueprint.data;
  }
}