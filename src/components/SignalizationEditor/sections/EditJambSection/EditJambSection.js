import React, { useContext } from 'react'
import { DesignContext } from '../../../../store/design/DesignProvider'
import { ProductContext } from '../../../../store/product/ProductProvider'
import { TranslationContext } from '../../../../store/translation/TranslationProvider'
import HeadingComponent from '../../../HeadingComponent/HeadingComponent'
import PositionSelectorJamb from '../../../PositionSelectorJamb'
import RadioButtonGroup from '../../../RadioButtonGroup'
import SectionAccordion from '../../../SectionAccordion'
import { SignalizationContext } from '../../provider/SignalizationEditorProvider'
import { isTrueTypeCar } from '../../../../utils/design-utils'

import './EditJambSection.scss'
import { CAR_TYPE_TTC, CAR_TYPE_TTC_ENA, TYP_COP_2, TYP_COP_PRODUCT_1 } from '../../../../constants'

const possiblePositions = ['A1', 'A2', 'C1', 'C2']

/**
 * 
 * @param {Object} props 
 * @param {string=} props.className 
 */
function EditJambSection(props) {
  const {
    className = '',
    jambs = [],
    positions,
    dcs
  } = props

  const designCtx = useContext(DesignContext)
  const { design, getPositions } = designCtx
  const productCtx = useContext(ProductContext)
  const { product } = productCtx
  const { getText } = useContext(TranslationContext)

  const {
    jambId,
    setJamb,
    jambItem,
    jambPositions, setJambPositions
  } = useContext(SignalizationContext)

  function getDisplayedValue() {
    if (!jambItem) return getText('ui-general-not-selected')
    return getText(jambItem.name)
  }

  function onPositionChange(val) {
    setJambPositions(val)
  }

  function onJambSelection(id) {
    setJamb(id)

    if (!jambPositions || jambPositions.length === 0) {
      // default to A1 if enabled
      if(product?.businessSpecification?.market === 'ENA') {
        let jambPos = []
        const cop1Pos =  ( getPositions({type:TYP_COP_PRODUCT_1}) || []).join('')
        const cop2Pos =  ( getPositions({type:TYP_COP_2}) || []).join('')
        if (positions.includes(cop1Pos)) jambPos.push(cop1Pos)
        if(design.carType===CAR_TYPE_TTC || design.carType===CAR_TYPE_TTC_ENA) {
          if (positions.includes(cop2Pos)) jambPos.push(cop2Pos)
        }
        setJambPositions(jambPos)
      } else {
        if (!positions.includes('A1')) {
          setJambPositions([positions[0]])
        } else {
          setJambPositions(['A1'])
        }
      }
    }
  }

  function getDisabledPositions() {
    return possiblePositions.filter(pos => {
      return !positions.includes(pos)
    })
  }

  if (jambs.length === 0) return null

  const realJamb = jambs.find(item => item.id !== 'off')

  // in case there are no jambs defined for the product even thought there should be
  if(!realJamb) return null

  // If both front wall positions disabled for some reason for non-TTC, hide the whole thing
  if (!isTrueTypeCar(design.carType)) {
    const frontWallPos = positions.find(x => x === 'A1' || x === 'A2')
    if (!frontWallPos) return null
  }
  // const jambFamily = realJamb?.componentFamily

  return (
    <div data-testid="EditJambSection" className={`EditJambSection ${className}`}>
      <SectionAccordion
        heading={ dcs ?getText('ui-signalization-jamb') :getText('ui-signalization-jamb-direction-indicator')}
        displayedValue={getDisplayedValue()}
      >
        <HeadingComponent heading={getText('ui-signalization-jamb-type')} info={getText('ui-signalization-jamb-type-i')} />
        <RadioButtonGroup
          theme="white"
          selectionList={jambs}
          selectedId={jambId || 'off'}
          labelField="name"
          onChange={onJambSelection}
        />
        {product?.businessSpecification?.market !== 'ENA' && 
          <>
            <HeadingComponent heading={getText('ui-signalization-jamb-number-of-indicators')} info={getText('ui-signalization-jamb-number-of-indicators-i')} />
            <PositionSelectorJamb 
              positions={jambPositions}
              disabledPositions={getDisabledPositions()}
              disabled={!jambItem}
              carType={design.carType}

              onChange={onPositionChange} />
          </>
        }
      </SectionAccordion>
    </div>
  )
}

export default EditJambSection