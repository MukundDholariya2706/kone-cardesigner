import './CeilingEditor.scss';
import React, { useContext, useState, useEffect, useMemo, useLayoutEffect } from 'react';
import jsonLogic from 'json-logic-js';
import { ProductContext } from '../../store/product';
import { DesignContext } from '../../store/design';
import { TranslationContext } from '../../store/translation';
import EditorLayout from '../EditorLayout';
import ListComponent from '../ListComponent';
import Box from '../Box';
import ImageWithCaption from '../ImageWithCaption';
import GridComponent from '../GridComponent';
import TileComponent from '../TileComponent';
import LightTile from '../LightTile';
import 'ie-array-find-polyfill';
import SwitchButton from '../SwitchButton';


import {
  TYP_CAR_CEILING, MAT_CAR_CEILING, COL_CAR_CEILING_LIGHT, CEILING_SUSPENDED, CEILING_VANDAL, CEILING_INTEGRADED, MAT_CAR_CEILING_PANEL_GRAPHIC, OFFERING_INDIA,
  WALLA, WALLB, WALLD, WALLC,ENHANCE_LIGHT,
  EXTRA_FEATURES,
  CAR_SHAPE_WIDE,CAR_SHAPE_SQUARE
} from '../../constants';
import HeadingComponent from '../HeadingComponent/HeadingComponent';
import InfoBox from '../InfoBox';
import ScrollBox from '../ScrollBox';

/**
 * Renders out the ceiling editor component.
 *  - uses view as view mode in state 
 *  - uses DesingContext, ComponentContext, MaterialContext as store
 *  - includes {@link ThumbnailList} and {@link MaterialList} components
 * @function CeilingEditor Header renderer
 * @param {Object} props Propertied passed to this renderer
 */

const CeilingEditor = (props) => {
  const { getText } = useContext(TranslationContext); 
  const { loading, product, getComponentParts, getFinishes: getLightFinishes, getComponentCategories } = useContext(ProductContext);
  const { getDesignProperty, getFinish, getComponent, setComponent, setFinish, setPartFinish, getPartFinish, design, getComponentFinish } = useContext(DesignContext);

  const [view, setView] = useState('details');
  const [firstTime, setFirstTime] = useState(true);
  const [refRendered, setRefRendered] = useState(null);
  const [components, setComponents] = useState([])

  const component = getComponent({type:TYP_CAR_CEILING});

  const finish = getFinish({type:MAT_CAR_CEILING});
  const partFinish = getPartFinish({ type: COL_CAR_CEILING_LIGHT })
  const diffuserFinish = getPartFinish({ type: MAT_CAR_CEILING_PANEL_GRAPHIC })

  const getFinishes = (id) => {
    if (components) {
      const selected = components.find(x => x.id === id)
      if (selected) {
        const newFinishes = selected.finishes.filter(x => !x.disabled)
        return newFinishes
      }
    }
  }

  const availableFinishes = useMemo(() => {
    let allFinishes = getFinishes(component)

    if(allFinishes && product.offeringLocation === OFFERING_INDIA && product?.rules?.indiaFinishExceptions) {
      allFinishes = allFinishes.filter(item => {
        const test = {
          TESTING: 'ceilingFinish',
          PRODUCT: product.product,
          FINISH: item.id,
          DESIGN: design.originalSapId,
        }
        return jsonLogic.apply(product.rules.indiaFinishExceptions, test)
      })
    }

    if(product?.businessSpecification?.market !== 'ENA' || !product?.rules?.ceilingFinishPremium || !allFinishes) return allFinishes

    const premiumCorrection = allFinishes.map(item => {
      const test={
        PRODUCT: product.product,
        TYP_CAR_CEILING: component,
        MAT_CAR_CEILING:item.id
      }
      const premiumValue = jsonLogic.apply(product.rules.ceilingFinishPremium, test)
      return {
        ...item,
        premium:premiumValue
      }
    })

    return premiumCorrection
  }, [component, components])

  const lightFinishes = useMemo(() => {
    if (!product || !component) {
      return []
    }
    const componentParts = getComponentParts({ id: component })
    if (!componentParts || !Array.isArray(componentParts) || !componentParts.length) {
      return []
    }     
    if (!componentParts.find(item => (item.type === COL_CAR_CEILING_LIGHT))) {
      return []
    }

    let allLightFinishes = getLightFinishes({ type: COL_CAR_CEILING_LIGHT }) || []

    if(allLightFinishes && product.offeringLocation === OFFERING_INDIA && product?.rules?.indiaFinishExceptions) {
      allLightFinishes = allLightFinishes.filter(item => {
        const test = {
          TESTING: 'lightFinish',
          PRODUCT: product.product,
          LIGHT: item.id,
          DESIGN: design.originalSapId,
        }
        return jsonLogic.apply(product.rules.indiaFinishExceptions, test)
      })
    }

    return allLightFinishes

  }, [product, component])

  const diffuserPanels = useMemo(() => {
    if (!product || !component) {
      return []
    }
    const componentParts = getComponentParts({ id: component })
    if (!componentParts || !Array.isArray(componentParts) || !componentParts.length) {
      return []
    }     
    if (!componentParts.find(item => (item.type === MAT_CAR_CEILING_PANEL_GRAPHIC))) {
      return []
    }

    return getLightFinishes({ type: MAT_CAR_CEILING_PANEL_GRAPHIC }) || []
  }, [product, component])

  const currntDesignLightStatus = getComponent({type: ENHANCE_LIGHT})
  const [enhanceLightStatus, setEnhanceLightStatus] = useState(currntDesignLightStatus==='CL80EN');
  const [enhanceVentStatus, setEnhanceVentStatus] = useState(currntDesignLightStatus==='CL80VENT');

  const setComponentEnhanceComponent=(e)=>{
    setComponent({
      type: ENHANCE_LIGHT,
      component: e ? "CL80EN" : null
    });
    if (!e) {
      setComponent({ type: TYP_CAR_CEILING, component: "CL80" });
    } 
    setEnhanceVentStatus(false);
    setEnhanceLightStatus(e);
  }
  const setComponentEnhanceVentComponent=(e)=>{
    setComponent({
      type: ENHANCE_LIGHT,
      component: e ? "CL80VENT" : null
    });
    if (!e) {
      setComponent({ type: TYP_CAR_CEILING, component: "CL80" });
    } 
    setEnhanceLightStatus(false);
    setEnhanceVentStatus(e);
  }

  const shape = getDesignProperty('carShape');
  const canRenderEnhanceLite = shape !== CAR_SHAPE_WIDE ? true : false;
  const canRenderVent = shape === CAR_SHAPE_SQUARE?true :false;
  const RenderEnhaneLightUI=() =>{
    
    return (
      <>
        {canRenderEnhanceLite && (
          <>
            <HeadingComponent
              heading={getText('ui-Enhance-type')}
              info={getText('ui-door-type-i')}
              padding="sm"
              border="top"
            />
            <SwitchButton
              className="lowercase"
              toggle={enhanceLightStatus}
              label={getText('Ui-Enhance-Light')}
              onChange={(e) => {
                setComponentEnhanceComponent(e);
              }}
            />
          </>
        )}
        {canRenderVent && (
          <>
            <HeadingComponent
              heading={getText('ui-Ventilation-type')}
              info={getText('ui-door-type-i')}
              padding="sm"
              border="top"
            />
            <SwitchButton
              className="lowercase"
              toggle={enhanceVentStatus}
              label={getText('Ui-Ventilation-Light')}
              onChange={(e) => {
                setComponentEnhanceVentComponent(e);
              }}
            />
          </>
        )}
      </>
    );
  }

  const update = () => {
    const ceilingsData = product.componentsData.ceilings
    const validComponents = ceilingsData.filter(item => {
      if (item.disabled) return false
      if (product?.rules?.ceilings) {
        let test = {}
        test[TYP_CAR_CEILING] = item.id
        test["CARSHAPE"] = getDesignProperty('carShape')
        test["CARTYPE"] = getDesignProperty('carType')
        test["PRODUCT"] = product.product
        test['PREDESIGN'] = getDesignProperty('sapId');
        test["AWALL_FINISH"] = getComponentFinish({type:WALLA})
        test["BWALL_FINISH"] = getComponentFinish({type:WALLB})
        test["CWALL_FINISH"] = getComponentFinish({type:WALLC})
        test["DWALL_FINISH"] = getComponentFinish({type:WALLD})
        test["REGULATIONS"] = getDesignProperty('regulations')
      return jsonLogic.apply(product.rules.ceilings, test)
      } else { return true }
    })
    setComponents(validComponents)
  }
  
  useEffect(() => {
    // component mount
    if (product) {
      update()

    }
    return () => {
      // component unmount
    }
  }, [])

  useEffect(() => {
    if (firstTime && refRendered) {
      refRendered.scrollIntoView(true)
      setFirstTime(false)
    }
  }, [refRendered, firstTime])

  // Using LayoutEffect instead of normal to fix an issue where finish selector UI would very briefly
  // show previously selected finish as selected when changing the ceiling component,
  // if the two ceilings shared the same finish.
  useLayoutEffect(() => {
   
    if (availableFinishes && availableFinishes.length > 0) {
      setFinish({ type: MAT_CAR_CEILING, finish:  availableFinishes[0].id})
    }
    
  }, [component])

  const changeViewClickHandler = () => {
    if(view === 'details')  {
      setView('list');
    } else {
      setView('details');
    }
  };
  
  const listItemsSuspended = []
  const listItemsVandal = []
  const listItemsIntegrated = []
  const categorySuspended = (getComponentCategories() || {}).find(item=>item.id === CEILING_SUSPENDED)
  const categoryVandal = (getComponentCategories() || {}).find(item=>item.id === CEILING_VANDAL)
  const categoryIntegrated = (getComponentCategories() || {}).find(item=>item.id === CEILING_INTEGRADED)

  const premiumIcon = product?.businessSpecification?.market === 'ENA' ?'icon-premium-ena' :'icon-premium'

  const suspendedDesc = useMemo(() => {
    if (!categorySuspended) return ''
    return getText(categorySuspended.description).trim() 
  }, [categorySuspended])

  const vandalDesc = useMemo(() => {
    if (!categoryVandal) return ''
    return getText(categoryVandal.description).trim()
  }, [categoryVandal])

  const integratedDesc = useMemo(() => {
    if (!categoryIntegrated) return ''
    return getText(categoryIntegrated.description).trim()
  }, [categoryIntegrated])

  if (loading) {
    // TODO: Prettify this
    return (<>loading...</>)
  }


  


  for (const item of components) {
    if(item.componentCategory === CEILING_SUSPENDED ) {
      listItemsSuspended.push((
        <React.Fragment key={listItemsSuspended.length} >
          { (item.id === component) && 
            <div ref={(c) => setRefRendered(c)} ></div>
          }
          <ImageWithCaption title={getText(item.name)} image={item.image} description={getText(item.description)} selected={item.id === component} onClick={id => setComponent({ type: TYP_CAR_CEILING, component: item.id })} />
        </React.Fragment>
      ))
  
      if (item.id === component && availableFinishes && availableFinishes.length) {
        listItemsSuspended.push((
          <Box key={listItemsSuspended.length} padding="sm-side">
            <GridComponent key={listItemsSuspended.length} cols="3" gap="sm">
              {availableFinishes.map((finishItem, key) => {
                return (
                  <TileComponent 
                    key={key} 
                    title={getText(finishItem.sapId)} 
                    subtitle={getText(finishItem.name)} 
                    showSapId={product?.businessSpecification?.market !== 'ENA'} 
                    image={finishItem.image} 
                    icon={finishItem.premium && premiumIcon} 
                    iconTitle={getText('ui-general-extended-lead-time')} 
                    selected={finishItem.id === finish} 
                    onClick={id => setFinish({ type: MAT_CAR_CEILING, finish: finishItem.id })} 
                  /> 
                )
              })} 
            </GridComponent>
            { item.enhanceLighting && (product && (product.extraFeatures.indexOf(EXTRA_FEATURES.ENHANCE_LIGHT) != -1)) && RenderEnhaneLightUI()}
          </Box>
        ))
      }
  
      if (item.id === component && lightFinishes && lightFinishes.length) {
        listItemsSuspended.push((
          <Box key={listItemsSuspended.length} margin="sm-side" padding="sm" className="darker-gray">
            <ListComponent gap="sm" className="dark">
              <HeadingComponent heading={getText('ui-ceiling-spot-color')} className="white" />
              {/* <GridComponent cols="3" gap="sm"> */}
              <ListComponent direction="row" align="center" gap="sm" >
                {lightFinishes.map((finishItem, key) => {
                  return (
                    <LightTile key={key} image={finishItem.image} id={finishItem.id}  selected={finishItem.id === partFinish} onClick={id => setPartFinish({ type: COL_CAR_CEILING_LIGHT, finish: finishItem.id})} />
                  )
                })}
              </ListComponent>
              {/* </GridComponent> */}
            </ListComponent>
          </Box>
        ))
      }
        
      if (item.id === component && diffuserPanels && diffuserPanels.length) {
        listItemsSuspended.push((
          <Box key={listItemsSuspended.length} padding="sm-side">
            <ListComponent>
              <HeadingComponent heading={getText('ui-ceiling-diffusers')} />
              <GridComponent key={diffuserPanels.length} cols="3" gap="sm">
                {diffuserPanels.map((finishItem, key) => {
                  return (
                    <TileComponent 
                    key={key} 
                    title={getText(finishItem.name)} 
                    showSapId={product?.businessSpecification?.market !== 'ENA'} 
                    image={finishItem.image} 
                    icon={finishItem.premium && premiumIcon} 
                    iconTitle={getText('ui-general-extended-lead-time')} 
                    selected={finishItem.id === diffuserFinish} 
                    onClick={id => setPartFinish({ type: MAT_CAR_CEILING_PANEL_GRAPHIC, finish: finishItem.id})} 
                  />
                  )
                })}
              </GridComponent>
            </ListComponent>
          </Box>
        ))
      }
        
    } else if(item.componentCategory === CEILING_VANDAL) {
      listItemsVandal.push((
          <React.Fragment key={listItemsVandal.length} >
            { (item.id === component) && 
              <div ref={(c) => setRefRendered(c)} ></div>
            }
            <ImageWithCaption title={getText(item.name)} image={item.image} description={getText(item.description)} selected={item.id === component} onClick={id => setComponent({ type: TYP_CAR_CEILING, component: item.id })} />
          </React.Fragment>
        ))
    
        if (item.id === component && availableFinishes && availableFinishes.length) {
          listItemsVandal.push((
            <Box key={listItemsVandal.length} padding="sm-side">
              <GridComponent key={listItemsVandal.length} cols="3" gap="sm">
                {availableFinishes.map((finishItem, key) => {
                  return (
                    <TileComponent 
                      key={key} 
                      title={getText(finishItem.sapId)} 
                      subtitle={getText(finishItem.name)} 
                      showSapId={product?.businessSpecification?.market !== 'ENA'} 
                      image={finishItem.image} 
                      icon={finishItem.premium && premiumIcon} 
                      iconTitle={getText('ui-general-extended-lead-time')} 
                      selected={finishItem.id === finish} 
                      onClick={id => setFinish({ type: MAT_CAR_CEILING, finish: finishItem.id })} 
                    /> 
                  )
                })}
              </GridComponent>
            </Box>
          ))
        }
    
        if (item.id === component && lightFinishes && lightFinishes.length) {
          listItemsVandal.push((
            <Box key={listItemsVandal.length} padding="sm" margin="sm-side" className="darker-gray">
              <ListComponent gap="sm" className="dark">
                <HeadingComponent heading={getText('ui-ceiling-spot-color')} className="white" />
                <ListComponent direction="row" align="center" gap="sm" >
                  {lightFinishes.map((finishItem, key) => {
                    return (
                      <LightTile key={key} image={finishItem.image} id={finishItem.id}  selected={finishItem.id === partFinish} onClick={id => setPartFinish({ type: COL_CAR_CEILING_LIGHT, finish: finishItem.id})} />
                    )
                  })}
                </ListComponent>
              </ListComponent>
            </Box>
          ))
        }

        if (item.id === component && diffuserPanels && diffuserPanels.length) {
          listItemsVandal.push((
            <Box key={listItemsVandal.length} padding="sm-side">
              <ListComponent>
                <HeadingComponent heading={getText('ui-ceiling-diffusers')} />
                <GridComponent key={diffuserPanels.length} cols="3" gap="sm">
                  {diffuserPanels.map((finishItem, key) => {
                    return (
                      <TileComponent 
                      key={key} 
                      title={getText(finishItem.name)} 
                      showSapId={product?.businessSpecification?.market !== 'ENA'} 
                      image={finishItem.image} 
                      icon={finishItem.premium && premiumIcon} 
                      iconTitle={getText('ui-general-extended-lead-time')} 
                      selected={finishItem.id === diffuserFinish} 
                      onClick={id => setPartFinish({ type: MAT_CAR_CEILING_PANEL_GRAPHIC, finish: finishItem.id})} 
                    />
                    )
                  })}
                </GridComponent>
              </ListComponent>
            </Box>
          ))
        }             
    } else {
      listItemsIntegrated.push((
        <React.Fragment key={listItemsIntegrated.length} >
            { (item.id === component) && 
              <div ref={(c) => setRefRendered(c)} ></div>
            }
        <ImageWithCaption key={listItemsIntegrated.length} title={getText(item.name)} image={item.image} description={getText(item.description)} selected={item.id === component} onClick={id => setComponent({ type: TYP_CAR_CEILING, component: item.id })} />      
        </React.Fragment>
      ))
  
      if (item.id === component && availableFinishes && availableFinishes.length) {
        listItemsIntegrated.push((
          <Box key={listItemsIntegrated.length} padding="sm-side">
            <GridComponent key={listItemsIntegrated.length} cols="3" gap="sm">
              {availableFinishes.map((finishItem, key) => {
                return (
                  <TileComponent 
                    key={key} 
                    title={getText(finishItem.sapId)} 
                    subtitle={getText(finishItem.name)} 
                    showSapId={product?.businessSpecification?.market !== 'ENA'} 
                    image={finishItem.image} 
                    icon={finishItem.premium && premiumIcon} 
                    iconTitle={getText('ui-general-extended-lead-time')} 
                    selected={finishItem.id === finish} 
                    onClick={id => setFinish({ type: MAT_CAR_CEILING, finish: finishItem.id })} 
                  /> 
                )
              })}
            </GridComponent>
          </Box>
        ))
      }
  
      if (item.id === component && lightFinishes && lightFinishes.length) {
        listItemsIntegrated.push((
          <Box key={listItemsIntegrated.length} padding="sm" margin="sm-side" className="darker-gray">
            <ListComponent gap="sm" className="dark">
              <HeadingComponent heading={getText('ui-ceiling-spot-color')} className="white" />
              <ListComponent direction="row" align="center" gap="sm" >
                {lightFinishes.map((finishItem, key) => {
                  return (
                    <LightTile key={key} image={finishItem.image} id={finishItem.id}  selected={finishItem.id === partFinish} onClick={id => setPartFinish({ type: COL_CAR_CEILING_LIGHT, finish: finishItem.id})} />
                  )
                })}
              </ListComponent>
            </ListComponent>
          </Box>
        ))
      }
  
      if (item.id === component && diffuserPanels && diffuserPanels.length) {
        listItemsIntegrated.push((
          <Box key={listItemsIntegrated.length} padding="sm-side">
            <ListComponent>
              <HeadingComponent heading={getText('ui-ceiling-diffusers')} />
              <GridComponent key={diffuserPanels.length} cols="3" gap="sm">
                {diffuserPanels.map((finishItem, key) => {
                  return (
                    <TileComponent 
                    key={key} 
                    title={getText(finishItem.name)} 
                    image={finishItem.image} 
                    icon={finishItem.premium && premiumIcon} 
                    iconTitle={getText('ui-general-extended-lead-time')} 
                    selected={finishItem.id === diffuserFinish} 
                    onClick={id => setPartFinish({ type: MAT_CAR_CEILING_PANEL_GRAPHIC, finish: finishItem.id})} 
                  />
                  )
                })}
              </GridComponent>
            </ListComponent>
          </Box>
        ))
      }             
    }

  }

  return (
    
    <div className="CeilingEditor">        
      <EditorLayout heading={getText('ui-ceiling-heading')} action={view==='details'?'':getText('ui-general-back')} actionClickHandler={changeViewClickHandler}>
        <ScrollBox id="ceilingListView">
          { listItemsSuspended && listItemsSuspended.length > 0 && categorySuspended && 
            <>
              <HeadingComponent heading={getText(categorySuspended.name)} padding="sm" />
              { (suspendedDesc && product?.offeringLocation !== OFFERING_INDIA ) &&
                <InfoBox text={suspendedDesc} style={{marginBottom:'10px'}} />}
            </>          }
          {listItemsSuspended && listItemsSuspended.length > 0 && 
          <ListComponent gap="sm">
          { listItemsSuspended}
          </ListComponent>}

          { listItemsVandal && listItemsVandal.length > 0 && categoryVandal && 
            <>
              <HeadingComponent heading={getText(categoryVandal.name)} padding="sm" />
              { (vandalDesc && product?.offeringLocation !== OFFERING_INDIA ) &&
                <InfoBox text={vandalDesc} style={{marginBottom:'10px'}} />}
            </>
          }
          { listItemsVandal && listItemsVandal.length > 0 && 
          <ListComponent gap="sm">
            { listItemsVandal}
          </ListComponent>}
          
          { listItemsIntegrated && listItemsIntegrated.length > 0 && categoryIntegrated && 
            <>
              <HeadingComponent heading={getText(categoryIntegrated.name)} padding="sm" />
              { (integratedDesc && product?.offeringLocation !== OFFERING_INDIA ) &&
                <InfoBox text={integratedDesc} style={{marginBottom:'10px'}}/>}
            </>
          }
          { listItemsIntegrated && listItemsIntegrated.length > 0 && 
          <ListComponent gap="sm">
            { listItemsIntegrated}
          </ListComponent>}

          <div style={{ height:'20px' }} />
        </ScrollBox>
      </EditorLayout>
    </div>
  )
}
export default CeilingEditor;