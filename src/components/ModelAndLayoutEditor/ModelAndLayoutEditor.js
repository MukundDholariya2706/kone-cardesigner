import './ModelAndLayoutEditor.scss';
import React, { useContext, useEffect, useState, useRef } from 'react';

import jsonLogic from 'json-logic-js';

import { DesignContext } from '../../store/design/DesignProvider';
import { ProductContext } from '../../store/product/ProductProvider';
import { Context3d } from '../../store/3d/shader-lib/Provider3d';
import { TranslationContext } from '../../store/translation/TranslationProvider';
import { AuthContext } from '../../store/auth/AuthProvider';

import EditorLayout from '../EditorLayout';
import RadioButtonGroup from '../RadioButtonGroup';
import CheckBoxGroup from '../CheckBoxGroup';
import Icon from '../Icon';
import NumericInput from '../NumericInput';

import 'ie-array-find-polyfill';

import InfoBox from '../InfoBox';
import ScrollBox from '../ScrollBox';
import HeadingComponent from '../HeadingComponent/HeadingComponent';
import {
  CAR_TYPE_NORMAL, CAR_TYPE_GLASS_BACKWALL, CAR_TYPE_TTC, TYP_CAR_WALL_B, CAR_SHAPE_WIDE, CAR_SHAPE_WIDE_AU_14_16_24, CAR_TYPE_GLASSMATERIAL_BACKWALL,
  CAR_TYPE_TTC_ENA, TYP_DOOR_A, CAR_SHAPES, CAR_SHAPE_WIDE_23_17_26, TYP_CAR_GLASS_WALL_C, TYP_CAR_WALL_ADD_DECO_PACKAGE
} from '../../constants';
import GridComponent from '../GridComponent';


/**
 * Renders out the header part of the view (currently not in use)
 * - uses DesginContext, ComponentContext as store
 * - includes {@link RadioButtonGroup} component
 * @function ModelAndLayoutEditor Header renderer
 * @param {Object} props Propertied passed to this renderer
 */
const ModelAndLayoutEditor = (props) => {
  // TODO: Change the model handling !!!
  const { getText } = useContext(TranslationContext);
  const { setCarType, setCarShape, setRegulations, design,
    createUndoState, hasUndoState, undo, setComponent, getComponent, getCustomDimension, getCustomDimensionUnit, setCustomDimension } = useContext(DesignContext);
  const { loading,  product } = useContext(ProductContext);
  
  const { setCameraTargetByShape, loadingState } = useContext(Context3d)

  const { loggedInUser } = useContext(AuthContext)

  const [ showCustomDimensions, setShowCustomDimensions ] = useState(false)

  const dimensionsWidthRef = useRef(null)
  const dimensionsDepthRef = useRef(null)

  useEffect(()=>{
    if(!loadingState.loading) {
      if(setCameraTargetByShape) {
        setCameraTargetByShape(design.carShape);
      }
    }
  }, [loadingState])
  
  if (loading) {
    return null
  }

  const onShapeChangeHandler = (id) => {
    if(id.includes('custom')) {
      const shapeInfo = carShapes.find(item => item.id === id) || null
      if(shapeInfo) {
        dimensionsWidthRef?.current?.setNewValue(shapeInfo.width)
        dimensionsDepthRef?.current?.setNewValue(shapeInfo.depth)
      }
    } else {
      const shapeInfo = CAR_SHAPES.find(item => item.id === id) || null
      if(shapeInfo) {
        dimensionsWidthRef?.current?.setNewValue(shapeInfo.displayWidth)
        dimensionsDepthRef?.current?.setNewValue(shapeInfo.displayDepth)
      }
    }


    if((id === CAR_SHAPE_WIDE || id === CAR_SHAPE_WIDE_AU_14_16_24) && hasUndoState()) {
      undo([{property:'carShape', value:id}])
    } else {
      const wallBIndex = (design.components || []).findIndex(item => item.componentType === TYP_CAR_WALL_B)
      if(wallBIndex !== -1 ) {
        if(design.components[wallBIndex].parts && design.components[wallBIndex].parts.length > 0 && !(id === CAR_SHAPE_WIDE || id === CAR_SHAPE_WIDE_AU_14_16_24)) {
          console.log('set undo state')
          createUndoState()
        }
      }

      if (id === CAR_SHAPE_WIDE_23_17_26) {
        
        if(design?.carType === CAR_TYPE_TTC && getComponent({type:TYP_CAR_GLASS_WALL_C})) {
          setComponent({type:TYP_CAR_GLASS_WALL_C, component:null})
          if( product?.businessSpecification?.market === 'SOC' ) {
            setCarType({type:CAR_TYPE_NORMAL})
          }
        }

        if(design?.carType === CAR_TYPE_GLASS_BACKWALL && getComponent({type:TYP_CAR_GLASS_WALL_C})) {
          setComponent({ type: TYP_CAR_WALL_ADD_DECO_PACKAGE, component: 'DECO0' })
          setCarType({type:CAR_TYPE_NORMAL})
        }
    
        if(product?.businessSpecification?.market === 'SOC' && design.carType === CAR_TYPE_GLASS_BACKWALL) {
          setCarType({type:CAR_TYPE_NORMAL})
        }
      }

      setCarShape({ shape: id })
    }
  }

  const { carShape, carType } = design || {}
  
  const verifyCarType = () => {

    if(carType === CAR_TYPE_NORMAL || carType === CAR_TYPE_GLASS_BACKWALL || carType === CAR_TYPE_GLASSMATERIAL_BACKWALL) {
        return CAR_TYPE_NORMAL
    } else {
      return carType
    }

  }

  const carShapes = product.carShapes && product.carShapes.map((item, index) => {
    return {
      id: item,
      name: "ui-layout-shape-" + item.toLowerCase(),
      size: "ui-layout-size-" + item.toLowerCase(),
      iconClassName: item.toLowerCase(),
      shape: item.toLowerCase(), 
    }
  }).filter(item => {
    // filter out other than india square car shapes with certain india predesigns
    if(product?.rules?.indiaFinishExceptions) {
      return jsonLogic.apply(product.rules.indiaFinishExceptions,{
        TESTING: 'carShape',
        PRODUCT: product.product,
        DESIGN: design.originalSapId,
        SHAPE: item.id
      })
    } else {
      return true
    }
  })
  
  if(product?.customCarShape) {
    carShapes.push(product.customCarShape)
  }

  const currentShape = carShapes.find(item => {
    if(design?.isCustomShape && item.realShapeId && item.realShapeId === design.carShape) return true
    if(!design.isCustomShape && item.id === design.carShape) return true
    return false
  }) || {}
  const customCarDimensions = design?.customDesignDimensions || {}
  const customCarDimensionsDisplay = `${customCarDimensions.width} ${customCarDimensions.unit} x ${customCarDimensions.depth} ${customCarDimensions.unit}`

  const carTypes = product.carTypes && product.carTypes
  .filter(item=> {
    if(product && product.rules && product.rules.variousFilteringRules) {
      return jsonLogic.apply(product.rules.variousFilteringRules, {
        filteringRULE: 'shapeRule',
        modelAndLayout_CARSHAPE: design.carShape,
        modelAndLayout_PRODUCT: product.product,
        modelAndLayout_CARTYPE: item
      })
    } else {
      return true
    }
  })  
  .map((item, index) => {
    let stringid = 'ui-layout-type-single-entrance'
    let icon = 'single'
    switch (item) {
      case CAR_TYPE_NORMAL:
        stringid = 'ui-layout-type-single-entrance'
        icon = 'single'
        break;
      case CAR_TYPE_GLASS_BACKWALL:
        stringid = 'ui-layout-type-single-entrance-glass-back-wall'
        break;
      case CAR_TYPE_TTC:
        stringid = 'ui-layout-type-ttc'
        icon = 'ttc'
        break;
      case CAR_TYPE_TTC_ENA:
        stringid = 'ui-layout-type-ttc-ena'
        icon = 'ttc_ena'
        break;
    
      default:
        break;
    }
    return {
      stringid, icon, id: item
    }
  })

  const setCarTypeHandler = (newType) => {
    
    if(newType === CAR_TYPE_TTC_ENA) {
      if(product?.componentsData?.doors?.solutions) {
        const currentDoor = getComponent({type:TYP_DOOR_A})
        const doorSolutions = product.componentsData.doors.solutions
        const zeroDoor = doorSolutions.find(item => (item.id === '0L' || item.id === '0R' || item.id === '2L' || item.id === '2R'))
        if(zeroDoor && !currentDoor || currentDoor.indexOf('0') === -1 || currentDoor.indexOf('2') === -1) {
          setComponent({type:TYP_DOOR_A, component:zeroDoor.id})
        }
      }
    }
    
    setCarType({type:newType})

  }
  return (      
    <div className="ModelAndLayoutEditor">
      <EditorLayout heading={getText('ui-layout-heading')} desc={getText((product || {}).description)} descLabel={getText((product || {}).name)} >
        <ScrollBox>
          {
            // Only render the regulations section if there is at least one regulation available.
            !!product.componentsData.regulations.find(regulation => !regulation.disabled) &&
            <>
              <HeadingComponent heading={getText('ui-layout-regulation')} info={getText('ui-layout-regulation-i')} padding="sm" />
              <CheckBoxGroup 
                selectionList={product.componentsData.regulations} 
                selectedItems={design.regulations || []} 
                onChange={ e => setRegulations(e)} /> 
              <InfoBox text={getText('ui-layout-regulation-info')} style={{ marginBottom: '20px' }} />
            </>
          }

          <HeadingComponent heading={getText('ui-layout-select-car-shape')} info={getText('ui-layout-select-car-shape-i')} padding="sm" border="top" />
            { design.ktoc && 
              <>
                <GridComponent cols="1" gap="md" padding="sm" style={{ marginBottom: '0px' }}>
                  <div className={'car-shape' + ' selected'} >
                    <Icon id={currentShape.iconClassName + '_selected'} />
                    <div className="car-shape-size">{customCarDimensionsDisplay} </div>
                  </div>
                </GridComponent>            
                <InfoBox text={getText('ui-layout-ktoc-custom-dimensions-info')} style={{ marginBottom: '15px', marginTop: '20px'}} />
              </>
            }
            { !design.ktoc &&
              <GridComponent cols="3" gap="md" padding="sm" style={{ marginBottom: '0px' }}>

              {carShapes && carShapes.map((item, key) => {
                  return (
                    <div key={key} className={'car-shape' + (( (design?.isCustomShape && item.realShapeId === carShape) || (!design?.isCustomShape && item.id === carShape) ) ? ' selected' : '') } onClick={e => onShapeChangeHandler(item.id)} >
                      <Icon id={item.iconClassName + (( (design?.isCustomShape && item.realShapeId === carShape) || (!design?.isCustomShape && item.id === carShape) ) ?'_selected' :'')} />
                    
                      <div className="car-shape-size">{getText(item.size)}</div>
                    </div>
                  )
                })}
              </GridComponent>
            }
          {loggedInUser && 
            <div className="editCustomDimensions">
              {!showCustomDimensions &&
                <div className="editPanelClosed" onClick={e => setShowCustomDimensions(true)}>
                  <Icon id="icon-edit-pen-blue" className="icon" />
                  <div className="editText">{getText('ui-layout-set-custom-dimensions')}</div>
                </div>
              }

              {showCustomDimensions &&
                <div className="editPanelOpen" >
                  <div className="editPanelHeader" >
                    <HeadingComponent heading={getText('ui-layout-set-custom-dimensions')} info={getText('ui-layout-set-custom-dimensions-i')} padding="sm" className="editPanelHeader" >
                      <div onClick={e => setShowCustomDimensions(false)} className="iconContainer" >
                        <Icon id="icon-close" className="icon" />
                      </div>
                    </HeadingComponent>
                  </div>

                  <div className="editPanelFields">
                    <div className="editFieldLabel">
                      {getText('ui-layout-car-width')}
                    </div>
                    <div className="editFieldContainer">
                      <NumericInput unit={getCustomDimensionUnit()} value={getCustomDimension({type:'width'})} min="1" max="6000" onChange={e => setCustomDimension({type:'width',value:e})} ref={dimensionsWidthRef} />
                    </div>
                    <div className="editFieldLabel">
                      {getText('ui-layout-car-depth')}
                    </div>
                    <div className="editFieldContainer">
                      <NumericInput unit={getCustomDimensionUnit()} value={getCustomDimension({type:'depth'})} min="1" max="6000" onChange={e => setCustomDimension({type:'depth',value:e})} ref={dimensionsDepthRef} />
                    </div>
                  </div>

                  <InfoBox text={getText('ui-layout-custom-dimensions-info')} style={{ marginBottom: '15px', marginTop: '20px'}} />

                </div>


              }

            </div>
          }

          <HeadingComponent heading={getText('ui-layout-select-entrances')} info={getText('ui-layout-select-entrances-i')} padding="sm" border="top" />

          <GridComponent cols="1" gap="sm" padding="sm">
            {carTypes && carTypes.map((item, index) => {
              return (
                <div key={index} className="car-type-item" onClick={e => setCarTypeHandler(item.id)}>
                  <Icon id={item.icon + (verifyCarType() === item.id ?'_selected' :'')} style={{width:'51px',height:'51px'}} />
                  <div className="car-type-label">{getText(item.stringid)}</div>
                </div>
              )
            }) }
          </GridComponent>
          {product?.businessSpecification?.market === 'ENA' &&
            <InfoBox text={getText('ui-layout-ena-limited-configurations')} style={{ marginTop: '10px' }} />
          }

          <div style={{ height:'20px' }} />
        </ScrollBox>
      </EditorLayout>
    </div>
  )
}
export default ModelAndLayoutEditor;