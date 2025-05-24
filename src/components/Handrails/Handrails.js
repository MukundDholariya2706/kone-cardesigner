import './Handrails.scss'
import React, { useState, useContext, useEffect } from 'react'
import nr from 'normalize-range';
import jsonLogic from 'json-logic-js';
import objectHash from 'object-hash';

import EditorLayout from '../EditorLayout'
import { LayoutContext } from '../../store/layout';
import { ProductContext } from '../../store/product/ProductProvider';
import { DesignContext } from '../../store/design/DesignProvider';
import { Context3d } from '../../store/3d/shader-lib/Provider3d';
import { TranslationContext } from '../../store/translation/TranslationProvider';

import ImageTitle from '../ImageTitle'
import PositionSelector from '../PositionSelector/PositionSelector';
import { TYP_CAR_HANDRAIL, MAT_CAR_HANDRAIL, TYP_CAR_WALL_ADD_DECO_PACKAGE, TYP_CAR_GLASS_WALL_C,
    TYP_COP_PRODUCT_1, TYP_COP_2, MAT_CAR_WALL_FINISH_C, TYP_COP_HORIZONTAL, TYP_CAR_WALL_C, DECO_GLASS_MATERIAL } from '../../constants';
import ListComponent from '../ListComponent';
import HeadingComponent from '../HeadingComponent/HeadingComponent';
import GridComponent from '../GridComponent';
import TileComponent from '../TileComponent';
import ScrollBox from '../ScrollBox';
import { isTrueTypeCar } from '../../utils/design-utils'


const Handrails = () => {
  const { getText } = useContext(TranslationContext);
  const { setEditView } = useContext(LayoutContext);
  const { product, getFinishes, getComponents, getMaterial } = useContext(ProductContext);
  const { design, getFinish: getFinishId, getComponent: getComponentId, setComponent, setFinish,
        setDefaultComponent, getPositions, setPositions, getDesignProperty, hasHorizontalCop } = useContext(DesignContext);
  const { cameraController } = useContext(Context3d)
  
  const [ components, setComponents ] = useState([])
  const [ validComponents, setValidComponents ] = useState([])
  const [ finishes, setFinishes ] = useState([])
  const [ currentPositions, setCurrentPositions ] = useState([])

  const componentId = getComponentId({ type: TYP_CAR_HANDRAIL })
  const finishId = getFinishId({ type: MAT_CAR_HANDRAIL })

  const handrailsData = product.componentsData.accessories.handrails
  // The first position that has not been disabled.
  const disabledPositions = handrailsData.positions.filter(p => {
    if(p.disabled) return 1
    if(!product?.rules?.variousFilteringRules) return 0
    return (jsonLogic.apply(product.rules.variousFilteringRules, {'filteringRULE':'handrailPositionDisable', 'PRODUCT':product.product,
      'POSITION':p.id,
      'REGULATIONS':design.regulations ? design.regulations : [], 
      'DECO':(getComponentId({type:TYP_CAR_WALL_ADD_DECO_PACKAGE}) || ''), 
      'COP1_POS':(getPositions({type:TYP_COP_PRODUCT_1}) || []).join(''), 
      'COP2_POS':(getPositions({type:TYP_COP_2}) || []).join(''),            
      'HORCOP':(getComponentId({type:TYP_COP_HORIZONTAL}) || ''), 'HORPOS':(getPositions({type:TYP_COP_HORIZONTAL}) || [])}) )
  }).map(p=> {return p.id})

  const defaultPositions = [handrailsData.positions.find(p => ( !p.disabled && disabledPositions.indexOf(p.id) === -1 )).id]
  let positions = getPositions({ type: TYP_CAR_HANDRAIL });

  if (positions && positions.some(position => disabledPositions.includes(position))) {
    positions = positions.filter(position => !disabledPositions.includes(position));
    setPositions({ type: TYP_CAR_HANDRAIL, positions });
  }
  const update = () => {
    setComponents(getComponents({ type: TYP_CAR_HANDRAIL }))
    const hrFinishes = getFinishes({ type: MAT_CAR_HANDRAIL })
    const horCop = getComponentId({type: TYP_COP_HORIZONTAL})
    let correctFinishes = hrFinishes
    if(horCop && product?.rules?.variousFilteringRules ) {
      correctFinishes = hrFinishes.filter(item => {
        return (jsonLogic.apply(product.rules.variousFilteringRules, {'filteringRULE':'horCopFinishFilter', 'COP':horCop, 'FINISH':item.sapId}))
      })
    }
    setFinishes(correctFinishes)
    setCurrentPositions(getPositions({ type: TYP_CAR_HANDRAIL }) || defaultPositions)
  }

  const updateDisabled = () => {
    if(product && product.rules && product.rules.handrailPositions) {
      const cWallFinish = getFinishId({type: MAT_CAR_WALL_FINISH_C})
      let cWallMaterial
      if(design?.components?.find(item => item.componentType === TYP_CAR_WALL_C)?.parts?.length>2) {
        const cParts = design.components.find(item => item.componentType === TYP_CAR_WALL_C).parts.map(part => {
          return product?.componentsData?.walls?.materials?.find(mat => { return mat?.finishes.find(fin =>fin.id === part.finish ) })?.id
        })
        if(cParts.indexOf(DECO_GLASS_MATERIAL) !== -1) {
          cWallMaterial = DECO_GLASS_MATERIAL
        }
      } else {
        cWallMaterial = getMaterial({type:MAT_CAR_WALL_FINISH_C, finish:cWallFinish})
      }
      const newComponents = getComponents({ type: TYP_CAR_HANDRAIL }).filter(item => {
        let test={}
        test['TEST_TYPE'] = 'disableComponents';
        test['PRODUCT'] = product.product;
        test['SHAPE'] = design.carShape;
        test['REGULATIONS'] = (design.regulations && design.regulations.length>0) ?design.regulations :[];
        test['DECO'] = (getComponentId({type:TYP_CAR_WALL_ADD_DECO_PACKAGE}) || 'none');
        test['CWALL_MAT'] = cWallMaterial
        test['WINDOW'] = getComponentId({type:TYP_CAR_GLASS_WALL_C}) || "";
        test['HANDRAIL'] = item.id;
        test['POSITIONS'] = currentPositions || [];
        test['COP1_POS'] = (getPositions({type:TYP_COP_PRODUCT_1}) || []).join();
        test['COP2_POS'] = (getPositions({type:TYP_COP_2}) || []).join();  
        test['HAS_HORCOP'] = hasHorizontalCop();  
        test['HORCOP'] = getComponentId({type:TYP_COP_HORIZONTAL}) || '';  
        test['COP2'] = getComponentId({type:TYP_COP_2}) || '';  
        test['CARTYPE'] = getDesignProperty('carType');
        test['SCENIC'] = getPositions({type:TYP_CAR_GLASS_WALL_C}) || null;
        test['PREDESIGN'] = design?.originalSapId
        return jsonLogic.apply(product.rules.handrailPositions, test)
      })
      
      if(objectHash(newComponents) !== objectHash(validComponents)) {
        setValidComponents(newComponents)
        if(!componentId) {
          setCurrentPositions([...currentPositions])
          if(newComponents.length>0) {
            setComponent({type: TYP_CAR_HANDRAIL, component:newComponents[0].id})
          }
        }
      }

      if(getPositions({ type: TYP_CAR_HANDRAIL }) && objectHash(currentPositions) !== objectHash(getPositions({ type: TYP_CAR_HANDRAIL }))) {
        setCurrentPositions(getPositions({ type: TYP_CAR_HANDRAIL }) )
      }
    }    

  }
  
  // on component mount
  useEffect(() => {
    if (!componentId) {
      setDefaultComponent({ type: TYP_CAR_HANDRAIL })
    }
    if(!getPositions({ type: TYP_CAR_HANDRAIL })) {
      if(product.offeringLocation.indexOf('ENA') !== -1) {
        setPositions({ type: TYP_CAR_HANDRAIL, positions: ['B','D'] })
      } else {
        setPositions({ type: TYP_CAR_HANDRAIL, positions: defaultPositions })
      }
    }
    if(cameraController) {
      const radianRange = nr.curry(-Math.PI, Math.PI);
      const baseRotation = cameraController._sphericalEnd.theta - radianRange.wrap(cameraController._sphericalEnd.theta);
      cameraController.rotateTo( baseRotation, Math.PI/2, true )
    }
    update()
    updateDisabled();
  }, [])

  useEffect(()=> {
    if(!getPositions({ type: TYP_CAR_HANDRAIL })) {
      setPositions({ type: TYP_CAR_HANDRAIL, positions: currentPositions })
    }

    updateDisabled();
  },[currentPositions])

  // on product change
  useEffect(() => {
    update()
    return () => {
      //
    }
  }, [product])

  useEffect(() => {
    if(!getPositions({type: TYP_CAR_HANDRAIL})) {
      setCurrentPositions(getPositions({ type: TYP_CAR_HANDRAIL }) || defaultPositions)
    }

  }, [design])

  // on component change
  useEffect(() => {
    if (product && componentId) {
      
      const handrailComponent = handrailsData.models
        .find(model => model.id === componentId)

      // TODO What should happen if the handrail component has been disabled?
      if (!handrailComponent || !handrailComponent.finishes) {
        setFinishes([])
      } else {
        const newFinishes = handrailComponent.finishes
          .filter(finish => !finish.disabled)
          .filter(finish => {
            if(!product?.rules?.indiaFinishExceptions) return true

            return jsonLogic.apply(product.rules.indiaFinishExceptions, {
              TESTING:'handrailFinish',
              PREDESIGN: design?.originalSapId,
              HR: componentId,
              FINISH: finish?.id,              
            })
          })

        const horCop = getComponentId({type: TYP_COP_HORIZONTAL})
        let correctFinishes = newFinishes
        if(horCop && product?.rules?.variousFilteringRules ) {
          correctFinishes = newFinishes.filter(item => {
            return (jsonLogic.apply(product.rules.variousFilteringRules, {'filteringRULE':'horCopFinishFilter', 'COP':horCop, 'FINISH':item.sapId, 'HANDRAIL':componentId}))
          })
        }
      
        setFinishes(correctFinishes)
      }
    }

    return () => {
      //
    }
  }, [componentId])

  useEffect(() => {
    if(finishes.length>0 && componentId && !getFinishId({type:MAT_CAR_HANDRAIL}) && !finishes.find(item => item.id === getFinishId({type:MAT_CAR_HANDRAIL}))) {
      setFinish({ type: MAT_CAR_HANDRAIL, finish: finishes[0].id })
    }
  }, [finishes]) 


  const onPositionsChangeHandler = (newPositions) => {

    // ENA has always handrail on both sidewalls or neither of the side walls
    if(product.offeringLocation.indexOf('ENA') !== -1) {
      const dIndex = newPositions.indexOf('D')
      const bIndex = newPositions.indexOf('B')
      if(newPositions.length > currentPositions.length) {
        if( dIndex !== -1 && bIndex === -1) {
          newPositions.push('B')
        }
        if( bIndex !== -1 && dIndex === -1) {
          newPositions.push('D')
        }
      } else {
        if( dIndex !== -1 && bIndex === -1) {
          newPositions.splice(dIndex,1)
        }
        if( bIndex !== -1 && dIndex === -1) {
          newPositions.splice(bIndex,1)
        }
      }
    }
    
    setPositions({ type: TYP_CAR_HANDRAIL, positions: newPositions })
    setCurrentPositions(newPositions)
  }

  const onBackClick = () => {
      setEditView('accessories')
  }

  const premiumIcon = product?.businessSpecification?.market === 'ENA' ?'icon-premium-ena' :'icon-premium'
  
  // !!! components as a defining list of handrails was changed to validComponents to hide the disabled handrails !!!
  return (
    <div className="Handrails">
      <EditorLayout heading={getText('ui-handrails-heading')} action={getText('ui-general-back')} actionClickHandler={onBackClick} >
        <ScrollBox>

          <HeadingComponent heading={getText('ui-handrails-positioning')} info={getText('ui-handrails-positioning-i')} padding="sm" />

          <PositionSelector 
            carType={design.carType}
            positions={currentPositions}
            disabledPositions={disabledPositions}
            
            onChange={newPositions => onPositionsChangeHandler(newPositions)}
            backwallDisabled={ isTrueTypeCar( getDesignProperty('carType'))}
          />

          <HeadingComponent heading={getText('ui-handrails-standard')} info={getText('ui-handrails-standard-i')} padding="sm" border="top" />

          <div className="handrailModels">
            <ImageTitle items={validComponents.filter(item=>{
              return (                
                jsonLogic.apply(product.rules.handrailPositions, {TEST_TYPE:'removeByRegulations', HANDRAIL:item.id, VALID: validComponents.map(hr=> {return hr.id} )})
                && item.name.indexOf('TR') === -1 )
              })} onChange={id => setComponent({ type: TYP_CAR_HANDRAIL, component: id })} selectedId={componentId} enabledItems={validComponents}/>
          </div>

          { validComponents.filter(item=>item.name.indexOf('TR') !== -1).length>0 &&
            <>
              <HeadingComponent heading={getText('ui-handrails-continuous')} info={getText('ui-handrails-continuous-i')} padding="sm" border="top" />
              <div className="handrailModels">
                <ImageTitle items={validComponents.filter(item=> {
                  return (
                    jsonLogic.apply(product.rules.handrailPositions, {TEST_TYPE:'removeByRegulations', HANDRAIL:item.id, VALID: validComponents.map(hr=> {return hr.id} )})
                    && item.name.indexOf('TR') !== -1)
                  })} onChange={id => setComponent({ type: TYP_CAR_HANDRAIL, component: id })} selectedId={componentId} enabledItems={validComponents}/>
              </div>
            </>
          }

          <HeadingComponent heading={getText('ui-handrails-finish')} info={getText('ui-handrails-finish-i')} padding="sm" border="top" />
          
          <ListComponent gap="md" padding="md">
            <GridComponent cols="3" gap="sm">
              {
                finishes.map( (finishItem,key) => {
                  return (
                    <TileComponent 
                    key={key} 
                    title={getText(finishItem.id)} 
                    subtitle={getText(finishItem.name)}
                    showSapId={product?.businessSpecification?.market !== 'ENA'} 
                    image={finishItem.image} 
                    icon={finishItem.premium && premiumIcon}
                    iconTitle={getText('ui-general-extended-lead-time')} 
                    selected={finishItem.id === finishId} 
                    onClick={id => setFinish({type: MAT_CAR_HANDRAIL, finish: finishItem.id})} 
                  /> 
                  )
                })
              }
            </GridComponent>
          </ListComponent>
 
          <div style={{height:'20px'}} />

        </ScrollBox>
      </EditorLayout>
    </div>
  )
}

export default Handrails