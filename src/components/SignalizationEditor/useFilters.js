import { useContext, useMemo } from 'react';
import jsonLogic from 'json-logic-js';

import { ProductContext } from '../../store/product';
import { DesignContext } from '../../store/design';
import { OfferingContext } from '../../store/offering';
import { TYP_LCS_PRODUCT, TYP_LDO_FRAME_FRONT, TYP_DOOR_A, TYP_CAR_CEILING,
  TYP_CAR_WALL_B,
  MAT_COP_FACE_PLATE_1,
  TYP_DIN_PRODUCT,
  TYP_EID_PRODUCT,
  TYP_DOP_PRODUCT,
  TYP_HI_PRODUCT,
  TYP_HL_PRODUCT,
  TYP_COP_HORIZONTAL,
  TYP_CAR_GLASS_WALL_C,
  TYP_COP_PRODUCT_1, } from '../../constants'
import { SignalizationContext } from './provider/SignalizationEditorProvider';

/**
 * If only 'off' option remains, remove it
 * @param {*} list 
 */
function removeLoneOff(list) {
  if (list?.length === 1 && list[0].id === 'off') return []
  return list
}

/* 
  Using a custom hook instead of a normal utility file to have access
  to contexts easily.
*/
export default function useFilters(component, currentFamily, horizontalCop) {
  const productCtx = useContext(ProductContext)
  // const { product, getComponent:getComponentFromProduct } = productCtx
  const { product } = productCtx

  const designCtx = useContext(DesignContext)
  const { design } = designCtx

  const offeringCtx = useContext(OfferingContext)

  const { hiId, hlId, lcsId, dopId, eidId, dinId, } = useContext(SignalizationContext)

  const componentFamilyData = useMemo(() => {
    if (!product) return
    return product.componentsData.signalization.copModels.find(x => x.id === currentFamily) 
  }, [product, currentFamily])
  
  function getFilteredCOPs() {
    if (!componentFamilyData) return []

    return componentFamilyData.copTypes
      .filter(item => {
        if(product.rules?.signalizationModel) {
          let test={}
          test["CEILING"] = designCtx.getComponent({type:TYP_CAR_CEILING}) || "";
          test["COP"] = item.id
          test["PRODUCT"] = product.product
          test["CAR_SHAPE"] = design.carShape
          test["PARTS"] = ((design.components.find(designItem => designItem.componentType === TYP_CAR_WALL_B) || {}).parts || []).length
          const result = jsonLogic.apply(product.rules.signalizationModel, test)

          if (!result) return false
        }

        return true
      })
      
    // TODO: remove COP:s when tricolor side wall enabled
  }
  
  function getFilteredLCSs() {
    if (!componentFamilyData) return []
    
    const result = componentFamilyData.callStationTypes.filter(item => {
      if(product.rules?.signalizationLandingExceptions) {
        const exceptionResult = jsonLogic.apply(product.rules.signalizationLandingExceptions, {
          PRODUCT: product.id, 
          COP: component, 
          LCS: item.id
        })
  
        if (!exceptionResult) return false
      }
  
      if (product?.rules?.signalizationLandingExceptions) {
      
        const test = {
          TESTING: 'forceToAddKSL710',
          PRODUCT_NAME: product.id,
          HORCOP: designCtx.getComponent({ type: TYP_COP_HORIZONTAL }),
          LCS: item.id,
        }
        const doNotAddKsl710 = jsonLogic.apply(product.rules.signalizationLandingExceptions, test)

        if (doNotAddKsl710) return false

      }


      if (!product.rules?.signalizationSeries) return true
  
      const test = {
        DOOR: designCtx.getComponent({ type: TYP_DOOR_A }),
        FRAME: designCtx.getComponent({ type: TYP_LDO_FRAME_FRONT }),
        COUNTRY: offeringCtx.countryCode || null,
        LCS: item.id,
      }
      const result = jsonLogic.apply(product.rules.signalizationSeries, test)
      const positionResults = result[1] || []
      const lcsResult = (positionResults || []).find(res => {
        if(!res) return false
        return res[0] === TYP_LCS_PRODUCT
      })
      if(lcsResult && lcsResult.length>1 && Array.isArray(lcsResult[1]) ) {
        if(lcsResult[1].length>0) {
          return true
        } else {
          return false
        }
      } else {
        return false
      }
    });    

    return removeLoneOff(result)
  }

  function getFilteredFBs() {
    if (!componentFamilyData) return []

    const result = componentFamilyData?.footButtons?.filter(item => {
      if (product.rules?.signalizationLandingExceptions) {
        const exceptionResult = jsonLogic.apply(product.rules.signalizationLandingExceptions, {
          PRODUCT: product.id, 
          COP: component, 
          FB: item.id
        })

        if (!exceptionResult) return false
      }

      return true
    })

    return removeLoneOff(result)
  }

  function getFilteredHIs() {
    if (!componentFamilyData) return []
    if (!componentFamilyData.realHallIndicators) return []

    const result = componentFamilyData.realHallIndicators.filter((item) => {
      if (product.rules?.signalizationLandingExceptions) {
        const exceptionResult = jsonLogic.apply(product.rules.signalizationLandingExceptions, {
          PRODUCT: product.id, 
          COP: component, 
          HL: item.id
        })

        if (!exceptionResult) return false
      }

      const test = {
        DOOR: designCtx.getComponent({ type: TYP_DOOR_A }),
        FRAME: designCtx.getComponent({ type: TYP_LDO_FRAME_FRONT }),
        COUNTRY: offeringCtx.countryCode || null,
        HI: item.id,
      }
      const result = jsonLogic.apply(product.rules.signalizationSeries, test)
      const positionResults = result[1] || []
      const hiResult = (positionResults || []).find(res => {
        if(!res) return false
        return res[0] === TYP_HI_PRODUCT
      })
      if(hiResult && hiResult.length>1 && Array.isArray(hiResult[1]) ) {
        if(hiResult[1].length>0) {
          return true
        } else {
          return false
        }
      } else {
        return false
      }

    })

    return removeLoneOff(result)
  }

  function getFilteredHLs() {
    if (!componentFamilyData) return []
    const result = componentFamilyData.hallIndicators.filter((item) => {
      if (product.rules?.signalizationLandingExceptions) {
        const exceptionResult = jsonLogic.apply(product.rules.signalizationLandingExceptions, {
          PRODUCT: product.id, 
          COP: component, 
          HL: item.id
        })

        if (!exceptionResult) return false
      }

      const test = {
        DOOR: designCtx.getComponent({ type: TYP_DOOR_A }),
        FRAME: designCtx.getComponent({ type: TYP_LDO_FRAME_FRONT }),
        COUNTRY: offeringCtx.countryCode || null,
        HL: item.id,
      }
      const result = jsonLogic.apply(product.rules.signalizationSeries, test)
      const positionResults = result[1] || []
      const hlResult = (positionResults || []).find(res => {
        if(!res) return false
        return res[0] === TYP_HL_PRODUCT
      })
      if(hlResult && hlResult.length>1 && Array.isArray(hlResult[1]) ) {
        if(hlResult[1].length>0) {
          return true
        } else {
          return false
        }
      } else {
        return false
      }

    })

    return removeLoneOff(result)
  }

  function getFilteredHIFinishes(hiId) {
    if (!componentFamilyData || !hiId) return []
    if (!componentFamilyData.realHallIndicators) return []

    const model = componentFamilyData.realHallIndicators.find(x => x.id === hiId)

    if (model?.finishes) {
      return model.finishes.map(finish => {
        return {
          ...finish,
          sapId: finish.sapId.replace('MAT_D_', '')
        }
      })
    }
    
    return []
  }

  function getFilteredHLFinishes(hlId) {
    if (!componentFamilyData || !hlId) return []

    const model = componentFamilyData.hallIndicators.find(x => x.id === hlId)

    if (model?.finishes) {
      return model.finishes.map(finish => {
        return {
          ...finish,
          sapId: finish.sapId.replace('MAT_D_', '')
        }
      })
    }
    
    return []
  }

  function getFilteredLcsFinishes(lcsId, finishes) {

    if (!product?.rules?.signalizationFinishes) return finishes

    if (finishes.length < 1) return finishes

    const lcsItem = componentFamilyData?.callStationTypes?.find(item => item.id === lcsId)
    if( lcsItem?.finishes?.length > 0 ) return lcsItem.finishes

    const filteredFinishes = finishes.filter( item => {
      return jsonLogic.apply(product.rules.signalizationFinishes, {
        LCS: lcsId,
        PRODUCT: product.product,
        FINISH: item.sapId
      })
    })

    if (filteredFinishes.length < 1) return finishes

    return filteredFinishes

  }

  function getFilteredEIDs() {
    if (!componentFamilyData) return []
    const result = componentFamilyData.elevatorIdentifier

    return removeLoneOff(result)
  }

  function getFilteredDOPs() {
    if (!componentFamilyData) return []
    const result = componentFamilyData.destinationOP

    let filteredResult = result
    if(product?.rules?.variousFilteringRules) {
      filteredResult = result.filter( item => {
        // response is false if DOP is included
        return !jsonLogic.apply(product.rules.variousFilteringRules, {filteringRULE:'en81-70DopFilter', DOP:item.id, REGULATIONS:(design?.regulations || [])})
      })
    }

    return removeLoneOff(filteredResult)
  }
  function getFilteredDOPFinishes(dopId) {
    if (!componentFamilyData || !dopId) return []

    const model = componentFamilyData.destinationOP.find(x => x.id === dopId)

    if (model?.finishes) {
      return model.finishes.map(finish => {
        return {
          ...finish,
          sapId: finish.sapId.replace('MAT_D_', '')
        }
      })
    }
    
    return []
  }

  function getFilteredDINs() {
    if (!componentFamilyData) return []
    const result = componentFamilyData.landingDestIndicator

    return removeLoneOff(result)
  }

  function getFilteredComponentFamilies() {
    if (!product) return []
    
    const result = product.componentsData.signalization.copModels.filter(family => {
      if (family.copTypes.length === 0) return false

      const validCops = family.copTypes.filter(item => {
        // CHECK how is this any different from the logic of getFilteredCOPs()?
        // Could it be possible to only use one or the other?
        if (product.rules.signalizationModel) {
          let test={}
          test["CEILING"] = designCtx.getComponent({ type:TYP_CAR_CEILING }) || '';
          test["COP"] = item.id
          test["CAR_SHAPE"] = design.carShape
          test["PRODUCT"] = product.product
          test["PARTS"] = ((design.components.find(item => item.componentType === TYP_CAR_WALL_B) || {}).parts || []).length
          test["REGULATIONS"] = design.regulations || []
          test["SIG_FAMILY"] = family.id
          test["SIDEWALL_MATERIAL"] = ((productCtx.getFinish({id: (design.components.find(item => item.componentType === TYP_CAR_WALL_B) || {}).finish}) || {}).materials || [])
          return jsonLogic.apply(product.rules.signalizationModel, test)
        }

        return true
      })

      return validCops.length > 0
    })

    return result
  }

  function getFilteredHorizontalCops() {
    if (!product?.rules || !design) return []

    const handicapCops = product.componentsData.signalization.horizontalCops?.filter(item => {
      let test={}
      test['PRODUCT'] = product.product;
      test['CARTYPE'] = design.carType;
      test['HORCOP'] = item.id;
      test['SIG_FAMILY'] = currentFamily;
      // console.log({test,res:jsonLogic.apply(product.rules.handicapCopModels, test)})
      return jsonLogic.apply(product.rules.handicapCopModels, test) && item.disabled !== false
    })
    return handicapCops || []
  }

  function getFilteredHorizontalCopFinishes() {
    if (!product || !horizontalCop || !currentFamily) return []

    // TODO use components data?

    const signalizationFinishes = productCtx.getFinishes({ type: MAT_COP_FACE_PLATE_1 })
    
    const result = signalizationFinishes.filter( item=> {      
      const test = {
        TYP_COP_PRODUCT_1: horizontalCop,
        FINISH: item.id,
        FAMILY: currentFamily
      }
      return jsonLogic.apply(product.rules.signalizationFinishes, test)
    })

    return result
  }

  function getFilteredHorizontalCopPositions() {
    if (!product || !currentFamily) return []

    // TODO use components data?

    const glassWallPositions = designCtx.getPositions({ type: TYP_CAR_GLASS_WALL_C }) || []
    
    const test = {
      OFFERING: product.offeringLocation,
      SCENIC_POS: glassWallPositions,
      COP1_POS: (designCtx.getPositions({ type: TYP_COP_PRODUCT_1 }) || []).join(''),
      COP2_POS: (designCtx.getPositions({ type: TYP_COP_PRODUCT_1 }) || []).join(''),
    }
    const horCopPositions = jsonLogic.apply(product.rules.signalizationHorizontal, test)

    return horCopPositions[5].filter(n=>n) || ['B','D']
  }

  function getFilteredJAMBPositions() {
    if (!product) return []

    const componentPositionsData = product.componentsData.signalization.landingComponentPositions

    return componentPositionsData.jamb.map(x => x.id)
  }

  function getFilteredLandingPositions() {
    if (!product) return []

    const test = {
      DOOR: designCtx.getComponent({ type: TYP_DOOR_A }),
      FRAME: designCtx.getComponent({ type: TYP_LDO_FRAME_FRONT }),
      COUNTRY: offeringCtx.countryCode || null,
      OFFERING: product.offeringLocation,
      HL: hlId,
      LCS: lcsId,
      DOP: dopId,
      EID: eidId,
      DIN: dinId
    }

    const result = jsonLogic.apply(product.rules.signalizationSeries, test)
    const positionsByComponentType = {}

    // parse result
    if (result && result[1] && Array.isArray(result[1])) {
      for (const item of result[1]) {
        if (item && Array.isArray(item)) {
          const [ componentType, positions ] = item;
          positionsByComponentType[componentType] = positions;          
        }
      }
    }

    const componentPositionsData = product.componentsData.signalization.landingComponentPositions

    // Position data that is set in the frontline manager.

    const availableHIPos = componentPositionsData.hi.map(x => x.id)
    const availableHLPos = componentPositionsData.hl.map(x => x.id)
    const availableLCSPos = componentPositionsData.lcs.map(x => x.id)
    const availableDOPPos = componentPositionsData.dop.map(x => x.id)
    const availableDINPos = componentPositionsData.din.map(x => x.id)
    const availableEIDPos = componentPositionsData.eid.map(x => x.id)

    const enabledPositions = []
    
    if (hiId && hiId !== 'off' && Array.isArray(positionsByComponentType[TYP_HI_PRODUCT])) {
      positionsByComponentType[TYP_HI_PRODUCT].forEach(id => {
        if (availableHIPos.includes(id)) {
          enabledPositions.push(id)
        }
      })
    }

    if (hlId && hlId !== 'off' && Array.isArray(positionsByComponentType[TYP_HL_PRODUCT])) {
      positionsByComponentType[TYP_HL_PRODUCT].forEach(id => {
        if (availableHLPos.includes(id)) {
          enabledPositions.push(id)
        }
      })
    }

    if (lcsId && Array.isArray(positionsByComponentType[TYP_LCS_PRODUCT])) {
      positionsByComponentType[TYP_LCS_PRODUCT].forEach(id => {
        if (availableLCSPos.includes(id)) {
          enabledPositions.push(id)
        }
      })
    }
    
    if (dopId && Array.isArray(positionsByComponentType[TYP_DOP_PRODUCT])) {
      positionsByComponentType[TYP_DOP_PRODUCT].forEach(id => {
        if (availableDOPPos.includes(id)) {
          enabledPositions.push(id)
        }
      })
    }
    
    if (dinId && Array.isArray(positionsByComponentType[TYP_DIN_PRODUCT])) {
      positionsByComponentType[TYP_DIN_PRODUCT].forEach(id => {
        if (availableDINPos.includes(id)) {
          enabledPositions.push(id)
        }
      })
    }
    
    if (eidId && Array.isArray(positionsByComponentType[TYP_EID_PRODUCT])) {
      positionsByComponentType[TYP_EID_PRODUCT].forEach(id => {
        if (availableEIDPos.includes(id)) {
          enabledPositions.push(id)
        }
      })
    }

    return enabledPositions
  }

  function getFilteredJAMBs() {
    // const result = productCtx.getComponents({ type: TYP_CDL_PRODUCT })
    if (!componentFamilyData) return []
    const result = componentFamilyData.jambIndicators

    if (result.length > 0 && !result.find( item => item.id === 'off')) {
      result.push({ id: 'off', name: 'ui-general-not-selected' })
    }

    return result
  }

  return {
    getFilteredCOPs,
    getFilteredLCSs,
    getFilteredFBs,
    getFilteredHIs,
    getFilteredHIFinishes,
    getFilteredHLs,
    getFilteredHLFinishes,
    getFilteredLcsFinishes,
    getFilteredEIDs,
    getFilteredDOPs,
    getFilteredDOPFinishes,
    getFilteredDINs,
    getFilteredComponentFamilies,
    getFilteredHorizontalCops,
    getFilteredHorizontalCopFinishes,
    getFilteredHorizontalCopPositions,
    getFilteredLandingPositions,
    getFilteredJAMBs,
    getFilteredJAMBPositions
  }
}