import { getFinishesByTypes } from "../../utils/design-utils"

/**
 * Finds component from the store by given component Id
 * @param {String} componentId 
 * @param {Object} store 
 */
export function getComponentByComponentId(componentId, store) {
  
  if (!store || !store.components || !store.componentIndexesById || !componentId || !store.componentIndexesById.hasOwnProperty(componentId)) {
    return undefined
  }
  
  const index = store.componentIndexesById[componentId]

  if (isNaN(index)) {
    return undefined
  }
  
  const component = store.components[index]

  if (!component) {
    return undefined
  }

  return component
}

/**
 * Finds component type from the store by given component Id
 * @param {String} componentId 
 * @param {Object} store 
 */
export function getComponentTypeByComponentId(componentId, store) {

  const component = getComponentByComponentId(componentId, store)

  if (!component) {
    return undefined
  }

  return component.type
}

export function getFinishByFinishId(finishtId, product) {
  if (!product || !finishtId) { 
    return undefined
  }
  
  let finish

  const index = product.finishIndexesById ? product.finishIndexesById[finishtId] : undefined

  if (!isNaN(index)) {
    finish = product.finishes[index]
  }

  if (!finish) {
    finish = (product.finishes || []).find(item => item.id === finishtId)
  }

  if (!finish) {
    return undefined
  }

  return finish
}


/**
 * Finds material definition from product and returns that
 * @param {*} id 
 * @param {*} product 
 */
export function getMaterialById(id, product) {
  if (!product || !product.finishMaterials) {
    return undefined
  }
  return product.finishMaterials.find(item => item.id === id)
}

export function getCategoryById(id, product) {
  if (!product || !product.finishCategories) {
    return undefined
  }
  return product.finishCategories.find(item => item.id === id)
}

/**
 * returns design definitions (finishes & materials) by given types
 * @param {Object} designStore 
 * @param {Object} productStore 
 */
export function getDefinitions(types, designStore, productStore) {
  if (!types || !designStore || !productStore) {
    return undefined
  }

  const result = {}
  const finishesByTypes = getFinishesByTypes(types, designStore, productStore)

  if (!finishesByTypes) {
    return undefined
  }
  
  for (let i = 0; i < types.length; i++) {
    const type = types[i];
    const finishes = finishesByTypes[type]
    result[type] = {}
    if (finishes) {
      result[type].finishes = finishes.map(item => productStore.getFinish({ id: item })).filter(item => item)
    }
    if (result[type].finishes) {
      result[type].materials = result[type].finishes.map(({ materials }) => {
        if (materials && materials.length) {
          return getMaterialById(materials[0], productStore.product)
        }
      })
      result[type].categories = result[type].finishes.map(({ categories }) => {
        if (categories && categories.length) {
          return getCategoryById(categories[0], productStore.product)
        }
      })
    }
  }
  return result
}

export const getComponent = ({ id: componentId, product }) => {
  if (!product || !componentId) { 
    return undefined
  }

  let component
  const index = product.componentIndexesById ? product.componentIndexesById[componentId] : undefined

  if (!isNaN(index) && product.components) {
    component = product.components[index]
  }

  if (!component && product.components) {
    component = product.components.find(item => item.id === componentId)
  }

  if (!component) {
    return undefined
  }

  const { id, name, description, finishingTypes, componentFamily, image: { url } = {}, imagesByFinish, properties, parts = [],enhanceLighting } = component;

  return {
    id,
    name,
    label: name,
    description,
    finishingTypes: [...finishingTypes],
    componentFamily,
    image: url,
    imagesByFinish,
    properties,
    parts,
    enhanceLighting
  }
}

export const getFinish = ({ id: finishtId, product }) => {
  if (!product || !finishtId) { 
    return undefined
  }
  
  let finish

  const index = product.finishIndexesById ? product.finishIndexesById[finishtId] : undefined

  if (!isNaN(index)) {
    finish = product.finishes[index]
  }

  if (!finish) {
    finish = (product.finishes || []).find(item => item.id === finishtId)
  }

  if (!finish) {
    return undefined
  }

  const { id, sapId, name, custom = false, premium = false, materials = [], categories = [], image: { url, localStorage: localStorageKey } = {} } = finish

  return {
    id,
    sapId,
    name,
    label: name,
    custom,
    premium,
    materials: [...materials],
    categories: [...categories],      
    image: url || localStorage.getItem(localStorageKey)
  }
}

export const getComponentFamilies  = ({ type, product }) => {
  if (!product) {
    return []
  }
  const filteredFamilies = (product.componentFamilies || []).filter(item => {      
    return item.types.indexOf(type) !== -1 && item.disabled !== true;
  })
  return filteredFamilies.map(({id, name, componentCategory, description, image: { url }}) => {
    return {
      id,
      name,
      label: name,
      description,
      componentCategory,
      image: url
    }
  })
}

export const getComponentParts = (props) => {
  const c = getComponent(props)
  if (!c) {
    return []
  }
  if (Array.isArray(c.parts)) {
    return c.parts
  }
  return []
}