import jsonLogic from 'json-logic-js';

import {
  CAR_TYPE_GLASS_BACKWALL, TYP_CAR_WALL_B, TYP_CAR_WALL_C, TYP_CAR_WALL_D,
  PANELING_EXCEPTION_CAR_SHAPES, THREE_PANELS, TWO_PANELS_COMBINED,
  DECO_GLASS_MATERIAL,
  MAT_CAR_WALL_FINISH_B,
  MAT_CAR_WALL_FINISH_D
} from "../../constants"
import { getPanelTypes } from "../../utils/design-utils"

/*
  These utils were originally in the DesignProvider but it was not possible
  to easily use them in the design-rules.js for example, so extracted the utils to a separate file. 
*/
function createPanelingUtils({ product, design: injectedDesign }) {
  function setWallPanelingStyle({ design = injectedDesign, finishType, panelingStyle }) {
    const wallComponent = design.components.find(x => x.finishType === finishType)

    if (!wallComponent) return

    const custom = wallComponent.custom
    const currentFinish = wallComponent.finish

    if (panelingStyle === THREE_PANELS || panelingStyle === TWO_PANELS_COMBINED) {

      const [leftPanel, centerPanel, rightPanel] = getPanelTypes(finishType)

      // treat as two panels (instead of three like in the design definition) for design specification and pdf layout
      const treatAsTwo = wallComponent.componentType === TYP_CAR_WALL_C && panelingStyle === TWO_PANELS_COMBINED

      wallComponent.treatAsTwo = treatAsTwo

      // If there are no parts for the wall yet, create them with the
      // currently selected finish of the wall.
      if (!wallComponent.parts) {
        wallComponent.parts = [
          { type: leftPanel, finish: currentFinish, custom },
          { type: centerPanel, finish: currentFinish, custom },
          { type: rightPanel, finish: currentFinish, custom },
        ]
      }

      if (wallComponent.componentType === TYP_CAR_WALL_B) {
        const wallD = design.components.find(x => x.componentType === TYP_CAR_WALL_D)
        if (wallD && (!wallD.parts || wallD.parts.length < 1)) {
          const [leftPanel, centerPanel, rightPanel] = getPanelTypes(wallD.finishType)
          wallD.parts = [
            { type: leftPanel, finish: wallD.finish, custom: wallD.custom },
            { type: centerPanel, finish: wallD.finish, custom: wallD.custom },
            { type: rightPanel, finish: wallD.finish, custom: wallD.custom },
          ]
        }
      } else if (wallComponent.componentType === TYP_CAR_WALL_D) {
        const wallB = design.components.find(x => x.componentType === TYP_CAR_WALL_B)
        if (wallB && (!wallB.parts || wallB.parts.length < 1)) {
          const [leftPanel, centerPanel, rightPanel] = getPanelTypes(wallB.finishType)
          wallB.parts = [
            { type: leftPanel, finish: wallB.finish, custom: wallB.custom },
            { type: centerPanel, finish: wallB.finish, custom: wallB.custom },
            { type: rightPanel, finish: wallB.finish, custom: wallB.custom },
          ]
        }

      }

    } else {

      clearWallPanels({ design, finishType })
      if (wallComponent.componentType === TYP_CAR_WALL_B) {
        const wallD = design.components.find(x => x.componentType === TYP_CAR_WALL_D)
        if (wallD) {
          clearWallPanels({ design, finishType: wallD.finishType })
        }
      } else if (wallComponent.componentType === TYP_CAR_WALL_D) {
        const wallB = design.components.find(x => x.componentType === TYP_CAR_WALL_B)
        if (wallB) {
          clearWallPanels({ design, finishType: wallB.finishType })
        }
      }

    }
  }

  function clearWallPanels({ design = injectedDesign, finishType }) {
    const wallComponent = design.components.find(x => x.finishType === finishType)


    // Set the leftmost panel finish to be the new finish of the wall.
    if (wallComponent && wallComponent.parts) {
      const [leftPanelId, centerPanelId] = getPanelTypes(finishType)

      const centerPanel = wallComponent.parts.find(x => x.type === centerPanelId)
      const centerPanelFinish = centerPanel ? centerPanel.finish : null

      const leftPanel = wallComponent.parts.find(x => x.type === leftPanelId)
      const leftPanelFinish = leftPanel ? leftPanel.finish : null

      const centerPanelMaterials = centerPanelFinish ? ((product.finishes || []).find(item => item.id === centerPanelFinish) || {}).materials : []
      const leftPanelMaterials = leftPanelFinish ? ((product.finishes || []).find(item => item.id === leftPanelFinish) || {}).materials : []

      const mixingResults = (product && product.rules && product.rules.wallMixingInstructions)
        ? jsonLogic.apply(product.rules.wallMixingInstructions, { FINISH: centerPanelFinish, MATERIALS: centerPanelMaterials })
        : [0, 0, 1]

      const canCenterPanelBeUsed = mixingResults[2]

      const mixingResultsLeft = (product && product.rules && product.rules.wallMixingInstructions)
        ? jsonLogic.apply(product.rules.wallMixingInstructions, { FINISH: leftPanelFinish, MATERIALS: leftPanelMaterials })
        : [0, 0, 1]

      const canLeftPanelBeUsed = mixingResultsLeft[2]
      if (!canCenterPanelBeUsed) { // && centerPanel !== CAR_WALL_STRUCTURE_CX removed, why this?

        if (canLeftPanelBeUsed || (PANELING_EXCEPTION_CAR_SHAPES.includes(design.carShape))) {
          const leftPanel = wallComponent.parts.find(x => x.type === leftPanelId)
          const leftPanelFinish = leftPanel ? leftPanel.finish : null
          wallComponent.finish = leftPanelFinish
        } else {
          const wallMaterials = product?.componentsData?.walls?.materials
          if (wallMaterials) {
            const nonDecoOrGlass = wallMaterials.find(item => (item.id !== DECO_GLASS_MATERIAL && item.id !== CAR_TYPE_GLASS_BACKWALL && item?.finishes?.length > 0))
            if (nonDecoOrGlass) {
              wallComponent.finish = nonDecoOrGlass.finishes[0].id
            }
          }

        }
      } else {
        wallComponent.finish = centerPanelFinish
      }
      delete wallComponent.parts
    }
  }

  function hasThreePanelsOnSideWall({ design = injectedDesign } = {}) {
    // Exception for home (it has parts in walls but only two panels)
    if (design && design.product === 'home') return false
    
    const bWall = getAllWallPanels({ design, finishType: MAT_CAR_WALL_FINISH_B })
    const dWall = getAllWallPanels({ design, finishType: MAT_CAR_WALL_FINISH_D })
    
    return (bWall && bWall.length > 0) || (dWall && dWall.length > 0)
  }

  function getAllWallPanels({ design = injectedDesign, finishType }) {
    const wallComponent = design.components.find(x => x.finishType === finishType)

    if (wallComponent) {      
      return wallComponent.parts
    }
  }

  return {
    setWallPanelingStyle,
    clearWallPanels,
    hasThreePanelsOnSideWall,
    getAllWallPanels,
  }
}

export default createPanelingUtils