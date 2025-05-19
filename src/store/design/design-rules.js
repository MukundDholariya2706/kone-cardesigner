import jsonLogic from 'json-logic-js';
import _ from 'lodash';

import {
  TYP_CAR_HANDRAIL,
  TYP_CAR_SKIRTING,
  TYP_CAR_SEAT,
  TYP_CAR_BUFFER_RAIL,
  TYP_CAR_MIRROR,
  TYP_DOOR_A,
  CAR_SHAPES,
  TYP_CAR_MEDIASCREEN,
  TYP_CAR_INFOSCREEN,
  TYP_COP_PRODUCT_1,
  TYP_COP_2,
  TYP_CAR_WALL_ADD_DECO_PACKAGE,
  TYP_CAR_FLOORING,
  TYP_CAR_CEILING,
  DEFAULT_SKIRTING_COMPONENT,
  HORIZONTAL,
  VERTICAL,
  TYP_CAR_GLASS_WALL_C,
  TYP_CAR_WALL_B,
  TYP_CAR_WALL_D,
  TYP_CAR_WALL_C,
  TYP_CAR_LAMINATE_LIST,
  MAT_CAR_LAMINATE_LIST,
  GLASS_C_FHT,
  GLASS_C_FHT_HERMES,
  DEFAULT_HANDRAIL_FOR_GLASS_WALL,
  TYP_HL_PRODUCT,
  TYP_LCS_PRODUCT,
  TYP_EID_PRODUCT,
  TYP_DIN_PRODUCT,
  TYP_DOP_PRODUCT,
  TYP_LDO_FRAME_FRONT,
  COMPONENT_CEILING_NONE,
  MAT_CAR_WALL_FINISH_C,
  COMPONENT_COP_NONE,
  TYP_CAR_TENANT_DIRECTORY,
  MAT_CAR_WALL_FINISH_B,
  MAT_CAR_WALL_FINISH_D,
  TYP_COP_FACE_PLATE_PRINT_1,
  TYP_COP_HORIZONTAL,
  TYP_COP_DISPLAY,
  CAR_WALL_STRUCTURE_BX,
  CAR_WALL_STRUCTURE_DX,
  CAR_WALL_STRUCTURE_CX,
  CAR_WALL_STRUCTURE_B1,
  CAR_WALL_STRUCTURE_B2,
  CAR_WALL_STRUCTURE_C1,
  CAR_WALL_STRUCTURE_C2,
  CAR_WALL_STRUCTURE_D1,
  CAR_WALL_STRUCTURE_D2,
  TYP_HL_DISPLAY,
  TYP_LCI_DISPLAY,
  TYP_DIN_DISPLAY,
  TYP_DOP_DISPLAY,
  TYP_FB,
  MAT_CAR_HANDRAIL,
  DECO_GLASS_MATERIAL,
  CAR_TYPE_NORMAL,
  CAR_TYPE_GLASS_BACKWALL,
  TYP_DOOR_C,
  MAT_CDO_PANEL,
  DEFAULT_GLASS_C_WALL,
  MAT_CAR_WALL,
  TYP_CAR_GLASS_WALL_C_PIT,
  GLASS_C_PIT,
  TYP_CAR_GLASS_WALL_C_CITY,
  GLASS_C_CITY,
  MAT_COP_FACE_PLATE_1,
  TYP_CAR_MIRROR_2,
  DOOR_OPENING_TYPE,
  DOOR_FINISHING_A,
  GLASS_WALL_MATERIAL,
  CAR_TYPE_GLASSMATERIAL_BACKWALL,
  TYP_CAR_FRONT_WALL_A,
  TYP_CDL_PRODUCT,
  CAR_TYPE_TTC_ENA,
  CAR_TYPE_TTC,
  EXTRA_FEATURES,
  OFFERING_INDIA,
  TYP_HI_PRODUCT,
  TYP_HI_DISPLAY,
  COPS_WITH_KONE_INFORMATION,
  KCSM_KONE_INFORMATION,
  KCSM_AIR_PURIFIER,
  BUTTON_COLS,
  BUTTON_COL_ONE,
  BRAILLE,
  BRAILLE_OFF,
  BRAILLE_ON,
  BUTTON_SHAPE,
  BUTTON_SHAPE_ROUND,
  BUTTON_FINISH,
  VIEW3D_MODE_LANDING,
} from '../../constants';

import { isTrueTypeCar } from '../../utils/design-utils';
import { copy as deepcopy } from '../../utils/generalUtils';
import createPanelingUtils from './paneling-utils';

function isRALFinish(finish) {
  if (!finish) return;
  return finish[0] === '{';
}

/**
 * Checks that the components in the design are allowed and available in the product.
 * If not, sets allowed values for the design components. TODO more validation
 */
export function validateDesign(originalDesign, product) {
  if (!originalDesign || !product || !product.componentsData) return originalDesign;

  const design = deepcopy(originalDesign);

  /**
   * Checks if the component with componentType exists in design, and if it is allowed.
   * If not, selects the first component in the allowed components and sets that as the
   * component in use for the design.
   * @returns The component in use after the function runs.
   */
  function setAllowedComponent(componentType, allowedComponents) {
    const componentInUse = design.components.find((c) => c.componentType === componentType);
    const shouldReplace = componentInUse && componentInUse.component && !allowedComponents.includes(componentInUse.component);

    if (shouldReplace) {
      componentInUse.component = allowedComponents[0];
    }

    return componentInUse;
  }

  // Car type and shape
  const availableCarTypes = product.componentsData.cartypes.filter((x) => !x.disabled).map((x) => x.id);
  const availableCarShapes = product.componentsData.carshapes.filter((x) => !x.disabled).map((x) => x.id);

  if (!availableCarShapes.includes(design.carShape)) {
    console.log(`Car shape ${design.carShape} is not available. Using ${availableCarShapes[0]} instead.`);
    design.carShape = availableCarShapes[0];
  }

  if (
    !availableCarTypes.includes(design.carType) &&
    design.carType !== CAR_TYPE_GLASS_BACKWALL &&
    design.carType !== CAR_TYPE_GLASSMATERIAL_BACKWALL
  ) {
    console.log(`Car type ${design.carType} is not available. Using ${availableCarTypes[0]} instead.`);
    design.carType = availableCarTypes[0];
  }

  // Doors
  const availableDoors = product.componentsData.doors.solutions.filter((x) => !x.disabled).map((x) => x.id);
  setAllowedComponent(TYP_DOOR_A, availableDoors);

  // Door frame
  const availableFrames = product.componentsData.doors.frames.filter((x) => !x.disabled).map((x) => x.id);
  setAllowedComponent(TYP_LDO_FRAME_FRONT, availableFrames);

  // COP model
  // Goes through all the cop families and gets the cop types that have not been disabled.
  const availableCOPTypes = product.componentsData.signalization.copModels.reduce(
    (prev, model) => {
      if (model.disabled) return prev; // If the whole family is disabled, all of its types are also disabled
      const availableInModel = model.copTypes.filter((x) => !x.disabled).map((x) => x.id);
      return [...prev, ...availableInModel];
    },
    [COMPONENT_COP_NONE]
  );
  const copInUse = setAllowedComponent(TYP_COP_PRODUCT_1, availableCOPTypes);

  // COP position
  const allowedCOPPositions = product.componentsData.signalization.copPositions.filter((x) => !x.disabled).map((x) => x.id);

  if (!copInUse || !copInUse.positions) {
    copInUse.positions = [];
  }

  if (copInUse && copInUse.component === COMPONENT_COP_NONE) {
    copInUse.positions = ['B2'];
  }

  // Remove positions that are not allowed
  copInUse.positions = copInUse.positions.filter((x) => {
    return allowedCOPPositions.includes(x);
  });

  // If no positions left, add an allowed position to the list.
  if (copInUse.positions.length === 0) {
    copInUse.positions.push(allowedCOPPositions[0]);
  }

  // Skirting
  const availableSkirtings = product.componentsData.accessories.skirtings.finishes.filter((x) => !x.disabled).map((x) => x.id);

  const skirtingInUse = design.components.find((c) => c.componentType === TYP_CAR_SKIRTING);

  if (skirtingInUse) {
    if (!availableSkirtings.includes(skirtingInUse.finish)) {
      skirtingInUse.finish = availableSkirtings[0];
    }
  } 

  return design;
}

const applyRules = (design, product, options = {}) => {
  if (!design) {
    return design;
  }
  if (!product) {
    return design;
  }

  // For KTOC links initial loading
  if (options.skipRules) {
    return design;
  }

  // Disabling regulation rules for KTOC designs
  let originalRegulations;

  if (design.ktoc && !options.onEditPage) {
    originalRegulations = deepcopy(design.regulations);
    design.regulations = [];
  }

  design = validateDesign(deepcopy(design), product);
  console.log('Apply rules to design: ', deepcopy(design), deepcopy(product));

  // collect the components that has to be removed
  let toBeRemoved = [];

  const wallDIndex = design.components.findIndex((item) => item.componentType === TYP_CAR_WALL_D);
  const wallCIndex = design.components.findIndex((item) => item.componentType === TYP_CAR_WALL_C);
  const wallBIndex = design.components.findIndex((item) => item.componentType === TYP_CAR_WALL_B);
  const wallAIndex = design.components.findIndex((item) => item.componentType === TYP_CAR_FRONT_WALL_A);

  /*////////////////////////////////////////
                                                                          
  ####   ####  ###### #    # #  ####      ####  #    # ######  ####  #    # 
 #      #    # #      ##   # # #    #    #    # #    # #      #    # #   #  
  ####  #      #####  # #  # # #         #      ###### #####  #      ####   
      # #      #      #  # # # #         #      #    # #      #      #  #   
 #    # #    # #      #   ## # #    #    #    # #    # #      #    # #   #  
  ####   ####  ###### #    # #  ####      ####  #    # ######  ####  #    # 

  // Check if car type is scenic then add handrail to C, component to be determined later
  ////////////////////////////////////////*/
  const scenicIndex = design.components.findIndex((item) => item.componentType === TYP_CAR_GLASS_WALL_C);
  if (scenicIndex !== -1) {
    if (design.components[scenicIndex].component === GLASS_C_FHT || design.components[scenicIndex].component === GLASS_C_FHT_HERMES) {
      const handrailIndex = design.components.findIndex((item) => item.componentType === TYP_CAR_HANDRAIL);
      const scenicPositions = (design.components.find((item) => item.componentType === TYP_CAR_GLASS_WALL_C) || {}).positions || null;
      if (handrailIndex !== -1) {
        const handrailInUse = design.components[handrailIndex];
        if (handrailInUse.positions && handrailInUse.positions.indexOf('C') === -1 && (!scenicPositions || scenicPositions.includes('C'))) {
          design.components[handrailIndex].positions.push('C');
        }
        if (
          handrailInUse.positions &&
          handrailInUse.positions.indexOf('B') === -1 &&
          scenicPositions &&
          (scenicPositions.includes('B1') || scenicPositions.includes('B2'))
        ) {
          design.components[handrailIndex].positions.push('B');
        }
        if (
          handrailInUse.positions &&
          handrailInUse.positions.indexOf('D') === -1 &&
          scenicPositions &&
          (scenicPositions.includes('D1') || scenicPositions.includes('D2'))
        ) {
          design.components[handrailIndex].positions.push('D');
        }
      } else {
        design.components.push(DEFAULT_HANDRAIL_FOR_GLASS_WALL);
        const hrIndex = design.components.findIndex((item) => item.componentType === TYP_CAR_HANDRAIL);
        if (scenicPositions) {
          let hrPositions = [];
          if (scenicPositions.includes('C')) hrPositions.push('C');
          if (scenicPositions.includes('B1') || scenicPositions.includes('B2')) hrPositions.push('B');
          if (scenicPositions.includes('D1') || scenicPositions.includes('D2')) hrPositions.push('D');
          design.components[hrIndex] = {
            ...DEFAULT_HANDRAIL_FOR_GLASS_WALL,
            positions: hrPositions,
          };
        }
      }
    }

    // check hermes car glass frame finish. hard coded, don't want to make another rule. TODO if there are more types or possibilities
    if (design.components[scenicIndex].component === GLASS_C_FHT_HERMES) {
      const skirtingIndex = design.components.findIndex((item) => item.componentType === TYP_CAR_SKIRTING);

      if (skirtingIndex !== -1) {
        if (design.components[skirtingIndex].finish === 'SS1') {
          design.components[scenicIndex].finish = 'SS1';
        } else {
          design.components[scenicIndex].finish = 'F';
        }
      } else {
        // both walls will be changed to the finish that is set to D wall
        const dFinish = wallDIndex !== -1 && design.components[wallDIndex].finish;
        if (['SS1', 'SS2', 'L200'].includes(dFinish)) {
          design.components[scenicIndex].finish = 'SS1';
        } else {
          design.components[scenicIndex].finish = 'F';
        }
      }
    }
  }

  /*////////////////////////////////////////
                                                                                         
  ####    ##   #####     ##### #   # #####  ######     ####  #    # ######  ####  #    # 
 #    #  #  #  #    #      #    # #  #    # #         #    # #    # #      #    # #   #  
 #      #    # #    #      #     #   #    # #####     #      ###### #####  #      ####   
 #      ###### #####       #     #   #####  #         #      #    # #      #      #  #   
 #    # #    # #   #       #     #   #      #         #    # #    # #      #    # #   #  
  ####  #    # #    #      #     #   #      ######     ####  #    # ######  ####  #    # 
                                                                                                                                               
  // Check if car type is TTC but the car shape and product combination doesn't allow it.
  ////////////////////////////////////////*/
  if (product && product.rules && product.rules.variousFilteringRules) {
    if (
      !jsonLogic.apply(product.rules.variousFilteringRules, {
        filteringRULE: 'shapeRule',
        modelAndLayout_CARSHAPE: design.carShape,
        modelAndLayout_PRODUCT: product.product,
        modelAndLayout_CARTYPE: design.carType,
      })
    ) {
      const validCarType =
        product.carTypes &&
        product.carTypes.find((item) => {
          return jsonLogic.apply(product.rules.variousFilteringRules, {
            filteringRULE: 'shapeRule',
            modelAndLayout_CARSHAPE: design.carShape,
            modelAndLayout_PRODUCT: product.product,
            modelAndLayout_CARTYPE: item,
          });
        });

      if (validCarType) {
        if (isTrueTypeCar(validCarType)) {
          if (!design.components.find((item) => item.componentType === TYP_DOOR_C)) {
            design.components.push({
              componentType: TYP_DOOR_C,
              component: (design.components.find((item) => item.componentType === TYP_DOOR_A) || {}).component,
              finishType: MAT_CDO_PANEL,
              finish: (design.components.find((item) => item.finishType === MAT_CDO_PANEL) || {}).finish,
            });

            design = {
              ...design,
              components: [
                ...design.components.filter((item) => {
                  return (
                    item.componentType !== TYP_CAR_WALL_C &&
                    item.componentType !== TYP_CAR_GLASS_WALL_C_PIT &&
                    item.componentType !== TYP_CAR_GLASS_WALL_C_CITY &&
                    item.componentType !== TYP_CAR_GLASS_WALL_C
                  );
                }),
              ],
            };
          }
        } else if (validCarType === CAR_TYPE_NORMAL) {
          design.components.push({
            componentType: TYP_CAR_WALL_C,
            component: 'WALLC',
            finishType: MAT_CAR_WALL_FINISH_C,
            finish: (product.finishes.find((item) => (item.types || []).indexOf(MAT_CAR_WALL_FINISH_C) !== -1 && !item.disabled) || {}).id,
          });

          design = {
            ...design,
            components: [
              ...design.components.filter((item) => {
                return (
                  item.componentType !== TYP_DOOR_C &&
                  item.componentType !== TYP_CAR_GLASS_WALL_C_PIT &&
                  item.componentType !== TYP_CAR_GLASS_WALL_C_CITY &&
                  item.componentType !== TYP_CAR_GLASS_WALL_C
                );
              }),
            ],
          };
        } else if (validCarType === CAR_TYPE_GLASS_BACKWALL) {
          let defaultGlassCWall;
          if (product && product.componentsData) {
            const scenicWindowData = product.componentsData.walls.scenicWindowTypes;
            // Get the default scenic window data from.
            const defaultInData = scenicWindowData.find((x) => x.id === DEFAULT_GLASS_C_WALL);

            // If the default has been disabled, choose the first non-disabled one from the list as the default.
            if (defaultInData.disabled) {
              defaultGlassCWall = scenicWindowData.find((x) => !x.disabled).id;
            }

            // Default to the initial default if no other option was set.
            if (!defaultGlassCWall) {
              defaultGlassCWall = DEFAULT_GLASS_C_WALL;
            }
          }

          design.components.push({
            componentType: TYP_CAR_GLASS_WALL_C_PIT,
            component: GLASS_C_PIT,
          });

          design.components.push({
            componentType: TYP_CAR_GLASS_WALL_C_CITY,
            component: GLASS_C_CITY,
          });

          design.components.push({
            componentType: TYP_CAR_GLASS_WALL_C,
            component: defaultGlassCWall,
            finishType: MAT_CAR_WALL,
            finish: (product.finishes.find((item) => (item.types || []).indexOf(MAT_CAR_WALL) !== -1) || {}).id,
          });

          design = {
            ...design,
            components: [
              ...design.components.filter((item) => {
                return item.componentType !== TYP_DOOR_C && item.componentType !== TYP_CAR_WALL_C;
              }),
            ],
          };
        }

        design.carType = validCarType;
      }
    }
  }

  /////////////////////////////////////////
  // Check if using china products and c wall has decoglass finish then add handrail to C, component to be determined later
  /////////////////////////////////////////
  /* let addHandrail = false
  if(wallCIndex !== -1 && product && product.rules && product.rules.handrailExecptions) {
    const cWallFinishItem = product.finishes.find(item => item.sapId === design.components[wallCIndex].finish)
    const wallCMaterials = (product.finishMaterials || []).filter(item => {      
      return item.types && item.types.indexOf(MAT_CAR_WALL_FINISH_C) !== -1 && item.disabled !== true ;
    })
    const cWallMaterial = wallCMaterials.find(item => ((cWallFinishItem || {}).materials || []).indexOf(item.id) !== -1 )
    console.log(cWallMaterial)

    if (cWallMaterial) {
      addHandrail = jsonLogic.apply(product.rules.handrailExecptions, {PRODUCT: product.product, CWALL_MATERIAL:cWallMaterial.id})
    }
  }

  if(wallCIndex !== -1 && addHandrail) {

    const handrailIndex = design.components.findIndex(item => item.componentType === TYP_CAR_HANDRAIL);
    if(handrailIndex !== -1) {
      if(design.components[handrailIndex].positions.indexOf('C') === -1) {
        design.components[handrailIndex].positions.push('C')
      }
    } else {
      design.components.push(DEFAULT_HANDRAIL_FOR_GLASS_WALL)
    }
  } */

  /*////////////////////////////////////////
                                        
  ####  ###### # #      # #    #  ####  
 #    # #      # #      # ##   # #    # 
 #      #####  # #      # # #  # #      
 #      #      # #      # #  # # #  ### 
 #    # #      # #      # #   ## #    # 
  ####  ###### # ###### # #    #  ####  
                                        
  // Check that the ceiling is valid, if not, change the component, finish to be determined later
  ////////////////////////////////////////*/
  const ceilingIndex = design.components.findIndex((item) => item.componentType === TYP_CAR_CEILING);
  if (ceilingIndex !== -1) {
    if (product?.rules?.ceilings) {
      // const decoIndex = design.components.findIndex(item => item.componentType === TYP_CAR_WALL_ADD_DECO_PACKAGE);
      // const validComponents = ( product.components.filter(comp => comp.type === TYP_CAR_CEILING) || []).filter(item => {
      const validComponents = (product.componentsData.ceilings || []).filter((item) => {
        let test = {};
        test[TYP_CAR_CEILING] = item.id;
        test['CARSHAPE'] = design.carShape;
        test['CARTYPE'] = design.carType;
        test['PRODUCT'] = product.product;
        test['PREDESIGN'] = design.sapId;
        test['REGULATIONS'] = design.regulations || [];
        test["AWALL_FINISH"] = wallAIndex !== -1 ? design.components[wallAIndex].finish : '';
        test["BWALL_FINISH"] = wallBIndex !== -1 ? design.components[wallBIndex].finish : '';
        test["CWALL_FINISH"] = wallCIndex !== -1 ? design.components[wallCIndex].finish : '';
        test["DWALL_FINISH"] = wallDIndex !== -1 ? design.components[wallDIndex].finish : '';

        return jsonLogic.apply(product.rules.ceilings, test);
      });

      if (
        validComponents.length > 0 &&
        !validComponents.find((item) => item.sapId === design.components[ceilingIndex].component) &&
        design.components[ceilingIndex].component !== COMPONENT_CEILING_NONE
      ) {
        const validCeilingIndex = validComponents.findIndex((item) => item.disabled !== true);
        design.components[ceilingIndex].component = validComponents[validCeilingIndex].sapId;
        options.addToast &&
          options.getText &&
          options.addToast({ message: options.getText('ui-dialog-ceiling-has-changed-due-design'), type: 'info', autoDismiss: 4000 });
      }
    }
  }

  /*////////////////////////////////////////

 ##### #####  #  ####   ####  #       ####  #####  
   #   #    # # #    # #    # #      #    # #    # 
   #   #    # # #      #    # #      #    # #    # 
   #   #####  # #      #    # #      #    # #####  
   #   #   #  # #    # #    # #      #    # #   #  
   #   #    # #  ####   ####  ######  ####  #    # 

                                                  
  // Check if tricolor wall is present and can it still be
  ////////////////////////////////////////*/
  if (wallBIndex !== -1 || wallCIndex !== -1 || wallDIndex !== -1) {
    if (product && product.rules && product.rules.wallMixingInstructions) {
      if (wallBIndex !== -1 && design.components[wallBIndex].parts && design.components[wallBIndex].parts.length > 0) {
        // check B wall
        const result = jsonLogic.apply(product.rules.wallMixingInstructions, { WALL: TYP_CAR_WALL_B, SHAPE: design.carShape });
        if (!result[0]) {
          const bWallMiddlePart = design.components[wallBIndex].parts.find((item) => item.type === CAR_WALL_STRUCTURE_B2);

          if (bWallMiddlePart) {
            design.components[wallBIndex].finish = bWallMiddlePart.finish || '';
          }

          delete design.components[wallBIndex].parts;
        }
      }

      if (wallDIndex !== -1 && design.components[wallDIndex].parts && design.components[wallDIndex].parts.length > 0) {
        // check B wall
        const result = jsonLogic.apply(product.rules.wallMixingInstructions, { WALL: TYP_CAR_WALL_D, SHAPE: design.carShape });
        if (!result[0]) {
          const dWallMiddlePart = design.components[wallDIndex].parts.find((item) => item.type === CAR_WALL_STRUCTURE_D1);

          if (dWallMiddlePart) {
            design.components[wallDIndex].finish = dWallMiddlePart.finish || '';
          }

          delete design.components[wallDIndex].parts;
        }
      }

      if (wallCIndex !== -1 && design.components[wallCIndex].parts && design.components[wallCIndex].parts.length > 0) {
        // check C wall
        const result = jsonLogic.apply(product.rules.wallMixingInstructions, { WALL: TYP_CAR_WALL_C, SHAPE: design.carShape });
        if (!result[0]) {
          const cWallMiddlePart = design.components[wallCIndex].parts.find((item) => item.type === CAR_WALL_STRUCTURE_CX);

          if (cWallMiddlePart) {
            design.components[wallCIndex].finish = cWallMiddlePart.finish || '';
          }

          delete design.components[wallCIndex].parts;
        }
      }
    }
  }

  /*////////////////////////////////////////
                                   
  ####     #    #   ##   #      #      
 #    #    #    #  #  #  #      #      
 #         #    # #    # #      #      
 #         # ## # ###### #      #      
 #    #    ##  ## #    # #      #      
  ####     #    # #    # ###### ###### 

  // Check that the C wall finish is valid
  ////////////////////////////////////////*/
  if (wallCIndex !== -1) {
    if (product && product.rules && product.rules.wallMaterials && product.rules.decoMirror && design.components[wallCIndex].finish) {
      // make sure the the deco packge can be used with current setup
      // const decos = (product.components || []).filter(item => item.type === TYP_CAR_WALL_ADD_DECO_PACKAGE)
      const decos = product.componentsData.walls.decorativeGlass || [];
      const decoIndex = design.components.findIndex((item) => item.componentType === TYP_CAR_WALL_ADD_DECO_PACKAGE);

      if (decos.length === 0 && decoIndex !== -1) {
        design.components[decoIndex].component = 'DECO0';
      } else {
        const newDecos = decos.filter((item) => {
          let test = {};
          test['CEILING'] = ceilingIndex !== -1 ? design.components[ceilingIndex].component : '';
          //test['REGULATIONS'] = (design.regulations) ?design.regulations :[];
          test[TYP_CAR_WALL_ADD_DECO_PACKAGE] = item.id;
          return jsonLogic.apply(product.rules.decoMirror, test);
        });

        if (decoIndex !== -1 && newDecos.findIndex((item) => item.sapId === design.components[decoIndex].component) === -1) {
          const validDecoIndex = newDecos.findIndex((item) => item.disabled !== true);
          design.components[decoIndex].component = newDecos[validDecoIndex].sapId;
        }
      }

      // special case when the product has all wall 

      // make sure that C wall material is valid for the setup
      const wallCMaterials = product.componentsData.walls.materials || [];
      let validMaterial = null;

      const cFinish = design.components[wallCIndex].finish;
      const finishItem = product.finishes.find((item) => item.sapId === cFinish) || {};

      if (finishItem && finishItem.materials) {
        let material = finishItem.materials[0];
        if (finishItem.materials.length > 1) {
          // TODO: exception if finish belongs to several materials
        }
        const validMaterials = (wallCMaterials || []).filter((item) => {
          let test = {};
          test['PRODUCT'] = product.product
          test['CEILING'] = ceilingIndex !== -1 ? design.components[ceilingIndex].component : '';
          test['WALL_MATERIAL'] = item.id;
          test['WALL'] = MAT_CAR_WALL_FINISH_C;
          test['MARKETS'] = product.businessSpecification.market || '';
          test['DECO'] =
            ((design.components || []).find((item) => item.componentType === TYP_CAR_WALL_ADD_DECO_PACKAGE) || {}).component || 'none';
            return jsonLogic.apply(product.rules.wallMaterials, test);
        });

        if (validMaterials.length > 0 && !validMaterials.find((item) => item.id === material)) {
          validMaterial = validMaterials.find((item) => item.disabled !== true && item.id !== GLASS_WALL_MATERIAL) || {};
          const newFinish = validMaterial.finishes[0];

          design.components[wallCIndex].finish = (newFinish || {}).id;
        }
      }

      const isCFinishValid = jsonLogic.apply(product.rules.wallFinishes, {
        PRODUCT: product?.product,
        CARSHAPE: design?.carShape,
        FINISH: design.components[wallCIndex].finish,
        PREDESIGN: design?.originalSapId,
        WALL: MAT_CAR_WALL_FINISH_C,
      });
      if (!isCFinishValid) {
        const currentMaterial = wallCMaterials.find((item) => item.id === design.components[wallCIndex].finishMaterial);
        const newFinish = currentMaterial?.finishes.find((item) => {
          let test = {};
          test['PRODUCT'] = product?.product;
          test['CARSHAPE'] = design?.carShape;
          test['FINISH'] = item.id;
          test['PREDESIGN'] = design?.originalSapId;
          test['WALL'] = MAT_CAR_WALL_FINISH_C;
          return jsonLogic.apply(product.rules.wallFinishes, test);
        });
        design.components[wallCIndex].finish = (newFinish || {}).id;
      }

      const cFinishReCheck = design.components[wallCIndex].finish;

      if (
        product.rules.wallFinishes &&
        !jsonLogic.apply(product.rules.wallFinishes, {
          WALL_FINISH: cFinishReCheck,
          DECO: ((design.components || []).find((item) => item.componentType === TYP_CAR_WALL_ADD_DECO_PACKAGE) || {}).component,
        })
      ) {
        const validFinish = validMaterial.finishes.find((item) => {
          return jsonLogic.apply(product.rules.wallFinishes, {
            WALL_FINISH: item.id,
            DECO: ((design.components || []).find((decoitem) => decoitem.componentType === TYP_CAR_WALL_ADD_DECO_PACKAGE) || {}).component,
          });
        });

        design.components[wallCIndex].finish = validFinish.id;
      }
    }
  }

  let wallLocksValid = true;
  if (
    !product?.wallEditor?.wallFinishesRestricted ||
    product.offeringLocation === OFFERING_INDIA ||
    (scenicIndex !== -1 && !product?.wallEditor?.scenicSelection)
  ) {
    wallLocksValid = false;
  }

  /*////////////////////////////////////////
                                                                   
 #    #   ##   #      #         #       ####   ####  #    #  ####  
 #    #  #  #  #      #         #      #    # #    # #   #  #      
 #    # #    # #      #         #      #    # #      ####    ####  
 # ## # ###### #      #         #      #    # #      #  #        # 
 ##  ## #    # #      #         #      #    # #    # #   #  #    # 
 #    # #    # ###### ######    ######  ####   ####  #    #  ####  
                                                                   
  // Check the finish locking of the walls
  ////////////////////////////////////////*/
  if (wallDIndex !== -1 && wallBIndex !== -1 && wallLocksValid) {
    // group has not been defined for the wall(s)
    if (design.components[wallDIndex].group === undefined || design.components[wallBIndex].group === undefined) {
      // the D wall group is always 0
      design.components[wallDIndex].group = design.components[wallDIndex].group || 0;

      // if C wall has the same finish as D wall set it to same group or all wall must have the same finish, otherwise set it to be 1
      if (wallCIndex !== -1) {
        if (design.components[wallCIndex].finish === design.components[wallDIndex].finish || !product.wallEditor.wallSelector) {
          design.components[wallCIndex].group = design.components[wallDIndex].group;
        } else {
          design.components[wallCIndex].group = design.components[wallCIndex].group || 1;
        }
      }

      // if B wall has the same finish as D wall set it to same group, otherwise set it to be 1
      if (design.components[wallBIndex].finish === design.components[wallDIndex].finish) {
        design.components[wallBIndex].group = design.components[wallDIndex].group;
      } else {
        design.components[wallBIndex].group = design.components[wallBIndex].group || 1;
      }
    }

    if (
      design.components[wallDIndex].group !== undefined &&
      design.components[wallBIndex].group !== undefined &&
      wallCIndex !== -1 &&
      design.components[wallCIndex].group === undefined
    ) {
      design.components[wallDIndex].group = design.components[wallBIndex].group = 0;
      design.components[wallCIndex].group = 1;
    }

    // let's handle the full scenic case completely separately
    if (scenicIndex !== -1 && design.components[scenicIndex].positions) {
      const scenicPositions = design.components[scenicIndex].positions;
      design.components[wallDIndex].group = 0;
      if (wallCIndex !== -1) {
        design.components[wallCIndex].group =
          (scenicPositions.includes('D1') || scenicPositions.includes('D2')) && scenicPositions.includes('C')
            ? 0
            : !(scenicPositions.includes('D1') || scenicPositions.includes('D2')) &&
              !scenicPositions.includes('C') &&
              (scenicPositions.includes('B1') || scenicPositions.includes('B2'))
            ? 0
            : 1;
      }
      design.components[wallDIndex].group =
        (scenicPositions.includes('D1') || scenicPositions.includes('D2')) &&
        (scenicPositions.includes('B1') || scenicPositions.includes('B2'))
          ? 0
          : !(scenicPositions.includes('D1') || scenicPositions.includes('D2')) &&
            !(scenicPositions.includes('B1') || scenicPositions.includes('B2'))
          ? 0
          : 1;
    }

    if (product && product.rules && product.rules.wallLocks) {
      const decoIndex = design.components.findIndex((item) => item.componentType === TYP_CAR_WALL_ADD_DECO_PACKAGE);
      const cop1Index = design.components.findIndex((item) => item.componentType === TYP_COP_PRODUCT_1);
      let cWallMaterial = null;
      const wallMaterials = product.componentsData.walls.materials || null;
      if (wallCIndex !== -1 && wallMaterials) {
        cWallMaterial = wallMaterials.find((material) => {
          return material.finishes.indexOf((item) => item.id === design.components[wallCIndex].finish) !== -1;
        });
      }

      let test = {};
      test['PRODUCT'] = product.product;
      test['CAR_TYPE'] = design.carType || 'none';
      test['DECO'] = decoIndex !== -1 ? design.components[decoIndex].component : 'none';
      test['COP1_POS'] = (design.components[cop1Index].positions || []).join('');
      test['CWALL_MATERIAL'] = cWallMaterial ? cWallMaterial.id : null;
      let validCombinations = jsonLogic.apply(product.rules.wallLocks, test);
      // console.log({test,validCombinations})
      validCombinations = validCombinations.filter((item) => item !== null);

      let isValid = false;
      for (let i = 0; i < validCombinations.length; i++) {
        if (validCombinations[i]) {
          isValid = true;
          if (design.components[wallDIndex].group !== validCombinations[i][0]) {
            isValid = false;
          }
          if (wallCIndex !== -1 && design.components[wallCIndex].group !== validCombinations[i][1]) {
            isValid = false;
          }
          if (design.components[wallBIndex].group !== validCombinations[i][2]) {
            isValid = false;
          }
          if (isValid) {
            break;
          }
        }
      }

      if (!isValid) {
        if (validCombinations.length > 0) {
          design.components[wallDIndex].group = validCombinations[0][0];
          if (wallCIndex !== -1) {
            design.components[wallCIndex].group = validCombinations[0][1];
          }
          design.components[wallBIndex].group = validCombinations[0][2];
        }
      }
    }

    const wallMaterials = product.componentsData.walls.materials || [];

    const isBFinishValid = jsonLogic.apply(product.rules.wallFinishes, {
      PRODUCT: product?.product,
      CARSHAPE: design?.carShape,
      FINISH: design.components[wallBIndex].finish,
      PREDESIGN: design?.originalSapId,
      WALL: MAT_CAR_WALL_FINISH_B,
    });
    if (!isBFinishValid) {
      const currentMaterial = wallMaterials.find((item) => item.id === design.components[wallBIndex].finishMaterial);
      const newFinish = currentMaterial.finishes.find((item) => {
        let test = {};
        test['PRODUCT'] = product?.product;
        test['CARSHAPE'] = design?.carShape;
        test['FINISH'] = item.id;
        test['PREDESIGN'] = design?.originalSapId;
        test['WALL'] = MAT_CAR_WALL_FINISH_B;
        return jsonLogic.apply(product.rules.wallFinishes, test);
      });
      design.components[wallBIndex].finish = (newFinish || {}).id;
    }

    const isDFinishValid = jsonLogic.apply(product.rules.wallFinishes, {
      PRODUCT: product?.product,
      CARSHAPE: design?.carShape,
      FINISH: design.components[wallDIndex].finish,
      PREDESIGN: design?.originalSapId,
      WALL: MAT_CAR_WALL_FINISH_D,
    });
    if (!isDFinishValid) {
      const currentMaterial = wallMaterials.find((item) => item.id === design.components[wallDIndex].finishMaterial);
      const newFinish = currentMaterial.finishes.find((item) => {
        let test = {};
        test['PRODUCT'] = product?.product;
        test['CARSHAPE'] = design?.carShape;
        test['FINISH'] = item.id;
        test['PREDESIGN'] = design?.originalSapId;
        test['WALL'] = MAT_CAR_WALL_FINISH_D;
        return jsonLogic.apply(product.rules.wallFinishes, test);
      });
      design.components[wallDIndex].finish = (newFinish || {}).id;
    }

    const dGroup = design.components[wallDIndex].group;
    const dFinish = design.components[wallDIndex].finish;
    const cGroup = wallCIndex !== -1 ? design.components[wallCIndex].group : undefined;
    const cFinish = wallCIndex !== -1 ? design.components[wallCIndex].finish : undefined;
    const bGroup = design.components[wallBIndex].group;
    const bFinish = design.components[wallBIndex].finish;

    if (wallCIndex !== -1 && dGroup === cGroup && dFinish !== cFinish) {
      design.components[wallCIndex].finish = design.components[wallDIndex].finish;
    }

    if (dGroup === bGroup && dFinish !== bFinish) {
      design.components[wallBIndex].finish = design.components[wallDIndex].finish;
    }

    if (wallCIndex !== -1 && cGroup === bGroup && cFinish !== bFinish) {
      design.components[wallBIndex].finish = design.components[wallCIndex].finish;
    }
  }

  /*////////////////////////////////////////
                                                                                                                     
 #    #   ##   #      #         ###### # #    # #  ####  #    #    #    #   ##   ##### ###### #####  #   ##   #      
 #    #  #  #  #      #         #      # ##   # # #      #    #    ##  ##  #  #    #   #      #    # #  #  #  #      
 #    # #    # #      #         #####  # # #  # #  ####  ######    # ## # #    #   #   #####  #    # # #    # #      
 # ## # ###### #      #         #      # #  # # #      # #    #    #    # ######   #   #      #####  # ###### #      
 ##  ## #    # #      #         #      # #   ## # #    # #    #    #    # #    #   #   #      #   #  # #    # #      
 #    # #    # ###### ######    #      # #    # #  ####  #    #    #    # #    #   #   ###### #    # # #    # ###### 
                                                                                                                     
  // Check the finish material in walls is in place
  ////////////////////////////////////////*/
  if (wallBIndex !== -1) {
    if (design.components[wallBIndex].finish) {
      const bFinish = design.components[wallBIndex].finish;
      const finishItem = product.finishes.find((item) => item.sapId === bFinish);
      if (
        finishItem?.materials?.length > 0 &&
        (!design.components[wallBIndex].finishMaterial || finishItem.materials.indexOf(design.components[wallBIndex].finishMaterial) === -1)
      ) {
        design.components[wallBIndex].finishMaterial = getWallFinishMaterial(finishItem.materials);
      }
    }
  }
  if (wallCIndex !== -1) {
    if (design.components[wallCIndex].finish) {
      const cFinish = design.components[wallCIndex].finish;
      const finishItem = product.finishes.find((item) => item.sapId === cFinish);
      if (
        finishItem?.materials?.length > 0 &&
        (!design.components[wallCIndex].finishMaterial || finishItem.materials.indexOf(design.components[wallCIndex].finishMaterial) === -1)
      ) {
        design.components[wallCIndex].finishMaterial = getWallFinishMaterial(finishItem.materials);
      }
    }
  }

  if (wallDIndex !== -1) {
    if (design.components[wallDIndex].finish) {
      const dFinish = design.components[wallDIndex].finish;
      const finishItem = product.finishes.find((item) => item.sapId === dFinish);
      if (
        finishItem?.materials?.length > 0 &&
        (!design.components[wallDIndex].finishMaterial || finishItem.materials.indexOf(design.components[wallDIndex].finishMaterial) === -1)
      ) {
        design.components[wallDIndex].finishMaterial = getWallFinishMaterial(finishItem.materials);
      }
    }
  }

  /*////////////////////////////////////////
                                                                                                        
 #####    ##   #    # ###### #          ####  #####  # ###### #    # #####   ##   ##### #  ####  #    # 
 #    #  #  #  ##   # #      #         #    # #    # # #      ##   #   #    #  #    #   # #    # ##   # 
 #    # #    # # #  # #####  #         #    # #    # # #####  # #  #   #   #    #   #   # #    # # #  # 
 #####  ###### #  # # #      #         #    # #####  # #      #  # #   #   ######   #   # #    # #  # # 
 #      #    # #   ## #      #         #    # #   #  # #      #   ##   #   #    #   #   # #    # #   ## 
 #      #    # #    # ###### ######     ####  #    # # ###### #    #   #   #    #   #   #  ####  #    # 
                                                                                                        
  // Check wall paneling orientation
  ////////////////////////////////////////*/
  const decoIndex = design.components.findIndex((item) => item.componentType === TYP_CAR_WALL_ADD_DECO_PACKAGE);
  if (design.panelOrientation === HORIZONTAL) {
    if (decoIndex !== -1 && design.components[decoIndex].component !== 'DECO0' && design.components[decoIndex].component !== 'none') {
      design.panelOrientation = VERTICAL;
    }
    if (scenicIndex !== -1 && product?.extraFeatures?.includes(EXTRA_FEATURES.FULL_SCENIC_CAR)) {
      design.panelOrientation = VERTICAL;
    }

    const ceilingIndex = design.components.findIndex((item) => item.componentType === TYP_CAR_CEILING);
    if (product && product.rules && product.rules.panelOrientation) {
      const wallMaterial = design?.components?.[wallBIndex]?.finishMaterial || design?.components?.[wallCIndex]?.finishMaterial;

      const horizontalAvailable = jsonLogic.apply(product.rules.panelOrientation, {
        CEILING: ceilingIndex !== -1 ? design.components[ceilingIndex].component : 'none',
        FINISH: (design.components[wallCIndex] || {}).finish,
        WALL_MATERIAL: wallMaterial || 'none',
        PRODUCT: product.product,
      });
      if (!horizontalAvailable) {
        design.panelOrientation = VERTICAL;
      }
    }
  }

  const doorAIndex = design.components.findIndex((item) => item.componentType === TYP_DOOR_A);
  const doorCIndex = design.components.findIndex((item) => item.componentType === TYP_DOOR_C);
  const ldoIndex = design.components.findIndex((item) => item.componentType === DOOR_OPENING_TYPE);
  const frameIndex = design.components.findIndex((item) => item.componentType === TYP_LDO_FRAME_FRONT);

  /*////////////////////////////////////////
                                      #                                                                          
 #####   ####   ####  #####          #     ###### #####    ##   #    # ######    ###### # #    # #  ####  #    # 
 #    # #    # #    # #    #        #      #      #    #  #  #  ##  ## #         #      # ##   # # #      #    # 
 #    # #    # #    # #    #       #       #####  #    # #    # # ## # #####     #####  # # #  # #  ####  ###### 
 #    # #    # #    # #####       #        #      #####  ###### #    # #         #      # #  # # #      # #    # 
 #    # #    # #    # #   #      #         #      #   #  #    # #    # #         #      # #   ## # #    # #    # 
 #####   ####   ####  #    #    #          #      #    # #    # #    # ######    #      # #    # #  ####  #    # 
                                                                                                                 
  // Check if door/frame colors are correct
  ////////////////////////////////////////*/
  if (doorAIndex !== -1 && product && product.rules && product.rules.doorFinishes) {
    /*     const allCDOFinishes = product.finishes.filter(finish => {      
                            return finish.types && finish.types.indexOf(MAT_CDO_PANEL) !== -1 && finish.disabled !== true ;
                          }) */

    if (product?.rules?.variousFilteringRules) {
      const doorsAvailable = product.componentsData.doors.solutions || [];
      const doorsAfterFiltering = doorsAvailable.filter((item) => {
        return jsonLogic.apply(product.rules.variousFilteringRules, {
          filteringRULE: 'enaLargeCarDoorExceptions',
          PRODUCT: product?.product,
          CARSHAPE: design?.carShape,
          ITEM: item.id,
        });
      });

      if (!doorsAfterFiltering.find((item) => item.id === design.components[doorAIndex].component) && doorsAfterFiltering.length > 0) {
        design.components[doorAIndex].component = doorsAfterFiltering[0].id;
      }
    }

    const allCDOFinishes = product.componentsData.doors.doorFinishes || [];

    const filteredCDOFinishes = allCDOFinishes.filter((item) =>
      jsonLogic.apply(product.rules.doorFinishes, {
        PRODUCT: design.product,
        DOOR: design.components[doorAIndex].component,
        CARTYPE: design.carType,
        DOOR_FINISH: item.id,
        REGULATIONS: design.regulations,
      })
    );

    const doorFinish = design.components[doorAIndex].finish;

    if (!isRALFinish(doorFinish)) {
      if (filteredCDOFinishes.length > 0 && doorFinish !== undefined && !filteredCDOFinishes.find((item) => item.id === doorFinish)) {
        design.components[doorAIndex].finish = filteredCDOFinishes[0].id;
        if (doorCIndex !== -1) {
          design.components[doorCIndex].finish = filteredCDOFinishes[0].id;
        }
      }
    }

    /*     const allLDOFinishes = product.finishes.filter(finish => {      
                            return finish.types && finish.types.indexOf(MAT_LDO_FRAME) !== -1 && finish.disabled !== true ;
                          }) */

    const allLDOFrameFinishes = product.componentsData.doors.doorAndFrameFinishes || [];
    const filteredLDOFrameFinishes = allLDOFrameFinishes.filter((item) =>
      jsonLogic.apply(product.rules.doorFinishes, {
        PRODUCT: design.product,
        DOOR: design.components[doorAIndex].component,
        CARTYPE: design.carType,
        DOOR_FINISH: item.id,
        REGULATIONS: design.regulations,
        ISFRAME: true,
      })
    );

    // TODO check frame index
    if (!isRALFinish(design.components[frameIndex].finish)) {
      if (
        filteredLDOFrameFinishes.length > 0 &&
        !filteredLDOFrameFinishes.find((item) => item.id === design.components[frameIndex].finish)
      ) {
        design.components[frameIndex].finish = filteredLDOFrameFinishes[0].id;
      }
    }

    const allLDODoorFinishes = product.componentsData.doors.landingDoorFinishes || [];
    const filteredLDODoorFinishes = allLDODoorFinishes.filter((item) =>
      jsonLogic.apply(product.rules.doorFinishes, {
        PRODUCT: design.product,
        DOOR: design.components[doorAIndex].component,
        CARTYPE: design.carType,
        DOOR_FINISH: item.id,
        REGULATIONS: design.regulations,
      })
    );
    if (ldoIndex !== -1) {
      if (!isRALFinish(design.components[ldoIndex].finish)) {
        design.components[ldoIndex].component = design.components[doorAIndex].component;
        if (filteredLDODoorFinishes.length > 0 && !filteredLDODoorFinishes.find((item) => item.id === design.components[ldoIndex].finish)) {
          design.components[ldoIndex].finish = filteredLDODoorFinishes[0].id;
        }
      }
    } else {
      design.components.push({
        componentType: DOOR_OPENING_TYPE,
        component: design.components[doorAIndex].component,
        finishType: DOOR_FINISHING_A,
        finish: design.components[frameIndex].finish,
      });
    }

    // check with soc products the frame finish based on door finish
    if (design.components.findIndex((item) => item.componentType === DOOR_OPENING_TYPE) !== -1 && product?.rules?.landingFrameFinish) {
      const landingDoorIndex = design.components.findIndex((item) => item.componentType === DOOR_OPENING_TYPE);
      const newFrameFinish = jsonLogic.apply(product.rules.landingFrameFinish, {
        PRODUCT: product.product,
        LDO_FINISH: design.components[landingDoorIndex].finish,
        FRAME_FINISH: design.components[frameIndex].finish,
      });
      if (newFrameFinish) {
        design.components[frameIndex].finish = newFrameFinish;
      }
    }

    // special case for ENA products and one-panel doors
    if (doorCIndex !== -1) {
      const aDoor = design.components[doorAIndex].component;
      if (['0L', '0R', '2L', '2R'].indexOf(aDoor) !== -1) {
        if (design?.carType === CAR_TYPE_TTC_ENA) {
          if (aDoor === '0L') {
            design.components[doorCIndex].component = '0R';
          } else if (aDoor === '0R') {
            design.components[doorCIndex].component = '0L';
          } else if (aDoor === '2L') {
            design.components[doorCIndex].component = '2R';
          } else {
            design.components[doorCIndex].component = '2L';
          }
        } else {
          if (aDoor === '0L') {
            design.components[doorCIndex].component = '0L';
          } else if (aDoor === '0R') {
            design.components[doorCIndex].component = '0R';
          } else if (aDoor === '2L') {
            design.components[doorCIndex].component = '2L';
          } else {
            design.components[doorCIndex].component = '2R';
          }
        }
      } else {

        if (aDoor.indexOf('_') !== -1) {          
          if (aDoor.indexOf('L_') !== -1) {
            design.components[doorCIndex].component = aDoor.replace('L_','R_')
          } else if (aDoor.indexOf('R_') !== -1) {
            design.components[doorCIndex].component = aDoor.replace('R_','L_')
          }
        } else {
          if (aDoor.indexOf('L') !== -1) {
            design.components[doorCIndex].component = aDoor.replace('L','R')
          } else if (aDoor.indexOf('R') !== -1) {
            design.components[doorCIndex].component = aDoor.replace('R','L')
          }
        }

      }

    }
  }

  const cop1Index = design.components.findIndex((item) => item.componentType === TYP_COP_PRODUCT_1);
  const cop2Index = design.components.findIndex((item) => item.componentType === TYP_COP_2);
  const copHorIndex = design.components.findIndex((item) => item.componentType === TYP_COP_HORIZONTAL);
  /////////////////////////////////////////
  // Check if side wall have tricolor enabled
  /////////////////////////////////////////
  if (wallBIndex !== -1 && wallDIndex !== -1 && cop1Index !== -1) {
    if (product && product.rules && product.rules.wallMixingInstructions) {
      let hasHorCop = false;
      if (cop2Index !== -1) {
        const results = jsonLogic.apply(product.rules.signalizationHorizontal, { COP2: design.components[cop2Index].component });
        hasHorCop = results[1];
      }

      const test = {
        SHAPE: design.carShape,
        COP1: design.components[cop1Index].component || '',
        COP1_POS: (design.components[cop1Index].positions || []).join(''),
        COP2_POS: cop2Index !== -1 && !hasHorCop ? (design.components[cop2Index].positions || []).join('') : 'none',
        PARTS: (design.components[wallBIndex].parts || []).length,
        HORCOP: hasHorCop,
      };

      const results = jsonLogic.apply(product.rules.wallMixingInstructions, test);
      // console.log({test,results})
      const changesToDesign = results[1];
      // Something has to be changed
      if (changesToDesign && changesToDesign.length && changesToDesign.find((item) => item !== null)) {
        for (let i = 0; i < changesToDesign.length; i++) {
          const change = changesToDesign[i];
          if (change) {
            const comp = change[0];
            const prop = change[1];
            const newValue = change[2];

            const compIndex = design.components.findIndex((item) => item.componentType === comp);
            if (compIndex !== -1 && design.components[compIndex][prop]) {
              design.components[compIndex][prop] = deepcopy(newValue);
            }
            // console.log({change:deepcopy(change)})
            if (comp === TYP_COP_PRODUCT_1) {
              const signalizationFamily = (
                product.componentsData.signalization.copModels.find((item) => {
                  return item.copTypes.find((copType) => copType.id === design.components[cop1Index].component);
                }) || {}
              ).id;
              // const signalizationFamily = (product.components.find(comp => comp.id === design.components[cop1Index].component) || {}).componentFamily

              // const copFamilies = (product.componentFamilies || []).filter(item => item.types.indexOf(TYP_COP_PRODUCT_1) !== -1) || []
              /*               const validCops = ( ( (product.components || []).filter(compItem => compItem.type === TYP_COP_PRODUCT_1) || [] )
                                  .filter( ({componentFamily}) => componentFamily === signalizationFamily ) || []).filter(item => { */
              const validCops = (
                ((product.componentsData.signalization.copModels || []).find(({ id }) => id === signalizationFamily) || {}).copTypes || []
              ).filter((item) => {
                let test = {};
                test['CEILING'] = ceilingIndex !== -1 ? design.components[ceilingIndex].component : '';
                test['COP'] = item.id;
                test['CAR_SHAPE'] = design.carShape;
                test['PRODUCT'] = product.product;
                test['PARTS'] = wallBIndex !== -1 ? design.components[wallBIndex].parts.length || 0 : 0;

                return jsonLogic.apply(product.rules.signalizationModel, test);
              });

              // console.log({validCops:deepcopy(validCops)})

              if (product.rules && product.rules.signalizationPositions) {
                const test = {};
                test['PRODUCT'] = product.product;
                test['DECO'] =
                  (design.components.find((item) => item.componentType === TYP_CAR_WALL_ADD_DECO_PACKAGE) || {}).component || 'none';
                test['REGULATIONS'] = design.regulations || [];
                test['CAR_SHAPE'] = design.carShape || '';
                test['CAR_TYPE'] = design.carType || '';
                test['COP'] = design.components[cop1Index].component;
                test['DOOR'] = (design.components[doorAIndex] || {}).component;
                test['SIDEWALL_PARTS'] = wallBIndex !== -1 ? (design.components[wallBIndex].parts || []).length : 0;
                test['SCENIC'] = (design.components.find((item) => item.componentType === TYP_CAR_GLASS_WALL_C) || {}).positions || [];
                let newDisabledPositions = jsonLogic.apply(product.rules.signalizationPositions, test);

                // console.log({newDisabledPositions:deepcopy(newDisabledPositions),newValue:deepcopy(newValue), cop: deepcopy(design.components[cop1Index])})
                // console.log(newDisabledPositions.indexOf(newValue.join('')))
                if (newDisabledPositions.indexOf(newValue.join('')) !== -1) {
                  if (validCops) {
                    const newCop = validCops.find((cop) => {
                      const test = {};
                      test['PRODUCT'] = product.product;
                      test['DECO'] =
                        (design.components.find((item) => item.componentType === TYP_CAR_WALL_ADD_DECO_PACKAGE) || {}).component || 'none';
                      test['REGULATIONS'] = design.regulations || [];
                      test['CAR_SHAPE'] = design.carShape || '';
                      test['CAR_TYPE'] = design.carType || '';
                      test['COP'] = cop.id;
                      test['DOOR'] = (design.components[doorAIndex] || {}).component;
                      test['SIDEWALL_PARTS'] = wallBIndex !== -1 ? (design.components[wallBIndex].parts || []).length : 0;
                      test['SCENIC'] =
                        (design.components.find((item) => item.componentType === TYP_CAR_GLASS_WALL_C) || {}).positions || [];
                      const testDisabledPositions = jsonLogic.apply(product.rules.signalizationPositions, test);
                      // console.log({test,testDisabledPositions})
                      return testDisabledPositions.indexOf(newValue.join('') === -1);
                    });

                    if (newCop) {
                      design.components[cop1Index].component = newCop.id;
                    } else {
                      // TODO: no cop found from the current signalization family
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  /////////////////////////////////////////
  // floor finish check
  /////////////////////////////////////////
  const floorIndex = design.components.findIndex((item) => item.componentType === TYP_CAR_FLOORING);
  if (floorIndex !== -1 && !design.components[floorIndex].custom) {
    let newFinish = design.components[floorIndex].finish;
    if (product?.componentsData?.floors) {
      const currentFloorMaterial = product.componentsData.floors.find((material) => {
        if (material.finishes) {
          return material.finishes.find((item) => item.id === newFinish);
        }
        return false;
      });

      if (!currentFloorMaterial) {
        newFinish = undefined;
      }
    } else {
      newFinish = undefined;
    }
    if (product?.rules?.variousFilteringRules) {
      if (
        !jsonLogic.apply(product.rules.variousFilteringRules, {
          filteringRULE: 'floorFinishRule',
          FINISH: design.components[floorIndex].finish,
          CUSTOM: design.components[floorIndex].custom,
          CARSHAPE: design.carShape,
          PRODUCT: product?.product,
          PREDESIGN: design?.originalSapId,
        })
      ) {
        newFinish =
          product?.componentsData?.floors?.[0]?.finishes?.find((item) => item.id !== design.components[floorIndex].finish)?.id || null;
      }
    }
    // console.log({newFinish})
    design.components[floorIndex].finish = newFinish;
  }

  /////////////////////////////////////////
  // cop positioning and signalizaion family change
  /////////////////////////////////////////
  if (cop1Index !== -1) {
    let signalizationFamily = (
      product.componentsData.signalization.copModels.find((item) => {
        return item.copTypes.find((copType) => copType.id === design.components[cop1Index].component);
      }) || {}
    ).id;

    if (signalizationFamily === undefined && design.components[cop1Index].component !== COMPONENT_COP_NONE) {
      signalizationFamily = (product.componentsData.signalization.copModels.find((item) => !item.disabled) || {}).id;
    }
    let signalizationFamilyItems = product.componentsData.signalization.copModels.find((item) => item.id === signalizationFamily) || {};

    if (product && product.rules && product.rules.signalizationModel && design.components[cop1Index].component !== COMPONENT_COP_NONE) {
      const copFamilies = product.componentsData.signalization.copModels || [];
      const validCops = (copFamilies.find((item) => item.id === signalizationFamily).copTypes || {}).filter((item) => {
        

        let test = {};
        test['CEILING'] = ceilingIndex !== -1 ? design.components[ceilingIndex].component : '';
        test['COP'] = item.id;
        test['PRODUCT'] = product.product;
        test['PARTS'] = wallBIndex !== -1 ? (design.components[wallBIndex].parts ? design.components[wallBIndex].parts.length : 0) : 0;
        test['CAR_SHAPE'] = design.carShape;
        test['REGULATIONS'] = design.regulations || [];

        test['SIG_FAMILY'] = signalizationFamily;
        test['SIDEWALL_MATERIAL'] =
          wallBIndex !== -1
            ? (
                product.componentsData.walls.materials.find((item) => {
                  return item.finishes.find((fItem) => fItem.id === design.components[wallBIndex].finish);
                }) || {}
              ).id
            : [];

        return jsonLogic.apply(product.rules.signalizationModel, test);
      });

      if (validCops.length < 1) {
        let newValidCops = [];
        for (let i = 0; i < copFamilies.length; i++) {
          newValidCops = (copFamilies[i].copTypes || []).filter((item) => {
          
            let test = {};
            test['CEILING'] = ceilingIndex !== -1 ? design.components[ceilingIndex].component : '';
            test['COP'] = item.id;
            test['PRODUCT'] = product.product;
            test['PARTS'] = wallBIndex !== -1 ? (design.components[wallBIndex].parts ? design.components[wallBIndex].parts.length : 0) : 0;
            test['CAR_SHAPE'] = design.carShape;
            test['REGULATIONS'] = design.regulations || [];

            test['SIG_FAMILY'] = copFamilies[i].id;
            test['SIDEWALL_MATERIAL'] =
              wallBIndex !== -1
                ? (
                    product.componentsData.walls.materials.find((item) => {
                      return item.finishes.find((fItem) => fItem.id === design.components[wallBIndex].finish);
                    }) || {}
                  ).id
                : [];

            return jsonLogic.apply(product.rules.signalizationModel, test);
          });

          if (newValidCops.length > 0) {
            break;
          }
        }
        if (newValidCops.length > 0) {
          const newCOP = newValidCops[0];
          const newCOPFinish = (newCOP?.finishes?.[0] || {}).id;
          const newCOPFinishType = (newCOP.finishingTypes || [])[0]; // this is a short cut!!! What happens when you have two or more finishingTypes
          //((product.finishes.find(item => item.id === newCOPFinish) || {}).materials || []).find(item => newCOP.finishingTypes.indexOf(item) !== -1)
          design.components[cop1Index].component = newCOP.sapId;
          design.components[cop1Index].finish = newCOPFinish;
          design.components[cop1Index].finishType = newCOPFinishType;
          if (cop2Index !== -1) {
            design.components[cop2Index].component = newValidCops[0].sapId;
            design.components[cop2Index].finish = newCOPFinish;
            design.components[cop2Index].finishType = newCOPFinishType;
          }
        } else {
          design.components[cop1Index].component = COMPONENT_COP_NONE;
          if (cop2Index !== -1) {
            design.components[cop2Index].component = COMPONENT_COP_NONE;
          }
        }
      } else if (!validCops.find((item) => item.id === design.components[cop1Index].component)) {
        design.components[cop1Index].component = validCops[0].sapId;
        if (cop2Index !== -1) {
          design.components[cop2Index].component = validCops[0].sapId;
        }
      }
    }

    signalizationFamily = (
      product.componentsData.signalization.copModels.find((item) => {
        return item.copTypes.find((copType) => copType.id === design.components[cop1Index].component);
      }) || {}
    ).id;
    signalizationFamilyItems = product.componentsData.signalization.copModels.find((item) => item.id === signalizationFamily) || {};

    if (
      product.offeringLocation === OFFERING_INDIA &&
      product?.rules?.indiaFinishExceptions &&
      design.components[cop1Index].component !== 'cop-none'
    ) {
      const currentCopItems = signalizationFamilyItems.copTypes.find((item) => item.id === design.components[cop1Index].component);
      const copFinishes = currentCopItems.finishes.filter((item) => {
        const test = {
          TESTING: 'copFinish',
          PRODUCT: product.product,
          FINISH: item.id,
          COP: design.components[cop1Index].component,
          COP_POS: design.components[cop1Index].positions,
          B_FINISH: wallBIndex !== -1 ? design.components[wallBIndex].finish : null,
          A_FINISH: wallAIndex !== -1 ? design.components[wallAIndex].finish : null,
          DESIGN: design.originalSapId,
        };
        return jsonLogic.apply(product.rules.indiaFinishExceptions, test);
      });

      if (copFinishes?.length) {
        if (!copFinishes.find((item) => item.id === design.components[cop1Index].finish)) {
          design.components[cop1Index].finish = copFinishes[0].id;
        }
      }
    }

    // remove foot pedal if not supported by the signalization family
    const fbComponents = (product.components || []).filter((item) => {
      return item.type === TYP_FB && !item.disabled;
    });
    const fbForCurrentFamily = (fbComponents || []).filter(({ componentFamily }) => componentFamily === signalizationFamily);
    if (!fbForCurrentFamily || fbForCurrentFamily.length < 1) {
      const fbIndex = design.components.findIndex((item) => item.componentType === TYP_FB);
      if (fbIndex !== -1) {
        toBeRemoved.push(TYP_FB);
      }
    }

    const jambIndex = design.components.findIndex((item) => item.componentType === TYP_CDL_PRODUCT);
    if (jambIndex !== -1) {
      const jambId = design.components[jambIndex].component;
      if (signalizationFamilyItems.jambIndicators.length < 1) {
        toBeRemoved.push(TYP_CDL_PRODUCT);
      } else {
        if (!signalizationFamilyItems.jambIndicators.find((item) => item.id === jambId)) {
          design.components[jambIndex].component = signalizationFamilyItems.jambIndicators[0].id;
        }
      }
    }

    if (product.rules && product.rules.signalizationPositions) {
      const test = {};
      test['PRODUCT'] = product.product;
      test['DECO'] = (design.components.find((item) => item.componentType === TYP_CAR_WALL_ADD_DECO_PACKAGE) || {}).component || 'none';
      test['REGULATIONS'] = design.regulations || [];
      test['CAR_SHAPE'] = design.carShape || '';
      test['CAR_TYPE'] = design.carType || '';
      test['COP'] = design.components[cop1Index].component;
      test['DOOR'] = (design.components[doorAIndex] || {}).component;
      test['SIDEWALL_PARTS'] = wallBIndex !== -1 ? (design.components[wallBIndex].parts || []).length : 0;
      test['SCENIC'] = (design.components.find((item) => item.componentType === TYP_CAR_GLASS_WALL_C) || {}).positions || [];
      // console.log('test:',{test})
      let newDisabledPositions = jsonLogic.apply(product.rules.signalizationPositions, test);

      // no walls are allowed
      if (cop1Index !== -1 && design.components[cop1Index].positions) {
        let newPosition = 'B2';
        const cop1Pos = (design.components[cop1Index].positions || []).join('');
        // console.log({newDisabledPositions:deepcopy(newDisabledPositions), cop1Pos, cop1Index, cop:deepcopy(design.components[cop1Index] )})
        if (newDisabledPositions.indexOf(cop1Pos) !== -1 || !cop1Pos) {
          // by default, try to place the cop on the B wall
          if (cop1Pos.indexOf('B') !== -1 || cop1Pos.indexOf('A') !== -1 || cop1Pos.indexOf('C') !== -1) {
            newPosition = ['B2', 'B1', 'BX'].find((item) => newDisabledPositions.indexOf(item) === -1);
            if (!newPosition) {
              newPosition = ['D1', 'D2', 'DX', 'A1', 'A2'].find((item) => newDisabledPositions.indexOf(item) === -1);
            }
          } else {
            newPosition = ['D1', 'D2', 'DX'].find((item) => newDisabledPositions.indexOf(item) === -1);
            if (!newPosition) {
              newPosition = ['B2', 'B1', 'BX', 'A1', 'A2'].find((item) => newDisabledPositions.indexOf(item) === -1);
            }
          }

          design.components[cop1Index].positions = [newPosition];
        }
      }

      if (product?.businessSpecification?.market === 'ENA' && isTrueTypeCar(design?.carType)) {
        if (cop2Index === -1) {
          const cop2Item = deepcopy(design?.components?.[cop1Index]);
          cop2Item.componentType = TYP_COP_2;
          if (design?.components?.[doorAIndex].component === '0L' || design?.components?.[doorAIndex].component === '0R' || design?.components?.[doorAIndex].component === '2L' || design?.components?.[doorAIndex].component === '2R') {
            if (design?.carType === CAR_TYPE_TTC_ENA) {
              if (cop2Item?.positions?.indexOf('A1') !== -1) {
                cop2Item.positions = ['C1'];
              } else {
                cop2Item.positions = ['C2'];
              }
            } else {
              if (cop2Item?.positions?.indexOf('A1') !== -1) {
                cop2Item.positions = ['C2'];
              } else {
                cop2Item.positions = ['C1'];
              }
            }
          } else {
            if (cop2Item?.positions?.indexOf('A1') !== -1) {
              cop2Item.positions = ['C1'];
            } else {
              cop2Item.positions = ['C2'];
            }
          }
          design.components.push(cop2Item);
        } else {
          if (design?.components?.[doorAIndex].component === '0L' || design?.components?.[doorAIndex].component === '0R' || design?.components?.[doorAIndex].component === '2L' || design?.components?.[doorAIndex].component === '2R') {
            if (design?.carType === CAR_TYPE_TTC_ENA) {
              if (design.components[cop1Index].positions?.indexOf('A1') !== -1) {
                design.components[cop2Index].positions = ['C1'];
              } else {
                design.components[cop2Index].positions = ['C2'];
              }
            } else {
              if (design.components[cop1Index].positions?.indexOf('A1') !== -1) {
                design.components[cop2Index].positions = ['C2'];
              } else {
                design.components[cop2Index].positions = ['C1'];
              }
            }
          } else {
            if (design.components[cop1Index].positions.indexOf('A1') !== -1) {
              design.components[cop2Index].positions = ['C1'];
            } else {
              design.components[cop2Index].positions = ['C2'];
            }
          }
        }
      }

      // Make sure that jamb indicator is in correct place with ENA products
      if (jambIndex !== -1 && product?.businessSpecification?.market === 'ENA') {
        let jambPos = [];
        const availableJambPositions = product?.componentsData?.signalization?.landingComponentPositions?.jamb?.map((x) => x.id) || [];
        const cop1Pos = cop1Index !== -1 ? design.components[cop1Index].positions.join('') : 'none';
        const tmpCop2Index = design.components.findIndex((item) => item.componentType === TYP_COP_2);
        const cop2Pos = tmpCop2Index !== -1 ? design.components[tmpCop2Index].positions.join('') : 'none';
        if (availableJambPositions.includes(cop1Pos)) jambPos.push(cop1Pos);
        if (design.carType === CAR_TYPE_TTC || design.carType === CAR_TYPE_TTC_ENA) {
          if (availableJambPositions.includes(cop2Pos)) jambPos.push(cop2Pos);
        }
        design.components[jambIndex].positions = jambPos;
      }

      const isHorizontalCop = copHorIndex !== -1;
      

      if (
        cop2Index !== -1 &&
        design.components[cop2Index].positions &&
        !isHorizontalCop &&
        product?.businessSpecification?.market !== 'ENA'
      ) {
        let newPosition = null;
        const cop2Pos = (design.components[cop2Index].positions || []).join();
        newDisabledPositions = _.union(newDisabledPositions, design.components[cop1Index].positions);
        //const newDisabledPositions = _.union(newDisabledPositions, design.components[cop1Index].positions)
        if (newDisabledPositions.indexOf(cop2Pos) !== -1) {
          if (cop2Pos.indexOf('B') !== -1) {
            newPosition = ['B2', 'B1', 'BX'].find((item) => newDisabledPositions.indexOf(item) === -1);
            if (!newPosition) {
              newPosition = ['D1', 'D2', 'DX', 'A1', 'A2'].find((item) => newDisabledPositions.indexOf(item) === -1);
            }
          } else {
            newPosition = ['D1', 'D2', 'DX'].find((item) => newDisabledPositions.indexOf(item) === -1);
            if (!newPosition) {
              newPosition = ['B2', 'B1', 'BX', 'A1', 'A2'].find((item) => newDisabledPositions.indexOf(item) === -1);
            }
          }
          design.components[cop2Index].positions = [newPosition];
        }
      }
    }

    const allowTwoCops = !(
      product?.rules?.variousFilteringRules &&
      jsonLogic.apply(product.rules.variousFilteringRules, {
        filteringRULE: 'amountOfCOPs',
        PRODUCT: product.product,
        CARTYPE: design.carType,
        COP: design.components[cop1Index].component,
      })
    );
    if (!allowTwoCops || (product?.businessSpecification?.market === 'ENA' && !isTrueTypeCar(design?.carType))) {
      if (cop2Index !== -1) {
        toBeRemoved.push(TYP_COP_2);
      }
    }

    if (product?.rules?.variousFilteringRules && wallAIndex !== -1) {
      if (
        jsonLogic.apply(product.rules.variousFilteringRules, {
          filteringRULE: 'copHasSameFinishAsAWall',
          SIG_FAMILY: signalizationFamily,
          MARKET: product?.businessSpecification?.market,
          COP: cop1Index !== -1 ? design.components[cop1Index].component : null,
        })
      ) {
        design.components[wallAIndex].finish = design.components[cop1Index].finish;
      }
    }

    if (product.rules && product.rules.signalizationSeries) {
      let hiIndex = design.components.findIndex((item) => item.componentType === TYP_HI_PRODUCT);
      let hlIndex = design.components.findIndex((item) => item.componentType === TYP_HL_PRODUCT);
      let lcsIndex = design.components.findIndex((item) => item.componentType === TYP_LCS_PRODUCT);
      let eidIndex = design.components.findIndex((item) => item.componentType === TYP_EID_PRODUCT);
      let dinIndex = design.components.findIndex((item) => item.componentType === TYP_DIN_PRODUCT);
      let dopIndex = design.components.findIndex((item) => item.componentType === TYP_DOP_PRODUCT);
      let doorIndex = design.components.findIndex((item) => item.componentType === TYP_DOOR_A);
      let frameIndex = design.components.findIndex((item) => item.componentType === TYP_LDO_FRAME_FRONT);

      const copComponent = (design.components[cop1Index] || {}).component;

      const preFilteredHi = signalizationFamilyItems?.realHallIndicators || [];

      let newHIs = preFilteredHi;
      if (product && product.rules && product.rules.signalizationLandingExceptions) {
        newHIs = preFilteredHi.filter((item) =>
          jsonLogic.apply(product.rules.signalizationLandingExceptions, { PRODUCT: product.product, COP: copComponent, HI: item.id })
        );
      }
      let defaultHi = newHIs && newHIs.length > 0 ? newHIs[0].id : 'off';
      // fix component if defined is not in offering (specially for predesigns)
      if (hiIndex !== -1 && !newHIs.find((item) => item.id === design.components[hiIndex].component)) {
        design.components[hiIndex].component = defaultHi;
      }

      const preFilteredHl = signalizationFamilyItems.hallIndicators || [];
      let newHLs = preFilteredHl;
      if (product && product.rules && product.rules.signalizationLandingExceptions) {
        newHLs = preFilteredHl.filter((item) =>
          jsonLogic.apply(product.rules.signalizationLandingExceptions, { PRODUCT: product.product, COP: copComponent, HL: item.id })
        );
      }
      let defaultHl = newHLs && newHLs.length > 0 ? newHLs[0].id : 'off';
      // fix component if defined is not in offering (specially for predesigns)
      if (hlIndex !== -1 && !newHLs.find((item) => item.id === design.components[hlIndex].component)) {
        design.components[hlIndex].component = defaultHl;
      }

      const preFilteredLcs = (signalizationFamilyItems.callStationTypes || []).filter(item => {

        const test = {
          TESTING: 'forceToAddKSL710',
          PRODUCT_NAME: product.id,
          HORCOP: (copHorIndex !== -1 ?design.components[copHorIndex].component :null),
          LCS: item.id,
        }
        if (product?.rules?.signalizationLandingExceptions) {          
          const doNotAddKsl710 = jsonLogic.apply(product.rules.signalizationLandingExceptions, test)
          if (doNotAddKsl710) return false
        } 
        
        return true

      })

      let newLCSs = preFilteredLcs;
      if (product && product.rules && product.rules.signalizationLandingExceptions) {
        newLCSs = preFilteredLcs.filter((item) =>
          jsonLogic.apply(product.rules.signalizationLandingExceptions, { PRODUCT: product.product, COP: copComponent, LCS: item.id })
        );
      }
      // default LCS can not be KSL270 because it's available only with certain frames
      let defaultLcs =
        newLCSs && newLCSs.length > 0 ? (newLCSs[0].id !== 'KSL270' ? newLCSs[0].id : newLCSs.length > 1 ? newLCSs[1].id : null) : null;
      // fix component if defined is not in offering (specially for predesigns)
      if (lcsIndex !== -1 && !newLCSs.find((item) => item.id === design.components[lcsIndex].component)) {
        design.components[lcsIndex].component = defaultLcs;
      }

      const defaultEid = ((signalizationFamilyItems.elevatorIdentifier || [])[0] || {}).sapId;
      // fix component if defined is not in offering (specially for predesigns)
      if (
        eidIndex !== -1 &&
        !signalizationFamilyItems?.elevatorIdentifier?.find((item) => item.id === design.components[eidIndex].component)
      ) {
        design.components[eidIndex].component = defaultEid;
      }

      const defaultDin = ((signalizationFamilyItems.landingDestIndicator || [])[0] || {}).sapId;
      // fix component if defined is not in offering (specially for predesigns)
      if (
        dinIndex !== -1 &&
        !signalizationFamilyItems?.landingDestIndicator?.find((item) => item.id === design.components[dinIndex].component)
      ) {
        design.components[dinIndex].component = defaultDin;
      }

      const defaultDop = ((signalizationFamilyItems.destinationOP || [])[0] || {}).sapId;
      // fix component if defined is not in offering (specially for predesigns)
      if (dopIndex !== -1 && !signalizationFamilyItems?.destinationOP?.find((item) => item.id === design.components[dopIndex].component)) {
        design.components[dopIndex].component = defaultDop;
      }

      let signalizationFamilyCop2;
      const cop2Index = design.components.findIndex((item) => item.componentType === TYP_COP_2);
      if (cop2Index !== -1) {
        signalizationFamilyCop2 = (
          product.componentsData.signalization.copModels.find((item) => {
            return item.copTypes.find((copType) => copType.id === design.components[cop2Index].component);
          }) || {}
        ).id;
        signalizationFamilyCop2 = (product.components.find((comp) => comp.id === design.components[cop2Index].component) || {})
          .componentFamily;
      }

      const test = {};
      test['PRODUCT'] = product.product;
      test['FAMILY'] = signalizationFamily;
      test['FAMILY_COP2'] = signalizationFamilyCop2;
      test['COP1'] = design.components[cop1Index].component;
      test['COP2'] = cop2Index !== -1 ? design.components[cop2Index].component : '';
      test['HI'] = hiIndex !== -1 ? design.components[hiIndex].component : lcsIndex !== -1 ? 'off' : '';
      test['HI_ITEMS'] = signalizationFamilyItems?.realHallIndicators?.map( item => { return item.id }) || []
      test['DEFAULT_HI'] = defaultHi || '';
      test['HL'] = hlIndex !== -1 ? design.components[hlIndex].component : lcsIndex !== -1 ? 'off' : '';
      test['HL_ITEMS'] = signalizationFamilyItems?.hallIndicators?.map( item => { return item.id }) || []
      test['DEFAULT_HL'] = defaultHl || '';
      test['LCS'] = lcsIndex !== -1 ? design.components[lcsIndex].component : '';
      test['LCS_ITEMS'] = signalizationFamilyItems?.callStationTypes?.map( item => { return item.id }) || []
      test['DEFAULT_LCS'] = defaultLcs || '';
      test['EID'] = eidIndex !== -1 ? design.components[eidIndex].component : '';
      test['EID_ITEMS'] = signalizationFamilyItems?.elevatorIdentifier?.map( item => { return item.id }) || []
      test['DEFAULT_EID'] = defaultEid || '';
      test['DIN'] = dinIndex !== -1 ? design.components[dinIndex].component : eidIndex !== -1 ? 'off' : '';
      test['DIN_ITEMS'] = signalizationFamilyItems?.landingDestIndicator?.map( item => { return item.id }) || []
      test['DEFAULT_DIN'] = defaultDin || '';
      test['DOP'] = dopIndex !== -1 ? design.components[dopIndex].component : '';
      test['DOP_ITEMS'] = signalizationFamilyItems?.destinationOP?.map( item => { return item.id }) || []
      test['DEFAULT_DOP'] = defaultDop || '';
      test['DOOR'] = doorIndex !== -1 ? design.components[doorIndex].component : '';
      test['FRAME'] = frameIndex !== -1 ? design.components[frameIndex].component : '';

      const designComponentsPositions = jsonLogic.apply(product.rules.signalizationSeries, test);

      const designComponents = designComponentsPositions[0];

      // console.log({test,designComponents})
      designComponents.forEach((item) => {
        if (item !== null) {
          const compIndex = design.components.findIndex((comp) => comp.componentType === item[1]);

          if (item[0] === 'REMOVE') {
            if (compIndex !== -1) {
              design.components.splice(compIndex, 1);
            }
            // For KTOC designs, just take the previous things out
            // and don't default to other components
          } else if (item[0] === 'REPLACE' && !(design.ktoc && !options.onEditPage)) {
            if (compIndex !== -1) {
              design.components[compIndex].component = item[2];
              if (design.components[compIndex].parts && design.components[compIndex].parts.length > 0) {
                const lcsDisplayIndex = design.components[compIndex].parts.findIndex((item) => item.componentType === TYP_LCI_DISPLAY);
                if (lcsDisplayIndex !== -1) {
                  design.components[compIndex].parts[lcsDisplayIndex].component = null;
                  design.components[compIndex].parts[lcsDisplayIndex].finish = null;
                }

                const hlDisplayIndex = design.components[compIndex].parts.findIndex((item) => item.componentType === TYP_HL_DISPLAY);
                if (hlDisplayIndex !== -1) {
                  design.components[compIndex].parts[hlDisplayIndex].component = null;
                  design.components[compIndex].parts[hlDisplayIndex].finish = null;
                }
              }
            } else {
              design.components.push({
                componentType: item[1],
                component: item[2],
              });
            }
          }
        }
      });

      const componentPositionsData = product.componentsData.signalization.landingComponentPositions;
      const disabledHIPos = componentPositionsData.hi?.filter((pos) => pos.disabled).map((item) => item.id) || []; // Checking for undefined here so that this would work fine even if the backend data has not yet been updated. All the others are old data and as such should already be in place in every case.
      const disabledHLPos = componentPositionsData.hl.filter((pos) => pos.disabled).map((item) => item.id);
      const disabledLCSPos = componentPositionsData.lcs.filter((pos) => pos.disabled).map((item) => item.id);
      const disabledDOPPos = componentPositionsData.dop.filter((pos) => pos.disabled).map((item) => item.id);
      const disabledDINPos = componentPositionsData.din.filter((pos) => pos.disabled).map((item) => item.id);
      const disabledEIDPos = componentPositionsData.eid.filter((pos) => pos.disabled).map((item) => item.id);
    
      const disabledPositions = {
        TYP_HI_PRODUCT: disabledHIPos,
        TYP_HL_PRODUCT: disabledHLPos,
        TYP_LCS_PRODUCT: disabledLCSPos,
        TYP_DOP_PRODUCT: disabledDOPPos,
        TYP_DIN_PRODUCT: disabledDINPos,
        TYP_EID_PRODUCT: disabledEIDPos,
      };

      // test if yo can find the signalization items again
      hiIndex = design.components.findIndex((item) => item.componentType === TYP_HI_PRODUCT);
      hlIndex = design.components.findIndex((item) => item.componentType === TYP_HL_PRODUCT);
      lcsIndex = design.components.findIndex((item) => item.componentType === TYP_LCS_PRODUCT);
      eidIndex = design.components.findIndex((item) => item.componentType === TYP_EID_PRODUCT);
      dinIndex = design.components.findIndex((item) => item.componentType === TYP_DIN_PRODUCT);
      dopIndex = design.components.findIndex((item) => item.componentType === TYP_DOP_PRODUCT);
      doorIndex = design.components.findIndex((item) => item.componentType === TYP_DOOR_A);
      frameIndex = design.components.findIndex((item) => item.componentType === TYP_LDO_FRAME_FRONT);

      const reTest = {};
      reTest['HI'] = hiIndex !== -1 ? design.components[hiIndex].component : lcsIndex !== -1 ? 'off' : '';
      reTest['HL'] = hlIndex !== -1 ? design.components[hlIndex].component : lcsIndex !== -1 ? 'off' : '';
      reTest['LCS'] = lcsIndex !== -1 ? design.components[lcsIndex].component : '';
      reTest['EID'] = eidIndex !== -1 ? design.components[eidIndex].component : '';
      reTest['DIN'] = dinIndex !== -1 ? design.components[dinIndex].component : eidIndex !== -1 ? 'off' : '';
      reTest['DOP'] = dopIndex !== -1 ? design.components[dopIndex].component : '';
      reTest['DOOR'] = doorIndex !== -1 ? design.components[doorIndex].component : '';
      reTest['FRAME'] = frameIndex !== -1 ? design.components[frameIndex].component : '';
      reTest['COUNTRY'] = localStorage.getItem('projectLocation') || null;
      reTest['OFFERING'] = product.offeringLocation || null;

      const designComponentsPositionsReTested = jsonLogic.apply(product.rules.signalizationSeries, reTest);
      const designPositions = designComponentsPositionsReTested[1];
      // item[0] is the component type.
      // item[1] is an array of the possible positions.
      designPositions.forEach((item) => {
        if (item !== null) {
          const compIndex = design.components.findIndex((comp) => comp.componentType === item[0]);
          if (compIndex !== -1) {
            const compPos = design.components[compIndex].positions;
            if (!compPos || compPos.length < 1) {
              // Remove positions that have been disabled in the frontline manager from the list.
              const availablePositions = _.difference(item[1], disabledPositions[item[0]]);
              design.components[compIndex].positions = [availablePositions[0]];
            } else {
              const compPosAsString = (compPos || []).join('');
              if (item[1].indexOf(compPosAsString) === -1) {
                const availablePositions = _.difference(item[1], disabledPositions[item[0]]);
                design.components[compIndex].positions = [availablePositions[0]];
              }
            }
          }
        }
      });

      // check if the real hall indicator finish is correct
      if (hiIndex !== -1) {
        if (signalizationFamilyItems.id === 'KSSD' || signalizationFamilyItems.id === 'KDSD') {
          design.components[hiIndex].finishType = TYP_COP_FACE_PLATE_PRINT_1;
        } else {
          design.components[hiIndex].finishType = MAT_COP_FACE_PLATE_1;
        }
        const hiComponent = signalizationFamilyItems.realHallIndicators?.find((item) => item.id === design.components[hiIndex].component);
        if (hiComponent?.finishes?.length > 0) {
          const isHiFinishCorrect = hiComponent.finishes.find((item) => item.id === design.components[hiIndex].finish);
          if (!isHiFinishCorrect) {
            design.components[hiIndex].finish = hiComponent.finishes[0].id;
          }
        }
      }

      // check if the hall indicator finish is correct
      if (hlIndex !== -1) {
        if (signalizationFamilyItems.id === 'KSSD' || signalizationFamilyItems.id === 'KDSD') {
          design.components[hlIndex].finishType = TYP_COP_FACE_PLATE_PRINT_1;
        } else {
          design.components[hlIndex].finishType = MAT_COP_FACE_PLATE_1;
        }
        const hlComponent = signalizationFamilyItems.hallIndicators?.find((item) => item.id === design.components[hlIndex].component);
        if (hlComponent?.finishes?.length > 0) {
          const isHlFinishCorrect = hlComponent.finishes.find((item) => item.id === design.components[hlIndex].finish);
          if (!isHlFinishCorrect) {
            design.components[hlIndex].finish = hlComponent.finishes[0].id;
          }
        }
      }

      // !!!!! TODO: finish later, changes must be done to back end also !!!!!!!
      // check if the lcs finish is correct
      if(lcsIndex !== -1 && product?.rules?.signalizationFinishRefilter) {
        const lcsComponent = signalizationFamilyItems.callStationTypes?.find(item => item.id === design.components[lcsIndex].component)
        if (lcsComponent?.finishes?.length < 1) {
          const copComponent = signalizationFamilyItems.copTypes?.find(item => item.id === design.components[cop1Index].component)
          if (!copComponent.finishes.find(item => item.id === design.components[lcsIndex].finish)) {
            if (hlIndex !== -1) {
              const hlComponent = signalizationFamilyItems.hallIndicators?.find((item) => item.id === design.components[hlIndex].component);
              if (copComponent.finishes.find(item => item.id === design.components[hlIndex].finish)) { 
                design.components[lcsIndex].finish = design.components[hlIndex].finish
              } else {
                design.components[lcsIndex].finish = design.components[cop1Index].finish
              }
            } else {
              design.components[lcsIndex].finish = design.components[cop1Index].finish
            }
          }
        } else {
          if (lcsComponent && !lcsComponent.finishes.find(item => item.id === design.components[lcsIndex].finish)) {
            design.components[lcsIndex].finish = lcsComponent.finishes[0].id
          }
        }
      }

    }

    let landingDisplaysInherited = false;
    // first check if currently selected COP should have parts included
    if (cop1Index !== -1) {
      const copComponent = (signalizationFamilyItems.copTypes || []).find((item) => item.id === design.components[cop1Index].component);
      /*       const copComponent = (product.components || []).find(item => {
        return (item.id === design.components[cop1Index].component && !item.disabled)
      }) */
      if (copComponent && copComponent.parts && (!design.components[cop1Index].parts || design.components[cop1Index].parts.length < 1)) {
        design.components[cop1Index].parts = [];
        copComponent.parts.forEach((item) => {
          design.components[cop1Index].parts.push({ componentType: item.type, type: item.type });
        });
      }
      if (copComponent && product.rules && product.rules.signalizationInheritedDisplays) {
        landingDisplaysInherited = jsonLogic.apply(product.rules.signalizationInheritedDisplays, { FAMILY: copComponent.componentFamily });
      }
    }
    // make sure that displays and display colors are correct if they are defined to be there
    if (design.components[cop1Index].parts && design.components[cop1Index].parts.length > 0) {
      // check is part component is set
      if (
        product.rules &&
        product.rules.signalizationCopDisplays &&
        design.components[cop1Index].parts.find((item) => item.componentType === TYP_COP_DISPLAY)
      ) {
        const displayIndex = design.components[cop1Index].parts.findIndex((item) => item.componentType === TYP_COP_DISPLAY);
        const copDisplayOptions = jsonLogic.apply(product.rules.signalizationCopDisplays, { COP: design.components[cop1Index].component });

        if (copDisplayOptions && copDisplayOptions.length > 0) {
          const displayValidIndex = copDisplayOptions.findIndex(
            (item) => item[0] === design.components[cop1Index].parts[displayIndex].component
          );

          if (!design.components[cop1Index].parts[displayIndex].component || displayValidIndex === -1) {
            design.components[cop1Index].parts[displayIndex].component = copDisplayOptions[0][0];
          }

          if (!design.components[cop1Index].parts[displayIndex].finish || displayValidIndex === -1) {
            if (copDisplayOptions && copDisplayOptions.length > 0 && copDisplayOptions[0][1].length > 0) {
              design.components[cop1Index].parts[displayIndex].finish = copDisplayOptions[0][1][0];
            } else {
              design.components[cop1Index].parts[displayIndex].finish = null;
            }
          }
        }
      }

      if (cop2Index !== -1) {
        const cop2IsHorCop = jsonLogic.apply(product.rules.signalizationHorizontal, { COP2: design.components[cop2Index].component })[1];
        if (!cop2IsHorCop) {
          design.components[cop2Index].parts = deepcopy(design.components[cop1Index].parts);
        }
      }
    }

    const lcsIndex = design.components.findIndex((item) => item.componentType === TYP_LCS_PRODUCT);
    // first check if currently selected LCS should have parts included
    if (lcsIndex !== -1) {
      if (signalizationFamilyItems.id === 'KSSD' || signalizationFamilyItems.id === 'KDSD') {
        design.components[lcsIndex].finishType = TYP_COP_FACE_PLATE_PRINT_1;
      } else {
        design.components[lcsIndex].finishType = MAT_COP_FACE_PLATE_1;
      }

      const lcsComponent = (signalizationFamilyItems.callStationTypes || []).find(
        (item) => item.id === design.components[lcsIndex].component
      );
      /*       const lcsComponent = (product.components || []).find(item => {
        return (item.id === design.components[lcsIndex].component && !item.disabled)
      }) */
      if (lcsComponent && lcsComponent.parts && (!design.components[lcsIndex].parts || design.components[lcsIndex].parts.length < 1)) {
        design.components[lcsIndex].parts = [];
        lcsComponent.parts.forEach((item) => {
          design.components[lcsIndex].parts.push({ componentType: item.type, type: item.type });
        });
      }
    }
    // make sure that displays and display colors are correct if they are defined to be there
    breakLCSCheck: if (lcsIndex !== -1 && design.components[lcsIndex].parts && design.components[lcsIndex].parts.length > 0) {
      if (landingDisplaysInherited) {
        const displayIndex = design.components[lcsIndex].parts.findIndex((item) => item.componentType === TYP_LCI_DISPLAY);
        const copDisplayIndex = ((design.components[cop1Index] || {}).parts || []).findIndex(
          (item) => item.componentType === TYP_COP_DISPLAY
        );
        if (copDisplayIndex !== -1 && product.rules && product.rules.signalizationDisplayTypeConversion) {
          const displayType = jsonLogic.apply(product.rules.signalizationDisplayTypeConversion, {
            TYPE: design.components[cop1Index].parts[copDisplayIndex].component,
          });
          design.components[lcsIndex].parts[displayIndex].component = 'LCS_' + displayType;
          design.components[lcsIndex].parts[displayIndex].finish = design.components[cop1Index].parts[copDisplayIndex].finish;
          break breakLCSCheck;
        }
      }

      // check is part component is set
      if (
        product.rules &&
        product.rules.signalizationLcsDisplays &&
        design.components[lcsIndex].parts.find((item) => item.componentType === TYP_LCI_DISPLAY)
      ) {
        const displayIndex = design.components[lcsIndex].parts.findIndex((item) => item.componentType === TYP_LCI_DISPLAY);
        const lcsDisplayOptions = jsonLogic.apply(product.rules.signalizationLcsDisplays, { LCS: design.components[lcsIndex].component });

        if (lcsDisplayOptions && lcsDisplayOptions.length > 0) {
          const displayValidIndex = lcsDisplayOptions.findIndex(
            (item) => item[0] === design.components[lcsIndex].parts[displayIndex].component
          );

          if (!design.components[lcsIndex].parts[displayIndex].component || displayValidIndex === -1) {
            design.components[lcsIndex].parts[displayIndex].component = lcsDisplayOptions[0][0];
          }

          if (!design.components[lcsIndex].parts[displayIndex].finish) 
          {
            console.log(lcsDisplayOptions)
            if (lcsDisplayOptions && lcsDisplayOptions.length > 0 && lcsDisplayOptions[0][0].length > 0) {
              design.components[lcsIndex].parts[displayIndex].finish = lcsDisplayOptions[0][0][0];
            } else {
              design.components[lcsIndex].parts[displayIndex].finish = null;
            }
          }
        }
      }
    }

    const hiIndex = design.components.findIndex((item) => item.componentType === TYP_HI_PRODUCT);
    // first check if currently selected HL should have parts included
    if (hiIndex !== -1) {
      const hiComponent = (signalizationFamilyItems.realHallIndicators || []).find(
        (item) => item.id === design.components[hiIndex].component
      );
      if (hiComponent && hiComponent.parts && (!design.components[hiIndex].parts || design.components[hiIndex].parts.length < 1)) {
        design.components[hiIndex].parts = [];
        hiComponent.parts.forEach((item) => {
          design.components[hiIndex].parts.push({ componentType: item.type, type: item.type });
        });
      }
    }
    // make sure that displays and display colors are correct if they are defined to be there
    breakHICheck: if (hiIndex !== -1 && design.components[hiIndex].parts && design.components[hiIndex].parts.length > 0) {
      if (landingDisplaysInherited) {
        const displayIndex = design.components[hiIndex].parts.findIndex((item) => item.componentType === TYP_HI_DISPLAY);
        const copDisplayIndex = ((design.components[cop1Index] || {}).parts || []).findIndex(
          (item) => item.componentType === TYP_COP_DISPLAY
        );
        if (copDisplayIndex !== -1 && product.rules && product.rules.signalizationDisplayTypeConversion) {
          const displayType = jsonLogic.apply(product.rules.signalizationDisplayTypeConversion, {
            TYPE: design.components[cop1Index].parts[copDisplayIndex].component,
            EXCEPTION: design.components[hiIndex].component,
          });
          design.components[hiIndex].parts[displayIndex].component = 'HL_' + displayType;
          design.components[hiIndex].parts[displayIndex].finish = design.components[cop1Index].parts[copDisplayIndex].finish;
          break breakHICheck;
        }
      }

      // check is part component is set
      if (
        product.rules &&
        product.rules.signalizationHiDisplays &&
        design.components[hiIndex].parts.find((item) => item.componentType === TYP_HI_DISPLAY)
      ) {
        const displayIndex = design.components[hiIndex].parts.findIndex((item) => item.componentType === TYP_HI_DISPLAY);
        const hiDisplayOptions = jsonLogic.apply(product.rules.signalizationHiDisplays, {
          HI: design.components[hiIndex].component,
          PRODUCT: product.product,
        });

        if (hiDisplayOptions && hiDisplayOptions.length > 0) {
          const displayValidIndex = hiDisplayOptions.findIndex(
            (item) => item[0] === design.components[hiIndex].parts[displayIndex].component
          );

          if (!design.components[hiIndex].parts[displayIndex].component || displayValidIndex === -1) {
            design.components[hiIndex].parts[displayIndex].component = hiDisplayOptions[0][0];
          }

          if (!design.components[hiIndex].parts[displayIndex].finish) {
            if (hiDisplayOptions && hiDisplayOptions.length > 0 && hiDisplayOptions[0][1].length > 0) {
              design.components[hiIndex].parts[displayIndex].finish = hiDisplayOptions[0][1][0];
            } else {
              design.components[hiIndex].parts[displayIndex].finish = null;
            }
          }
        }
      }
    }

    const hlIndex = design.components.findIndex((item) => item.componentType === TYP_HL_PRODUCT);
    // first check if currently selected HL should have parts included
    if (hlIndex !== -1) {
      const hlComponent = (signalizationFamilyItems.hallIndicators || []).find((item) => item.id === design.components[hlIndex].component);
      if (hlComponent && hlComponent.parts && (!design.components[hlIndex].parts || design.components[hlIndex].parts.length < 1)) {
        design.components[hlIndex].parts = [];
        hlComponent.parts.forEach((item) => {
          design.components[hlIndex].parts.push({ componentType: item.type, type: item.type });
        });
      }
    }
    // make sure that displays and display colors are correct if they are defined to be there
    breakHLCheck: if (hlIndex !== -1 && design.components[hlIndex].parts && design.components[hlIndex].parts.length > 0) {
      if (landingDisplaysInherited) {
        const displayIndex = design.components[hlIndex].parts.findIndex((item) => item.componentType === TYP_HL_DISPLAY);
        const copDisplayIndex = ((design.components[cop1Index] || {}).parts || []).findIndex(
          (item) => item.componentType === TYP_COP_DISPLAY
        );
        if (copDisplayIndex !== -1 && product.rules && product.rules.signalizationDisplayTypeConversion) {
          const displayType = jsonLogic.apply(product.rules.signalizationDisplayTypeConversion, {
            TYPE: design.components[cop1Index].parts[copDisplayIndex].component,
            EXCEPTION: design.components[hlIndex].component,
          });
          design.components[hlIndex].parts[displayIndex].component = 'HL_' + displayType;
          design.components[hlIndex].parts[displayIndex].finish = design.components[cop1Index].parts[copDisplayIndex].finish;
          break breakHLCheck;
        }
      }

      // check is part component is set
      if (
        product.rules &&
        product.rules.signalizationHlDisplays &&
        design.components[hlIndex].parts.find((item) => item.componentType === TYP_HL_DISPLAY)
      ) {
        const displayIndex = design.components[hlIndex].parts.findIndex((item) => item.componentType === TYP_HL_DISPLAY);
        const hlDisplayOptions = jsonLogic.apply(product.rules.signalizationHlDisplays, {
          HL: design.components[hlIndex].component,
          PRODUCT: product.product,
        });

        if (hlDisplayOptions && hlDisplayOptions.length > 0) {
          const displayValidIndex = hlDisplayOptions.findIndex(
            (item) => item[0] === design.components[hlIndex].parts[displayIndex].component
          );

          if (!design.components[hlIndex].parts[displayIndex].component || displayValidIndex === -1) {
            design.components[hlIndex].parts[displayIndex].component = hlDisplayOptions[0][0];
          }

          if (!design.components[hlIndex].parts[displayIndex].finish) {
            if (hlDisplayOptions && hlDisplayOptions.length > 0 && hlDisplayOptions[0][1].length > 0) {
              design.components[hlIndex].parts[displayIndex].finish = hlDisplayOptions[0][1][0];
            } else {
              design.components[hlIndex].parts[displayIndex].finish = null;
            }
          }
        }
      }
    }

    const dinIndex = design.components.findIndex((item) => item.componentType === TYP_DIN_PRODUCT);
    // first check if currently selected DIN should have parts included
    if (dinIndex !== -1) {
      const dinComponent = (signalizationFamilyItems.landingDestIndicator || []).find(
        (item) => item.id === design.components[dinIndex].component
      );

      /*       const dinComponent = (product.components || []).find(item => {
        return (item.id === design.components[dinIndex].component && !item.disabled)
      }) */
      if (dinComponent && dinComponent.parts && (!design.components[dinIndex].parts || design.components[dinIndex].parts.length < 1)) {
        design.components[dinIndex].parts = [];
        dinComponent.parts.forEach((item) => {
          design.components[dinIndex].parts.push({ componentType: item.type, type: item.type });
        });
      }

      if (!design.components[dinIndex].finish) {
        design.components[dinIndex].finish = design.components[cop1Index].finish;
        design.components[dinIndex].finishType = design.components[cop1Index].finishType;
      }
    }
    // make sure that displays and display colors are correct if they are defined to be there
    if (dinIndex !== -1 && design.components[dinIndex].parts && design.components[dinIndex].parts.length > 0) {
      // check is part component is set
      if (
        product.rules &&
        product.rules.signalizationDinDisplays &&
        design.components[dinIndex].parts.find((item) => item.componentType === TYP_DIN_DISPLAY)
      ) {
        const displayIndex = design.components[dinIndex].parts.findIndex((item) => item.componentType === TYP_DIN_DISPLAY);
        const dinDisplayOptions = jsonLogic.apply(product.rules.signalizationDinDisplays, { DIN: design.components[dinIndex].component });

        if (dinDisplayOptions && dinDisplayOptions.length > 0) {
          const displayValidIndex = dinDisplayOptions.findIndex(
            (item) => item[0] === design.components[dinIndex].parts[displayIndex].component
          );

          if (!design.components[dinIndex].parts[displayIndex].component || displayValidIndex === -1) {
            design.components[dinIndex].parts[displayIndex].component = dinDisplayOptions[0][0];
          }

          if (!design.components[dinIndex].parts[displayIndex].finish || displayValidIndex === -1) {
            if (dinDisplayOptions && dinDisplayOptions.length > 0 && dinDisplayOptions[0][1].length > 0) {
              design.components[dinIndex].parts[displayIndex].finish = dinDisplayOptions[0][1][0];
            } else {
              design.components[dinIndex].parts[displayIndex].finish = null;
            }
          }
        }
      }
    }

    const dopIndex = design.components.findIndex((item) => item.componentType === TYP_DOP_PRODUCT);
    // first check if currently selected DOP should have parts included
    if (dopIndex !== -1) {
      const dopComponent = (signalizationFamilyItems.destinationOP || []).find((item) => item.id === design.components[dopIndex].component);
      /*       const dopComponent = (product.components || []).find(item => {
        return (item.id === design.components[dopIndex].component && !item.disabled)
      }) */
      if (dopComponent && dopComponent.parts && (!design.components[dopIndex].parts || design.components[dopIndex].parts.length < 1)) {
        design.components[dopIndex].parts = [];
        dopComponent.parts.forEach((item) => {
          design.components[dopIndex].parts.push({ componentType: item.type, type: item.type });
        });
      }
      if (!design.components[dopIndex].finish) {
        design.components[dopIndex].finish = design.components[cop1Index].finish;
        design.components[dopIndex].finishType = design.components[cop1Index].finishType;
      }
    }
    // make sure that displays and display colors are correct if they are defined to be there
    if (dopIndex !== -1 && design.components[dopIndex].parts && design.components[dopIndex].parts.length > 0) {
      // check is part component is set
      if (
        product.rules &&
        product.rules.signalizationDopDisplays &&
        design.components[dopIndex].parts.find((item) => item.componentType === TYP_DOP_DISPLAY)
      ) {
        const displayIndex = design.components[dopIndex].parts.findIndex((item) => item.componentType === TYP_DOP_DISPLAY);
        const dopDisplayOptions = jsonLogic.apply(product.rules.signalizationDopDisplays, { DOP: design.components[dopIndex].component });

        if (dopDisplayOptions && dopDisplayOptions.length > 0) {
          const displayValidIndex = dopDisplayOptions.findIndex(
            (item) => item[0] === design.components[dopIndex].parts[displayIndex].component
          );

          if (!design.components[dopIndex].parts[displayIndex].component || displayValidIndex === -1) {
            design.components[dopIndex].parts[displayIndex].component = dopDisplayOptions[0][0];
          }

          if (!design.components[dopIndex].parts[displayIndex].finish || displayValidIndex === -1) {
            if (dopDisplayOptions && dopDisplayOptions.length > 0 && dopDisplayOptions[0][1].length > 0) {
              design.components[dopIndex].parts[displayIndex].finish = dopDisplayOptions[0][1][0];
            } else {
              design.components[dopIndex].parts[displayIndex].finish = null;
            }
          }
        }
      }
    }

    const eidIndex = design.components.findIndex((item) => item.componentType === TYP_EID_PRODUCT);
    // check if currently selected EID have finish
    if (eidIndex !== -1) {
      if (!design.components[eidIndex].finish) {
        design.components[eidIndex].finish = design.components[cop1Index].finish;
        design.components[eidIndex].finishType = design.components[cop1Index].finishType;
      }
    }

    // foot pedal must follow the position of the lcs
    const fbIndex = design.components.findIndex((item) => item.componentType === TYP_FB);
    if (fbIndex !== -1 && lcsIndex !== -1) {
      design.components[fbIndex].positions = deepcopy(design.components[lcsIndex].positions);
    }

    // in case there are two cops, check if that is allowed
    if (cop2Index !== -1 && product?.rules?.variousFilteringRules) {
      // rule is returning true in case two cops is not allowed
      if (
        jsonLogic.apply(product.rules.variousFilteringRules, {
          filteringRULE: 'amountOfCOPs',
          PRODUCT: product.product,
          CARTYPE: design.carType,
          COPNUM: 'two',
        })
      ) {
        toBeRemoved.push(TYP_COP_2);
      }
    }

    // add button editing items
    if (!design.components[cop1Index]?.parts) {
      design.components[cop1Index].parts = [];
    }

    if (design.components[cop1Index].parts.findIndex((item) => item.componentType === BUTTON_COLS) === -1) {
      design.components[cop1Index].parts.push({
        componentType: BUTTON_COLS,
        component: BUTTON_COL_ONE,
      });
    }
    if (design.components[cop1Index].parts.findIndex((item) => item.componentType === BUTTON_SHAPE) === -1) {
      design.components[cop1Index].parts.push({
        componentType: BUTTON_SHAPE,
        component: BUTTON_SHAPE_ROUND,
      });
    }
    if (design.components[cop1Index].parts.findIndex((item) => item.componentType === BRAILLE) === -1) {
      design.components[cop1Index].parts.push({
        componentType: BRAILLE,
        component: BRAILLE_OFF,
      });
    }
    if (design.components[cop1Index].parts.findIndex((item) => item.componentType === BUTTON_FINISH) === -1) {
      design.components[cop1Index].parts.push({
        componentType: BUTTON_FINISH,
        component: 'none',
      });
    }

    // check that button options are correct
    const [floorDefinitions, buttonShapesBraille, buttonFinishes, buttonFinishesBraille] = jsonLogic.apply(product.rules.buttonOptions, {
      COP: design.components[cop1Index].component,
      REGULATIONS: design.regulations,
    });

    const currentColsIndex = design.components[cop1Index].parts.findIndex((item) => item.componentType === BUTTON_COLS);
    const currentShapeIndex = design.components[cop1Index].parts.findIndex((item) => item.componentType === BUTTON_SHAPE);
    const currentBrailleIndex = design.components[cop1Index].parts.findIndex((item) => item.componentType === BRAILLE);
    const currentFinishIndex = design.components[cop1Index].parts.findIndex((item) => item.componentType === BUTTON_FINISH);

    if (floorDefinitions?.length > 0) {
      if (
        !floorDefinitions.find((item) => {
          const brailleStatus = design.components[cop1Index].parts[currentBrailleIndex].component === BRAILLE_ON;
          const brailleLimited = item[2] === true ? true : false;
          return (
            item[0] === design.components[cop1Index].parts[currentColsIndex].component &&
            (!brailleStatus || brailleLimited === !brailleStatus)
          );
        })
      ) {
        design.components[cop1Index].parts[currentColsIndex].component = floorDefinitions[0][0];
      }

      if (!buttonShapesBraille.find((item) => item[0] === design.components[cop1Index].parts[currentShapeIndex].component)) {
        design.components[cop1Index].parts[currentShapeIndex].component = buttonShapesBraille[0][0];
      }

      const correctShapeIndex = buttonShapesBraille.findIndex(
        (item) => item[0] === design.components[cop1Index].parts[currentShapeIndex].component
      );
      if (design.components[cop1Index].parts[currentBrailleIndex].component === BRAILLE_ON && !buttonShapesBraille[correctShapeIndex][1]) {
        design.components[cop1Index].parts[currentBrailleIndex].component = BRAILLE_OFF;
      }

      if (design.components[cop1Index].parts[currentBrailleIndex].component === BRAILLE_OFF) {
        if (Array.isArray(buttonFinishes[0])) {
          const correctFinishes = buttonFinishes.find((item) => item[0] === design.components[cop1Index].parts[currentShapeIndex].component);
          if (!correctFinishes[1].find((item) => item === design.components[cop1Index].parts[currentFinishIndex].component)) {
            design.components[cop1Index].parts[currentFinishIndex].component = correctFinishes[1][0];
          }

        } else {
          if (!buttonFinishes.find((item) => item === design.components[cop1Index].parts[currentFinishIndex].component)) {
            design.components[cop1Index].parts[currentFinishIndex].component = buttonFinishes[0];
          }
        }
      } else {
        if (Array.isArray(buttonFinishesBraille[0])) {
          const correctFinishes = buttonFinishesBraille.find((item) => item[0] === design.components[cop1Index].parts[currentShapeIndex].component);
          if (!correctFinishes[1].find((item) => item === design.components[cop1Index].parts[currentFinishIndex].component)) {
            design.components[cop1Index].parts[currentFinishIndex].component = correctFinishes[1][0];
          }

        } else {
          if (!buttonFinishesBraille.find((item) => item === design.components[cop1Index].parts[currentFinishIndex].component)) {
            design.components[cop1Index].parts[currentFinishIndex].component = buttonFinishesBraille[0];
          }
        }
      }

    }

    if (cop2Index !== -1) {
      if (!design.components[cop2Index]?.parts) {
        design.components[cop2Index].parts = [];
      }

      if (design.components[cop2Index].parts.findIndex((item) => item.componentType === BUTTON_COLS) === -1) {
        design.components[cop2Index].parts.push({
          componentType: BUTTON_COLS,
          component: design.components[cop1Index].parts[currentColsIndex].component,
        });
      }
      if (design.components[cop2Index].parts.findIndex((item) => item.componentType === BUTTON_SHAPE) === -1) {
        design.components[cop2Index].parts.push({
          componentType: BUTTON_SHAPE,
          component: design.components[cop1Index].parts[currentShapeIndex].component,
        });
      }
      if (design.components[cop2Index].parts.findIndex((item) => item.componentType === BRAILLE) === -1) {
        design.components[cop2Index].parts.push({
          componentType: BRAILLE,
          component: design.components[cop1Index].parts[currentBrailleIndex].component,
        });
      }
      if (design.components[cop2Index].parts.findIndex((item) => item.componentType === BUTTON_FINISH) === -1) {
        design.components[cop2Index].parts.push({
          componentType: BUTTON_FINISH,
          component: design.components[cop1Index].parts[currentFinishIndex].component,
        });
      }
    }
  }

  /////////////////////////////////////////
  // Test first if horizontal cop that requires a handrail is present and also place the horcop to correct wall
  /////////////////////////////////////////
  // const cop3Index = design.components.findIndex(item => item.componentType === TYP_COP_HORIZONTAL);
  if (copHorIndex !== -1) {
    const signalizationFamily = (
      product.componentsData.signalization.copModels.find((item) => {
        return item.copTypes.find((copType) => copType.id === design.components[cop1Index].component);
      }) || {}
    ).id;
    const signalizationFamilyItems = product.componentsData.signalization.copModels.find((item) => item.id === signalizationFamily) || {};

    if (product && product.rules && product.rules.signalizationHorizontal) {
      const handrailIndex = design.components.findIndex((item) => item.componentType === TYP_CAR_HANDRAIL);

      const cop1 = cop1Index !== -1 ? design.components[cop1Index] : {};
      const cop1Component = (signalizationFamilyItems.copTypes || []).find((item) => item.id === cop1.component) || {};
      const cop2 = cop2Index !== -1 ? design.components[cop2Index] : {};
      const horCop = copHorIndex !== -1 ? design.components[copHorIndex] : {};
      const horCopPosition = design.components[copHorIndex].positions.join('');
      const currentHorCop = design.components[copHorIndex].component;

      const test = {
        MARKET: product.businessSpecification.market || '',
        HORCOP: horCop.component || 'none',
        COP2: cop2.component || 'none',
        COP2_POS: (cop2.positions || ['none']).join(''),
        COP1_POS: (cop1.positions || []).join(''),
        COP1_FAMILY: cop1Component.componentFamily,
        CAR_TYPE: design.carType,
        DECO: (design.components.find((item) => item.componentType === TYP_CAR_WALL_ADD_DECO_PACKAGE) || {}).component || [],
        HANDRAIL_POS: handrailIndex !== -1 ? design.components[handrailIndex].positions : [],
        HANDRAIL: handrailIndex !== -1 ? design.components[handrailIndex].component : '',
        POSITION: horCopPosition,
        CURRENT: currentHorCop,
        OFFERING: product.offeringLocation,
        SCENIC_POS: ( (design.components.find(item => item.componentType === TYP_CAR_GLASS_WALL_C) || {}).positions || []),
      }
      const results = jsonLogic.apply(product.rules.signalizationHorizontal, test )
      const correctHorCop = results[2]
      const horCopPossiblePositions = results[5].filter(n=>n)
      const horCopCanBePlaced = results[0] && horCopPossiblePositions.length>0

      const horCopFinishType = ((product.components.find(item => item.sapId === correctHorCop[0]) || {}).finishingTypes || [])[0]
      const horCopFinish = horCopFinishType && product.finishes.find(item => ( (item.types || []).indexOf(horCopFinishType) !== -1 )
              && jsonLogic.apply(product.rules.signalizationFinishes, {TYP_COP_PRODUCT_1:(currentHorCop===correctHorCop[0] ?correctHorCop[0] :currentHorCop),  FINISH:item.sapId, FAMILY:cop1Component.componentFamily}))
      const horCopFinishes = horCopFinishType && product.finishes.filter(item => ( (item.types || []).indexOf(horCopFinishType) !== -1 )
              && jsonLogic.apply(product.rules.signalizationFinishes, {TYP_COP_PRODUCT_1:(currentHorCop===correctHorCop[0] ?correctHorCop[0] :currentHorCop),  FINISH:item.sapId, FAMILY: cop1Component.componentFamily}))
      if( horCopCanBePlaced) {
        design.components[copHorIndex].component = correctHorCop[0]
        if (!horCopPossiblePositions.find(pos => horCopPosition.indexOf(pos) === -1)) {          
          design.components[copHorIndex].positions = [correctHorCop[1]]
        }
        design.components[copHorIndex].finishType = horCopFinishType
        design.components[copHorIndex].finish = (horCopFinishes || []).find(item=>item.id === design.components[copHorIndex].finish ) ?design.components[copHorIndex].finish :(horCopFinish || {}).sapId
        if(signalizationFamily === 'KDS660') {
          design.components[copHorIndex].finish = design.components[cop1Index].finish
        }
      } else {
        toBeRemoved.push(TYP_COP_HORIZONTAL);
      }

      /* const determineHandrail = results[3]
      if( determineHandrail[0]) {
        const hrToBe = product?.componentsData?.accessories?.handrails?.models?.find(item => item.id === determineHandrail[0])
        if(handrailIndex === -1) {
          design.components.push({
            componentType : TYP_CAR_HANDRAIL,
            component: determineHandrail[0],
            finish: (hrToBe?.finishes.find(item=>item.id === 'F') ? 'F' : null),
            finishType: MAT_CAR_HANDRAIL,
            positions: [
              determineHandrail[1]
            ]
          })
          
        } else {
          // If there are no handrail selected for other than horcop wall, switch the handrail wall
          if( !design.components[handrailIndex].positions || design.components[handrailIndex].positions.length<2) {
            design.components[handrailIndex].positions = [determineHandrail[1]]
          } else {
            if(design.components[handrailIndex].positions.indexOf(determineHandrail[1]) === -1) {
              design.components[handrailIndex].positions.push(determineHandrail[1])
            }
          }
          design.components[handrailIndex].component = determineHandrail[0]
          if(product?.rules?.variousFilteringRules && !(jsonLogic.apply(product.rules.variousFilteringRules,{'filteringRULE':'horCopFinishFilter', 'COP':correctHorCop[0], 'FINISH':design.components[handrailIndex].finish, 'HANDRAIL':determineHandrail[0]}))) {            
            design.components[handrailIndex].finish= hrToBe?.finishes.find(item=> {
              const test = {'filteringRULE':'horCopFinishFilter', 'COP':correctHorCop[0], 'FINISH':item.id, 'HANDRAIL':determineHandrail[0]}
              return (jsonLogic.apply(product.rules.variousFilteringRules,test))
            })
          }

        }
      } */
    }
  }

  /////////////////////////////////////////
  // laminatelists
  /////////////////////////////////////////
  const llIndex = design.components.findIndex((item) => item.componentType === TYP_CAR_LAMINATE_LIST);
  if (product && product.rules && product.rules.laminateLists) {
    let listsOnWalls = [];
    let laminateWallFinishes = [];

    if (wallBIndex !== -1 && design.components[wallBIndex].parts && design.components[wallBIndex].parts.length > 0) {
      const b1Finish = (design.components[wallBIndex].parts.find((item) => item.type === CAR_WALL_STRUCTURE_B1) || {}).finish;
      const bxFinish = (design.components[wallBIndex].parts.find((item) => item.type === CAR_WALL_STRUCTURE_BX) || {}).finish;
      const b2Finish = (design.components[wallBIndex].parts.find((item) => item.type === CAR_WALL_STRUCTURE_B2) || {}).finish;
      let bLists = [];
      bLists.push(
        jsonLogic.apply(product.rules.laminateLists, {
          FINISH: b1Finish || null,
          MARKET: product.businessSpecification.market || '',
          PRODUCT: product.product,
        })
      );
      bLists.push(
        jsonLogic.apply(product.rules.laminateLists, {
          FINISH: bxFinish || null,
          MARKET: product.businessSpecification.market || '',
          PRODUCT: product.product,
        })
      );
      bLists.push(
        jsonLogic.apply(product.rules.laminateLists, {
          FINISH: b2Finish || null,
          MARKET: product.businessSpecification.market || '',
          PRODUCT: product.product,
        })
      );
      const bLL = bLists.find((item) => item !== false);
      listsOnWalls.push(bLL !== undefined ? bLL : false);
    } else {
      const bTest = {
        FINISH: (design.components.find((item) => item.componentType === TYP_CAR_WALL_B) || {}).finish || null,
        MARKET: product.businessSpecification.market || '',
        PRODUCT: product.product,
        MATERIAL: (design.components.find((item) => item.componentType === TYP_CAR_WALL_B) || {}).finishMaterial || null,
      };
      const bLL = jsonLogic.apply(product.rules.laminateLists, bTest);
      listsOnWalls.push(bLL);
      if (bLL) {
        laminateWallFinishes.push((design.components.find((item) => item.componentType === TYP_CAR_WALL_B) || {}).finish || null);
      }
    }

    if (wallCIndex !== -1 && design.components[wallCIndex].parts && design.components[wallCIndex].parts.length > 0) {
      const c1Finish = (design.components[wallCIndex].parts.find((item) => item.type === CAR_WALL_STRUCTURE_C1) || {}).finish;
      const cxFinish = (design.components[wallCIndex].parts.find((item) => item.type === CAR_WALL_STRUCTURE_CX) || {}).finish;
      const c2Finish = (design.components[wallCIndex].parts.find((item) => item.type === CAR_WALL_STRUCTURE_C2) || {}).finish;
      let cLists = [];
      cLists.push(
        jsonLogic.apply(product.rules.laminateLists, {
          FINISH: c1Finish || null,
          MARKET: product.businessSpecification.market || '',
          PRODUCT: product.product,
        })
      );
      cLists.push(
        jsonLogic.apply(product.rules.laminateLists, {
          FINISH: cxFinish || null,
          MARKET: product.businessSpecification.market || '',
          PRODUCT: product.product,
        })
      );
      cLists.push(
        jsonLogic.apply(product.rules.laminateLists, {
          FINISH: c2Finish || null,
          MARKET: product.businessSpecification.market || '',
          PRODUCT: product.product,
        })
      );
      const cLL = cLists.find((item) => item !== false);
      listsOnWalls.push(cLL !== undefined ? cLL : false);
    } else {
      const cTest = {
        FINISH: (design.components.find((item) => item.componentType === TYP_CAR_WALL_C) || {}).finish || null,
        MARKET: product.businessSpecification.market || '',
        PRODUCT: product.product,
        MATERIAL: (design.components.find((item) => item.componentType === TYP_CAR_WALL_C) || {}).finishMaterial || null,
      };
      const cLL = jsonLogic.apply(product.rules.laminateLists, cTest);
      listsOnWalls.push(cLL);
      if (cLL) {
        laminateWallFinishes.push((design.components.find((item) => item.componentType === TYP_CAR_WALL_C) || {}).finish || null);
      }
    }

    if (wallDIndex !== -1 && design.components[wallDIndex].parts && design.components[wallDIndex].parts.length > 0) {
      const d1Finish = (design.components[wallDIndex].parts.find((item) => item.type === CAR_WALL_STRUCTURE_D1) || {}).finish;
      const dxFinish = (design.components[wallDIndex].parts.find((item) => item.type === CAR_WALL_STRUCTURE_DX) || {}).finish;
      const d2Finish = (design.components[wallDIndex].parts.find((item) => item.type === CAR_WALL_STRUCTURE_D2) || {}).finish;
      let dLists = [];
      dLists.push(
        jsonLogic.apply(product.rules.laminateLists, {
          FINISH: d1Finish || null,
          MARKET: product.businessSpecification.market || '',
          PRODUCT: product.product,
        })
      );
      dLists.push(
        jsonLogic.apply(product.rules.laminateLists, {
          FINISH: dxFinish || null,
          MARKET: product.businessSpecification.market || '',
          PRODUCT: product.product,
        })
      );
      dLists.push(
        jsonLogic.apply(product.rules.laminateLists, {
          FINISH: d2Finish || null,
          MARKET: product.businessSpecification.market || '',
          PRODUCT: product.product,
        })
      );
      const dLL = dLists.find((item) => item !== false);
      listsOnWalls.push(dLL !== undefined ? dLL : false);
    } else {
      const dTest = {
        FINISH: (design.components.find((item) => item.componentType === TYP_CAR_WALL_D) || {}).finish || null,
        MARKET: product.businessSpecification.market || '',
        PRODUCT: product.product,
        MATERIAL: (design.components.find((item) => item.componentType === TYP_CAR_WALL_D) || {}).finishMaterial || null,
      };
      const dLL = jsonLogic.apply(product.rules.laminateLists, dTest);
      listsOnWalls.push(dLL);
      if (dLL) {
        laminateWallFinishes.push((design.components.find((item) => item.componentType === TYP_CAR_WALL_D) || {}).finish || null);
      }
    }

    /*     const bTest={FINISH: ( (design.components.find(item => item.componentType === TYP_CAR_WALL_B) || {}).finish || null), MARKET:(product.businessSpecification.market || '') }
    const cTest={FINISH: ( (design.components.find(item => item.componentType === TYP_CAR_WALL_C) || {}).finish || null), MARKET:(product.businessSpecification.market || '') }
    const dTest={FINISH: ( (design.components.find(item => item.componentType === TYP_CAR_WALL_D) || {}).finish || null), MARKET:(product.businessSpecification.market || '') }


    listsOnWalls =  [jsonLogic.apply(product.rules.laminateLists, bTest), jsonLogic.apply(product.rules.laminateLists, cTest), jsonLogic.apply(product.rules.laminateLists, dTest)]
 */
    if (listsOnWalls.some((val) => val !== false)) {
      let llPositions = [];

      if (listsOnWalls[0]) {
        llPositions.push('B');
      }
      if (listsOnWalls[1]) {
        llPositions.push('C');
      }
      if (listsOnWalls[2]) {
        llPositions.push('D');
      }

      llPositions.sort();

      const wallsWithLists = listsOnWalls.filter((item) => item !== false);
      let useLists;
      // special case for NanoSpace
      if (product.product === 'nanospace') {
        useLists =
          wallsWithLists.indexOf('LL1') !== -1
            ? wallsWithLists.indexOf('LL3') === -1
              ? 'LL1'
              : (design.components[llIndex] || {}).component
            : 'LL3';
      } else if (
        product?.rules?.variousFilteringRules &&
        jsonLogic.apply(product.rules.variousFilteringRules, {
          filteringRULE: 'laminateListSelectable',
          PRODUCT: product.product,
          MATERIAL: design?.components?.[wallCIndex]?.finishMaterial,
        })
      ) {
        useLists = (design.components[llIndex] || {}).component;
      } else {
        useLists =
          wallsWithLists.indexOf('LL2') !== -1
            ? 'LL2'
            : laminateWallFinishes.every((val) => val === laminateWallFinishes[0])
            ? wallsWithLists[0]
            : 'LL1';
      }
      // const useLists = (wallsWithLists.indexOf('LL1') !== -1) ?'LL1' :(wallsWithLists[0] || 'LL3');

      if (llIndex === -1) {
        design.components.push({
          componentType: TYP_CAR_LAMINATE_LIST,
          component: useLists,
          finishType: MAT_CAR_LAMINATE_LIST,
          finish: useLists,
          positions: llPositions,
        });
      } else {
        const currentPositions = (design.components[llIndex] || {}).positions.sort();

        if (currentPositions && currentPositions.join('') !== (llPositions || []).join('')) {
          design.components[llIndex].positions = llPositions;
        }
        if (design.components[llIndex].component !== useLists) {
          design.components[llIndex].component = useLists;
        }
        if (design.components[llIndex].finish !== useLists) {
          design.components[llIndex].finish = useLists;
        }
      }
    } else if (llIndex !== -1) {
      toBeRemoved.push(TYP_CAR_LAMINATE_LIST);
    }
  }

  /////////////////////////////////////////
  // mirrors
  /////////////////////////////////////////
  const mirrorIndex = design.components.findIndex((item) => item.componentType === TYP_CAR_MIRROR);
  if (mirrorIndex !== -1) {
    if (product && product.rules && product.rules.mirrors) {
      const cop1 = (design.components.find((item) => item.componentType === TYP_COP_PRODUCT_1) || {}).positions || [];
      const cop2 = (design.components.find((item) => item.componentType === TYP_COP_2) || {}).positions || [];
      const cWallIndex = design.components.findIndex((item) => item.componentType === TYP_CAR_WALL_C);
      let cWallMaterial = null;
      if (cWallIndex !== -1) {
        const wallCMaterial =
          product.componentsData.walls.materials.find((item) => {
            return item.finishes.find((fItem) => fItem.id === design.components[cWallIndex].finish);
          }) || {};
        /*         const cWallFinishItem = product.finishes.find(item => item.sapId === design.components[cWallIndex].finish)
        const wallCMaterials = (product.finishMaterials || []).filter(item => {      
          return item.types && item.types.indexOf(MAT_CAR_WALL_FINISH_C) !== -1 && item.disabled !== true ;
        }) */
        // cWallMaterial = wallCMaterials.find(item => ((cWallFinishItem || {}).materials || []).indexOf(item.id) !== -1 )
        cWallMaterial = wallCMaterial;
      }

      let cop1Pos = cop1.map((item) => {
        if (!item) return null;
        if (item.indexOf('B') !== -1) {
          return 'B';
        } else if (item.indexOf('D') !== -1) {
          return 'D';
        }
        return null;
      });
      let cop2Pos = cop2.map((item) => {
        if (!item) return null;
        if (item.indexOf('B') !== -1) {
          return 'B';
        } else if (item.indexOf('D') !== -1) {
          return 'D';
        }
        return null;
      });

      const test = {};
      test['PRODUCT'] = product.product;
      test['TYPE'] = design.carType || '';
      test['BACKWALLTYPE'] = design.backWallPanelingType || 0;
      test['DECO'] = (design.components.find((item) => item.componentType === TYP_CAR_WALL_ADD_DECO_PACKAGE) || {}).component || 'none';
      test['MIRROR'] = design.components[mirrorIndex].component;
      test['CWALL_MAT'] = (cWallMaterial || {}).id;
      test['CEILING'] = (design.components.find((item) => item.componentType === TYP_CAR_CEILING) || {}).component || null;
      test['COPPOS'] = cop1Pos.concat(cop2Pos || []);
      test['MIRROR_POS'] = design.components[mirrorIndex].positions || null;
      test['SCENIC'] = (design.components.find((item) => item.componentType === TYP_CAR_GLASS_WALL_C) || {}).positions || null;
      const newDisabledPositions = jsonLogic.apply(product.rules.mirrors, test);

      let mirrorPositions = design.components[mirrorIndex].positions || [];
      if (mirrorPositions.length > 0) {
        let newPositions = [];
        mirrorPositions.forEach((item) => {
          if (newDisabledPositions.indexOf(item) === -1) {
            newPositions.push(item);
          }
        });
        if (newPositions.length > 0) {
          design.components[mirrorIndex].positions = newPositions;
        } else {
          toBeRemoved.push(TYP_CAR_MIRROR);
        }
      }
    }
  }

  /////////////////////////////////////////
  // Wide Angle Mirror
  /////////////////////////////////////////
  const wamIndex = design.components.findIndex((item) => item.componentType === TYP_CAR_MIRROR_2);
  if (wamIndex !== -1) {
    if (product && product.rules && product.rules.variousFilteringRules) {
      if (!isTrueTypeCar(design.carType)) {
        toBeRemoved.push(TYP_CAR_MIRROR_2);
      }

      if (
        !jsonLogic.apply(product.rules.variousFilteringRules, {
          filteringRULE: 'wideAngleMirror',
          CEILING: (design.components.find((item) => item.componentType === TYP_CAR_CEILING) || {}).component || null,
        })
      ) {
        toBeRemoved.push(TYP_CAR_MIRROR_2);
      }
    }
  }

  /////////////////////////////////////////
  // Handrail
  /////////////////////////////////////////
  let handrailIndex = design.components.findIndex((item) => item.componentType === TYP_CAR_HANDRAIL);
  // Check if the handrail must be added with mirror
  if (handrailIndex === -1 && product && product.rules && product.rules.accessoriesEdit) {
    const mirrorIndex = design.components.findIndex((item) => item.componentType === TYP_CAR_MIRROR);
    if (mirrorIndex !== -1 && design.components[mirrorIndex].positions) {
      const accessoriesRules = jsonLogic.apply(product.rules.accessoriesEdit, {
        PRODUCT: product.product,
        MIRROR_POS: design.components[mirrorIndex].positions,
      });
      const mustBeThere = accessoriesRules[0];
      if (mustBeThere.indexOf(TYP_CAR_HANDRAIL) !== -1) {
        design.components.push({
          componentType: TYP_CAR_HANDRAIL,
          finishType: MAT_CAR_HANDRAIL,
          positions: design.components[mirrorIndex].positions,
        });
        handrailIndex = design.components.findIndex((item) => item.componentType === TYP_CAR_HANDRAIL);
      }
    }
  }
  if (handrailIndex !== -1 && design.components[handrailIndex].positions) {
    // Check if handrail position must follow the mirror
    if (product && product.rules && product.rules.accessoriesEdit) {
      const mirrorIndex = design.components.findIndex((item) => item.componentType === TYP_CAR_MIRROR);
      if (mirrorIndex !== -1 && design.components[mirrorIndex].positions) {
        const accessoriesRules = jsonLogic.apply(product.rules.accessoriesEdit, {
          PRODUCT: product.product,
          MIRROR_POS: design.components[mirrorIndex].positions,
          C_FINISH: wallCIndex !== -1 ?design?.components[wallCIndex]?.finish :'none'
        });
        const mustBeThere = accessoriesRules[0];
        if (mustBeThere.indexOf(TYP_CAR_HANDRAIL) !== -1) {
          const handrailPositions = design.components[handrailIndex].positions;
          const mirrorPositions = design.components[mirrorIndex].positions;
          mirrorPositions.forEach((mrPos) => {
            if (handrailPositions.indexOf(mrPos) === -1) {
              design.components[handrailIndex].positions.push(mrPos);
            }
          });
        }
      }
    }

    if (product && product.rules && product.rules.handrailPositions) {
      const cop3Index = design.components.findIndex((item) => item.componentType === TYP_COP_HORIZONTAL);
      const currentHR = design.components[handrailIndex].component;
      const filteredComponents = product.componentsData.accessories.handrails.models || [];
      /*       const filteredComponents = (product.components || []).filter(item => {
        return item.type === TYP_CAR_HANDRAIL && item.disabled !== true;
      }) */

      let hasHorCop = false;
      if (cop3Index !== -1) {
        const results = jsonLogic.apply(product.rules.signalizationHorizontal, { COP2: design.components[cop3Index].component });
        hasHorCop = results[1];
      }

      const cWallIndex = design.components.findIndex((item) => item.componentType === TYP_CAR_WALL_C);
      let cWallMaterial = null;

      if (cWallIndex !== -1) {
        const wallCMaterial =
          product.componentsData.walls.materials.find((item) => {
            return item.finishes.find((fItem) => fItem.id === design.components[cWallIndex].finish);
          }) || {};

        if (!wallCMaterial.id && design.components[cWallIndex].parts?.length > 2) {
          const partsMaterials = getPartsMaterials(product, design.components[cWallIndex].parts);
          if (partsMaterials.indexOf(DECO_GLASS_MATERIAL) !== -1) {
            cWallMaterial = DECO_GLASS_MATERIAL;
          }
        } else if (wallCMaterial.id) {
          cWallMaterial = wallCMaterial.id;
        }
      }

      // if horizontal cop is KSSH, remove handrail from the wall where the HorCop is placed
      if (
        cop3Index !== -1 &&
        (design.components[cop3Index].component === 'KSCH40' || design.components[cop3Index].component === 'KSCH70')
      ) {
        const testForPosition = design.components[cop3Index].positions.indexOf('DX') !== -1 ? 'D' : 'B';
        if (design.components[handrailIndex].positions.indexOf(testForPosition) !== -1) {
          design.components[handrailIndex].positions = design.components[handrailIndex].positions.filter(
            (position) => position !== testForPosition
          );
        }
      }

      let newComponents;
      do {
        newComponents = filteredComponents.filter((item) => {
          let test = {};
          test['TEST_TYPE'] = 'disableComponents';
          test['PRODUCT'] = product.product;
          test['SHAPE'] = design.carShape;
          test['REGULATIONS'] = design.regulations && design.regulations.length > 0 ? design.regulations : [];
          test['DECO'] = (design.components.find((item) => item.componentType === TYP_CAR_WALL_ADD_DECO_PACKAGE) || {}).component || 'none';
          test['CWALL_MAT'] = cWallMaterial;
          test['WINDOW'] = (design.components.find((item) => item.componentType === TYP_CAR_GLASS_WALL_C) || {}).component || '';
          test['HANDRAIL'] = item.id;
          test['POSITIONS'] = design.components[handrailIndex].positions;
          test['COP1_POS'] = ((design.components.find((item) => item.componentType === TYP_COP_PRODUCT_1) || {}).positions || []).join();
          test['COP2_POS'] = ((design.components.find((item) => item.componentType === TYP_COP_2) || {}).positions || []).join();
          test['COP2'] = (design.components.find((item) => item.componentType === TYP_COP_2) || {}).component || '';
          test['HORCOP'] = (design.components.find((item) => item.componentType === TYP_COP_HORIZONTAL) || {}).component || '';
          test['CARTYPE'] = design.carType;
          test['HAS_HORCOP'] = hasHorCop;
          test['SCENIC'] = (design.components.find((item) => item.componentType === TYP_CAR_GLASS_WALL_C) || {}).positions || null;
          test['SCENICTYPE'] = (design.components.find((item) => item.componentType === TYP_CAR_GLASS_WALL_C) || {}).component || null;
          test['PREDESIGN'] = design?.originalSapId;
          // console.log({test,res:jsonLogic.apply(product.rules.handrailPositions, test)})
          return jsonLogic.apply(product.rules.handrailPositions, test);
        });

        // console.log({newComponents})
        if (newComponents.length === 0) {
          design.components[handrailIndex].positions.pop();
        }
        // console.log('--- new round')
      } while (newComponents.length === 0 && design.components[handrailIndex].positions.length > 0);

      if (newComponents.length > 0 && ((currentHR && !newComponents.find((item) => item.id === currentHR)) || !currentHR)) {
        design.components[handrailIndex].component = newComponents[0].id;
        const handrailsData = product.componentsData.accessories.handrails;
        const newFinishes = handrailsData.models
          .find((model) => model.id === newComponents[0].id)
          .finishes.filter((finish) => !finish.disabled);

        const currentFinishIndex = newFinishes.findIndex((item) => item.id === design.components[handrailIndex].finish);
        if (newFinishes.length > 0 && currentFinishIndex === -1) {
          design.components[handrailIndex].finish = newFinishes[0].id;
        }
      } else if (newComponents.length > 0 && currentHR && newComponents.find((item) => item.id === currentHR)) {
        const handrailsData = product.componentsData.accessories.handrails;
        const newFinishes = handrailsData.models.find((model) => model.id === currentHR).finishes.filter((finish) => !finish.disabled);

        const currentFinishIndex = newFinishes.findIndex((item) => item.id === design.components[handrailIndex].finish);
        if (newFinishes.length > 0 && currentFinishIndex === -1) {
          design.components[handrailIndex].finish = newFinishes[0].id;
        }
      } else if (newComponents.length < 1) {
        toBeRemoved.push(TYP_CAR_HANDRAIL);
      }
    }

    if (isTrueTypeCar(design.carType) && design.components[handrailIndex].positions.indexOf('C') !== -1) {
      const cIndex = design.components[handrailIndex].positions.indexOf('C');
      design.components[handrailIndex].positions.splice(cIndex, 1);
    }
  }

  /*////////////////////////////////////////
                                              
  ####  #    # # #####  ##### # #    #  ####  
 #      #   #  # #    #   #   # ##   # #    # 
  ####  ####   # #    #   #   # # #  # #      
      # #  #   # #####    #   # #  # # #  ### 
 #    # #   #  # #   #    #   # #   ## #    # 
  ####  #    # # #    #   #   # #    #  ####  
                                              
  // skriting
  ////////////////////////////////////////*/

  const skirtingIndex = design.components.findIndex((item) => item.componentType === TYP_CAR_SKIRTING);
  if (skirtingIndex !== -1) {
    const productSkirtingType = product.components.find((item) => item.type === TYP_CAR_SKIRTING);
    if (productSkirtingType) {
      design.components[skirtingIndex].component = productSkirtingType.sapId;
    }
  }
  if (product && product.rules && product.rules.accessoriesEdit) {
    const test = {}; //getFinishId({type: MAT_CAR_FLOORING})});
    test['PRODUCT'] = product.product;

    const floorFinish = (design.components.find((item) => item.componentType === TYP_CAR_FLOORING) || {}).finish || null;
    const floorFinishMaterial =
      (product.componentsData.floors || []).find((item) => {
        return item.finishes.find((fItem) => fItem.id === floorFinish);
      }) || undefined;
    // const finish = (product.finishes || []).find(item => item.id === floorFinish)
    if (floorFinishMaterial === undefined) {
      test['FLOOR_MATERIAL'] = '';
    } else {
      // const { materials=[] } = finish;
      test['FLOOR_MATERIAL'] = (floorFinishMaterial || {}).id;
    }
    test['PANELORIENTATION'] = '';
    test['COP1'] = null;
    test['COP2'] = null;
    test['COP1_POS'] = '';
    test['COP2_POS'] = '';
    test['DECO'] = (design.components.find((item) => item.componentType === TYP_CAR_WALL_ADD_DECO_PACKAGE) || {}).component || 'none';
    test['MIRROR_POS'] = [];
    test['MIRROR'] = null;
    test['BUFFER_POS'] = [];
    test['HANDRAIL_POS'] = [];

    const bWallFinish = (design.components.find((item) => item.componentType === TYP_CAR_WALL_B) || {}).finish || null;
    const bFinishMaterial = product.componentsData.walls.materials.find((item) => {
      return item.finishes.find((fItem) => fItem.id === bWallFinish);
    });
    // const bFinish = (product.finishes || []).find(item => item.id === bWallFinish)
    const dWallFinish = (design.components.find((item) => item.componentType === TYP_CAR_WALL_D) || {}).finish || null;
    const dFinishMaterial = product.componentsData.walls.materials.find((item) => {
      return item.finishes.find((fItem) => fItem.id === dWallFinish);
    });
    // const dFinish = (product.finishes || []).find(item => item.id === dWallFinish)
    const cWallFinish = (design.components.find((item) => item.componentType === TYP_CAR_WALL_C) || {}).finish || null;
    const cFinishMaterial = product.componentsData.walls.materials.find((item) => {
      return item.finishes.find((fItem) => fItem.id === cWallFinish);
    });
    // const cFinish = (product.finishes || []).find(item => item.id === cWallFinish)

    if (bFinishMaterial === undefined) {
      test['WALL_MATERIALS'] = ['none'];
    } else {
      // const { materials=[] } = bFinish;
      test['WALL_MATERIALS'] = [(bFinishMaterial || {}).id];
    }
    if (dFinishMaterial === undefined) {
      test['WALL_MATERIALS'].push('none');
    } else {
      // const { materials=[] } = dFinish;
      test['WALL_MATERIALS'].push((dFinishMaterial || {}).id);
    }
    if (cFinishMaterial === undefined) {
      test['WALL_MATERIALS'].push('none');
    } else {
      // const { materials=[] } = cFinish;
      test['WALL_MATERIALS'].push((cFinishMaterial || {}).id);
    }

    const scenicIndex = design.components.findIndex((item) => item.componentType === TYP_CAR_GLASS_WALL_C);
    if (scenicIndex !== -1) {
      test['WALL_MATERIALS'].push('SCENIC');
    }

    const disableRemoveAddList = jsonLogic.apply(product.rules.accessoriesEdit, test);

    // console.log({test,disableRemoveAddList})

    if (skirtingIndex === -1 && disableRemoveAddList && disableRemoveAddList[0] && disableRemoveAddList[0].length > 0) {
      if (disableRemoveAddList[0].indexOf(TYP_CAR_SKIRTING) !== -1) {
        const defaultSkirting = deepcopy(DEFAULT_SKIRTING_COMPONENT);

        // special case for Add-On-Deco. The skirting must be thinner so different model needs to be loaded.
        /*           if(design.product === 'add-on-deco' || product.offeringLocation === OFFERING_INDIA) {
          defaultSkirting.component = 'SK2'
        } */

        // make sure the skirting component is correct
        const productSkirtingType = product.components.find((item) => item.type === TYP_CAR_SKIRTING);
        if (productSkirtingType) {
          defaultSkirting.component = productSkirtingType.sapId;
        }
        let skirtingData
        if (product.componentsData) {
          // Checking if the default skirting is enabled in the database.
          // If not, select the first enabled as the default.
           skirtingData = product.componentsData.accessories.skirtings;
          const skirting = skirtingData.finishes.find((x) => x.id === defaultSkirting.finish);
          if (!skirting || skirting.disabled) {
            const skirtingSOC = skirtingData.finishes.find((x) => x.id === 'ST4');
            if (!skirtingSOC || skirtingSOC.disabled) {
              const firstAllowed = product.componentsData.accessories.skirtings.finishes.filter((x) => !x.disabled)[0];
              if (firstAllowed) {
                defaultSkirting.finish = firstAllowed.id;
              }
            } else {
              defaultSkirting.finish = 'ST4';
            }
          }
        }
        if(skirtingData && product?.offeringLocation === "Full Replacement" && product.product === "nanospace") {
          if(design.components.find((item) => item.componentType === TYP_CAR_LAMINATE_LIST).component === "LL1") {
            defaultSkirting.finish = skirtingData.finishes[0].id;
          } else  {
            defaultSkirting.finish = skirtingData.finishes[1].id;
          }
        }
      design.components.push(defaultSkirting);
      }
    }

    let skirtingFinishes = product?.componentsData?.accessories?.skirtings?.finishes;
    if (skirtingFinishes && product?.offeringLocation === OFFERING_INDIA && product?.rules?.indiaFinishExceptions) {
      skirtingFinishes = skirtingFinishes.filter((item) => {
        const test = {
          TESTING: 'skirtingFinish',
          PRODUCT: product.product,
          FINISH: item.id,
          B_FINISH: wallBIndex !== -1 ? design.components[wallBIndex].finish : null,
          A_FINISH: wallAIndex !== -1 ? design.components[wallAIndex].finish : null,
          CEILING_FINISH: ceilingIndex !== -1 ? design.components[ceilingIndex].finish : null,
          DESIGN: design.originalSapId,
        };
        return jsonLogic.apply(product.rules.indiaFinishExceptions, test);
      });
      if (skirtingIndex !== -1 && skirtingFinishes) {
        if (!skirtingFinishes.find((item) => item.id === design.components[skirtingIndex].finish) && skirtingFinishes[0]) {
          design.components[skirtingIndex].finish = skirtingFinishes[0].id;
        }
      }
    }
    if(skirtingFinishes && product?.offeringLocation === "Full Replacement" && product.product === "nanospace" && skirtingIndex !== -1) {
      if(design.components.find((item) => item.componentType === TYP_CAR_LAMINATE_LIST).component === "LL1") 
        design.components[skirtingIndex].finish = skirtingFinishes[0].id;
      else  design.components[skirtingIndex].finish = skirtingFinishes[1].id; 
    }

    if (disableRemoveAddList && disableRemoveAddList[1] && disableRemoveAddList[1].length > 0) {
      if (disableRemoveAddList[1].indexOf(TYP_CAR_SKIRTING) !== -1) {
        toBeRemoved.push(TYP_CAR_SKIRTING);
      }
    }
  }
  //  }

  /*////////////////////////////////////////
                                                                            
 #####  #    # ###### ###### ###### #####     #####    ##   # #       ####  
 #    # #    # #      #      #      #    #    #    #  #  #  # #      #      
 #####  #    # #####  #####  #####  #    #    #    # #    # # #       ####  
 #    # #    # #      #      #      #####     #####  ###### # #           # 
 #    # #    # #      #      #      #   #     #   #  #    # # #      #    # 
 #####   ####  #      #      ###### #    #    #    # #    # # ######  ####  
                                                                            
  // buffer rails
  ////////////////////////////////////////*/
  let cWallMaterialType = null;
  let bWallMaterialType = null;
  let dWallMaterialType = null;

  const bufferIndex = design.components.findIndex((item) => item.componentType === TYP_CAR_BUFFER_RAIL);
  if (bufferIndex !== -1) {
    if (product && product.rules && product.rules.bufferPositions) {
      const cWallIndex = design.components.findIndex((item) => item.componentType === TYP_CAR_WALL_C);
      let cWallMaterial = null;
      const bWallIndex = design.components.findIndex((item) => item.componentType === TYP_CAR_WALL_B);
      let bWallMaterial = null;
      const dWallIndex = design.components.findIndex((item) => item.componentType === TYP_CAR_WALL_D);
      let dWallMaterial = null;
      if (cWallIndex !== -1) {
        const wallCMaterial =
          product.componentsData.walls.materials.find((item) => {
            return item.finishes.find((fItem) => fItem.id === design.components[cWallIndex].finish);
          }) || {};
        cWallMaterial = cWallMaterialType = wallCMaterial.id;
      }
      if (bWallIndex !== -1) {
        const wallBMaterial =
          product.componentsData.walls.materials.find((item) => {
            return item.finishes.find((fItem) => fItem.id === design.components[bWallIndex].finish);
          }) || {};
        bWallMaterial = bWallMaterialType= wallBMaterial.id;
      }
      if (dWallIndex !== -1) {
        const wallDMaterial =
          product.componentsData.walls.materials.find((item) => {
            return item.finishes.find((fItem) => fItem.id === design.components[dWallIndex].finish);
          }) || {};
        dWallMaterial = dWallMaterialType = wallDMaterial.id;
      }
      if (design.components[bufferIndex].component === 'BRM'){
        design.components[bufferIndex].positions =['LOW', 'B', 'C', 'D']
      }
      
      const test = {};
      test['PRODUCT'] = product.product;
      test['TYPE'] = design.carType || '';
      test['CWALL_MAT'] = (cWallMaterial || {}).id;
      test['COP1'] = (design.components.find((item) => item.componentType === TYP_COP_PRODUCT_1) || {}).component || null;
      test['COP2'] = (design.components.find((item) => item.componentType === TYP_COP_2) || {}).component || null;
      test['COP1_POS'] = ((design.components.find((item) => item.componentType === TYP_COP_PRODUCT_1) || {}).positions || []).join();
      test['COP2_POS'] = ((design.components.find((item) => item.componentType === TYP_COP_2) || {}).positions || []).join();
      test['DECO'] = (design.components.find((item) => item.componentType === TYP_CAR_WALL_ADD_DECO_PACKAGE) || {}).component || 'none';
      test['MIRROR_POS'] = (design.components.find((item) => item.componentType === TYP_CAR_MIRROR) || {}).positions || [];
      test['MIRROR'] = (design.components.find((item) => item.componentType === TYP_CAR_MIRROR) || {}).component || [];
      test['SCENIC'] = (design.components.find((item) => item.componentType === TYP_CAR_GLASS_WALL_C) || {}).positions || [];
      test['SCENICTYPE'] = (design.components.find((item) => item.componentType === TYP_CAR_GLASS_WALL_C) || {}).component || null;
      test['BufferId'] = (design.components[bufferIndex].component);
      const newDisabledPositions = jsonLogic.apply(product.rules.bufferPositions, test);

      if (design.components[bufferIndex].positions && design.components[bufferIndex].positions.length > 0) {
        let bufferPositions = design.components[bufferIndex].positions;
        let newPositions = [];
        bufferPositions.forEach((item) => {
          if (newDisabledPositions.indexOf(item) === -1) {
            newPositions.push(item);
          }
        });
        if (newPositions.length > 0) {
          design.components[bufferIndex].positions = newPositions;
        } else {
          toBeRemoved.push(TYP_CAR_BUFFER_RAIL);
        }
      }
     
    }
    function filteringBufferRails(bufferId){
      const refilterTest = {}
      refilterTest['filteringRULE'] = 'refilterBufferRails'
      refilterTest['BufferId'] = bufferId
      refilterTest['PRODUCT'] = product.product;
      refilterTest['BWALL_MAT'] = bWallMaterialType;
      refilterTest['CWALL_MAT'] = cWallMaterialType;
      refilterTest['DWALL_MAT'] = dWallMaterialType;
     
      const disableBufferRail = jsonLogic.apply(product.rules.variousFilteringRules, refilterTest)
      return disableBufferRail;
    }
    const buffer = design.components[bufferIndex].component;
      if(filteringBufferRails(buffer)){
     
        const productBufferRails = product.components.filter((item) => item.type === TYP_CAR_BUFFER_RAIL);
        for (const item of productBufferRails){
         
            if (!filteringBufferRails(item.id)){
              design.components[bufferIndex].component = item.id;    
              break;        
            }
           
        }
      }

    if (product?.rules?.bufferRailFinishes) {
      if (
        !jsonLogic.apply(product.rules.bufferRailFinishes, {
          PRODUCT: (product || {}).product,
          BUFFERRAIL: design.components[bufferIndex].component,
          FINISH: design.components[bufferIndex].finish,
        })
      ) {
        const bufferFinishes = product?.componentsData?.accessories?.bufferRails?.finishes;
        if (bufferFinishes) {
          const newFinish = bufferFinishes.find((item) =>
            jsonLogic.apply(product.rules.bufferRailFinishes, {
              PRODUCT: (product || {}).product,
              BUFFERRAIL: design.components[bufferIndex].component,
              FINISH: item.id,
            })
          );
          if (newFinish) {
            design.components[bufferIndex].finish = newFinish.id;
          }
        }
      }
    }
  }

  /*////////////////////////////////////////
                                                                                                                                     
 # #    # ######  ####       ##   #    # #####     #    # ###### #####  #   ##       ####   ####  #####  ###### ###### #    #  ####  
 # ##   # #      #    #     #  #  ##   # #    #    ##  ## #      #    # #  #  #     #      #    # #    # #      #      ##   # #      
 # # #  # #####  #    #    #    # # #  # #    #    # ## # #####  #    # # #    #     ####  #      #    # #####  #####  # #  #  ####  
 # #  # # #      #    #    ###### #  # # #    #    #    # #      #    # # ######         # #      #####  #      #      #  # #      # 
 # #   ## #      #    #    #    # #   ## #    #    #    # #      #    # # #    #    #    # #    # #   #  #      #      #   ## #    # 
 # #    # #       ####     #    # #    # #####     #    # ###### #####  # #    #     ####   ####  #    # ###### ###### #    #  ####  
                                                                                                                                     
  // info and media screens
  ////////////////////////////////////////*/
  const infoScreenIndex = design.components.findIndex((item) => item.componentType === TYP_CAR_INFOSCREEN);
  const mediaScreenIndex = design.components.findIndex((item) => item.componentType === TYP_CAR_MEDIASCREEN);
  if (infoScreenIndex !== -1 || mediaScreenIndex !== -1) {
    if (product && product.rules && product.rules.screensPositions) {
      const test = {};

      const copComponent = design.components.find((item) => item.componentType === TYP_COP_PRODUCT_1);
      let copDisplay = null;
      if (copComponent && copComponent.parts) {
        const copParts = copComponent.parts.find((item) => item.componentType === TYP_COP_DISPLAY);
        copDisplay = copParts && copParts.component ? copParts.component : null;
      }

      test['PRODUCT'] = product.product;
      test['COP1'] = (design.components.find((item) => item.componentType === TYP_COP_PRODUCT_1) || {}).component || null;
      test['COP1_DISPLAY'] = copDisplay;
      test['COP2'] = ( (design.components.find(item => item.componentType === TYP_COP_2) || {}).component || null);
      test['COP1_POS'] = ( (design.components.find(item => item.componentType === TYP_COP_PRODUCT_1) || {}).positions || []).join();
      test['COP2_POS'] = ( (design.components.find(item => item.componentType === TYP_COP_2) || {}).positions || []).join();
      test['MIRROR_POS'] = ((design.components.find(item => item.componentType === TYP_CAR_MIRROR) || {}).positions || []);
      test['SCREEN'] = (infoScreenIndex !== -1) ?design.components[infoScreenIndex].component :design.components[mediaScreenIndex].component
      test['SCENIC'] = ((design.components.find(item => item.componentType === TYP_CAR_GLASS_WALL_C) || {}).positions || []);
      test['DECO'] = ((design.components.find(item => item.componentType === TYP_CAR_WALL_ADD_DECO_PACKAGE ) || {}).component || null);

      const disableMediaInfoList = jsonLogic.apply(product.rules.screensPositions, test);
      const cop1Index = design.components.findIndex((item) => item.componentType === TYP_COP_PRODUCT_1);

      if (infoScreenIndex !== -1 && design.components[infoScreenIndex].positions) {
        let infoScreenPosition = (design.components[infoScreenIndex].positions || []).join();
        let disabledInfo = disableMediaInfoList[1];
        disabledInfo = _.union(disabledInfo, design.components[cop1Index].positions);

        if (disabledInfo.indexOf(infoScreenPosition) !== -1) {
          let newPosition = ['B1', 'BX', 'B2', 'D1', 'DX', 'D2'].find((item) => disabledInfo.indexOf(item) === -1) || null;
          if (newPosition) {
            design.components[infoScreenIndex].positions = [newPosition];
          } else {
            toBeRemoved.push(TYP_CAR_INFOSCREEN);
          }
        }
      }

      if (mediaScreenIndex !== -1 && design.components[mediaScreenIndex].positions) {
        // if(product && product.rules && product.rules.variousFilteringRules) {
        let isMSCorrect = true;
        if (product?.rules?.variousFilteringRules) {
          const signalizationFamily = (
            product.componentsData.signalization.copModels.find((item) => {
              return item.copTypes.find((copType) => copType.id === design.components[cop1Index].component);
            }) || {}
          ).id;

          let test = {};
          test['filteringRULE'] = 'ondoorMediaScreen';
          test['SCREEN'] = design.components[mediaScreenIndex].component;
          test['SIG_FAMILY'] = signalizationFamily;
          isMSCorrect = jsonLogic.apply(product.rules.variousFilteringRules, test);
        }

        if (isMSCorrect) {
          let mediaScreenPosition = (design.components[mediaScreenIndex].positions || []).join();
          let disabledMedia = disableMediaInfoList[0];
          // disabledMedia = _.union(disabledMedia, design.components[cop1Index].positions)
          if (disabledMedia.indexOf(mediaScreenPosition) !== -1) {
            let newPosition =
              ['B1', 'BX', 'B2', 'D1', 'DX', 'D2', 'A1', 'AX', 'A2', 'C1', 'CX', 'C2'].find((item) => disabledMedia.indexOf(item) === -1) ||
              null;
            if (newPosition) {
              design.components[mediaScreenIndex].positions = [newPosition];
            } else {
              toBeRemoved.push(TYP_CAR_MEDIASCREEN);
            }
          }
        } else {
          toBeRemoved.push(TYP_CAR_MEDIASCREEN);
        }
      }
    }
  }

  /*////////////////////////////////////////

  #    # ####### #     # #######    ### #     # ####### ####### ######  #     #    #    ####### ### ####### #     # 
  #   #  #     # ##    # #           #  ##    # #       #     # #     # ##   ##   # #      #     #  #     # ##    # 
  #  #   #     # # #   # #           #  # #   # #       #     # #     # # # # #  #   #     #     #  #     # # #   # 
  ###    #     # #  #  # #####       #  #  #  # #####   #     # ######  #  #  # #     #    #     #  #     # #  #  # 
  #  #   #     # #   # # #           #  #   # # #       #     # #   #   #     # #######    #     #  #     # #   # # 
  #   #  #     # #    ## #           #  #    ## #       #     # #    #  #     # #     #    #     #  #     # #    ## 
  #    # ####### #     # #######    ### #     # #       ####### #     # #     # #     #    #    ### ####### #     # 
                                                                                                                    
  ////////////////////////////////////////*/

  // Check if KONE Information service needs to be set on

  if (product?.componentsData?.kcsmServices?.find((service) => service.id === KCSM_KONE_INFORMATION && !service.disabled)) {
    if (cop1Index !== -1) {
      const cop1Component = design.components[cop1Index].component;
      if (COPS_WITH_KONE_INFORMATION.includes(cop1Component)) {
        if (!design?.services?.includes(KCSM_KONE_INFORMATION)) {
          if (!design.services) {
            design.services = [KCSM_KONE_INFORMATION];
          } else {
            design.services.push(KCSM_KONE_INFORMATION);
          }
        }
      } else {
        if (mediaScreenIndex === -1 && design?.services?.includes(KCSM_KONE_INFORMATION)) {
          const modifyIndex = design.services.indexOf(KCSM_KONE_INFORMATION);
          if (modifyIndex !== -1) design.services.splice(modifyIndex, 1);
        }
      }
    }

    // TODO: add mediascreen check up
    if (mediaScreenIndex !== -1) {
      if (!design?.services?.includes(KCSM_KONE_INFORMATION)) {
        if (!design.services) {
          design.services = [KCSM_KONE_INFORMATION];
        } else {
          design.services.push(KCSM_KONE_INFORMATION);
        }
      }
    } else {
      if (
        cop1Index !== -1 &&
        !COPS_WITH_KONE_INFORMATION.includes(design.components[cop1Index].component) &&
        design?.services?.length > 0
      ) {
        const modifyIndex = design.services.indexOf(KCSM_KONE_INFORMATION);
        if (modifyIndex !== -1) design.services.splice(modifyIndex, 1);
      }
    }
  }

  /*////////////////////////////////////////
                            
  ####  ######   ##   ##### 
 #      #       #  #    #   
  ####  #####  #    #   #   
      # #      ######   #   
 #    # #      #    #   #   
  ####  ###### #    #   #   
                            
  // seat
  ////////////////////////////////////////*/
  const seatIndex = design.components.findIndex((item) => item.componentType === TYP_CAR_SEAT);
  if (seatIndex !== -1) {
    if (product && product.rules && product.rules.seatPositions) {
      const cop2Index = design.components.findIndex((item) => item.componentType === TYP_COP_2);

      const test = {};
      test['PRODUCT'] = product.product;
      test['PANELORIENTATION'] = design.panelOrientation;

      /*       const floorFinish = ( (design.components.find(item => item.componentType===TYP_CAR_FLOORING) || {}).finish || null )
      const finish = (product.finishes || []).find(item => item.id === floorFinish)
      if(finish === undefined) {
        test['FLOOR_MATERIAL'] = ''
      } else {
        const { materials=[] } = finish;
        test['FLOOR_MATERIAL'] = (product.finishMaterials.find(({ id, types=[] }) => (types.indexOf(MAT_CAR_FLOORING) !== -1 && materials.indexOf(id) !== -1)) || {}).id 
      } */
      test['COP1'] = (design.components.find((item) => item.componentType === TYP_COP_PRODUCT_1) || {}).component || null;
      test['COP2'] = (design.components.find((item) => item.componentType === TYP_COP_2) || {}).component || null;
      test['COP1_POS'] = ((design.components.find((item) => item.componentType === TYP_COP_PRODUCT_1) || {}).positions || []).join();
      test['COP2_POS'] = ((design.components.find((item) => item.componentType === TYP_COP_2) || {}).positions || []).join();
      test['DECO'] = (design.components.find((item) => item.componentType === TYP_CAR_WALL_ADD_DECO_PACKAGE) || {}).component || 'none';
      test['MIRROR_POS'] = (design.components.find((item) => item.componentType === TYP_CAR_MIRROR) || {}).positions || [];
      test['BUFFER_POS'] = (design.components.find((item) => item.componentType === TYP_CAR_BUFFER_RAIL) || {}).positions || [];
      test['HANDRAIL_POS'] = (design.components.find((item) => item.componentType === TYP_CAR_HANDRAIL) || {}).positions || [];
      test['SCENIC'] = (design.components.find((item) => item.componentType === TYP_CAR_GLASS_WALL_C) || {}).positions || [];
      test['SCENICTYPE'] = (design.components.find((item) => item.componentType === TYP_CAR_GLASS_WALL_C) || {}).component || 'none';

      let newDisabledPositions = jsonLogic.apply(product.rules.seatPositions, test);
      if (design.components[seatIndex].positions) {
        let seatPositions = (design.components[seatIndex].positions || []).join();
        newDisabledPositions = _.union(newDisabledPositions, design.components[cop1Index].positions);
        if (cop2Index !== -1) {
          newDisabledPositions = _.union(newDisabledPositions, design.components[cop2Index].positions);
        }

        if (newDisabledPositions.indexOf(seatPositions) !== -1) {
          let newPosition =
            ['B1', 'BX', 'B2', 'D1', 'DX', 'D2', 'C1', 'C2'].find((item) => newDisabledPositions.indexOf(item) === -1) || null;
          if (newPosition) {
            design.components[seatIndex].positions = [newPosition];
          } else {
            toBeRemoved.push(TYP_CAR_SEAT);
          }
        }
      }
    }
  }

  /////////////////////////////////////////
  // Tenant directory
  /////////////////////////////////////////
  const tdIndex = design.components.findIndex((item) => item.componentType === TYP_CAR_TENANT_DIRECTORY);
  if (tdIndex !== -1) {
    const cop1Index = design.components.findIndex((item) => item.componentType === TYP_COP_PRODUCT_1);
    const cop1Pos = cop1Index !== -1 ? design.components[cop1Index].positions : [];
    if (product && product.rules && product.rules.tenantDirectory) {
      const tdPosition = jsonLogic.apply(product.rules.tenantDirectory, {
        COP1POS: cop1Pos.join(''),
        SCENIC: (design.components.find((item) => item.componentType === TYP_CAR_GLASS_WALL_C) || {}).positions || [],
      });
      if (tdPosition.includes('remove')) {
        toBeRemoved.push(TYP_CAR_TENANT_DIRECTORY);
      } else {
        design.components[tdIndex].positions = tdPosition || ['B2'];
      }
    }
  }


  /////////////////////////////////////////
  // Air purifier
  /////////////////////////////////////////
  if ( design?.services && design?.services?.indexOf(KCSM_AIR_PURIFIER) !== -1) {    
    const airPurifierIndex = design.services.indexOf(KCSM_AIR_PURIFIER)
    if (product?.rules?.accessoriesEdit && ceilingIndex !== -1 ) {
      const accessoriesRules = jsonLogic.apply(product.rules.accessoriesEdit, {
        CEILING: design.components[ceilingIndex].component
      });
      const disabledItems = accessoriesRules[1];
      
      if (disabledItems.indexOf(KCSM_AIR_PURIFIER) !== -1) {
        design.services.splice(airPurifierIndex,1)
      }
      
    }
  }

  /////////////////////////////////////////
  // check corner pieces
  /////////////////////////////////////////
  if (product?.rules?.variousFilteringRules) {
    const cop1 = design.components.find((item) => item.componentType === TYP_COP_PRODUCT_1) || {};
    const mirror = design.components.find((item) => item.componentType === TYP_CAR_MIRROR) || {};
    const handrail = design.components.find((item) => item.componentType === TYP_CAR_HANDRAIL) || {};
    const cWall = wallCIndex !== -1 ? design.components[wallCIndex] : {};
    const bWall = wallBIndex !== -1 ? design.components[wallBIndex] : {};
    const dWall = wallDIndex !== -1 ? design.components[wallDIndex] : {};
    const wallCParts = cWall?.parts || [];
    const wallBParts = bWall?.parts || [];
    const wallDParts = dWall?.parts || [];
    const shape = CAR_SHAPES.find((item) => item.id === design.carShape);

    let cFinish = cWall?.finish;
    if (wallCParts.length > 0) {
      const partFinish = cWall?.parts?.[0]?.finish;
      let allTheSame = true;
      cWall.parts.forEach((part) => {
        if (part.finish !== partFinish) allTheSame = false;
      });
      if (allTheSame) {
        cFinish = partFinish;
      }
    }
    let bFinish = bWall?.finish;
    if (wallBParts.length > 0) {
      const partFinish = bWall?.parts?.[0]?.finish;
      let allTheSame = true;
      bWall.parts.forEach((part) => {
        if (part.finish !== partFinish) allTheSame = false;
      });
      if (allTheSame) {
        bFinish = partFinish;
      }
    }
    let dFinish = dWall?.finish;
    if (wallDParts.length > 0) {
      const partFinish = dWall?.parts?.[0]?.finish;
      let allTheSame = true;
      dWall.parts.forEach((part) => {
        if (part.finish !== partFinish) allTheSame = false;
      });
      if (allTheSame) {
        dFinish = partFinish;
      }
    }

    const cornerTest = {
      filteringRULE: 'cornerWallPiece',
      PRODUCT: product?.product,
      CARTYPE: design?.carType,
      C_PARTS: 3, //wallCParts.length,
      SIDE_PARTS: 2, //wallBParts.length,
      WIDTH: shape?.width,
      DEPTH: shape?.depth,
      CFINISH: cFinish,
      BFINISH: bFinish,
      DFINISH: dFinish,
      MIRROR: mirror.component || null,
      MIRROR_POS: mirror.positions || [],
      HANDRAIL: handrail.component || null,
      HANDRAIL_POS: handrail.positions || [],
      COP: cop1?.component,
      COP_POS: cop1?.positions || [],
    };

    const cornerPieceAvailable = jsonLogic.apply(product.rules.variousFilteringRules, cornerTest);

    if (cornerPieceAvailable) {
      if (wallCParts.length < 3) {
        design.components[wallCIndex].parts = [
          { type: CAR_WALL_STRUCTURE_C1, finish: cFinish },
          { type: CAR_WALL_STRUCTURE_CX, finish: cFinish },
          { type: CAR_WALL_STRUCTURE_C2, finish: cFinish },
        ];
        design.components[wallCIndex].treatAsTwo = false;
      }

      if (wallBParts.length > 0) {
        delete design.components[wallBIndex].parts;
        design.components[wallBIndex].finish = cFinish;
        design.components[wallBIndex].treatAsTwo = false;
      }
      if (wallDParts.length > 0) {
        delete design.components[wallDIndex].parts;
        design.components[wallDIndex].finish = cFinish;
        design.components[wallDIndex].treatAsTwo = false;
      }
    }
    // console.log({cornerPieceAvailable,cornerTest,state:options.cornerPieces, wallBIndex, bWall})
    if (options.setCornerPieces && options.cornerPieces !== cornerPieceAvailable) {
      options.setCornerPieces(cornerPieceAvailable);
      if (cornerPieceAvailable) {
        options.addToast &&
          options.getText &&
          options.addToast({ message: options.getText('ui-dialog-paneling-changed-to-corner-pieces'), type: 'info', autoDismiss: 4000 });
      }
    }
  }

  /////////////////////////////////////////
  // regulations
  /////////////////////////////////////////
  if (design.regulations && design.regulations.length > 0 && !(design.ktoc && !options.onEditPage)) {
    if (design.regulations.indexOf('EN81-70') !== -1) {
      const cop1Index = design.components.findIndex((item) => item.componentType === TYP_COP_PRODUCT_1);
      const cop2Index = design.components.findIndex((item) => item.componentType === TYP_COP_2);
      const cwallIndex = design.components.findIndex((item) => item.componentType === TYP_CAR_WALL_C);
      const doorIndex = design.components.findIndex((item) => item.componentType === TYP_DOOR_A);
      const decoIndex = design.components.findIndex((item) => item.componentType === TYP_CAR_WALL_ADD_DECO_PACKAGE);
      const handrailIndex = design.components.findIndex((item) => item.componentType === TYP_CAR_HANDRAIL);
      const seatIndex = design.components.findIndex((item) => item.componentType === TYP_CAR_SEAT);
      const mirrorIndex = design.components.findIndex((item) => item.componentType === TYP_CAR_MIRROR);
      const dopIndex = design.components.findIndex((item) => item.componentType === TYP_DOP_PRODUCT);
      const ceilingIndex = design.components.findIndex((item) => item.componentType === TYP_CAR_CEILING);

      let cWallMaterial = null;
      if (cwallIndex !== -1) {
        const wallCMaterial =
          product.componentsData.walls.materials.find((item) => {
            return item.finishes.find((fItem) => fItem.id === design.components[cwallIndex].finish);
          }) || {};
        cWallMaterial = wallCMaterial.id;
      }

      if (product.rules && product.rules.en81_70) {
        let cop1Wall = '';
        if (cop1Index !== -1) {
          if ((design.components[cop1Index].positions || []).join('').indexOf('B') !== -1) {
            cop1Wall = 'B';
          } else {
            cop1Wall = 'D';
          }
        }

        let cop2Wall = '';
        if (cop2Index !== -1 && design.components[cop2Index].positions) {
          if ((design.components[cop2Index].positions || []).join('').indexOf('B') !== -1) {
            cop2Wall = 'B';
          } else {
            cop2Wall = 'D';
          }
        }

        const test = {};

        test['PRODUCT'] = product.product;
        test['CARTYPE'] = design.carType;
        test['CARSHAPE'] = design.carShape;
        test['C_FINISH'] = cwallIndex !== -1 ? design.components[cwallIndex].finish : '';
        test['CWALL_MAT'] = (cWallMaterial || {}).id;
        test['DOOR_FINISH'] = design.components[doorIndex].finish;
        test['COP1_WALL'] = cop1Wall;
        test['COP2_WALL'] = cop2Wall;
        test['COP1_POS'] = (design.components[cop1Index].positions || []).join('');
        test['COP2_POS'] = cop2Index !== -1 ? (design.components[cop2Index].positions || []).join('') : '';
        test['MIRROR_POS'] = mirrorIndex !== -1 ? (design.components[mirrorIndex].positions || []).join('') : '';
        test['DECO'] = decoIndex !== -1 ? design.components[decoIndex].component : '';
        test['SEAT_POS'] = seatIndex !== -1 ? (design.components[seatIndex].positions || []).join('') : '';
        test['HR'] = handrailIndex !== -1 ? design.components[handrailIndex].component : '';
        test['CEILING'] = ceilingIndex !== -1 ? design.components[ceilingIndex].component : '';
        test["AWALL_FINISH"] = wallAIndex !== -1 ? design.components[wallAIndex].finish : '';
        test["BWALL_FINISH"] = wallBIndex !== -1 ? design.components[wallBIndex].finish : '';
        test["CWALL_FINISH"] = wallCIndex !== -1 ? design.components[wallCIndex].finish : '';
        test["DWALL_FINISH"] = wallDIndex !== -1 ? design.components[wallDIndex].finish : '';

        const regulationAddReplaceRemove = jsonLogic.apply(product.rules.en81_70, test);

        const regulationAdd = regulationAddReplaceRemove[0];
        const regulationReplace = regulationAddReplaceRemove[1];
        const regulationRemove = regulationAddReplaceRemove[2];

        // [component type, component, finish, position]
        regulationAdd.forEach((item) => {
          if (item !== null) {
            const compIndex = design.components.findIndex((comp) => comp.componentType === item[0]);
            if (compIndex !== -1) {
              // something is marked to be removed but is needed anyway
              let wasToBeRemoved = false;
              if (toBeRemoved.indexOf(item[0]) !== -1) {
                wasToBeRemoved = true;
                toBeRemoved = toBeRemoved.filter((removeItem) => removeItem !== item[0]);
              }

              if (item[1] !== '') {
                design.components[compIndex].component = item[1];
              }
              if (item[2] !== '') {
                design.components[compIndex].finish = item[2];
              }
              if (item[3] !== '') {
                if (design.components[compIndex].positions.indexOf(item[3]) === -1) {
                  // something is marked to be removed previously but need to be there afterall
                  wasToBeRemoved
                    ? (design.components[compIndex].positions = [...item[3]])
                    : (design.components[compIndex].positions = [...design.components[compIndex].positions, ...item[3]]);
                }
              }
            } else {
              // TODO: should be somehow taken from componentsData !!!!
              const defaultComp = (product.components || []).find((comp) => !comp.disabled && comp.type === item[0]);
              if (defaultComp) {
                let newComponent = { componentType: item[0], component: defaultComp.id };
                if (item[1] !== '') {
                  newComponent.component = item[1];
                }
                if (item[2] !== '') {
                  newComponent = {
                    ...newComponent,
                    finishType: defaultComp.finishingTypes[0],
                    finish: item[2],
                  };
                } else {
                  const defaultFinish = (product.finishes || []).find(
                    (finish) => (finish.types || []).indexOf(defaultComp.finishingTypes[0]) !== -1
                  );
                  if (defaultFinish) {
                    newComponent = {
                      ...newComponent,
                      finishType: defaultComp.finishingTypes[0],
                      finish: defaultFinish.sapId,
                    };
                  }
                }
                if (item[3] !== '') {
                  newComponent = {
                    ...newComponent,
                    positions: [...item[3]],
                  };
                }
                design.components.push(newComponent);
              }
            }
          }
        });

        regulationReplace.forEach((item) => {
          if (item !== null) {
            const compIndex = design.components.findIndex((comp) => comp.componentType === item[0]);
            if (compIndex !== -1) {
              if (item[1] !== '') {
                if (typeof item[1] === 'string') {
                  design.components[compIndex].component = item[1];
                } else {
                  const compareItems = product.componentsData[item[3]]
                  const correctComponent = compareItems.find(comp => {
                    const thisIsIt = item[1].find(item => item === comp.id)
                    return (thisIsIt ?true :false)
                  })
                  design.components[compIndex].component = correctComponent.id
                }
              }
              if (item[2] !== '') {
                design.components[compIndex].positions = item[2];
              }
            }
          }
        });

        regulationRemove.forEach((item) => {
          if (item !== null) {
            const compIndex = design.components.findIndex((comp) => comp.componentType === item[0]);
            if (compIndex !== -1) {
              if (item[1] === '') {
                design.components.splice(compIndex, 1);
              } else {
                design.components[compIndex].positions = design.components[compIndex].positions.filter((pos) => pos !== item[1]);
              }
            }
          }
        });
      }

      if (dopIndex !== -1) {
        if (product?.rules?.variousFilteringRules) {
          if (
            jsonLogic.apply(product.rules.variousFilteringRules, {
              filteringRULE: 'en81-70DopFilter',
              DOP: design.components[dopIndex].component,
              REGULATIONS: design.regulations,
            })
          ) {
            const signalizationFamily = (
              product.componentsData.signalization.copModels.find((item) => {
                return item.copTypes.find((copType) => copType.id === design.components[cop1Index].component);
              }) || {}
            ).id;
            const signalizationFamilyItems =
              product.componentsData.signalization.copModels.find((item) => item.id === signalizationFamily) || {};

            if (signalizationFamilyItems) {
              const firstAvailableDop = signalizationFamilyItems.destinationOP.find((item) => {
                return !jsonLogic.apply(product.rules.variousFilteringRules, {
                  filteringRULE: 'en81-70DopFilter',
                  DOP: item.id,
                  REGULATIONS: design.regulations,
                });
              });

              if (firstAvailableDop) {
                design.components[dopIndex].component = firstAvailableDop.id;
              }
            }
          }
        }
      }
    }
  }

  // Only need to check this when setting the design for the first time.
  // After that the UI should not allow for invalid paneling to be set.
  if (options.initial) {
    forceValidPaneling(product, design);
  }

  design = {
    ...design,
    components: design.components.filter((item) => {
      return toBeRemoved.indexOf(item.componentType) === -1;
    }),
  };

  // Setting the original regulation state back so the
  // checkbox toggles correctly (even if it does nothing)
  if (design.ktoc && !options.onEditPage) {
    design.regulations = originalRegulations;
  }
  // console.log('After rules: ',{design})

  return design;
};

function forceValidPaneling(product, design) {
  if (design.ktoc) return;

  const { setWallPanelingStyle } = createPanelingUtils({ product, design });

  const sideWallPanels = product.componentsData.walls.sideWallPanels;
  // Only one paneling option available, use that
  if (sideWallPanels?.length === 1) {
    const panelingStyleToForce = sideWallPanels[0].id;

    setWallPanelingStyle({ finishType: MAT_CAR_WALL_FINISH_B, panelingStyle: panelingStyleToForce });
    setWallPanelingStyle({ finishType: MAT_CAR_WALL_FINISH_D, panelingStyle: panelingStyleToForce });
  }
}

function getWallFinishMaterial(materials) {
  if (!materials?.length) return;
  const candidate = materials[0];

  // If both applied laminates and raised laminates are possible, initially default to raised laminates
  // so horizontal paneling is possible for predesigns that have it defined.
  if (candidate === 'APPLIEDLAMINATES' && materials.includes('RAISEDLAMINATES')) {
    return 'RAISEDLAMINATES';
  }

  return candidate;
}

function getPartsMaterials(product, parts) {
  let retVal = [];
  parts.forEach((part) => {
    const material =
      product.componentsData.walls.materials.find((item) => {
        return item.finishes.find((fItem) => fItem.id === part.finish);
      }) || {};

    retVal.push(material.id);
  });
  return retVal;
}

export default applyRules;
