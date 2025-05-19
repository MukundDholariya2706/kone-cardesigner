import jsonLogic from 'json-logic-js';

import { TYP_COP_PRODUCT_1, TYP_COP_2, CAR_SHAPES, TYP_CAR_LAMINATE_LIST, GAP, LIST, TYP_CAR_WALL_ADD_DECO_PACKAGE, HORIZONTAL, CAR_TYPE_NORMAL,
        TYP_CAR_CEILING, TYP_CAR_WALL_B, TYP_CAR_WALL_C, TYP_CAR_WALL_D, CAR_WALL_STRUCTURE_B1, CAR_WALL_STRUCTURE_BX, CAR_WALL_STRUCTURE_B2,
        CAR_WALL_STRUCTURE_C2, CAR_WALL_STRUCTURE_C1, CAR_WALL_STRUCTURE_CX, CAR_WALL_STRUCTURE_D1, CAR_WALL_STRUCTURE_DX, CAR_WALL_STRUCTURE_D2,
        LAMINATE_MATERIAL, LAMINATELIST_WIDTH, TYP_CAR_GLASS_WALL_C, TYP_CAR_MIRROR, TYP_CAR_HANDRAIL} from "../../constants";


export function getGapAndLaminateListPieces(design, product, rules, finishes) {

  if(!design) {
    return []
  }

  const llPositions = ( design.components.find(item => item.componentType === TYP_CAR_LAMINATE_LIST) || {} ).positions;
  // const llId = ( design.components.find(item => item.componentType === TYP_CAR_LAMINATE_LIST) || {} ).component;

  let wallPieces=[];

  const wallB = design.components.find(item => item.componentType === TYP_CAR_WALL_B) || {}
  const wallC = design.components.find(item => item.componentType === TYP_CAR_WALL_C) || {}
  const wallD = design.components.find(item => item.componentType === TYP_CAR_WALL_D) || {}

  const wallBParts = wallB.parts || [];
  const wallCParts = wallC.parts || [];
  const wallDParts = wallD.parts || [];


  // if the B wall has tricolor, check which panel is laminate
  let wallBPartIsLaminate=[]
  if(wallBParts.length > 0 ) {
    wallBPartIsLaminate = [
      ( ( (finishes.find(finish => finish.sapId === (wallBParts.find(item => item.type === CAR_WALL_STRUCTURE_B2 ) || {}).finish) || {}).materials || [] ).indexOf(LAMINATE_MATERIAL) !==-1 ),
      ( ( (finishes.find(finish => finish.sapId === (wallBParts.find(item => item.type === CAR_WALL_STRUCTURE_BX ) || {}).finish) || {}).materials || [] ).indexOf(LAMINATE_MATERIAL) !==-1 ),
      ( ( (finishes.find(finish => finish.sapId === (wallBParts.find(item => item.type === CAR_WALL_STRUCTURE_B1 ) || {}).finish) || {}).materials || [] ).indexOf(LAMINATE_MATERIAL) !==-1 ),
    ]
  }

  // if the C wall has tricolor, check which panel is laminate
  let wallCPartIsLaminate=[]
  if(wallCParts.length > 0 ) {
    wallCPartIsLaminate = [
      ( ( (finishes.find(finish => finish.sapId === (wallCParts.find(item => item.type === CAR_WALL_STRUCTURE_C1 ) || {}).finish) || {}).materials || [] ).indexOf(LAMINATE_MATERIAL) !==-1 ),
      ( ( (finishes.find(finish => finish.sapId === (wallCParts.find(item => item.type === CAR_WALL_STRUCTURE_CX ) || {}).finish) || {}).materials || [] ).indexOf(LAMINATE_MATERIAL) !==-1 ),
      ( ( (finishes.find(finish => finish.sapId === (wallCParts.find(item => item.type === CAR_WALL_STRUCTURE_C2 ) || {}).finish) || {}).materials || [] ).indexOf(LAMINATE_MATERIAL) !==-1 ),
    ]
  }

  // if the D wall has tricolor, check which panel is laminate
  let wallDPartIsLaminate=[]
  if(wallDParts.length > 0 ) {
    wallDPartIsLaminate = [
      ( ( (finishes.find(finish => finish.sapId === (wallDParts.find(item => item.type === CAR_WALL_STRUCTURE_D1 ) || {}).finish) || {}).materials || [] ).indexOf(LAMINATE_MATERIAL) !==-1 ),
      ( ( (finishes.find(finish => finish.sapId === (wallDParts.find(item => item.type === CAR_WALL_STRUCTURE_DX ) || {}).finish) || {}).materials || [] ).indexOf(LAMINATE_MATERIAL) !==-1 ),
      ( ( (finishes.find(finish => finish.sapId === (wallDParts.find(item => item.type === CAR_WALL_STRUCTURE_D2 ) || {}).finish) || {}).materials || [] ).indexOf(LAMINATE_MATERIAL) !==-1 ),
    ]
  }

  const shape = CAR_SHAPES.find(item => item.id === design.carShape);
  const panelOrientation = design.panelOrientation;
  const ceiling = ( design.components.find(item => item.componentType === TYP_CAR_CEILING) || {} ).component || null;
  const deco = ( design.components.find(item => item.componentType === TYP_CAR_WALL_ADD_DECO_PACKAGE) || {} ).component || null;
  const copId = ( design.components.find(item => item.componentType === TYP_COP_PRODUCT_1) || {} ).component;
  const cop2Id = ( design.components.find(item => item.componentType === TYP_COP_2) || {} ).component;
  const cop1Position = ( design.components.find(item => item.componentType === TYP_COP_PRODUCT_1) || {} ).positions || [];
  const cop2Position = ( design.components.find(item => item.componentType === TYP_COP_2) || {} ).positions || [];
  const scenicWallComponent = ( design.components.find(item => item.componentType === TYP_CAR_GLASS_WALL_C) || {} ).component || null;
  const scenicWallPositions = ( design.components.find(item => item.componentType === TYP_CAR_GLASS_WALL_C) || {} ).positions || [];
  const cops = cop1Position.concat(cop2Position).sort();
  const copsAsString = cops.join('');
  const cops2AsString = cop2Position.join('');
  
  let cornerPieceAvailable = false
  if(rules?.variousFilteringRules) {
    const mirror = design.components.find(item => item.componentType === TYP_CAR_MIRROR) || {};
    const handrail = design.components.find(item => item.componentType === TYP_CAR_HANDRAIL) || {};
 
    let cFinish=wallC.finish

    if(wallCParts.length > 0) {
      const partFinish = wallC.parts[0].finish
      let allTheSame = true
      wallC.parts.forEach(part => {
        if(part.finish !== partFinish) allTheSame = false
      })
      if(allTheSame) {
        cFinish = partFinish
      }
    }

    const cornerTest = {
      filteringRULE: "cornerWallPiece",
      PRODUCT: product,
      CARTYPE: design.carType,
      C_PARTS: wallCParts.length,
      SIDE_PARTS: wallBParts.length,
      WIDTH: shape.width,
      DEPTH: shape.depth,
      CFINISH: cFinish,
      BFINISH: wallB.finish,
      DFINISH: wallD.finish,
      MIRROR: (mirror.component || null),
      MIRROR_POS: (mirror.positions || []),
      HANDRAIL: (handrail.component || null),
      HANDRAIL_POS: (handrail.positions || []),
      COP: copId,
      COP_POS: cop1Position
    };

    cornerPieceAvailable = jsonLogic.apply(rules.variousFilteringRules, cornerTest);
  }

  const bTest = { 
    WALL: "B", PRODUCT: product, HEIGHT: shape.height, WIDTH: shape.depth, CARSHAPE: shape.id, MATERIAL: wallB.finishMaterial,
    COP: copId, COP_POSITIONS: copsAsString, DECO:deco, ORIENTATION: panelOrientation,
    USER_PARTS:wallBParts.length, SCENIC:scenicWallPositions, SCENICTYPE:scenicWallComponent, CORNERPIECE:cornerPieceAvailable}

  const cTest = { WALL: "C", PRODUCT: product, HEIGHT: shape.height, WIDTH: shape.width, CARSHAPE: shape.id, MATERIAL: wallC.finishMaterial,
    COP: copId, COP_POSITIONS: copsAsString, DECO:deco, CEILING: ceiling, ORIENTATION: panelOrientation,
    USER_PARTS:wallCParts.length, PANELINGTYPE: design?.backWallPanelingType, CORNERPIECE:cornerPieceAvailable}

  const dTest = { WALL: "D", PRODUCT: product, HEIGHT: shape.height, WIDTH: shape.depth, CARSHAPE: shape.id, MATERIAL: wallD.finishMaterial,
    COP: copId, COP_POSITIONS: copsAsString, DECO:deco, ORIENTATION: panelOrientation,
    USER_PARTS:wallDParts.length, SCENIC:scenicWallPositions, SCENICTYPE:scenicWallComponent, CORNERPIECE:cornerPieceAvailable}

  const divisions = [ jsonLogic.apply(rules.wallPanels, bTest), jsonLogic.apply(rules.wallPanels, cTest), jsonLogic.apply(rules.wallPanels, dTest) ]
// console.log({bTest,res:divisions[0]})
  const bTestCOP = { TESTING:"listFHCOP", WALL: "B", PRODUCT: product, WIDTH: shape.depth, COP: copId, COP_POSITIONS: copsAsString, COP2:cop2Id, COP2_POSITION:cops2AsString}
  const dTestCOP = { TESTING:"listFHCOP", WALL: "D", PRODUCT: product, WIDTH: shape.depth, COP: copId, COP_POSITIONS: copsAsString, COP2:cop2Id, COP2_POSITION:cops2AsString}
  const copLists = [ jsonLogic.apply(rules.laminatelistExceptions, bTestCOP), jsonLogic.apply(rules.laminatelistExceptions, dTestCOP) ]

  let llwidthScale = 1
  if(rules && rules.laminatelistExceptions) {
    llwidthScale = jsonLogic.apply(rules.laminatelistExceptions,{TESTING:'listScale', PRODUCT:product}) || 1
  }

  // Calculate the laminate list width
  const listWidth= LAMINATELIST_WIDTH * llwidthScale

  // console.log({bTest,divisions})
  const walls = ['B','C','D'];
  for(let i=0;i<divisions.length; i++) {

    let pieceType=GAP;
    let itemOffset = 0.7
    let itemOffsetC = jsonLogic.apply(rules.laminatelistExceptions,{TESTING:'gapDepthC', PRODUCT:product}) || 0.7
    if(llPositions && llPositions.indexOf(walls[i]) !== -1  && (!scenicWallPositions || !(scenicWallPositions.includes(walls[i]+'1') || scenicWallPositions.includes(walls[i]+'2'))) ) {
      pieceType = LIST;
      itemOffset = jsonLogic.apply(rules.laminatelistExceptions,{TESTING:'listDepth', PRODUCT:product}) || 0.83
      itemOffsetC = jsonLogic.apply(rules.laminatelistExceptions,{TESTING:'listDepthC', PRODUCT:product}) || 0.85
    }
    switch (walls[i]) {
      case 'B':
        if(divisions[i] && divisions[i].length) {
          for(let j=0; j<divisions[i].length; j++) {
            // when tricolor wall present, make sure that paneling division matches the number of panels in wall parts
            if (wallBPartIsLaminate.length >0 ) {
              if( (wallBPartIsLaminate[j] || wallBPartIsLaminate[j+1]) && (!scenicWallPositions || !(scenicWallPositions.includes('B1') || scenicWallPositions.includes('B2'))) ) {
                pieceType = LIST
                itemOffset = 0.83
              } else {
                pieceType = GAP
                itemOffset = 0.7
              }
            }
            if(panelOrientation === HORIZONTAL) {
              let decoDecrese=0;
              if(["DECO3", "DECO4"].indexOf(deco) !== -1) {
                decoDecrese = 36;
              }                
              wallPieces.push({piece: pieceType, position:[ shape.width/2+itemOffset, divisions[i][j], -listWidth], rotation:[-Math.PI,0,0], scale:[1,llwidthScale,((shape.depth-decoDecrese-2*listWidth)/240)], id: walls[i]+'_'+panelOrientation+'_'+pieceType+'_'+j.toString(), hideGroup:walls[i].toLowerCase()})
            } else {
              wallPieces.push({piece: pieceType, position:[ shape.width/2+itemOffset, 0, -divisions[i][j] ], rotation:[-Math.PI/2,0,0], scale:[1,llwidthScale,(shape.height/240)], id: walls[i]+'_'+panelOrientation+'_'+pieceType+'_'+j.toString(), hideGroup:walls[i].toLowerCase()})
            }
          }
        }
        if(wallBPartIsLaminate.length>0) {
          if(wallBPartIsLaminate[0]) {
            wallPieces.push({piece: pieceType, position:[ shape.width/2+itemOffset, 0, -listWidth/2 ], rotation:[-Math.PI/2,0,0], scale:[1,llwidthScale,(shape.height/240)], id: walls[i]+'_'+panelOrientation+'_'+pieceType+'_A_CORNER', hideGroup:walls[i].toLowerCase()})
          }
          if(wallBPartIsLaminate[wallBPartIsLaminate.length-1]) {
            wallPieces.push({piece: pieceType, position:[ shape.width/2+itemOffset, 0, -shape.depth + listWidth/2 ], rotation:[-Math.PI/2,0,0], scale:[1,llwidthScale,(shape.height/240)], id: walls[i]+'_'+panelOrientation+'_'+pieceType+'_C_CORNER', hideGroup:walls[i].toLowerCase()})
          }
        } else {
          if(pieceType === LIST) {
            wallPieces.push({piece: pieceType, position:[ shape.width/2+itemOffset, 0, -listWidth/2 ], rotation:[-Math.PI/2,0,0], scale:[1,llwidthScale,(shape.height/240)], id: walls[i]+'_'+panelOrientation+'_'+pieceType+'_A_CORNER', hideGroup:walls[i].toLowerCase()})
            wallPieces.push({piece: pieceType, position:[ shape.width/2+itemOffset, 0, -shape.depth + listWidth/2 ], rotation:[-Math.PI/2,0,0], scale:[1,llwidthScale,(shape.height/240)], id: walls[i]+'_'+panelOrientation+'_'+pieceType+'_C_CORNER', hideGroup:walls[i].toLowerCase()})
          }  
        }

        const bWallCopLists = copLists?.[0] ?copLists[0].filter(item => item !==null) :[]
        if(bWallCopLists.length>0) {
          bWallCopLists.forEach(item =>{
            wallPieces.push({piece: pieceType, position:[ shape.width/2+itemOffset, 0, item ], rotation:[-Math.PI/2,0,0], scale:[1,llwidthScale,(shape.height/240)], id: walls[i]+'_'+panelOrientation+'_'+pieceType+'_'+item.toString(), hideGroup:walls[i].toLowerCase()})
          })
        }
      break;
      case 'C':
        if(design.carType !== CAR_TYPE_NORMAL) {
          break;
        }
        if(divisions[i] && divisions[i].length) {
          for(let j=0; j<divisions[i].length; j++) {

            if (wallCPartIsLaminate.length >0 ) {
              if(wallCPartIsLaminate[j] || wallCPartIsLaminate[j+1]) {
                pieceType = LIST
              } else {
                pieceType = GAP
              }
            }

            if(panelOrientation === HORIZONTAL) {
              wallPieces.push({piece: pieceType, position:[ -shape.width/2+listWidth, divisions[i][j], -shape.depth - itemOffsetC + 0.2 ], rotation:[0,Math.PI/2,0], scale: [1,llwidthScale,((shape.width-(2*listWidth))/240)], id: walls[i]+'_'+panelOrientation+'_'+pieceType+'_'+j.toString(), hideGroup:walls[i].toLowerCase()})
            } else {
              wallPieces.push({piece: pieceType, position:[ (divisions[i][j] - shape.width/2), 0, -shape.depth - itemOffsetC + 0.2 ], rotation:[-Math.PI/2,0,Math.PI/2], scale:[1,llwidthScale,(shape.height/240)], id: walls[i]+'_'+panelOrientation+'_'+pieceType+'_'+j.toString(), hideGroup:walls[i].toLowerCase()})
            }
          }
        }
        if(wallCPartIsLaminate.length > 0) {
          if(wallCPartIsLaminate[0]) {
            wallPieces.push({piece: pieceType, position:[ - shape.width/2 + listWidth/2, 0, -shape.depth - itemOffsetC + 0.2 ], rotation:[-Math.PI/2,0,Math.PI/2], scale:[1,llwidthScale,(shape.height/240)], id: walls[i]+'_'+panelOrientation+'_'+pieceType+'_D_CORNER', hideGroup:walls[i].toLowerCase()})
          }
          if(wallCPartIsLaminate[wallCPartIsLaminate.length-1]) {
            wallPieces.push({piece: pieceType, position:[ shape.width/2 - listWidth/2, 0, -shape.depth - itemOffsetC + 0.2 ], rotation:[-Math.PI/2,0,Math.PI/2], scale:[1,llwidthScale,(shape.height/240)],  id: walls[i]+'_'+panelOrientation+'_'+pieceType+'_B_CORNER', hideGroup:walls[i].toLowerCase()})
          }

        } else {
          if(pieceType === LIST) {
            wallPieces.push({piece: pieceType, position:[ - shape.width/2 + listWidth/2, 0, -shape.depth - itemOffsetC + 0.2 ], rotation:[-Math.PI/2,0,Math.PI/2], scale:[1,llwidthScale,(shape.height/240)], id: walls[i]+'_'+panelOrientation+'_'+pieceType+'_D_CORNER', hideGroup:walls[i].toLowerCase()})
            wallPieces.push({piece: pieceType, position:[ shape.width/2 - listWidth/2, 0, -shape.depth - itemOffsetC + 0.2 ], rotation:[-Math.PI/2,0,Math.PI/2], scale:[1,llwidthScale,(shape.height/240)],  id: walls[i]+'_'+panelOrientation+'_'+pieceType+'_B_CORNER', hideGroup:walls[i].toLowerCase()})
          }  
        }

        break;
      case 'D':
        if(divisions[i] && divisions[i].length) {
          for(let j=0; j<divisions[i].length; j++) {
            if (wallDPartIsLaminate.length >0 ) {
              if(wallDPartIsLaminate[j] || wallDPartIsLaminate[j+1] && (!scenicWallPositions || !(scenicWallPositions.includes('D1') || scenicWallPositions.includes('D2')))) {
                pieceType = LIST
                itemOffset = 0.83
              } else {
                pieceType = GAP
                itemOffset = 0.7
              }
            }
            if(panelOrientation === HORIZONTAL) {
              let decoDecrese=0;
              if(["DECO3", "DECO4"].indexOf(deco) !== -1) {
                decoDecrese = 36;
              }                
              wallPieces.push({piece: pieceType, position:[ -shape.width/2-itemOffset, divisions[i][j], -listWidth ], rotation:[-Math.PI,0,-Math.PI], scale:[1,llwidthScale,((shape.depth-decoDecrese - (2*listWidth) )/240)], id: walls[i]+'_'+panelOrientation+'_'+pieceType+'_'+j.toString(), hideGroup:walls[i].toLowerCase()})
            } else {
              wallPieces.push({piece: pieceType, position:[ -shape.width/2-itemOffset, 0, -divisions[i][j] ], rotation:[-Math.PI/2,0,-Math.PI], scale:[1,llwidthScale,(shape.height/240)], id: walls[i]+'_'+panelOrientation+'_'+pieceType+'_'+j.toString(), hideGroup:walls[i].toLowerCase()})
            }
          }
        }
        if(wallDPartIsLaminate.length>0) {
          if(wallDPartIsLaminate[0]) {
            wallPieces.push({piece: pieceType, position:[ -shape.width/2-itemOffset, 0, -listWidth/2 ], rotation:[-Math.PI/2,0,-Math.PI], scale:[1,llwidthScale,(shape.height/240)], id: walls[i]+'_'+panelOrientation+'_'+pieceType+'_A_CORNER', hideGroup:walls[i].toLowerCase()})
          }
          if(wallDPartIsLaminate[wallDPartIsLaminate.length-1]) {
            wallPieces.push({piece: pieceType, position:[ -shape.width/2-itemOffset, 0, -shape.depth+listWidth/2 ], rotation:[-Math.PI/2,0,-Math.PI], scale:[1,llwidthScale,(shape.height/240)], id: walls[i]+'_'+panelOrientation+'_'+pieceType+'_C_CORNER', hideGroup:walls[i].toLowerCase()})
          }
        } else {
          if(pieceType === LIST) {
            wallPieces.push({piece: pieceType, position:[ -shape.width/2-itemOffset, 0, -listWidth/2 ], rotation:[-Math.PI/2,0,-Math.PI], scale:[1,llwidthScale,(shape.height/240)], id: walls[i]+'_'+panelOrientation+'_'+pieceType+'_A_CORNER', hideGroup:walls[i].toLowerCase()})
            wallPieces.push({piece: pieceType, position:[ -shape.width/2-itemOffset, 0, -shape.depth+listWidth/2 ], rotation:[-Math.PI/2,0,-Math.PI], scale:[1,llwidthScale,(shape.height/240)], id: walls[i]+'_'+panelOrientation+'_'+pieceType+'_C_CORNER', hideGroup:walls[i].toLowerCase()})
          }
        }

        const dWallCopLists = copLists?.[1] ?copLists[1].filter(item => item !==null) :[]
        if(dWallCopLists.length>0) {
          dWallCopLists.forEach(item =>{
            wallPieces.push({piece: pieceType, position:[ -shape.width/2-itemOffset, 0, item ], rotation:[-Math.PI/2,0,-Math.PI], scale:[1,llwidthScale,(shape.height/240)], id: walls[i]+'_'+panelOrientation+'_'+pieceType+'_'+item.toString(), hideGroup:walls[i].toLowerCase()})
          })
        }

        break;
      default:
        break;          
    }

/*       } else {

      for(let j=0; j< divisions[i]; j++) {
        wallPieces.push({piece: GAP, position:[], rotation:[], id: walls[i]+'_'+panelOrientation+'_GAP_'+(j+1).toString(), hideGroup:walls[i].toLowerCase()})
      }
    }
*/
  }
  // console.log({wallPieces})
  return wallPieces;

}