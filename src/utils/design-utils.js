import { MAT_CAR_WALL_FINISH_B, CAR_WALL_STRUCTURE_B1, CAR_WALL_STRUCTURE_BX, CAR_WALL_STRUCTURE_B2,
  MAT_CAR_WALL_FINISH_C, CAR_WALL_STRUCTURE_C1, CAR_WALL_STRUCTURE_CX, CAR_WALL_STRUCTURE_C2,
  MAT_CAR_WALL_FINISH_D, CAR_WALL_STRUCTURE_D1, CAR_WALL_STRUCTURE_DX, CAR_WALL_STRUCTURE_D2,
  TYP_CAR_WALL_B, TYP_CAR_WALL_C, TYP_CAR_WALL_D, TYP_CAR_FLOORING, CAR_TYPE_TRUE_TYPES, THREE_PANELS, SIDE_WALL_PANELS_ID, FIRST_TWO_PANELS, TWO_PANELS_COMBINED, MAT_CAR_FRONT_WALL_A } from "../constants"

import { getFinishByFinishId } from '../store/product/product-utils'

/**
 * Adds a finish to an array if it does not exist there already
 * @param {string} finishId finish to add
 * @param {Object[]} customFinishes - Array of all possible custom finishes
 * @param {Object[]} customFinishesInUse - Array of custom finishes where to add the finish if it does not exist there already
 */
function addCustomFinishToArray(finishId, customFinishes, customFinishesInUse) {
  const finish = customFinishes.find(x => x.id === finishId)

  if (finish) {
    if (!customFinishesInUse.find(x => x.id === finish.id)) {
      customFinishesInUse.push(finish)
    }
  }
}

/**
 * @param {Object} design - The design to get custom finishes for
 * @param {Object[]} customFinishes - The list of customFinishes to get the data from
 * @returns {Object[]} - Subset of the customFinishes list
 */
export function getCustomFinishesInUse(design, customFinishes) {
  const customFinishesInUse = []
  if (!customFinishes || customFinishes.length === 0) return []

  design.components
    .filter(item => item.custom)
    .forEach(item => {
      // If there are parts (e.g. because of wall panels),
      // check each part for custom finishes
      if (item.parts) {
        item.parts
          .filter(part => part.custom)
          .forEach(part => {
            addCustomFinishToArray(part.finish, customFinishes, customFinishesInUse)
          })
      } else {
        addCustomFinishToArray(item.finish, customFinishes, customFinishesInUse)
      }
    })

  return customFinishesInUse
}

/**
 * Gets the wall panel types (part types) for a wall type in an array.
 * @param {string} wallFinishType 
 * @returns {string[]} ['leftId', 'centerId', 'rightId']
 */
export function getPanelTypes(wallFinishType) {
  let leftId, centerId, rightId

  switch(wallFinishType) {
    case MAT_CAR_WALL_FINISH_B:
      leftId = CAR_WALL_STRUCTURE_B1
      centerId = CAR_WALL_STRUCTURE_BX
      rightId = CAR_WALL_STRUCTURE_B2
      break
    case MAT_CAR_WALL_FINISH_C:
      leftId = CAR_WALL_STRUCTURE_C1
      centerId = CAR_WALL_STRUCTURE_CX
      rightId = CAR_WALL_STRUCTURE_C2
      break
    case MAT_CAR_WALL_FINISH_D:
      leftId = CAR_WALL_STRUCTURE_D1
      centerId = CAR_WALL_STRUCTURE_DX
      rightId = CAR_WALL_STRUCTURE_D2
      break
    default:
      return []
  }

  return [ leftId, centerId, rightId ]
}

export function getFinishesByTypes(types, store, productStore) {
  
  if (!types || !store || !productStore) {
    return undefined
  }

  const result = {}
  
  for (let i = 0; i < types.length; i++) {
    const type = types[i];
    const dc = store.getDesignItem({ type })
    if (!dc) {
      continue
    }

    // Special handling for mixed floor materials
    if (type === TYP_CAR_FLOORING && dc.mixed) {
      const mixedFloorFinish = getFinishByFinishId(dc.finish, productStore.product)
      if (mixedFloorFinish && mixedFloorFinish.finishes) {
        result[type] = [...mixedFloorFinish.finishes ]
      }
    } else if (dc.parts && dc.parts.length>0 && [TYP_CAR_WALL_B, TYP_CAR_WALL_C, TYP_CAR_WALL_D].indexOf(type) !== -1) {
      result[type] = [ ...dc.parts.map(item => item.finish) ]
    } else {
      result[type] = [dc.finish]
    }
  }

  return result
}

export function isTrueTypeCar(shape) {
  return (CAR_TYPE_TRUE_TYPES.indexOf(shape) !== -1)
}

export function getIndiaBackWallSetup(backWallPanelingType) {

  if( backWallPanelingType === 2 ) {
    return [null, null]
  }
  
  if( backWallPanelingType === 1 || backWallPanelingType === 6 ) {
    return [TWO_PANELS_COMBINED, CAR_WALL_STRUCTURE_C1]
    // return [THREE_PANELS, CAR_WALL_STRUCTURE_C1]
  }

  if( backWallPanelingType === 5 ) {
    return [TWO_PANELS_COMBINED, FIRST_TWO_PANELS]
  }

  return [THREE_PANELS, SIDE_WALL_PANELS_ID]

}

export function getIndiaCombinedWalls(backWallPanelingType, originalSapId, changeFinishType) {

  if( backWallPanelingType === 1 || backWallPanelingType === 6 ) {
    return {wall:MAT_CAR_WALL_FINISH_D, panelWall: MAT_CAR_WALL_FINISH_C,  paneling:CAR_WALL_STRUCTURE_C1}
  }

  if( backWallPanelingType === 2 ) {
    if( originalSapId === "IMNSS21") {
      return {wall:[MAT_CAR_WALL_FINISH_D,MAT_CAR_WALL_FINISH_B, MAT_CAR_WALL_FINISH_C,MAT_CAR_FRONT_WALL_A]}
    }
    if( (originalSapId === "IMNSS22" || originalSapId === "IMNSE25") && [MAT_CAR_WALL_FINISH_D,MAT_CAR_WALL_FINISH_B,MAT_CAR_FRONT_WALL_A].indexOf(changeFinishType) !== -1 ) {
      return {wall:[MAT_CAR_WALL_FINISH_D,MAT_CAR_WALL_FINISH_B,MAT_CAR_FRONT_WALL_A]}
    }
  }

  if( backWallPanelingType === 3 ) {
    if( originalSapId === "IMNSE31"  && [MAT_CAR_WALL_FINISH_D,MAT_CAR_WALL_FINISH_B,MAT_CAR_FRONT_WALL_A].indexOf(changeFinishType) !== -1 ) {
      return {wall:[MAT_CAR_WALL_FINISH_D,MAT_CAR_WALL_FINISH_B,MAT_CAR_FRONT_WALL_A], panelWall: MAT_CAR_WALL_FINISH_C,  paneling: SIDE_WALL_PANELS_ID}
    }
    if( originalSapId === "IMNSL31"  && [MAT_CAR_WALL_FINISH_D,MAT_CAR_WALL_FINISH_B,MAT_CAR_FRONT_WALL_A].indexOf(changeFinishType) !== -1 ) {
      return {wall:[MAT_CAR_WALL_FINISH_D,MAT_CAR_WALL_FINISH_B,MAT_CAR_FRONT_WALL_A]}
    }
  }

  if( backWallPanelingType === 4 ) {
    return {wall:[MAT_CAR_WALL_FINISH_D,MAT_CAR_WALL_FINISH_B,MAT_CAR_FRONT_WALL_A], panelWall: MAT_CAR_WALL_FINISH_C,  paneling: SIDE_WALL_PANELS_ID}
  }

  if( backWallPanelingType === 5 ) {
    return {wall: MAT_CAR_WALL_FINISH_B, panelWall: MAT_CAR_WALL_FINISH_C, paneling:FIRST_TWO_PANELS}
  }

  if( backWallPanelingType === 8  && [MAT_CAR_WALL_FINISH_D,MAT_CAR_WALL_FINISH_B,MAT_CAR_FRONT_WALL_A].indexOf(changeFinishType) !== -1 ) {
    return {wall: [MAT_CAR_WALL_FINISH_D, MAT_CAR_WALL_FINISH_B,MAT_CAR_FRONT_WALL_A]}
  }

  return null

}
