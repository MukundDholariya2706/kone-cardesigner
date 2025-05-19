import React, { useContext } from 'react'
import jsonLogic from 'json-logic-js';
import { MIDDLE_BETWEEN_DOORS, MIDDLE_LEFT, MIDDLE_LEFT_FRAME, MIDDLE_RIGHT, MIDDLE_RIGHT_FRAME, TOP_CENTER, TOP_CENTER_FRAME, TOP_LEFT, TOP_LEFT_FRAME, TOP_RIGHT, TOP_RIGHT_FRAME } from '../../../../constants'
import { DesignContext } from '../../../../store/design'
import { ProductContext } from '../../../../store/product'
import { TranslationContext } from '../../../../store/translation'
import LandingPositions from '../../../LandingPositions'
import RadioButtonGroup from '../../../RadioButtonGroup'
import SectionAccordion from '../../../SectionAccordion'
import { SignalizationContext } from '../../provider/SignalizationEditorProvider'

import './EditLandingPositionsSection.scss'

/**
 * 
 * @param {Object} props 
 * @param {string=} props.className 
 */
function EditLandingPositionsSection(props) {
  const {
    className = '',
    landingPositions
  } = props

  const designCtx = useContext(DesignContext)
  const { design } = designCtx
  const productCtx = useContext(ProductContext)
  const { product } = productCtx
  const { getText } = useContext(TranslationContext)

  const {
    currentFamily,
    dopId, hiId, hlId, lcsId, dinId, eidId,
    lcsPosition, setLcsPosition,
    dopPosition, setDopPosition,
    hiPosition, setHiPosition,
    hlPosition, setHlPosition,
    dinPosition, setDinPosition,
    eidPosition, setEidPosition,
  } = useContext(SignalizationContext)

  function getDisplayedValue() {
    if (dopPosition === MIDDLE_BETWEEN_DOORS || lcsPosition === MIDDLE_BETWEEN_DOORS) {
      return getText('ui-lcs-position-shared' )
    }
    
    return getText('ui-lcs-position-elevator-specific')
  }

  function getDefaultPosition() {
    // Pedestal is wanted to be on the left side of the door by default
    return dopId === 'KSP858' ? MIDDLE_LEFT : MIDDLE_RIGHT 
  }

  function isSelected(item) {
    const positions = []
    
    if (lcsPosition) {
      positions.push(lcsPosition)
    } else if (dopPosition) {
      positions.push(dopPosition)
    }

    if (item.id === MIDDLE_BETWEEN_DOORS) {
      return positions.includes(MIDDLE_BETWEEN_DOORS)
    } else {
      return !positions.includes(MIDDLE_BETWEEN_DOORS)
    }
  }

  function onLandingPositionChange(pos) {
    if (hiId) {
      if (pos === TOP_CENTER || pos === TOP_CENTER_FRAME ) {
        setHiPosition(pos)
        return
      }      
    }

    if (hlId) {
      if (pos === TOP_CENTER || pos === TOP_CENTER_FRAME || pos === TOP_LEFT || pos === TOP_LEFT_FRAME || pos === TOP_RIGHT || pos === TOP_RIGHT_FRAME) {
        setHlPosition(pos)
        return
      }      
    }
    
    if (lcsId) {
      if (pos === MIDDLE_LEFT || pos === MIDDLE_LEFT_FRAME || pos === MIDDLE_RIGHT || pos === MIDDLE_RIGHT_FRAME || pos === MIDDLE_BETWEEN_DOORS) {
        setLcsPosition(pos)
      }
    }

    if (dopId) {
      if (pos === MIDDLE_LEFT || pos === MIDDLE_LEFT_FRAME || pos === MIDDLE_RIGHT || pos === MIDDLE_RIGHT_FRAME || pos === MIDDLE_BETWEEN_DOORS) {
        setDopPosition(pos)
      }
    }

    if (dinId) {
      if (pos === TOP_LEFT || pos === TOP_LEFT_FRAME || pos === TOP_RIGHT || pos === TOP_RIGHT_FRAME) {
        setDinPosition(pos)
      }
    }

    if (eidId) {
      if (pos === TOP_CENTER || pos === TOP_CENTER_FRAME) { 
        setEidPosition(pos)
      }
    }
  }

  function shouldShowSharedLCSSelector() {
    if (!lcsId && !dopId) return false

    // Show shared/elevator specific selector only if both between and right position are found in lanadingPositions array
    const canHaveSharedComponents = jsonLogic.apply(product.rules.signalizationLandingExceptions, { PRODUCT_SHARED: product.product })
    return canHaveSharedComponents && landingPositions.includes(MIDDLE_BETWEEN_DOORS) && landingPositions.includes(MIDDLE_RIGHT)
  }

  function getSelectedLandingPositions() {
    const positions = [
      hiPosition,
      hlPosition,
      lcsPosition,
      dopPosition,
      dinPosition,
      eidPosition
    ]

    // Remove undefined
    return positions.filter(x => x)
  }

  return (
    <div data-testid="EditLandingPositionsSection" className={`EditLandingPositionsSection ${className}`}>
      <SectionAccordion
        displayedValue={getDisplayedValue()}
        heading={getText('ui-signalization-landing-components-positioning')} info={getText('ui-signalization-landing-components-positioning-i')}
      >
        { shouldShowSharedLCSSelector() && (
          <RadioButtonGroup
            theme="white"
            selectionList={[
              { id: MIDDLE_BETWEEN_DOORS, name: 'ui-lcs-position-shared' },
              { id: getDefaultPosition(), name: 'ui-lcs-position-elevator-specific' }
            ]}
            isSelected={isSelected}
            labelField="name"
            onChange={id => onLandingPositionChange(id)}
          />
        )}

        <LandingPositions
          selectedPositions={getSelectedLandingPositions()}
          positions={landingPositions}
          onChange={position => onLandingPositionChange(position)}
        />
      </SectionAccordion>
    </div>
  )
}

export default EditLandingPositionsSection