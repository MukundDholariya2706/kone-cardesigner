import jsonLogic from 'json-logic-js'
import { MAT_CAR_FLOORING, MAT_CAR_FLOORING_LIST } from '../constants'

export function getFloorMixerGroups(product) {
  if (!product.mixableFloorFinishes) return []
  
  return [
    { label: 'material-MIXED-PVC', material: 'MIXED-PVC', base: { type: MAT_CAR_FLOORING, materials: ['PVC'] }, frame: { type: MAT_CAR_FLOORING, materials: ['PVC'] } },
    { label: 'material-MIXED-STONE', material: 'MIXED-STONE', base: { type: MAT_CAR_FLOORING, materials: ['STONE', 'COMPOSITESTONE'] }, frame: { type: MAT_CAR_FLOORING, materials: ['STONE', 'COMPOSITESTONE'] }, list: { type: MAT_CAR_FLOORING_LIST,  materials: [] } }
  ].filter(group => {
    if(product?.rules?.variousFilteringRules) {
      let test={}
      test['filteringRULE'] = 'floorMixingMaterials'
      test['PRODUCT'] = product.product
      test['MATERIAL'] = group.material;
      return jsonLogic.apply(product.rules.variousFilteringRules, test)
    } else {
      return true
    }
  })
}

export const createServiceReadMoreUrlGetter = (product) => (serviceId) => product?.readMoreURLs?.[serviceId]?.url || ''