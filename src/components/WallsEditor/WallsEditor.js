import './WallsEditor.scss';
import React, { useContext, useState, useRef, useEffect, useMemo } from 'react';
import jsonLogic from 'json-logic-js';
import deepcopy from 'deepcopy'
import { ProductContext } from '../../store/product/ProductProvider'
import { DesignContext } from '../../store/design/DesignProvider'
import { LayoutContext } from '../../store/layout/LayoutProvider';
import { Context3d } from '../../store/3d/shader-lib/Provider3d';
import { TranslationContext } from '../../store/translation/TranslationProvider';


import EditorLayout from '../EditorLayout';
import RadioButtonGroup from '../RadioButtonGroup';
import GridComponent from '../GridComponent';
import TileComponent from '../TileComponent';
import { DecoSelector, WallSelector, FinishSelector } from './WallComponentSelectors'
import Icon from '../Icon'

import { 
  TYP_CAR_WALL_ADD_DECO_PACKAGE, CAR_TYPE_GLASS_BACKWALL,VERTICAL, HORIZONTAL, CAR_TYPE_NORMAL, CAR_TYPE_TTC,
  TYP_CAR_GLASS_WALL_C, TYP_CAR_CEILING, TYP_CAR_WALL_D, TYP_CAR_WALL_C, EDIT_VIEW_CUSTOM_WALL_FINISH,
  ALL_WALL_PANELS_ID,
  ONE_PANEL,
  TWO_PANELS,
  THREE_PANELS,
  TYP_CAR_WALL_B,
  TWO_PANELS_COMBINED,
  TYP_CAR_LAMINATE_LIST, TYP_CAR_GLASS_WALL_FRAME, CAR_TYPE_GLASSMATERIAL_BACKWALL,
  FIRST_TWO_PANELS, MAT_CAR_WALL_FINISH_C, 
  PANELING_EXCEPTION_CAR_SHAPES, CAR_SHAPE_WIDE_23_17_26,
  CAR_TYPE_TTC_ENA, DECO_GLASS_MATERIAL, MAT_CAR_WALL, EXTRA_FEATURES, OFFERING_INDIA, GLASS_C_FHT_HERMES, MAT_CAR_SKIRTING
} from '../../constants'
import HeadingComponent from '../HeadingComponent/HeadingComponent';
import ScrollBox from '../ScrollBox';
import Button from '../Button';
import WallItemSelector from '../WallItemSelector';
import { getPanelTypes, getIndiaBackWallSetup } from '../../utils/design-utils';
import TermsOfService from '../TermsOfService';
import ScenicCarTypeSelector from '../ScenicCarTypeSelector';
const NORMAL_VIEW_MODE = 'normal'
const SCENIC_VIEW_MODE = 'scenic'

/**
 * Renders out the header part of the view (currently not in use)
 * @function WallsEditor Header renderer
 * @param {Object} props Propertied passed to this renderer
 */
const WallsEditor = (props) => {

  const { sceneManager } = useContext(Context3d)
  const { getText } = useContext(TranslationContext)

  const { 
    loading, 
    product, 
    getComponents, 
    getAllowedDecoPackages 
  } = useContext(ProductContext);


  const { 
    setPanelOrientation,  
    getComponent, setComponent, 
    setWallFinish,
    getFinish,
    getDesignProperty,
    design, 
    cornerPieces,
    getComponentFinishType,
    getFinishMaterial, 
    getGroups, setGroups, getValidGroups,
    getAllWallPanels,
    setWallPanelingStyle,
    setThreePanelsAtOnce,
    getLaminateListsByWallFinish,
    getPositions, setCarType,
  } = useContext(DesignContext);

  const { 
    setEditView, 
    selectedWall, setSelectedWall, setCornerPiecesExeption,
    getSelectedPanel, setSelectedPanel,
  } = useContext(LayoutContext);

  const [ selectedMaterial, setSelectedMaterial ] = useState(null)
  const [ selectedFrameMaterial, setSelectedFrameMaterial ] = useState(null)
  const [ selectedViewMode, setSelectedViewMode ] = useState( ( getComponent({type:TYP_CAR_GLASS_WALL_C}) && product?.wallEditor?.scenicSelection ) ?SCENIC_VIEW_MODE :NORMAL_VIEW_MODE )
  
  const selectedWallFinishType = useMemo(() => {
    return getComponentFinishType({ type: selectedWall })
  }, [selectedWall])

  const decoSelectorRef = useRef(null)

  const [selectedPanelingStyle, setSelectedPanelingStyle] = useState()
  const [triColorUndo, setTriColorUndo] = useState({TYP_CAR_WALL_B:[],TYP_CAR_WALL_C:[],TYP_CAR_WALL_D:[]})

  const decoPackages = useMemo(() => {
    return getAllowedDecoPackages({ design }) || []
  }, [design])

  const decoPackageId = getComponent({ type: TYP_CAR_WALL_ADD_DECO_PACKAGE })

  const [selectedScenicType, setSelectedScenicType] = useState( (design?.components?.find(item => item.componentType === TYP_CAR_GLASS_WALL_C)?.component) )

  const carType = getDesignProperty('carType')
  const carShape = getDesignProperty('carShape')

  const cFinish = getFinish({type:MAT_CAR_WALL_FINISH_C})

  const fullScenicCar = product?.extraFeatures?.includes(EXTRA_FEATURES.FULL_SCENIC_CAR)
  const scenicSelection = (product.wallEditor.scenicSelection && ( carType === CAR_TYPE_GLASS_BACKWALL || carType === CAR_TYPE_NORMAL || fullScenicCar) && carShape !== CAR_SHAPE_WIDE_23_17_26 ) || false
  // const scenicSelection = (product.wallEditor.scenicSelection && ( carType === CAR_TYPE_GLASS_BACKWALL || carType === CAR_TYPE_NORMAL || fullScenicCar) ) || false

  const showDecoSelector = useMemo(() => {
    if (selectedViewMode !== NORMAL_VIEW_MODE) return false
    if (!product.wallEditor.decorativeMirrors) {
      return false
    }

    // return (decoPackages.length > 0 && carType !== CAR_TYPE_TTC)
    return (decoPackages.length > 0 && ( (!scenicSelection && carType === CAR_TYPE_NORMAL) || (scenicSelection && carType !== CAR_TYPE_TTC) ) )
  }, [product, selectedViewMode, decoPackages, carType]) 

  const showScenicCarTypeSelector = (() => {
    if (selectedViewMode !== SCENIC_VIEW_MODE) return false
    return true
  })()

  const initialSelectionMade = useMemo(() => {
    if (selectedViewMode === NORMAL_VIEW_MODE) { 

      if(!product?.wallEditor?.decorativeMirrors && carType === CAR_TYPE_GLASS_BACKWALL && !product?.businessSpecification?.market === 'ENA') {
        return false
      }

      // Treat selection as made if it cannot be done in the first place.
      if (!showDecoSelector) {
        return true
      }
      
      return !!decoPackageId
    } else if (selectedViewMode === SCENIC_VIEW_MODE) {
      return !!selectedScenicType
    }
  }, [decoPackageId, selectedScenicType, showDecoSelector, selectedViewMode])
  
  const showWallSelector = useMemo(() => {

    // in case the product has no wall selector by default but the scenic car is selected, show the wall selector in that case
    if(!product.wallEditor.wallSelector && carType === CAR_TYPE_GLASS_BACKWALL && selectedViewMode === SCENIC_VIEW_MODE && product?.businessSpecification?.market !== 'ENA') {
      return true
    }

    if (!product.wallEditor.wallSelector) {
      return false
    }

    if(!product?.wallEditor?.decorativeMirrors && carType === CAR_TYPE_GLASS_BACKWALL && selectedViewMode === NORMAL_VIEW_MODE && !product?.businessSpecification?.market === 'ENA') {
      return false
    }

    if (!product.wallEditor.decorativeMirrors) {
      return true
    }

    return initialSelectionMade
  }, [product, decoPackages, decoPackageId, carType, initialSelectionMade])

  const showPanelingSelector = useMemo(() => {
    if (!product.wallEditor.mixableWallFinishes) {
      return false
    }

    if (cornerPieces) {
      return false
    }

    if (product?.offeringLocation === OFFERING_INDIA) {
      return false
    }

    if (!initialSelectionMade) {
      return false
    }
    const wallData = product.componentsData.walls
 
    if (selectedWall === TYP_CAR_WALL_B || selectedWall === TYP_CAR_WALL_D) {
      // Expecting precisely one side wall panel: 
      // - if 2, everything as usual (no changes in admin tool).
      // - if 0, should not happen, bug in the backend --> behave as if no change in admin tool
      if (!wallData.sideWallPanels || wallData.sideWallPanels.length === 1) {
        return false
      }
    }

    if(product && product.rules && product.rules.wallMixingInstructions) {
      const result = jsonLogic.apply(product.rules.wallMixingInstructions, {WALL: selectedWall, SHAPE:design.carShape})
      if( !result[0] ) {
        return false
      }
    }

    if (product.wallEditor.twoPanels && selectedWall === TYP_CAR_WALL_C) {
      return false
    }

    // Only show the element if there is a selected wall.
    // Only time when there is no selected wall in this view
    // is when it is opened, and even then just momentarily.
    // This is basically a hack to get the initial wallPanelingStyle
    // value to set correctly.
    return !!selectedWall
  }, [product, carShape, selectedWall, showWallSelector, initialSelectionMade, cornerPieces])


  // homelift can only have one or two panels on the sidewall.
  // other SOC products can only have one or two panels on the backwall if the
  // width of the car is 1100 (i.e. deep and square car shapes).
  const panelingException = useMemo(() => {
    if (!product) return false
    if (!showPanelingSelector) return false

    // 1100 width cars can only have one or two panels on the backwall.
    // No need to have separate finishes per panel.
    if (PANELING_EXCEPTION_CAR_SHAPES.includes(design.carShape) && selectedWall === TYP_CAR_WALL_C) {
      return true
    }

    return product.wallEditor.twoPanels
  }, [product, showPanelingSelector])

  const showWallGroupSelector = useMemo(() => {
    if (!showWallSelector) return false
    if (carType !== CAR_TYPE_NORMAL) return false

    // if (product.wallEditor.mixableWallFinishes) {
    if (!product.wallEditor.wallFinishesRestricted) {
      return false
    }

    return decoPackages.length === 0 || decoPackageId === 'DECO0' || decoPackageId === 'DECO3' || decoPackageId === 'DECO7'
  }, [showWallSelector, carType, product, decoPackages, decoPackageId])

  const showScenicWindowSelector = useMemo( () => {
    return (carType === CAR_TYPE_GLASS_BACKWALL && selectedWall === TYP_CAR_GLASS_WALL_C && !getPositions({type:TYP_CAR_GLASS_WALL_C}));  
  }, [selectedWall, carType])

  const showCustomImportButton = useMemo(() => {
    if (!product) return false
    if (!initialSelectionMade) return false
    //if (showScenicWindowSelector) return false

    if (selectedViewMode === SCENIC_VIEW_MODE) return false

    return product.wallEditor.customWallImport
  }, [showScenicWindowSelector, product, initialSelectionMade, selectedViewMode])

  const groups = useMemo(() => {
    return getGroups()
  }, [design])

  const validGroups = useMemo(() => {
    return getValidGroups()
  }, [design])

  // Show material selector immediately if it is not possible to select
  // a deco package for the car. Otherwise show it after a deco package
  // has been selected.
  const showMaterialSelector = useMemo(() => {    
    return initialSelectionMade
  }, [initialSelectionMade])

  const showRegularWallFinishSelector = useMemo(() =>{

    if( (selectedWall === TYP_CAR_GLASS_WALL_C || selectedWall === TYP_CAR_GLASS_WALL_FRAME)  ) {
      return false
    }

    if(selectedWall === TYP_CAR_WALL_C && getPositions({type:TYP_CAR_GLASS_WALL_C})?.includes('C') ) {
      return false
    }

    if(selectedWall === TYP_CAR_WALL_B && (getPositions({type:TYP_CAR_GLASS_WALL_C})?.includes('B1') || getPositions({type:TYP_CAR_GLASS_WALL_C})?.includes('B2'))) {
      return false
    }

    if(selectedWall === TYP_CAR_WALL_D && (getPositions({type:TYP_CAR_GLASS_WALL_C})?.includes('D1') || getPositions({type:TYP_CAR_GLASS_WALL_C})?.includes('D2'))) {
      return false
    }

    return true
  }, [selectedWall, design])

  const showFinishSelector = showMaterialSelector;
  
  const showPanelOrientationSelector = useMemo(() => {
    if (!product.wallEditor.panelOrientationSelector) {
      return false
    }

    if (selectedViewMode === SCENIC_VIEW_MODE) return false 

    return initialSelectionMade
  }, [product, initialSelectionMade, selectedViewMode])

  const onScenicTypeSelection = (type) => {
    setSelectedScenicType(type)
    onWallSelection(TYP_CAR_WALL_C)
  }

  const updateSelectedWall = (onPanelMount=false) => {
    let modifiedSelectedWall = selectedWall
    switch (carType) {
      case CAR_TYPE_NORMAL:
        if (!selectedWall || selectedWall === TYP_CAR_GLASS_WALL_C || selectedWall === TYP_CAR_GLASS_WALL_FRAME) {
          setSelectedWall(TYP_CAR_WALL_C);
          modifiedSelectedWall = TYP_CAR_WALL_C;
          sceneManager.lookAtWall(selectedWall || TYP_CAR_WALL_C);
        } else if (selectedWall !== TYP_CAR_WALL_C && onPanelMount) {
          setSelectedWall(TYP_CAR_WALL_C);
          sceneManager.lookAtWall(TYP_CAR_WALL_C);
        } else {
          sceneManager.lookAtWall(selectedWall);
        }
        break;

      case CAR_TYPE_GLASS_BACKWALL:
        if (!selectedWall || selectedWall === TYP_CAR_WALL_C || selectedWall === TYP_CAR_GLASS_WALL_FRAME) {
          setSelectedWall(TYP_CAR_GLASS_WALL_C);
          modifiedSelectedWall = TYP_CAR_GLASS_WALL_C
          sceneManager.lookAtWall(TYP_CAR_GLASS_WALL_C);        
        } else {
          sceneManager.lookAtWall(selectedWall);
        }
        break;

      case CAR_TYPE_GLASSMATERIAL_BACKWALL:      
      if (!selectedWall || selectedWall === TYP_CAR_WALL_C || selectedWall === TYP_CAR_GLASS_WALL_C) {
          setSelectedWall(TYP_CAR_GLASS_WALL_FRAME);
          modifiedSelectedWall = TYP_CAR_GLASS_WALL_FRAME
          sceneManager.lookAtWall(TYP_CAR_GLASS_WALL_FRAME)        
        } else {
          sceneManager.lookAtWall(selectedWall);
        }
        break;

      case CAR_TYPE_TTC:
      case CAR_TYPE_TTC_ENA:
        if (!selectedWall || selectedWall === TYP_CAR_WALL_C || selectedWall === TYP_CAR_GLASS_WALL_C || selectedWall === TYP_CAR_GLASS_WALL_FRAME) {
          setSelectedWall(TYP_CAR_WALL_D);
          modifiedSelectedWall = TYP_CAR_WALL_D
          sceneManager.lookAtWall(TYP_CAR_WALL_D);        
        } else {
          sceneManager.lookAtWall(selectedWall);
        }
        break;
        
      default:
        break;
    }

    // if(selectedWall === TYP_CAR_WALL_C && product?.businessSpecification?.market === 'SOC') {
    //   setSelectedPanelingStyle(THREE_PANELS)
    // }  

    if(product?.offeringLocation === OFFERING_INDIA && modifiedSelectedWall === TYP_CAR_WALL_C) {
      const [panelingType, selectedPanel] = getIndiaBackWallSetup(design?.backWallPanelingType)
      if(panelingType) {
        setSelectedPanelingStyle(panelingType)
      }
    }
 
  }

  useEffect(() => {
    updateSelectedWall(true)
  }, [])

  useEffect(() => {
    if(cornerPieces) {
      setCornerPiecesExeption()
      if(selectedWall === TYP_CAR_WALL_B) {
        setSelectedPanelingStyle(TWO_PANELS)
      }
      if(selectedWall === TYP_CAR_WALL_C) {
        setSelectedPanelingStyle(THREE_PANELS)
      }
      if(selectedWall === TYP_CAR_WALL_D) {
        setSelectedPanelingStyle(TWO_PANELS)
      }

    }
  }, [cornerPieces])

  useEffect(() => {

    updateSelectedWall()
    setSelectedScenicType(design?.components?.find(item => item.componentType === TYP_CAR_GLASS_WALL_C)?.component)

  }, [carType])

  useEffect(() => {

    if( product?.wallEditor?.mixableWallFinishes && selectedWall === TYP_CAR_WALL_C 
        && getFinishMaterial({type:MAT_CAR_WALL_FINISH_C}) === DECO_GLASS_MATERIAL
        && !panelingException
        && selectedPanelingStyle !== THREE_PANELS) {
      setTriColorUndo({...triColorUndo, TYP_CAR_WALL_C:[]})
      onPanelingStyleSelection(THREE_PANELS)
  
    }

  }, [cFinish])

  useEffect(() => {

    if(selectedPanelingStyle === THREE_PANELS || selectedPanelingStyle === TWO_PANELS_COMBINED) {
      if(selectedWall && (selectedWall === TYP_CAR_WALL_B || selectedWall === TYP_CAR_WALL_D) ) {
        if( triColorUndo && triColorUndo[TYP_CAR_WALL_B] && triColorUndo[TYP_CAR_WALL_D] && triColorUndo[TYP_CAR_WALL_B].length>0 && triColorUndo[TYP_CAR_WALL_D].length>0 ) {

          const bParts = deepcopy(triColorUndo[TYP_CAR_WALL_B])
          setThreePanelsAtOnce({wall:TYP_CAR_WALL_B , parts:bParts})

          const dParts = deepcopy(triColorUndo[TYP_CAR_WALL_D])
          setThreePanelsAtOnce({wall:TYP_CAR_WALL_D , parts:dParts})

          setTriColorUndo({...triColorUndo, TYP_CAR_WALL_B:[], TYP_CAR_WALL_D:[]})
        }
      } else {
        if( triColorUndo && triColorUndo[TYP_CAR_WALL_C] && triColorUndo[TYP_CAR_WALL_C].length>0 && !cornerPieces) {

          const cParts = deepcopy(triColorUndo[TYP_CAR_WALL_C])
          setThreePanelsAtOnce({wall:TYP_CAR_WALL_C, parts:cParts})

          // Disable undo functionality for C wall when there is only 1 or 2 panels to choose from, as
          // all the panels will always have the same finish in that case.
          if (!(panelingException && selectedWall === TYP_CAR_WALL_C)) {
            setTriColorUndo({...triColorUndo, TYP_CAR_WALL_C:[]})
          }
        }
      }
    }

    if(product?.offeringLocation === OFFERING_INDIA && selectedWallFinishType === MAT_CAR_WALL_FINISH_C) {
      const [panelingType, selectedPanel] = getIndiaBackWallSetup(design?.backWallPanelingType)
      if(selectedPanel) {
        setSelectedPanel(selectedPanel)
      }
    }

/*     if(selectedPanelingStyle === TWO_PANELS) {
      if(product?.wallEditor?.mixableWallFinishes && selectedWall === TYP_CAR_WALL_C && getFinishMaterial({type:MAT_CAR_WALL_FINISH_C}) === DECO_GLASS_MATERIAL) {
        const wallMaterials = product?.componentsData?.walls?.materials
        if(wallMaterials) {
          const nonDecoOrGlass = wallMaterials.find(item => (item.id !== DECO_GLASS_MATERIAL && item.id !== CAR_TYPE_GLASS_BACKWALL && item?.finishes?.length > 0 ) )
          if(nonDecoOrGlass) {
            setWallFinish({finishType:MAT_CAR_WALL_FINISH_C, finish:nonDecoOrGlass.finishes[0].id, finishMaterial:nonDecoOrGlass.id})
            setSelectedMaterial(nonDecoOrGlass.id)
          } 
        }
      }   
    } */

  },[selectedPanelingStyle])

  if (loading) {
    return null
  }
  
  const selectedViewModeHandler = (val) => {

    if(val === NORMAL_VIEW_MODE && design.carType === CAR_TYPE_TTC && getComponent({type:TYP_CAR_GLASS_WALL_C})) {
      setComponent({type:TYP_CAR_GLASS_WALL_C, component:null})
      if( product?.businessSpecification?.market === 'SOC' ) {
        setCarType({type:CAR_TYPE_NORMAL})
      }
      setSelectedScenicType && setSelectedScenicType(null)
    }

    if(product?.businessSpecification?.market === 'SOC' && val === NORMAL_VIEW_MODE && design.carType === CAR_TYPE_GLASS_BACKWALL) {
      setCarType({type:CAR_TYPE_NORMAL})
    }

    if(product?.businessSpecification?.market !== 'SOC' && !product?.wallEditor?.decorativeMirrors && val === NORMAL_VIEW_MODE && design.carType === CAR_TYPE_GLASS_BACKWALL) {
      setCarType({type:CAR_TYPE_NORMAL})
    }

    setSelectedViewMode(val)
  }

/*   const selectedViewModeSocHandler = (val) => {
    if(val === NORMAL_VIEW_MODE && design.carType === CAR_TYPE_TTC && getComponent({type:TYP_CAR_GLASS_WALL_C})) {
      setComponent({type:TYP_CAR_GLASS_WALL_C, component:null})
      setCarType({type:CAR_TYPE_NORMAL})
      setSelectedScenicType && setSelectedScenicType(null)
    }

    if(val === NORMAL_VIEW_MODE && design.carType === CAR_TYPE_GLASS_BACKWALL) {
      setCarType({type:CAR_TYPE_NORMAL})
    }

    setSelectedViewMode(val)
  } */

  const onDecoChange = (id) => {
    setSelectedMaterial(null);
    setComponent({ type: TYP_CAR_WALL_ADD_DECO_PACKAGE, component: id })
    if(getComponent({type:TYP_CAR_GLASS_WALL_C}) && scenicSelection) {
      setCarType({type:CAR_TYPE_NORMAL})
    }
    decoSelectorRef.current && decoSelectorRef.current.forceListClose() 
  }
  
  const convertGlassWallTypes = (type) => {

    // only back wall allowed to be glass
    if ( carType === CAR_TYPE_GLASS_BACKWALL && !getPositions({type:TYP_CAR_GLASS_WALL_C}) && type === TYP_CAR_WALL_C ) {
      return TYP_CAR_GLASS_WALL_C
    }
    
    // D wall is glass wall
    if( carType === CAR_TYPE_GLASS_BACKWALL
        && type === TYP_CAR_WALL_C
        && getPositions({type:TYP_CAR_GLASS_WALL_C}).includes('C') ) {
      return TYP_CAR_GLASS_WALL_C
    }
  
    // D wall is glass wall
    if( carType === CAR_TYPE_GLASS_BACKWALL
        && type === TYP_CAR_WALL_D
        && getPositions({type:TYP_CAR_GLASS_WALL_C})
        && ( getPositions({type:TYP_CAR_GLASS_WALL_C}).includes('D1') || getPositions({type:TYP_CAR_GLASS_WALL_C}).includes('D2') ) ) {
      return TYP_CAR_GLASS_WALL_C
    }
  
    // B wall is glass wall
    if( carType === CAR_TYPE_GLASS_BACKWALL
        && type === TYP_CAR_WALL_B
        && getPositions({type:TYP_CAR_GLASS_WALL_C})
        && ( getPositions({type:TYP_CAR_GLASS_WALL_C}).includes('B1') || getPositions({type:TYP_CAR_GLASS_WALL_C}).includes('B2') ) ) {
      return TYP_CAR_GLASS_WALL_C
    }
  
    // full scenic car but C wall is not glass
    if (carType === CAR_TYPE_GLASS_BACKWALL
        && type === TYP_CAR_GLASS_WALL_C
        && getPositions({type:TYP_CAR_GLASS_WALL_C})
        && !getPositions({type:TYP_CAR_GLASS_WALL_C}).includes('C') ) {
      return TYP_CAR_WALL_C
    }
  
    // ENA glass back wall
    if (carType === CAR_TYPE_GLASSMATERIAL_BACKWALL && type === TYP_CAR_WALL_C) {
      return TYP_CAR_GLASS_WALL_FRAME
    }

    return type

  }

  const onWallSelection = (type) => {
    // c wall type on the fly, if glass back wall is selected
    
    const convertedType = convertGlassWallTypes(type)
    
    sceneManager.lookAtWall(type)

    if (convertedType === selectedWall) {
      return;
    }
    
    setSelectedWall(convertedType)
    if(design?.components?.find(item=>item.componentType === convertedType)?.finishMaterial ) {
      setSelectedMaterial( (design.components.find(item => item.componentType === convertedType).finishMaterial ||null) )
    } else {
      setSelectedMaterial(null)
    }

    const wallData = product.componentsData.walls

    const isSideWall = convertedType === TYP_CAR_WALL_B || convertedType === TYP_CAR_WALL_D

    // If only one sidewall option available, paneling selector component is never rendered 
    // ==> need to set the correct paneling style here
    if (wallData.sideWallPanels?.length === 1 && isSideWall) {
      setSelectedPanelingStyle(wallData.sideWallPanels[0].id)
    } else {
      if(product?.offeringLocation === OFFERING_INDIA && convertedType === TYP_CAR_WALL_C) {
        const [panelingType, selectedPanel] = getIndiaBackWallSetup(design?.backWallPanelingType)
        if(panelingType) {
          setSelectedPanelingStyle(panelingType)
        }
      } else {
        setSelectedPanelingStyle(null) // Will be correctly set later in paneling selector component
      }
  
    }

    if(cornerPieces) {
      if(type === TYP_CAR_WALL_B) {
        setSelectedPanelingStyle(TWO_PANELS)
      }
      if(type === TYP_CAR_WALL_C) {
        setSelectedPanelingStyle(THREE_PANELS)
      }
      if(type === TYP_CAR_WALL_D) {
        setSelectedPanelingStyle(TWO_PANELS)
      }
    }

    decoSelectorRef.current && decoSelectorRef.current.forceListClose()
  }

  const onWallGroupChange = (group) => {
    setSelectedMaterial(null)
    setGroups(group)
  }

  const onMaterialChange = (id) => {
    if (selectedMaterial !== id) {
      setSelectedMaterial(id)
    }
  }
  
  const onFrameMaterialChange = (id) => {
    if (selectedFrameMaterial !== id) {
      setSelectedFrameMaterial(id)
    }
  }

  const renderHeader = (label, info) => {
    return (
      <HeadingComponent heading={label} info={info} padding="sm" border="top" />
    );
  }

  const onPanelingStyleSelection = (id) => {
    if (selectedPanelingStyle === id) return

    if((id === TWO_PANELS && !panelingException) || id === ONE_PANEL) {
      setSelectedPanel(null)
      if(selectedWall === TYP_CAR_WALL_B || selectedWall === TYP_CAR_WALL_D) {
        const bParts = (design.components.find(item=>item.componentType === TYP_CAR_WALL_B) || {}).parts
        const dParts = (design.components.find(item=>item.componentType === TYP_CAR_WALL_D) || {}).parts
        setTriColorUndo({...triColorUndo, TYP_CAR_WALL_B:bParts, TYP_CAR_WALL_D:dParts})
      } else  {
        const cParts = (design.components.find(item=>item.componentType === TYP_CAR_WALL_C) || {}).parts

        // Disable undo functionality for C wall when there is only 1 or 2 panels to choose from, as
        // all the panels will always have the same finish in that case.
        if (!(panelingException && selectedWall === TYP_CAR_WALL_C)) {
          setTriColorUndo({...triColorUndo, TYP_CAR_WALL_C:cParts})
        }
      }
    }
    
    setSelectedPanelingStyle(id)
    setWallPanelingStyle({ finishType: selectedWallFinishType, panelingStyle: id })
  }

  const toggleAllPanels = () => {
    if (getSelectedPanel() === ALL_WALL_PANELS_ID) {
      const [ leftPanelId, centerPanelId ] = getPanelTypes(selectedWallFinishType)

      if (panelingException) {
        if (selectedWall === TYP_CAR_WALL_D) {
          setSelectedPanel(FIRST_TWO_PANELS)
        } else {
          setSelectedPanel(leftPanelId)
        }
      } else {
        setSelectedPanel(centerPanelId)
      }
      
    } else {
      setWallFinish({ 
        finishType: selectedWallFinishType, 
        panelType: ALL_WALL_PANELS_ID 
      })
      setSelectedPanel(ALL_WALL_PANELS_ID)
    }
  }

  const onPanelSelection = (id) => {
    setSelectedPanel(id)

    // null the material, it will be correctly set in the
    // wall finish component.
    setSelectedMaterial(null)
  }
  
  const renderPanelingSelector = () => {
    const items = []
    
    if (panelingException) {
      items.push(
        {
          id: ONE_PANEL,
          label: getText('ui-walls-1-panel'),
          iconId: 'icon-1-panel',
          disabled: false
        },
        {
          id: TWO_PANELS_COMBINED,
          label: getText('ui-walls-2-panels'),
          iconId: 'icon-2-panels',
          disabled: false
        },
      )
    } else {
      items.push(
        {
          id: TWO_PANELS,
          label: getText('ui-walls-2-panels'),
          iconId: 'icon-2-panels',
          disabled: false
        },
        {
          id: THREE_PANELS,
          label: getText('ui-walls-3-panels'),
          iconId: 'icon-3-panels',
          disabled: false
        },
      )
    }

    // Set the correct paneling style in the ui depending on the design
    // properties: if wall panels set, select 3 panels, otherwise select 2
    // panels.
    if (!selectedPanelingStyle) {
      const panels = getAllWallPanels({ finishType: selectedWallFinishType })
      if (panels) {
        if (panelingException) {
          setSelectedPanelingStyle(TWO_PANELS_COMBINED)
        } else {
          setSelectedPanelingStyle(THREE_PANELS)
        }
      } else {
        if (panelingException) {
          setSelectedPanelingStyle(ONE_PANEL)
        } else {
          setSelectedPanelingStyle(TWO_PANELS)
        }
      }
    }


    return (
      <>
        <HeadingComponent 
          heading={getText('ui-walls-sidewall-paneling')} 
          info={getText('ui-walls-select-wall-i')} // TODO 
          padding="sm" 
          border="top" />
        <div>
        <WallItemSelector 
          items={items}
          className="paneling-style-selector"
          onSelect={onPanelingStyleSelection}
          selectedId={selectedPanelingStyle}
        />
        </div>
      </>
    )
  }

  const renderScenicWindowSelector = (wall) => {

    const glassWalls = getComponents({ type: TYP_CAR_GLASS_WALL_C })
    const glassWallId = getComponent({ type: TYP_CAR_GLASS_WALL_C })

    if(glassWalls && glassWalls.length >1) {
      return (
        <>
          { renderHeader(getText('ui-walls-scenic-window'), getText('ui-walls-scenic-window-i') ) }
          <RadioButtonGroup 
            selectionList={ glassWalls }
            selectedItem={ { id: glassWallId } }
            labelField="name"
            onChange={id => setComponent({ type:TYP_CAR_GLASS_WALL_C, component: id })}
          />
        </>
      )
    }

    return ( <></>)
  }
  
  const renderLaminateListSelector = () => {

    const laminateLists = getComponents({ type: TYP_CAR_LAMINATE_LIST }).filter(item => {
      if(product?.rules?.variousFilteringRules) {
        return jsonLogic.apply(product.rules.variousFilteringRules, {filteringRULE:'laminateListOptions', PRODUCT:product?.product, LIST:item.id})
      } else {
        return true
      }
    })
    const laminateListId = getComponent({ type: TYP_CAR_LAMINATE_LIST })
    const listConfiguration = getLaminateListsByWallFinish()
    // the laminate list is always selectable with ENA products
    const listsSelectionEnabled = product?.businessSpecification?.market === 'ENA'
        ? true
        : (listConfiguration.listTypes.length>0 && listConfiguration.listTypes.every(val => val === listConfiguration.listTypes[0])) ?false :true
        
    return (
      // <ListComponent>
      <>
        <HeadingComponent heading={getText('ui-laminate-list-color')} info={getText('ui-laminate-list-color-i')} padding="sm" border="top" />
        <GridComponent cols="5" gap="sm" className={listsSelectionEnabled ?'' :'disabled'}>
          {laminateLists.map((listItem, key) => {
            return (
              <TileComponent 
              key={key} 
              title="" 
              alt={getText(listItem.name)}
              image={listItem.image} 
              selected={listItem.id === laminateListId}
              showSapId={product?.businessSpecification?.market !== 'ENA'} 
              onClick={ id => { setComponent({ type:TYP_CAR_LAMINATE_LIST, component: listItem.id }) } } 
            />
            )
          })}
        </GridComponent>
        </>
      // </ListComponent>
    )
  }
  

  const renderPanelOrientationSelector = ( type ) => {
    const { panelOrientation } = design || {}

    // Don't render the panel orientation selection if it is not possible to change the orientation
    // (because there is only one option).
    if (
      !panelOrientation ||
      (
        getComponent({ type: TYP_CAR_WALL_ADD_DECO_PACKAGE }) && 
        getComponent({ type: TYP_CAR_WALL_ADD_DECO_PACKAGE }) !== 'DECO0'
      ) ||
      !product.componentsData.walls.panelOrientation ||
      product.componentsData.walls.panelOrientation.filter(o => !o.disabled).length < 2 ||
      !jsonLogic.apply(product.rules.panelOrientation, {
        CEILING: getComponent({type:TYP_CAR_CEILING}), 
        FINISH: getFinish({type: MAT_CAR_WALL_FINISH_C}),
        PRODUCT: product.product,
        WALL_MATERIAL: getFinishMaterial({type: selectedWallFinishType})
      } )
    ) {
      return null;
    }

    return (
      <>
        <HeadingComponent heading={getText('ui-walls-select-panel-orientation')} info={getText('ui-walls-select-panel-orientation-i')} padding="sm" border="top" />
        <div className="panelOrientation" >
          <div className={'orientationItem' + ( panelOrientation === VERTICAL ? ' selected':'' )} onClick={e => setPanelOrientation({ panelOrientation: VERTICAL })}>
            {( panelOrientation === VERTICAL)
              ?<Icon id="icon-vertical-panels-active" />
              :<Icon id="icon-vertical-panels" />}
            <div className="orientationLabel">
              {getText('ui-general-vertical')}
            </div>
          </div>
          <div className={'orientationItem' + ( panelOrientation === HORIZONTAL ? ' selected':'' )} onClick={e => setPanelOrientation({ panelOrientation: HORIZONTAL })}>
            {( panelOrientation === HORIZONTAL )
              ?<Icon id="icon-horizontal-panels-active" />
              :<Icon id="icon-horizontal-panels" />}
            <div className="orientationLabel">
              {getText('ui-general-horizontal')}
            </div>
          </div>
        </div>
        <div style={{ height:'20px' }} />
      </>
    );    
  }
  // console.log({selectedWall, pos:getPositions({type:TYP_CAR_GLASS_WALL_C})})
  // console.log({showRegularWallFinishSelector, selectedWall})
  // console.log({selectedMaterial, selectedWall, validGroups})
  // console.log({panel:getSelectedPanel(),selectedPanelingStyle })
  return (
    <div className="WallsEditor">        
      <EditorLayout heading={getText('ui-walls-heading')} >
        <ScrollBox>
{/*           { (scenicSelection && product?.businessSpecification?.market !== 'SOC') &&
            <ToggleButtons 
              content={[{value: NORMAL_VIEW_MODE, label: getText('ui-walls-car-type-tab-normal')}, {value: SCENIC_VIEW_MODE, label: getText('ui-walls-car-type-tab-scenic')}]}
              selectedButton={selectedViewMode} 
              onChange={val => selectedViewModeHandler(val)}
            />
          }
 */}
          { (scenicSelection) &&
            <>
              <HeadingComponent heading={getText('ui-layout-select-car-type')} info={getText('ui-layout-select-car-type-i')} padding="sm" border="top" />
              <RadioButtonGroup 
                selectionList={ [{id: NORMAL_VIEW_MODE, label: getText('ui-walls-car-type-tab-normal')}, {id: SCENIC_VIEW_MODE, label: getText('ui-walls-car-type-tab-scenic')}] }
                selectedItem={ { id: selectedViewMode } }
                labelField="label"
                onChange={val => selectedViewModeHandler(val)}
              />
            </>
          }

          { showDecoSelector && 
            <DecoSelector
              decoPackages={decoPackages}
              getText={getText}
              onChange={onDecoChange}
              selectedId={decoPackageId}
              ref={decoSelectorRef}
            />
          }

          { showScenicCarTypeSelector &&
            <ScenicCarTypeSelector
              selectedScenicType={selectedScenicType} 
              setSelectedScenicType={onScenicTypeSelection}
              fullScenicCar={fullScenicCar} 
            />
          }
          { showWallSelector && 
            <WallSelector
              carType={carType}
              getText={getText}
              groups={groups}
              validGroups={validGroups}
              onWallChange={onWallSelection}
              onWallGroupChange={onWallGroupChange}
              selectedWallId={selectedWall}
              showWallGroupSelector={showWallGroupSelector}
              scenicPositions={getPositions({type:TYP_CAR_GLASS_WALL_C})}
            />
          }
            
          { showPanelingSelector && renderPanelingSelector() }
          
          {/* regular wall finish selector */}
          { ( (showFinishSelector && showRegularWallFinishSelector)  ) &&
            <>
              <FinishSelector 
                onMaterialChange={onMaterialChange}
                onPanelSelection={onPanelSelection}
                selectedMaterial={selectedMaterial}
                selectedPanel={getSelectedPanel()}
                selectedPanelingStyle={selectedPanelingStyle}
                selectedWall={selectedWall}
                selectedWallFinishType={selectedWallFinishType}
                setSelectedPanel={setSelectedPanel}
                // setSelectedScenicType={setSelectedScenicType}
                showCustomMaterial={showCustomImportButton}
                showMaterialSelector={showMaterialSelector}
                panelingException={panelingException}
                toggleAllPanels={toggleAllPanels}
              />
            </>
          }

          { /* back wall finish selection when glass back wall is selected, not with separate scenic car selection */}
          { (showFinishSelector
            && ( ( selectedWall === TYP_CAR_GLASS_WALL_C && !(getComponent({type:TYP_CAR_GLASS_WALL_C}) && scenicSelection) ) || selectedWall === TYP_CAR_GLASS_WALL_FRAME)
            ) &&
          <>
            <FinishSelector 
              onMaterialChange={onMaterialChange}
              onPanelSelection={onPanelSelection}
              selectedMaterial={selectedMaterial}
              selectedPanel={getSelectedPanel()}
              selectedPanelingStyle={selectedPanelingStyle}
              selectedWall={TYP_CAR_WALL_C}
              selectedWallFinishType={MAT_CAR_WALL_FINISH_C}
              setSelectedPanel={setSelectedPanel}
              showCustomMaterial={showCustomImportButton}
              showMaterialSelector={showMaterialSelector}
              panelingException={panelingException}
              toggleAllPanels={toggleAllPanels}
            />
          </>
          }
  
          { showScenicWindowSelector && renderScenicWindowSelector(selectedWall) }

          { /* frame finish selection for glass back wall */  }
          {/* { (showFinishSelector && ( selectedWall === TYP_CAR_GLASS_WALL_C || selectedWall === TYP_CAR_GLASS_WALL_FRAME) ) && */}
          { (showFinishSelector && !showRegularWallFinishSelector && selectedViewMode === SCENIC_VIEW_MODE) &&
          <>
            {/* { ( !(getPositions({type: TYP_CAR_GLASS_WALL_C}) || []).some(pos => ['B1','B2'].includes(pos)) || !(getPositions({type: TYP_CAR_GLASS_WALL_C}) || []).some(pos => ['D1','D2'].includes(pos)) ) && */}
            { (getPositions({type: TYP_CAR_GLASS_WALL_C}) || []).length > 0 &&
              <FinishSelector 
                onMaterialChange={onMaterialChange}
                onPanelSelection={onPanelSelection}
                selectedMaterial={selectedMaterial}
                selectedPanel={getSelectedPanel()}
                selectedPanelingStyle={selectedPanelingStyle}
                selectedWall={selectedWall}
                selectedWallFinishType={MAT_CAR_WALL}
                setSelectedPanel={setSelectedPanel}
                showCustomMaterial={false}
                // setSelectedScenicType={setSelectedScenicType}
                // showCustomMaterial={showCustomImportButton}
                showMaterialSelector={showMaterialSelector}
                panelingException={panelingException}
                toggleAllPanels={toggleAllPanels}
              />
            }

            { ( getComponent({type:TYP_CAR_GLASS_WALL_C}) !== GLASS_C_FHT_HERMES && (getPositions({type: TYP_CAR_GLASS_WALL_C}) || []).length > 0 ) &&
              <FinishSelector 
                  onMaterialChange={onFrameMaterialChange}
                  onPanelSelection={onPanelSelection}
                  selectedMaterial={selectedFrameMaterial}
                  selectedPanel={getSelectedPanel()}
                  selectedPanelingStyle={selectedPanelingStyle}
                  selectedWall={selectedWall}
                  selectedWallFinishType={MAT_CAR_SKIRTING}
                  setSelectedPanel={setSelectedPanel}
                  showCustomMaterial={false}
                  showMaterialSelector={showMaterialSelector}
                  panelingException={panelingException}
                  toggleAllPanels={toggleAllPanels}
                  headerTitle="ui-walls-select-frame-finish"
                  headerInfo="ui-walls-select-frame-finish-i"
                />      
            }
            </>
          }
          
          { showPanelOrientationSelector && renderPanelOrientationSelector(selectedWall) }

          { ( product?.rules?.variousFilteringRules &&
              jsonLogic.apply(product.rules.variousFilteringRules, { filteringRULE:'laminateListSelectable', PRODUCT:product.product, MATERIAL:getFinishMaterial({type: selectedWallFinishType})} )
            ) && renderLaminateListSelector() }

          <div style={{height:'70px'}} />
        </ScrollBox>
        { showCustomImportButton && 
          <div className="action-buttons">
            <TermsOfService getText={getText}>
              <Button icon="icon-import" theme={['sm', 'outline', 'center', 'with-icon']} onClick={e => setEditView(EDIT_VIEW_CUSTOM_WALL_FINISH) } >{getText('ui-general-import')}</Button>
            </TermsOfService>
          </div>
        }
      </EditorLayout>
    </div>
  )
}
export default WallsEditor;