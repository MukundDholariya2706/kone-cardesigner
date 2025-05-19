import { 
  getDoorTransformation, 
  getWorldTransformation, 
  getOffsetTransformation, 
  getDoorWidth, 
  OFFSET_X_FROM_DOOR_FRAME,
  OFFSET_Z_FROM_WALL,
  OFFSET_Z_FROM_DOOR_2FRAME,
  W_1FRAME,
  W_2FRAME_INNER, 
  W_2FRAME_OUTTER,
  W_2FRAME_INNER_NARROW,
  W_2FRAME_INNER_WIDE,
  W_3FRAME, 
  FB_X,
  FB_X_LEFT_CORRECTION,
  FB_X_FRAME_CENTER,
  DOOR_2_OFFSET_X,
} from ".";

import { MIDDLE_RIGHT, MIDDLE_RIGHT_FRAME, MIDDLE_LEFT, MIDDLE_LEFT_FRAME, MIDDLE_BETWEEN_DOORS } from "../../../constants";

export function getTransformation({ door, frame, positions, offset, design: { carShape } = {} }) {
  
  const pos = positions[0] ? positions[0] : MIDDLE_RIGHT
  const doorWidth = getDoorWidth(carShape, door)
  
  let offsetX = doorWidth / 2 + OFFSET_X_FROM_DOOR_FRAME;
  let dir = (pos === MIDDLE_RIGHT || pos === MIDDLE_RIGHT_FRAME || pos === MIDDLE_BETWEEN_DOORS) ? 1 : -1;

  let offsetZ = 0

  if (pos === MIDDLE_BETWEEN_DOORS) {
    offsetX = (DOOR_2_OFFSET_X / 2) - 8.6
  } else {   
    let frameMount = (pos === MIDDLE_LEFT_FRAME || pos === MIDDLE_RIGHT_FRAME);
    let isLDoor = (door === "2L" || door === "2L_GLASS" || door === "4L" || door === "2L_WIDE" || door === "2L_WIDE_GLASS" || door === "4L_GLASS");
    let isRDoor = (door === "2R" || door === "2R_GLASS" || door === "4R" || door === "2R_WIDE" || door === "2R_WIDE_GLASS" || door === "4R_GLASS");

    if(pos === MIDDLE_LEFT_FRAME || pos === MIDDLE_LEFT) {
      offsetX +=FB_X_LEFT_CORRECTION
    }

    (frame === '3FRAME') && (offsetX += W_3FRAME);

    (frame === '1FRAME' ) && (offsetX += W_1FRAME);
    ((frame === '2FRAME' || frame === '4FRAME') && frameMount) && (offsetZ = -OFFSET_Z_FROM_DOOR_2FRAME);

    if (isLDoor) {
      if (dir > 0) {
        ((frame === '2FRAME' || frame === '4FRAME')) && (offsetX += W_2FRAME_INNER_NARROW + W_2FRAME_OUTTER);
        ((frame === '2FRAME' || frame === '4FRAME') && frameMount) && (offsetZ = 0);
      } else {
        ((frame === '2FRAME' || frame === '4FRAME') && frameMount) && (offsetX += W_2FRAME_INNER_WIDE / 2 - OFFSET_X_FROM_DOOR_FRAME - FB_X_FRAME_CENTER);
        ((frame === '2FRAME' || frame === '4FRAME') && !frameMount ) && (offsetX += W_2FRAME_INNER_WIDE + W_2FRAME_OUTTER);
      }
    } else if (isRDoor) {
      if (dir > 0) {
        ((frame === '2FRAME' || frame === '4FRAME') && frameMount) && (offsetX += W_2FRAME_INNER_WIDE / 2 - OFFSET_X_FROM_DOOR_FRAME - FB_X_FRAME_CENTER);
        ((frame === '2FRAME' || frame === '4FRAME') && !frameMount ) && (offsetX += W_2FRAME_INNER_WIDE + W_2FRAME_OUTTER);
      } else {
        ((frame === '2FRAME' || frame === '4FRAME') ) && (offsetX += W_2FRAME_INNER_NARROW + W_2FRAME_OUTTER);
        ((frame === '2FRAME' || frame === '4FRAME') && frameMount) && (offsetZ = 0);
      }
    } else {
      ((frame === '2FRAME' || frame === '4FRAME') && frameMount) && (offsetX += W_2FRAME_INNER / 2 - OFFSET_X_FROM_DOOR_FRAME - FB_X_FRAME_CENTER);
      ((frame === '2FRAME' || frame === '4FRAME') && !frameMount ) && (offsetX += W_2FRAME_INNER + W_2FRAME_OUTTER);
    }
  }

  let transformation = {
    position: [dir * offsetX, FB_X, -OFFSET_Z_FROM_WALL+offsetZ],
    rotation: [0, 0, 0],
  }

  transformation = getDoorTransformation( transformation, door, carShape )
  transformation = getWorldTransformation( transformation )
  transformation = getOffsetTransformation( transformation, offset )

  return transformation;
}