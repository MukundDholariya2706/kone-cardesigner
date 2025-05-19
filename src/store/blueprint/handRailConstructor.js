import jsonLogic from 'json-logic-js';

import {TYP_CAR_HANDRAIL, TYP_COP_PRODUCT_1, TYP_COP_2, CAR_SHAPES, ENDPIECE, BODY, TYP_CAR_WALL_ADD_DECO_PACKAGE, TYP_COP_HORIZONTAL,
        CORNER_START, CORNER_END, MIDDLE, ENDPIECE_CWALL, CORNER_START_REVERSE, GLASS_C_FHT, CORNER_END_FHT, BODY_FHT,
        ENDPIECE_CWALL_FHT, TYP_CAR_GLASS_WALL_C, ENDPIECE_REGULATION, BODY_REGULATION, TYP_CAR_WALL_C, FIXING, CORNER_START_NOFIXING, CORNER_START_NOFIXING_REVERSE,
        DEFAULT_GLASS_C_WALL, DEFAULT_GLASS_C_WALL_HERMES } from "../../constants";

import { isTrueTypeCar } from '../../utils/design-utils'

const EXTRA_FIXING = 124.4 / 2

export function getHandrailPieces(design, product, rules, options) {

  if(!design || !design.components) {
    return [];
  }
  const hrPositions = options.calculateForKSSH
                        ? ( design.components.find(item => item.componentType === TYP_COP_HORIZONTAL) || {} ).positions.includes('BX')
                          ? 'B'
                          : 'D'
                        : ( design.components.find(item => item.componentType === TYP_CAR_HANDRAIL) || {} ).positions

  if(!hrPositions) {
    return []
  }

  let hrPieces=[];
  const shape = CAR_SHAPES.find(item => item.id === design.carShape);

  const deco = ( design.components.find(item => item.componentType === TYP_CAR_WALL_ADD_DECO_PACKAGE) || {} ).component || null;
  const glassBackWall = ( design.components.find(item => item.componentType === TYP_CAR_GLASS_WALL_C) || {} ).component || null;
  const cop1Position = ( design.components.find(item => item.componentType === TYP_COP_PRODUCT_1) || {} ).positions || [];
  const cop2Position = (( design.components.find(item => item.componentType === TYP_COP_2) || {} ).positions || []).join('');
  const cops = cop1Position.concat( (cop2Position || []) ).sort();
  const copsAsString = cops.join('');
  const regulations = (design.regulations && design.regulations.length>0) ?design.regulations :[]
  const cWallFinish = (design.components.find(item => item.componentType === TYP_CAR_WALL_C) || {} ).finish

  const hrId = options.calculateForKSSH
                ? `KSSH-${options?.hrTypeDefinition}`
                : ( design.components.find(item => item.componentType === TYP_CAR_HANDRAIL) || {} ).component
  const copId = ( design.components.find(item => item.componentType === TYP_COP_PRODUCT_1) || {} ).component;

  const scenicPositions = ((design.components.find(item => item.componentType === TYP_CAR_GLASS_WALL_C) || {}).positions || []);

    //    { piece: "endPiece" | "spacer"  | "corner", position:Array, rotation:Array, scale:Array, id:String, connect:{from:String, to:String},  hideGroup } 

  if(hrPositions.indexOf('D') !== -1) {
    const test = {
      WALL: "D",
      PRODUCT: product,
      WIDTH: shape.depth,
      COP_POSITIONS: copsAsString,
      DECO:deco,
      COP:copId,
      REGULATIONS: regulations,
      HORIZONTAL_COP:options.hasHorizontalCop(),
      COP2_POS:cop2Position,
      SCENIC: scenicPositions,
      SCENICTYPE: glassBackWall,
      CARTYPE: design?.carType,
      HRPOSITIONS: hrPositions,
    }
    const handrails = (rules && rules.handrails) ? jsonLogic.apply(rules.handrails, test) : []
    // console.log({d:handrails})

    for(let i=0;i<handrails.length;i++) {
      
      if(handrails.length>1 && i<1) {
        hrPieces.push({piece:ENDPIECE, position:[ -shape.width/2, 87, handrails[i][0]], rotation:[0,0,0], scale:[1,1,1], id:'D_'+copsAsString+'_'+i.toString()+'_'+hrId+'_START', hideGroup:'d'})
        hrPieces.push({piece:BODY, connect:{from:'D_'+copsAsString+'_'+i.toString()+'_'+hrId+'_START' , to:'D_'+copsAsString+'_'+i.toString()+'_'+hrId+'_END'}, id:'D_'+copsAsString+'_'+i.toString()+'_'+hrId+'_BODY', hideGroup:'d'})
        hrPieces.push({piece:ENDPIECE, position:[ -shape.width/2, 87, handrails[i][1]], rotation:[0,0,0], scale:[1,1,-1], id:'D_'+copsAsString+'_'+i.toString()+'_'+hrId+'_END', hideGroup:'d'})  
      } else {
        if(scenicPositions && (scenicPositions.includes('D1') || scenicPositions.includes('D2')) 
            && (glassBackWall===DEFAULT_GLASS_C_WALL || glassBackWall === DEFAULT_GLASS_C_WALL_HERMES)) {
          const endP = handrails[i].length - 1
          hrPieces.push({piece:ENDPIECE, position:[ -shape.width/2, 87, handrails[i][0]], rotation:[0,0,0], scale:[1,1,1], id:'D_'+copsAsString+'_'+i.toString()+'_'+hrId+'_START', hideGroup:'d'})

          if(handrails[i].length>3) {
            hrPieces.push({piece:BODY, connect:{from:'D_'+copsAsString+'_'+i.toString()+'_'+hrId+'_START' , to:'D_'+copsAsString+'_'+i.toString()+'_'+hrId+'_END'}, id:'D_'+copsAsString+'_'+i.toString()+'_'+hrId+'_BODY', hideGroup:'d'})
            hrPieces.push({piece:ENDPIECE, position:[ -shape.width/2, 87, handrails[i][1]], rotation:[0,0,0], scale:[1,1,-1], id:'D_'+copsAsString+'_'+i.toString()+'_'+hrId+'_END', hideGroup:'d'})  
            hrPieces.push({piece:ENDPIECE, position:[ -shape.width/2, 87, handrails[i][2]], rotation:[0,0,0], scale:[1,1,1], id:'D_'+copsAsString+'_'+i.toString()+'_'+hrId+'_START_2', hideGroup:'d'})
            if(scenicPositions.includes('C')) {
              hrPieces.push({piece:BODY, connect:{from:'D_'+copsAsString+'_'+i.toString()+'_'+hrId+'_START_2' , to:'D_'+copsAsString+'_'+i.toString()+'_'+hrId+'_CORNER_START_NOFIXING'}, id:'D_'+copsAsString+'_'+i.toString()+'_'+hrId+'_BODY', hideGroup:'d'})
            } else {
              hrPieces.push({piece:BODY, connect:{from:'D_'+copsAsString+'_'+i.toString()+'_'+hrId+'_START_2' , to:'D_'+copsAsString+'_'+i.toString()+'_'+hrId+'_END_2'}, id:'D_'+copsAsString+'_'+i.toString()+'_'+hrId+'_BODY', hideGroup:'d'})
            }
          } else {
            if(scenicPositions.includes('C')) {
              hrPieces.push({piece:BODY, connect:{from:'D_'+copsAsString+'_'+i.toString()+'_'+hrId+'_START' , to:'D_'+copsAsString+'_'+i.toString()+'_'+hrId+'_CORNER_START_NOFIXING'}, id:'D_'+copsAsString+'_'+i.toString()+'_'+hrId+'_BODY', hideGroup:'d'})
            } else {
              hrPieces.push({piece:BODY, connect:{from:'D_'+copsAsString+'_'+i.toString()+'_'+hrId+'_START' , to:'D_'+copsAsString+'_'+i.toString()+'_'+hrId+'_END_2'}, id:'D_'+copsAsString+'_'+i.toString()+'_'+hrId+'_BODY', hideGroup:'d'})
            }
            for(let mids = 1; mids < handrails[i].length-1 ; mids++) {
              hrPieces.push({piece:FIXING, position:[ -shape.width/2, 87, handrails[i][mids]], rotation:[0,0,0], scale:[1,1,1], id:'D_'+hrId+'_'+mids+'_FIXING', hideGroup:'d'})
            }
          }

          if(scenicPositions.includes('C')) {
            hrPieces.push({piece:CORNER_START_NOFIXING, position:[ -shape.width/2, 87, handrails[i][endP]+1], rotation:[0,0,0], scale:[1,1,1], id:'D_'+copsAsString+'_'+i.toString()+'_'+hrId+'_CORNER_START_NOFIXING', hideGroup:'d'})
            hrPieces.push({piece:CORNER_END_FHT,  position:[ -shape.width/2, 87, handrails[i][endP]+1], rotation:[0,0,0], scale:[1,1,1], id:'D_'+copsAsString+'_'+hrId+'_CORNER', hideGroup:'c'})
            hrPieces.push({piece:MIDDLE, position:[ -shape.width/2, 89, handrails[i][endP]+1], rotation:[0,0,0], scale:[1,1,-1], id:'D_'+copsAsString+'_'+hrId+'_START_MIDDLE', hideGroup:'d'})
          } else {
            hrPieces.push({piece:ENDPIECE, position:[ -shape.width/2, 87, handrails[i][endP]+1], rotation:[0,0,0], scale:[1,1,-1], id:'D_'+copsAsString+'_'+i.toString()+'_'+hrId+'_END_2', hideGroup:'d'})  
          }

        } else if(hrPositions.indexOf('C') !== -1 && hrId.indexOf('TR') !==-1 && copsAsString.indexOf('D2')===-1 ) {
          hrPieces.push({piece:ENDPIECE, position:[ -shape.width/2, 87, handrails[i][0]], rotation:[0,0,0], scale:[1,1,1], id:'D_'+copsAsString+'_'+i.toString()+'_'+hrId+'_START', hideGroup:'d'})
          hrPieces.push({piece:BODY, connect:{from:'D_'+copsAsString+'_'+i.toString()+'_'+hrId+'_START' , to:'D_'+copsAsString+'_'+i.toString()+'_'+hrId+'_CORNER_START'}, id:'D_'+copsAsString+'_'+i.toString()+'_'+hrId+'_BODY', hideGroup:'d'})
          hrPieces.push({piece:CORNER_START, position:[ -shape.width/2, 87, handrails[i][1]+1], rotation:[0,0,0], scale:[1,1,1], id:'D_'+copsAsString+'_'+i.toString()+'_'+hrId+'_CORNER_START', hideGroup:'d'})
          if(glassBackWall === GLASS_C_FHT) {
            hrPieces.push({piece:CORNER_END_FHT,  position:[ -shape.width/2, 87, handrails[i][1]+1], rotation:[0,0,0], scale:[1,1,1], id:'D_'+copsAsString+'_'+hrId+'_CORNER', hideGroup:'c'})
          } else {
            hrPieces.push({piece:CORNER_END,  position:[ -shape.width/2, 87, handrails[i][1]+1], rotation:[0,0,0], scale:[1,1,1], id:'D_'+copsAsString+'_'+hrId+'_CORNER', hideGroup:'c'})
          }
        } else {
          hrPieces.push({piece:ENDPIECE, position:[ -shape.width/2, 87, handrails[i][0]], rotation:[0,0,0], scale:[1,1,1], id:'D_'+copsAsString+'_'+i.toString()+'_'+hrId+'_START', hideGroup:'d'})
          hrPieces.push({piece:BODY, connect:{from:'D_'+copsAsString+'_'+i.toString()+'_'+hrId+'_START' , to:'D_'+copsAsString+'_'+i.toString()+'_'+hrId+'_END'}, id:'D_'+copsAsString+'_'+i.toString()+'_'+hrId+'_BODY', hideGroup:'d'})
          hrPieces.push({piece:ENDPIECE, position:[ -shape.width/2, 87, handrails[i][1]], rotation:[0,0,0], scale:[1,1,-1], id:'D_'+copsAsString+'_'+i.toString()+'_'+hrId+'_END', hideGroup:'d'})  
        }
  
      }

      if(handrails.length === 1 && Math.abs(handrails[0][1] - handrails[0][0]) > 180 ) {
        const middleOfFixings = (handrails[0][1] - handrails[0][0])/2 + handrails[0][0]
        hrPieces.push({piece:FIXING, position:[ -shape.width/2, 87, middleOfFixings + EXTRA_FIXING], rotation:[0,0,0], scale:[1,1,1], id:'D_'+hrId+'_EXTRA_FIXING_1', hideGroup:'d'})
        hrPieces.push({piece:FIXING, position:[ -shape.width/2, 87, middleOfFixings - EXTRA_FIXING], rotation:[0,0,0], scale:[1,1,1], id:'D_'+hrId+'_EXTRA_FIXING_2', hideGroup:'d'})
      }

    }

    if(handrails.length === 1 && Math.abs(handrails[0][1] - handrails[0][0]) > 180 ) {
      const middleOfFixings = (handrails[0][1] - handrails[0][0])/2 + handrails[0][0]
      hrPieces.push({piece:FIXING, position:[ -shape.width/2, 87, middleOfFixings + EXTRA_FIXING], rotation:[0,0,0], scale:[1,1,1], id:'D_'+hrId+'_EXTRA_FIXING_1', hideGroup:'d'})
      hrPieces.push({piece:FIXING, position:[ -shape.width/2, 87, middleOfFixings - EXTRA_FIXING], rotation:[0,0,0], scale:[1,1,1], id:'D_'+hrId+'_EXTRA_FIXING_2', hideGroup:'d'})
    }
   
  }

  if(hrPositions.indexOf('C') !== -1) {
    if( !isTrueTypeCar( design.carType ) ) {

      const test = {
        WALL: "C",
        PRODUCT: product,
        WIDTH: shape.width,
        COP_POSITIONS: copsAsString,
        DECO:deco,
        COP:copId,
        REGULATIONS: regulations,
        CWALL_FINISH:cWallFinish,
        SCENIC: scenicPositions,
        SCENICTYPE: glassBackWall,
        CARTYPE: design?.carType,
        HRPOSITIONS: hrPositions,
        HR:hrId,
        BACKWALLTYPE: (design?.backWallPanelingType || 0),
      }
      // console.log({test, res:jsonLogic.apply(rules.handrails, test)})
      const handrails = (rules && rules.handrails)?jsonLogic.apply(rules.handrails, test):[]
      // console.log({c:handrails})
      for(let i=0;i<handrails.length;i++) {  

        //EN81-70 special case
        if(hrId === 'HR81_HR64' || hrId === 'HR81_HR65') {
          hrPieces.push({piece:ENDPIECE_REGULATION, position:[ handrails[i][0], 87, -shape.depth+1], rotation:[0,-Math.PI/2,0], scale:[1,1,1], id:'C_'+hrId+'_START', hideGroup:'c'})
          hrPieces.push({piece:BODY_REGULATION, connect:{from:'C_'+hrId+'_START' , to:'C_'+hrId+'_END'}, id:'C_'+hrId+'_BODY', hideGroup:'c'})
          hrPieces.push({piece:ENDPIECE_REGULATION, position:[ handrails[i][1], 87, -shape.depth+1], rotation:[0,-Math.PI/2,0], scale:[1,1,-1], id:'C_'+hrId+'_END', hideGroup:'c'})
          hrPieces.push({piece:MIDDLE, position:[ handrails[i][0], 89, -shape.depth+1], rotation:[0,-Math.PI/2,0], scale:[1,1,1], id:'C_'+hrId+'_START_MIDDLE', hideGroup:'c'})
          hrPieces.push({piece:MIDDLE, position:[ handrails[i][1], 89, -shape.depth+1], rotation:[0,-Math.PI/2,0], scale:[1,1,-1], id:'C_'+hrId+'_END_MIDDLE', hideGroup:'c'})
        
          // testing new TR corner piece
        } else if(hrPositions.indexOf('D') !== -1 && hrPositions.indexOf('B') !== -1 && hrId.indexOf('TR') !== -1 && copsAsString.indexOf('B1')===-1) {
          if(copsAsString.indexOf('D2')===-1) {
            if(glassBackWall === GLASS_C_FHT && scenicPositions.includes('C')) {
              hrPieces.push({piece:BODY_FHT, connect:{from:'D_'+copsAsString+'_'+hrId+'_CORNER' , to:'B_'+copsAsString+'_'+hrId+'_CORNER'}, id:'C_'+hrId+'_BODY', hideGroup:'c'})
            } else {
              hrPieces.push({piece:BODY, connect:{from:'D_'+copsAsString+'_'+hrId+'_CORNER' , to:'B_'+copsAsString+'_'+hrId+'_CORNER'}, id:'C_'+hrId+'_BODY', hideGroup:'c'})
            }
          } else {
            if(glassBackWall === GLASS_C_FHT && scenicPositions.includes('C')) {
              hrPieces.push({piece:ENDPIECE_CWALL_FHT, position:[ handrails[i][0], 87, -shape.depth+1], rotation:[0,-Math.PI/2,0], scale:[1,1,1], id:'C_'+hrId+'_START', hideGroup:'c'})
              hrPieces.push({piece:BODY_FHT, connect:{from:'C_'+hrId+'_START' , to:'B_'+copsAsString+'_'+hrId+'_CORNER'}, id:'C_'+hrId+'_BODY', hideGroup:'c'})
            } else {
              if(regulations.indexOf('EN81-70') !== -1) {
                hrPieces.push({piece:ENDPIECE_CWALL_FHT, position:[ handrails[i][0], 87, -shape.depth+1], rotation:[0,-Math.PI/2,0], scale:[1,1,1], id:'C_'+hrId+'_START', hideGroup:'c'})
              } else {
                hrPieces.push({piece:ENDPIECE, position:[ handrails[i][0], 87, -shape.depth+1], rotation:[0,-Math.PI/2,0], scale:[1,1,1], id:'C_'+hrId+'_START', hideGroup:'c'})
              }
              hrPieces.push({piece:BODY, connect:{from:'C_'+hrId+'_START' , to:'B_'+copsAsString+'_'+hrId+'_CORNER'}, id:'C_'+hrId+'_BODY', hideGroup:'c'})
            }
          }
          if(hrId === 'HR81TR') {
            hrPieces.push({piece:MIDDLE, position:[ handrails[i][0], 89, -shape.depth+1], rotation:[0,-Math.PI/2,0], scale:[1,1,1], id:'C_'+hrId+'_START_MIDDLE', hideGroup:'c'})
            hrPieces.push({piece:MIDDLE, position:[ handrails[i][1], 89, -shape.depth+1], rotation:[0,-Math.PI/2,0], scale:[1,1,-1], id:'C_'+hrId+'_END_MIDDLE', hideGroup:'c'})
          }
  
        } else if(hrPositions.indexOf('D') !== -1 && hrPositions.indexOf('B') === -1 && hrId.indexOf('TR') !== -1 && copsAsString.indexOf('D2')===-1) {
          if(hrId === 'HR81TR') {
            if(glassBackWall === GLASS_C_FHT && scenicPositions.includes('C')) {
              hrPieces.push({piece:BODY_FHT, connect:{from:'D_'+copsAsString+'_'+hrId+'_CORNER' , to:'C_'+hrId+'_END_FHT'}, id:'C_'+hrId+'_BODY', hideGroup:'c'})
              hrPieces.push({piece:ENDPIECE_CWALL_FHT, position:[ handrails[i][1], 87, -shape.depth+1], rotation:[0,-Math.PI/2,0], scale:[1,1,-1], id:'C_'+hrId+'_END_FHT', hideGroup:'c'})
            } else {
              hrPieces.push({piece:BODY, connect:{from:'D_'+copsAsString+'_'+hrId+'_CORNER' , to:'C_'+hrId+'_END'}, id:'C_'+hrId+'_BODY', hideGroup:'c'})
              hrPieces.push({piece:ENDPIECE_CWALL, position:[ handrails[i][1], 87, -shape.depth+1], rotation:[0,-Math.PI/2,0], scale:[1,1,-1], id:'C_'+hrId+'_END', hideGroup:'c'})
            }
            hrPieces.push({piece:MIDDLE, position:[ handrails[i][0], 89, -shape.depth+1], rotation:[0,-Math.PI/2,0], scale:[1,1,1], id:'C_'+hrId+'_START_MIDDLE', hideGroup:'c'})
            hrPieces.push({piece:MIDDLE, position:[ handrails[i][1]-14, 89, -shape.depth+1], rotation:[0,-Math.PI/2,0], scale:[1,1,-1], id:'C_'+hrId+'_END_MIDDLE', hideGroup:'c'})
          } else {
            hrPieces.push({piece:BODY, connect:{from:'D_'+copsAsString+'_'+hrId+'_CORNER' , to:'C_'+hrId+'_END'}, id:'C_'+hrId+'_BODY', hideGroup:'c'})
            hrPieces.push({piece:ENDPIECE, position:[ handrails[i][1], 87, -shape.depth+1], rotation:[0,-Math.PI/2,0], scale:[1,1,-1], id:'C_'+hrId+'_END', hideGroup:'c'})
          }
        
        } else if(hrPositions.indexOf('B') !== -1 && hrPositions.indexOf('D') === -1 && hrId.indexOf('TR') !== -1  && copsAsString.indexOf('B1')===-1) {
          if(hrId==='HR81TR') {
            if(glassBackWall === GLASS_C_FHT && scenicPositions.includes('C')) {
              hrPieces.push({piece:ENDPIECE_CWALL_FHT, position:[ handrails[i][0], 87, -shape.depth+1], rotation:[0,-Math.PI/2,0], scale:[1,1,1], id:'C_'+hrId+'_START', hideGroup:'c'})
              hrPieces.push({piece:BODY_FHT, connect:{from:'C_'+hrId+'_START' , to:'B_'+copsAsString+'_'+hrId+'_CORNER'}, id:'C_'+hrId+'_BODY', hideGroup:'c'})
            } else {
              hrPieces.push({piece:ENDPIECE_CWALL, position:[ handrails[i][0], 87, -shape.depth+1], rotation:[0,-Math.PI/2,0], scale:[1,1,1], id:'C_'+hrId+'_START', hideGroup:'c'})
              hrPieces.push({piece:BODY, connect:{from:'C_'+hrId+'_START' , to:'B_'+copsAsString+'_'+hrId+'_CORNER'}, id:'C_'+hrId+'_BODY', hideGroup:'c'})
            }
            hrPieces.push({piece:MIDDLE, position:[ handrails[i][0]+14, 89, -shape.depth+1], rotation:[0,-Math.PI/2,0], scale:[1,1,1], id:'C_'+hrId+'_START_MIDDLE', hideGroup:'c'})
            hrPieces.push({piece:MIDDLE, position:[ handrails[i][1], 89, -shape.depth+1], rotation:[0,-Math.PI/2,0], scale:[1,1,-1], id:'C_'+hrId+'_END_MIDDLE', hideGroup:'c'})
          } else {
            hrPieces.push({piece:ENDPIECE, position:[ handrails[i][0], 87, -shape.depth+1], rotation:[0,-Math.PI/2,0], scale:[1,1,1], id:'C_'+hrId+'_START', hideGroup:'c'})
            hrPieces.push({piece:BODY, connect:{from:'C_'+hrId+'_START' , to:'B_'+copsAsString+'_'+hrId+'_CORNER'}, id:'C_'+hrId+'_BODY', hideGroup:'c'})
          }

        } else {
          if(glassBackWall === GLASS_C_FHT && scenicPositions.includes('C')) {
            hrPieces.push({piece:ENDPIECE_CWALL_FHT, position:[ handrails[i][0], 87, -shape.depth+1], rotation:[0,-Math.PI/2,0], scale:[1,1,1], id:'C_'+hrId+'_START', hideGroup:'c'})
            hrPieces.push({piece:BODY_FHT, connect:{from:'C_'+hrId+'_START' , to:'C_'+hrId+'_END'}, id:'C_'+hrId+'_BODY', hideGroup:'c'})
            hrPieces.push({piece:ENDPIECE_CWALL_FHT, position:[ handrails[i][1], 87, -shape.depth+1], rotation:[0,-Math.PI/2,0], scale:[1,1,-1], id:'C_'+hrId+'_END', hideGroup:'c'})
          } else {            
            hrPieces.push({piece:ENDPIECE, position:[ handrails[i][0], 87, -shape.depth+1], rotation:[0,-Math.PI/2,0], scale:[1,1,1], id:'C_'+hrId+'_START', hideGroup:'c'})
            hrPieces.push({piece:BODY, connect:{from:'C_'+hrId+'_START' , to:'C_'+hrId+'_END'}, id:'C_'+hrId+'_BODY', hideGroup:'c'})
            hrPieces.push({piece:ENDPIECE, position:[ handrails[i][1], 87, -shape.depth+1], rotation:[0,-Math.PI/2,0], scale:[1,1,-1], id:'C_'+hrId+'_END', hideGroup:'c'})
          }
  
          if(hrId === 'HR81' || hrId === 'HR81TR') {
            hrPieces.push({piece:MIDDLE, position:[ handrails[i][0], 89, -shape.depth+1], rotation:[0,-Math.PI/2,0], scale:[1,1,1], id:'C_'+hrId+'_START_MIDDLE', hideGroup:'c'})
            hrPieces.push({piece:MIDDLE, position:[ handrails[i][1], 89, -shape.depth+1], rotation:[0,-Math.PI/2,0], scale:[1,1,-1], id:'C_'+hrId+'_END_MIDDLE', hideGroup:'c'})
          }
        }
      }

    }
  }
  
  if(hrPositions.indexOf('B') !== -1) {
    const test = { 
      WALL: "B",
      PRODUCT: product, 
      WIDTH: shape.depth, 
      COP_POSITIONS: copsAsString, 
      DECO:deco, 
      COP:copId, 
      REGULATIONS: regulations, 
      HORIZONTAL_COP:options.hasHorizontalCop(), 
      COP2_POS:cop2Position,
      SCENIC: scenicPositions,
      SCENICTYPE: glassBackWall,
      CARTYPE: design?.carType,
      HRPOSITIONS: hrPositions,
    }
    const handrails = (rules && rules.handrails)?jsonLogic.apply(rules.handrails, test):[]
    // console.log({test, b:handrails})
    for(let i=0;i<handrails.length;i++) {
      
      if(handrails.length>1 && i>0) {
        hrPieces.push({piece:ENDPIECE, position:[ shape.width/2, 87, handrails[i][0]], rotation:[0,-Math.PI,0], scale:[1,1,1], id:'B_'+copsAsString+'_'+i.toString()+'_'+hrId+'_START', hideGroup:'b'})
        hrPieces.push({piece:BODY, connect:{from:'B_'+copsAsString+'_'+i.toString()+'_'+hrId+'_START' , to:'B_'+copsAsString+'_'+i.toString()+'_'+hrId+'_END'}, id:'B_'+copsAsString+'_'+i.toString()+'_'+hrId+'_BODY', hideGroup:'b'})  
        hrPieces.push({piece:ENDPIECE, position:[ shape.width/2, 87, handrails[i][1]], rotation:[0,-Math.PI,0], scale:[1,1,-1], id:'B_'+copsAsString+'_'+i.toString()+'_'+hrId+'_END', hideGroup:'b'})
      } else {
        if(scenicPositions && (scenicPositions.includes('B1') || scenicPositions.includes('B2'))
            && (glassBackWall===DEFAULT_GLASS_C_WALL || glassBackWall === DEFAULT_GLASS_C_WALL_HERMES)) {
          const endP = handrails[i].length - 1
          if(scenicPositions.includes('C')) {
            hrPieces.push({piece:CORNER_END_FHT,  position:[ shape.width/2, 87, handrails[i][0]+1], rotation:[0,-Math.PI,0], scale:[1,1,-1], id:'B_'+copsAsString+'_'+hrId+'_CORNER', hideGroup:'c'})
            hrPieces.push({piece:CORNER_START_NOFIXING_REVERSE, position:[ shape.width/2, 87, handrails[i][0]+1], rotation:[0,-Math.PI,0], scale:[1,1,-1], id:'B_'+copsAsString+'_'+i.toString()+'_'+hrId+'_CORNER_START_NOFIXING', hideGroup:'b'})
            hrPieces.push({piece:BODY, connect:{from:'B_'+copsAsString+'_'+i.toString()+'_'+hrId+'_CORNER_START_NOFIXING' , to:'B_'+copsAsString+'_'+i.toString()+'_'+hrId+'_END'}, id:'B_'+copsAsString+'_'+i.toString()+'_'+hrId+'_BODY', hideGroup:'b'})
            hrPieces.push({piece:MIDDLE, position:[ shape.width/2, 89, handrails[i][0]+1], rotation:[0,-Math.PI,0], scale:[1,1,1], id:'B_'+copsAsString+'_'+hrId+'_START_MIDDLE', hideGroup:'b'})
          } else {
            hrPieces.push({piece:ENDPIECE, position:[ shape.width/2, 87, handrails[i][0]+1], rotation:[0,-Math.PI,0], scale:[1,1,1], id:'B_'+copsAsString+'_'+i.toString()+'_'+hrId+'_START', hideGroup:'b'})
            hrPieces.push({piece:BODY, connect:{from:'B_'+copsAsString+'_'+i.toString()+'_'+hrId+'_START' , to:'B_'+copsAsString+'_'+i.toString()+'_'+hrId+'_END'}, id:'B_'+copsAsString+'_'+i.toString()+'_'+hrId+'_BODY', hideGroup:'b'})
          }
          if(handrails[i].length>3) {
            hrPieces.push({piece:ENDPIECE, position:[ shape.width/2, 87, handrails[i][1]], rotation:[0,-Math.PI,0], scale:[1,1,-1], id:'B_'+copsAsString+'_'+i.toString()+'_'+hrId+'_END', hideGroup:'b'})
            hrPieces.push({piece:ENDPIECE, position:[ shape.width/2, 87, handrails[i][2]], rotation:[0,-Math.PI,0], scale:[1,1,1], id:'B_'+copsAsString+'_'+i.toString()+'_'+hrId+'_START_2', hideGroup:'b'})
            hrPieces.push({piece:BODY, connect:{from:'B_'+copsAsString+'_'+i.toString()+'_'+hrId+'_START_2' , to:'B_'+copsAsString+'_'+i.toString()+'_'+hrId+'_END_2'}, id:'B_'+copsAsString+'_'+i.toString()+'_'+hrId+'_BODY_2', hideGroup:'b'})  
            hrPieces.push({piece:ENDPIECE, position:[ shape.width/2, 87, handrails[i][3]], rotation:[0,-Math.PI,0], scale:[1,1,-1], id:'B_'+copsAsString+'_'+i.toString()+'_'+hrId+'_END_2', hideGroup:'b'})
          } else {
            hrPieces.push({piece:ENDPIECE, position:[ shape.width/2, 87, handrails[i][endP]], rotation:[0,-Math.PI,0], scale:[1,1,-1], id:'B_'+copsAsString+'_'+i.toString()+'_'+hrId+'_END', hideGroup:'b'})
            for(let mids = 1; mids < handrails[i].length-1 ; mids++) {
              hrPieces.push({piece:FIXING, position:[ shape.width/2, 87, handrails[i][mids]], rotation:[0,-Math.PI,0], scale:[1,1,1], id:'B_'+hrId+'_'+mids+'_FIXING', hideGroup:'b'})
            }

          }
        } else if(hrPositions.indexOf('C') !== -1 && hrId.indexOf('TR') !== -1 && copsAsString.indexOf('B1')===-1) {
          if(glassBackWall === GLASS_C_FHT) {
            hrPieces.push({piece:CORNER_END_FHT,  position:[ shape.width/2, 87, handrails[i][0]+1], rotation:[0,-Math.PI,0], scale:[1,1,-1], id:'B_'+copsAsString+'_'+hrId+'_CORNER', hideGroup:'c'})
          } else {
            hrPieces.push({piece:CORNER_END,  position:[ shape.width/2, 87, handrails[i][0]+1], rotation:[0,-Math.PI,0], scale:[1,1,-1], id:'B_'+copsAsString+'_'+hrId+'_CORNER', hideGroup:'c'})
          }
          hrPieces.push({piece:CORNER_START_REVERSE, position:[ shape.width/2, 87, handrails[i][0]+1], rotation:[0,-Math.PI,0], scale:[1,1,-1], id:'B_'+copsAsString+'_'+i.toString()+'_'+hrId+'_CORNER_START', hideGroup:'b'})
          hrPieces.push({piece:BODY, connect:{from:'B_'+copsAsString+'_'+i.toString()+'_'+hrId+'_CORNER_START' , to:'B_'+copsAsString+'_'+i.toString()+'_'+hrId+'_END'}, id:'B_'+copsAsString+'_'+i.toString()+'_'+hrId+'_BODY', hideGroup:'b'})
          hrPieces.push({piece:ENDPIECE, position:[ shape.width/2, 87, handrails[i][1]], rotation:[0,-Math.PI,0], scale:[1,1,-1], id:'B_'+copsAsString+'_'+i.toString()+'_'+hrId+'_END', hideGroup:'b'})
        } else {
          hrPieces.push({piece:ENDPIECE, position:[ shape.width/2, 87, handrails[i][0]], rotation:[0,-Math.PI,0], scale:[1,1,1], id:'B_'+copsAsString+'_'+i.toString()+'_'+hrId+'_START', hideGroup:'b'})
          hrPieces.push({piece:BODY, connect:{from:'B_'+copsAsString+'_'+i.toString()+'_'+hrId+'_START' , to:'B_'+copsAsString+'_'+i.toString()+'_'+hrId+'_END'}, id:'B_'+copsAsString+'_'+i.toString()+'_'+hrId+'_BODY', hideGroup:'b'})  
          hrPieces.push({piece:ENDPIECE, position:[ shape.width/2, 87, handrails[i][1]], rotation:[0,-Math.PI,0], scale:[1,1,-1], id:'B_'+copsAsString+'_'+i.toString()+'_'+hrId+'_END', hideGroup:'b'})
        }
  
      }
      
      // console.log(handrails.length, handrails[0][0], handrails[0][1], Math.abs(handrails[0][0] - handrails[0][1]))
      if(handrails.length === 1 && Math.abs(handrails[0][0] - handrails[0][1]) > 180 ) {
        const middleOfFixings = (handrails[0][0] - handrails[0][1])/2 + handrails[0][1]
        hrPieces.push({piece:FIXING, position:[ shape.width/2, 87, middleOfFixings + EXTRA_FIXING], rotation:[0,-Math.PI,0], scale:[1,1,1], id:'B_'+hrId+'_EXTRA_FIXING_1', hideGroup:'b'})
        hrPieces.push({piece:FIXING, position:[ shape.width/2, 87, middleOfFixings - EXTRA_FIXING], rotation:[0,-Math.PI,0], scale:[1,1,1], id:'B_'+hrId+'_EXTRA_FIXING_2', hideGroup:'b'})
      }

    }

    if(handrails.length === 1 && Math.abs(handrails[0][0] - handrails[0][1]) > 180 ) {
      const middleOfFixings = (handrails[0][0] - handrails[0][1])/2 + handrails[0][1]
      hrPieces.push({piece:FIXING, position:[ shape.width/2, 87, middleOfFixings + EXTRA_FIXING], rotation:[0,-Math.PI,0], scale:[1,1,1], id:'B_'+hrId+'_EXTRA_FIXING_1', hideGroup:'b'})
      hrPieces.push({piece:FIXING, position:[ shape.width/2, 87, middleOfFixings - EXTRA_FIXING], rotation:[0,-Math.PI,0], scale:[1,1,1], id:'B_'+hrId+'_EXTRA_FIXING_2', hideGroup:'b'})
    }    

  }

  return hrPieces;
}