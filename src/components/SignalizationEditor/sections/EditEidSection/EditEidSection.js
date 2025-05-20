import React, { useContext } from 'react'
import { DesignContext } from '../../../../store/design/DesignProvider'
import { ProductContext } from '../../../../store/product/ProductProvider'
import { TranslationContext } from '../../../../store/translation/TranslationProvider'
import ImageTitle from '../../../ImageTitle'
import SectionAccordion from '../../../SectionAccordion'
import { FinishList } from '../../../FinishAccordionItem'
import HeadingComponent from '../../../HeadingComponent'
import { SignalizationContext } from '../../provider/SignalizationEditorProvider'
import { TYP_EID_PRODUCT } from '../../../../constants'

import './EditEidSection.scss'

/**
 * 
 * @param {Object} props 
 * @param {string=} props.className 
 */
function EditEidSection(props) {
  const {
    className = '',
    elevatorIdentifiers = [],
    finishes = [],
    showSapId,

  } = props

  const designCtx = useContext(DesignContext)
  const { design } = designCtx
  const productCtx = useContext(ProductContext)
  const { product } = productCtx
  const { getText } = useContext(TranslationContext)

  const {
    currentFamily,
    eidId, eid, eidItem, setEid
  } = useContext(SignalizationContext)

  function getDisplayedValue() {
    if (!eidItem) return getText('ui-general-no-selection')

    return getText(eidItem.name)
  }

  function handleFinishSelection(id) {
    designCtx.setFinishDCSLanding({ type:TYP_EID_PRODUCT , finish: id })
  }

  if (elevatorIdentifiers.length === 0) return null

  return (
    <div data-testid="EditEidSection" className={`EditEidSection ${className}`}>
      <SectionAccordion
        heading={getText('ui-signalization-eid')}
        info={getText('ui-signalization-eid-i')}
        displayedValue={getDisplayedValue()}
      >
        <ImageTitle
          className="selection-list"
          items={elevatorIdentifiers}
          selectedId={eidId}
          labelField="name"
          onChange={id => setEid(id)}
        />

        { eidItem && finishes.length > 1 && (
            <>
              <HeadingComponent heading={getText('ui-eid-finish')} info={getText('ui-eid-finish-i')} />
              <FinishList
                finish={eid.finish}
                finishes={finishes}
                showCategories={true}
                showSapId={showSapId}
                onChange={id => handleFinishSelection(id)}
              />
            </>
          )
        }

      </SectionAccordion>
    </div>
  )
}

export default EditEidSection