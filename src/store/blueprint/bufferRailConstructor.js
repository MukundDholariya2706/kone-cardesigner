
import jsonLogic from 'json-logic-js';

import { TYP_COP_PRODUCT_1, TYP_COP_2, TYP_CAR_BUFFER_RAIL, CAR_SHAPES, ENDPIECE, BODY, TYP_CAR_WALL_ADD_DECO_PACKAGE} from "../../constants";

export function getBufferRailPieces(design, product, rules) {

  if(!design || !design.components) {
    return [];
  }

  const brPositions = ( design.components.find(item => item.componentType === TYP_CAR_BUFFER_RAIL) || {} ).positions;

  if(!brPositions) {
    return []
  }

  let brPieces=[];
  const shape = CAR_SHAPES.find(item => item.id === design.carShape);

  const deco = ( design.components.find(item => item.componentType === TYP_CAR_WALL_ADD_DECO_PACKAGE) || {} ).component || null;
  const copId = ( design.components.find(item => item.componentType === TYP_COP_PRODUCT_1) || {} ).component;
  const cop2Id = ( design.components.find(item => item.componentType === TYP_COP_2) || {} ).component;
  const cop1Position = ( design.components.find(item => item.componentType === TYP_COP_PRODUCT_1) || {} ).positions;
  const cop2Position = ( design.components.find(item => item.componentType === TYP_COP_2) || {} ).positions;
  const cops = cop1Position.concat( (cop2Position || []) ).sort();
  const copsAsString = cops.join('');
  const cops2AsString = (cop2Position || []).join('');

  const brId = (design.components.find(item => item.componentType === TYP_CAR_BUFFER_RAIL) || {}).component;
  
  if(brPositions.indexOf('D') !== -1) {
    const test = { WALL: "D", PRODUCT: product, WIDTH: shape.depth, COP_POSITIONS: copsAsString, DECO: deco, COP: copId, BR_POS: brPositions, COP2: cop2Id, COP2_POS: cops2AsString }
    console.log(test)
    console.log(jsonLogic.apply(rules.bufferRails, test))
    console.log({l:rules.bufferRails})
    const bufferrails = (rules && rules.bufferRails) ? jsonLogic.apply(rules.bufferRails, test) : []
    for(let i=0;i<bufferrails.length;i++) {
      const identifier = brId+'_'+i.toString()+'_'+(bufferrails[i][2]).toString()
      brPieces.push({piece:ENDPIECE, position:[ -shape.width/2, bufferrails[i][2], bufferrails[i][0]], rotation:[0,0,0], scale:[1,1,1], id:'D_'+identifier+'_START', hideGroup:'d'})
      brPieces.push({piece:BODY, connect:{from:'D_'+identifier+'_START' , to:'D_'+identifier+'_END'}, id:'D_'+identifier+'_BODY', hideGroup:'d'})
      brPieces.push({piece:ENDPIECE, position:[ -shape.width/2, bufferrails[i][2], bufferrails[i][1]], rotation:[0,0,0], scale:[1,1,-1], id:'D_'+identifier+'_END', hideGroup:'d'})
    }
  }

  if(brPositions.indexOf('C') !== -1) {
    const test = { WALL: "C", PRODUCT: product, WIDTH: shape.width, COP_POSITIONS: copsAsString, DECO:deco, COP:copId, BR_POS: brPositions, COP2:cop2Id, COP2_POS:cops2AsString}
    const bufferrails = (rules && rules.bufferRails) ? jsonLogic.apply(rules.bufferRails, test) : []
    for(let i=0;i<bufferrails.length;i++) {
      const identifier = brId+'_'+i.toString()+'_'+(bufferrails[i][2]).toString()
      brPieces.push({piece:ENDPIECE, position:[ bufferrails[i][0], bufferrails[i][2], -shape.depth], rotation:[0,-Math.PI/2,0], scale:[1,1,1], id:'C_'+identifier+'_START', hideGroup:'c'})
      brPieces.push({piece:BODY, connect:{from:'C_'+identifier+'_START' , to:'C_'+identifier+'_END'}, id:'C_'+identifier+'_BODY', hideGroup:'c'})
      brPieces.push({piece:ENDPIECE, position:[ bufferrails[i][1], bufferrails[i][2], -shape.depth], rotation:[0,-Math.PI/2,0], scale:[1,1,-1], id:'C_'+identifier+'_END', hideGroup:'c'})
    }

  }

  if(brPositions.indexOf('B') !== -1) {
    const test = { WALL: "B", PRODUCT: product, WIDTH: shape.depth, COP_POSITIONS: copsAsString, DECO:deco, COP:copId, BR_POS: brPositions, COP2:cop2Id, COP2_POS:cops2AsString}
    const bufferrails = (rules && rules.bufferRails) ? jsonLogic.apply(rules.bufferRails, test) : []
    // console.log({bufferrails})
    for(let i=0;i<bufferrails.length;i++) {
      const identifier = brId+'_'+i.toString()+'_'+(bufferrails[i][2]).toString()

      brPieces.push({piece:ENDPIECE, position:[ shape.width/2, bufferrails[i][2], bufferrails[i][0]], rotation:[0,-Math.PI,0], scale:[1,1,1], id:'B_'+identifier+'_START', hideGroup:'b'})
      brPieces.push({piece:BODY, connect:{from:'B_'+identifier+'_START' , to:'B_'+identifier+'_END'}, id:'B_'+identifier+'_BODY', hideGroup:'b'})
      brPieces.push({piece:ENDPIECE, position:[ shape.width/2, bufferrails[i][2], bufferrails[i][1]], rotation:[0,-Math.PI,0], scale:[1,1,-1], id:'B_'+identifier+'_END', hideGroup:'b'})
    }

  }


  return brPieces;
}