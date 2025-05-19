import React, { useContext } from 'react'
import { DesignContext } from '../../../../store/design'
import { ProductContext } from '../../../../store/product'
import { TranslationContext } from '../../../../store/translation'
import ImageTitle from '../../../ImageTitle'
import SectionAccordion from '../../../SectionAccordion'
import { SignalizationContext } from '../../provider/SignalizationEditorProvider'

import './EditFootButtonSection.scss'

/**
 * 
 * @param {Object} props 
 * @param {string=} props.className 
 */
function EditFootButtonSection(props) {
  const {
    className = '',
    footButtons = [],
  } = props

  const designCtx = useContext(DesignContext)
  const { design } = designCtx
  const productCtx = useContext(ProductContext)
  const { product } = productCtx
  const { getText } = useContext(TranslationContext)

  const {
    currentFamily,
    fbId, fb, fbItem, setFb,
  } = useContext(SignalizationContext)

  function getDisplayedValue() {
    if (!fbItem) return getText('ui-general-no-selection')

    return getText(fbItem.name)
  }

  if (footButtons.length === 0) return null

  return (
    <div data-testid="EditFootButtonSection" className={`EditFootButtonSection ${className}`}>
      <SectionAccordion
        heading={getText('ui-signalization-fb')}
        info={getText('ui-signalization-fb-i')}
        displayedValue={getDisplayedValue()}
      >
        <ImageTitle
          items={footButtons}
          selectedId={fbId || 'off'}
          labelField="name"
          wide={true}
          onChange={id => setFb(id)}
        />
      </SectionAccordion>
    </div>
  )
}

export default EditFootButtonSection