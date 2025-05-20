import React, { useState, useEffect, useContext } from 'react'
import { TranslationContext } from '../../../../store/translation/TranslationProvider'
import { DesignContext } from '../../../../store/design/DesignProvider'
import HeadingComponent from '../../../HeadingComponent'
import SectionAccordion from '../../../SectionAccordion'
import ScenicWindowPositionSelector from '../ScenicWindowPositionSelector'
import ComponentSelector from '../ComponentSelector'

import { TYP_CAR_GLASS_WALL_C, TYP_CAR_WALL_C, CAR_TYPE_GLASS_BACKWALL, WALLC, TYP_CAR_WALL_ADD_DECO_PACKAGE, CAR_TYPE_TTC } from '../../../../constants'

import './ScenicCarTypeSelector.scss'
import { ProductContext } from '../../../../store/product/ProductProvider'
import TileImage from '../../../TileImage/TileImage'



/**
 * 
 * @param {Object} props 
 * @param {string=} props.className 
 */
function ScenicCarTypeSelector(props) {
  const { className = '', selectedScenicType, setSelectedScenicType, fullScenicCar } = props

  const { getText } = useContext(TranslationContext)
  const productCtx = useContext(ProductContext)
  const { product } = productCtx
  const {
    setCarType,
    setPositions,
    getPositions,
    setComponent,
    getComponent,
    getDesignProperty,
  } = useContext(DesignContext);

  const [selectedPositions, setSelectedPositions] = useState(getPositions({ type: TYP_CAR_GLASS_WALL_C }) || null)
  const scenicCars = getScenicCars()
  const selectedItem = scenicCars.find(x => x.id === selectedScenicType)

  function getScenicCars() {
    return product.componentsData.walls.scenicWindowTypes
  }

  useEffect(() => {
    if (!selectedPositions) return
    setPositions({ type: TYP_CAR_GLASS_WALL_C, positions: selectedPositions })
  }, [selectedPositions])

  function onChange(e) {
    setSelectedScenicType(e)
    if (!selectedScenicType) {
      if(!fullScenicCar || getDesignProperty('carType') !== CAR_TYPE_TTC) {
        setCarType({ type: CAR_TYPE_GLASS_BACKWALL, glassType: e })
      } else {
        setComponent({ type:TYP_CAR_GLASS_WALL_C, component:e})
      }
      setComponent({ type: TYP_CAR_WALL_ADD_DECO_PACKAGE, component: null })
      if(fullScenicCar) {
       
        if( getDesignProperty('carType') === CAR_TYPE_TTC ) setSelectedPositions(['D2','B1']) 
        else if(product.id === "n-monospace-exp" && e === "GLASS_C_FHT") setSelectedPositions(['D2', 'C' ,'B1'])
        else setSelectedPositions(['C'])
       }
      } else {
        if(product.id === "n-monospace-exp" && e === "GLASS_C_FHT") {
          setSelectedPositions(['D2', 'C' ,'B1'])
          setComponent({ type: TYP_CAR_GLASS_WALL_C, component: e })
        }
        else setComponent({ type: TYP_CAR_GLASS_WALL_C, component: e })
      }
    }

  function setGlassWallPositions(pos) {
    setSelectedPositions(pos)
    if (pos?.includes('C') && getComponent({ type: TYP_CAR_WALL_C })) {
      setComponent({ type: TYP_CAR_WALL_C, component: null })
      return
    }
    if (!pos?.includes('C') && getDesignProperty('carType') !== CAR_TYPE_TTC) {
      setComponent({ type: TYP_CAR_WALL_C, component: WALLC })
      return
    }
  }

  function getDisplayedValue() {
    if (!selectedItem) return getText('ui-general-please-select')
    return (
      <div className={`displayed-value`}>
        <TileImage className="displayed-value__thumbnail" image={selectedItem.image} />
        <div className="displayed-value__info">
          <p className="displayed-value__name">{getText(selectedItem.label)}</p>
        </div>
      </div>
    )
  }

  return (
    <div data-testid="ScenicCarTypeSelector" className="ScenicCarTypeSelector">
      <HeadingComponent
        border={'top'}
        heading={getText('ui-walls-scenic-car-base')}
        info={getText('ui-walls-scenic-car-base-i')}
        padding="sm"
      />
      <SectionAccordion defaultOpen={!selectedScenicType} className="scenic-type-accordion" displayedValue={getDisplayedValue()} >
        <HeadingComponent
          heading={getText('ui-walls-scenic-car-type')}
          info={getText('ui-walls-scenic-car-type-i')}
        />
        <ComponentSelector items={scenicCars} onChange={onChange} selectedItem={selectedScenicType} />
        {(selectedScenicType && fullScenicCar) &&
          <>
            <HeadingComponent
              border={'top'}
              className="inner-heading"
              heading={getText('ui-walls-scenic-window-position')}
              info={getText('ui-walls-scenic-window-position-i')}
              padding="sm"
            />
            <ScenicWindowPositionSelector
              positions={selectedPositions}
              isTTC={getDesignProperty('carType') === CAR_TYPE_TTC}
              onChange={setGlassWallPositions}
            />
          </>
        }
      </SectionAccordion>
    </div>
  )
}

export default ScenicCarTypeSelector