import React, { useState, useContext, useEffect } from 'react'
import { ALL_POSSIBLE_COP_POSITIONS, CAR_TYPE_NORMAL, TYP_COP_2, TYP_COP_PRODUCT_1 } from '../../../../constants'
import { DesignContext } from '../../../../store/design'
import { ProductContext } from '../../../../store/product'
import { TranslationContext } from '../../../../store/translation'
import CarShapeSelector from '../../../CarShapeSelector'
import { FOUR_POSITIONS, SIX_POSITIONS } from '../../../CarShapeSelector/CarShapeSelector'
import HeadingComponent from '../../../HeadingComponent/HeadingComponent'
import InfoBox from '../../../InfoBox'
import SectionAccordion from '../../../SectionAccordion'
import ToggleButtons from '../../../ToggleButtons'
import { SignalizationContext } from '../../provider/SignalizationEditorProvider'
import { isTrueTypeCar } from '../../../../utils/design-utils'

import './EditCopPositionSection.scss'

/**
 * 
 * @param {Object} props 
 * @param {string=} props.className 
 */
function EditCopPositionSection(props) {
  const {
    className = '',
    amountOfDevices = [],
    allowedPanelPositions = [],
  } = props


  const designCtx = useContext(DesignContext)
  const { design } = designCtx
  const productCtx = useContext(ProductContext)
  const { product } = productCtx
  const { getText } = useContext(TranslationContext)
  
  const {
    firstCopPosition, setFirstCopPosition,
    secondCopPosition, setSecondCopPosition,
    secondCopId, setSecondCop,
    numOfCops, setNumOfCops,
  } = useContext(SignalizationContext)
  
  const [ editCop, setEditCop ] = useState(TYP_COP_PRODUCT_1)

  const disabledCopNumber = (design.regulations && design.regulations.indexOf('EN81-70') !==-1 && isTrueTypeCar( design.carType ) ) ? ['2'] :[]

  useEffect(() => {
    if(amountOfDevices.length<2 ) {
      setNumOfCops('1')
    }
    return () => {
    }
  }, [])

  function onChangeCopAmountHandler(num) {
    if(num === '2') {
      designCtx.addSecondCOP();

      if (!secondCopPosition) {
        // Try to place on the opposite wall from the first
        const preferredWall = firstCopPosition.includes('D') ? 'B' : 'D' 

        // CHECK Has a preferred position for second COP been defined somewhere or by someone?
        const posToUse = 
          allowedPanelPositions.find(x => x.includes(preferredWall)) ||
          allowedPanelPositions.find(x => x !== firstCopPosition) ||
          ALL_POSSIBLE_COP_POSITIONS.find(x => x !== firstCopPosition)

        setSecondCopPosition(posToUse)
      }
    } else {
      setSecondCop(null)
      setEditCop(TYP_COP_PRODUCT_1);
    }
    
    setNumOfCops(num)
  }


  function showCOPNumberChange() {
    if(product?.businessSpecification?.market === 'ENA') {
      return false
    }

/*     if(amountOfDevices.length<2 ) {
      setNumOfCops('1')
    } */

    if(amountOfDevices.length > 1 && !(design.regulations && design.regulations.indexOf('EN81-70') !==-1 && design?.carType !== CAR_TYPE_NORMAL)) {
      return true
    }

    return false
  }

  function onChangeCopPosition(pos) {
    if (editCop === TYP_COP_2) {
      setSecondCopPosition(pos)
    } else {
      setFirstCopPosition(pos)
    }
  }

  // TODO: place this somewhere else!!!!
  const productsWithSixPositions = ['minispace', 'monospace-700','monospace-dev', 'marine-monospace-700', 'marine-minispace', 'add-on-deco', 'transys-goods-eu', 'transys-passenger-eu']
  
  const carShapeSelectorType = productsWithSixPositions.includes(design.product) ? SIX_POSITIONS : FOUR_POSITIONS

  function getTranslationForPosition(pos) {
    if (!pos) return
    const [ wall, panel ] = pos.toLowerCase()

    if (wall === 'a') {
      let panelName

      if (panel === '1') {
        panelName = 'right'
      } else if (panel === '2') {
        panelName = 'left'
      }

      return getText(`ui-walls-${wall}-wall-${panelName}`)
    }
    
    if (wall === 'c') {
      let panelName

      if (panel === '1') {
        panelName = 'left'
      } else if (panel === '2') {
        panelName = 'right'
      }
      
      return getText(`ui-walls-${wall}-wall-${panelName}`)
    }
    
    return getText(`ui-walls-${wall}-wall`)
  }

  function getDisplayedValue() {
    const first = getTranslationForPosition(firstCopPosition)
    if (secondCopPosition) {
      const second = getTranslationForPosition(secondCopPosition)
      return `${first}, ${second}`
    }

    return first
  }

  return (
    <div data-testid="EditCopPositionSection" className={`EditCopPositionSection ${className}`}>
      <SectionAccordion
        heading={getText('ui-signalization-in-car-positioning')}
        displayedValue={getDisplayedValue()}
      >
        {showCOPNumberChange() &&
          <>
            <HeadingComponent heading={getText('ui-signalization-device-amount')} info={getText('ui-signalization-device-amount-i')} />
            <ToggleButtons content={amountOfDevices} type='number' selectedButton={numOfCops} onChange={num => onChangeCopAmountHandler(num)} disableOptions={disabledCopNumber} />
          </>
        }

        <HeadingComponent heading={getText('ui-signalization-cop-positioning')} info={getText('ui-signalization-cop-positioning-i')} padding="sm" border="top" />

        <div className={'copSelector' + ((numOfCops !== '2' || !showCOPNumberChange()) ? ' hidden' : '')}>
          <div className={'selectorItem' + (editCop === TYP_COP_PRODUCT_1 ? ' selected' : '')} onClick={e => setEditCop(TYP_COP_PRODUCT_1)}>
            {getText('ui-signalization-cop-1')}
          </div>
          <div className="switch" onClick={e => editCop === TYP_COP_2 ? setEditCop(TYP_COP_PRODUCT_1) : setEditCop(TYP_COP_2)}>
            <div className={"switchButton" + (editCop === TYP_COP_2 ? ' copTwo' : '')} />
          </div>
          <div className={'selectorItem' + (editCop === TYP_COP_2 ? ' selected' : '')} onClick={e => setEditCop(TYP_COP_2)}>
            {getText('ui-signalization-cop-2')}
          </div>
        </div>

        <CarShapeSelector
          showLabels={true}
          theme="white"
          selected={[[firstCopPosition], [secondCopPosition]]}
          selectableWalls={['B', 'D', 'A']} onChange={pos => onChangeCopPosition(pos)}
          disabled={[
            ALL_POSSIBLE_COP_POSITIONS.filter(x => !allowedPanelPositions.includes(x))
          ]}
          selectedItemDisabled={[editCop === TYP_COP_2 ? firstCopPosition : secondCopPosition]}
          type={carShapeSelectorType}
          shape={( isTrueTypeCar( design.carType ) ) ? 'through' : ''}
          labelLeft={getText('ui-general-left')}
          labelRight={getText('ui-general-right')}
        />

        <InfoBox text={getText('ui-signalization-cop-info')} style={{ marginBottom: '10px' }} />
      </SectionAccordion>
    </div>
  )
}

export default EditCopPositionSection