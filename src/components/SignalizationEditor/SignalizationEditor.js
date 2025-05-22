import './SignalizationEditor.scss';
import React, { useContext, useState, useEffect, useRef, useMemo} from 'react';
import jsonLogic from 'json-logic-js';
import _ from 'lodash'

import { ProductContext } from '../../store/product/ProductProvider';
import { DesignContext } from '../../store/design/DesignProvider';
import { LayoutContext } from '../../store/layout/LayoutProvider';
import { Context3d } from '../../store/3d/shader-lib/Provider3d';
import { TranslationContext } from '../../store/translation/TranslationProvider';

import EditorLayout from '../EditorLayout';
import ToggleButtons from '../ToggleButtons';
import ScrollBox from '../ScrollBox';
import InfoBox from '../InfoBox';

import { getFinishType } from './cop-utils'

import { TYP_COP_PRODUCT_1, TYP_COP_2, VIEW3D_MODE_CAR, VIEW3D_MODE_LANDING, TYP_HI_PRODUCT, TYP_HL_PRODUCT, TYP_LCS_PRODUCT, TYP_CAR_WALL_ADD_DECO_PACKAGE, TYP_DOOR_A,
          TYP_CAR_WALL_B, ALL_POSSIBLE_COP_POSITIONS, EXTRA_FEATURES, TYP_CAR_GLASS_WALL_C, MAT_CAR_WALL_FINISH_B, MAT_CAR_FRONT_WALL_A, OFFERING_INDIA, MAT_LDO_FRAME,
          TYP_DOP_PRODUCT, TYP_EID_PRODUCT, TYP_DIN_PRODUCT, MAT_COP_FACE_PLATE_1 } from '../../constants'

import useFilters from './useFilters'
import EditCopSection from './sections/EditCopSection/EditCopSection';
import EditButtonsSection from './sections/EditButtonsSections/EditButtonsSections';
import EditCopPositionSection from './sections/EditCopPositionSection/EditCopPositionSection';
import SignalizationProvider, { SignalizationContext } from './provider/SignalizationEditorProvider';
import EditHorizontalCopSection from './sections/EditHorizontalCopSection/EditHorizontalCopSection';
import EditSignalizationFamilySection from './sections/EditSignalizationFamilySection/EditSignalizationFamilySection';
import EditHallLanternSection from './sections/EditHallLanternSection/EditHallLanternSection';
import EditHallIndicatorSection from './sections/EditHallIndicatorSection/EditHallIndicatorSection';
import EditLcsSection from './sections/EditLcsSection/EditLcsSection';
import EditFootButtonSection from './sections/EditFootButtonSection/EditFootButtonSection';
import EditDopSection from './sections/EditDopSection/EditDopSection';
import EditEidSection from './sections/EditEidSection/EditEidSection';
import EditDinSection from './sections/EditDinSection/EditDinSection';
import EditLandingPositionsSection from './sections/EditLandingPositionsSection/EditLandingPositionsSection';
import EditJambSection from './sections/EditJambSection/EditJambSection';
import EditEmergengy from './sections/EditEmergengy/EditEmergengy';
import EditLensSections from './sections/EditLensSection/EditLensSections';

const { EMERGENCY_COMMUNICATIONS_247 } = EXTRA_FEATURES

/**
 * Renders out the header part of the view (currently not in use)
 * @function SignalizationEditor Header renderer
 * @param {Object} props Propertied passed to this renderer
 */
const SignalizationEditor = (props) => {
  
  const { getText } = useContext(TranslationContext);

  const { 
    loading, product, getComponent: getComponentItem, getFinishTypeByComponent, getFinishes:getProductFinishes
  } = useContext(ProductContext)

  const { 
    design, getFinish, getComponentFinish, getComponent, setComponent, setFinishLandingDevices, setFinishHL,
    setFinishCOP,  getPositions,
  } = useContext(DesignContext)

  const { 
    currentFamily, setCurrentFamily,
    firstCopPosition, setFirstCopPosition,
    secondCopPosition, setSecondCopPosition,
    numOfCops, setNumOfCops,
    horizontalCopId,
    hiId, hlId, lcsId,
    dopId,
    copDisplayType,
    lcsDisplayType, hlDisplayType, hiDisplayType,
  } = useContext(SignalizationContext)

  const [ initialized, setInitialized ] = useState(false)

  const { view3dMode, setView3dMode } = useContext(LayoutContext); 
  const { sceneManager } = useContext(Context3d)

  const [cops, setCops] = useState([])

  const [componentFamilies, setComponentFamilies] = useState([])
  const [finishes, _setFinishes] = useState([])

  const signalizationData = product.componentsData.signalization

  function setFinishes(newFinishes) {
    const filtered = reFilterFinishes(newFinishes)
    _setFinishes(filtered)
  }

  const [allowedPanelPositions, setAllowedPanelPositions] = useState([])
  const famRef = useRef(null);

  const currentFamilyData = useMemo(() => {
    if (!currentFamily) return
    if (!product) return

    return signalizationData.copModels.find(x => x.id === currentFamily)
  }, [product, currentFamily])

  const finishType = getFinishType(currentFamily)

  const selectedCopId = useMemo(() => getComponent({ type: TYP_COP_PRODUCT_1 }), [design])
  

  const amountOfDevices = signalizationData.amountOfDevices
    .filter(item => !item.disabled)
    .filter(item => {
      if(!product?.rules?.variousFilteringRules) return 1
      // filtering out possible number of COPs. Only z-minispace at the moment
      return !jsonLogic.apply(product.rules.variousFilteringRules, {filteringRULE:'amountOfCOPs', PRODUCT:product.product, CARTYPE: design.carType, COP:selectedCopId})
    })
    .map(item => item.label)

  const selectedCopData = useMemo(() => {
    if (!currentFamilyData || !selectedCopId) return

    return currentFamilyData.copTypes.find(x => x.id === selectedCopId)
  }, [currentFamilyData, selectedCopId])

  const selectedHIData = useMemo(() => {
    if (!currentFamilyData || !currentFamilyData?.realHallIndicators || !hiId) return

    return currentFamilyData.realHallIndicators.find(x => x.id === hiId)
  }, [currentFamilyData, hiId])

  const selectedHLData = useMemo(() => {
    if (!currentFamilyData || !hlId) return

    return currentFamilyData.hallIndicators.find(x => x.id === hlId)
  }, [currentFamilyData, hlId])

  const selectedLCSData = useMemo(() => {
    if (!currentFamilyData || !lcsId) return

    return currentFamilyData.callStationTypes.find(x => x.id === lcsId)
  }, [currentFamilyData, lcsId])

  const {
    displayTypes: copDisplayTypes,
    displayColors: copDisplayColors
  } = getDisplayData(selectedCopData, copDisplayType)

  const {
    displayTypes: lcsDisplayTypes,
    displayColors: lcsDisplayColors
  } = getDisplayData(selectedLCSData, lcsDisplayType)

  const {
    displayTypes: hlDisplayTypes,
    displayColors: hlDisplayColors
  } = getDisplayData(selectedHLData, hlDisplayType)

  const {
    displayTypes: hiDisplayTypes,
    displayColors: hiDisplayColors
  } = getDisplayData(selectedHIData, hiDisplayType)

  // CHECK why is this sometimes an array (e.g. for KDSD20). Should it be?
  const finishTypesForComponent = getFinishTypeByComponent(selectedCopId)
  const finishTypeToUse = Array.isArray(finishTypesForComponent) ? finishTypesForComponent[0] : finishTypesForComponent

  const finish = getFinish({ type: finishTypeToUse })

  const [hls, setHls] = useState([])
  const [his, setHis] = useState([])
  const [lcss, setLcss] = useState([])

  const [fbs, setFbs] = useState([])
  const [eids, setEids] = useState([])
  const [dops, setDops] = useState([])
  const [dins, setDins] = useState([])

  
  const filters = useFilters(selectedCopId, currentFamily, horizontalCopId)

  const horCops = filters.getFilteredHorizontalCops()
  const horCopFinishes = filters.getFilteredHorizontalCopFinishes()
  const horCopPositions = filters.getFilteredHorizontalCopPositions()

  const hlFinishSeparate = (hlId && product.rules && product.rules.signalizationLandingExceptions) 
        ?!jsonLogic.apply(product.rules.signalizationLandingExceptions, {TESTING:'separateFinishes',HL: hlId})
        :false

/*   const dopFinishSeparate = (dopId && product.rules && product.rules.signalizationLandingExceptions) 
        ?!jsonLogic.apply(product.rules.signalizationLandingExceptions, {TESTING:'separateFinishes',DOP: dopId})
        :false
 */
  const hlFinish = () => {
    return ( ( ( ((design || {}).components || {}).find(item=>item.componentType === TYP_HL_PRODUCT) || {}).finish ) || finish)
  } 
  
  const hlFinishes = () => {
    return filters.getFilteredHLFinishes(hlId)
  }

  const hiFinish = () => {
    return ( ( ( ((design || {}).components || {}).find(item=>item.componentType === TYP_HI_PRODUCT) || {}).finish ) || finish)
  } 
  
  const hiFinishes = () => {
    return filters.getFilteredHIFinishes(hiId)
  }

  const lcsFinish = () => {
    return ( ( ( ((design || {}).components || {}).find(item=>item.componentType === TYP_LCS_PRODUCT) || {}).finish ) || finish)
  } 
  
  const lcsFinishes = () => {
    return filters.getFilteredLcsFinishes(lcsId, finishes)
  }

/*   const dopFinish = () => {
    return ( ( ( ((design || {}).components || {}).find(item=>item.componentType === TYP_DOP_PRODUCT) || {}).finish ) || finish)
  } 
  
  const dopFinishes = () => {
    return filters.getFilteredDOPFinishes(dopId)
  }
 */
  const updateDisabledPositions = (cop=selectedCopId) => {
    if(product.rules && product.rules.signalizationPositions ) {

      const deco = getComponent({type: TYP_CAR_WALL_ADD_DECO_PACKAGE})
      const bWall = design.components.find(item => item.componentType===TYP_CAR_WALL_B)
      const test={}
      test['PRODUCT'] = product.product;
      test['DECO'] = (deco || 'none');
      test['REGULATIONS'] = design.regulations || [];
      test['CAR_SHAPE'] = design.carShape || '';
      test['CAR_TYPE'] = design.carType || '';
      test['COP'] = cop
      test['DOOR'] = (design.components.find(item => item.componentType===TYP_DOOR_A) || {}).component
      test['SCENIC'] =( design.components.find(item => item.componentType === TYP_CAR_GLASS_WALL_C) || {} ).positions || []
      test['SIDEWALL_PARTS'] = bWall ?(bWall.parts || []).length :0

      const disabledCopPositions = jsonLogic.apply(product.rules.signalizationPositions, test)

      // console.log({test,disabledCopPositions})

      const newAllowedPositions = signalizationData.copPositions
        .map(item => item.id)
        .filter(id => !disabledCopPositions.includes(id))
        .sort((a, b) => {
          // Use the same order as ALL_POSSIBLE_COP_POSITIONS array
          const aIndex = ALL_POSSIBLE_COP_POSITIONS.findIndex(x => x === a)
          const bIndex = ALL_POSSIBLE_COP_POSITIONS.findIndex(x => x === b)

          if (aIndex > bIndex) return 1
          if (aIndex < bIndex) return -1
          return 0
        })


      setAllowedPanelPositions(newAllowedPositions)

      // Force the COPs to an allowed position 
      if(!newAllowedPositions.includes(firstCopPosition)) {
        setFirstCopPosition(newAllowedPositions[0] || ALL_POSSIBLE_COP_POSITIONS[0])
      }

      if(secondCopPosition) {
        if (!newAllowedPositions.includes(secondCopPosition)) {
          setSecondCopPosition(newAllowedPositions[0] || ALL_POSSIBLE_COP_POSITIONS[0])
        }
      }
    }
  }

  // Things that were previously in update() but really are required to be run only once when opening the view
  function initializeUIState() {
    const numb = getComponent({type: TYP_COP_2}) ? '2' :'1'
    
    setNumOfCops(numb)

    const componentItem = getComponentItem({id:selectedCopId})
    if (componentItem && componentItem.componentFamily !== currentFamily) {
      setCurrentFamily( componentItem.componentFamily )
    }
    
    // Rendering sections only after the necessary initial states have been set
    // so the sections themselves intialize correctly to the design settings
    setInitialized(true)
  }

  function updateCopFinishes() {
    if (selectedCopData) {
      const newFinishes = (selectedCopData.finishes || []).filter(finish => {
        return finish?.releases?.includes(product.productRelease)
      }).map(finish => {
        // The displayed SAP ID for face plate prints should not include 'MAT_D_'
        return {
          ...finish,
          sapId: finish.sapId?.replace('MAT_D_', '')
        }
      })

      setFinishes(newFinishes)
    } 

  }

  function update() {
    // Setting available signalization items based on current elevator setup
    setCops(filters.getFilteredCOPs())
    setLcss(filters.getFilteredLCSs())
    setFbs(filters.getFilteredFBs())
    setHls(filters.getFilteredHLs())
    setHis(filters.getFilteredHIs())
    setEids(filters.getFilteredEIDs())
    setDops(filters.getFilteredDOPs())
    setDins(filters.getFilteredDINs())

    updateCopFinishes()

    setComponentFamilies(filters.getFilteredComponentFamilies())

    
    // CHECK: How can this happen? Is this even needed?
    if (!firstCopPosition) {
      const preferredPosition = 'B2' // CHECK: What should this be??
      if (allowedPanelPositions.includes(preferredPosition)) {
        setFirstCopPosition(preferredPosition)
      } else {
        setFirstCopPosition(allowedPanelPositions[0] || ALL_POSSIBLE_COP_POSITIONS[0])
      }
    }
  }

  useEffect(() => {
    if (product) {
      updateDisabledPositions()
      initializeUIState()
      update()
    }
    return () => {
    }
  }, [])

  useEffect(() => {
    // 
    update()
  }, [view3dMode])

  useEffect(() => {
    //
    if(product?.offeringLocation === OFFERING_INDIA) {
      updateCopFinishes()
    } 
    updateCameraPosition()
  }, [numOfCops, firstCopPosition, secondCopPosition])

  useEffect(() => {
    // component mount
    if (product) {
      // Exception for KSSD: landing finishes and cop finish do not necessariy have to match
      const landingComponent = getComponent({type: TYP_HL_PRODUCT} ) || getComponent({type: TYP_LCS_PRODUCT} )
      const item = getComponentItem({ id: landingComponent })
      const family = item && item.componentFamily

      if( ((family !== 'KSSD' && family !== 'KDSD') || product.product ==='home') && getComponent({type: TYP_HL_PRODUCT} ) && finish && getComponentFinish({type: TYP_HL_PRODUCT}) !== finish) {
        setFinishLandingDevices({type: finishType, finish:finish})
        
        if( hlFinishes() && hlFinishes().length>0 && !hlFinishes().find(item => item.id === finish) ) {
          setFinishHL({finish:hlFinishes()[0].id})
        }
      }

      if( ((family !== 'KSSD' && family !== 'KDSD') || product.product ==='home') && getComponent({type: TYP_LCS_PRODUCT} ) && finish && getComponentFinish({type: TYP_LCS_PRODUCT}) !== finish) {
        setFinishLandingDevices({type: finishType, finish:finish})
      }
      
      if(currentFamily && selectedCopId && selectedCopId!=='cop-none') {
        // Getting the finishes for the specific COP type of the model from the components data.
        let a, b, c
        a = signalizationData.copModels.find(model => model.id === currentFamily);
        a && a.copTypes && (b = a.copTypes.find(type => type.id === selectedCopId));
        b && b.finishes && (c = b.finishes.filter(finish => !finish.disabled));

        if (c) {
          c = c.map(item => {
            // remove MAT_D_ from displayed sapId
            if (item.sapId && item.sapId.indexOf('MAT_D_') !== -1) {
              return {
                ...item,
                sapId: item.sapId.substring(6)
              }
            }
            return item
          })
        }

        c && setFinishes(c);
        
      } else {
        setFinishes([])
      }

      updateDisabledPositions()
      update()

    }
  }, [selectedCopId, hiId, hlId, lcsId])

  useEffect(() => {
    // component mount
    if (product) {
      if(famRef.current) {
        famRef.current.forceListClose();
      }
      update()
    }
    return () => {
      // component unmount
    }
  }, [currentFamily])

  useEffect(() => {
    if(cops.length > 0 && !(cops.find(item => item.id === selectedCopId)) ) {
      setComponent({type: TYP_COP_PRODUCT_1, component: cops[0].id})
    }
    return () => {
      //
    }
  }, [cops])

  // Set valid finishes when finish list changes (i.e. when COP family changes)
  useEffect(() => {
    const finishIds = finishes.map(finish => finish.id)
    if (finishes.length > 0 && (!finish || finishIds.indexOf(finish) === -1)) {
      if ( view3dMode === VIEW3D_MODE_CAR ) setFinishCOP({type: finishType, finish: finishes[0].id})
      if (view3dMode === VIEW3D_MODE_LANDING) {
        if (lcsFinishes()) {
          const lcsFinishList = lcsFinishes()
          if( lcsFinishList.length >0 && !lcsFinishList.find(item => item.id === lcsFinish()) ) {
            setFinishLandingDevices({ type: finishType, finish: lcsFinishList[0].id })
          }
        } else {
          setFinishLandingDevices({ type: finishType, finish: finishes[0].id })
        }
      }
      if(hlFinishSeparate) {
        const hlFinishList = hlFinishes()
        if( hlFinishList.length >0 && !hlFinishList.find(item => item.id === hlFinish()) ) {
          setFinishHL({finish:hlFinishList[0].id})
        }
      }
    }
  }, [finishes])

  if (loading) {
    // TODO: Prettify this
    return (<>loading...</>)
  }

  function updateCameraPosition() {
    if (!sceneManager) return
    if (view3dMode !== VIEW3D_MODE_CAR) return

    if (!firstCopPosition) return

    const copWall = firstCopPosition[0] // A, B, C, or D
    const copWall2 = secondCopPosition?.[0]

    // Focus front wall if either COP is on that wall
    if (copWall === 'A' || copWall2 === 'A') {
      sceneManager.lookAtWall('A')
      return
    }

    // If both COPs are on the same wall, focus that wall.
    // Otherwise focus the backwall (unless A wall has been selected)
    if (getComponent({type: TYP_COP_2})) {
      if (copWall === copWall2) {
        sceneManager.lookAtWall(copWall)
      } else {
        sceneManager.lookAtWall('C')
      }
      return
    }
  
    sceneManager.lookAtWall(copWall)
  }

  function zoomToCopButtons() {
    if (!sceneManager) return
    if (view3dMode !== VIEW3D_MODE_CAR) return

    if (!firstCopPosition) return

    const copWall = firstCopPosition[0] // A, B, C, or D

    sceneManager.focusOnCopButtons(copWall);
    // sceneManager.lookAtWall(copWall)
    // sceneManager.zoomCopButtons()
  }

  function reFilterFinishes(finishList) {

    if(finishList && selectedCopId && product.offeringLocation === OFFERING_INDIA && product?.rules?.indiaFinishExceptions && view3dMode === VIEW3D_MODE_CAR) {
      finishList = finishList.filter(item => {
        const test = {
          TESTING: 'copFinish',
          PRODUCT: product.product,
          FINISH: item.id,
          COP: selectedCopId,
          COP_POS: getPositions({type:TYP_COP_PRODUCT_1}),
          B_FINISH: getFinish({type:MAT_CAR_WALL_FINISH_B}),
          A_FINISH: getFinish({type:MAT_CAR_FRONT_WALL_A}),
          DESIGN: design.originalSapId,
        }
        return jsonLogic.apply(product.rules.indiaFinishExceptions, test)
      })
    }


    if(finishList && selectedCopId && product && product.rules && product.rules.signalizationFinishRefilter) {
      const filteredFinishes = finishList.filter(item => {
        return jsonLogic.apply(product.rules.signalizationFinishRefilter,{
          TYP_COP_PRODUCT_1:selectedCopId,
          LCS:getComponent({type:TYP_LCS_PRODUCT}),          
          VIEW:view3dMode,
          FINISH:item.id,
          DOORFINISH: getFinish({type:MAT_LDO_FRAME}),
          PRODUCT:product.product
        })
      })
      return filteredFinishes
    } else {
      return finishList
    }
  }

  // console.log('finishes:', finishes)
  // console.log('lcsfinishes:', lcsFinishes())
  
  return (      
    <div className="SignalizationEditor">        
      <EditorLayout heading={getText('ui-signalization-heading')} >
        <ToggleButtons 
          content={[{value: VIEW3D_MODE_CAR, label: getText('ui-general-inside')}, {value: VIEW3D_MODE_LANDING, label: getText('ui-general-landing'), disabled: !currentFamily}]}
          selectedButton={view3dMode} 
          onChange={e => setView3dMode(e)} 
        />

        <ScrollBox>        
          { initialized && view3dMode === VIEW3D_MODE_CAR && 
            <div className="section-container">
              <EditSignalizationFamilySection
                componentFamilies={componentFamilies}
              />

              { currentFamily &&
                <>
                  <EditCopSection
                    cops={cops}
                    displayTypes={copDisplayTypes}
                    displayColors={copDisplayColors}
                    finishes={finishes}
                    finishType={finishType}
                    showSapId={product?.businessSpecification?.market !== 'ENA'} 
                    />
                  <EditButtonsSection lookAtCop={zoomToCopButtons} />
                  { (selectedCopId === 'KCF01P' || selectedCopId === 'KCF02P' || selectedCopId == 'KCF01C' || selectedCopId == 'KCF02C' || selectedCopId == 'KCF12C' || selectedCopId == 'KCS01' || selectedCopId == 'KCS02'   ) &&
                  <EditLensSections lookAtCop={zoomToCopButtons} /> }

                  <EditCopPositionSection
                    amountOfDevices={amountOfDevices}
                    allowedPanelPositions={allowedPanelPositions}
                  />
                  <EditHorizontalCopSection
                    horizontalCops={horCops}
                    horizontalCopFinishes={horCopFinishes}
                    horizontalCopPositions={horCopPositions}
                  />

                  { (product?.extraFeatures && product.extraFeatures.indexOf(EMERGENCY_COMMUNICATIONS_247) !== -1) &&
                    <EditEmergengy /> 
                  }
                </>
              }
            </div>
          }

          { view3dMode === VIEW3D_MODE_LANDING &&
            <div className="section-container">
              { currentFamily &&
                <>
                  <EditHallIndicatorSection
                    hallIndicators={his}
                    finishes={hlFinishSeparate ? hiFinishes() : finishes}
                    showFinishSelector={true}
                    separateLandingFinishes={hlFinishSeparate}
                    finishType={finishType}
                    displayTypes={hiDisplayTypes}
                    displayColors={hiDisplayColors}
                    showSapId={product?.businessSpecification?.market !== 'ENA'} 
                  />

                  <EditHallLanternSection
                    hallLanterns={hls}
                    finishes={hlFinishSeparate ? hlFinishes() : finishes}
                    showFinishSelector={true}
                    separateLandingFinishes={hlFinishSeparate}
                    finishType={finishType}
                    displayTypes={hlDisplayTypes}
                    displayColors={hlDisplayColors}
                    showSapId={product?.businessSpecification?.market !== 'ENA'} 
                  />

                  <EditLcsSection
                    lcss={lcss}
                    // finishes={finishes}
                    finishes={lcsFinishes() || finishes}
                    finishType={finishType}
                    showFinishSelector={true}
                    displayTypes={lcsDisplayTypes}
                    displayColors={lcsDisplayColors}
                    showSapId={product?.businessSpecification?.market !== 'ENA'} 
                  />

                  <EditFootButtonSection
                    footButtons={fbs}
                  />

                  <EditDopSection
                    dops={dops}
/*                     finishes={hlFinishSeparate ? hlFinishes() : finishes}
                    separateLandingFinishes={dopFinishSeparate}  */
                    finishes = { getProductFinishes({type:MAT_COP_FACE_PLATE_1, filteringOptions: {
                      rule: 'signalizationFinishRefilter',
                      test: { TEST:'dopFinishes', DOP: getComponent({type:TYP_DOP_PRODUCT}) }
                    }}) }
                    showSapId={product?.businessSpecification?.market !== 'ENA'}
                  />

                  <EditEidSection
                    elevatorIdentifiers={eids}
                    finishes = { getProductFinishes({type:MAT_COP_FACE_PLATE_1, filteringOptions: {
                      rule: 'signalizationFinishRefilter',
                      test: { TEST:'eidFinishes', EID: getComponent({type:TYP_EID_PRODUCT}) }
                    }}) }
                    showSapId={product?.businessSpecification?.market !== 'ENA'}
                  />

                  <EditDinSection
                    destinationIndicators={dins}
                    finishes = { getProductFinishes({type:MAT_COP_FACE_PLATE_1, filteringOptions: {
                      rule: 'signalizationFinishRefilter',
                      test: { TEST:'dinFinishes', DIN: getComponent({type:TYP_DIN_PRODUCT}) }
                    }}) }
                    showSapId={product?.businessSpecification?.market !== 'ENA'}
                  />

                  <EditJambSection
                    jambs={filters.getFilteredJAMBs()}
                    positions={filters.getFilteredJAMBPositions()}
                    dcs={currentFamily==='DCS'}
                  />

                  <EditLandingPositionsSection
                    landingPositions={filters.getFilteredLandingPositions()}
                  />

                  { (product.product === 'monospace-300-ena') &&
                    <InfoBox text={getText('ui-jamb-direction-indicator-info')} style={{ marginBottom: '20px' }} className="smallIcon" />
                  }

                </>
              }

            </div> 
          }
          <div style={{height:'20px'}} />
        </ScrollBox>
      </EditorLayout>
    </div>
  )
}

function getDisplayData(selectedComponent = {}, selectedDisplay = {}) {
  const displayTypes = selectedComponent.displayTypes || []

  let selectedDisplayData

  if (selectedDisplay) {
    selectedDisplayData = displayTypes.find(x => x.id === selectedDisplay)
  }

  const displayColors = selectedDisplayData?.displayColors || []

  return { displayTypes, displayColors }
}


function EditorInProvider(props) {

  return (
    <SignalizationProvider>
      <SignalizationEditor {...props} />
    </SignalizationProvider>
  )
}

export default EditorInProvider;