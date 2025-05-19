import React, { useState } from 'react';
import { TYP_COP_2, TYP_COP_DISPLAY, TYP_COP_HORIZONTAL, TYP_COP_PRODUCT_1, TYP_DIN_PRODUCT, TYP_DOP_PRODUCT, TYP_EID_PRODUCT, TYP_FB, TYP_HI_PRODUCT, TYP_HL_PRODUCT,
  TYP_LCS_PRODUCT, TYP_DIN_DISPLAY, TYP_DOP_DISPLAY, TYP_HI_DISPLAY, TYP_HL_DISPLAY, TYP_LCI_DISPLAY, TYP_CDL_PRODUCT } from '../../../constants';
import { usePosition, useComponent, usePart, usePositions } from '../cop-hooks'

export const SignalizationContext = React.createContext();

/**
 * Provider for shared states between signalization editor components
 */
export const SignalizationProvider = ({ children }) => {
  const [ currentFamily, setCurrentFamily ] = useState()
  const [ firstCopId, setFirstCop ] = useComponent(TYP_COP_PRODUCT_1)
  const [ secondCopId, setSecondCop ] = useComponent(TYP_COP_2)
  const [ horizontalCopId, setHorizontalCop ] = useComponent(TYP_COP_HORIZONTAL)

  const [ firstCopPosition, setFirstCopPosition ] = usePosition(TYP_COP_PRODUCT_1)


  // 'Item' (e.g. 'hlItem') is the definition in the product.components
  // No 'Item' (e.g. 'hl') is the component data in the design.components
  const [ hiId, setHi, hi, hiItem ] = useComponent(TYP_HI_PRODUCT, true, true)
  const [ hlId, setHl, hl, hlItem ] = useComponent(TYP_HL_PRODUCT, true, true)
  const [ lcsId, setLcs, lcs, lcsItem ] = useComponent(TYP_LCS_PRODUCT, true, true)
  const [ fbId, setFb, fb, fbItem ] = useComponent(TYP_FB, true)
  const [ eidId, setEid, eid, eidItem ] = useComponent(TYP_EID_PRODUCT, true, true)
  const [ dopId, setDop, dop, dopItem ] = useComponent(TYP_DOP_PRODUCT, true, true)
  const [ dinId, setDin, din, dinItem ] = useComponent(TYP_DIN_PRODUCT, true, true)
  const [ jambId, setJamb, jamb, jambItem ] = useComponent(TYP_CDL_PRODUCT, true)

  // Only one possible position at once
  const [ secondCopPosition, setSecondCopPosition ] = usePosition(TYP_COP_2)
  const [ horizontalCopPosition, setHorizontalCopPosition ] = usePosition(TYP_COP_HORIZONTAL)
  const [ hiPosition, setHiPosition ] = usePosition(TYP_HI_PRODUCT)
  const [ hlPosition, setHlPosition ] = usePosition(TYP_HL_PRODUCT)
  const [ lcsPosition, setLcsPosition ] = usePosition(TYP_LCS_PRODUCT)
  const [ dopPosition, setDopPosition ] = usePosition(TYP_DOP_PRODUCT)
  const [ dinPosition, setDinPosition ] = usePosition(TYP_DIN_PRODUCT)
  const [ eidPosition, setEidPosition ] = usePosition(TYP_EID_PRODUCT)

  // Can have several positions at once
  const [ jambPositions, setJambPositions ] = usePositions(TYP_CDL_PRODUCT)

  const [ numOfCops, setNumOfCops ] = useState()
 
  const [ 
    copDisplayType, copDisplayColor, setCopDisplayType, setCopDisplayColor 
  ] = usePart({ componentType: TYP_COP_PRODUCT_1, partType: TYP_COP_DISPLAY })

  const [
    hiDisplayType, hiDisplayColor, setHiDisplayType, setHiDisplayColor
  ] = usePart({ componentType: TYP_HI_PRODUCT, partType: TYP_HI_DISPLAY })

  const [
    hlDisplayType, hlDisplayColor, setHlDisplayType, setHlDisplayColor
  ] = usePart({ componentType: TYP_HL_PRODUCT, partType: TYP_HL_DISPLAY })  

  const [
    lcsDisplayType, lcsDisplayColor, setLcsDisplayType, setLcsDisplayColor
  ] = usePart({ componentType: TYP_LCS_PRODUCT, partType: TYP_LCI_DISPLAY })

  const [
    dopDisplayType, dopDisplayColor, setDopDisplayType, setDopDisplayColor
  ] = usePart({ componentType: TYP_DOP_PRODUCT, partType: TYP_DOP_DISPLAY })

  const [
    dinDisplayType, dinDisplayColor, setDinDisplayType, setDinDisplayColor
  ] = usePart({ componentType: TYP_DIN_PRODUCT, partType: TYP_DIN_DISPLAY })

  return (
    <SignalizationContext.Provider value={{
      currentFamily, setCurrentFamily,
      firstCopId, setFirstCop,
      secondCopId, setSecondCop,
      horizontalCopId, setHorizontalCop,
      numOfCops, setNumOfCops,
      firstCopPosition, setFirstCopPosition,
      secondCopPosition, setSecondCopPosition,
      copDisplayType, setCopDisplayType,
      copDisplayColor, setCopDisplayColor,
      horizontalCopPosition, setHorizontalCopPosition,
      hiId, setHi, hi, hiItem,
      hlId, setHl, hl, hlItem,
      lcsId, setLcs, lcs, lcsItem,
      fbId, setFb, fb, fbItem,
      eidId, setEid, eid, eidItem,
      dopId, setDop, dop, dopItem,
      dinId, setDin, din, dinItem,
      jambId, setJamb, jamb, jambItem,
      hiDisplayType, hiDisplayColor, setHiDisplayType, setHiDisplayColor,
      hlDisplayType, hlDisplayColor, setHlDisplayType, setHlDisplayColor,
      lcsDisplayType, lcsDisplayColor, setLcsDisplayType, setLcsDisplayColor,
      dopDisplayType, dopDisplayColor, setDopDisplayType, setDopDisplayColor,
      dinDisplayType, dinDisplayColor, setDinDisplayType, setDinDisplayColor,
      lcsPosition, setLcsPosition,
      dopPosition, setDopPosition,
      hiPosition, setHiPosition,
      hlPosition, setHlPosition,
      dinPosition, setDinPosition,
      eidPosition, setEidPosition,
      jambPositions, setJambPositions,
    }}>
      {children}
    </SignalizationContext.Provider>
  )
}
export default SignalizationProvider;

export const SignalizationConsumer = SignalizationContext.Consumer;