import { 
  getDoorTransformation, 
  getWorldTransformation, 
  getOffsetTransformation, 
  getDoorHeight,
  getDoorWidth,
  OFFSET_Y_FROM_DOOR_FRAME,
  OFFSET_Z_FROM_WALL,
  OFFSET_Z_FROM_DOOR_FRAME,
  OFFSET_Z_FROM_DOOR_1FRAME,
  OFFSET_Z_FROM_DOOR_1FRAME_ENA,
  OFFSET_Z_FROM_DOOR_1FRAME_4L,
  OFFSET_Z_FROM_DOOR_2FRAME,
  H_1FRAME,
  H_1FRAME_ENA,
  H_2FRAME_INNER,
  H_2FRAME_OUTTER,
  W_2FRAME_OUTTER,
  W_2FRAME_INNER,
  W_2FRAME_INNER_NARROW,
  W_2FRAME_INNER_WIDE,
  W_2FRAME_INNER_LL1400,
  H_3FRAME,
  OFFSET_X_FROM_DOOR_FRAME,
  W_3FRAME,
  W_1FRAME,
  W_1FRAME_ENA
} from ".";

import { TOP_CENTER, TOP_CENTER_FRAME, TOP_RIGHT, TOP_RIGHT_FRAME, TOP_LEFT_FRAME, CAR_SHAPE_WIDE_ENA_19_16_24 
  ,CAR_SHAPE_WIDE_ENA_20_13_24, CAR_SHAPE_4500HMC_ENA_17_25_24, CAR_SHAPE_TRANSYS_14_24_24, CAR_SHAPE_TRANSYS_15_27_24 } from "../../../constants";

export function getTransformation({ door, frame, positions, offset, design: { carShape } = {} }) {

  const pos = positions[0] ? positions[0] : TOP_CENTER
  const doorHeight = getDoorHeight(carShape)

  let offsetX = 0;
  let offsetY = doorHeight + OFFSET_Y_FROM_DOOR_FRAME;

  let offsetZ=0

  let dir = (pos === TOP_CENTER || pos === TOP_CENTER_FRAME) ? 0 : (pos === TOP_RIGHT || pos === TOP_RIGHT_FRAME) ? 1 : -1;

  if (dir !== 0) {
    const doorWidth = getDoorWidth(carShape, door)
    offsetX = doorWidth / 2 + OFFSET_X_FROM_DOOR_FRAME;
    offsetY = doorHeight - OFFSET_Y_FROM_DOOR_FRAME;
  }

  let frameMount = (pos === TOP_LEFT_FRAME || pos === TOP_RIGHT_FRAME || pos === TOP_CENTER_FRAME);
  let isLDoor = (door === "2L" || door === "2L_GLASS" || door === "4L" || door === "2L_WIDE" || door === "2L_WIDE_GLASS" || door === "4L_GLASS");
  let isRDoor = (door === "2R" || door === "2R_GLASS" || door === "4R" || door === "2R_WIDE" || door === "2R_WIDE_GLASS" || door === "4R_GLASS");

  if (pos === TOP_CENTER) {
    (frame === '1FRAME') && (offsetY += H_1FRAME);
    (frame === '2FRAME') && (offsetY += H_2FRAME_INNER + H_2FRAME_OUTTER);
    (frame === '3FRAME') && (offsetY += H_3FRAME);
  }

  if (pos === TOP_CENTER_FRAME && carShape === CAR_SHAPE_WIDE_ENA_19_16_24 || carShape === CAR_SHAPE_WIDE_ENA_20_13_24 || carShape === CAR_SHAPE_4500HMC_ENA_17_25_24) {
    (frame === '1FRAME') && (offsetY += H_1FRAME_ENA / 2 - OFFSET_Y_FROM_DOOR_FRAME);
    (frame === '2FRAME') && (offsetY += H_2FRAME_INNER / 2  - OFFSET_Y_FROM_DOOR_FRAME);
    (frame === '4FRAME') && (offsetY += H_2FRAME_INNER / 2  - OFFSET_Y_FROM_DOOR_FRAME);
  } else {
    (frame === '1FRAME') && (offsetY += H_1FRAME / 2 - OFFSET_Y_FROM_DOOR_FRAME);
    (frame === '2FRAME') && (offsetY += H_2FRAME_INNER / 2  - OFFSET_Y_FROM_DOOR_FRAME);
    (frame === '4FRAME') && (offsetY += H_2FRAME_INNER / 2  - OFFSET_Y_FROM_DOOR_FRAME);
  }


  (frame === '3FRAME') && (offsetX += W_3FRAME);

  if (carShape === CAR_SHAPE_WIDE_ENA_19_16_24 || carShape === CAR_SHAPE_WIDE_ENA_20_13_24 || carShape === CAR_SHAPE_4500HMC_ENA_17_25_24) {
    (frame === '1FRAME' && frameMount) && (offsetX += W_1FRAME_ENA / 2 - OFFSET_X_FROM_DOOR_FRAME);
  } else {
    (frame === '1FRAME' && frameMount) && (offsetX += W_1FRAME / 2 - OFFSET_X_FROM_DOOR_FRAME);
  }
  
  if (door === '4L' || door === '4R' || door === "4L_GLASS" || door === "4R_GLASS") {
    (frame === '1FRAME' && frameMount) && (offsetZ = OFFSET_Z_FROM_DOOR_FRAME-OFFSET_Z_FROM_DOOR_1FRAME_4L);
  } else if (carShape === CAR_SHAPE_WIDE_ENA_19_16_24 || carShape === CAR_SHAPE_WIDE_ENA_20_13_24 || carShape === CAR_SHAPE_4500HMC_ENA_17_25_24) {
    (frame === '1FRAME' && frameMount) && (offsetZ = -OFFSET_Z_FROM_DOOR_1FRAME_ENA);
  } else {
    (frame === '1FRAME' && frameMount) && (offsetZ = OFFSET_Z_FROM_DOOR_FRAME-OFFSET_Z_FROM_DOOR_1FRAME);
  }
  
  (frame === '1FRAME' && !frameMount ) && (offsetX += W_1FRAME);

  ((frame === '2FRAME' || frame === '4FRAME') && frameMount) && (offsetZ = -OFFSET_Z_FROM_DOOR_2FRAME);
  
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

  let transformation = {
    position: [dir * offsetX, offsetY, -OFFSET_Z_FROM_WALL+offsetZ],
    rotation: [0, 0, 0],
  }

  
  transformation = getDoorTransformation( transformation, door, carShape )
  transformation = getWorldTransformation( transformation )
  transformation = getOffsetTransformation( transformation, offset )

  return transformation
}