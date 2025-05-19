import React, { useState, useContext, useEffect, useRef, useMemo } from 'react';
import jsonLogic from 'json-logic-js';
import deepcopy from 'deepcopy'
import * as functions from './designProviderFunctions'

import { TYP_CAR_WALL_ADD_DECO_PACKAGE, TYP_CAR_CEILING, MAT_CAR_CEILING, TYP_CAR_WALL_C, MAT_CAR_WALL_FINISH_B, TYP_CAR_WALL_B,
         MAT_CAR_WALL_FINISH_C, MAT_CAR_WALL_FINISH_D, TYP_CAR_WALL_D, TYP_CAR_FRONT_WALL_A, TYP_CAR_FLOORING, MAT_CAR_FLOORING,
         MAT_CAR_FRONT_WALL_A, TYP_COP_PRODUCT_1, TYP_COP_HORIZONTAL,
         MAT_COP_FACE_PLATE_1, TYP_DOOR_A, MAT_CDO_PANEL, TYP_COP_2, CAR_TYPE_NORMAL, CAR_TYPE_GLASS_BACKWALL, 
         TYP_DOOR_C, TYP_HL_PRODUCT, TYP_LCS_PRODUCT, TYP_LDO_FRAME_FRONT,
         MAT_LDO_FRAME, TYP_LANDING_FLOOR, MAT_LANDING_FLOOR, TYP_LANDING_WALL, MAT_LANDING_WALL,
         VERTICAL, HORIZONTAL, TYP_CAR_GLASS_WALL_C, MAT_CAR_WALL, TYP_CAR_GLASS_WALL_C_PIT, GLASS_C_PIT, TYP_CAR_GLASS_WALL_C_CITY,
         GLASS_C_CITY, TYP_LANDING_CEILING, MAT_LANDING_CEILING, DEFAULT_GLASS_C_WALL, 
         ANALYTICS_OPTIONS,
         CAR_SHAPES,
         CAR_WALL_STRUCTURE_CX,
         LANDING_FINISH_GROUP,
         DEFAULT_GLASS_C_WALL_HERMES, CAR_WALL_STRUCTURE_C1, CAR_WALL_STRUCTURE_B1, CAR_WALL_STRUCTURE_BX, CAR_WALL_STRUCTURE_B2, CAR_WALL_STRUCTURE_C2,
         CAR_WALL_STRUCTURE_D1,CAR_WALL_STRUCTURE_DX, CAR_WALL_STRUCTURE_D2, CAR_TYPE_GLASSMATERIAL_BACKWALL, TYP_CAR_GLASS_WALL_FRAME, DEFAULT_GLASS_WALL_FRAME, 
         GLASS_WALL_MATERIAL, PANELING_EXCEPTION_CAR_SHAPES, CAR_SHAPE_WIDE, HORIZONTAL_PANELING_ONLY, CAR_TYPE_TTC_ENA, DECO_GLASS_MATERIAL, 
         DOOR_FINISHING_A, EXTRA_FEATURES, ERROR_TYPES, OFFERING_INDIA, TYP_HI_PRODUCT, BUTTON_COLS, BUTTON_COL_ONE, BUTTON_SHAPE, BUTTON_SHAPE_ROUND, BRAILLE, BRAILLE_OFF
        
} from '../../constants';
import { ProductContext } from '../product';
import { OfferingContext } from '../offering';
import { TranslationContext } from '../translation';
import { ToastContext } from '../toast';
import { SiteContext } from '../site';

import applyRules from './design-rules';

import { setAnalyticsForEvent } from '../../utils/analytics-utils'
import { getPanelTypes, isTrueTypeCar, getIndiaCombinedWalls } from '../../utils/design-utils';
import createPanelingUtils from './paneling-utils';
import { useRecaptcha } from '../../components/Recaptcha';
import { useErrorLogger } from '../../utils/customHooks/customHooks';

export const DesignContext = React.createContext();

/**
 * Creates design store
 * @function DesignProvider Design store
 * @param {Object} props Properties passed to the provider
 */
export const DesignProvider = ({ children, initialDesignState=null }) => {
  
  // designRef stores current design state
  const designRef = useRef(initialDesignState) 
  const { getText } = useContext(TranslationContext)
  const { editPageOpen } = useContext(SiteContext)
  const [ design, setDesignState ] = useState(designRef.current)
  const [ designImages, setDesignImages ] = useState([])

  // For Reset
  const [ initDesign, setInitDesign ] = useState(null)
  const [ initHiddenId, setInitHiddenId ] = useState(null)
  
  const { product: productStore, getFinishTypeByComponent, getDefaultComponent, getDefaultFinish, getFinishFromDesign, getComponentParts, isCustomFinish, getGroupFinishes, getMaterial, fullProductDefinition } = useContext(ProductContext)
  const offeringCtx = useContext(OfferingContext)
  const { addToast } = useContext(ToastContext)
  const logError = useErrorLogger()

  const panelingUtils = useMemo(() => {
    return createPanelingUtils({ product: productStore })
  }, [productStore])

  // Separate state for the name so it can be changed without changing the design object which
  // would trigger rebuild effects.
  const [designName, setDesignName] = useState('') 

 

  const [glassCwallToTTC,setGlassCwallToTTC] = useState({});
  const [cwallToTTC,setCwallToTTC] = useState({});
  const [cwallGlassToTTC,setCwallGlassToTTC] = useState({});
  const [decoToTTC,setDecoToTTC] = useState({});
  const undoStateRef = useRef(null)


  // Car doors defaults
  const [defaultDoorSolution, setDefaultDoorSolution] = useState("1C")
  const [defaultDoorFrames, setDefaultDoorFrames] = useState("5FRAME")

  // Signalization defaults
  const [defaultCopPosition, setDefaultCopPosition] = useState('BX')

  // Landing view defaults
  const [defaultLandingFloor, setDefaultLandingFloor] = useState('LANDING_FLOOR_1')
  const [defaultLandingWall, setDefaultLandingWall] = useState('LANDING_WALL_1')
  const [defaultLandingCeiling, setDefaultLandingCeiling] = useState('LANDING_CEILING_1')
  
  // States related to share functionality.
  const [edited, setEdited] = useState(false) // has the design been edited?
  const [hiddenId, setHiddenId] = useState('') // id for accessing designs in the database

  const [cornerPieces, setCornerPieces] = useState(false) // has the design been edited?

  // For keeping track from which shared design a new design is created.
  // Used for example linking shared Indian designs to the original design (for expiration and other data)
  const originalDesignIdRef = useRef() // ref instead of useState because nothing needs to rerender when the value changes
  const originalDesignId = originalDesignIdRef.current 
  const setOriginalDesignId = val => {
    originalDesignIdRef.current = val
  }

  const [carTypeInitialized, setCarTypeInitialized] = useState(false)

  const setDesign = (designState, options = {}) => {

    try {
      // If there is a full product definition stored in memory (for KTOC links), use that in the rules
      // so items that are disabled in the admin tool won't be automatically turned off when design is edited.
      const productToUse = fullProductDefinition.current || productStore
      const designToSet = applyRules(designState, productToUse, {...options, addToast, getText, cornerPieces, setCornerPieces, onEditPage:editPageOpen()})
      designRef.current = designToSet
      setDesignState(designToSet)
      setDefaultValuesForEditedDesign(options)
      
      if (window.debugComponent) {
        const component = designToSet.components?.find(x => x.componentType === window.debugComponent)
        
        if (component) {
          console.log('>>> component', component)
        }
      }
      
      return designToSet
     
    } catch (err) {
      const message = getText('ui-error-message-rule-error') 
      addToast({ message, type: 'error' })
      // TODO log to table

      logError({
        message: 'rules-error',
        severity: ERROR_TYPES.ERROR,
        stackTrace: err.stack,
      })

      console.error('Error in Rules:')
      console.trace(err)
      return design
    }
  }

  function setDefaultValuesForEditedDesign(options = {}) {
    const { isEdited = true } = options
    setDesignImages([])
    setHiddenId('') // New hidden id is generated for edited designs.
    setEdited(isEdited)
  }

  // When setting some values for an already saved design on the design specification page, e.g. extending expiration time or enabling editing
  // Just setting the property while avoiding running rules or other logic
  // that comes with the normal setDesign function.
  function setDesignProperty(property, value) {
    if (!design) return

    setDesignState(prev => ({
      ...prev,
      [property]: value
    }))

    if (initDesign) {
      // Resetting needs to reset to this new design state because it is the one that should be in the DB as well
      setInitDesign(prev => ({
        ...prev,
        [property]: value
      }))
    }
  }

  useEffect(() => {
    // TODO Defaults out of the state and into functions
    if(productStore && productStore.componentsData) {
      const data = productStore.componentsData      
      
      if (data.doors) {
        const solutions = data.doors.solutions.filter(solution => !solution.disabled)
        setDefaultDoorSolution(solutions[0].id)
        
        const frames = data.doors.frames.filter(frame => !frame.disabled)
        setDefaultDoorFrames(frames[0].id)
      }

      if (data.signalization) {
        const copPositions = data.signalization.copPositions
          .filter(pos => !pos.disabled)
          .map(pos => pos.id)

        // Set right center as default if allowed, 
        // otherwise left center if allowed, 
        // otherwise first that is allowed
        const posToSet = copPositions.includes('BX') ? 'BX' 
          : copPositions.includes('DX') ? 'DX' 
          : copPositions[0]
        setDefaultCopPosition(posToSet)
      }

      if (data.landing) {
        // Some more dummy code for demo like below. 
        // TODO fix when there is actual logic for wall/floor combinations.
        const number = data.landing.landingColor.filter(c => !c.disabled)[0].id.slice(-1)
        setDefaultLandingFloor(`LANDING_FLOOR_${number}`)
        setDefaultLandingWall(`LANDING_WALL_${number}`)
        setDefaultLandingCeiling(`LANDING_CEILING_${number}`)
      }
    }
  }, [productStore])

  // Loading the correct car type after the design has been set.
  // REASON: The cartype in the 3d model does not seem to respect the
  // cartype set in the design state, and single entrance cartype is
  // loaded by default everytime (even if disabled for the frontline)
  // --> forcefully load the correct cartype on init.
  useEffect(() => {
    // Only run this effect one time on initial page load.
    if (carTypeInitialized || !design) return
    setCarTypeInitialized(true)
    setCarType({ type: designRef.current.carType })

    return () => {
      setCarTypeInitialized(false)
    }
  }, [design])

  const setRegulations = (regulation) => {
    if(!designRef.current.regulations) {
      setAnalyticsForEvent({
        eventName: 'Option Change',
        eventData:{
          section: 'Layout',
          name: 'accessibilityPack',
          value: regulation
        }
      })

      setDesign({
        ...design,
        regulations:[regulation]
      })
      return;
    }
    let newRegulations = designRef.current.regulations;
    let foundIndex = newRegulations.indexOf(regulation);
    if(foundIndex === -1) {
      setAnalyticsForEvent({
        eventName: 'Option Change',
        eventData:{
          section: 'Layout',
          name: 'accessibilityPack',
          value: regulation
        }
      })

      setDesign({
        ...design,
        regulations:[...newRegulations,regulation]
      })
    } else {
      setAnalyticsForEvent({
        eventName: 'Option Change',
        eventData:{
          section: 'Layout',
          name: 'accessibilityPack',
          value: 'None'
        }
      })

      newRegulations.splice(foundIndex,1);
      setDesign({
        ...design,
        regulations:[...newRegulations]
      })
    }
  };

  const setExtraFeatures = (feature) => {

    if(!feature || !designRef?.current) { return }

    if(!designRef.current.extraFeatures) {
      setAnalyticsForEvent({
        eventName: 'Option Change',
        eventData:{
          section: 'Layout',
          name: 'emergencyCommunications',
          value: feature
        }
      })

      setDesign({
        ...design,
        extraFeatures:[feature]
      })
      return;
    }
    let newFeatures = designRef.current.extraFeatures;
    let foundIndex = newFeatures.indexOf(feature);
    if(foundIndex === -1) {
      setAnalyticsForEvent({
        eventName: 'Option Change',
        eventData:{
          section: 'Layout',
          name: 'emergencyCommunications',
          value: feature
        }
      })

      setDesign({
        ...design,
        extraFeatures:[...newFeatures,feature]
      })
    } else {
      setAnalyticsForEvent({
        eventName: 'Option Change',
        eventData:{
          section: 'Layout',
          name: 'emergencyCommunications',
          value: 'None'
        }
      })

      newFeatures.splice(foundIndex,1);
      setDesign({
        ...design,
        extraFeatures:[...newFeatures]
      })
    }    
  }

  const setCarShape = ({shape}) => {
    setAnalyticsForEvent({
      eventName: 'Option Change',
      eventData: {
        section: 'Layout',
        name: 'Car Shape',
        value: shape
      }
    })

    let isCustomShape = false
    let finalShape = shape
    let customDesignDimensions = {}
    if(shape.includes('custom')) {
      isCustomShape = true
      finalShape = shape.replace('_custom','')
      customDesignDimensions = {width: productStore?.customCarShape?.width, depth: productStore?.customCarShape?.depth, unit: productStore?.customCarShape?.unit}
    } else {
      const shapeInfo = CAR_SHAPES.find(item => item.id === shape) || {}
      customDesignDimensions = {width: shapeInfo.displayWidth, depth: shapeInfo.displayDepth, unit: shapeInfo.displayUnit}
    }

    handlePanelingException(designRef.current, finalShape)

    setDesign({
      ...designRef.current,
      carShape:finalShape,
      isCustomShape,
      customDesignDimensions,
    })
    // for performance testing purposes
    // window.testString=shape;
  }

  const setPanelOrientation = ({panelOrientation}) => {
    setAnalyticsForEvent({
      eventName: 'Option Change',
      eventData:{
        section: 'Walls',
        name: 'Panel Orientation',
        value: panelOrientation
      }
    })

    setDesign({
      ...design,
      panelOrientation
    })
  }

  const setCarType = ({type, finish=null, custom=null, finishMaterial=null, glassType=DEFAULT_GLASS_C_WALL}) => {

    if(!type || !design || !designRef.current.components) {
      return;
    }

    // console.log({type, finish, custom, finishMaterial, glassType})

    // is the car type currently TTC
    const isTTC = designRef.current.components.find(item => item.componentType === TYP_DOOR_C) !== undefined
    // is the car type currently normal car, no windows at all
    const isSingleEntrance = ( designRef.current.components.find(item => item.componentType === TYP_CAR_WALL_C) !== undefined
                                && designRef.current.components.find(item => item.componentType === TYP_CAR_GLASS_WALL_FRAME) === undefined
                                && !getPositions({type:TYP_CAR_GLASS_WALL_C})
                                )
    // is the car type scenic car
    const hasGlassBackWall = designRef.current.components.find(item => item.componentType === TYP_CAR_GLASS_WALL_C) !== undefined
    // is the car with glass material back wall (ENA)
    const hasGlassmaterialBackWall = designRef.current.components.find(item => item.componentType === TYP_CAR_GLASS_WALL_FRAME) !== undefined

    if ( isTrueTypeCar( type ) && isTTC && designRef.current.carType === type) {
      return
    }
    if (type === CAR_TYPE_NORMAL && isSingleEntrance) {
      return
    }
    if (type === CAR_TYPE_GLASS_BACKWALL && hasGlassBackWall) {
      return
    }
    if (type === CAR_TYPE_GLASSMATERIAL_BACKWALL && hasGlassmaterialBackWall) {
      return
    }

    setAnalyticsForEvent({
      eventName: 'Option Change',
      eventData:{
        section: 'Layout',
        name: 'Car Type',
        value: type
      }
    })

    // Switching away from normal car
    if(isSingleEntrance) {
      const oldCWall = designRef.current.components.find(item => (item || {}).componentType===TYP_CAR_WALL_C);
      setCwallToTTC({...oldCWall});
      if(type !== CAR_TYPE_GLASS_BACKWALL && type !== CAR_TYPE_GLASSMATERIAL_BACKWALL) {
        const oldDeco = designRef.current.components.find(item => (item || {}).componentType===TYP_CAR_WALL_ADD_DECO_PACKAGE);
        setDecoToTTC({...oldDeco});
      }
    }

    // Switching away from scenic car
    if(hasGlassBackWall) {
      const oldGlassCWall = designRef.current.components.find(item => (item || {}).componentType===TYP_CAR_GLASS_WALL_C);
      setGlassCwallToTTC({...oldGlassCWall}); // scenic setup
    }

    // Switching away from glass material back wall
    if(hasGlassmaterialBackWall) {
      const oldGlassCWall = designRef.current.components.find(item => (item || {}).componentType===TYP_CAR_GLASS_WALL_FRAME);
      const oldCWall = designRef.current.components.find(item => (item || {}).componentType===TYP_CAR_WALL_C);
      setGlassCwallToTTC({...oldGlassCWall}); // glass material back wall frame
      setCwallGlassToTTC({...oldCWall}); // glass material back wall finish
    }

    let component;
    let componentCwall;
    let componentPit;
    let componentCity;
    let deco;
    const newComponents = []
    let finalType = type
    let cDoor

    // switching to TTC
    if( isTrueTypeCar( type )) {
      cDoor = getComponent({type:TYP_DOOR_A})
      if(type === CAR_TYPE_TTC_ENA && ['0L','0R','2L','2R'].indexOf(cDoor) !== -1) {
        if (cDoor === '0L') {
          cDoor = '0R';
        }  else if(cDoor === '0R') {
          cDoor = '0L'
        }  else if(cDoor === '2L') {
          cDoor = '2R'
        } else {
          cDoor = '2L'
        }
      }

      if(!isTTC) {
        component = {
          componentType: TYP_DOOR_C,
          component: cDoor,
          finishType: MAT_CDO_PANEL,
          finish: getFinish({type:MAT_CDO_PANEL})
        }
      }

      // switching to normal car (single entrance)
    } else if(type === CAR_TYPE_NORMAL) {
      let addDecoAlso = true

      // switching from TTC to normal car
      if(Object.keys(cwallToTTC).length >0 && isTTC) {
        component = cwallToTTC;
        setCwallToTTC({});

      // switching from TTC to glass material back wall car
      } else if(Object.keys(cwallGlassToTTC).length >0 && isTTC) {
          componentCwall = cwallGlassToTTC;
          setCwallGlassToTTC({});
          component = glassCwallToTTC;
          setGlassCwallToTTC({});
          finalType = CAR_TYPE_GLASSMATERIAL_BACKWALL
          addDecoAlso = false

      // switching from TTC to scenic car
      } else if(Object.keys(glassCwallToTTC).length >0 && isTTC) {
        component = glassCwallToTTC;
        setGlassCwallToTTC({});
        componentPit = {
          componentType: TYP_CAR_GLASS_WALL_C_PIT,
          component: GLASS_C_PIT
        }
        componentCity = {
          componentType: TYP_CAR_GLASS_WALL_C_CITY,
          component: GLASS_C_CITY
        }
        finalType = CAR_TYPE_GLASS_BACKWALL
        addDecoAlso = false

      // switching from glass material back wall or scenic car to normal car
      } else {
        setCwallGlassToTTC({});
        setGlassCwallToTTC({});

        if(hasGlassmaterialBackWall) {
          designRef.current.components = designRef.current.components.map( item => {
            if(item.componentType !== TYP_CAR_WALL_C) {
              return item
            }
            return {
              ...item,
              finish,
              finishMaterial,
              custom
            }
          })

        } else if(designRef.current.components.find(item => (item || {}).componentType===TYP_CAR_WALL_C)) {
          component = null

        } else {
          component = {
            componentType: TYP_CAR_WALL_C,
            component: "WALLC",
            finishType: MAT_CAR_WALL_FINISH_C,
            finish,
            finishMaterial,
            custom
          }
        }
      }

      if(Object.keys(decoToTTC).length >0) {
        deco = decoToTTC;
        setDecoToTTC({});
      
      } else {
        if(productStore.businessSpecification.market === 'EMEA' && addDecoAlso) {
          const finishDefinition = productStore.finishes.find(item => item.id === finish)
          if( finishDefinition && finishDefinition.materials && finishDefinition.materials.indexOf('DECOGLASS') !== -1) {
            deco = {component: "DECO1", componentType: TYP_CAR_WALL_ADD_DECO_PACKAGE}
          } else {
            deco = {component: "DECO0", componentType: TYP_CAR_WALL_ADD_DECO_PACKAGE}
          }
        }
      }

    // switching to glass material back wall
    } else if(type === CAR_TYPE_GLASSMATERIAL_BACKWALL) {
      setCwallToTTC({});

      const frameFinish = hasGlassBackWall ?( designRef.current.components.find(item => item.componentType === TYP_CAR_GLASS_WALL_C) || {}).finish :(getDefaultFinish({type:MAT_CAR_WALL}) || {}).id
      component = {
        componentType: TYP_CAR_GLASS_WALL_FRAME,
        component: DEFAULT_GLASS_WALL_FRAME,
        finishType: MAT_CAR_WALL,
        finish: frameFinish
      }

      if(isSingleEntrance) {
        designRef.current.components = designRef.current.components.map( item => {
          if(item.componentType !== TYP_CAR_WALL_C) {
            return item
          }
          return {
            ...item,
            finish,
            finishMaterial,
            custom
          }
        })

      } else {
        componentCwall = {
          componentType: TYP_CAR_WALL_C,
          component: "WALLC",
          finishType: MAT_CAR_WALL_FINISH_C,
          finish,
          finishMaterial,
          custom
        }
      }

    // switching to scenic car
    } else {
      setCwallToTTC({});
      setCwallGlassToTTC({});

      componentPit = {
        componentType: TYP_CAR_GLASS_WALL_C_PIT,
        component: GLASS_C_PIT
      }
      componentCity = {
        componentType: TYP_CAR_GLASS_WALL_C_CITY,
        component: GLASS_C_CITY
      }

      // Setting the default glass C wall (in case the initial default has been disabled.)
      let defaultGlassCWall
      if (productStore && productStore.componentsData) {
        const scenicWindowData = productStore.componentsData.walls.scenicWindowTypes
        // Get the default scenic window data from.
        const defaultInData = scenicWindowData.find(x => (x.id === DEFAULT_GLASS_C_WALL_HERMES || x.id === glassType) )
        
        // If the default has been disabled, choose the first non-disabled one from the list as the default.
        if (!defaultInData || defaultInData.disabled) {
          defaultGlassCWall = scenicWindowData.find(x => !x.disabled).id
        } else {
          defaultGlassCWall = defaultInData.id
        }
      }

      // Default to the initial default if no other option was set.
      if (!defaultGlassCWall) {
        defaultGlassCWall = glassType
      }

      const frameFinish = hasGlassmaterialBackWall ?( designRef.current.components.find(item => item.componentType === TYP_CAR_GLASS_WALL_FRAME) || {}).finish :(getDefaultFinish({type:MAT_CAR_WALL}) || {}).id

      component = {
        componentType: TYP_CAR_GLASS_WALL_C,
        component: defaultGlassCWall,
        finishType: MAT_CAR_WALL,
        finish: frameFinish
      }
    }

    if(component && !( isTrueTypeCar(type) && isTTC)) {
      newComponents.push(component);
    }

    if(componentCwall) { 
      newComponents.push(componentCwall);
    }
    if(componentPit) { 
      newComponents.push(componentPit);
    }
    if(componentCity) { 
      newComponents.push(componentCity);
    }
    (deco !== undefined) && newComponents.push(deco);

    if( isTrueTypeCar(type) && isTTC) {
      designRef.current.components = designRef.current.components.map(item => {
        if( item.componentType === TYP_DOOR_C) {
          return {
            ...item,
            component:cDoor
          }
        }
        return item
      })
    }
    
    setDesign({
      ...designRef.current,
      carType:finalType,
      components: [
        ...designRef.current.components.filter((item, componentIndex) => {
            if( isTrueTypeCar( type ) ) return ( (item || {}).componentType !== TYP_CAR_GLASS_WALL_FRAME && (item || {}).componentType !== TYP_CAR_WALL_C && (item || {}).componentType !== TYP_CAR_WALL_ADD_DECO_PACKAGE && (item || {}).componentType !== TYP_CAR_GLASS_WALL_C && (item || {}).componentType !== TYP_CAR_GLASS_WALL_C_CITY && (item || {}).componentType !== TYP_CAR_GLASS_WALL_C_PIT)
            if(type === CAR_TYPE_GLASS_BACKWALL) return ( (item || {}).componentType !== TYP_CAR_GLASS_WALL_FRAME && (item || {}).componentType !== TYP_CAR_WALL_C && (item || {}).componentType !== TYP_CAR_WALL_ADD_DECO_PACKAGE && (item || {}).componentType !== TYP_DOOR_C)
            if(type === CAR_TYPE_GLASSMATERIAL_BACKWALL) return ( (item || {}).componentType !== TYP_CAR_GLASS_WALL_C && (item || {}).componentType !== TYP_DOOR_C  && (item || {}).componentType !== TYP_CAR_GLASS_WALL_C_CITY && (item || {}).componentType !== TYP_CAR_GLASS_WALL_C_PIT)
            if(type === CAR_TYPE_NORMAL) return ( (item || {}).componentType !== TYP_CAR_GLASS_WALL_FRAME && (item || {}).componentType !== TYP_CAR_GLASS_WALL_C && (item || {}).componentType !== TYP_DOOR_C  && (item || {}).componentType !== TYP_CAR_GLASS_WALL_C_CITY && (item || {}).componentType !== TYP_CAR_GLASS_WALL_C_PIT)
            return true
          }),
        ...newComponents
      ]

    })

    // for performance testing purposes
    window.testString=type;

  }

  const getFinish = ({ type }) => {
    if (!type || !design || !designRef.current.components) {
      return undefined
    }
    if (type === MAT_CAR_WALL_FINISH_C && designRef.current.carType === CAR_TYPE_GLASS_BACKWALL && !getPositions({type:TYP_CAR_GLASS_WALL_C})) {
      return 'TW1'
    }
    const component = designRef.current.components.find(({ finishType }) => {
      if( Array.isArray(type) ) {
        return type.indexOf(finishType) !== -1
      } else {
        return finishType === type
      }
    })

    if (!component) {
      return undefined
    }
    return component.finish
  }

  const getPartFinish = ({ type }) => {

    if (!type || !design || !designRef.current.components || !Array.isArray(designRef.current.components)) {
      return undefined
    }
    
    let partFinish = undefined

    for (const component of designRef.current.components) {
      const { parts } = component
      if (!parts || !Array.isArray(parts) || !parts.length) {
        continue
      }
      const part = parts.find(part => part.type === type)
      if (part) {
        partFinish = part.finish
        break
      }
    }

    return partFinish
  }

  const getFinishMaterial = ({ type }) => {
    if (!type || !design || !designRef.current.components) {
      return undefined
    }

    if (type === MAT_CAR_WALL_FINISH_C && designRef.current.carType === CAR_TYPE_GLASS_BACKWALL) {
      return 'GLASS'
    }

    const component = designRef.current.components.find(({ finishType }) => {
      if( Array.isArray(type) ) {
        return type.indexOf(finishType)
      } else {
        return finishType === type
      }
    })

    if (!component || !component.finishMaterial) {
      return undefined
    }
    return component.finishMaterial
  }

  const setFinishMaterial = ({ type, finishMaterial }) => {
    if (!type || !finishMaterial || !design || !designRef.current.components) {
      return undefined
    }

    setDesign({
      ...designRef.current,
      components: designRef.current.components.map(item => {
        if ( item.finishType === type ) {

          if(finishMaterial) {
            return {
              ...item,
              finishMaterial
            }

          } else {
            return {
              ...item,
            }
          }
        }
        return item
      })
    })
  }

  const getDesignItem = ({ type }) => {
    if (!type || !design || !designRef.current.components) {
      return undefined
    }
    const component = designRef.current.components.find(({ componentType }) => componentType === type)
    if (!component) {
      return undefined
    }

    return component    
  } 

  const getComponent = ({ type, justId = true }) => {
    if (!type || !design || !designRef.current.components) {
      return undefined
    }
    const component = designRef.current.components.find(({ componentType }) => componentType === type)
    if (!component) {
      return undefined
    }

    if (justId) {
      return component.component    
    }

    return component
  } 

  const getComponentFinishType = ({ type }) => {
    if (!type || !design || !designRef.current.components) {
      return undefined
    }
    const component = designRef.current.components.find(({ componentType }) => componentType === type)
    if (!component) {
      return undefined
    }

    return component.finishType    
  } 

  const getComponentFinish = ({ type }) => {
    if (!type || !design || !designRef.current.components) {
      return undefined
    }
    const component = designRef.current.components.find(({ componentType }) => componentType === type)
    if (!component) {
      return undefined
    }

    return component.finish    
  } 

  const setComponentFinish = ({ type, finish, finishType=null }) => {
    if (!type || !finish || !design || !designRef.current.components) {
      return undefined
    }
    setDesign({
      ...design,
      components: designRef.current.components.map(item => {
        if ( item.componentType === type ) {

          if(finishType) {
            return {
              ...item,
              finishType,
              finish
            }

          } else {
            return {
              ...item,
              finish
            }
          }
        }
        return item
      })
    })
  } 

  const addComponent = (component) => {
    setDesign({
      ...design,
      components: [
        ...designRef.current.components,
        component
      ]
    })
  }

  const removeComponent = (index) => {
    setDesign({
      ...design,
      components: [
        ...designRef.current.components.filter((item, componentIndex) => componentIndex !== index)
      ]
    })
  }

  const updateComponent = (component, index) => {
    setDesign({
      ...design,
      components: designRef.current.components.map((item, componentIndex) => {
        return (componentIndex === index) ? component : item
      })
    })
  }

  const setEmptyCeiling = (index) => {
    updateComponent({
      component: 'ceiling-none',
      componentType: TYP_CAR_CEILING,
      finishType: MAT_CAR_CEILING
    }, index)
  }

  const setComponent = ({ type, component, positions = null }) => {
    console.log('change component ', type , ' comop ', component)
    const index = designRef.current.components.findIndex(item => item.componentType === type)
    if (index === -1 && !component) {
      return
    } else if (index !== -1 && component === undefined) {
      return
    } else if (index !== -1 && component === null) {
      removeComponent(index)
    } else if (index !== -1) {

      if (type === TYP_CAR_CEILING && component === 'ceiling-none') {
        setEmptyCeiling(index)
        return
      }

      // get sub components
      const parts = getComponentParts({ id: component }).map( part => {


        return {
          type: part.type, // finishType: part.finishType
          componentType: part.type, // TODO...
          // componentType: part.finishType
          finish: (getDefaultFinish({ type: part.type }) || {}).id
         
        }
      })

      
      updateComponent({
        ...designRef.current.components[index],
        component,
        parts,
      }, index)

    } else {

      const finishType = getFinishTypeByComponent(component)
      const finish = finishType && getDefaultFinish({ type: finishType })
      const parts = getComponentParts({ id: component }).map( part => {
        return {
          type: part.type,
          componentType: part.type,
          finish: (getDefaultFinish({ type: part.type }) || {}).id
        }
      })
      
      // console.log({type,component, positions,finishType, finish, parts})
      addComponent({
        componentType: type,
        component,
        finishType,
        finish: finish && finish.id,
        positions,
        parts
      })
    }

    const analyticsItem = ANALYTICS_OPTIONS[type] || {name:'Unknown',section:'Unknown'}
    setAnalyticsForEvent({
      eventName: 'Option Change',
      eventData:{
        section: analyticsItem.section,
        name: analyticsItem.name,
        value: component || 'None'
      }
    })

    // for performance testing purposes
    if(type.indexOf('DECO') === -1) {
      window.testString=component;
    }

  }

  const addSecondCOP = () =>{
    if (!design || !designRef.current.components) {
      return undefined
    }

    const firstCOP = designRef.current.components.find( item => item.componentType === TYP_COP_PRODUCT_1);
    const finishType = (firstCOP || {}).finishType;
    const finish = getFinish({type:finishType})

    const secondCOPIndex = designRef.current.components.findIndex( item => item.componentType === TYP_COP_2);

    if(secondCOPIndex===-1) {
      addComponent({
        componentType: TYP_COP_2,
        component: getComponent({type:TYP_COP_PRODUCT_1}),
        finishType,
        finish
      })
    } else {
      
      const parts = getComponentParts({ id: getComponent({type:TYP_COP_PRODUCT_1}) }).map( part => {
        return {
          type: part.type,
          finish: (getDefaultFinish({ type: part.type }) || {}).id
        }
      })
      updateComponent({
        ...designRef.current.components[secondCOPIndex],
        component:getComponent({type:TYP_COP_PRODUCT_1}),
        parts,
        finish
      }, secondCOPIndex)

    }

    const analyticsItem = ANALYTICS_OPTIONS[TYP_COP_2] || {name:'Unknown',section:'Unknown'}
    setAnalyticsForEvent({
      eventName: 'Option Change',
      eventData:{
        section: analyticsItem.section,
        name: analyticsItem.name,
        value: getComponent({type:TYP_COP_PRODUCT_1})
      }
    })

  }

  const addHorizontalCop = (horcopId) => {

    if (!design || !designRef.current.components || !productStore || !productStore.components) {
      return undefined
    }

    const cop1 = designRef.current.components.find(item => item.componentType === TYP_COP_PRODUCT_1) || {}
    const cop2 = designRef.current.components.find(item => item.componentType === TYP_COP_2) || {}
    const cop2IsHorizontal = ( jsonLogic.apply(productStore.rules.signalizationHorizontal, {COP2:cop2.component} ))[1]

    const cop1Component = productStore.components.find(item => item.id === cop1.component) || {}
    const shape = CAR_SHAPES.find(item => item.id === design.carShape) || {}
    const horCopPosition = (getPositions({type:TYP_COP_HORIZONTAL}) || []).join('') || 'BX'
        
    const test = {
      MARKET:(productStore.businessSpecification.market || '') ,
      COP1_FAMILY:cop1Component.componentFamily,
      COP1_POS:(cop1.positions || []).join(''),
      COP2: (cop2.component || 'none'),
      COP2_POS: (!cop2IsHorizontal ?(cop2.positions || ['none']).join('') :'none'),
      DEPTH: shape.depth,
      CAR_TYPE: designRef.current.carType,
      POSITION: horCopPosition,
      SCENIC_POS: getPositions(TYP_CAR_GLASS_WALL_C) || [],
    }

    // console.log('adding horcop:',{test})
    let determineHorCop = []
    if(productStore?.rules?.signalizationHorizontal) {
      const results = jsonLogic.apply(productStore.rules.signalizationHorizontal, test )
      determineHorCop = results[2]
    }

    if(!horcopId) {
      setComponent({type:TYP_COP_HORIZONTAL, component:null})
      return
    } 


      setComponent({type:TYP_COP_HORIZONTAL, component:horcopId, positions:[determineHorCop[1]]})

  }

  const getPositions = ({ type }) => {
    const component = designRef.current.components.find(item => item.componentType === type)
    if (component && component.positions) {
      return [
        ...component.positions
      ]
    }
    return undefined
  }


  const setPositions = ({ type, positions }) => {
    const index = designRef.current.components.findIndex(item => item.componentType === type)
    
    if (index !== -1) {
      updateComponent({
        ...designRef.current.components[index],
        positions
      }, index)
    }    
  } 

  const setDefaultComponent = ({ type, positions=null }) => {
    const component = getDefaultComponent({ type })
    if (component && component.id) {
      setComponent({ type, component: component.id, positions })
    }
  }

  const hasIdenticalPanels = ({ wallType }) => {
    const wallComponent = design.components.find(x => x.componentType === wallType)
    
    if (!wallComponent || !wallComponent.parts) {
      return false
    }

    let result = true

    let panelFinish

    wallComponent.parts.forEach(panel => {
      if (!result) return

      if (panelFinish) {
        result = panelFinish === panel.finish
      } else {
        panelFinish = panel.finish
      }
    })
    
    return result
  }

  const setWallPanelingStyle = ({ finishType, panelingStyle }) => {
    panelingUtils.setWallPanelingStyle({ design, finishType, panelingStyle })
    setDesign(design)
  }

  /**
   * @param {Object} options
   * @param {string} options.finishType - finishType of the wall component
   * @param {string} options.panelType - Panel to set
   * @param {string} options.finish - finish id to set
   * @param {boolean=} options.custom - Custom finish?
   */
  const setWallPanelFinish = (options) => {
    const newDesign = functions.setWallPanelFinish(designRef.current, options)
    setDesign(newDesign)
  }

  const getAllWallPanels = ({ finishType }) => {
    return panelingUtils.getAllWallPanels({ design:designRef.current, finishType })
  }

  const hasThreePanelsOnSideWall = () => {
    return panelingUtils.hasThreePanelsOnSideWall({ design:designRef.current })
  }

  const getWallPanel = ({ finishType, panelType }) => {
    const parts = getAllWallPanels({ finishType })

    if (parts) {
      return parts.find(x => x.type === panelType)
    }
  }

  const clearWallPanels = ({ finishType }) => {
    panelingUtils.clearWallPanels({ design, finishType })
    
    setDesign(design)
  }

  const setWallFinish = ({ finishType, finish, finishMaterial=null, panelType, custom }) => {

    // console.log('SetWallFinish:',finishType, ' -- ', finish, ' -- ',finishMaterial)
    // console.log({ finishType, finishMaterial, finish, panelType, custom })
    const isGlassFinish = ( (( (productStore.finishes || []).find(item => item.id === finish) || {}).materials || []).indexOf(GLASS_WALL_MATERIAL) !== -1 )

    if(finishType === MAT_CAR_WALL_FINISH_C && isGlassFinish && finish === 'TW1') {
      if(designRef.current.carType !== CAR_TYPE_GLASS_BACKWALL) {
        clearWallPanels({ finishType: MAT_CAR_WALL })
        setCarType({type:CAR_TYPE_GLASS_BACKWALL, finishMaterial})
      }
      return
    }

    if(finishType === MAT_CAR_WALL_FINISH_C && isGlassFinish && finish !== 'TW1') {
      if(designRef.current.carType !== CAR_TYPE_GLASSMATERIAL_BACKWALL) {
        setCarType({type:CAR_TYPE_GLASSMATERIAL_BACKWALL, finish, finishMaterial, custom})
      } else {
        setFinish({ type: finishType, finish, custom, finishMaterial })
      }
      return
    }

    if( (designRef.current.carType === CAR_TYPE_GLASS_BACKWALL || designRef.current.carType ===CAR_TYPE_GLASSMATERIAL_BACKWALL)
        && finishType === MAT_CAR_WALL_FINISH_C
        && !isGlassFinish
        && !getPositions({type:TYP_CAR_GLASS_WALL_C})) {
      setCarType({type:CAR_TYPE_NORMAL, finish, finishMaterial, custom})
      return
    }

    if(productStore.offeringLocation === OFFERING_INDIA) {
      const combinedWalls = getIndiaCombinedWalls( designRef.current.backWallPanelingType, designRef.current.originalSapId, finishType )
      // console.log({combinedWalls})
      if(combinedWalls) {
        if(typeof combinedWalls?.wall === 'string') {
          setFinish({ type: combinedWalls?.wall, finish, custom, finishMaterial })
        } else {
          combinedWalls.wall.forEach(wall => {
            setFinish({ type: wall, finish, custom, finishMaterial })
          })
        }
        if(combinedWalls?.panelWall) {
          setWallPanelFinish({ finishType: combinedWalls?.panelWall, finish, panelType:combinedWalls.paneling, custom, finishMaterial })
        }
        return
      }
    }

    if (!panelType) {
      setFinish({ type: finishType, finish, custom, finishMaterial })
    } else {
      setWallPanelFinish({ finishType, finish, panelType, custom, finishMaterial })
    }
    
    if(productStore?.rules?.variousFilteringRules &&
      jsonLogic.apply(productStore.rules.variousFilteringRules, { filteringRULE:'aWallByOtherWalls', PRODUCT: productStore.product, MATERIAL: getFinishMaterial({type:MAT_CAR_WALL_FINISH_B}) }) )
    {
      setFinish({ type: MAT_CAR_FRONT_WALL_A, finish, custom, finishMaterial })
    }

  }

  const verifyAndChangeAllWalls = ({ finishType, finish, custom, finishMaterial}) => {

    let popUpToaster=false

    const checkBWall = jsonLogic.apply(productStore.rules.variousFilteringRules, {
      filteringRULE: 'mixingLimited',
      PRODUCT: productStore.product,
      FINISH: getFinish({type:MAT_CAR_WALL_FINISH_B}),      
      OLDFINISH: finish,
      WALL:MAT_CAR_WALL_FINISH_B,
      TARGET: 'inside',
    })
    if(checkBWall && !finishType.includes( MAT_CAR_WALL_FINISH_B) && finish !== getFinish({type:MAT_CAR_WALL_FINISH_B}) ) {
      setFinish({type:MAT_CAR_WALL_FINISH_B, finish, custom, finishMaterial})
      popUpToaster = true
    }

    const checkCWall = jsonLogic.apply(productStore.rules.variousFilteringRules, {
      filteringRULE: 'mixingLimited',
      PRODUCT: productStore.product,
      FINISH: getFinish({type:MAT_CAR_WALL_FINISH_C}),
      OLDFINISH: finish,
      WALL:MAT_CAR_WALL_FINISH_C,
      TARGET: 'inside',
    })
    if(checkCWall && !finishType.includes( MAT_CAR_WALL_FINISH_C) && finish !== getFinish({type:MAT_CAR_WALL_FINISH_C}) ) {
      setFinish({type:MAT_CAR_WALL_FINISH_C, finish, custom, finishMaterial})
      popUpToaster = true
    }

    const checkDWall = jsonLogic.apply(productStore.rules.variousFilteringRules, {
      filteringRULE: 'mixingLimited',
      PRODUCT: productStore.product,
      FINISH: getFinish({type:MAT_CAR_WALL_FINISH_D}),
      OLDFINISH: finish,
      WALL:MAT_CAR_WALL_FINISH_D,
      TARGET: 'inside',
    })
    if(checkDWall && !finishType.includes( MAT_CAR_WALL_FINISH_D) && finish !== getFinish({type:MAT_CAR_WALL_FINISH_D}) ) {
      setFinish({type:MAT_CAR_WALL_FINISH_D, finish, custom, finishMaterial})
      popUpToaster = true
    }

    const checkAWall = jsonLogic.apply(productStore.rules.variousFilteringRules, {
      filteringRULE: 'mixingLimited',
      PRODUCT: productStore.product,
      FINISH: getFinish({type:MAT_CAR_FRONT_WALL_A}),
      OLDFINISH: finish,
      WALL:MAT_CAR_FRONT_WALL_A,
      TARGET: 'inside',
    })
    if(checkAWall && !finishType.includes(MAT_CAR_FRONT_WALL_A) && finish !== getFinish({type:MAT_CAR_FRONT_WALL_A}) ) {
      setFinish({type:MAT_CAR_FRONT_WALL_A, finish, custom, finishMaterial})
      popUpToaster = true
    }

    const checkInsideDoor = jsonLogic.apply(productStore.rules.variousFilteringRules, {
      filteringRULE: 'mixingLimited',
      PRODUCT: productStore.product,
      FINISH: getFinish({type:MAT_CDO_PANEL}),
      OLDFINISH: finish,
      WALL:MAT_CDO_PANEL,
      TARGET: 'inside',
    })
    if(checkInsideDoor && !finishType.includes(MAT_CDO_PANEL) && finish !== getFinish({type:MAT_CDO_PANEL}) ) {
      setFinish({type:MAT_CDO_PANEL, finish, custom, finishMaterial})
      popUpToaster = true
    }

    return popUpToaster
  }

  const verifyAndChangeLanding = ({ finishType, finish, custom}) => {

    let popUpToaster=false

    const checkLandingDoor = jsonLogic.apply(productStore.rules.variousFilteringRules, {
      filteringRULE: 'mixingLimited',
      PRODUCT: productStore.product,
      FINISH: getFinish({type:DOOR_FINISHING_A}),
      TARGET: 'outside',
    })
    if(checkLandingDoor && !finishType.includes( DOOR_FINISHING_A) && finish !== getFinish({type:DOOR_FINISHING_A}) ) {
      setFinish({type:DOOR_FINISHING_A, finish, custom})
      popUpToaster = true
    }

    const checkLandingFrame = jsonLogic.apply(productStore.rules.variousFilteringRules, {
      filteringRULE: 'mixingLimited',
      PRODUCT: productStore.product,
      FINISH: getFinish({type:MAT_LDO_FRAME}),
      TARGET: 'outside',
    })
    if(checkLandingFrame && !finishType.includes( MAT_LDO_FRAME) && finish !== getFinish({type:MAT_LDO_FRAME}) ) {
      setFinish({type:MAT_LDO_FRAME, finish, custom})
      popUpToaster = true
    }

    return popUpToaster
  }

  const setThreePanelsAtOnce = ({wall, parts}) => {

    if(!parts || !wall) { return }

    setDesign({
      ...design,
      components: designRef.current.components.map(item => {
        if(item.componentType === wall) {
          return {
            componentType: item.componentType,
            component: item.component,
            finishType: item.finishType,
            finish: item.finish,
            parts: parts
          }
        } else {
          return item
        }
      })
    })

  }

  /**
   * Sets the landing finishes with the same groupId
   */
  const setLandingGroup = ({ groupId }) => {
    const groupFinishes = getGroupFinishes({ groupType: LANDING_FINISH_GROUP, groupId })

    if (!groupFinishes || groupFinishes.length === 0) return

    const analyticsItem = ANALYTICS_OPTIONS['LANDING_FINISHES'] || {name:'Unknown',section:'Unknown'}
    setAnalyticsForEvent({
      eventName: 'Option Change',
      eventData: {
        section: analyticsItem.section,
        name: analyticsItem.name,
        value: groupId
      }
    })

    const wallToSet = groupFinishes
      .find(x => x.types && x.types.includes(MAT_LANDING_WALL))
      
    const floorToSet = groupFinishes
      .find(x => x.types && x.types.includes(MAT_LANDING_FLOOR))

    const ceilingToSet = groupFinishes
      .find(x => x.types && x.types.includes(MAT_LANDING_CEILING))

    const wall = designRef.current.components.find(x => x.finishType === MAT_LANDING_WALL)
    const floor = designRef.current.components.find(x => x.finishType === MAT_LANDING_FLOOR)
    const ceiling = designRef.current.components.find(x => x.finishType === MAT_LANDING_CEILING)

    if (wall && wallToSet) {
      wall.finish = wallToSet.id
      wall.custom = wallToSet.custom
      wall.shared = wallToSet.shared
    }

    if (floor && floorToSet) {
      floor.finish = floorToSet.id
      floor.custom = floorToSet.custom
      floor.shared = floorToSet.shared
    }

    if (ceiling && ceilingToSet) {
      ceiling.finish = ceilingToSet.id
      ceiling.custom = ceilingToSet.custom
      ceiling.shared = ceilingToSet.shared
    }

    setDesign({
      ...design,
      components: designRef.current.components
    })
  }

  const setFinish = ({ type, finish, custom, mixed, finishMaterial=null }) => {

    let setTypeList =[]
    setTypeList.push(type)

    // find the items with the same group id
    const compIndex = designRef.current.components.findIndex(item => item.finishType === type)    
    // if(compIndex !== -1 && designRef.current.components[compIndex].group !== undefined && ( !getComponent({type:TYP_CAR_GLASS_WALL_C}) || productStore.offeringLocation === 'ENA') ) {
    if(compIndex !== -1 && designRef.current.components[compIndex].group !== undefined ) {
      const groupId = designRef.current.components[compIndex].group
      const withSameGroup = designRef.current.components.filter(item => item.group === groupId)
      withSameGroup.forEach(item => {
        setTypeList.push(item.finishType)
      })
    }

    const analyticsItem = ANALYTICS_OPTIONS[type] || {name:'Unknown',section:'Unknown'}
    setAnalyticsForEvent({
      eventName: 'Option Change',
      eventData: {
        section: analyticsItem.section,
        name: analyticsItem.name,
        value: finish
      }
    })

    setDesign({
      ...design,
      components: designRef.current.components.map(item => {
        if ( setTypeList.indexOf(item.finishType) !== -1) {
          // updateUndoList(type, item);

          return {
            ...item,
            finish,
            finishMaterial,
            custom,
            mixed,
          }
        // TODO: Create better solution for changing related dinishes
        // Change landing wall ans landing ceiling when landing floor changes
        } else if ( type === MAT_LANDING_FLOOR && item.finishType === MAT_LANDING_WALL && finish.indexOf('FLOOR') !== -1 ) {
          return {
            ...item,
            finish: finish.split('FLOOR').join('WALL')
          }
        } else if ( type === MAT_LANDING_FLOOR && item.finishType === MAT_LANDING_CEILING && finish.indexOf('FLOOR') !== -1 ) {
          return {
            ...item,
            finish: finish.split('FLOOR').join('CEILING')
          }
        }
        // <-- dummy code ends
        return item
      })
    })

  }

  /**
   * See if design includes given finish. 
   * If current design is modified predesign 
   * take orginal finish from predesign. If not
   * just set it to be null
   * @param {Object} param0 
   */
  const resetFinish = (finish) => {
    const componentWithFinish = designRef.current.components.find(item => item.finish && item.finish === finish)
    if (!componentWithFinish) {
      return
    }
    setDesign({
      ...design,
      components: designRef.current.components.map(item => {
        if (item.finish === finish) {
          return {
            componentType: item.componentType,
            component: item.component,
            finishType: item.finishType,
            finish: designRef.current.sapId ? getFinishFromDesign(designRef.current.sapId, item.finishType) : null,
          }
        }
        return item
      })
    })
  }

  const setFinishCOP = ({ type, finish}) => {

    let landingFinishSameAsCop = true
    if(type && finish && productStore && productStore.rules && productStore.rules.signalizationLandingExceptions) {
      const cop1 = designRef.current.components.find(item => item.componentType === TYP_COP_PRODUCT_1) || {}
      const cop1Component = productStore.components.find(item => item.id === cop1.component) || {}
  
      landingFinishSameAsCop = jsonLogic.apply(productStore.rules.signalizationLandingExceptions,
        {SIG_FAMILY:(cop1Component||{}).componentFamily, PRODUCT_NAME: productStore.product})
    }

    let hlFinishSeparate = false
    if(type && finish && productStore && productStore.rules && productStore.rules.signalizationLandingExceptions) {
      const hl = designRef.current.components.find(item => item.componentType === TYP_HL_PRODUCT) || {}  
      hlFinishSeparate = !jsonLogic.apply(productStore.rules.signalizationLandingExceptions,{TESTING:'separateFinishes', HL:(hl || {}).component})
    }

    let hiFinishSeparate = false
    if(type && finish && productStore && productStore.rules && productStore.rules.signalizationLandingExceptions) {
      const hi = designRef.current.components.find(item => item.componentType === TYP_HI_PRODUCT) || {}  
      hiFinishSeparate = !jsonLogic.apply(productStore.rules.signalizationLandingExceptions,{TESTING:'separateFinishes', HI:(hi || {}).component})
    }

    setDesign({
      ...design,
      components: designRef.current.components.map(item => {
        if (
          landingFinishSameAsCop && (
          item.componentType === TYP_COP_PRODUCT_1 || 
          item.componentType === TYP_COP_2 || 
          item.componentType === TYP_HI_PRODUCT || 
          item.componentType === TYP_HL_PRODUCT || 
          item.componentType === TYP_LCS_PRODUCT //|| 
          // item.componentType === TYP_DOP_PRODUCT || 
          // item.componentType === TYP_DIN_PRODUCT || 
          // item.componentType === TYP_EID_PRODUCT
          )
        ) {

          const analyticsItem = ANALYTICS_OPTIONS[item.componentType] || {name:'Unknown',section:'Unknown'}
          setAnalyticsForEvent({
            eventName: 'Option Change',
            eventData:{
              section: analyticsItem.section,
              name: analyticsItem.name,
              value: finish
            }
          })
      
          if( item.componentType === TYP_COP_2 && !disableHorizontalCop() && hasHorizontalCop() ) {
            return item
          }

          if( item.componentType === TYP_HI_PRODUCT && hiFinishSeparate ) {
            return item
          }

          if( item.componentType === TYP_HL_PRODUCT && hlFinishSeparate ) {
            return item
          }

          return {
            ...item,
            finishType: type,
            finish
          }
        }

        if (
          !landingFinishSameAsCop && (
          item.componentType === TYP_COP_PRODUCT_1 || 
          item.componentType === TYP_COP_2
          )
        ) {

          const analyticsItem = ANALYTICS_OPTIONS[item.componentType] || {name:'Unknown',section:'Unknown'}
          setAnalyticsForEvent({
            eventName: 'Option Change',
            eventData:{
              section: analyticsItem.section,
              name: analyticsItem.name,
              value: finish
            }
          })
      
          if( item.componentType === TYP_COP_2 && !disableHorizontalCop() && hasHorizontalCop() ) {
            return item
          }
          
          return {
            ...item,
            finishType: type,
            finish
          }
        }
        return item
      })
    })
  } 

  const setFinishLandingDevices = ({ type, finish}) => {

    let landingFinishSameAsCop = true
    if(type && finish && productStore && productStore.rules && productStore.rules.signalizationLandingExceptions) {
      const cop1 = designRef.current.components.find(item => item.componentType === TYP_COP_PRODUCT_1) || {}
      const hl = designRef.current.components.find(item => item.componentType === TYP_HL_PRODUCT) || {}
      const cop1Component = productStore.components.find(item => item.id === cop1.component) || {}
      landingFinishSameAsCop = jsonLogic.apply(productStore.rules.signalizationLandingExceptions,
        { SIG_FAMILY: (cop1Component || {}).componentFamily, PRODUCT_NAME: productStore.product })
      
      }

    let hlFinishSeparate = false
    if(type && finish && productStore && productStore.rules && productStore.rules.signalizationLandingExceptions) {
      const hl = designRef.current.components.find(item => item.componentType === TYP_HL_PRODUCT) || {}
  
      hlFinishSeparate = !jsonLogic.apply(productStore.rules.signalizationLandingExceptions,{TESTING:'separateFinishes', HL:(hl || {}).component})
    }
    
    let hiFinishSeparate = false
    if(type && finish && productStore && productStore.rules && productStore.rules.signalizationLandingExceptions) {
      const hi = designRef.current.components.find(item => item.componentType === TYP_HI_PRODUCT) || {}
  
      hiFinishSeparate = !jsonLogic.apply(productStore.rules.signalizationLandingExceptions,{TESTING:'separateFinishes', HI:(hi || {}).component})
    }
    
    setDesign({
      ...design,
      components: designRef.current.components.map(item => {
        if (
          landingFinishSameAsCop && (
          item.componentType === TYP_COP_PRODUCT_1 || 
          item.componentType === TYP_COP_2 || 
          item.componentType === TYP_HI_PRODUCT || 
          item.componentType === TYP_HL_PRODUCT || 
          item.componentType === TYP_LCS_PRODUCT // || 
          // item.componentType === TYP_DOP_PRODUCT || 
          // item.componentType === TYP_DIN_PRODUCT || 
          // item.componentType === TYP_EID_PRODUCT
          )
        ) {

          const analyticsItem = ANALYTICS_OPTIONS[item.componentType] || {name:'Unknown',section:'Unknown'}
          setAnalyticsForEvent({
            eventName: 'Option Change',
            eventData:{
              section: analyticsItem.section,
              name: analyticsItem.name,
              value: finish
            }
          })
      
          if( item.componentType === TYP_COP_2 && !disableHorizontalCop() && hasHorizontalCop() ) {
            return item
          }

          if( item.componentType === TYP_HI_PRODUCT && hiFinishSeparate ) {
            return item
          }

          if( item.componentType === TYP_HL_PRODUCT && hlFinishSeparate ) {
            return item
          }  

          return {
            ...item,
            finishType: type,
            finish
          }
        }

        if (
          !landingFinishSameAsCop && (
          item.componentType === TYP_HI_PRODUCT || 
          item.componentType === TYP_HL_PRODUCT || 
          item.componentType === TYP_LCS_PRODUCT // || 
          // item.componentType === TYP_DOP_PRODUCT || 
          // item.componentType === TYP_DIN_PRODUCT || 
          // item.componentType === TYP_EID_PRODUCT
          )
        ) {

          const analyticsItem = ANALYTICS_OPTIONS[item.componentType] || {name:'Unknown',section:'Unknown'}
          setAnalyticsForEvent({
            eventName: 'Option Change',
            eventData:{
              section: analyticsItem.section,
              name: analyticsItem.name,
              value: finish
            }
          })
      
          if( item.componentType === TYP_HI_PRODUCT && hiFinishSeparate ) {
            return item
          }

          if( item.componentType === TYP_HL_PRODUCT && hlFinishSeparate ) {
            return item
          }

          return {
            ...item,
            finishType: type,
            finish
          }
        }

        return item
      })
    })
  } 

  const setFinishHL = ({ finish}) => {
    
    if(!finish || !designRef.current) {
      return 
    }
    
    setDesign({
      ...design,
      components: designRef.current.components.map(item => {
        if (
          item.componentType === TYP_HL_PRODUCT
        ) {

          const analyticsItem = ANALYTICS_OPTIONS[TYP_HL_PRODUCT] || {name:'Unknown',section:'Unknown'}
          setAnalyticsForEvent({
            eventName: 'Option Change',
            eventData:{
              section: analyticsItem.section,
              name: analyticsItem.name,
              value: finish
            }
          })
      

          return {
            ...item,
            finish
          }
        }

        return item
      })
    })
  } 

  const setFinishHI = ({ finish}) => {
    
    if(!finish || !designRef.current) {
      return 
    }
    
    setDesign({
      ...design,
      components: designRef.current.components.map(item => {
        if (
          item.componentType === TYP_HI_PRODUCT
        ) {

          const analyticsItem = ANALYTICS_OPTIONS[TYP_HI_PRODUCT] || {name:'Unknown',section:'Unknown'}
          setAnalyticsForEvent({
            eventName: 'Option Change',
            eventData:{
              section: analyticsItem.section,
              name: analyticsItem.name,
              value: finish
            }
          })
      

          return {
            ...item,
            finish
          }
        }

        return item
      })
    })
  } 

  const setFinishDCSLanding = ({type, finish}) => {
    
    if(!finish || !designRef.current) {
      return 
    }
    
    setDesign({
      ...design,
      components: designRef.current.components.map(item => {
        console.log({item,type})
        if (
          item.componentType === type
        ) {

          const analyticsItem = ANALYTICS_OPTIONS[type] || {name:'Unknown',section:'Unknown'}
          setAnalyticsForEvent({
            eventName: 'Option Change',
            eventData:{
              section: analyticsItem.section,
              name: analyticsItem.name,
              value: finish
            }
          })
      

          return {
            ...item,
            finish
          }
        }

        return item
      })
    })
  } 
  /**
   * Returns components part by type
   * @param {Object} props { componentType, partType }
   */
  const getPart = ({ componentType, partType }) => {
    const component = designRef.current.components.find( item => item.componentType === componentType)
    if (component && component.parts) {
      return component.parts.find( item => item.componentType === partType)
    }
    return undefined
  }

  /**
   * Sets parts component (id) and finish (id)
   * @param {Object} props { parent, type, component, finish }
   */
  const setPart = ({ componentType, partType, component, finish }) => {    
    const componentIndex = designRef.current.components.findIndex( item => item.componentType === componentType)    
    if (componentIndex !== -1) {
      const partIndex = (designRef.current.components[componentIndex].parts || []).findIndex( item => item.componentType === partType)  
      // console.log('partIndex',partIndex)
      // add new part      
      if (partIndex === -1 && component !== null) {
        setDesign({
          ...designRef.current,
          components: designRef.current.components.map((item, index) => {
            if (componentIndex === index) {
              return {
                ...item,
                parts: [
                  ...(item.parts || []),
                  {
                    componentType: partType,
                    component,
                    finish
                  }
                ]
              }
            }
            return item
          })
        })
      // update part
      } else {
        if(!component && !finish) {
          setDesign({
            ...designRef.current,
            components: designRef.current.components.map((item, cIndex) => {
              if (componentIndex === cIndex) {
                return {
                  ...item,
                  parts: item.parts.filter( part => part.componentType !== partType)
                }
              }
              return item
            })
          })
        } else {
          setDesign({
            ...designRef.current,
            components: designRef.current.components.map((item, cIndex) => {
              if (componentIndex === cIndex) {
                return {
                  ...item,
                  parts: item.parts.map((part, pIndex) => {
                    if (partIndex === pIndex) {
                      return {
                        componentType: partType,
                        component: component || part.component,
                        // note: if component is updated always update the finish
                        finish: component ? finish : (finish || part.finish), 
                      }
                    }
                    return part
                  }),
                }
              }
              return item
            })
          })
        }
      }
    }
  }

  const setPartFinish = ({ type, finish }) => {
    if (!design || !type || !finish) {
      return
    }
    setDesign({
      ...design,
      components: designRef.current.components.map(item => {
        if (item.hasOwnProperty('parts') && Array.isArray(item.parts)) {
          return {
            ...item,
            parts: item.parts.map(part => {
              if (part.type === type) {
                return {
                  ...part,
                  finish
                }
              }
              return part
            })
          }
        }
        return item
      })
    })
  }

  const getValidGroups = () => {
    if(!design || !designRef.current.components || !productStore.product || !productStore.rules || !productStore.rules.wallLocks ) {
      return undefined
    }
    
/*     const decoIndex = designRef.current.components.findIndex(item => item.componentType === TYP_CAR_WALL_ADD_DECO_PACKAGE)
    const copIndex = designRef.current.components.findIndex(item => item.componentType === TYP_CAR_WALL_ADD_DECO_PACKAGE) */
    let test={}
    test["PRODUCT"] = productStore.product;
    test["CAR_TYPE"] = designRef.current.carType || 'none';
    test["DECO"] = getComponent({type:TYP_CAR_WALL_ADD_DECO_PACKAGE}) || 'none';
    test["COP1_POS"] = (getPositions({type:TYP_COP_PRODUCT_1}) || []).join('');
    test["CWALL_MATERIAL"] = getMaterial({type:MAT_CAR_WALL_FINISH_C, finish:getFinish({type:MAT_CAR_WALL_FINISH_C}) }) || null;
    test["PREDESIGN"] = designRef?.current?.originalSapId;
    // console.log({test, res:jsonLogic.apply(productStore.rules.wallLocks, test)})
    const validCombinations = jsonLogic.apply(productStore.rules.wallLocks, test);
    return validCombinations.filter(item => item !== null)
  }

  const getGroups = () => {
    if(!design || !designRef.current.components) {
      return undefined
    }


    if(
      (productStore && productStore.wallEditor && !productStore.wallEditor.wallFinishesRestricted)
      && !(getComponent({type: TYP_CAR_GLASS_WALL_C}) && getPositions({type:TYP_CAR_GLASS_WALL_C}))
      ) {
      return undefined
    }

    let groups={}

    if( productStore?.extraFeatures?.includes(EXTRA_FEATURES.FULL_SCENIC_CAR) && getComponent({type: TYP_CAR_GLASS_WALL_C}) && getPositions({type:TYP_CAR_GLASS_WALL_C}) ) {
      const scenicPos = getPositions({type:TYP_CAR_GLASS_WALL_C})
      groups[TYP_CAR_WALL_D] = 0
      groups[TYP_CAR_WALL_C] = 
        ( (scenicPos.includes('D1') || scenicPos.includes('D2')) && scenicPos.includes('C')) 
          ? 0
          :( !(scenicPos.includes('D1') || scenicPos.includes('D2')) && !scenicPos.includes('C') && (scenicPos.includes('B1') || scenicPos.includes('B2')) )
            ? 0
            : 1
      groups[TYP_CAR_WALL_B] = 
        ( (scenicPos.includes('D1') || scenicPos.includes('D2')) && (scenicPos.includes('B1') || scenicPos.includes('B2'))) 
          ? 0 
          :( !(scenicPos.includes('D1') || scenicPos.includes('D2')) && !(scenicPos.includes('B1') || scenicPos.includes('B2')))
            ? 0
            : 1
      return groups
    }

    const componentsWithGroup = designRef.current.components.filter(item => item.group !== undefined)

    componentsWithGroup.forEach(item => {
      groups[item.componentType] = item.group
    })

    return groups
  }

  const setGroups = (groups) => {
    if(!groups || !design || !designRef.current.components) {
      return undefined
    }

    setDesign({
      ...design,
      components: designRef.current.components.map(item => {
        if(groups.hasOwnProperty(item.componentType)) {
          return {
            ...item,
            group: groups[item.componentType]
          }
        } else {
          return item
        }
      })
    })

  }

  const setDefaultFinish = ({ type }) => {
    const finish = getDefaultFinish({ type })
    if (finish && finish.id) {
      setFinish({ type, finish: finish.id })
    }
  }

 

  const getDesignProperty = (id) => {
    if (!id || !design || !design[id]) {
      return undefined
    }

    return design[id];
  }

  const setEmptyDesign = () => {
    setDesign(null)
    setInitDesign(null)
    setInitHiddenId(null)
  }

  // "public" function
  // only for setting whole design
  const _setDesign = (newDesign, options = {}) => {
    const { setName = true, initial, skipRules } = options
    if (!newDesign || !newDesign.components) {
      return;
    }

    // Possible to set to false 
    // so currently edited name won't  be overwritten on design save
    // when editing the name (design specification page)
    if (setName) {
      setDesignName(newDesign.name)
    }

    const shapeInfo = CAR_SHAPES.find(item => item.id === newDesign.carShape) || {}
    const customDesignDimensions = newDesign?.customDesignDimensions || {width: shapeInfo.displayWidth, depth: shapeInfo.displayDepth, unit:shapeInfo.displayUnit}
    return setDesign({
      ...newDesign,
      customDesignDimensions,
      components: [
        // ...predefinedDesignComponents,
        ...newDesign.components
      ]
    }, { initial, skipRules, isEdited: false });
  }

  function getDefaultShape() {
    if (!productStore) return null
    const data = productStore.componentsData
    console.log('getting shape', data);
    if (!data) return null
    
    const shapes = data.carshapes.filter(item => !item.disabled).map(item => item.id)
    if(productStore?.businessSpecification?.market === 'SOC' && productStore?.businessSpecification?.specificFor === 'CN' && shapes.indexOf(CAR_SHAPE_WIDE) !== -1) {
      return CAR_SHAPE_WIDE
    }

    return shapes[0]
  }

  function getDefaultType() {
    if (!productStore) return null
    const data = productStore.componentsData
    if (!data) return null

    const types = data.cartypes.filter(item => !item.disabled).map(item => item.id)
    return types[0]
  }

  const newDesign = (productType = 'monospace-700') => {
    // console.log('here')
    const blankDesign = {
      id: `design-${Date.now()}`,
      name: 'design-custom',
      carShape: getDefaultShape(),
      carType: getDefaultType(),
      product: productType,
      country: offeringCtx.countryCode, // Country code added for frontline specific design sharing logic (e.g. Indian expiring links)
      panelOrientation: ( HORIZONTAL_PANELING_ONLY.indexOf(productType) !== -1 ) ? HORIZONTAL : VERTICAL, // TODO remove hardcoding...
      components: [
        // ...predefinedDesignComponents,
        {
          componentType: TYP_CAR_WALL_B,
          component: "WALLB",
          finishType: MAT_CAR_WALL_FINISH_B,
        },
        {
          componentType: TYP_CAR_WALL_C,
          component: "WALLC",
          finishType: MAT_CAR_WALL_FINISH_C,
        },
        {
          componentType: TYP_CAR_WALL_D,
          component: "WALLD",
          finishType: MAT_CAR_WALL_FINISH_D,
        },
        {
          componentType: TYP_CAR_FRONT_WALL_A,
          component: "WALLA",
          finishType: MAT_CAR_FRONT_WALL_A,
        },    
        {
          componentType: TYP_CAR_FLOORING,
          component: "FLOOR",
          finishType: MAT_CAR_FLOORING,
        },
        {
          componentType: TYP_DOOR_A,
          component: defaultDoorSolution,
          finishType: MAT_CDO_PANEL,
        },
        {
          componentType: TYP_LDO_FRAME_FRONT,
          component: defaultDoorFrames,
          finishType: MAT_LDO_FRAME,
        },
        {
          componentType: TYP_CAR_CEILING,
          component: "ceiling-none",
          finishType: MAT_CAR_CEILING,
        },
        {
          componentType: TYP_COP_PRODUCT_1,
          component: "cop-none",
          finishType: MAT_COP_FACE_PLATE_1,
          positions: [defaultCopPosition],
          parts: [
            {
              componentType: BUTTON_COLS,
              component: BUTTON_COL_ONE
            },
            {
              componentType: BUTTON_SHAPE,
              component: BUTTON_SHAPE_ROUND
            },
            {
              componentType: BRAILLE,
              component: BRAILLE_OFF
            },
          ]
        },
        {
          componentType: TYP_LANDING_FLOOR,
          component: "LANDING_FLOOR",
          finishType: MAT_LANDING_FLOOR,
          finish: defaultLandingFloor,
        },
        {
          componentType: TYP_LANDING_WALL,
          component: "LANDING_WALL",
          finishType: MAT_LANDING_WALL,
          finish: defaultLandingWall
        },
        {
          componentType: TYP_LANDING_CEILING,
          component: "LANDING_CEILING",
          finishType: MAT_LANDING_CEILING,
          finish: defaultLandingCeiling
        },
      ]
    }

    if( productStore?.businessSpecification?.market === 'ENA') {
      blankDesign.components.push({        
        componentType: 'TYP_HIB_PRODUCT',
        component: 'HI_Braille',
        positions:['A1','A2']
      })
    }

    if(['monospace-700','monospace-dev','monospace-500','minispace'].includes(productStore.product)) {
      const bWall = blankDesign.components.find(item => item.componentType === TYP_CAR_WALL_B)
      const cWall = blankDesign.components.find(item => item.componentType === TYP_CAR_WALL_C)
      const dWall = blankDesign.components.find(item => item.componentType === TYP_CAR_WALL_D)
      bWall.group = 0
      cWall.group = 1
      dWall.group = 0
    }

    _setDesign(blankDesign, { initial: true })
  }

  const getDummyDesign = (designId) => {
    return {
      id: designId,
      name: 'design-custom',
      carShape: getDefaultShape(),
      carType: getDefaultType(),
      panelOrientation: VERTICAL,
      components: [
        // ...predefinedDesignComponents,
        {
          componentType: TYP_CAR_WALL_B,
          component: "WALLB",
          finishType: MAT_CAR_WALL_FINISH_B,
        },
        {
          componentType: TYP_CAR_WALL_C,
          component: "WALLC",
          finishType: MAT_CAR_WALL_FINISH_C,
        },
        {
          componentType: TYP_CAR_WALL_D,
          component: "WALLD",
          finishType: MAT_CAR_WALL_FINISH_D,
        },
        {
          componentType: TYP_CAR_FRONT_WALL_A,
          component: "WALLA",
          finishType: MAT_CAR_FRONT_WALL_A,
        },    
        {
          componentType: TYP_CAR_FLOORING,
          component: "FLOOR",
          finishType: MAT_CAR_FLOORING,
        },
        {
          componentType: TYP_DOOR_A,
          component: defaultDoorSolution,
          finishType: MAT_CDO_PANEL,
        },
        {
          componentType: TYP_LDO_FRAME_FRONT,
          component: defaultDoorFrames,
          finishType: MAT_LDO_FRAME,
        },
        {
          componentType: TYP_CAR_CEILING,
          component: "ceiling-none",
          finishType: MAT_CAR_CEILING,
        },
        {
          componentType: TYP_COP_PRODUCT_1,
          component: "cop-none",
          finishType: MAT_COP_FACE_PLATE_1,
          positions: [defaultCopPosition],
          parts: [
            {
              componentType: BUTTON_COLS,
              component: BUTTON_COL_ONE
            },
            {
              componentType: BUTTON_SHAPE,
              component: BUTTON_SHAPE_ROUND
            },
            {
              componentType: BRAILLE,
              component: BRAILLE_OFF
            },
          ]
        },
        {
          componentType: TYP_LANDING_FLOOR,
          component: "LANDING_FLOOR",
          finishType: MAT_LANDING_FLOOR,
          finish: defaultLandingFloor
        },
        {
          componentType: TYP_LANDING_WALL,
          component: "LANDING_WALL",
          finishType: MAT_LANDING_WALL,
          finish: defaultLandingWall
        },
        {
          componentType: TYP_LANDING_CEILING,
          component: "LANDING_CEILING",
          finishType: MAT_LANDING_CEILING,
          finish: defaultLandingCeiling
        },
      ]
    }
  }

  const hasUndoState = () => {
    if (undoStateRef.current) {
      return true
    }
    return false
  }

  const createUndoState = () => {
    const undoState = deepcopy(design)
    undoStateRef.current = undoState
    return undoState
  }

  const clearUndoState = () => {
    undoStateRef.current = null
  }

  const undo = (props) => {
    if (undoStateRef.current) {
      if(props) {
        let undoCopy = deepcopy(undoStateRef.current)
        for( const prop of props) {
          undoCopy[prop.property] = prop.value
        }
        _setDesign(undoCopy)
      } else {
        _setDesign(undoStateRef.current)
      }     
      undoStateRef.current = null
    }
  }

  const hasCustomFinishes = () => {
    if (!design || !designRef.current.components) {
      return false
    }

    // find finish id:s
    let finishes = designRef.current.components.reduce((items, item) => {
      const { finish } = item
      if (finish) {
        items.push(finish)
      }
      return items
    }, [])

    // remove dublicates
    finishes = [...new Set(finishes)]


    for (let i = 0; i < finishes.length; i++) {
      if (isCustomFinish(finishes[i])) {
        return true
      }
    }

    return false
  }

  const disableHorizontalCop = () => {
    if (!design || !designRef.current.components) {
      return undefined
    }

    if(!productStore) { return undefined }

    const cop1 = designRef.current.components.find(item => item.componentType === TYP_COP_PRODUCT_1) || {}
    const cop2 = designRef.current.components.find(item => item.componentType === TYP_COP_2) || {}
    const copHor = designRef.current.components.find(item => item.componentType === TYP_COP_HORIZONTAL) || {}
    const scenicPos = ( (designRef.current.components.find(item => item.componentType === TYP_CAR_GLASS_WALL_C) || {}).positions || []) 
    
    if(productStore?.rules?.signalizationHorizontal) {
      const results = jsonLogic.apply(productStore.rules.signalizationHorizontal,
        { COP2: (cop2.component || 'none'), COP1_POS: (cop1.positions || []).join(''), COP2_POS: (cop2.positions || []).join(''), SCENIC_POS: scenicPos })
      return !results[0];
    }


    if(copHor) {
      if(!cop2 || !cop2.positions) {
        return false
      }

      // If cop1 and cop2 are both on the side walls, you can't add horcop
      if( !cop2.positions.find(item => ['A1','A2','C1','C2'].indexOf(item) !== -1) && !cop1.positions.find(item => ['A1','A2','C1','C2'].indexOf(item) !== -1) ) {
        return true
      }
      return false
    }
    if(!cop2) { return false }

    return true
  }

  const hasHorizontalCop = () => {
    if (!design || !designRef.current.components) {
      return false
    }

    if(!productStore) { return false }

    const copHor = designRef.current.components.find(item => item.componentType === TYP_COP_HORIZONTAL)
    if(copHor) { return true }
    return false
  }

  const horizontalCopType = () => {

    return TYP_COP_HORIZONTAL
  }

  const horizontalPositionSelectable = () => {
    if (!design || !designRef.current.components) {
      return undefined
    }

    if(!productStore) { return undefined }

    const cop1 = designRef.current.components.find(item => item.componentType === TYP_COP_PRODUCT_1) || {}
    const cop2 = designRef.current.components.find(item => item.componentType === TYP_COP_2) || {}
    
    if(productStore && productStore.rules && productStore.rules.signalizationHorizontal) {
      const results = jsonLogic.apply(productStore.rules.signalizationHorizontal, {COP1_POS:(cop1.positions || []).join(''), COP2_POS:(cop2.positions || ['none']).join('') } )
      return results[4];
    }

    return false
  }

  const getLaminateListsByWallFinish = () => {
    if (!design || !designRef.current.components) {
      return undefined
    }

    let listsOnWalls=[]
    let laminateWallFinishes=[]
    const wallDIndex = designRef.current.components.findIndex(item => item.componentType === TYP_CAR_WALL_D);
    const wallCIndex = designRef.current.components.findIndex(item => item.componentType === TYP_CAR_WALL_C);
    const wallBIndex = designRef.current.components.findIndex(item => item.componentType === TYP_CAR_WALL_B);
    const wallB = (wallBIndex !== -1 && designRef.current.components[wallBIndex]) || {}
    const wallC = (wallCIndex !== -1 && designRef.current.components[wallCIndex]) || {}
    const wallD = (wallDIndex !== -1 && designRef.current.components[wallDIndex]) || {}
  
    if(designRef.current.components[wallBIndex].parts && designRef.current.components[wallBIndex].parts.length > 0) {
      const b1Finish = (designRef.current.components[wallBIndex].parts.find(item => item.type === CAR_WALL_STRUCTURE_B1) || {}).finish
      const bxFinish = (designRef.current.components[wallBIndex].parts.find(item => item.type === CAR_WALL_STRUCTURE_BX) || {}).finish
      const b2Finish = (designRef.current.components[wallBIndex].parts.find(item => item.type === CAR_WALL_STRUCTURE_B2) || {}).finish
      let bLists=[]
      bLists.push( jsonLogic.apply(productStore.rules.laminateLists, {FINISH: ( b1Finish || null), MARKET:(productStore.businessSpecification.market || ''), PRODUCT: productStore.product } ) )
      bLists.push( jsonLogic.apply(productStore.rules.laminateLists, {FINISH: ( bxFinish || null), MARKET:(productStore.businessSpecification.market || ''), PRODUCT: productStore.product } ) )
      bLists.push( jsonLogic.apply(productStore.rules.laminateLists, {FINISH: ( b2Finish || null), MARKET:(productStore.businessSpecification.market || ''), PRODUCT: productStore.product } ) )
      const bLL = bLists.find(item => item !== false)
      listsOnWalls.push( (bLL !== undefined ?bLL :false) )
    } else {
      const bTest={
        FINISH: ( (designRef.current.components.find(item => item.componentType === TYP_CAR_WALL_B) || {}).finish || null), 
        MARKET:(productStore.businessSpecification.market || ''),
        PRODUCT: productStore.product,
        MATERIAL: wallB.finishMaterial,
      }
      const bLL = jsonLogic.apply(productStore.rules.laminateLists, bTest)
      listsOnWalls.push(bLL)
      if(bLL) {laminateWallFinishes.push(( (designRef.current.components.find(item => item.componentType === TYP_CAR_WALL_B) || {}).finish || null))}
    }

    if(wallCIndex !== -1 && designRef.current.components[wallCIndex].parts && designRef.current.components[wallCIndex].parts.length > 0) {
      const c1Finish = (designRef.current.components[wallCIndex].parts.find(item => item.type === CAR_WALL_STRUCTURE_C1) || {}).finish
      const cxFinish = (designRef.current.components[wallCIndex].parts.find(item => item.type === CAR_WALL_STRUCTURE_CX) || {}).finish
      const c2Finish = (designRef.current.components[wallCIndex].parts.find(item => item.type === CAR_WALL_STRUCTURE_C2) || {}).finish
      let cLists=[]
      cLists.push( jsonLogic.apply(productStore.rules.laminateLists, {FINISH: ( c1Finish || null), MARKET:(productStore.businessSpecification.market || ''), PRODUCT: productStore.product } ) )
      cLists.push( jsonLogic.apply(productStore.rules.laminateLists, {FINISH: ( cxFinish || null), MARKET:(productStore.businessSpecification.market || ''), PRODUCT: productStore.product } ) )
      cLists.push( jsonLogic.apply(productStore.rules.laminateLists, {FINISH: ( c2Finish || null), MARKET:(productStore.businessSpecification.market || ''), PRODUCT: productStore.product } ) )
      const cLL = cLists.find(item => item !== false)
      listsOnWalls.push( (cLL !== undefined ?cLL :false) )
    } else {
      const cTest={
        FINISH: ( (designRef.current.components.find(item => item.componentType === TYP_CAR_WALL_C) || {}).finish || null),
        MARKET:(productStore.businessSpecification.market || ''),
        PRODUCT: productStore.product,
        MATERIAL: wallC.finishMaterial,
      }
      const cLL = jsonLogic.apply(productStore.rules.laminateLists, cTest)
      listsOnWalls.push(cLL)
      if(cLL) {laminateWallFinishes.push(( (designRef.current.components.find(item => item.componentType === TYP_CAR_WALL_C) || {}).finish || null))}

    }

    if(wallDIndex !== -1 && designRef.current.components[wallDIndex].parts && designRef.current.components[wallDIndex].parts.length > 0) {
      const d1Finish = (designRef.current.components[wallDIndex].parts.find(item => item.type === CAR_WALL_STRUCTURE_D1) || {}).finish
      const dxFinish = (designRef.current.components[wallDIndex].parts.find(item => item.type === CAR_WALL_STRUCTURE_DX) || {}).finish
      const d2Finish = (designRef.current.components[wallDIndex].parts.find(item => item.type === CAR_WALL_STRUCTURE_D2) || {}).finish
      let dLists=[]
      dLists.push( jsonLogic.apply(productStore.rules.laminateLists, {FINISH: ( d1Finish || null), MARKET:(productStore.businessSpecification.market || ''), PRODUCT: productStore.product } ) )
      dLists.push( jsonLogic.apply(productStore.rules.laminateLists, {FINISH: ( dxFinish || null), MARKET:(productStore.businessSpecification.market || ''), PRODUCT: productStore.product } ) )
      dLists.push( jsonLogic.apply(productStore.rules.laminateLists, {FINISH: ( d2Finish || null), MARKET:(productStore.businessSpecification.market || ''), PRODUCT: productStore.product } ) )
      const dLL = dLists.find(item => item !== false)
      listsOnWalls.push( (dLL !== undefined ?dLL :false) )
    } else {
      const dTest={
        FINISH: ( (designRef.current.components.find(item => item.componentType === TYP_CAR_WALL_D) || {}).finish || null),
        MARKET:(productStore.businessSpecification.market || ''),
        PRODUCT: productStore.product,
        MATERIAL: wallD.finishMaterial,
      }
      const dLL = jsonLogic.apply(productStore.rules.laminateLists, dTest)
      listsOnWalls.push(dLL)
      if(dLL) {laminateWallFinishes.push(( (designRef.current.components.find(item => item.componentType === TYP_CAR_WALL_D) || {}).finish || null))}

    }

    return {listTypes: listsOnWalls}

  }

  /**
   * When going from a wide car shape with three panels in the backwall to an exception car shape, 
   * force the rightmost panel finish to be used for every panel.
   * Modifies the design if necessary.
   */
  function handlePanelingException(design, shape) {
    if (PANELING_EXCEPTION_CAR_SHAPES.includes(shape)) {
      const cWall = design.components.find(x => x.componentType === TYP_CAR_WALL_C)

      if (cWall && cWall.parts) {
        const [ leftPanel, centerPanel, rightPanel ] = getPanelTypes(cWall.finishType)
      

        cWall.treatAsTwo = true

        const rightPart = cWall.parts.find(x => x.type === rightPanel)

        const finish = rightPart?.finish
        const custom = rightPart?.custom

        cWall.parts = [
          { type: leftPanel, finish, custom },
          { type: centerPanel, finish, custom },
          { type: rightPanel, finish, custom },
        ]
      }
    } else {
      if(productStore?.wallEditor?.mixableWallFinishes && PANELING_EXCEPTION_CAR_SHAPES.includes(design.carShape)) {
        const cWall = design.components.find(x => x.componentType === TYP_CAR_WALL_C)

        if (getFinishMaterial({type:MAT_CAR_WALL_FINISH_C}) === DECO_GLASS_MATERIAL) {
          const [ leftPanel, centerPanel, rightPanel ] = getPanelTypes(cWall.finishType)
        
          const finish = cWall.finish
  
          cWall.parts = [
            { type: leftPanel, finish, custom:false },
            { type: centerPanel, finish, custom:false },
            { type: rightPanel, finish, custom:false },
          ]
        }
  
      }
    }
  }

  const getService = ({type}) => {
    if(!type || !designRef?.current?.services) return false

    if(designRef.current.services.indexOf(type) !== -1) return true

    return false
  }

  const setService = ({type, value}) => {
    if(!type) return undefined

    if(value === true) {
      if(!designRef?.current?.services) {
        setDesign({
          ...design,
          services:[type]
        })
        return;
      }

      if(designRef.current.services.indexOf(type) !== -1) return
      
      const services = designRef.current.services
      setDesign({
        ...designRef.current,
        services:[...services, type]
      })

    } else {
      if(!designRef?.current?.services) return 
      const services = designRef.current.services
      const modifyIndex = services.indexOf(type)

      if(modifyIndex !== -1) {
        services.splice(modifyIndex,1);
        setDesign({
          ...design,
          services:[...services]
        })
  
      }
    }

    return
  }

  const getCustomDimension = ( {type} ) => {
    if(!designRef?.current?.customDesignDimensions) return undefined

    const orgDimensions = designRef.current.customDesignDimensions
    return orgDimensions[type]
  }

  const getCustomDimensionUnit = (  ) => {
    if(!designRef?.current?.customDesignDimensions) return undefined

    const orgDimensions = designRef.current.customDesignDimensions
    return orgDimensions.unit
  }

  const setCustomDimension = ( {type, value} ) => {
    if(!type) return undefined
    if(!designRef?.current?.customDesignDimensions) return undefined

    const orgDimensions = designRef.current.customDesignDimensions
    orgDimensions[type] = value

    setDesign({
      ...designRef.current,
      customDesignDimensions:{
        ...orgDimensions
      }
    })
    return
  }

  const setAirPurifierVisibility = ({value}) => {
    if( value === undefined) return

    if(value) {
      setDesign({
        ...designRef.current,
        showAirPurifierModel:true
      })
      return
    }

    setDesign({
      ...designRef.current,
      showAirPurifierModel:false
    })
    return
  }

  return (
    <DesignContext.Provider value={{ 
      design, setDesign: _setDesign, newDesign, getDummyDesign, setEmptyDesign,
      designName, setDesignName, initDesign, setInitDesign, initHiddenId, setInitHiddenId,
      edited, setEdited,
      cornerPieces,
      hiddenId, setHiddenId,
      setCarShape, setCarType,
      setRegulations, setExtraFeatures,
      setPanelOrientation,
      getFinish, getComponent, setComponent, setFinishCOP, setFinishLandingDevices, setFinishHI, setFinishHL, setFinishDCSLanding, addSecondCOP, addHorizontalCop,
      setFinish, resetFinish, /* undoFinish, hasUndoFinish, */ getComponentFinishType, getPart, setPart, setPartFinish, getPartFinish, getComponentFinish, setComponentFinish,
      getFinishMaterial, setFinishMaterial,
      getService, setService,
      getGroups, setGroups, getValidGroups,
      setDefaultComponent, setDefaultFinish,
      getDesignProperty,  getDesignItem,
      getLaminateListsByWallFinish,
      getPositions, setPositions,
      designImages, setDesignImages,
      getCustomDimension, getCustomDimensionUnit, setCustomDimension,
      hasUndoState, createUndoState, clearUndoState, undo,
      hasCustomFinishes, disableHorizontalCop, hasHorizontalCop, horizontalPositionSelectable,horizontalCopType,
      setWallPanelFinish, clearWallPanels, getWallPanel, getAllWallPanels, hasIdenticalPanels,
      setWallFinish, setWallPanelingStyle, setThreePanelsAtOnce, setLandingGroup, hasThreePanelsOnSideWall,
      originalDesignId, setOriginalDesignId, setDesignProperty,
      verifyAndChangeAllWalls, verifyAndChangeLanding,
      setAirPurifierVisibility,
    }}>
      {children}
    </DesignContext.Provider>
  )
}
export default DesignProvider;

export const DesignConsumer = DesignContext.Consumer;