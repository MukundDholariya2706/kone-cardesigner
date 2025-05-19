import { getTransformation as getHlTransformation } from './hl'
import { getTransformation as getLcsTransformation } from './lcs'
import { getTransformation as getFbTransformation } from './fb'
import { getTransformation as getEidTransformation } from './eid'
import { getTransformation as getDopTransformation } from './dop'
import { getTransformation as getDinTransformation } from './din'

import { 
  TYP_HI_PRODUCT, TYP_HL_PRODUCT, TYP_LCS_PRODUCT, TYP_EID_PRODUCT, TYP_DOP_PRODUCT, TYP_DIN_PRODUCT, TYP_LDO_FRAME_FRONT, TYP_DOOR_A,
  CAR_SHAPE_DEEP, CAR_SHAPE_SQUARE, CAR_SHAPE_SQUARE_10_13_24, CAR_SHAPE_WIDE, CAR_SHAPE_WIDE_ENA_19_16_24, CAR_SHAPE_WIDE_ENA_20_13_24, CAR_SHAPE_4500HMC_ENA_17_25_24,CAR_SHAPE_HOMELIFT_9_12_24, 
  CAR_SHAPE_DEEP_AU_14_20_24, CAR_SHAPE_WIDE_AU_14_16_24, CAR_SHAPE_NANOSPACE_11_10_21, TYP_FB,
  CAR_SHAPE_INDIA_11_10_22, CAR_SHAPE_INDIA_11_20_22, CAR_SHAPE_INDIA_16_13_22,  CAR_SHAPE_INDIA_11_13_22, CAR_SHAPE_INDIA_13_24_22, CAR_SHAPE_INDIA_16_15_22,
  CAR_SHAPE_TRANSYS_12_23_24, CAR_SHAPE_TRANSYS_12_26_24, CAR_SHAPE_TRANSYS_14_24_24, CAR_SHAPE_TRANSYS_15_27_24, CAR_SHAPE_WIDE_23_17_26,CAR_SHAPE_WIDE_16_20_24
} from "../../../constants";

export const DOOR_2_OFFSET_X = 274.7
export const OFFSET_X_FROM_DOOR_FRAME = 16
export const OFFSET_Y_FROM_DOOR_FRAME = 12
export const OFFSET_Z_FROM_WALL = 5.2
export const OFFSET_Z_FROM_DOOR_FRAME = 0.35
export const OFFSET_Z_FROM_DOOR_1FRAME_ENA = 0
export const OFFSET_Z_FROM_DOOR_1FRAME_INDIA = 22.7
export const OFFSET_Z_FROM_DOOR_1FRAME = 16.334
export const OFFSET_Z_FROM_DOOR_1FRAME_4L = 14.102
export const OFFSET_Z_FROM_DOOR_2FRAME = 14.8
export const OFFSET_Z_FROM_DOOR_2FRAME_INDIA = 21.5
export const LCS_X = 100
export const FB_X = 100
export const FB_X_LEFT_CORRECTION = 16
export const FB_X_FRAME_CENTER = 8

// Narrow
export const W_3FRAME = 4.92
export const H_3FRAME = 4.92
// Frame frame
// export const W_1FRAME = 13.28
export const W_1FRAME = 13
export const W_1FRAME_ENA = 10.6
export const H_1FRAME = 14.5
export const H_1FRAME_ENA= 10.6
// Front (can be used also for 4FRAME)
export const W_2FRAME_INNER = 47.6
export const W_2FRAME_INNER_LL1400 = 22
export const W_2FRAME_INNER_NARROW = 17.2
export const W_2FRAME_INNER_WIDE = 47.6 + 5.27
export const H_2FRAME_INNER = 32.1
export const W_2FRAME_OUTTER = 7.3
export const H_2FRAME_OUTTER = 7.3

export function getDoor(design) {
  return (design.components.find(item => item.componentType === TYP_DOOR_A) || {}).component
}

export function getDoorWidth(carShape, door) {
  // Home 80cm
  // 9 leveä deepissaä, scuarissa, 90cm
  // 10 wide, aust wide aust deep, 100cm

  switch (carShape) {
    case (CAR_SHAPE_INDIA_11_10_22):
      return 70

      case (CAR_SHAPE_INDIA_11_13_22):
      return 70

      case (CAR_SHAPE_INDIA_16_15_22):
      return 90

      case (CAR_SHAPE_INDIA_13_24_22):
      return 70

    case (CAR_SHAPE_HOMELIFT_9_12_24):
      return 80

    case (CAR_SHAPE_NANOSPACE_11_10_21):
      return 80

    case (CAR_SHAPE_SQUARE_10_13_24):
      return 80   

    case (CAR_SHAPE_DEEP):
      return 90 
  
    case (CAR_SHAPE_SQUARE):
      return 90 
    
    case (CAR_SHAPE_INDIA_11_20_22):
      return 90

    case (CAR_SHAPE_INDIA_16_13_22):
      return 90
  
    case (CAR_SHAPE_WIDE):
      return 100

    case (CAR_SHAPE_WIDE_23_17_26):
      return 110
    
    case (CAR_SHAPE_WIDE_ENA_19_16_24):
      return 100

    case (CAR_SHAPE_WIDE_ENA_20_13_24):
    return 100
  
    case (CAR_SHAPE_DEEP_AU_14_20_24):
      return 100
  
    case (CAR_SHAPE_WIDE_AU_14_16_24):
      return 100

    case (CAR_SHAPE_4500HMC_ENA_17_25_24):
      return 110

    case (CAR_SHAPE_TRANSYS_12_23_24):
      return 110

    case (CAR_SHAPE_TRANSYS_12_26_24):
      return 110  

    case (CAR_SHAPE_TRANSYS_14_24_24):      
      return (door && door.includes("WIDE")) ? 140 : 110
      
    case (CAR_SHAPE_TRANSYS_15_27_24):
      return 140

      case (CAR_SHAPE_WIDE_16_20_24):
      return 100

    default:
      return 90
  }
}

export function getDoorHeight(carShape) {
    switch (carShape) {
      case (CAR_SHAPE_INDIA_11_10_22):
        return 200

      case (CAR_SHAPE_INDIA_11_13_22):
        return 200

        case (CAR_SHAPE_INDIA_13_24_22):
        return 200

        case (CAR_SHAPE_INDIA_16_15_22):
        return 200

      case (CAR_SHAPE_INDIA_11_20_22):
        return 200
  
      case (CAR_SHAPE_INDIA_16_13_22):
        return 200

      case (CAR_SHAPE_HOMELIFT_9_12_24):
        return 210

      case (CAR_SHAPE_NANOSPACE_11_10_21):
        return 200

      case (CAR_SHAPE_DEEP):
        return 210
    
      case (CAR_SHAPE_SQUARE):
        return 210

      case (CAR_SHAPE_SQUARE_10_13_24):
        return 210
    
      case (CAR_SHAPE_WIDE):
        return 210

      case (CAR_SHAPE_WIDE_23_17_26):
        return 210

      case (CAR_SHAPE_WIDE_ENA_19_16_24):
        return 210

      case (CAR_SHAPE_WIDE_ENA_20_13_24):
        return 210

      case (CAR_SHAPE_4500HMC_ENA_17_25_24):
        return 210  
    
      case (CAR_SHAPE_DEEP_AU_14_20_24):
        return 210
    
      case (CAR_SHAPE_WIDE_AU_14_16_24):
        return 210

    default:
      return 210
  }
}

export function getFrame(design) {
  return (design.components.find(item => item.componentType === TYP_LDO_FRAME_FRONT) || {}).component  
}

export function getDoorTransformation(t, door, carShape) {
  let offsetX = 0;
  let doorType = {};

  //const doorType = (door === "2L" || door === "2L_GLASS" || door === "4L") ? 'L' :'C'
  if (door === "2L" || door === "2L_GLASS" || door === "4L" || door === "4L_GLASS" || door === "2L_WIDE" || door === "2L_WIDE_GLASS" ) {
    doorType = 'L'
  } else if (door === "2R" || door === "2R_GLASS" || door === "4R" || door === "4R_GLASS" || door === "2R_WIDE" || door === "2R_WIDE_GLASS") {
    doorType = 'R'
  } else  if (door === "0L") {
    doorType = '0L'
  } else  if (door === "0R") {
    doorType = '0R'
  } 
  else {
    doorType = 'C'
  }
  const key = `${carShape}.${doorType}`

  // HOME, offset ~0
  // DEEP, offset 5.27
  // SQUARE, offset 5.27
  // WIDE, offset ~0
  // AU WIDE, offset ~0
  // AU DEEP, offset ~0
  
  switch (key) {
    case (`${CAR_SHAPE_HOMELIFT_9_12_24}.L`):
      offsetX = 0
      break

    case (`${CAR_SHAPE_DEEP}.L`):
      offsetX = 5.27
      break
  
    case (`${CAR_SHAPE_SQUARE}.L`):
      offsetX = 5.27
      break

    case (`${CAR_SHAPE_SQUARE_10_13_24}.L`):
      offsetX = 0
      break  
  
    case (`${CAR_SHAPE_WIDE}.L`):
      offsetX = 0
      break

    case (`${CAR_SHAPE_WIDE_23_17_26}.L`):
      offsetX = 0
      break

    case (`${CAR_SHAPE_HOMELIFT_9_12_24}.R`):
      offsetX = 0
      break

    case (`${CAR_SHAPE_DEEP}.R`):
      offsetX = 5.27
      break
  
    case (`${CAR_SHAPE_SQUARE}.R`):
      offsetX = 5.27
      break

    case (`${CAR_SHAPE_SQUARE}.R`):
      offsetX = 0
      break  
  
    case (`${CAR_SHAPE_WIDE}.R`):
      offsetX = 0
      break

    case (`${CAR_SHAPE_WIDE_23_17_26}.R`):
      offsetX = 0
      break

    case (`${CAR_SHAPE_WIDE_ENA_19_16_24}.L`):
      offsetX = -45.734
      break

    case (`${CAR_SHAPE_WIDE_ENA_19_16_24}.R`):
      offsetX = 45.734
      break

    case (`${CAR_SHAPE_WIDE_ENA_19_16_24}.0L`):
      offsetX = -45.734
      break
    
    case (`${CAR_SHAPE_WIDE_ENA_19_16_24}.0R`):
      offsetX = 45.734
      break  

    case (`${CAR_SHAPE_WIDE_ENA_20_13_24}.L`):
      offsetX = -49.884
      break

    case (`${CAR_SHAPE_WIDE_ENA_20_13_24}.R`):
      offsetX = 49.884
      break

    case (`${CAR_SHAPE_WIDE_ENA_20_13_24}.0L`):
      offsetX = -49.884
      break

    case (`${CAR_SHAPE_WIDE_ENA_20_13_24}.0R`):
      offsetX = 49.884
      break

    case (`${CAR_SHAPE_4500HMC_ENA_17_25_24}.0L`):
      offsetX = -28.753
      break
    
    case (`${CAR_SHAPE_4500HMC_ENA_17_25_24}.0R`):
      offsetX = 28.753
      break 
      
    case (`${CAR_SHAPE_4500HMC_ENA_17_25_24}.L`):
      offsetX = -28.753
      break
    
    case (`${CAR_SHAPE_4500HMC_ENA_17_25_24}.R`):
      offsetX = 28.753
      break

    case (`${CAR_SHAPE_DEEP_AU_14_20_24}.L`):
      offsetX = 0
      break
  
    case (`${CAR_SHAPE_WIDE_AU_14_16_24}.L`):
      offsetX = 0
      break

    case (`${CAR_SHAPE_DEEP_AU_14_20_24}.R`):
      offsetX = 0
      break

    case (`${CAR_SHAPE_WIDE_AU_14_16_24}.R`):
      offsetX = 0
      break

    case (`${CAR_SHAPE_TRANSYS_12_23_24}.L`):
      offsetX = 2.5
      break

    case (`${CAR_SHAPE_TRANSYS_12_23_24}.R`):
      offsetX = 2.5
      break

    case (`${CAR_SHAPE_TRANSYS_12_26_24}.L`):
      offsetX = 2.5
      break

  case (`${CAR_SHAPE_TRANSYS_12_26_24}.R`):
      offsetX = 2.5
      break 
  }  
  
  return {
    ...t,
    position: [
      t.position[0] + offsetX,
      t.position[1],
      t.position[2]
    ]
  }
}

export function getWorldTransformation(t) {
  return {
    ...t,
    position: [
      t.position[0],
      t.position[1],
      t.position[2] + 61
    ],
    rotation: [
      t.rotation[0],
      t.rotation[1] - (Math.PI / 2),
      t.rotation[2]           
    ]
  }
}

export function getOffsetTransformation(t, o) {
  return {
    ...t,
    position: [
      t.position[0] + o[0],
      t.position[1] + o[1],
      t.position[2] + o[2]
    ]
  }
}

export function getTransformation(options) {
  if (!options) {
    return undefined
  }
  
  const { componentType, design } = options
  
  switch (componentType) {
    case TYP_HI_PRODUCT:      
      return getHlTransformation({ ...options, door: getDoor(design), frame: getFrame(design) });
      
    case TYP_HL_PRODUCT:      
      return getHlTransformation({ ...options, door: getDoor(design), frame: getFrame(design) });
      
    case TYP_LCS_PRODUCT:
      return getLcsTransformation({ ...options, door: getDoor(design), frame: getFrame(design) });

    case TYP_FB:
      return getFbTransformation({ ...options, door: getDoor(design), frame: getFrame(design) });
      
    case TYP_EID_PRODUCT:
      return getEidTransformation({ ...options, door: getDoor(design), frame: getFrame(design) });
      
    case TYP_DOP_PRODUCT:
      return getDopTransformation({ ...options, door: getDoor(design), frame: getFrame(design) });

    case TYP_DIN_PRODUCT:
      return getDinTransformation({ ...options, door: getDoor(design), frame: getFrame(design) });
  
    default:
      return undefined;
  }
}