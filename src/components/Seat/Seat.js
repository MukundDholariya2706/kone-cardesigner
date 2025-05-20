import './Seat.scss';
import React, { useContext, useState, useEffect } from 'react';
import _ from 'lodash'
import jsonLogic from 'json-logic-js';

import { ProductContext } from '../../store/product/ProductProvider';
import { DesignContext } from '../../store/design/DesignProvider';
import EditorLayout from '../EditorLayout';
import ImageTitle from '../ImageTitle'
import CarShapeSelector from '../CarShapeSelector'
import SwitchButton from '../SwitchButton'
import { LayoutContext } from '../../store/layout/LayoutProvider';
import { TranslationContext } from '../../store/translation/TranslationProvider';
import { TYP_CAR_SEAT, TYP_COP_PRODUCT_1, TYP_COP_2, TYP_CAR_MIRROR, TYP_CAR_BUFFER_RAIL, TYP_CAR_HANDRAIL, TYP_CAR_WALL_ADD_DECO_PACKAGE, TYP_CAR_GLASS_WALL_C, SEAT_IN_CX_PRODUCTS } from '../../constants';
import HeadingComponent from '../HeadingComponent/HeadingComponent';
import ScrollBox from '../ScrollBox';

const carshapeSelectorExceptionProducts = ['monospace-700','monospace-dev','minispace', 'marine-monospace-700', 'marine-minispace-700', ...SEAT_IN_CX_PRODUCTS]

const Seat = (props) => {
  
  const { getText } = useContext(TranslationContext);
  const { setEditView } = useContext(LayoutContext);
  const { product, getComponents } = useContext(ProductContext);
  const { design, getComponent: getComponentId, setComponent, getPositions, setPositions, setDefaultComponent, getDesignProperty } = useContext(DesignContext);

  const componentId = getComponentId({ type: TYP_CAR_SEAT })
  const positions = getPositions({ type: TYP_CAR_SEAT })

  const [ disabledPositions, setDisabledPositions ] = useState([])
  const [ components, setComponents ] = useState([])
  const [ toggle, setToggle ] = useState(true)

  const seatsData = product.componentsData.accessories.seats


  const update = () => {
    setComponents(getComponents({ type: TYP_CAR_SEAT }))
    if(getComponentId({type: TYP_CAR_SEAT})) setToggle(true)
    updateDisabled()

  }

  const updateDisabled = () => {

    const dbDisabledPositions = seatsData.positions.filter(pos => pos.disabled).map(item => item.id)

    if(product && product.rules && product.rules.seatPositions ) {

      const test={}
      test['PRODUCT'] = product.product;
      test['CAR_TYPE'] = design.carType;
      test['PANELORIENTATION'] = getDesignProperty('panelOrientation');
      test['COP1'] = getComponentId({type:TYP_COP_PRODUCT_1}) || null;
      test['COP2'] = getComponentId({type:TYP_COP_2}) || null;
      test['COP1_POS'] = (getPositions({type:TYP_COP_PRODUCT_1}) || []).join('');
      test['COP2_POS'] = (getPositions({type:TYP_COP_2}) || []).join('');
      test['MIRROR_POS'] = (getPositions({type:TYP_CAR_MIRROR}) || []);
      test['BUFFER_POS'] = (getPositions({type:TYP_CAR_BUFFER_RAIL}) || []);
      test['HANDRAIL_POS'] = (getPositions({type:TYP_CAR_HANDRAIL}) || []);
      test['DECO'] = (getComponentId({type:TYP_CAR_WALL_ADD_DECO_PACKAGE}) || 'none');
      test['SCENIC'] = getPositions({type:TYP_CAR_GLASS_WALL_C});
      test['SCENICTYPE'] = getComponentId({type:TYP_CAR_GLASS_WALL_C});
      
      const disablePositionsList = jsonLogic.apply(product.rules.seatPositions, test)
      console.log({test,disablePositionsList})
  // Adding the disabled positions from the database to the list of arrays.
      let combinedDisabledPositions;
      if(disablePositionsList && disablePositionsList.length > 0) {
        combinedDisabledPositions = _.union(disablePositionsList, dbDisabledPositions)
      } else {
        combinedDisabledPositions = dbDisabledPositions
      }
      setDisabledPositions(combinedDisabledPositions)

        // no positions are allowed
      if( getComponentId({type:TYP_CAR_SEAT}) && (['B1','BX','B2','D1','DX','D2','C1','CX','C2']).every( item => (combinedDisabledPositions.indexOf(item) !== -1) ) && positions && positions.length ) { //&& (getPositions({type:TYP_CAR_MIRROR}) || []).length 
        setPositions({ type: TYP_CAR_SEAT, positions: [] })

        // no positions set yet and D1 is allowed
      } else if( getComponentId({type:TYP_CAR_SEAT}) && combinedDisabledPositions.indexOf('D1') === -1 && !positions) {
        setPositions({ type: TYP_CAR_SEAT, positions: ['D1'] })

        // no positions set yet and D1 is not allowed, take the first available position
      } else if ( getComponentId({type:TYP_CAR_SEAT}) && !positions ){
        setPositions({ type: TYP_CAR_SEAT, positions: [ (['B1','BX','B2','D1','DX','D2','C1','CX','C2']).find(item => combinedDisabledPositions.indexOf(item) === -1) ] })
      }
    }

  }

  // on component mount
  useEffect(() => {
    update()


  }, [])
  
  // on product change
  useEffect(() => {
    update()
  }, [product])

  useEffect(() => {
    updateDisabled()
  }, [design])


  useEffect(() => {
    if(toggle === undefined) return;
    if(toggle){
      if(!getComponentId({type: TYP_CAR_SEAT})) {
        setDefaultComponent({ type: TYP_CAR_SEAT })
      }
    } else {
      setComponent({type: TYP_CAR_SEAT, component: null})
    }

    if(!toggle) setComponent({ type: TYP_CAR_SEAT, component: null})
  }, [toggle])
  
  const onBackClick = () => {
    setEditView('accessories')
  }

  const handleToggle = (e) => {
    setToggle(e)
  }
  const handlePosition = (e) => {
    setPositions({ type: TYP_CAR_SEAT, positions: [e]})
  }

  return (      
    <div className="Seat">        
      <EditorLayout heading={getText('ui-seat-heading')} action={getText('ui-general-back')} actionClickHandler={onBackClick} >
        <ScrollBox>
          <SwitchButton toggle={toggle} label={getText('ui-seat-add')} onChange={e => handleToggle(e)} />  
          {toggle ?
            <>

              <HeadingComponent heading={getText('ui-seat-type')} info={getText('ui-seat-type-i')} padding="sm" border="top" />

              <div className="image">
                <ImageTitle items={components} onChange={id => setComponent({ type: TYP_CAR_SEAT, component: id })} selectedId={componentId} wide={true} />
              </div>

              <HeadingComponent heading={getText('ui-seat-select-position')} info={getText('ui-seat-select-position-i')} padding="sm" border="top" />

              <CarShapeSelector 
                shape={ (carshapeSelectorExceptionProducts.indexOf(product.product) !== -1) ? 'selectableBackwall' : ''} selected={[positions]} 
                selectableWalls={ (carshapeSelectorExceptionProducts.indexOf(product.product) !== -1) ?['B', 'C', 'D'] :['B', 'D']}
                onChange={newPosition => handlePosition(newPosition)} disabled={[disabledPositions]} 
                labelLeft={getText('ui-general-left')}
                labelRight={getText('ui-general-right')}
                cxPieceEnabled={ (SEAT_IN_CX_PRODUCTS.indexOf(product.product) !== -1) }
              />
              
            </>
          : null}
          <div style={{height:'20px'}} />
        </ScrollBox>
      </EditorLayout>
    </div>
  )
}
export default Seat;