import React, { useState, useContext, useEffect, useRef } from 'react';
import jsonLogic from 'json-logic-js';
import uniqid from 'uniqid';
import getCountryISO3 from 'country-iso-2-to-3'

import { DataContext } from '../data';
import { TYP_CAR_WALL_ADD_DECO_PACKAGE, MAT_CAR_WALL_FINISH_B, TYP_CAR_CEILING, MAT_CAR_WALL_FINISH_C, MAT_CAR_WALL_FINISH_D, MATERIAL_CATEGORY_MASTER, LOCAL_STORAGE_CUSTOM_FINISHES, TEXTURE_TYPE_TEXTURE, LANDING_FINISH_GROUP, MAT_LANDING_CEILING, TYP_CAR_WALL_B, TYP_CAR_WALL_C, TYP_CAR_WALL_D, CAR_SHAPES } from '../../constants';
import { OfferingContext } from '../offering';
import { AuthContext } from '../auth/AuthProvider';
import { APIContext } from '../api';
import { SiteContext } from '../site';
import * as productUtils from './product-utils'

export const ProductContext = React.createContext();
const IMAGE_PREFIX = 'image-'

/**
 * Creates catalog store
 * @function ProductProvider Product store
 * @param {Object} props Properties passed to the provider
 */
export const ProductProvider =  ({ children, initialProductState=null }) => {

  const { loggedInUser } = useContext(AuthContext)
  const api = useContext(APIContext)
  const { loadProduct, getCountryNameForCode } = useContext(DataContext)
  const offeringCtx = useContext(OfferingContext)
  const { offering, productFamilies } = offeringCtx
  const { selectedBuildingsType, setSelectedBuildingsType } = useContext(SiteContext)
  const [ customFinishes, setCustomFinishes ] = useState()
  const [productId, setProductId] = useState();
  const [ releaseId, setReleaseId ] = useState()
  const [product, setProduct] = useState(initialProductState);
  const [productKTOCDestCountry, setProductKTOCDestCountry] = useState(null);
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState()
  const fullProductDefinition = useRef() // Ref instead of state to avoid unnecessary rerenders

  useEffect(() => {
    if (!offering) {
      setProductId(null)
      return
    }
    
    const hasProduct = offering.map(x => x.id).includes(productId)
    if (!hasProduct) {
      setProductId(null)
    }
  }, [offering])

  function createProductState({originalProduct, decorator, customFinishes = [] }) {
    const newProduct = {
      ...originalProduct,
      finishes: [
        ...originalProduct.finishes,
        ...(decorator.finishes || []),
        // add custom finish here
        ...customFinishes.map( item => item.finish )
      ],
      materials: [
        ...originalProduct.materials,
        ...(decorator.materials || []),
        // add custom materials here
        ...[].concat(...customFinishes.map(item => {
          return item.materials || []
        }))
      ],
      textures: [
        ...originalProduct.textures,
        ...(decorator.textures || []),
        // add custom textures here
        ...[].concat(...customFinishes.map(item => {
          return item.textures || []
        }))
      ]
    }

    updateIndexes(newProduct)
    return newProduct
  }

  /**
   * 
   * @param {string} id 
   * @param {string} releaseId
   * @param {string} offeringArg 
   * @param {string} countryToUse 
   * @param {Object[]} additionalCustomFinishes - Possible to provide additional custom finishes to set in the product, on top of database or local storage ones. (Mainly for share design)
   */
  async function loadProductWithId(id, releaseId, offeringArg, countryToUse, additionalCustomFinishes, productFamiliesArg, decorator = {}, withFullDefinition, customCarDimensions, carShape, destinationCountry) {
    if (loading) return
    setProduct(null)
    setProductId(null)
    setLoading(true)

    // These are not initialized on time when coming from share link so passed
    // in as arguments
    const offeringToUse = offeringArg || offering
    const familiesToUse = productFamiliesArg || productFamilies
    const result = await loadProduct(
      { 
        productId: id, 
        releaseId, 
        offering: offeringToUse, 
        countryName: countryToUse
      }
    )
    
    if (!result) {
      setLoading(false)
      return
    }
    
    let customFinishesToUse = customFinishes
    // Only load custom finishes if they have not already been set
    if (!customFinishesToUse) {
      // If logged in
      if (loggedInUser) {
        try {
          await saveLocalFinishesToDB()
        } catch (err) {
          console.error('Failed to save local finishes to the database')
        }
      }

      try {
        const res = await loadCustomFinishes()
        customFinishesToUse = res
      } catch (err) {
        console.error(`Failed to download custom finishes for the user:`, err)
      }
      if (additionalCustomFinishes && Array.isArray(additionalCustomFinishes)) {
        customFinishesToUse.push(...additionalCustomFinishes)
      }

      setCustomFinishes(customFinishesToUse)
    }

    const newProduct = createProductState({ originalProduct: result, decorator, customFinishes: customFinishesToUse })
    const productInOffering = offeringToUse.find(x => x.id === newProduct.id)

    if (!selectedBuildingsType && productInOffering && familiesToUse) {
      const family = familiesToUse.find(x => x.id === productInOffering.productFamily)

      if (family && family.type) {
        setSelectedBuildingsType(family.type)
      } 
    }

    if (withFullDefinition) {
      const fullyDefined = await loadProduct(
        { 
          productId: id, 
          releaseId, 
          offering: offeringToUse, 
          countryName: countryToUse,
          fullDefinition: true,
          withRules: false
        }
      )

      fullyDefined.rules = result.rules
      fullProductDefinition.current = createProductState({ originalProduct: fullyDefined, decorator, customFinishes: customFinishesToUse })

    }


    const shapeInfo = CAR_SHAPES.find(item => item.id === carShape) || null
    let customCarShape = null
    if(shapeInfo && customCarDimensions) {
      if(shapeInfo.displayDepth !== customCarDimensions.depth || shapeInfo.displayWidth !== customCarDimensions.width) {
        customCarShape = {
          id: `${carShape}_custom`,
          size: `${customCarDimensions.width} ${customCarDimensions.unit} x ${customCarDimensions.depth} ${customCarDimensions.unit}`,
          iconClassName: carShape.toLowerCase(),
          realShapeId: carShape,
          width: customCarDimensions.width,
          depth: customCarDimensions.depth,
          unit: customCarDimensions.unit,
        }
        newProduct.customCarShape = customCarShape
      }
    }

    if (withFullDefinition) {
      if (countryToUse.toLowerCase() === 'ktoc') {
        const destCountryCode = getCountryISO3(destinationCountry)
        const destCountryName = getCountryNameForCode(destCountryCode)
        try {
          const destOfferingProduct = await loadProduct(
            { 
              productId: id, 
              releaseId, 
              offering: offeringToUse, 
              countryName: destCountryName.toLowerCase(),
            }
          )
          setProductKTOCDestCountry(destOfferingProduct)
          console.log('KTOC destination country', destCountryCode, 'product definition loaded', {destOfferingProduct})
        } catch (error) {
          setProductKTOCDestCountry(newProduct)      
        }
      }
    }

        setLoading(false)

    setProduct(newProduct)
    setProductId(newProduct.id)
    setReleaseId(releaseId)
    // testing
/*      newProduct.componentsData.accessories.airPurifier= {
                        "id": "KCSM_AIR_PURIFIER",
                        "label": "ui-general-air-purifier",
                        "releases": [
                          "R21.2","R22.2"
                        ],
                        "disabled": false
                      } */

/*
    newProduct.componentsData.kcsmServices= [
      {
        "id": "KCSM_MOBILE_ELEV_CALL",
        "label": "ui-general-elevator-call",
        "releases": [
          "R21.2"
        ]
      },
      {
        "id": "KCSM_APF_SERV_ROBOT_API",
        "label": "ui-general-service-robot-api",
        "releases": [
          "R21.2"
        ]
      },
      {
        "id": "KCSM_24_7_CONNECT",
        "label": "ui-general-24-7-connected-services",
        "releases": [
          "R21.2"
        ]
      },
      {
        "id": "KCSM_ELEV_MUSIC",
        "label": "ui-general-elevator-music",
        "releases": [
          "R21.2"
        ]
      },
      {
        "id": "KCSM_APF_INFO_300",
        "label": "ui-general-kone-information",
        "releases": [
          "R21.2"
        ]
      }
    ] */
    
    return newProduct
  }

  async function swapProductToOfferingLocation() {
    if (productKTOCDestCountry) {
      setProduct({...product, ...productKTOCDestCountry})
    }
  }

  const updateIndexes = (p) => {

    const { finishes, components } = p
    p.finishIndexesById = {}
    p.componentIndexesById = {}
    
    if ( finishes ) {
      for (let i = 0; i < finishes.length; i++) {
        const { id, sapId } = finishes[i];
        const indexBy = id || sapId
        if ( indexBy ) {
          p.finishIndexesById[ indexBy ] = i
        }        
      }
    }

    if ( components ) {
      for (let i = 0; i < components.length; i++) {
        const { id, sapId } = components[i];
        const indexBy = id || sapId
        if ( indexBy ) {
          p.componentIndexesById[ indexBy ] = i
        }
      }
    }

    return p
  }

  const getComponents = ({ type, filteringOptions = null }) => {
    if (!product) {
      return []
    }
    const preFilteredComponents = (product.components || []).filter(item => {
      return item.type === type && !item.disabled
    })

    let filteredComponents
    if(filteringOptions && filteringOptions.rule) {

      if(product && product.rules && product.rules[filteringOptions.rule]) {
        let testStaticPart = filteringOptions.test || {}
        
        filteredComponents = preFilteredComponents.filter(item => {
          const test = {
            ...testStaticPart,
            ITEM: item.id
          }
          return jsonLogic.apply(product.rules[filteringOptions.rule], test)
        })
      }

    } else {
      filteredComponents = preFilteredComponents
    }

    if (!filteredComponents) {
      return []
    }
    return filteredComponents.map(({id, name, description, finishingTypes, componentFamily, image: { url }, properties }) => {
      return {
        id,
        name,
        label: name,
        description,
        finishingTypes: [...finishingTypes],
        componentFamily,
        image: url,
        properties
      }
    })
  }

  const getAllowedDecoPackages = ({ design }, product) => {
    if( product && product.rules && product.rules.decoMirror ) {
      const newDecos = getComponents({ type: TYP_CAR_WALL_ADD_DECO_PACKAGE }).filter(item => {
        let test={}
        test['REGULATIONS'] = (design.regulations) ?design.regulations :[];
        test['CEILING'] = ( (design.components || []).find(item =>  item.componentType === TYP_CAR_CEILING ) || {}).component;
        test[TYP_CAR_WALL_ADD_DECO_PACKAGE] = item.id;
        return jsonLogic.apply(product.rules.decoMirror, test) && item.disabled !== false
      })
      return newDecos
    }

    return getComponents({ type: TYP_CAR_WALL_ADD_DECO_PACKAGE })
  }

  

  const getMapForMaterial = ({ id }) => {
    const found = product.materials.find(x => x.id === id)
    if (found) return found.map
  }

  const getTexture = ({ id }) => {
    return product.textures.find(x => x.id === id)
  }

  const getColorForMaterial = ({ id }) => {
    const found = product.materials.find(x => x.id === id)
    if (found && found.color) return found.color.toString(16)
  }

  const getParentForMaterial = ({ id }) => {
    const found = product.materials.find(x => x.id === id)
    if (found) return found.parent
  }

  const getComponent = ({ id }) => {
    // Done like this so a separate product can be injected for the designInformation
    return productUtils.getComponent({ id, product })
  }

  const getDefaultComponent = ({ type }) => {
    if (!product || !type) { 
      return undefined
    }
    // Find the first component that has not been disabled.
    const component = (product.components || []).find(item => !item.disabled && item.type === type)
    if (!component) {
      return undefined
    }
    const { id, name, description, finishingTypes, componentFamily, image: { url } = {} } = component;
    return {
      id,
      name,
      label: name,
      description,
      finishingTypes: [...finishingTypes],
      componentFamily,
      image: url
    }
  }

  const getComponentParts = (props) => {
    // Done like this so a separate product can be injected for the designInformation
    return productUtils.getComponentParts({...props, product})
  }
  
  const getComponentFamilies  = ({ type }) => {
    // Done like this so a separate product can be injected for the designInformation
    return productUtils.getComponentFamilies({ type, product })
  }

  const getComponentCategories  = () => {
    if (!product) {
      return []
    }
    return (product.componentCategories || []).map(({ id, name, description}) => {
      return {
        id, 
        name,
        description,
      }
    })
  }

  const getFinishes = ({ type, filteringOptions=null }) => {
    if (!product) { 
      return []
    }

    const preFilteredFinishes = (product.finishes || []).filter(item => {
      if (item.disabled === true) {
        return false;
      }
      if (Array.isArray(type)) {
        let found = false;
        type.forEach(typeItem => {
          if (item.types && item.types.indexOf(typeItem) !== -1) {
            found = true;
          }
        })
        return found
      } else {
        return item.types && item.types.indexOf(type) !== -1;
      }
    })

    let filteredFinishes
    if(filteringOptions && filteringOptions.rule) {

      if(product && product.rules && product.rules[filteringOptions.rule]) {
        let testStaticPart = filteringOptions.test || {}
        
        filteredFinishes = preFilteredFinishes.filter(item => {
          const test = {
            ...testStaticPart,
            ITEM: item.id
          }
          return jsonLogic.apply(product.rules[filteringOptions.rule], test)
        })
      }

    } else {
      filteredFinishes = preFilteredFinishes
    }
    
    if (!filteredFinishes) {
      return []
    }

    return filteredFinishes.map(({id, sapId, name, custom = false, materials = [], premium = false, categories = [], image = {}, mixed=false, finishes=null }) => {
      
      const imageToSet = image ? image.url ? image.url : image.localStorage : null
      
      return {
        id,
        sapId,
        name,
        label: name,
        premium,
        custom,
        materials: [...materials],
        categories: [...categories],
        image: imageToSet,
        mixed,
        finishes
      }
    })

  }
  
  const getFilteredFinishes = ({ type, material, design }) => {

    if(type === MAT_CAR_WALL_FINISH_B || type === MAT_CAR_WALL_FINISH_C || type === MAT_CAR_WALL_FINISH_D ) {

      let wallFinishes = null

      // for ENA products, test that option 'same finish for all walls' is not selected, if it is, get finishes for side wall
      const bWallGroup = (design.components || []).find(item => item.componentType === TYP_CAR_WALL_B).group
      const cWallGroup = ((design.components || []).find(item => item.componentType === TYP_CAR_WALL_C) || {}).group
      const dWallGroup = (design.components || []).find(item => item.componentType === TYP_CAR_WALL_D).group
      if( bWallGroup !== undefined && cWallGroup !== undefined && dWallGroup !== undefined && ( bWallGroup === cWallGroup && cWallGroup === dWallGroup)) {
        wallFinishes = getFinishes({ type:MAT_CAR_WALL_FINISH_B }).filter(item => ( (item.materials || []).indexOf(material) !== -1 && item.disabled !== false ) )
      } else {
        wallFinishes = getFinishes({ type }).filter(item => ( (item.materials || []).indexOf(material) !== -1 && item.disabled !== false ) )
      }

      if(product?.rules?.wallFinishes) {
        wallFinishes = wallFinishes.filter(item => {
          let test={}
          test['PRODUCT'] = productId;
          test['CARSHAPE'] = design?.carShape;
          test['FINISH'] = item.id;
          test['PREDESIGN'] = design?.originalSapId;
          test['WALL'] = type;
          // console.log({test})
          return jsonLogic.apply(product.rules.wallFinishes, test)

        })
      }

      if(type === MAT_CAR_WALL_FINISH_C && wallFinishes) {
        if(product?.rules?.wallFinishes) {
          const rulesAppliedToFinishes = wallFinishes.filter(item => {
            let test={}
            test['WALL_FINISH'] = item.id;
            test['DECO'] = ( (design.components || []).find(item => item.componentType === TYP_CAR_WALL_ADD_DECO_PACKAGE) || {}).component || 'none';
            // console.log({test})
            return jsonLogic.apply(product.rules.wallFinishes, test)
          })
          return rulesAppliedToFinishes
        }
        return wallFinishes
      } else {        
        return wallFinishes
      }

    }

    return getFinishes({ type })
  }

  const getFinish = ({ id }) => {
    // Done like this so a separate product can be injected for the designInformation
    return productUtils.getFinish({ id, product })
  }

  const getDefaultFinish = ({ type }) => {
    if (!product || !type) { 
      return undefined
    }
    // return first finish
    const finish = (product.finishes || []).find(item => (item.types || []).indexOf(type) !== -1)    
    if (!finish) {
      return undefined
    }
    const { id, name, materials = [], categories = [], image: { url } = {} } = finish
    return {
      id,
      name,
      label: name,
      materials: [...materials],
      categories: [...categories],      
      image: url
    }
  } 

  /**
   * Returns finish from predesign by finish type
   * @param {string} designSapId 
   * @param {string} type 
   */
  const getFinishFromDesign = (designSapId, type) => {
    if (!designSapId || !type) {
      return undefined
    }
    const design = getDesign(designSapId)
    if (!design || !design.components) {
      return undefined
    }
    const component = design.components.find(item => item.finishType === type)
    if (!component || !component.finish) {
      return undefined
    }
    return component.finish
  }
  
  const addCategoriesToFinishes = ({finishes}) => {

    if(!finishes) {
      return undefined
    }

    const finishCategories = getFinishCategories()
    let categorizedFinishes = []

    finishCategories.forEach(({ id, name }) => {
      const filteredFinishes = finishes.filter(({ categories }) => (categories || []).indexOf(id) !== -1)
      if (filteredFinishes.length) {
        categorizedFinishes.push(
          {
            name,
            label:name,
            id,
            sublabel: 'ui-general-premium',
            finishes: filteredFinishes
          }
        )

      }      
    })

    return categorizedFinishes

  }

  const getMaterials = ({ type }) => {
    if (!product) {
      return []
    }
    const filteredMaterials = (product.finishMaterials || []).filter(item => {      
      return item.types.indexOf(type) !== -1 && item.disabled !== true ;
    })
    return filteredMaterials.map(({id, name, image: { url }}) => {
      return {
        id,
        name,
        label: name,
        image: url
      }
    })
  }

  const getFilteredMaterials  = ({ type, design }) => {
    if(type === MAT_CAR_WALL_FINISH_B || type === MAT_CAR_WALL_FINISH_C || type === MAT_CAR_WALL_FINISH_D ) {
      if( product.rules.wallMaterials ) {
        const newMaterials = getMaterials({ type }).filter(item => {
          let test={}
          test['CEILING'] = ( (design.components || []).find(item => item.componentType === TYP_CAR_CEILING) || {}).component || 'none';
          test['MARKETS'] = product.businessSpecification.market || ''
          test['SCENICSELECTION'] =  product.wallEditor.scenicSelection || false
          test['WALL_MATERIAL'] = item.id;
          test['WALL'] = type;
          test['PRODUCT']= design.product;
          test['DECO'] = ( (design.components || []).find(item => item.componentType === TYP_CAR_WALL_ADD_DECO_PACKAGE) || {}).component || 'none';
          return jsonLogic.apply(product.rules.wallMaterials, test) 
        })
        return newMaterials
      }
    }

    return getMaterials({ type })
  }

  const getFinishCategories = () => {
    if (!product) {
      return []
    }
    return (product.finishCategories || []).map(({ id, name}) => {
      return {
        id, 
        name
      }
    })
  }

  const getMaterial = ({ type, finish:finishId }) => {
    if (!product) {
      return undefined
    }
    const finish = (product.finishes || []).find(item => item.id === finishId)
    if (!finish) {
      return undefined
    }
    const { materials=[] } = finish;

    const material = product.finishMaterials.find(({ id, types=[] }) => (types.indexOf(type) !== -1 && materials.indexOf(id) !== -1))
    if (material) {
      return material.id
    }
    return undefined
  }

  const getFinishTypeByComponent = (id) => {
    if (!product) {
      return undefined
    }
    const component = (product.components || []).find(item => item.sapId === id)
    if (component && component.finishingTypes && component.finishingTypes.length === 1) {
      return component.finishingTypes[0]
    } else if (component && component.finishingTypes && component.finishingTypes.length > 1) {
      return component.finishingTypes;
    }
    return undefined  
  }

  const getFinishTypeByFinish = (id) => {
    if (!product) {
      return undefined
    }
    const finish = (product.finishes || []).find(item => item.sapId === id)
    if (finish && finish.types) {
      return finish.types;
    }
    return undefined  
  }

  const getDesign = (id) => {
    if (!id || !product || !product.designs || !product.designs.length) {
      return undefined
    }
    return product.designs.find(item => item.id === id || item.sapId === id)
  }

  const getDesignBySapId = (sapId) => {
    if (!product || !product.designs || !product.designs.length) {
      return null
    }
    const result = product.designs.find(item => item.sapId === sapId) 

    if (result) {
      result.country = offeringCtx.countryCode

      return {
        ...result,
        originalSapId:sapId
      }
    }
  }

  const getTheme = (id) => {
    if (!product || !product.themes || !product.themes.length) {
      return undefined
    }
    return product.themes.find(item => item.id === id)
  }

  const getPredesigns = (product) => {
    if (!product) {
      return []
    }

    const predesigns = [
      'spritesheets/designs.png',
    ];
    
    // const predesigns = product.designs.map(item => item.image.url)
    return predesigns
  }

  const getPreloadUrls = (product) => {
    
    
    if(!product) return []

    const urls = [
      'spritesheets/components.png',
      'spritesheets/finishes.png',
    ]
    
    return urls;
  }

  const getThemes = () => {
    if (!product || !product.themes || !product.themes.length) {
      return undefined
    }
    const filteredThemes = (product.themes || []).filter(item => {
      return item.disabled !== true;
    })
    return filteredThemes.map(({id, name, description, image: { url }}) => {
      return {
        id,
        name,
        label: name,
        description,
        image: url
      }
    })

  }

   const saveCustomFinishToLocalStorage = (finish, image) => {
    let finishes = localStorage.getItem(LOCAL_STORAGE_CUSTOM_FINISHES);

    if (!finishes) {
      finishes = []
    } else {
      finishes = JSON.parse(finishes)
    }
    
    if (!Array.isArray(finishes)) {
      finishes = []
    }

    finishes.push(finish)

    if (image) {
      localStorage.setItem(IMAGE_PREFIX + finish.id, image)
    }

    localStorage.setItem(LOCAL_STORAGE_CUSTOM_FINISHES, JSON.stringify(finishes))

  }

  const getFinishesFromLocalStorage = () => {
    let finishes = localStorage.getItem(LOCAL_STORAGE_CUSTOM_FINISHES);
    if (!finishes) {
      finishes = []
    } else {
      finishes = JSON.parse(finishes)
    }    
    if (!Array.isArray(finishes)) {
      finishes = []
    }
    return finishes
  }

  const addTempFinish = (tempFinish) => {
    if (!product || ! product.finishes) {
      return
    }
    product.finishes.push(tempFinish)
    product.finishIndexesById[tempFinish.id] = product.finishes.length - 1
  }

  const addTempMaterial = (tempMaterial) => {
    if (!product || ! product.materials) {
      return
    }
    product.materials.push(tempMaterial)
  }

  const addTempTexture = (tempTexture) => {
    if (!product || ! product.textures) {
      return
    }
    product.textures.push(tempTexture)
  }
  
  const saveMixedFinish = async ({ finish, materials }, callback) => {
    const id = uniqid()

    finish = {
      materials: [],
      types: [],
      categories: [],
      custom: true,
      mixed: true,
      ...finish,
      id, // override orginal id
    }

    materials = materials.map((material, index) => {
      return {
        ...material,
        category: MATERIAL_CATEGORY_MASTER,
        id: id + `-${index + 1}`, // override id 
        finish: id, // override finish
      }
    })

    const finishToSave = {
      id,      
      finish,
      materials,
    }

    let savedFinish

    try {

      // Logged in --> save to database
      // else save locally
      if (loggedInUser) {
        const result = await api.post('/customFinish/create', 
          { finish: finishToSave }, 
          { requireAuth: true })
          
        savedFinish = result[0]
      } else {
        let finishes = getFinishesFromLocalStorage()
        finishes.push(finishToSave)
        localStorage.setItem(LOCAL_STORAGE_CUSTOM_FINISHES, JSON.stringify(finishes))

        savedFinish = finishToSave
      }
    } catch (err) {
      callback && callback(err, null)
      return
    }

    setCustomFinishes(prevState => {
      if (prevState) return [...prevState, savedFinish]
      return [savedFinish]
    })

    product.finishes = [
      ...product.finishes,
      savedFinish.finish,
    ]

    product.materials = [
      ...product.materials,
      ...savedFinish.materials
    ]

    updateIndexes(product)

    return callback(null, savedFinish.id)
  }

  async function clearLocalCustomFinishes() {
    const localFinishes = getCustomFinishesFromLocalStorage()
    if (!localFinishes) return

    localFinishes.forEach(item => {
      if (item.finish.mixed) return // Skip mixed finishes
      if (item.finish.image) {
        localStorage.removeItem(item.finish.image.localStorage)
      }
    })

    localStorage.setItem(LOCAL_STORAGE_CUSTOM_FINISHES, '[]')
  }

  async function saveLocalFinishesToDB() {
    const localFinishes = getCustomFinishesFromLocalStorage()

    if (!localFinishes || localFinishes.length === 0) return

    const finishesToSave = localFinishes
      .map(item => {
      if (item.finish.mixed) {
        return { finish: item }
      }

      if (item.finish.color) {
        return { finish: item }
      }

      const imageData = localStorage.getItem(item.finish.image.localStorage)
      return { finish: item, imageData }    
    })

    const savedFinishes = await api.post('/customFinish/create', 
      finishesToSave, 
      { requireAuth: true })
    // If save succesful, clear the local storage values.
    clearLocalCustomFinishes()

    return savedFinishes
  }

  const saveCustomFinish = async ({ 
    name, 
    material, 
    color,
    parent,
    copyOf,
    texture: initTexture = {} 
  }, overrides = {}) => {
    const { image, ...texture } = initTexture
    const { 
      types = [], 
      group,
      image: imageOverride,
      name: nameOverride,
      map,
      texture: textureOverride
    } = overrides

    const id = uniqid()

    const finish = {
      id,
      name: nameOverride || name,
      custom: true,
      image: imageOverride ? imageOverride : image && { localStorage: IMAGE_PREFIX + id },
      materials: [ material ],
      types,
      group,
      categories: [],
    }

    const mat = {
      id,
      category: MATERIAL_CATEGORY_MASTER,
      finish: id,
    }

    // setting to null or undefined when no value does not seem to work
    // so separately setting the map and color only when needed
    if (color) {
      mat.color = color
      finish.color = color // Used mainly for landing thumbnail
    }

    if (parent) {
      mat.parent = parent
    }

    if (copyOf) {
      mat.copyOf = copyOf
    }

    if (map || image) {
      mat.map = map || id
    }

    const materials = [mat]

    const textures = textureOverride ? [textureOverride] : texture ? [{
      id,
      type: TEXTURE_TYPE_TEXTURE,
      ...texture,
      file: image && { localStorage: IMAGE_PREFIX + id },
    }] : []

    const finishToSave = {
      id,      
      finish,
      materials,
      textures,
    }

    let savedFinish
    
    // Logged in
    if (loggedInUser) {
      // Responds with array of saved finishes
      const result = await api.post('/customFinish/create', 
      { finish: finishToSave, imageData: image },
      { requireAuth: true })

      savedFinish = result[0]
    } else {
      saveCustomFinishToLocalStorage(finishToSave, image)
      
      savedFinish = finishToSave
    }

    product.finishes = [
      ...product.finishes,
      savedFinish.finish,
    ]

    product.materials = [
      ...product.materials,
      ...savedFinish.materials,
    ]

    product.textures = [
      ...product.textures,
      ...savedFinish.textures,
    ]

    setCustomFinishes((prevState) => {
      if (prevState) return [...prevState, savedFinish]
      return [savedFinish]
    })

    updateIndexes(product)

    return savedFinish.id
  }

  /**
   * @returns {Object[]} - Array of locally stored finishes
   */
  function getCustomFinishesFromLocalStorage() {
    const finishes = localStorage.getItem(LOCAL_STORAGE_CUSTOM_FINISHES);

    if (!finishes) {
      return []
    } 
      
    const result = JSON.parse(finishes)
    
    if (!Array.isArray(result)) {
      return []
    }
    
    return result
  }

  // Async so it always returns a Promise
  const loadCustomFinishes = async () => {
    const allFinishes = []
    // Logged in
    if (loggedInUser) {
      const dbFinishes = await api.get('/customFinish/owned', { requireAuth: true })
      if (dbFinishes) {
        allFinishes.push(...dbFinishes)
      }
    }
    const localFinishes = getCustomFinishesFromLocalStorage()
    if (localFinishes) {
      allFinishes.push(...localFinishes)
    }

    return allFinishes
  }

  function createLandingGroups(finishes) {
    if (!finishes) return []
    const groups = {}
    finishes
      .forEach(finish => {
        if (finish && !finish.disabled && finish.group && !finish.group.disabled && finish.group.type === LANDING_FINISH_GROUP) {
          if (!groups[finish.group.id]) {
            groups[finish.group.id] = {
              finishes: 1
            }
          } else {
            groups[finish.group.id].finishes = groups[finish.group.id].finishes + 1
          }
          
          const isCeilingFinish = finish.types.includes(MAT_LANDING_CEILING)
          if (isCeilingFinish) {
            groups[finish.group.id] = {
              ...groups[finish.group.id],
              ...finish.group,
              // Assuming that all the finishes in one group share
              // the same image and custom group state with the ceiling in use 
              // which they should do. As the ceiling never changes (for now), 
              // it can be used as the base for now
              // TODO: Fix if the landing ceilings ever need to change 
              image: finish.image && finish.image.url,
              custom: finish.custom,
              shared: finish.shared
            }
          }
        }
      })

      // Only landing groups with exactly 3 finishes are valid.
      // (A group can have less than 3 finishes if the group itself has been
      // deleted but some of the finishes are still in use as parents of other 
      // finishes) 
      const groupsArray = Object.values(groups).filter(group => {
        return group.finishes === 3
      })

      return groupsArray
  }

  function getLandingFinishGroups() {
    if (!product || !product.finishes) return []
    // As the groups data comes from the product, but the product in memory is 
    // not updated when custom finishes are deleted, the actual
    // groups should be the original groups with custom groups from the 
    // customFinishes state (which is updated).
    // TODO refactor if time
    const allGroups = createLandingGroups(product.finishes)

    const originalGroups = allGroups.filter(x => !x.custom)
    const customGroups = createLandingGroups((customFinishes || [])
      .map(x => ({...x.finish, shared: x.shared})))

    return [...originalGroups, ...customGroups]
  }

  function getGroupForFinish({ id }) {
    if (!product || !product.finishes) return
    const found = product.finishes.find(x => x.id === id)
    if (found) {
      return found.group
    }
  }

  /**
   * Gets all the finishes for a groupType
   * @param {Object} param 
   * @param {Object} param.groupType 
   */
  function getAllFinishesForGroup({ groupType }) {
    if (!product || !product.finishes) return
    return product.finishes.filter(finish => finish.group && !finish.group.disabled && finish.group.type === groupType)
  }

  /**
   * Gets all the finishes for a group with type of groupType and id of groupId
   */
  function getGroupFinishes({ groupId, groupType }) {
    if (!product || !product.finishes) return []
    return product.finishes.filter(finish => finish.group && !finish.group.disabled && finish.group.type === groupType && finish.group.id === groupId)
  }

  const isCustomFinish = (finish) => {
    return product && product.finishes && product.finishes.find(item => item.custom && item.id === finish) !== undefined
  }
  
  const removeCustomFinishesForGroup = async ({ groupType, groupId }) => {
    if (!customFinishes) return
    const itemsToRemove = []
    const parentIds = []

    const remainingCustomFinishes = customFinishes.filter(item => {
      const { finish, materials } = item
      if (!finish.group) return true
      if (finish.group.type !== groupType) return true
      if (finish.group.id !== groupId) return true

      const found = customFinishes.find(x => x.materials[0].copyOf === finish.id)

      // Don't remove an item that is the base of another
      if (found) {
        return true
      }

      if (materials[0].copyOf) { 
        // Make note of the possible parent elements of the finish that will be 
        // deleted so the parents can be checked separately
        parentIds.push(materials[0].copyOf)
      }

      itemsToRemove.push(finish)
      return false
    })

    // Check if the parents of the finishes that will be deleted have other
    // children. If not, they can be deleted as well
    parentIds.forEach(id => {
      const found = remainingCustomFinishes.find(x => x.materials[0].copyOf === id)

      if (found) {
        return
      } else {
        const parent = remainingCustomFinishes.find(x => x.finish.id === id)

        if (parent) {
          const validGroups = getLandingFinishGroups()

          const foundGroup = validGroups.find(x => x.id === (parent.finish && parent.finish.group && parent.finish.group.id))

          // Only delete the parent if it is not still in use in its own group
          if (!foundGroup) {
            itemsToRemove.push(parent.finish)
          }
        }
      }
    })

    try {
      itemsToRemove.forEach(({ id }) => {
        removeCustomFinish(id, (err) => {
          if (err) {
            throw err
          }
        })
      })

    } catch (err) {
      console.error('Landing finish could not be deleted:', err)
    }
  }

  const removeCustomFinish = async (id, callback) => {
    // Logged in
    if (loggedInUser) {
      try {
        await api.delete(`/customFinish/${id}`, { requireAuth: true })
        setCustomFinishes(prevState => {
          return prevState.filter(x => x.id !== id)
        })
        callback && callback(null)
      } catch (err) {
        callback && callback(err)
      }
      return
    }

    let finishes = localStorage.getItem(LOCAL_STORAGE_CUSTOM_FINISHES);

    if (!finishes) {
      finishes = []
    } else {
      finishes = JSON.parse(finishes)
    }

    if (!Array.isArray(finishes)) {
      finishes = []
    }

    const removedItem = finishes.find(item => item.id === id) 
    
    finishes = finishes.filter(item => item.id !== id)
    
    try {
      localStorage.setItem(LOCAL_STORAGE_CUSTOM_FINISHES, JSON.stringify(finishes)); 
      localStorage.removeItem(IMAGE_PREFIX + id) // remove stored image

      setCustomFinishes(prevState => {
        return prevState.filter(x => x.id !== id)
      })

    } catch (e) {
      callback && callback(e, null)
      return;
    }

    callback && callback(null, removedItem)
  }
  
  return (
    <ProductContext.Provider value={{
      productId, setProductId, releaseId, setReleaseId, loadProductWithId, productKTOCDestCountry, swapProductToOfferingLocation,
      product, loading, error, setError,
      getComponents, getAllowedDecoPackages,
      getMaterials, getFilteredMaterials, 
      getFinishes, getFilteredFinishes, addCategoriesToFinishes,
      getFinishCategories, getMaterial,
      getFinishTypeByComponent, getFinishTypeByFinish,
      getComponent, getFinish, getDefaultComponent, getDefaultFinish, getComponentParts,
      getComponentCategories, getComponentFamilies,
      getDesign, getDesignBySapId, getTheme, getThemes, getPredesigns, getPreloadUrls, setProduct,
      saveCustomFinish, saveMixedFinish, getCustomFinishesFromLocalStorage, isCustomFinish, removeCustomFinish, customFinishes,
      addTempFinish, addTempMaterial, addTempTexture, getFinishFromDesign,
      getGroupFinishes, getLandingFinishGroups, getGroupForFinish, removeCustomFinishesForGroup, getParentForMaterial, getColorForMaterial, getMapForMaterial, getTexture, fullProductDefinition
    }}>
      {children}
    </ProductContext.Provider>
  )
}
export default ProductProvider;

export const ProductConsumer = ProductContext.Consumer;