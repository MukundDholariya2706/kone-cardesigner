import { 
  getDoorTransformation, 
  getWorldTransformation, 
  getOffsetTransformation, 
  getDoorWidth,
  getDoorHeight,
  OFFSET_Z_FROM_WALL,
  OFFSET_Z_FROM_DOOR_FRAME,
  OFFSET_Z_FROM_DOOR_1FRAME,
  OFFSET_Z_FROM_DOOR_1FRAME_4L,
  OFFSET_Z_FROM_DOOR_1FRAME_ENA,
  OFFSET_Z_FROM_DOOR_2FRAME,
  OFFSET_X_FROM_DOOR_FRAME, 
  W_1FRAME, 
  W_2FRAME_INNER, 
  W_2FRAME_OUTTER,
  W_2FRAME_INNER_NARROW,
  W_2FRAME_INNER_WIDE,
  W_3FRAME, 
} from ".";

import { TOP_RIGHT, TOP_RIGHT_FRAME, TOP_LEFT_FRAME, CAR_SHAPE_WIDE_ENA_19_16_24 ,CAR_SHAPE_WIDE_ENA_20_13_24 } from "../../../constants";

export function getTransformation({ door, frame, positions, offset, design: { carShape } = {} }) {

  const pos = positions[0] ? positions[0] : TOP_RIGHT
  const doorWidth = getDoorWidth(carShape, door)
  
  let offsetX = doorWidth / 2 + OFFSET_X_FROM_DOOR_FRAME;
  let offsetY = getDoorHeight(carShape)
  let offsetZ = 0;

  let dir = (pos === TOP_RIGHT || pos === TOP_RIGHT_FRAME) ? 1 : -1;
  let frameMount = (pos === TOP_LEFT_FRAME || pos === TOP_RIGHT_FRAME);
  let isLDoor = (door === "2L" || door === "2L_GLASS" || door === "4L" || door === "2L_WIDE" || door === "2L_WIDE_GLASS" || door === "4L_GLASS");
  let isRDoor = (door === "2R" || door === "2R_GLASS" || door === "4R" || door === "2R_WIDE" || door === "2R_WIDE_GLASS" || door === "4R_GLASS");
  
  (frame === '3FRAME') && (offsetX += W_3FRAME);
  (frame === '1FRAME' && frameMount) && (offsetX += W_1FRAME / 2 - OFFSET_X_FROM_DOOR_FRAME);
  (frame === '1FRAME' && !frameMount ) && (offsetX += W_1FRAME);

  if (door === '4L' || door === '4R' || door === "4L_GLASS" || door === "4R_GLASS") {
    (frame === '1FRAME' && frameMount) && (offsetZ = OFFSET_Z_FROM_DOOR_FRAME-OFFSET_Z_FROM_DOOR_1FRAME_4L);
  } else if (carShape === CAR_SHAPE_WIDE_ENA_19_16_24 || carShape === CAR_SHAPE_WIDE_ENA_20_13_24) {
    (frame === '1FRAME' && frameMount) && (offsetZ = -OFFSET_Z_FROM_DOOR_1FRAME_ENA);
  } else {
    (frame === '1FRAME' && frameMount) && (offsetZ = OFFSET_Z_FROM_DOOR_FRAME-OFFSET_Z_FROM_DOOR_1FRAME);
  }

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
  } else {
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