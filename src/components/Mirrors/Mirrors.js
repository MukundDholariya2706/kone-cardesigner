import './Mirrors.scss'
import React, { useContext, useState, useEffect } from 'react';
import jsonLogic from 'json-logic-js';
import _ from 'lodash'

import { ProductContext } from '../../store/product';
import { DesignContext } from '../../store/design';
import EditorLayout from '../EditorLayout';
import MirrorType from '../MirrorType/MirrorType';
import PositionSelector from '../PositionSelector';
import InfoBox from '../InfoBox';
import { TranslationContext } from '../../store/translation';
import { LayoutContext } from '../../store/layout';
import { TYP_CAR_MIRROR, TYP_CAR_CEILING, TYP_COP_PRODUCT_1, TYP_COP_2, TYP_CAR_WALL_ADD_DECO_PACKAGE, MAT_CAR_WALL_FINISH_C, TYP_CAR_MIRROR_2, WIDE_ANGLE_MIRROR, TYP_CAR_GLASS_WALL_C,} from '../../constants';
import HeadingComponent from '../HeadingComponent/HeadingComponent';
import ScrollBox from '../ScrollBox';
import Checkbox from '../Checkbox';
import ListComponent from '../ListComponent';
import { isTrueTypeCar } from '../../utils/design-utils'


const Mirrors = () => {
  
  const { getText } = useContext(TranslationContext);
  const { setEditView } = useContext(LayoutContext);
  const { product, getComponents, getMaterial } = useContext(ProductContext);
  const { getComponent: getComponentId, setComponent, getFinish,  setDefaultComponent, getPositions, setPositions, design } = useContext(DesignContext);

  const mirrorsData = product.componentsData.accessories.mirrors

  const [ disabledPositions, setDisabledPositions ] = useState([])
  const [ availableComponents, setAvailableComponents ] = useState(getComponents({ type: TYP_CAR_MIRROR }))

  const componentId = getComponentId({ type: TYP_CAR_MIRROR })
  const positions = getPositions({ type: TYP_CAR_MIRROR }) // || ['C']

  const selectionIsRadiotype = jsonLogic.apply(product.rules.variousFilteringRules,{filteringRULE:'mirrorSelectionTypeRule',PRODUCT:product.product}) || false

  const update = () => {
    updateDisabled()
  }

  const updateDisabled = () => {
    if(product.rules && product.rules.mirrors && product.rules.mirrorTypes ) {

      let cop1Pos = getPositions({ type: TYP_COP_PRODUCT_1 }).map(item => {
        if(item.indexOf('B') !== -1) {
          return 'B';
        } else if(item.indexOf('D') !== -1) {
          return 'D';
        }
        return undefined;
      });

      let cop2Pos = ( getPositions({type: TYP_COP_2}) || []).map(item => {
        if(item.indexOf('B') !== -1) {
          return 'B';
        } else if(item.indexOf('D') !== -1) {
          return 'D';
        }
        return undefined;
      });

      const cWallFinish = getFinish({type: MAT_CAR_WALL_FINISH_C})
      const cWallMaterial = getMaterial({type:MAT_CAR_WALL_FINISH_C, finish:cWallFinish})
      const test={}
      test['PRODUCT'] = product.product;
      test['TYPE'] = design.carType;
      test['BACKWALLTYPE'] = design.backWallPanelingType || 0;
      test['DECO'] = getComponentId({type:TYP_CAR_WALL_ADD_DECO_PACKAGE}) || 'none';
      test['CWALL_MAT'] = cWallMaterial
      test['MIRROR'] = getComponentId({type:TYP_CAR_MIRROR});
      test['CEILING'] = getComponentId({type: TYP_CAR_CEILING});
      test['COPPOS'] = cop1Pos.concat((cop2Pos || []));
      test['MIRROR_POS'] = getPositions({type:TYP_CAR_MIRROR}) || null
      test['REGULATIONS'] = (design.regulations && design.regulations.length>0) ?design.regulations :[]
      test['SCENIC'] = getPositions({type:TYP_CAR_GLASS_WALL_C}) || null;
      console.log({test})
      const newDisabledPositions = jsonLogic.apply(product.rules.mirrors, test)
      const dbDisabledPositions = mirrorsData.positions
        .filter(pos => pos.disabled).map(item=>item.id)
      const combinedDisabledPositions = _.union(newDisabledPositions, dbDisabledPositions)
      setDisabledPositions(combinedDisabledPositions)

        // no walls are allowed
      if( getComponentId({type:TYP_CAR_MIRROR}) && (['B','C','D']).every( item => (combinedDisabledPositions.indexOf(item) !== -1) ) && positions && positions.length ) { //&& (getPositions({type:TYP_CAR_MIRROR}) || []).length 
        setPositions({ type: TYP_CAR_MIRROR, positions: [] })

        // no positions set yet and C wall is allowed
      } else if( getComponentId({type:TYP_CAR_MIRROR}) && combinedDisabledPositions.indexOf('C') === -1 && !positions ) {
        setPositions({ type: TYP_CAR_MIRROR, positions: ['C'] })

        // no positions set yet and C wall is not allowed, take the first available wall
      } else if ( getComponentId({type:TYP_CAR_MIRROR}) && !positions ){
        setPositions({ type: TYP_CAR_MIRROR, positions: [ (['B','C','D']).find(item => combinedDisabledPositions.indexOf(item) === -1) ] })
      }
      const validComponents = (getComponents({ type: TYP_CAR_MIRROR }) || []).filter(item =>{
        const test={}
        test['PRODUCT'] = product.product;
        test['TYPE'] = design.carType;
        test['DECO'] = getComponentId({type:TYP_CAR_WALL_ADD_DECO_PACKAGE}) || 'none';
        test['CWALL_MAT'] = cWallMaterial
        test['MIRROR'] = item.id;
        test['CEILING'] = getComponentId({type: TYP_CAR_CEILING});
        test['COPPOS'] = cop1Pos.concat((cop2Pos || []));
        test['MIRROR_POS'] = getPositions({type:TYP_CAR_MIRROR}) || null
        test['SCENIC'] = getPositions({type:TYP_CAR_GLASS_WALL_C}) || null;
        const newDisabledPositions = jsonLogic.apply(product.rules.mirrors, test)
        const dbDisabledPositions = mirrorsData.positions
        .filter(pos => pos.disabled).map(item=>item.id)
        const combinedDisabledPositions = _.union(newDisabledPositions, dbDisabledPositions)
        return jsonLogic.apply(product.rules.mirrorTypes, {PRODUCT: product.product, CEILING:getComponentId({type: TYP_CAR_CEILING}),  MIRROR: item.id, DISABLED: combinedDisabledPositions, SELECTED: positions})
      })

      setAvailableComponents(validComponents)
    }

  }
  
  const canAddWAM = () => {

    if(design && !isTrueTypeCar( design.carType )) {
      return false
    }

    if( getComponents({type:TYP_CAR_MIRROR_2}).length<1) {
      return false
    }

    if(product.rules && product.rules.variousFilteringRules
      && jsonLogic.apply(product.rules.variousFilteringRules, {'filteringRULE':'wideAngleMirror', 'CEILING':getComponentId({type:TYP_CAR_CEILING})} ) ) {
        return true
    }
    
    return false
  }

  // on component mount
  useEffect(() => {
    if (!componentId) {
      setDefaultComponent({ type: TYP_CAR_MIRROR })
    }
    update()
  }, [])
  
  // on product change
  useEffect(() => {
    update()
  }, [product])


  useEffect(() => {
    if(!getPositions({ type: TYP_CAR_MIRROR })) {
      setPositions({ type: TYP_CAR_MIRROR, positions: positions })
    }
    updateDisabled()
  }, [design])

    const onBackClick = () => {
      setEditView('accessories')
    }

    const onWideAnglePositionChange = (value,pos) => {

      if(value && !getComponentId({type:TYP_CAR_MIRROR_2})) {
        setComponent({type: TYP_CAR_MIRROR_2, component: WIDE_ANGLE_MIRROR, positions:[pos]})
        return
      }

      if(!value && getComponentId({type:TYP_CAR_MIRROR_2})) {
        const currentPos = getPositions({type:TYP_CAR_MIRROR_2})
        if( currentPos.indexOf(pos) !== -1) {
          if(currentPos.length < 2) {
            setComponent({type:TYP_CAR_MIRROR_2, component:null})
          } else {
            setPositions({type:TYP_CAR_MIRROR_2, positions:[...currentPos.filter(item => item != pos)]})
          }
        }
        return
      }

      if(value && getComponentId({type:TYP_CAR_MIRROR_2})) {
        const currentPos = getPositions({type:TYP_CAR_MIRROR_2})
        if( currentPos.indexOf(pos) === -1) {
          setPositions({type:TYP_CAR_MIRROR_2, positions:[...currentPos,pos]})
        }
      }

      return
    }

    return (
      <div className="Mirrors">
        <EditorLayout heading={getText('ui-general-mirrors')} action={getText('ui-general-back')} actionClickHandler={onBackClick}>
          <ScrollBox>
            <HeadingComponent heading={getText('ui-mirrors-position')} info={getText('ui-mirrors-position-i')} padding="sm"  />
            <PositionSelector carType={design.carType} positions={positions} disabledPositions={disabledPositions} onChange={newPositions => setPositions({ type: TYP_CAR_MIRROR, positions: newPositions })} radioType={selectionIsRadiotype} />
            <InfoBox text={getText('ui-mirrors-info')} style={{ marginBottom: '10px' }} />
            <HeadingComponent heading={getText('ui-mirrors-type')} info={getText('ui-mirrors-type-i')} padding="sm" border="top" />
            <MirrorType types={getComponents({ type: TYP_CAR_MIRROR })} enabledTypes={availableComponents} selected={getComponentId({type:TYP_CAR_MIRROR})} onChange={newType => setComponent({type:TYP_CAR_MIRROR, component:newType})} />

            { canAddWAM() &&
              <>
                <HeadingComponent heading={getText('ui-wide-angle-mirror')} info={getText('ui-wide-angle-mirror-i')} padding="sm" border="top" />
                <ListComponent padding='md'>
                  <Checkbox labelText={getText('ui-wide-angle-mirror-back-wall')} selected={(getPositions({type:TYP_CAR_MIRROR_2}) || []).indexOf('C') !== -1} onChange={pos => onWideAnglePositionChange(pos,'C')} />
                  <Checkbox labelText={getText('ui-wide-angle-mirror-front-wall')} selected={(getPositions({type:TYP_CAR_MIRROR_2}) || []).indexOf('A') !== -1} onChange={pos => onWideAnglePositionChange(pos,'A')} />
                </ListComponent>
                <InfoBox text={getText('ui-wide-angle-mirror-info')} icon="icon-wheelchair" />
              </>
            }

            <div style={{height:'20px'}} />
          </ScrollBox>
        </EditorLayout>
      </div>
    )
}

export default Mirrors