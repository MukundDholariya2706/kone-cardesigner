import React, { useContext } from 'react'
import jsonLogic from 'json-logic-js';

import { SEPARATE_HALL_INDICATORS, TYP_COP_HORIZONTAL } from '../../../../constants'
import { DesignContext } from '../../../../store/design'
import { ProductContext } from '../../../../store/product'
import { TranslationContext } from '../../../../store/translation'
import { FinishList } from '../../../FinishAccordionItem'
import GridComponent from '../../../GridComponent'
import HeadingComponent from '../../../HeadingComponent'
import ImageTitle from '../../../ImageTitle'
import RadioButtonGroup from '../../../RadioButtonGroup'
import SectionAccordion from '../../../SectionAccordion'
import TileComponent from '../../../TileComponent'
import { SignalizationContext } from '../../provider/SignalizationEditorProvider'

import './EditHallLanternSection.scss'
import { useValidDisplay } from '../../cop-hooks';

/**
 * 
 * @param {Object} props 
 * @param {string=} props.className 
 */
function EditHallLanternSection(props) {
  const {
    className = '',
    hallLanterns = [],
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
    hl, hlItem, hlId, setHl, hlDisplayType, hlDisplayColor, setHlDisplayType, setHlDisplayColor,
    setLcs, lcsId,
  } = useContext(SignalizationContext)


  function getDisplayedValue() {
    if (!hlItem) return getText('ui-general-no-selection')

    return getText(hlItem.name)
  }

  function handleFinishSelection(id) {
    if (separateLandingFinishes) {
      designCtx.setFinishHL({ finish: id })
    } else {
      designCtx.setFinishLandingDevices({ type: finishType, finish: id })

      if (currentFamily === 'KDS660') {
        designCtx.setComponentFinish({ type: TYP_COP_HORIZONTAL, finish: id })
      }
    }
  }

  function setHlHandler(id) {
    if(product?.rules?.variousComponentRules) {
      const lcsToBeChanged = jsonLogic.apply(product.rules.variousComponentRules, {filteringRULE:'enaM300Hl', PRODUCT:product.product, HL:id, LCS:lcsId, FAMILY:currentFamily})
      if(lcsToBeChanged) {
        setLcs(lcsToBeChanged)
      }
      setHl(id)
    } else {
      setHl(id)
    }
  }

  useValidDisplay({ 
    item: hallLanterns.find(x => x.id === hlId), 
    selectedType: hlDisplayType,
    setType: setHlDisplayType,
    selectedColor: hlDisplayColor,
    setColor: setHlDisplayColor
  })

  if (hallLanterns.length === 0) return null

  const headingKey = SEPARATE_HALL_INDICATORS.includes(currentFamily) ?'ui-signalization-hl' :'ui-signalization-hi'
  const typeKey = SEPARATE_HALL_INDICATORS.includes(currentFamily) ?'ui-signalization-hl-type' :'ui-signalization-hi-type'
  const typeIKey = SEPARATE_HALL_INDICATORS.includes(currentFamily) ?'ui-signalization-hl-i' :'ui-signalization-hi-i'
  const displayTypeKey = SEPARATE_HALL_INDICATORS.includes(currentFamily) ?'ui-hl-display-type' :'ui-hi-display-type'
  const displayTypeIKey = SEPARATE_HALL_INDICATORS.includes(currentFamily) ?'ui-hl-display-type-i' :'ui-hi-display-type-i'
  const displayColorKey = SEPARATE_HALL_INDICATORS.includes(currentFamily) ?'ui-hl-display-color' :'ui-hi-display-color'
  const displayColorIKey = SEPARATE_HALL_INDICATORS.includes(currentFamily) ?'ui-hl-display-color-i' :'ui-hi-display-color-i'
  const finishKey = SEPARATE_HALL_INDICATORS.includes(currentFamily) ?'ui-hl-finish' :'ui-hi-finish'
  const finishIKey = SEPARATE_HALL_INDICATORS.includes(currentFamily) ?'ui-hl-finish-i' :'ui-hi-finish-i'

  return (
    <div data-testid="EditHallLanternSection" className={`EditHallLanternSection ${className}`}>
      <SectionAccordion
        heading={getText(headingKey)}
        displayedValue={getDisplayedValue()}
      >
        <HeadingComponent heading={getText(typeKey)} info={getText(typeIKey)} />

        <ImageTitle
          className="selection-list"
          items={hallLanterns}
          selectedId={hlId || 'off'}
          labelField="name"
          onChange={id => setHlHandler(id)}
        />

        {
          displayTypes.length > 1 &&
          <>
            <HeadingComponent heading={getText(displayTypeKey)} info={getText(displayTypeIKey)} />
            <RadioButtonGroup
              theme="white"
              selectionList={displayTypes}
              selectedItem={{ id: hlDisplayType }}
              labelField="name"
              onChange={id => setHlDisplayType(id)}
            />
          </>
        }

        { 
          displayColors.length > 1 &&
          <>
            <HeadingComponent heading={getText(displayColorKey)} info={getText(displayColorIKey)} />
            <GridComponent cols="6" gap="sm" padding="sm" style={{ marginBottom: '0px' }}>
              {displayColors.map((item, index) => (
                <TileComponent
                  key={index}
                  image={item.image}
                  selected={item.id === hlDisplayColor}
                  onClick={id => setHlDisplayColor(item.id)}
                />
              ))}
            </GridComponent>
          </>
        }

        {
          showFinishSelector && hlItem && finishes.length > 0 && (
            <>
              <HeadingComponent heading={getText(finishKey)} info={getText(finishIKey)} />
              <FinishList
                finish={hl.finish}
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

export default EditHallLanternSection