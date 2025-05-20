import './FloorEditor.scss';
import 'ie-array-find-polyfill';
import React, { useContext, useEffect, useState, useMemo} from 'react';
import jsonLogic from 'json-logic-js';
import { ProductContext } from '../../store/product/ProductProvider'
import { DesignContext } from '../../store/design/DesignProvider'
import { TranslationContext } from '../../store/translation/TranslationProvider';

import InfoBox from '../InfoBox';
import EditorLayout from '../EditorLayout';
import ListComponent from '../ListComponent';
import GridComponent from '../GridComponent';
import TileComponent from '../TileComponent';
import HeadingComponent from '../HeadingComponent/HeadingComponent';
import { MAT_CAR_FLOORING, TYP_CAR_FLOORING, EDIT_VIEW_CUSTOM_FLOOR_FINISH, EDIT_VIEW_FLOOR_FINISH_MIXER } from '../../constants'
import Description from '../Description';
import ScrollBox from '../ScrollBox';
import ToggleButtons from '../ToggleButtons';
import Button from '../Button';
import { LayoutContext } from '../../store/layout/LayoutProvider';
import CustomFinishes from '../CustomFinishes';
import TermsOfService from '../TermsOfService';
import { sortFinishes } from '../../utils/generalUtils'


const VIEW_KONE_FLOORS = 'kone-floors';
const VIEW_CUSTOM_FLOORS = 'custom-floors';


function isFloorMixingAllowed(product = {}) {
  return product.mixableFloorFinishes
}

/**
 * Renders out the header part of the floor editing view
 *  - uses view as view mode in state 
 *  - uses DesingContext, ComponentContext, MaterialContext as store
 * @function FloorEditor Header renderer
 * @param {Object} props Propertied passed to this renderer
 */
const FloorEditor = (props) => {
  const { getText } = useContext(TranslationContext);
  const productCtx = useContext(ProductContext);
  const { loading, product, getFinishes, getMaterials, getMaterial, isCustomFinish } = productCtx
  const { getFinish, setFinish, setDefaultComponent, getComponent, setComponent, design } = useContext(DesignContext)
  const layout = useContext(LayoutContext);
  
  const finish = getFinish({ type: MAT_CAR_FLOORING })

  const custom = isCustomFinish(finish)
  const [ view, setView ] = useState( custom ? VIEW_CUSTOM_FLOORS : VIEW_KONE_FLOORS )

  const update = () => {

    if(product && product.rules && product.rules.floorComponentActions) {
      let test={}
      test['FLOOR_MATERIAL'] = finish ?getMaterial({ finish: finish, type: MAT_CAR_FLOORING }) :null;
      test['PRODUCT'] = design.product;
      const actions =  jsonLogic.apply(product.rules.floorComponentActions, test)
  
      if(actions && actions.length) {

        for (let i=0; i<actions.length; i++) {
          if(actions[i]) {
            const actionComponent = actions[i][0];
            const actionDo = actions[i][1];
            switch (actionDo) {
              case 'add':
                if( !getComponent({type: actionComponent}) ) {
                  setDefaultComponent({type:actionComponent})
                }
                break;
              case 'remove':
                  if( getComponent({type: actionComponent}) ) {
                    setComponent({type:actionComponent, component: null})
                  }
                  break;
              default:
                break;
            }
          }
        }
      }
    }
  }

  useEffect(() => {
    if (!product) {
      setDefaultComponent({ type: TYP_CAR_FLOORING })
    }
  }, [])

  useEffect(() => {
    update()
  }, [product])

  const floorFinishes = useMemo(() => {
    
    if(product?.componentsData?.floors) {
      const filterOutFinishes = []
      product.componentsData.floors.forEach(material => {
        filterOutFinishes.push( {
          ...material,
          finishes : material.finishes.filter(finishItem =>{

            return jsonLogic.apply(product.rules.variousFilteringRules, {filteringRULE:'floorFinishRule', FINISH:finishItem.id, CARSHAPE:design.carShape, PRODUCT: product?.product, PREDESIGN: design?.originalSapId})
          })
        })        
      });
      const filterOutMaterials = filterOutFinishes.filter(material => material?.finishes?.length)
      return filterOutMaterials
    } else {
      // if there are no componentsData.floors
      const finishes = getFinishes({ type: MAT_CAR_FLOORING }).filter(finishItem => {
        return jsonLogic.apply(product.rules.variousFilteringRules, {filteringRULE:'floorFinishRule', FINISH:finishItem.id, CARSHAPE:design.carShape, PRODUCT: product?.product, PREDESIGN: design?.originalSapId})
      })
      const materials = getMaterials({ type: MAT_CAR_FLOORING })
      return materials.map(({ id, name }) => {
        return {
          id,
          name,
          finishes: finishes.filter(item => ( item.materials || []).indexOf(id) !== -1 && !item.custom )
        }
      }).filter(({ finishes = []}) => finishes.length > 0 )
    }
  }, [product])   

  const getFinishTitle = (item) => {
    if(!item) return 

    if(item.mixed && item.finishes) {
      const floorFinishes = item.finishes
      let finalTitle=''
      if(floorFinishes[0] && floorFinishes[0] !== '') {
        finalTitle += getText('pdf-floor-base')+': '+getText(floorFinishes[0])
      }
      if(floorFinishes[1] && floorFinishes[1] !== '') {
        finalTitle += ', '+getText('pdf-floor-frame')+': '+getText(floorFinishes[1])
      }
      if(floorFinishes[2] && floorFinishes[2] !== '') {
        finalTitle += ', '+getText('pdf-floor-list')+': '+getText(floorFinishes[2])
      }

      return finalTitle
    } else {
      return getText(item.id)
    }
  }

  const getFinishSubtitle = (item) => {
    if(!item) return 

    if(item.mixed && item.finishes) {
      return ''
    } else {
      return getText(item.name)
    }
    
  }

  useMemo(() => {
    if(floorFinishes)
      {
        floorFinishes.forEach(element => {
          sortFinishes(element.finishes);
        });
      }
  },[floorFinishes]);

  if (loading) {
    return null
  }

  return (      
    <div className="FloorEditor">        
      <EditorLayout heading={getText('ui-floor-heading')}>
        <ToggleButtons 
          content={[
            { value: VIEW_KONE_FLOORS, label: getText('ui-floor-kone') },
            { value: VIEW_CUSTOM_FLOORS, label: getText('ui-floor-custom') }
          ]} 
          selectedButton={ view } 
          onChange={ value => setView(value) }
          style={{ marginBottom: '20px' }} 
        />

        <ScrollBox>

          { view === VIEW_KONE_FLOORS && 
            <ListComponent>
              {/* <HeadingComponent heading={getText('ui-floor-finish')} info={getText('ui-floor-finish-i')} padding="sm" /> */}
              { (product?.businessSpecification?.market !== 'ENA') &&
                <Description text={getText('ui-floor-materials-desc')} padding="sm" />
              }
              { (product?.businessSpecification?.market === 'ENA') &&
                <InfoBox text={getText('ui-floor-editor-info')} style={{ marginBottom: '20px' }} />
              }
              <ListComponent gap="md" padding="md" >
                {floorFinishes.map((materialItem, key)=> {
                  return (
                    <React.Fragment key={key}>
                      <HeadingComponent heading={getText(materialItem.name)} padding="sm" />
                      <GridComponent cols="3" gap="sm">
                        { materialItem.finishes.map((finishItem, key) => {
                          return (
                            <TileComponent 
                              key={key}
                              title={getFinishTitle(finishItem)} 
                              subtitle={getFinishSubtitle(finishItem)} 
                              showSapId={product?.businessSpecification?.market !== 'ENA'} 
                              image={finishItem.image} 
                              icon={finishItem.premium && "icon-premium"}
                              iconTitle={getText('ui-general-extended-lead-time')} 
                              selected={finishItem.id === finish} 
                              onClick={id => setFinish({ type: MAT_CAR_FLOORING, finish: finishItem.id })} 
                            /> 
                          )
                        }) }
                      </GridComponent>
                    </React.Fragment>
                  )
                })}

              </ListComponent>                
            </ListComponent>
          }

          { view === VIEW_CUSTOM_FLOORS && 
            <CustomFinishes 
              type={MAT_CAR_FLOORING} 
              finishType={MAT_CAR_FLOORING}
              finish={finish}
              setFinish={(finishId, mixed) => {
                setFinish({ type: MAT_CAR_FLOORING, finish: finishId, custom: true, mixed})
              }}
            /> 
          }

          <div style={{height:'70px'}} />
          
        </ScrollBox> 
        
        <div className="action-buttons">
          <TermsOfService getText={getText}>
            <Button icon="icon-import" theme={['sm', 'outline', 'center', 'with-icon']} onClick={e => layout.setEditView(EDIT_VIEW_CUSTOM_FLOOR_FINISH) } >{getText('ui-general-import')}</Button>
          </TermsOfService>
          { isFloorMixingAllowed(product) &&
            <Button 
              icon="icon-mix" 
              theme={['sm', 'outline', 'center', 'with-icon']} 
              onClick={e => layout.setEditView(EDIT_VIEW_FLOOR_FINISH_MIXER) }>{getText('ui-general-mix')}</Button>
          }
        </div>

      </EditorLayout>
    </div>
  )
}
export default FloorEditor;