import { 
  getDoorTransformation, 
  getWorldTransformation, 
  getOffsetTransformation,
  getDoorHeight,
  OFFSET_Z_FROM_WALL,
  OFFSET_Y_FROM_DOOR_FRAME,
  OFFSET_Z_FROM_DOOR_FRAME,
  OFFSET_Z_FROM_DOOR_1FRAME,
  OFFSET_Z_FROM_DOOR_1FRAME_4L,
  OFFSET_Z_FROM_DOOR_1FRAME_ENA,
  OFFSET_Z_FROM_DOOR_2FRAME,
  H_3FRAME,
  H_1FRAME,
  H_2FRAME_INNER,
  H_2FRAME_OUTTER, 
} from ".";

import { TOP_CENTER, TOP_CENTER_FRAME, CAR_SHAPE_WIDE_ENA_19_16_24 ,CAR_SHAPE_WIDE_ENA_20_13_24 } from "../../../constants";

export function getTransformation({ door, frame, positions, offset, design: { carShape } = {} }) {

  const pos = positions[0] ? positions[0] : TOP_CENTER
  const doorHeight = getDoorHeight(carShape)
  
  let offsetX = 0;
  let offsetY = doorHeight + OFFSET_Y_FROM_DOOR_FRAME;
  let offsetZ = 0;

  let dir = 0;

  let frameMount = (pos === TOP_CENTER_FRAME);

  if (pos === TOP_CENTER) {
    (frame === '1FRAME') && (offsetY += H_1FRAME);
    (frame === '2FRAME') && (offsetY += H_2FRAME_INNER + H_2FRAME_OUTTER);
    (frame === '3FRAME') && (offsetY += H_3FRAME);
  }

  if (pos === TOP_CENTER_FRAME) {
    (frame === '1FRAME') && (offsetY += H_1FRAME / 2 - OFFSET_Y_FROM_DOOR_FRAME);
    (frame === '2FRAME') && (offsetY += H_2FRAME_INNER / 2  - OFFSET_Y_FROM_DOOR_FRAME);
    (frame === '4FRAME') && (offsetY += H_2FRAME_INNER / 2  - OFFSET_Y_FROM_DOOR_FRAME);
  }

  if (door === '4L' || door === '4R') {
    (frame === '1FRAME' && frameMount) && (offsetZ = OFFSET_Z_FROM_DOOR_FRAME-OFFSET_Z_FROM_DOOR_1FRAME_4L);
  } else if (carShape === CAR_SHAPE_WIDE_ENA_19_16_24 || carShape === CAR_SHAPE_WIDE_ENA_20_13_24) {
    (frame === '1FRAME' && frameMount) && (offsetZ = -OFFSET_Z_FROM_DOOR_1FRAME_ENA);
  } else {
    (frame === '1FRAME' && frameMount) && (offsetZ = OFFSET_Z_FROM_DOOR_FRAME-OFFSET_Z_FROM_DOOR_1FRAME);
  }

  ((frame === '2FRAME' || frame === '4FRAME') && frameMount) && (offsetZ = -OFFSET_Z_FROM_DOOR_2FRAME);

  let transformation = {
    position: [dir * offsetX, offsetY, -OFFSET_Z_FROM_WALL+offsetZ],
    rotation: [0, 0, 0],
  }
  
  transformation = getDoorTransformation( transformation, door, carShape )
  transformation = getWorldTransformation( transformation )
  transformation = getOffsetTransformation( transformation, offset )

  return transformation
}