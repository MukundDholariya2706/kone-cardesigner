import React, { useContext } from 'react'
import { DesignContext } from '../../../../store/design/DesignProvider'
import { ProductContext } from '../../../../store/product/ProductProvider'
import { TranslationContext } from '../../../../store/translation/TranslationProvider'
import ImageTitle from '../../../ImageTitle'
import { FinishList } from '../../../FinishAccordionItem'
import HeadingComponent from '../../../HeadingComponent'
import SectionAccordion from '../../../SectionAccordion'
import { SignalizationContext } from '../../provider/SignalizationEditorProvider'
import { TYP_DOP_PRODUCT } from '../../../../constants'

import './EditDopSection.scss'

/**
 * 
 * @param {Object} props 
 * @param {string=} props.className 
 */
function EditDopSection(props) {
  const {
    className = '',
    dops = [],
    finishes = [],
    showSapId,
/*     
    separateLandingFinishes,
    */
  } = props

  const designCtx = useContext(DesignContext)
  const { design } = designCtx
  const productCtx = useContext(ProductContext)
  const { product } = productCtx
  const { getText } = useContext(TranslationContext)

  const {
    currentFamily, dop, dopItem, dopId, setDop,
  } = useContext(SignalizationContext)

  function getDisplayedValue() {
    if (!dopItem) return getText('ui-general-no-selection')

    return getText(dopItem.name)
  }

  function handleFinishSelection(id) {
    console.log({id})
    designCtx.setFinishDCSLanding({ type:TYP_DOP_PRODUCT , finish: id })
  }

  if (dops.length === 0) return null

  return (
    <div data-testid="EditDopSection" className={`EditDopSection ${className}`}>
      <SectionAccordion
        heading={getText('ui-signalization-dop')}
        info={getText('ui-signalization-dop-i')}
        displayedValue={getDisplayedValue()}
      >
        <ImageTitle
          className="selection-list"
          wide={false}
          items={dops}
          selectedId={dopId}
          labelField="name"
          onChange={id => setDop(id)}
        />

        { dopItem && finishes.length > 1 && (
            <>
              <HeadingComponent heading={getText('ui-dop-finish')} info={getText('ui-dop-finish-i')} />
              <FinishList
                finish={dop.finish}
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

export default EditDopSection