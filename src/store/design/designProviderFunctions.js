/* 
    Separate file for some of the functions so they can be unit tested 
    separately.
*/

import deepcopy from 'deepcopy'
import { getPanelTypes } from "../../utils/design-utils"
import { ALL_WALL_PANELS_ID, SIDE_WALL_PANELS_ID, FIRST_TWO_PANELS, LAST_TWO_PANELS, } from "../../constants"

  /**
   * @param {Object} originalDesign
   * @param {Object} options
   * @param {string} options.finishType - finishType of the wall component
   * @param {string} options.panelType - Panel to set
   * @param {string} options.finish - finish id to set
   * @param {boolean=} options.custom - Custom finish?
   */
export function setWallPanelFinish(originalDesign, options) {
  const design = deepcopy(originalDesign)
  const { finishType, panelType, finish, custom } = options
  // TODO analytics?
  
  const wallComponent = design.components.find(x => x.finishType === finishType)

  if (!wallComponent) return

  const [ leftPanel, centerPanel, rightPanel ] = getPanelTypes(finishType)
  
  // If there are no parts for the wall yet, create them with the
  // currently selected finish of the wall.
  if (!wallComponent.parts) {
    const currentFinish = wallComponent.finish
    wallComponent.parts = [
      { type: leftPanel, finish: currentFinish },
      { type: centerPanel, finish: currentFinish },
      { type: rightPanel, finish: currentFinish },
    ]
  }
  
  // Set all panels to either the finish that is specified,
  // or if none is specified, then to the finish of the leftmost panel 
  // (arbitrary selection, could be any panel).
  if (panelType === ALL_WALL_PANELS_ID) {
    let finishToSet
    if (finish) {
      finishToSet = finish
    } else {
      const centerPanelComponent = wallComponent.parts.find(part => part.type === centerPanel)
      if (centerPanelComponent) {
        finishToSet = centerPanelComponent.finish
      }
    }
    
    wallComponent.parts.forEach(part => { 
      part.finish = finishToSet
      part.custom = custom
    })
  } else if (panelType === SIDE_WALL_PANELS_ID) {
    // Set the finish for the two side panels.
    const leftPart = wallComponent.parts.find(x => x.type === leftPanel)
    const rightPart = wallComponent.parts.find(x => x.type === rightPanel)

    if (leftPart) {
      leftPart.finish = finish
      leftPart.custom = custom
    }

    if (rightPart) {
      rightPart.finish = finish
      rightPart.custom = custom
    }
  } else if (panelType === LAST_TWO_PANELS) {
    const centerPart = wallComponent.parts.find(x => x.type === centerPanel)
    const rightPart = wallComponent.parts.find(x => x.type === rightPanel)

    if (centerPart) {
      centerPart.finish = finish
      centerPart.custom = custom
    }

    if (rightPart) {
      rightPart.finish = finish
      rightPart.custom = custom
    }
  } else if (panelType === FIRST_TWO_PANELS) {
    const centerPart = wallComponent.parts.find(x => x.type === centerPanel)
    const leftPart = wallComponent.parts.find(x => x.type === leftPanel)

    if (centerPart) {
      centerPart.finish = finish
      centerPart.custom = custom
    }

    if (leftPart) {
      leftPart.finish = finish
      leftPart.custom = custom
    }
  } else {
    const part = wallComponent.parts.find(x => x.type === panelType)

    if (part) {
      part.finish = finish
      part.custom = custom
    } 
  }

  // The wall is marked with the 'custom' flag if any of the panels
  // use a custom finish.
  wallComponent.custom = wallComponent.parts.filter(x => x.custom).length > 0

  // Delete the finish from the component so it does not mess up anything.
  // If there are panels set, then those should always be used instead.
  delete wallComponent.finish

  return design
}