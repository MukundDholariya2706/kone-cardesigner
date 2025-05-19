import './InfoMediaScreens.scss';
import React, { useContext, useState, useEffect, useMemo } from 'react';
import jsonLogic from 'json-logic-js';

import { ProductContext } from '../../store/product';
import { DesignContext } from '../../store/design';
import { TranslationContext } from '../../store/translation';
import EditorLayout from '../EditorLayout';
import SwitchButton from '../SwitchButton'
import InfoBox from '../InfoBox'
import CarShapeSelector from '../CarShapeSelector'
import ImageTitle from '../ImageTitle'
import ToggleButtons from '../ToggleButtons';
import { LayoutContext } from '../../store/layout';
import { TYP_CAR_INFOSCREEN, TYP_CAR_MEDIASCREEN, TYP_COP_2, TYP_COP_PRODUCT_1, TYP_CAR_MIRROR, MAT_CAR_MEDIASCREEN, TYP_CAR_GLASS_WALL_C, KCSM_KONE_INFORMATION, TYP_CAR_WALL_ADD_DECO_PACKAGE} from '../../constants';
import KoneInformationDialog from '../KoneInformationDialog';
import HeadingComponent from '../HeadingComponent/HeadingComponent';
import ScrollBox from '../ScrollBox';
import GridComponent from '../GridComponent';
import TileComponent from '../TileComponent';
import ListComponent from '../ListComponent';
import Box from '../Box';
import ImageWithCaption from '../ImageWithCaption';
import { isTrueTypeCar } from '../../utils/design-utils'
import Icon from '../Icon';


const InfoMediaScreens = (props) => {
  
  const { getText } = useContext(TranslationContext);
  const { setEditView, showDialogKoneInformation, setShowDialogKoneInformation } = useContext(LayoutContext);
  const { product, getComponent, getFinishes } = useContext(ProductContext);
  const { getComponent: getComponentId, setComponent, setDefaultComponent, setComponentFinish, getPositions, design, setPositions, getFinish, setFinish, setPart, getPart } = useContext(DesignContext);

  const screensData = product.componentsData.accessories.infoAndMediaScreens
  
  const infoScreens = getAvailableInfoScreens()
  const mediaScreens = getAvailableMediaScreens()

  const [ toggle, setToggle ] = useState(true)
  const [ screenSelection, setScreenSelection ] = useState(null)
  const [disableMediaPositions, setDisableMediaPositions] = useState([])
  const [disableInfoPositions, setDisableInfoPositions] = useState([])
  const componentId = getComponentId({ type: screenSelection})

  const koneInformationAvailable = product?.componentsData?.kcsmServices?.find(service => (service.id === KCSM_KONE_INFORMATION && !service.disabled))

  const mediaScreensAllowed = useMemo(() => {
    const isDisabled = (['B1','BX','B2','D1','DX','D2','AX','CX']).every( item => (disableMediaPositions.indexOf(item) !== -1) )
    if (isDisabled) return false
    return mediaScreens.length > 0
  }, [disableMediaPositions]) 
  
  const infoScreensAllowed = useMemo(() => {
    const isDisabled = (['B1','BX','B2','D1','DX','D2','AX','CX']).every( item => (disableInfoPositions.indexOf(item) !== -1) )
    if (isDisabled) return false
    return infoScreens.length > 0
  }, [disableInfoPositions])

  const components = useMemo(() => {
    if (!screenSelection) return []

    if (screenSelection === TYP_CAR_MEDIASCREEN) {
      return mediaScreens
    } else {
      return infoScreens
    }
  }, [screenSelection])


  const availableOptions = []

  if (mediaScreensAllowed) {
    availableOptions.push({ value: TYP_CAR_MEDIASCREEN, label: getText('ui-info-media-screens-mediascreen') })
  }
  if (infoScreensAllowed) {
    availableOptions.push({ value: TYP_CAR_INFOSCREEN, label: getText('ui-info-media-screens-infoscreen') })
  }

  const features = [
    {type:'MULTIMEDIA', icon:'icon-gallery', title:'ui-info-media-screens-feature-multimedia' },
    {type:'WEATHER', icon:'icon-weather', title:'ui-info-media-screens-feature-weather' },
    {type:'TENANTDIRECTORY', icon:'icon-list', title:'ui-info-media-screens-feature-tenant' },
    {type:'TWITTER', icon:'icon-twitter', title:'ui-info-media-screens-feature-twitter' },
    {type:'MESSAGES', icon:'icon-message', title:'ui-info-media-screens-feature-messages' },
  ]

  function getAvailableMediaScreens() {
    if (product?.rules?.variousFilteringRules) {
      const newComponents = screensData.mediaScreens.filter(item=> {
        let test={}
        test["filteringRULE"] = 'ondoorMediaScreen'
        test["SCREEN"] = item.id
        test["SIG_FAMILY"] = (getComponent({id:getComponentId({type:TYP_COP_PRODUCT_1})}) || {}).componentFamily
        return jsonLogic.apply(product.rules.variousFilteringRules,test)
      })
  
      
      return newComponents
    } else {
      return screensData.mediaScreens || []
    }
  }

  function getAvailableInfoScreens() {
    return screensData.infoScreens || []
  }

  const updatePositions = () => {
    let disabledInfoPos
    let disabledMediaPos 
    if(product && product.rules && product.rules.screensPositions ) {

      const test={}
      test['PRODUCT'] = product.product;
      test['COP1'] = getComponentId({type:TYP_COP_PRODUCT_1}) || null;
      test['COP2'] = getComponentId({type:TYP_COP_2}) || null;
      test['COP1_POS'] = (getPositions({type:TYP_COP_PRODUCT_1}) || []).join('');
      test['COP2_POS'] = (getPositions({type:TYP_COP_2}) || []).join('');
      test['MIRROR_POS'] = (getPositions({type:TYP_CAR_MIRROR}) || []);
      test['SCENIC'] = getPositions({type:TYP_CAR_GLASS_WALL_C});
      test['SCREEN'] = componentId
      test['DECO'] = getComponentId({type:TYP_CAR_WALL_ADD_DECO_PACKAGE}) || null;

      const disableMediaInfoList = jsonLogic.apply(product.rules.screensPositions, test)

      if(disableMediaInfoList && disableMediaInfoList[0] && disableMediaInfoList[0].length > 0) {
        disabledMediaPos = [...disableMediaInfoList[0]]
        setDisableMediaPositions(disabledMediaPos)
      }
      if(disableMediaInfoList && disableMediaInfoList[1] && disableMediaInfoList[1].length > 0) {
        disabledInfoPos = [...disableMediaInfoList[1]]
        setDisableInfoPositions(disabledInfoPos)
      }
    }

    if (!getPositions({ type: screenSelection })) {
      if(screenSelection===TYP_CAR_INFOSCREEN) {
        if(disabledInfoPos) {
          setPositions({ type: screenSelection, positions: [ (['B1','BX','B2','D1','DX','D2','AX','CX']).find(item => disabledInfoPos.indexOf(item) === -1) ] })
        } else {
          setPositions({ type: screenSelection, positions: ['B2']})
        }
      }
      if(screenSelection===TYP_CAR_MEDIASCREEN) {
        if(disabledMediaPos) {
          setPositions({ type: screenSelection, positions: [ (['B1','BX','B2','D1','DX','D2','AX','CX']).find(item => disabledMediaPos.indexOf(item) === -1) ] })
          if( (['B1','BX','B2','D1','DX','D2','AX','CX']).every( item => (disabledMediaPos.indexOf(item) !== -1) ) ) {
            setComponent({type:TYP_CAR_MEDIASCREEN, component:null})
            setScreenSelection(TYP_CAR_INFOSCREEN)
            setDefaultComponent({ type: TYP_CAR_INFOSCREEN })
          }
        } else {
          setPositions({ type: screenSelection, positions: ['B2']})
        } 
      }
    }
  }

  // Initialize correct screen selection when the view is opened.
  useEffect(() => {
    const mediaScreenId = getComponentId({type: TYP_CAR_MEDIASCREEN})
    const infoScreenId = getComponentId({type: TYP_CAR_INFOSCREEN})

    // If design has an existing item, go to that view.
    if (mediaScreenId) {
      setScreenSelection(TYP_CAR_MEDIASCREEN)
      return
    }
    
    if (infoScreenId) {
      setScreenSelection(TYP_CAR_INFOSCREEN)
      return
    }
    // Default to media screen view if possible.
    if (mediaScreens?.length || mediaScreensAllowed) {
      setDefaultComponent({ type: TYP_CAR_MEDIASCREEN })
      if( koneInformationAvailable ) setPart({componentType:TYP_CAR_MEDIASCREEN, partType:'MULTIMEDIA', component:'MULTIMEDIA', finish:null})
      setScreenSelection(TYP_CAR_MEDIASCREEN)
      return
    }

    setDefaultComponent({ type: TYP_CAR_INFOSCREEN })
    setScreenSelection(TYP_CAR_INFOSCREEN)  

  }, [])
  
  useEffect(() => {
    updatePositions()
  }, [components])

  function onScreenTypeSelection(value) {
    setScreenSelection(value)
  }

  function onToggle(checked) {
    setToggle(checked)

    if(checked) {
      if(!getComponentId({type: TYP_CAR_MEDIASCREEN}) && !getComponentId({type: TYP_CAR_INFOSCREEN})) {
        setDefaultComponent({ type: screenSelection })
        if(screenSelection === TYP_CAR_MEDIASCREEN && koneInformationAvailable) {
          setPart({componentType:TYP_CAR_MEDIASCREEN, partType:'MULTIMEDIA', component:'MULTIMEDIA', finish:null})
        }
      }
      updatePositions()
    } else {
      setComponent({type: TYP_CAR_INFOSCREEN, component: null})
      setComponent({type: TYP_CAR_MEDIASCREEN, component: null})
    }
  }

  const onBackClick = () => {
    setEditView('accessories')
  }

  const onChangeProduct = (id) => {
    setComponent({ type: screenSelection, component: id })
    const fullComponent = getComponent({id})
    if(fullComponent?.finishingTypes?.length>0) {
      const finishingTypes = fullComponent.finishingTypes
      setComponentFinish({type:screenSelection, finishType:finishingTypes[0], finish:getFinishes({type:finishingTypes[0]})?.[0]?.id })
    }

    // Remove the other screentype from the design, only one allowed at a time.
    if (screenSelection === TYP_CAR_MEDIASCREEN) {
      setComponent({type: TYP_CAR_INFOSCREEN, component: null})
    }
    
    if (screenSelection === TYP_CAR_INFOSCREEN) {
      setComponent({type: TYP_CAR_MEDIASCREEN, component: null})
    }

    updatePositions()
  }

  const getDisabledPositions = () => {
    return screenSelection === TYP_CAR_MEDIASCREEN?disableMediaPositions:disableInfoPositions
  }

  const onSwitchFeature = (feature) => {
    if(['MULTIMEDIA','TWITTER','MESSAGES'].includes(feature)) {
      ['MULTIMEDIA','TWITTER','MESSAGES'].forEach(item => {
        if(item === feature) {
          setPart({componentType:TYP_CAR_MEDIASCREEN, partType:item, component:item, finish:null})
        } else {
          setPart({componentType:TYP_CAR_MEDIASCREEN, partType:item, component:null, finish:null})
        }
      })
    } else {
      if(getPart({componentType: TYP_CAR_MEDIASCREEN, partType: feature})) {
        setPart({componentType:TYP_CAR_MEDIASCREEN, partType:feature, component:null, finish:null})
      } else {
        setPart({componentType:TYP_CAR_MEDIASCREEN, partType:feature, component:feature, finish:null})
      }
    }
  } 

  const getFeatureValue = (feature) => {
    const part = getPart({componentType: TYP_CAR_MEDIASCREEN, partType: feature})
    if(!part ) return false
    return true
  }

  const showFinishList = (item) => {
    if(product?.rules?.screenFinishes) {
      let finishesFound = false      
      if(item.finishes) {
        item.finishes.forEach(finish => {
          if( jsonLogic.apply(product.rules.screenFinishes, {SCREEN:item.id ,FINISH: finish.id})) {
            finishesFound = true
          }

        })
      }
      return finishesFound
    }

    return true
  }

  return (      
    <div className="InfoMediaScreens">        
      <EditorLayout heading={getText('ui-info-media-screens-heading')} action={getText('ui-general-back')} actionClickHandler={onBackClick} >      
        <ScrollBox>
          <SwitchButton toggle={toggle} label={getText('ui-info-media-screens-add')} onChange={e => onToggle(e)} />  
          {toggle &&
            <>
              { availableOptions && availableOptions.length > 1 &&
                <ToggleButtons 
                  content={availableOptions} 
                  selectedButton={screenSelection} 
                  onChange={e => onScreenTypeSelection(e)} />
              }

              <ListComponent gap="sm">

                { screenSelection === TYP_CAR_MEDIASCREEN && 
                  <>
                    { koneInformationAvailable
                      ?(
                        <>
                          <p className="infoText" style={{marginBottom:'10px'}}>
                            {getText('ui-kone-information-content-para-2')}
                          </p>
                          <ul>
                            <li>{getText('ui-kone-information-fact-1')}</li>
                            <li>{getText('ui-kone-information-fact-2')}</li>
                            <li>{getText('ui-kone-information-fact-3')}</li>
                          </ul>
                          
                          <p className="readMore" onClick={() => setShowDialogKoneInformation(true)}>
                              { getText('ui-general-read-more')}
                          </p>
                          <HeadingComponent heading={getText('ui-info-media-screens-display')} info={getText('ui-info-media-screens-display-i')} padding="sm" border="top" />
                        </>
                      )

                      : <p className="infoText">{getText('ui-info-media-screens-media-info')}</p>
                    }
                    {
                      components.map( (item,index) => {
                        return (
                          <React.Fragment key={index} >
                            <ImageWithCaption title={getText(item.name)} image={item.image} description={getText(item.description)} selected={item.id === componentId} selectedStyle="selected with-border" onClick={id => onChangeProduct(item.id)} />
                            { (item.finishes && item.finishes.length >0 && item.id === componentId && showFinishList(item) ) &&
                              <Box key={item.finishes.length} padding="sm-side">
                              <GridComponent  cols="6" gap="sm" padding="sm" style={{ marginBottom: '0px' }}>
                                {item.finishes.map((finishItem, key) => {
                                  return (
                                    <TileComponent 
                                      key={key}
                                      image={finishItem.image}
                                      alt = {finishItem.id+'\n'+getText(finishItem.name)}
                                      selected={finishItem.id === getFinish({type:MAT_CAR_MEDIASCREEN})}
                                      onClick={id => setFinish({type:MAT_CAR_MEDIASCREEN, finish:finishItem.id})}
                                      /> 
                                      )
                                })}
                              </GridComponent>
                            </Box>

                            }
                          </React.Fragment>
                        )
                      })
                    }

                  </>
                }

                {/* kone information items */}
                { (screenSelection === TYP_CAR_MEDIASCREEN && koneInformationAvailable) && 
                  <>
                    {/* <div className='featureHeading'>{getText('ui-info-media-screens-try-features')}</div> */}
                    <HeadingComponent heading={getText('ui-info-media-screens-try-features')} info={getText('ui-info-media-screens-try-features-i')} padding="sm" border="top" className="featureHeading" />
                    <GridComponent cols="1" style={{paddingBottom:'20px'}}>
                      {features.map((item, index) => {
                        return (
                          <div className="featureLine" key={index} >
                            <div className="featureIcon">
                              <Icon id={item.icon} className="featureIcon" />
                            </div>
                            <SwitchButton toggle={getFeatureValue(item.type)} label={getText(item.title)} onChange={e => onSwitchFeature(item.type)} className="featureSwitch" />
                          </div>
                        )
                      })}
                    </GridComponent>
                  </>
                }


                { screenSelection === TYP_CAR_INFOSCREEN && 
                  <>
                    <p className="infoText">{getText('ui-info-media-screens-info-info')}</p>
                    <ImageTitle items={components} onChange={id => onChangeProduct(id)} selectedId={componentId} wide={true} className="noUppercase" />
                  </>
                }

              </ListComponent>

              <HeadingComponent heading={getText('ui-info-media-screens-positioning')} info={getText('ui-info-media-screens-positioning-i')} padding="sm" border="top" />
              
              { screenSelection && // Quick fix for ui flickering
                <CarShapeSelector selected={[getPositions({type:screenSelection})]} selectableWalls={['B', 'D', 'A']} 
                onChange={newPosition => setPositions({type:screenSelection, positions:[newPosition]})} 
                disabled={[getDisabledPositions()]} 
                labelLeft={getText('ui-general-left')}
                labelRight={getText('ui-general-right')}
                shape={ ( isTrueTypeCar( design.carType ) ) ?'through' :null }
                cxaxPieceEnabled={ (getDisabledPositions().indexOf('AX') !== -1) ?false :true}
                />
              }

              <InfoBox text={getText('ui-info-media-screens-info-box')} className="bottom-space-md" />
            </>
          }

          <div style={{height:'20px'}} />
        </ScrollBox>
      </EditorLayout>
      { ( showDialogKoneInformation && screenSelection === TYP_CAR_MEDIASCREEN && koneInformationAvailable) && 
        <KoneInformationDialog onConfirm={() => setShowDialogKoneInformation(false)} onCancel={() => setShowDialogKoneInformation(false)} />
      }
    </div>
  )
}
export default InfoMediaScreens;