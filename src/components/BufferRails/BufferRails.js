import './BufferRails.scss';
import React, { useContext, useState, useEffect } from 'react';
import jsonLogic from 'json-logic-js';
import _ from 'lodash'

import { ProductContext } from '../../store/product/ProductProvider';
import { DesignContext } from '../../store/design/DesignProvider';
import EditorLayout from '../EditorLayout';
import { LayoutContext } from '../../store/layout/LayoutProvider';
import { TYP_CAR_BUFFER_RAIL, MAT_CAR_BUFFER_RAIL, TYP_CAR_WALL_ADD_DECO_PACKAGE, TYP_CAR_MIRROR, TYP_COP_2,
      TYP_COP_PRODUCT_1, MAT_CAR_WALL_FINISH_C, TYP_CAR_GLASS_WALL_C,  MAT_CAR_WALL_FINISH_B, MAT_CAR_WALL_FINISH_D } from '../../constants';
import PositionSelector from '../PositionSelector/PositionSelector';
import BufferRailLayout from '../BufferRailLayout';
import { TranslationContext } from '../../store/translation/TranslationProvider';
import HeadingComponent from '../HeadingComponent/HeadingComponent';
import ScrollBox from '../ScrollBox';
import FinishAccordionItem from '../FinishAccordionItem';
import ImageTitle from '../ImageTitle';

const BufferRails = (props) => {
  
  const { getText } = useContext(TranslationContext);
  const { setEditView } = useContext(LayoutContext);
  const { product, getMaterial, getComponents } = useContext(ProductContext);
  const { design, getComponent: getComponentId, setDefaultComponent,
        getPositions, setPositions, getDesignProperty, getFinish, setComponent, getFinishMaterial } = useContext(DesignContext);

  const components = getComponents({ type: TYP_CAR_BUFFER_RAIL }).filter(buffer => {

    if(product?.rules?.variousFilteringRules) {
      const refilterTest = {}
      refilterTest['filteringRULE'] = 'refilterBufferRails'
      refilterTest['BufferId'] = buffer.id
      refilterTest['PRODUCT'] = product.product;
      refilterTest['BWALL_MAT'] = getFinishMaterial({type:MAT_CAR_WALL_FINISH_B})
      refilterTest['CWALL_MAT'] = getFinishMaterial({type:MAT_CAR_WALL_FINISH_C})
      refilterTest['DWALL_MAT'] = getFinishMaterial({type:MAT_CAR_WALL_FINISH_D})

      const disableBufferRail = jsonLogic.apply(product.rules.variousFilteringRules, refilterTest)
      
      return !disableBufferRail
    } else {
      return true
    }

  })

  const [ disabledPositions, setDisabledPositions ] = useState([])
  const [ disabledLayouts, setDisabledLayouts ] = useState([])

  const bufferRailsData = (product.componentsData && product.componentsData.accessories && product.componentsData.accessories.bufferRails)
        ? product.componentsData.accessories.bufferRails
        : {}

  const componentId = getComponentId({ type: TYP_CAR_BUFFER_RAIL })
  const positions = getPositions({ type: TYP_CAR_BUFFER_RAIL })

  const updateDisabled = () => {
    if(product.rules && product.rules.bufferPositions ) {
      const cWallFinish = getFinish({type: MAT_CAR_WALL_FINISH_C})
      const cWallMaterial = getMaterial({type: MAT_CAR_WALL_FINISH_C, finish:cWallFinish})

      const test={}
      test['PRODUCT'] = product.product;
      test['TYPE'] = getDesignProperty('carType');
      test['DECO'] = (getComponentId({type:TYP_CAR_WALL_ADD_DECO_PACKAGE}) || 'none');
      test['CWALL_MAT'] = cWallMaterial;
      test['MIRROR'] = getComponentId({type:TYP_CAR_MIRROR});
      test['MIRROR_POS'] = getPositions({type:TYP_CAR_MIRROR});
      test['COP1'] = getComponentId({type:TYP_COP_PRODUCT_1});
      test['COP1_POS'] = (getPositions({type:TYP_COP_PRODUCT_1}) || []).join('');
      test['COP2'] = getComponentId({type:TYP_COP_2});
      test['COP2_POS'] = (getPositions({type:TYP_COP_2}) || []).join('');
      test['SCENIC'] = getPositions({type:TYP_CAR_GLASS_WALL_C});
      test['SCENICTYPE'] = getComponentId({type:TYP_CAR_GLASS_WALL_C});
      test['BufferId'] = getComponentId({type:TYP_CAR_BUFFER_RAIL});
      const newDisabledPositions = jsonLogic.apply(product.rules.bufferPositions, test)
      const dbDisabledPositions = bufferRailsData.positions.filter(pos => pos.disabled).map(item=>item.id)
      const dbDisabledLayouts = bufferRailsData.layouts.filter(pos => pos.disabled).map(item=>item.id)
      const dbAllowedLayouts = bufferRailsData.layouts.filter(pos => !pos.disabled).map(item=>item.id)

      const combinedDisabledPositions = _.union(newDisabledPositions, dbDisabledPositions)
      const combinedDisabledLayouts = _.union(newDisabledPositions, dbDisabledLayouts)
      const combinedAllowedLayouts =dbAllowedLayouts.filter(item => newDisabledPositions.indexOf(item) === -1 )

      setDisabledPositions(combinedDisabledPositions)
      setDisabledLayouts(combinedDisabledLayouts)
        // no walls are allowed
      if( componentId && (['B','C','D']).every( item => (combinedDisabledPositions.indexOf(item) !== -1) ) && positions && positions.length ) { //&& (getPositions({type:TYP_CAR_MIRROR}) || []).length 
        setPositions({ type: TYP_CAR_BUFFER_RAIL, positions: [] })

        // no positions set yet and C wall is allowed
      } else if( componentId && combinedDisabledPositions.indexOf('C') === -1 && !positions ) {
        setPositions({ type: TYP_CAR_BUFFER_RAIL, positions: ['C', ...combinedAllowedLayouts] })

        // no positions set yet and C wall is not allowed, take the first available wall
      } else if ( componentId && !positions ){
        setPositions({ type: TYP_CAR_BUFFER_RAIL, positions: [ (['B','C','D']).find(item => disabledPositions.indexOf(item) === -1), ...combinedAllowedLayouts ] })
      }
    }

  }
  // on component mount
  useEffect(() => {
    if (!componentId) {
      setDefaultComponent({ type: TYP_CAR_BUFFER_RAIL })
    }
  }, [])

  useEffect(() => {
    updateDisabled()
  }, [componentId])

  useEffect(()=> {
    if(!getPositions({ type: TYP_CAR_BUFFER_RAIL }) && componentId) {
      setPositions({ type: TYP_CAR_BUFFER_RAIL, positions: positions })
    } 
  }, [positions])

  const onBackClick = () => {
    setEditView('accessories')
  }

  return (      
    <div className="BufferRails">        
      <EditorLayout heading={getText('ui-buffer-rails-heading')} action={getText('ui-general-back')} actionClickHandler={onBackClick} >
        <ScrollBox>

          <HeadingComponent heading={getText('ui-buffer-rails-positioning')} info={getText('ui-buffer-rails-positioning-i')} padding="sm" />
          <PositionSelector 
            positions={positions} 
            carType={design.carType}
            disabledPositions={disabledPositions}
            onChange={newPositions => setPositions({ type: TYP_CAR_BUFFER_RAIL, positions: newPositions })} 
          />

          <HeadingComponent heading={getText('ui-buffer-rails-type')} info={getText('ui-buffer-rails-type-i')} padding="sm" border="top" />
          <ImageTitle 
            items={components} 
            className="bufferRailTiles" 
            selectedId={componentId}
            onChange={(id) => setComponent({type: TYP_CAR_BUFFER_RAIL, component: id})} 
          />

          <HeadingComponent heading={getText('ui-buffer-rails-finish')} info={getText('ui-buffer-rails-finish-i')} padding="sm" border="top" />
          <FinishAccordionItem
            finishType={ MAT_CAR_BUFFER_RAIL }
            border="bottom"
            finishFilter={ (item => { 
              if(!product?.rules?.bufferRailFinishes) return true
              return jsonLogic.apply( product.rules.bufferRailFinishes, { PRODUCT: (product || {}).product, BUFFERRAIL: componentId, FINISH:item.id})
            } )}
          />

          <HeadingComponent heading={getText('ui-buffer-rails-layout')} info={getText('ui-buffer-rails-layout-i')} padding="sm" />
          <BufferRailLayout 
            positions={positions}
            disabledPositions={disabledLayouts} 
            onChange={newPositions => setPositions({ type: TYP_CAR_BUFFER_RAIL, positions: newPositions})} />

          <div style={{height:'20px'}} />
          
        </ScrollBox>
      </EditorLayout>
    </div>
  )
}
export default BufferRails;