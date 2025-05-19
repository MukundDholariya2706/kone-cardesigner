import { 
  TYP_CAR_WALL_ADD_DECO_PACKAGE, TYP_CAR_CEILING,
  MAT_CAR_CEILING, TYP_DOOR_A, MAT_CDO_PANEL, MAT_LDO_FRAME, TYP_COP_PRODUCT_1, 
  TYP_HL_PRODUCT, TYP_LCS_PRODUCT, TYP_CAR_HANDRAIL, MAT_CAR_HANDRAIL, TYP_CAR_SKIRTING, MAT_CAR_SKIRTING, TYP_LDO_FRAME_FRONT,
  TYP_CAR_MIRROR, TYP_CAR_BUFFER_RAIL, MAT_CAR_BUFFER_RAIL, TYP_CAR_TENANT_DIRECTORY, MAT_CAR_TENANT_DIRECTORY, MAT_CAR_MEDIASCREEN,
  TYP_CAR_SEAT, MAT_CAR_SEAT, TYP_COP_2, TYP_CAR_INFOSCREEN, TYP_CAR_MEDIASCREEN, TYP_DOP_PRODUCT, TYP_DIN_PRODUCT, TYP_EID_PRODUCT, COL_CAR_CEILING_LIGHT,
  TYP_CAR_WALL_B, TYP_CAR_WALL_C, TYP_CAR_WALL_D, TYP_CAR_FRONT_WALL_A, TYP_CAR_FLOORING, TYP_FB, TYP_COP_DISPLAY, MIDDLE_BETWEEN_DOORS, TYP_CAR_GLASS_WALL_C, CAR_TYPE_TTC, CAR_TYPE_GLASS_BACKWALL, CAR_TYPE_TTC_ENA, TYP_HI_PRODUCT, CAR_SHAPES 
} from '../constants'

import { isTrueTypeCar } from './design-utils'

import * as productUtils from '../store/product/product-utils';
import { createServiceReadMoreUrlGetter } from './product-utils'

const { getDefinitions } = productUtils

const ANGLE_FRONT_IMAGE = 'angleFront'
const ANGLE_FRONT_OPPOSITE_IMAGE = 'angleFrontOpposite'
const ANGLE_BACK_IMAGE = 'angleBack'
const ANGLE_BACK_OPPOSITE_IMAGE = 'angleBackOpposite'

export function getDesignInformation({designStore, productStore, offeringStore }) {
  
  if(!designStore || !designStore.design || !productStore || !productStore.product || !offeringStore) {    
    return undefined
  }

  // console.log('Do design info: ', designStore.design)

  const product = productStore.fullProductDefinition?.current || productStore.product
  const getReadMoreUrl = createServiceReadMoreUrlGetter(productStore.product)

  // Redefine the needed functions from productStore with the product injected
  const productData = {
    product,
    getComponent: (args) => productUtils.getComponent({ ...args, product }),
    getFinish: (args) => productUtils.getFinish({ ...args, product }),
    getComponentParts: (args) => productUtils.getComponentParts({ ...args, product }),
    getComponentFamilies: (args) => productUtils.getComponentFamilies({ ...args, product }),
  }

  const currentProduct = (offeringStore.offering || []).find(item => item.id === productStore.productId)
  const currentTheme = productStore.getTheme(designStore.design.theme);

  const definitions = getDefinitions([TYP_CAR_FLOORING, TYP_CAR_FRONT_WALL_A, TYP_CAR_WALL_B, TYP_CAR_WALL_C, TYP_CAR_GLASS_WALL_C, TYP_CAR_WALL_D], designStore, productData)

  const getFinishImages = (type) => {
    if (definitions && definitions[type] && definitions[type].finishes && definitions[type].finishes.length) {
      const result = definitions[type].finishes.map(item => item.image)
      return result
    }
    return []
  }

/*   const getFinishPdfImages = (type) => {
    if (definitions && definitions[type] && definitions[type].finishes && definitions[type].finishes.length === 1) {
      const finish = definitions[type].finishes[0]
      return finish.custom ? finish.image : ( finish.sapId ? `pdf-thumbnails/${finish.sapId}.png` : undefined )
      
    }
    return null
  } */

  const getFinishPdfImages = (type) => {
    if (definitions && definitions[type] && definitions[type].finishes && definitions[type].finishes.length) {
      return definitions[type].finishes.map(item => {
        let pdfImage
        if(!item.custom && item.image && item.image.indexOf('data:image') === -1 ) {
          let tmp = item.image.split('/')
          if(tmp[1]) {
            let tmp2 = tmp[1].split('.')
            pdfImage = tmp2[0]
          }
        }
        const result = (item.custom || (item.image && item.image.indexOf('data:image') !== -1) ) ? item.image : ( item.sapId ? `pdf-thumbnails/${pdfImage}.png` : undefined )
        
        return result
      })
    }
    return []
  }

  const getFinishNames = (type) => {
    if (definitions && definitions[type] && definitions[type].finishes && definitions[type].finishes.length) {
      const result = definitions[type].finishes.map(item => item.name)
      return result
    }
    return []
  }

  const getFinishSapIds = (type) => {
    if (definitions && definitions[type] && definitions[type].finishes && definitions[type].finishes.length) {
      return definitions[type].finishes.map(item => item.sapId)
    }
    return []
  }

  const getFinishMaterials = (type) => {
    if (definitions && definitions[type] && definitions[type].materials && definitions[type].materials.length) {
      const result = definitions[type].materials.map(item => item ? { name: item.name, id: item.id } : undefined)
      return result
    }
    return []
  }

  const getFinishCategoryNames = (type) => {
    if (definitions?.[type]?.categories && definitions[type].categories.length) {
      return definitions[type].categories.map(item => item ? item.name : undefined).filter(x => x)
    }
    return []
  }

  const isMixedFinish = (type) => {
    if (definitions && definitions[type] && definitions[type].finishes && definitions[type].finishes.length > 1) {
      return true
    }
    return false
  }

  const isFinishPremium = (type) => {
    if (definitions && definitions[type] && definitions[type].finishes && definitions[type].finishes.length > 0) {
      return (definitions[type].finishes.findIndex(item => item.premium) !== -1)
    }
    return false
  }

  const getFactsByRelease = (facts, releaseId) => {
    if (!facts) return null
    
    let found
    if (facts.constructor === Array) {
      found = facts.find(x => x.id === releaseId) || facts[0]    
    } else {
      found = JSON.parse(JSON.stringify(facts))
    }

    return found
  }

  const getItemDefinitionComponentsData = (reference, itemId) => {
    if (!reference || !itemId) return {}
    
    return (reference.find(item => item.id === itemId) || {})

  }
/*   const addImageSize = async (image) => {

    if(!image) return null

    // const size =  await findImageSize(image)
    let img = new Image()
    img.src = image
    await img.decode()

    const size= [img.height, img.width]

    console.log('->',size)
    return img.height

  } */

  const viewImages = getViewImages(designStore.designImages)

  const decoPack = (productData.getComponent({id: designStore.getComponent({type:TYP_CAR_WALL_ADD_DECO_PACKAGE}) }) || {});
  const scenicPositions = ( designStore.getPositions({type:TYP_CAR_GLASS_WALL_C}) || null);
  const scenicType = (productData.getComponent({id: designStore.getComponent({type:TYP_CAR_GLASS_WALL_C}) }) || null);

  const wallBIsScenic = (scenicType && scenicPositions && ( scenicPositions.includes('B1') || scenicPositions.includes('B2') ))
  const wallDIsScenic = (scenicType && scenicPositions && ( scenicPositions.includes('D1') || scenicPositions.includes('D2') ))
  const wallCIsScenic = (scenicType && ( !scenicPositions || scenicPositions.includes('C') ))

  const ceiling = (productData.getComponent({id: designStore.getComponent({type:TYP_CAR_CEILING}) }) || {});
  const ceilingFinish = (productData.getFinish({id: designStore.getFinish({type:MAT_CAR_CEILING}) }) || {});
  let ceilingLight = null;
  const componentParts = productData.getComponentParts({id:ceiling.id});
  if(componentParts && componentParts.find(item => (item.type === COL_CAR_CEILING_LIGHT))) {
    ceilingLight = (productData.getFinish({id: designStore.getPartFinish({ type: COL_CAR_CEILING_LIGHT }) }) || {}).name; 
  }

  const door = (productData.getComponent({id: designStore.getComponent({type:TYP_DOOR_A}) }) || {});
  const doorFinish = (productData.getFinish({id: designStore.getFinish({type:MAT_CDO_PANEL}) }) || {});
  const frame = (productData.getComponent({id: designStore.getComponent({type:TYP_LDO_FRAME_FRONT}) }) || {});
  const frameFinish = (productData.getFinish({id: designStore.getFinish({type:MAT_LDO_FRAME}) }) || {});

  const cop = (productData.getComponent({id: designStore.getComponent({type:TYP_COP_PRODUCT_1}) }) || {});
  const copPositions = (designStore.getPositions({type:TYP_COP_PRODUCT_1}) || []).concat( (designStore.getPositions({type:TYP_COP_2}) || []) )
  const copFamily =  (productData.product.componentFamilies.find(item => item.id === cop.componentFamily) || {})
  const copFinish = (productData.getFinish({id: designStore.getFinish({type: designStore.getComponentFinishType({type: TYP_COP_PRODUCT_1}) }) }) || {});
  let copFinishSapId = copFinish.sapId
  if(copFinishSapId && copFinishSapId.indexOf('MAT_D_') !== -1) {
    copFinishSapId = copFinishSapId.substr(6,copFinishSapId.length)
  }
  const copImage = (cop.imagesByFinish || {})[copFinish.id] || viewImages?.copImage?.data
  const copComponentItem = (((designStore || {}).design || {}).components || []).find(item => item.componentType === TYP_COP_PRODUCT_1)
  let copDisplay = null
  if(copComponentItem && copComponentItem.parts) {
    const displayPart = copComponentItem.parts.find(item => item.componentType === TYP_COP_DISPLAY)
    if(displayPart) {
      const display = productData.getComponent({id: displayPart.component})
      const color = productData.getFinish({id: displayPart.finish})

      if(display && color) {
        copDisplay = ['ui-cop-display-type',display.name,color.name]
      }
    }
  }

  const horCop = (productData.getComponent({id: designStore.getComponent({type: designStore.horizontalCopType()}) }) || {})
  const horCopFinish = (productData.getFinish({id: designStore.getComponentFinish({type: designStore.horizontalCopType()}) }) || {});
  const horCopImage = (horCop.imagesByFinish || {})[horCopFinish.id] || viewImages?.horizontalImage?.data

  const copFamilyItem = getItemDefinitionComponentsData(product?.componentsData?.signalization?.copModels, copFamily.id)

  // const copHI = (productData.getComponent({id: designStore.getComponent({type:TYP_HI_PRODUCT}) }) || {});
  const copHI = (getItemDefinitionComponentsData(copFamilyItem?.realHallIndicators, designStore.getComponent({ type: TYP_HI_PRODUCT })) || {})
  const copHIFinish = (productData.getFinish({id: designStore.getComponentFinish({type: TYP_HI_PRODUCT}) }) || {});
  let copHIFinishSapId = copHIFinish.sapId
  if(copHIFinishSapId && copHIFinishSapId.indexOf('MAT_D_') !== -1) {
    copHIFinishSapId = copHIFinishSapId.substr(6,copHIFinishSapId.length)
  }
  let copHIImage;
  let copHIWidth = copHI.id === 'HL_KDS660' ?'8px' :'50px'
  if(copHI.imagesByFinish) {
    if(typeof copHI.imagesByFinish[copHIFinish.id] === 'string') {
      copHIImage = copHI.imagesByFinish[copHIFinish.id]
    } else {
      const hiPositions = designStore.getPositions({type:TYP_HI_PRODUCT})
      if(hiPositions) {
        if(hiPositions.join('').indexOf('TOP_CENTER') !== -1) {
          copHIImage =
            copHI.imagesByFinish[copHIFinish.id] &&
            copHI.imagesByFinish[copHIFinish.id].horizontal
              ? copHI.imagesByFinish[copHIFinish.id].horizontal
              : null

          copHIWidth = '100%'
        } else {
          copHIImage = 
            copHI.imagesByFinish[copHIFinish.id] && 
            copHI.imagesByFinish[copHIFinish.id].vertical 
              ? copHI.imagesByFinish[copHIFinish.id].vertical 
              : null
        }

      }
    }
  } else {
    copHIImage =  viewImages?.hiImage?.data
  }

  // const copHL = (productData.getComponent({id: designStore.getComponent({type:TYP_HL_PRODUCT}) }) || {});
  const copHL = (getItemDefinitionComponentsData(copFamilyItem?.hallIndicators, designStore.getComponent({ type: TYP_HL_PRODUCT })) || {});
  const copHLFinish = (productData.getFinish({id: designStore.getComponentFinish({type: TYP_HL_PRODUCT}) }) || {});
  let copHLFinishSapId = copHLFinish.sapId
  if(copHLFinishSapId && copHLFinishSapId.indexOf('MAT_D_') !== -1) {
    copHLFinishSapId = copHLFinishSapId.substr(6,copHLFinishSapId.length)
  }
  let copHLImage;
  let copHLWidth = copHL.id === 'HL_KDS660' ?'8px' :'50px'
  if(copHL.imagesByFinish) {
    if(typeof copHL.imagesByFinish[copHLFinish.id] === 'string') {
      copHLImage = copHL.imagesByFinish[copHLFinish.id]
    } else {
      const hlPositions = designStore.getPositions({type:TYP_HL_PRODUCT})
      if(hlPositions) {
        if(hlPositions.join('').indexOf('TOP_CENTER') !== -1) {
          copHLImage =
            copHL.imagesByFinish[copHLFinish.id] &&
            copHL.imagesByFinish[copHLFinish.id].horizontal
              ? copHL.imagesByFinish[copHLFinish.id].horizontal
              : null

          copHLWidth = '100%'
        } else {
          copHLImage = 
            copHL.imagesByFinish[copHLFinish.id] && 
            copHL.imagesByFinish[copHLFinish.id].vertical 
              ? copHL.imagesByFinish[copHLFinish.id].vertical 
              : null
        }

      }
    }
  } else {
    copHLImage =  viewImages?.hlImage?.data
  }

  // const copLCS = (productData.getComponent({id: designStore.getComponent({type: TYP_LCS_PRODUCT}) }) || {});
  const copLCS = (getItemDefinitionComponentsData(copFamilyItem?.callStationTypes, designStore.getComponent({ type: TYP_LCS_PRODUCT })) || {});
  const copLCSFinish = (productData.getFinish({id: designStore.getComponentFinish({type: TYP_LCS_PRODUCT}) }) || {});
  let copLCSFinishSapId = copLCSFinish.sapId
  if(copLCSFinishSapId && copLCSFinishSapId.indexOf('MAT_D_') !== -1) {
    copLCSFinishSapId = copLCSFinishSapId.substr(6,copLCSFinishSapId.length)
  }
  const copLCSImage = (copLCS.imagesByFinish || {})[copLCSFinish.id] || viewImages?.lcsImage?.data
  const copLCSComponentItem = (((designStore || {}).design || {}).components || []).find(item => item.componentType === TYP_LCS_PRODUCT)
  const copLCSShared = (copLCSComponentItem && copLCSComponentItem.positions && copLCSComponentItem.positions.indexOf(MIDDLE_BETWEEN_DOORS) !== -1) ?true :false
  
  const fb = (productData.getComponent({id: designStore.getComponent({type: TYP_FB}) }) || {});
  const fbImage = (fb && designStore.getFinish({type: designStore.getComponentFinishType({type: TYP_FB}) })) ?((fb.imagesByFinish || {})[designStore.getFinish({type: designStore.getComponentFinishType({type: TYP_FB}) })] || viewImages?.fbImage?.data) :null

  const dop = productData.getComponent({ id: designStore.getComponent({ type: TYP_DOP_PRODUCT }) }) || {};
  const copDOPFinish = (productData.getFinish({id: designStore.getFinish({type: designStore.getComponentFinishType({type: TYP_DOP_PRODUCT}) }) }) || {});
  let copDOPFinishSapId = copDOPFinish.sapId
  if(copDOPFinishSapId && copDOPFinishSapId.indexOf('MAT_D_') !== -1) {
    copDOPFinishSapId = copDOPFinishSapId.substr(6,copDOPFinishSapId.length)
  }
  const copDopImage = (dop.imagesByFinish || {})[copFinish.id] || viewImages?.dopImage?.data
  const copDopComponentItem = (((designStore || {}).design || {}).components || []).find(item => item.componentType === TYP_DOP_PRODUCT)
  const copDopShared = (copDopComponentItem && copDopComponentItem.positions && copDopComponentItem.positions.indexOf(MIDDLE_BETWEEN_DOORS) !== -1) ?true :false

  const din = productData.getComponent({ id: designStore.getComponent({ type: TYP_DIN_PRODUCT }) }) || {};
  const copDINFinish = (productData.getFinish({id: designStore.getFinish({type: designStore.getComponentFinishType({type: TYP_DIN_PRODUCT}) }) }) || {});
  let copDINFinishSapId = copDINFinish.sapId
  if(copDINFinishSapId && copDINFinishSapId.indexOf('MAT_D_') !== -1) {
    copDINFinishSapId = copDINFinishSapId.substr(6,copDINFinishSapId.length)
  }
  const copDinImage = (din.imagesByFinish || {})[copFinish.id] || viewImages?.dinImage?.data
  const eid = productData.getComponent({ id: designStore.getComponent({ type: TYP_EID_PRODUCT }) }) || {};  
  const copEIDFinish = (productData.getFinish({id: designStore.getFinish({type: designStore.getComponentFinishType({type: TYP_EID_PRODUCT}) }) }) || {});
  let copEIDFinishSapId = copEIDFinish.sapId
  if(copEIDFinishSapId && copEIDFinishSapId.indexOf('MAT_D_') !== -1) {
    copEIDFinishSapId = copEIDFinishSapId.substr(6,copEIDFinishSapId.length)
  }
  const copEidImage = (eid.imagesByFinish || {})[copFinish.id] || viewImages?.eidImage?.data

  const handrail = (productData.getComponent({id: designStore.getComponent({type:TYP_CAR_HANDRAIL}) }) || {});
  const handrailFinish = (productData.getFinish({id: designStore.getFinish({type:MAT_CAR_HANDRAIL}) }) || {});
  const handrailImage = (handrail.imagesByFinish || {})[handrailFinish.id] || handrail.image
  let handrailPositions=null
  if(handrail && designStore.getPositions({type:TYP_CAR_HANDRAIL}) && designStore.getPositions({type:TYP_CAR_HANDRAIL}).length>0) {
    const positions = designStore.getPositions({type:TYP_CAR_HANDRAIL})
    handrailPositions = positions.map(position => {
      if(position === 'D') { return  'pdf-wall-d'}
      if(position === 'C') { return  'pdf-wall-c'}
      if(position === 'B') { return  'pdf-wall-b'}
      return null
    })
    // handrailPositionsStr = handrailPositions.join(', ')
  }

  const mirror = (productData.getComponent({id: designStore.getComponent({type:TYP_CAR_MIRROR}) }) || {});
  let mirrorPositions=[]
  if(mirror && designStore.getPositions({type:TYP_CAR_MIRROR})) {
    const positions = designStore.getPositions({type:TYP_CAR_MIRROR})
    mirrorPositions = positions.map(position => {
      if(position === 'D') { return  'pdf-wall-d'}
      if(position === 'C') { return  'pdf-wall-c'}
      if(position === 'B') { return  'pdf-wall-b'}
      return null
    })
    // mirrorPositionsStr = mirrorPositions.join(', ')
  }

  const buffer = (productData.getComponent({id: designStore.getComponent({type:TYP_CAR_BUFFER_RAIL}) }) || {});
  const bufferFinish = (productData.getFinish({id: designStore.getFinish({type:MAT_CAR_BUFFER_RAIL}) }) || {});
  let bufferPositions=[]
  if(buffer && designStore.getPositions({type:TYP_CAR_BUFFER_RAIL})) {
    const positions = designStore.getPositions({type:TYP_CAR_BUFFER_RAIL})
    bufferPositions = positions.map(position => {
      if(position === 'D') { return  'pdf-wall-d'}
      if(position === 'C') { return  'pdf-wall-c'}
      if(position === 'B') { return  'pdf-wall-b'}
      return null
    })
    ;
    // bufferPositionsStr = bufferPositions.filter(item => item !== null).join(', ')
  }
  const skirting = (productData.getComponent({id: designStore.getComponent({type:TYP_CAR_SKIRTING}) }) || {});
  const skirtingFinish = (productData.getFinish({id: designStore.getFinish({type:MAT_CAR_SKIRTING}) }) || {});

  const tenant = (productData.getComponent({id: designStore.getComponent({type:TYP_CAR_TENANT_DIRECTORY}) }) || {});
  const tenantFinish = tenant.properties ?tenant.properties.finishes.find(item => item.id === designStore.getFinish({type:MAT_CAR_TENANT_DIRECTORY})) :{}
  // const tenantFinish = (productData.getFinish({id: designStore.getFinish({type:MAT_CAR_TENANT_DIRECTORY}) }) || {});

  let infoScreen;
  let infoSceenPositions;
  if(designStore.getComponent({type:TYP_CAR_INFOSCREEN})) {
    infoScreen = (productData.getComponent({id: designStore.getComponent({type:TYP_CAR_INFOSCREEN}) }) || {});
    infoSceenPositions = designStore.getPositions({type:TYP_CAR_INFOSCREEN}) || []
  } else {
    infoScreen = (productData.getComponent({id: designStore.getComponent({type:TYP_CAR_MEDIASCREEN}) }) || {});
    infoSceenPositions = designStore.getPositions({type:TYP_CAR_MEDIASCREEN}) || []
  }
  const infoScreenFinish = ( productData.getFinish({id: designStore.getFinish({type:MAT_CAR_MEDIASCREEN}) }) || {} )

  const seat = (productData.getComponent({id: designStore.getComponent({type:TYP_CAR_SEAT}) }) || {});
  const seatFinish = (productData.getFinish({id: designStore.getFinish({type:MAT_CAR_SEAT}) }) || {});
  
  let shapeStr = ''
  const shapeInfo = CAR_SHAPES.find(item => item.id === designStore.design?.carShape) || null
  if(!shapeInfo) {
    shapeStr = `ui-layout-size-${designStore.design?.carShape}`.toLowerCase()
  } else {
    if(designStore?.design?.customDesignDimensions) {
      if( shapeInfo.displayDepth === designStore.design.customDesignDimensions.depth && shapeInfo.displayWidth === designStore.design.customDesignDimensions.width ) {
        shapeStr = `ui-layout-size-${designStore.design?.carShape}`.toLowerCase()
      } else {
        shapeStr = `${designStore.design.customDesignDimensions.width} ${designStore.design.customDesignDimensions.unit} x ${designStore.design.customDesignDimensions.depth} ${designStore.design.customDesignDimensions.unit}`
      }
    } else {
      shapeStr = `ui-layout-size-${designStore.design?.carShape}`.toLowerCase()
    }
  }
  // console.log(designStore.design.customDesignDimensions)
  let typeStr = 'ui-layout-type-single-entrance'
  if((designStore.design || {}).carType === CAR_TYPE_GLASS_BACKWALL) {
    typeStr = 'ui-layout-type-single-entrance-glass-back-wall'
  } else if( (designStore.design || {}).carType === CAR_TYPE_TTC) {
    typeStr = 'ui-layout-type-ttc'
  } else if( (designStore.design || {}).carType === CAR_TYPE_TTC_ENA) {
    typeStr = 'ui-layout-type-ttc-ena'
  }

  let orientationStr = 'ui-general-vertical'
  if((designStore.design || {}).panelOrientation === 'HOR') {
    orientationStr = 'ui-general-horizontal'
  }

  let regulations = (designStore.design && designStore.design.regulations && designStore.design.regulations.length>0) ?designStore.design.regulations :null
  if(regulations) {
    regulations = regulations.map(item=> {
      return item
    })
  }
  // const regulationsStr = (regulations || []).join(', ')
  // console.log({definitions})
  const productFacts = [] // product facts defined as an object per product. Placed inside an array for pdf compatibility

  const releaseProductFacts = getFactsByRelease(productData.product.productfacts, productData.product.productRelease)
  if (releaseProductFacts) {
    productFacts.push(releaseProductFacts)
  }

  let cWallPanelingException = false
  if (designStore.design?.components) {
    const cWall = designStore.design.components.find(x => x.componentType === TYP_CAR_WALL_C)
    
    cWallPanelingException = cWall?.treatAsTwo
  }

  let digitalServicesUrls = {}
  if(designStore?.design?.services?.length>0) {
    designStore.design.services.forEach(service => {
      const dUrl = getReadMoreUrl(service)
      if(dUrl) {
        digitalServicesUrls[service] = dUrl
      }
    })
  }
  
  // pdf image definitions
  const cop1PositionsAsString = designStore.getPositions({type:TYP_COP_PRODUCT_1}).join('')
  const frontPageImage = cop1PositionsAsString.indexOf('D') !== -1 ?ANGLE_FRONT_OPPOSITE_IMAGE :ANGLE_FRONT_IMAGE
  const galleryAngleImage = cop1PositionsAsString.indexOf('D') !== -1 ?ANGLE_BACK_OPPOSITE_IMAGE :ANGLE_BACK_IMAGE

  // const copimagesize = ( async (ig) => await addImageSize(ig))(copImage)
  // console.log('--->',copimagesize)
  return {
    themeName: (currentTheme || {}).name,
    productName: (currentProduct || {}).name,
    productDesc: (currentProduct || {}).description,
    productFacts, 
    ktoc: (designStore?.design?.ktoc || false),
    ktocInfo: {
      floors: (designStore?.design?.productInfo?.floors || '-'),
      travel: (designStore?.design?.productInfo?.travel || '-'),
      speed: (designStore?.design?.productInfo?.speed || '-'),
      load: designStore?.design?.productInfo?.load,
      passengers: designStore?.design?.productInfo?.passengers,
      range: designStore?.design?.productInfo?.range ?'ui-general-range-'+designStore.design.productInfo.range :null,
    },
    designName : (designStore.design || {}).name,
    offeringLocation :(currentProduct || {}).businessSpecification?.market,
    carShape: shapeStr,
    carType: typeStr,
    regulationsAvailable: productData?.product?.componentsData?.regulations?.length > 0, 
    regulations:  regulations || ['ui-general-none'],
    wallA: {      
      finishes: getFinishNames(TYP_CAR_FRONT_WALL_A),
      materials: getFinishCategoryNames(TYP_CAR_FRONT_WALL_A),
      sapIds: getFinishSapIds(TYP_CAR_FRONT_WALL_A),
      images: getFinishImages(TYP_CAR_FRONT_WALL_A),
      mixed: isMixedFinish(TYP_CAR_FRONT_WALL_A),
      pdfImages: getFinishPdfImages(TYP_CAR_FRONT_WALL_A),
      premium: isFinishPremium(TYP_CAR_FRONT_WALL_A),
    },
    wallB: {
      finishes: (wallBIsScenic ?getFinishNames(TYP_CAR_GLASS_WALL_C) :getFinishNames(TYP_CAR_WALL_B)),
      materials: (wallBIsScenic ?getFinishCategoryNames(TYP_CAR_GLASS_WALL_C) :getFinishCategoryNames(TYP_CAR_WALL_B)),
      sapIds: (wallBIsScenic ?getFinishSapIds(TYP_CAR_GLASS_WALL_C) :getFinishSapIds(TYP_CAR_WALL_B)),
      images: (wallBIsScenic ?getFinishImages(TYP_CAR_GLASS_WALL_C) :getFinishImages(TYP_CAR_WALL_B)),
      mixed: (wallBIsScenic ?isMixedFinish(TYP_CAR_GLASS_WALL_C) :isMixedFinish(TYP_CAR_WALL_B)),
      pdfImages: (wallBIsScenic ?getFinishPdfImages(TYP_CAR_GLASS_WALL_C) :getFinishPdfImages(TYP_CAR_WALL_B)),
      premium: (wallBIsScenic ?isFinishPremium(TYP_CAR_GLASS_WALL_C) :isFinishPremium(TYP_CAR_WALL_B)),
    },
    wallC: {
      finishes: ( isTrueTypeCar( (designStore.design || {}).carType ) ) ?getFinishNames(TYP_CAR_FRONT_WALL_A) :( ((designStore.design || {}).carType === CAR_TYPE_GLASS_BACKWALL && wallCIsScenic) ?getFinishNames(TYP_CAR_GLASS_WALL_C) :getFinishNames(TYP_CAR_WALL_C) ),
      materials: ( isTrueTypeCar( (designStore.design || {}).carType ) ) ?getFinishCategoryNames(TYP_CAR_FRONT_WALL_A) :( ((designStore.design || {}).carType === CAR_TYPE_GLASS_BACKWALL && wallCIsScenic) ?getFinishCategoryNames(TYP_CAR_GLASS_WALL_C) :getFinishCategoryNames(TYP_CAR_WALL_C) ),
      sapIds: ( isTrueTypeCar( (designStore.design || {}).carType ) ) ?getFinishSapIds(TYP_CAR_FRONT_WALL_A) :( ((designStore.design || {}).carType === CAR_TYPE_GLASS_BACKWALL && wallCIsScenic) ?getFinishSapIds(TYP_CAR_GLASS_WALL_C) :getFinishSapIds(TYP_CAR_WALL_C) ),
      images: ( isTrueTypeCar( (designStore.design || {}).carType ) ) ?getFinishImages(TYP_CAR_FRONT_WALL_A) :( ((designStore.design || {}).carType === CAR_TYPE_GLASS_BACKWALL && wallCIsScenic) ?getFinishImages(TYP_CAR_GLASS_WALL_C) :getFinishImages(TYP_CAR_WALL_C) ),
      mixed: ( isTrueTypeCar( (designStore.design || {}).carType ) ) ?isMixedFinish(TYP_CAR_FRONT_WALL_A) :( ((designStore.design || {}).carType === CAR_TYPE_GLASS_BACKWALL && wallCIsScenic) ?isMixedFinish(TYP_CAR_GLASS_WALL_C) :isMixedFinish(TYP_CAR_WALL_C) ),
      pdfImages: ( isTrueTypeCar( (designStore.design || {}).carType ) ) ?getFinishPdfImages(TYP_CAR_FRONT_WALL_A) :( ((designStore.design || {}).carType === CAR_TYPE_GLASS_BACKWALL && wallCIsScenic) ?getFinishPdfImages(TYP_CAR_GLASS_WALL_C) :getFinishPdfImages(TYP_CAR_WALL_C) ),
      premium: ( isTrueTypeCar( (designStore.design || {}).carType ) ) ?isFinishPremium(TYP_CAR_FRONT_WALL_A) :( ((designStore.design || {}).carType === CAR_TYPE_GLASS_BACKWALL && wallCIsScenic) ?isFinishPremium(TYP_CAR_GLASS_WALL_C) :isFinishPremium(TYP_CAR_WALL_C) ),
      panelingException: cWallPanelingException
    },
    wallD: {
      finishes: (wallDIsScenic ?getFinishNames(TYP_CAR_GLASS_WALL_C) :getFinishNames(TYP_CAR_WALL_D)),
      materials: (wallDIsScenic ?getFinishCategoryNames(TYP_CAR_GLASS_WALL_C) :getFinishCategoryNames(TYP_CAR_WALL_D)),
      sapIds: (wallDIsScenic ?getFinishSapIds(TYP_CAR_GLASS_WALL_C) :getFinishSapIds(TYP_CAR_WALL_D)),
      images: (wallDIsScenic ?getFinishImages(TYP_CAR_GLASS_WALL_C) :getFinishImages(TYP_CAR_WALL_D)),
      mixed: (wallDIsScenic ?isMixedFinish(TYP_CAR_GLASS_WALL_C) :isMixedFinish(TYP_CAR_WALL_D)),
      pdfImages: (wallDIsScenic ?getFinishPdfImages(TYP_CAR_GLASS_WALL_C) :getFinishPdfImages(TYP_CAR_WALL_D)),
      premium: (wallDIsScenic ?isFinishPremium(TYP_CAR_GLASS_WALL_C) :isFinishPremium(TYP_CAR_WALL_D)),
    },
    decoPack: decoPack,
    scenic: scenicType,
    panelOrientation: orientationStr,
    digitalServices: designStore?.design?.services || [],
    digitalServicesUrls,
    ceiling: {
      type: ceiling.label,
      image: ceiling.image,
      finish: ceilingFinish.label,
      sapId: ceilingFinish.sapId,
      finishImage: ceilingFinish.image,
      lightFinish: ceilingLight
    },
    floor: {
      finishes: getFinishNames(TYP_CAR_FLOORING),
      sapIds: getFinishSapIds(TYP_CAR_FLOORING),
      materials: getFinishMaterials(TYP_CAR_FLOORING),
      images: getFinishImages(TYP_CAR_FLOORING),
      mixed: isMixedFinish(TYP_CAR_FLOORING),
      pdfImages: getFinishPdfImages(TYP_CAR_FLOORING),
    },
    door: convertRAL({
      type: door.name,
      finish: doorFinish.label,
      sapId: doorFinish.id,
    }),
    frame: convertRAL({
      type: frame.name,
      finish: frameFinish.label,
      sapId: frameFinish.id,
    }),
    cop: {
      familyId: copFamily.id,
      family: copFamily.name,
      familyDesc: copFamily.description,
      type: cop.label,
      finish: copFinish.label,
      finishSapId: copFinishSapId,
      positions: copPositions,
      image: copImage,
      // imageSize: copimagesize,
      copDisplay: copDisplay
    },
    horCop: {
      type: horCop.label,
      finish: horCopFinish.label,
      image: horCopImage,
    },
    hi: {
      type: copHI.label,
      image: copHIImage,
      imageWidth: copHIWidth,
      sapId: copHI.id,
      finish: copHIFinish.label,
      finishSapId: copHIFinishSapId,
    },
    hl: {
      type: copHL.label,
      image: copHLImage,
      imageWidth: copHLWidth,
      sapId: copHL.id,
      finish: copHLFinish.label,
      finishSapId: copHLFinishSapId,
    },
    lcs: {
      type: copLCS.label,
      image: copLCSImage,
      shared: copLCSShared,
      finish: copLCSFinish.label,
      finishSapId: copLCSFinishSapId,
    },
    fb: {
      type: fb.label,
      image: fbImage
    },
    dop: {
      type: dop.label,
      image: copDopImage,
      shared: copDopShared,
      finish: copDOPFinish.label,
      finishSapId: copDOPFinishSapId,
    },
    din: {
      type: din.label,
      image: copDinImage,
      finish: copDINFinish.label,
      finishSapId: copDINFinishSapId,
    },
    eid: {
      type: eid.label,
      image: copEidImage,
      finish: copEIDFinish.label,
      finishSapId: copEIDFinishSapId,
    },
    handrail: {
      type: handrail.label,
      finish: handrailFinish.label,
      sapId: handrailFinish.sapId,
      positions: ( designStore.getPositions({type:TYP_CAR_HANDRAIL}) || []),
      positionsStr: handrailPositions,
      image: handrailFinish.image,
      compImage: handrailImage
    },
    mirror: {
      type: mirror.label,
      sapId: mirror.id,
      positions: ( designStore.getPositions({type:TYP_CAR_MIRROR}) || []),
      positionsStr: mirrorPositions,
      image: mirror.image
    },
    bufferRail: {
      type: buffer.label,
      finish: bufferFinish.label,
      sapId: bufferFinish.sapId,
      positions: ( designStore.getPositions({type:TYP_CAR_BUFFER_RAIL}) || []),
      positionsStr: bufferPositions,
      image: bufferFinish.image,
    },
    skirting: {
      type: skirting.label,
      finish: skirtingFinish.label,
      sapId: skirtingFinish.sapId,
      image: skirtingFinish.image,
      compImage: `thumbnails/${skirting.id}_${skirtingFinish.sapId}.png`
    },
    tenantDirectory: {
      type: tenant.label,
      model: tenant.id,
      size: (tenant.properties || {}).size,
      finish: (tenantFinish || {}).name,
      positions: ( designStore.getPositions({type:TYP_CAR_TENANT_DIRECTORY}) || []),
      image: tenant.image
    },
    infoScreen: {
      type: infoScreen.label,
      positions: infoSceenPositions,
      image: infoScreen?.imagesByFinish?.pdf ?infoScreen.imagesByFinish.pdf :infoScreen.image,
      sapId: infoScreen.id,
      finish: infoScreenFinish.label
    },
    seat: {
      type: seat.label,
      positions: ( designStore.getPositions({type:TYP_CAR_SEAT}) || []),
      finish: seatFinish.label,
      finishSapId: seatFinish.sapId,
      image: seat.image
    },
    viewImages: viewImages,
    frontPageImage,
    galleryAngleImage
  }
}

function convertRAL(item) {
  if (item.finish === 'finish-ral-color') {
    const finishData = JSON.parse(item.sapId)
    return {
      finish: `${finishData.ral}`,
      sapId: 'RAL',
      type: item.type
    }
  } else {
    return item
  }
}

// Separated from getDesignInformation() because in GenDoc view
// there are no images to display. This can then separately be used only
// for PDF related logic. - Joonas K, 2021/03/05
export function getViewImages(images = []) {
 return {
    angleFront: images.find(item => item.id==='angleFront'),
    front: images.find(item => item.id==='front'),
    back: images.find(item => item.id==='back'),
    landing: images.find(item => item.id==='landing'),
    landingPdf: images.find(item => item.id==='landingPdf'),
    ceilingImg: images.find(item => item.id==='ceilingImg'),
    copImage: images.find(item => item.id==='copImage'),
    horizontalImage: images.find(item => item.id==='horizontalImage'),
    hlImage: images.find(item => item.id==='hlImage'),
    hiImage: images.find(item => item.id==='hiImage'),
    lcsImage: images.find(item => item.id==='lcsImage'),
    eidImage: images.find(item => item.id==='eidImage'),
    dinImage: images.find(item => item.id==='dinImage'),
    dopImage: images.find(item => item.id==='dopImage'),
    fbImage: images.find(item => item.id==='fbImage'),
  }
}