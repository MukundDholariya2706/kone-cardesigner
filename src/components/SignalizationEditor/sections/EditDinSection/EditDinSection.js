import React, { useContext } from 'react'
import { DesignContext } from '../../../../store/design/DesignProvider'
import { ProductContext } from '../../../../store/product/ProductProvider'
import { TranslationContext } from '../../../../store/translation/TranslationProvider'
import ImageTitle from '../../../ImageTitle'
import SectionAccordion from '../../../SectionAccordion'
import { FinishList } from '../../../FinishAccordionItem'
import HeadingComponent from '../../../HeadingComponent'
import { SignalizationContext } from '../../provider/SignalizationEditorProvider'
import { TYP_DIN_PRODUCT } from '../../../../constants'

import './EditDinSection.scss'

/**
 * 
 * @param {Object} props 
 * @param {string=} props.className 
 */
function EditDinSection(props) {
  const {
    className = '',
    destinationIndicators = [],
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
    din, dinId, dinItem, setDin
  } = useContext(SignalizationContext)

  function getDisplayedValue() {
    if (!dinItem) return getText('ui-general-no-selection')

    return getText(dinItem.name)
  }

  function handleFinishSelection(id) {
    designCtx.setFinishDCSLanding({ type:TYP_DIN_PRODUCT , finish: id })
  }

  if (destinationIndicators.length === 0) return null

  return (
    <div data-testid="EditDinSection" className={`EditDinSection ${className}`}>
      <SectionAccordion
        heading={getText('ui-signalization-din')}
        info={getText('ui-signalization-din-i')}
        displayedValue={getDisplayedValue()}
      >
        <ImageTitle
          className="selection-list"
          items={destinationIndicators}
          selectedId={dinId || 'off'}
          labelField="name"
          onChange={id => setDin(id)}
        />

        { dinItem && finishes.length > 1 && (
            <>
              <HeadingComponent heading={getText('ui-din-finish')} info={getText('ui-din-finish-i')} />
              <FinishList
                finish={din.finish}
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

export default EditDinSection