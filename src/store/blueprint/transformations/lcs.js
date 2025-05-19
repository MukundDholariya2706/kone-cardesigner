import { 
  getDoorTransformation, 
  getWorldTransformation, 
  getOffsetTransformation, 
  getDoorWidth, 
  OFFSET_X_FROM_DOOR_FRAME,
  OFFSET_Z_FROM_WALL,
  OFFSET_Z_FROM_DOOR_FRAME,
  OFFSET_Z_FROM_DOOR_1FRAME,
  OFFSET_Z_FROM_DOOR_1FRAME_4L,
  OFFSET_Z_FROM_DOOR_2FRAME,
  OFFSET_Z_FROM_DOOR_1FRAME_ENA,
  OFFSET_Z_FROM_DOOR_1FRAME_INDIA,
  OFFSET_Z_FROM_DOOR_2FRAME_INDIA,
  W_1FRAME,
  W_1FRAME_ENA,
  W_2FRAME_INNER, 
  W_2FRAME_OUTTER,
  W_2FRAME_INNER_NARROW,
  W_2FRAME_INNER_WIDE,
  W_2FRAME_INNER_LL1400,
  W_3FRAME, 
  LCS_X,
  DOOR_2_OFFSET_X,
} from ".";

import { MIDDLE_RIGHT, MIDDLE_RIGHT_FRAME, MIDDLE_LEFT_FRAME, MIDDLE_BETWEEN_DOORS,CAR_SHAPE_WIDE_ENA_19_16_24, CAR_SHAPE_WIDE_ENA_20_13_24, CAR_SHAPE_4500HMC_ENA_17_25_24,
  CAR_SHAPE_INDIA_11_10_22, CAR_SHAPE_INDIA_11_13_22, CAR_SHAPE_INDIA_11_20_22, CAR_SHAPE_INDIA_16_13_22, CAR_SHAPE_TRANSYS_14_24_24, CAR_SHAPE_TRANSYS_15_27_24 } from "../../../constants";

export function getTransformation({ door, frame, positions, offset, design: { carShape } = {} }) {
  
  const pos = positions[0] ? positions[0] : MIDDLE_RIGHT
  const doorWidth = getDoorWidth(carShape, door)
  
  let offsetX = doorWidth / 2 + OFFSET_X_FROM_DOOR_FRAME;
  let dir = (pos === MIDDLE_RIGHT || pos === MIDDLE_RIGHT_FRAME || pos === MIDDLE_BETWEEN_DOORS) ? 1 : -1;

  let offsetZ = 0

  let isLDoor = (door === "2L" || door === "2L_GLASS" || door === "4L" || door === "2L_WIDE" || door === "2L_WIDE_GLASS" || door === "4L_GLASS");
  let isRDoor = (door === "2R" || door === "2R_GLASS" || door === "4R" || door === "2R_WIDE" || door === "2R_WIDE_GLASS" || door === "4R_GLASS");

  if (pos === MIDDLE_BETWEEN_DOORS) {
    if (isLDoor && (frame === '2FRAME' || frame === '4FRAME')) {
      offsetX = (DOOR_2_OFFSET_X - 31) / 2
    } else if (isRDoor && (frame === '2FRAME' || frame === '4FRAME')) {
      offsetX = (DOOR_2_OFFSET_X + 31) / 2
    } else {
      offsetX = DOOR_2_OFFSET_X / 2
    }
  } else {   
    let frameMount = (pos === MIDDLE_LEFT_FRAME || pos === MIDDLE_RIGHT_FRAME);

    (frame === '3FRAME') && (offsetX += W_3FRAME);

    if (carShape === CAR_SHAPE_WIDE_ENA_19_16_24 || carShape === CAR_SHAPE_WIDE_ENA_20_13_24 || carShape === CAR_SHAPE_4500HMC_ENA_17_25_24 ) {
      (frame === '1FRAME' && frameMount) && (offsetX += W_1FRAME_ENA / 2 - OFFSET_X_FROM_DOOR_FRAME);
    } else {
      (frame === '1FRAME' && frameMount) && (offsetX += W_1FRAME / 2 - OFFSET_X_FROM_DOOR_FRAME);
    }

    if (door === '4L' || door === '4R' || door === "4L_GLASS" || door === "4R_GLASS") {
      (frame === '1FRAME' && frameMount) && (offsetZ = OFFSET_Z_FROM_DOOR_FRAME-OFFSET_Z_FROM_DOOR_1FRAME_4L);
    } else if (carShape === CAR_SHAPE_WIDE_ENA_19_16_24 || carShape === CAR_SHAPE_WIDE_ENA_20_13_24 || carShape === CAR_SHAPE_4500HMC_ENA_17_25_24)  {
      (frame === '1FRAME' && frameMount) && (offsetZ = -OFFSET_Z_FROM_DOOR_1FRAME_ENA);
    } else if (carShape === CAR_SHAPE_INDIA_11_10_22 || carShape === CAR_SHAPE_INDIA_11_20_22 || carShape === CAR_SHAPE_INDIA_16_13_22 || carShape === CAR_SHAPE_INDIA_11_13_22) {
      (frame === '1FRAME' && frameMount) && (offsetZ = -OFFSET_Z_FROM_DOOR_1FRAME_INDIA);
    } else {
      (frame === '1FRAME' && frameMount) && (offsetZ = OFFSET_Z_FROM_DOOR_FRAME-OFFSET_Z_FROM_DOOR_1FRAME);
    }

    (frame === '1FRAME' && !frameMount ) && (offsetX += W_1FRAME);

    if (carShape === CAR_SHAPE_INDIA_11_10_22 || carShape === CAR_SHAPE_INDIA_11_20_22 || carShape === CAR_SHAPE_INDIA_16_13_22 || carShape === CAR_SHAPE_INDIA_11_13_22) {
      ((frame === '2FRAME' || frame === '4FRAME') && frameMount) && (offsetZ = -OFFSET_Z_FROM_DOOR_2FRAME_INDIA);
    } else {
      ((frame === '2FRAME' || frame === '4FRAME') && frameMount) && (offsetZ = -OFFSET_Z_FROM_DOOR_2FRAME);
    }

    if (isLDoor) {
      if (dir > 0) {
        ((frame === '2FRAME' || frame === '4FRAME') && frameMount) && (offsetX += W_2FRAME_INNER_NARROW / 2 - OFFSET_X_FROM_DOOR_FRAME);
        ((frame === '2FRAME' || frame === '4FRAME') && !frameMount ) && (offsetX += W_2FRAME_INNER_NARROW + W_2FRAME_OUTTER);
      } else {
        ((frame === '2FRAME' || frame === '4FRAME') && frameMount) && (offsetX += W_2FRAME_INNER_WIDE / 2 - OFFSET_X_FROM_DOOR_FRAME);
        ((frame === '2FRAME' || frame === '4FRAME') && !frameMount ) && (offsetX += W_2FRAME_INNER_WIDE + W_2FRAME_OUTTER);
      }
    } else if (isRDoor) {
      if (dir > 0) {
        ((frame === '2FRAME' || frame === '4FRAME') && frameMount) && (offsetX += W_2FRAME_INNER_WIDE / 2 - OFFSET_X_FROM_DOOR_FRAME);
        ((frame === '2FRAME' || frame === '4FRAME') && !frameMount ) && (offsetX += W_2FRAME_INNER_WIDE + W_2FRAME_OUTTER);
      } else {
        ((frame === '2FRAME' || frame === '4FRAME') && frameMount) && (offsetX += W_2FRAME_INNER_NARROW / 2 - OFFSET_X_FROM_DOOR_FRAME);
        ((frame === '2FRAME' || frame === '4FRAME') && !frameMount ) && (offsetX += W_2FRAME_INNER_NARROW + W_2FRAME_OUTTER);
      }
    } else if (carShape === CAR_SHAPE_TRANSYS_14_24_24 || carShape === CAR_SHAPE_TRANSYS_15_27_24) {
      ((frame === '2FRAME' || frame === '4FRAME') && frameMount) && (offsetX += W_2FRAME_INNER_LL1400 / 2 - OFFSET_X_FROM_DOOR_FRAME);
      ((frame === '2FRAME' || frame === '4FRAME') && !frameMount ) && (offsetX += W_2FRAME_INNER_LL1400 + W_2FRAME_OUTTER);
    }
    else {
      ((frame === '2FRAME' || frame === '4FRAME') && frameMount) && (offsetX += W_2FRAME_INNER / 2 - OFFSET_X_FROM_DOOR_FRAME);
      ((frame === '2FRAME' || frame === '4FRAME') && !frameMount ) && (offsetX += W_2FRAME_INNER + W_2FRAME_OUTTER);
    }
  }

  let transformation = {
    position: [dir * offsetX, LCS_X, -OFFSET_Z_FROM_WALL+offsetZ],
    rotation: [0, 0, 0],
  }

  transformation = getDoorTransformation( transformation, door, carShape )
  transformation = getWorldTransformation( transformation )
  transformation = getOffsetTransformation( transformation, offset )

  return transformation;
}