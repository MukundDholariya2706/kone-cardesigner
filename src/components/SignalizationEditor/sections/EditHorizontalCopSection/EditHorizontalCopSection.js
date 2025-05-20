import React, { useContext } from 'react'
import { SEAT_IN_CX_PRODUCTS, TYP_COP_HORIZONTAL, TYP_COP_PRODUCT_1 } from '../../../../constants'
import { DesignContext } from '../../../../store/design/DesignProvider'
import { ProductContext } from '../../../../store/product/ProductProvider'
import { TranslationContext } from '../../../../store/translation/TranslationProvider'
import CarShapeSelector, { TWO_POSITIONS } from '../../../CarShapeSelector/CarShapeSelector'
import CheckBoxGroup from '../../../CheckBoxGroup'
import GridComponent from '../../../GridComponent'
import HeadingComponent from '../../../HeadingComponent'
import InfoBox from '../../../InfoBox'
import RadioButtonGroup from '../../../RadioButtonGroup'
import SectionAccordion from '../../../SectionAccordion'
import TileComponent from '../../../TileComponent'
import { SignalizationContext } from '../../provider/SignalizationEditorProvider'
import { isTrueTypeCar } from '../../../../utils/design-utils'

import './EditHorizontalCopSection.scss'

/**
 * 
 * @param {Object} props 
 * @param {string=} props.className 
 */
function EditHorizontalCopSection(props) {
  const {
    className = '',
    horizontalCops = [],
    horizontalCopFinishes = [],
    horizontalCopPositions = ['B','D'],
  } = props
  
  const designCtx = useContext(DesignContext)
  const { design } = designCtx
  const productCtx = useContext(ProductContext)
  const { product } = productCtx
  const { getText } = useContext(TranslationContext)

  const { currentFamily, horizontalCopId, setHorizontalCop, horizontalCopPosition, setHorizontalCopPosition, } = useContext(SignalizationContext)

  const horizontalCopFinish = designCtx.getComponentFinish({type: TYP_COP_HORIZONTAL})

  // TODO check only when necessary (i.e. when positions or COPs have changed)
  const horizontalCopDisabled = designCtx.disableHorizontalCop()

  function setHorizontalCopHandler(value) {
    if (horizontalCopDisabled) return

    if( value === 'off')  {
      designCtx.addHorizontalCop(false)
    } else {
      designCtx.addHorizontalCop(value)

      if(currentFamily === 'KDS660') {
        designCtx.setComponentFinish({ type: TYP_COP_HORIZONTAL, finish: designCtx.getComponentFinish({ type: TYP_COP_PRODUCT_1 })})
      }
    }
  
  }

  function getDisplayedValue() {
    const found = horizontalCops.find(x => x.id === horizontalCopId)

    if (found) {
      return getText(found.name)
    }

    return getText('ui-general-not-selected')
  }

  function handleCheckBoxClick(val) {
    if (val === horizontalCopId) {
      setHorizontalCopHandler('off')
    } else {
      setHorizontalCopHandler(val)
    }
  }

  if (horizontalCops.length === 0 || horizontalCopPositions.length < 1) return null

  // console.log({horizontalCopPositions})

  return (
    <div data-testid="EditHorizontalCopSection" className={`EditHorizontalCopSection ${className}`}>
      <SectionAccordion
        heading={getText('ui-signalization-horizontal')}
        displayedValue={getDisplayedValue()}
      >
        <>
        {/* <HeadingComponent heading={getText('ui-signalization-horizontal')} info={getText('ui-signalization-horizontal-i')} padding="sm" border="top" /> */}
        {( product.businessSpecification.market === 'SOC' || SEAT_IN_CX_PRODUCTS.indexOf(product.product) !== -1 )
          ? <RadioButtonGroup 
              theme="white"
              selectionList={[{name:'ui-general-not-selected', id:'off'}, ...horizontalCops]}
              selectedItem={{ id: horizontalCopId || 'off' }}
              labelField="name"
              onChange={id => setHorizontalCopHandler(id)}
              />
              
              : <CheckBoxGroup
              theme="white"
              selectionList={[{id:(horizontalCops[0] || {}).id, stringid:'ui-general-add-to-design'}]} 
              selectedItems={horizontalCopId}
              disabled = {horizontalCopDisabled}
              onChange={handleCheckBoxClick} /> 
        }
        </>
        { horizontalCopFinishes.length > 1 && currentFamily !== 'KDS660' && 
          <>
            <HeadingComponent heading={getText('ui-signalization-horizontal-color')} info={getText('ui-signalization-horizontal-color-i')} />
            <GridComponent cols="6" gap="sm" padding="sm" style={{ marginBottom: '0px' }}>
              { horizontalCopFinishes.map((item, index) => (
                <TileComponent
                  key={index}
                  image={item.image}
                  selected={item.id === horizontalCopFinish}
                  onClick={e => designCtx.setComponentFinish({type: TYP_COP_HORIZONTAL, finish: item.id})}
                />
              )) }
            </GridComponent>
          </>             
        }

        { horizontalCopId && designCtx.horizontalPositionSelectable() &&
          <>
            <HeadingComponent heading={getText('ui-signalization-horizontal-position')} info={getText('ui-signalization-horizontal-position-i')} />
            <CarShapeSelector 
              showLabels={false}
              selected={[[horizontalCopPosition]]}
              selectableWalls={horizontalCopPositions} onChange={pos => setHorizontalCopPosition(pos)}
              type={TWO_POSITIONS}
              shape={(isTrueTypeCar( design.carType)) ?'through' :''}
              labelLeft={getText('ui-general-left')}
              labelRight={getText('ui-general-right')}
              />
          </>
        }
        <InfoBox text={getText('ui-signalization-horizontal-info')} icon="icon-wheelchair" />
      </SectionAccordion>
    </div>
  )
}

// function EditHorizontalCopSection() {
//   return null
// }
export default EditHorizontalCopSection