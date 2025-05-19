import React, { useContext } from 'react'
import jsonLogic from 'json-logic-js';

import { TYP_COP_HORIZONTAL } from '../../../../constants'
import { DesignContext } from '../../../../store/design'
import { ProductContext } from '../../../../store/product'
import { TranslationContext } from '../../../../store/translation'
import { FinishList } from '../../../FinishAccordionItem'
import GridComponent from '../../../GridComponent'
import HeadingComponent from '../../../HeadingComponent'
import ImageTitle from '../../../ImageTitle'
import RadioButtonGroup from '../../../RadioButtonGroup'
import SectionAccordion from '../../../SectionAccordion'
import ThumbnailItem from '../../../ThumbnailItem'
import TileComponent from '../../../TileComponent'
import { SignalizationContext } from '../../provider/SignalizationEditorProvider'

import './EditHallIndicatorSection.scss'
import { useValidDisplay } from '../../cop-hooks';

/**
 * 
 * @param {Object} props 
 * @param {string=} props.className 
 */
function EditHallIndicatorSection(props) {
  const {
    className = '',
    hallIndicators = [],
    finishes = [],
    showFinishSelector,
    separateLandingFinishes,
    finishType,
    displayTypes = [],
    displayColors = [],
    showSapId,
  } = props

  const designCtx = useContext(DesignContext)
  const { design } = designCtx
  const productCtx = useContext(ProductContext)
  const { product } = productCtx
  const { getText } = useContext(TranslationContext)

  const {
    currentFamily,
    hi, hiItem, hiId, setHi, hiDisplayType, hiDisplayColor, setHiDisplayType, setHiDisplayColor,
    setLcs, lcsId,
  } = useContext(SignalizationContext)


  function getDisplayedValue() {
    if (!hiItem) return getText('ui-general-no-selection')

    return getText(hiItem.name)
  }

  function handleFinishSelection(id) {
    if (separateLandingFinishes) {
      designCtx.setFinishHI({ finish: id })
    } else {
      designCtx.setFinishLandingDevices({ type: finishType, finish: id })

      if (currentFamily === 'KDS660') {
        designCtx.setComponentFinish({ type: TYP_COP_HORIZONTAL, finish: id })
      }
    }
  }

  function setHiHandler(id) {
    if(product?.rules?.variousComponentRules) {
      const lcsToBeChanged = jsonLogic.apply(product.rules.variousComponentRules, {filteringRULE:'enaM300Hl', PRODUCT:product.product, HI:id, LCS:lcsId, FAMILY:currentFamily})
      if(lcsToBeChanged) {
        setLcs(lcsToBeChanged)
      }
      setHi(id)
    } else {
      setHi(id)
    }
  }

  useValidDisplay({ 
    item: hallIndicators.find(x => x.id === hiId), 
    selectedType: hiDisplayType,
    setType: setHiDisplayType,
    selectedColor: hiDisplayColor,
    setColor: setHiDisplayColor
  })

  if (hallIndicators.length === 0) return null

  return (
    <div data-testid="EditHallIndicatorSection" className={`EditHallIndicatorSection ${className}`}>
      <SectionAccordion
        heading={getText('ui-signalization-hi')}
        displayedValue={getDisplayedValue()}
      >
        <HeadingComponent heading={getText('ui-signalization-hi-type')} info={getText('ui-signalization-hi-i')} />

        <ImageTitle
          className="selection-list"
          items={hallIndicators}
          selectedId={hiId || 'off'}
          labelField="name"
          onChange={id => setHiHandler(id)}
        />

        {
          displayTypes.length > 1 &&
          <>
            <HeadingComponent heading={getText('ui-hi-display-type')} info={getText('ui-hi-display-type-i')} />
            <RadioButtonGroup
              theme="white"
              selectionList={displayTypes}
              selectedItem={{ id: hiDisplayType }}
              labelField="name"
              onChange={id => setHiDisplayType(id)}
            />
          </>
        }

        { 
          displayColors.length > 1 &&
          <>
            <HeadingComponent heading={getText('ui-hi-display-color')} info={getText('ui-hi-display-color-i')} />
            <GridComponent cols="6" gap="sm" padding="sm" style={{ marginBottom: '0px' }}>
              {displayColors.map((item, index) => (
                <TileComponent
                  key={index}
                  image={item.image}
                  selected={item.id === hiDisplayColor}
                  onClick={id => setHiDisplayColor(item.id)}
                />
              ))}
            </GridComponent>
          </>
        }

        {
          showFinishSelector && hiItem && finishes.length > 0 && (
            <>
              <HeadingComponent heading={getText('ui-hi-finish')} info={getText('ui-hi-finish-i')} />
              <FinishList
                finish={hi.finish}
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

export default EditHallIndicatorSection