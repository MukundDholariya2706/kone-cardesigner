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
import TileComponent from '../../../TileComponent'
import { SignalizationContext } from '../../provider/SignalizationEditorProvider'

import './EditLcsSection.scss'
import { useValidDisplay } from '../../cop-hooks';

/**
 * 
 * @param {Object} props 
 * @param {string=} props.className 
 */
function EditLcsSection(props) {
  const {
    className = '',
    lcss = [],
    finishes = [],
    finishType,
    showFinishSelector,
    displayTypes = [],
    displayColors = [],
    showSapId
  } = props

  const designCtx = useContext(DesignContext)
  const { design } = designCtx
  const productCtx = useContext(ProductContext)
  const { product } = productCtx
  const { getText } = useContext(TranslationContext)

  const {
    currentFamily,
    setHl, hlId,
    lcsId, lcs, lcsItem, setLcs,
    lcsDisplayType, setLcsDisplayType,
    lcsDisplayColor, setLcsDisplayColor,
  } = useContext(SignalizationContext)

  function handleFinishSelection(id) {
    designCtx.setFinishLandingDevices({ type: finishType, finish: id })

    if (currentFamily === 'KDS660') {
      designCtx.setComponentFinish({ type: TYP_COP_HORIZONTAL, finish: id })
    }
  }

  function getDisplayedValue() {
    if (!lcsItem) return getText('ui-general-not-selected')
    return getText(lcsItem.name)
  }

  function setLcsHandler(id) {
    if(product?.rules?.variousComponentRules) {
      const hlToBeChanged = jsonLogic.apply(product.rules.variousComponentRules, {filteringRULE:'enaM300Lcs', PRODUCT:product.product, LCS:id, HL:hlId, FAMILY:currentFamily})
      if(hlToBeChanged) {
        setHl(hlToBeChanged)
      }
      setLcs(id)
    } else {
      setLcs(id)
    }
  }

  useValidDisplay({ 
    item: lcss.find(x => x.id === lcsId), 
    selectedType: lcsDisplayType,
    setType: setLcsDisplayType,
    selectedColor: lcsDisplayColor,
    setColor: setLcsDisplayColor
  })
  // console.log('lcs:',{finishes})
  if (lcss.length === 0) return null
  return (
    <div data-testid="EditLcsSection" className={`EditLcsSection ${className}`}>
      <SectionAccordion
        heading={getText('ui-signalization-lcs')}
        displayedValue={getDisplayedValue()}
      >
        <HeadingComponent heading={getText('ui-signalization-lcs-type')} info={getText('ui-signalization-lcs-i')} />
        <ImageTitle
          className="selection-list"
          items={lcss}
          selectedId={lcsId || 'off'}
          labelField="name"
          onChange={id => setLcsHandler(id)}
        />

        { displayTypes.length > 1 &&
          <>
            <HeadingComponent heading={getText('ui-lcs-display-type')} info={getText('ui-lcs-display-type-i')}  />
            <RadioButtonGroup
              theme="white"
              selectionList={displayTypes}
              selectedItem={{ id: lcsDisplayType }}
              labelField="name"
              onChange={id => setLcsDisplayType(id)}
            />
          </>
        }

        { displayColors.length > 1 &&
          <>
            <HeadingComponent heading={getText('ui-lcs-display-color')} info={getText('ui-lcs-display-color-i')} />
            <GridComponent cols="6" gap="sm" padding="sm" style={{ marginBottom: '0px' }}>
              {displayColors.map((item, index) => (
                <TileComponent
                  key={index}
                  image={item.image}
                  selected={item.id === lcsDisplayColor}
                  onClick={id => setLcsDisplayColor(item.id)}
                />
              ))}
            </GridComponent>
          </>
        }

        {
          showFinishSelector && lcsItem && finishes.length > 0 && (
            <>
              <HeadingComponent heading={getText('ui-lcs-finish')} info={getText('ui-lcs-finish-i')} />
              <FinishList
                finish={lcs.finish}
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

export default EditLcsSection