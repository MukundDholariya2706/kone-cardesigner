import './AccessoriesEditor.scss';
import React, { useContext, useState, useEffect} from 'react';
import jsonLogic from 'json-logic-js';

import { TranslationContext } from '../../store/translation'
import { ProductContext } from '../../store/product';
import { DesignContext } from '../../store/design';
import EditorLayout from '../EditorLayout';
import AccessoryBlock from '../AccessoryBlock'
import ServiceBlock from '../ServiceBlock'
import { TYP_CAR_HANDRAIL, TYP_CAR_SKIRTING, TYP_CAR_SEAT, MAT_CAR_HANDRAIL, MAT_CAR_SKIRTING, TYP_CAR_CEILING,
          EDIT_VIEW_HANDRAIL, EDIT_VIEW_MIRRORS, EDIT_VIEW_SKIRTING, EDIT_VIEW_SEAT, MAT_CAR_SEAT,
          MAT_CAR_TENANT_DIRECTORY, TYP_CAR_TENANT_DIRECTORY, EDIT_VIEW_TENANT_DIRECTORY, EDIT_VIEW_BUFFER_RAIL,
          TYP_CAR_BUFFER_RAIL, MAT_CAR_BUFFER_RAIL, TYP_CAR_MIRROR, MAT_CAR_MIRROR, EDIT_VIEW_INFO_MEDIA_SCREENS, EDIT_VIEW_AIR_PURIFIER,
          TYP_CAR_MEDIASCREEN, TYP_CAR_INFOSCREEN, MAT_CAR_FLOORING, TYP_COP_PRODUCT_1,
          TYP_COP_2, TYP_CAR_WALL_ADD_DECO_PACKAGE,MAT_CAR_WALL_FINISH_C, MAT_CAR_WALL_FINISH_B, MAT_CAR_WALL_FINISH_D,
           TYP_COP_HORIZONTAL, TYP_COP_DISPLAY, TYP_CAR_MIRROR_2, TYP_CAR_GLASS_WALL_C, KCSM_AIR_PURIFIER } from '../../constants'
import ScrollBox from '../ScrollBox';

/**
 * Renders out the header part of the view (currently not in use)
 * @function AccessoriesEditor Header renderer
 * @param {Object} props Propertied passed to this renderer
 */
const AccessoriesEditor = () => {

  const { getText } = useContext(TranslationContext)
  const { product, getMaterial } = useContext(ProductContext)
  const { design, getDesignProperty, getComponent:getComponentId, getPositions, getFinish:getFinishId, getPart} = useContext(DesignContext)
  
  const [disableRemove, setDisableRemove] = useState([])
  const [disableAdd, setDisableAdd] = useState([])

  const disabledAccessories = Object.values(product.componentsData.accessories)
    .filter(v => v.disabled).map(item=>item.id)

  const updateAvailability = () => {
    if(product && product.rules && product.rules.accessoriesEdit ) {

      const copPart = getPart({componentType:TYP_COP_PRODUCT_1, partType: TYP_COP_DISPLAY})
      const copDisplay = (copPart && copPart.component) ?copPart.component :null

      const test={}
      test['PRODUCT'] = product.product;
      test['CAR_TYPE'] = design.carType;
      test['BACKWALLTYPE'] = design.backWallPanelingType || 0;
      test['SCENIC'] = getPositions({type:TYP_CAR_GLASS_WALL_C});
      test['SCENICTYPE'] = getComponentId({type:TYP_CAR_GLASS_WALL_C});
      test['REGULATIONS'] = design.regulations || [];
      test['C_FINISH'] = getFinishId({type:MAT_CAR_WALL_FINISH_C}) || '';
      test['PANELORIENTATION'] = getDesignProperty('panelOrientation');
      test['FLOOR_MATERIAL'] = getMaterial({type: MAT_CAR_FLOORING, finish: getFinishId({type: MAT_CAR_FLOORING})});
      test['CEILING'] = getComponentId({type:TYP_CAR_CEILING}) || null;
      test['COP1'] = getComponentId({type:TYP_COP_PRODUCT_1}) || null;
      test['COP1_DISPLAY'] = copDisplay;
      test['COP2'] = getComponentId({type:TYP_COP_2}) || null;
      test['COP1_POS'] = (getPositions({type:TYP_COP_PRODUCT_1}) || []).join('');
      test['COP2_POS'] = (getPositions({type:TYP_COP_2}) || []).join('');
      test['HORCOP'] = getComponentId({type:TYP_COP_HORIZONTAL}) || null;
      test['DECO'] = (getComponentId({type:TYP_CAR_WALL_ADD_DECO_PACKAGE}) || []);
      test['MIRROR_POS'] = (getPositions({type:TYP_CAR_MIRROR}) || []);
      test['MIRROR'] = (getComponentId({type:TYP_CAR_MIRROR}) || []);
      test['BUFFER_POS'] = (getPositions({type:TYP_CAR_BUFFER_RAIL}) || []);
      test['HANDRAIL_POS'] = (getPositions({type:TYP_CAR_HANDRAIL}) || []);
      test['WALL_MATERIALS'] = [ getMaterial({type: MAT_CAR_WALL_FINISH_B, finish: getFinishId({type: MAT_CAR_WALL_FINISH_B})})];
      test['WALL_MATERIALS'].push(getMaterial({type: MAT_CAR_WALL_FINISH_D, finish: getFinishId({type: MAT_CAR_WALL_FINISH_D})}))
      test['WALL_MATERIALS'].push( getMaterial({type: MAT_CAR_WALL_FINISH_C, finish: getFinishId({type: MAT_CAR_WALL_FINISH_C})}) || 'none')
      test['PREDESIGN'] = design?.originalSapId;

      const scenicIndex = design?.components?.findIndex(item => item.componentType === TYP_CAR_GLASS_WALL_C)
      if(scenicIndex !== -1) {
        test['WALL_MATERIALS'].push('SCENIC')      
      }

      const disableRemoveAddList = jsonLogic.apply(product.rules.accessoriesEdit, test)
      // console.log({test, disableRemoveAddList})
      // special check up for media and info screens
      const mediaScreens = product?.componentsData?.accessories?.infoAndMediaScreens?.mediaScreens || []
      const infoScreens = product?.componentsData?.accessories?.infoAndMediaScreens?.infoScreens || []
      if(infoScreens.length < 1) disableRemoveAddList[1].push(TYP_CAR_INFOSCREEN)
      if(mediaScreens.length < 1) disableRemoveAddList[1].push(TYP_CAR_MEDIASCREEN)

      if(disableRemoveAddList && disableRemoveAddList[0] && disableRemoveAddList[0].length > 0) {
        setDisableRemove(disableRemoveAddList[0])
      } else {
        setDisableRemove([])
      }
      if(disableRemoveAddList && disableRemoveAddList[1] && disableRemoveAddList[1].length > 0) {
        setDisableAdd(disableRemoveAddList[1])
      } else {
        setDisableAdd([])
      }
    }

  }

  useEffect(()=> {
    updateAvailability()
  },[])

  useEffect(()=> {
    updateAvailability()
  },[design])

  // Hide accessories if there are none available
  const showMirrosAccessories = product?.componentsData?.accessories?.mirrors?.types?.length > 0
  const showHandrailsAccessories = product?.componentsData?.accessories?.handrails?.models?.length > 0
  const showSkritingAccessories = product?.componentsData?.accessories?.skirtings?.finishes?.length > 0
  const showBufferRailsAccessories = product?.componentsData?.accessories?.bufferRails?.finishes?.length > 0
  const showSeatAccessories = product?.componentsData?.accessories?.seats?.types?.length > 0
  const showTenantdirectoryAccessories = product?.componentsData?.accessories?.tenantDirectories?.sizes?.length > 0
  const showInfoAndMediaScreensAccessories = (product?.componentsData?.accessories?.infoAndMediaScreens?.infoScreens?.length > 0  || product?.componentsData?.accessories?.infoAndMediaScreens?.mediaScreens?.length > 0)

  const showAirPurifier = (product?.componentsData?.accessories?.airPurifier?.id === KCSM_AIR_PURIFIER && !product?.componentsData?.accessories?.airPurifier?.disabled)
  //const showAirPurifier = true
  // const showAirPurifier = true

  return (      
    <div className="AccessoriesEditor">        
      <EditorLayout heading={getText('ui-accessories-heading')} >
        <ScrollBox>
          { showMirrosAccessories &&
            <AccessoryBlock 
              title={getText('ui-general-mirrors')} 
              info={getText('ui-accessories-mirrors-i')} 
              viewToOpen={EDIT_VIEW_MIRRORS} 
              // componentType={TYP_CAR_MIRROR} 
              componentType={[TYP_CAR_MIRROR,TYP_CAR_MIRROR_2]} 
              finishType={MAT_CAR_MIRROR}
              disableAdd={disableAdd}
              disableRemove={disableRemove}
              showMirrorComponents={true}
              hidden={disabledAccessories.includes("mirrors")} >
            </AccessoryBlock>
          }
          {showHandrailsAccessories &&
            <AccessoryBlock 
              title={getText('ui-general-handrails')} 
              info={getText('ui-accessories-handrails-i')} 
              viewToOpen={EDIT_VIEW_HANDRAIL} 
              componentType={TYP_CAR_HANDRAIL} 
              finishType={MAT_CAR_HANDRAIL}
              disableAdd={disableAdd}
              disableRemove={disableRemove}
              hidden={disabledAccessories.includes("handrails")} >
            </AccessoryBlock>
          }
          {showSkritingAccessories && 
            <AccessoryBlock 
              title={getText('ui-general-skirting')} 
              info={getText('ui-accessories-skirting-i')} 
              className="skirting-block" 
              viewToOpen={EDIT_VIEW_SKIRTING} 
              componentType={TYP_CAR_SKIRTING} 
              finishType={MAT_CAR_SKIRTING} layout="finish"
              disableAdd={disableAdd}
              disableRemove={disableRemove}
              hidden={disabledAccessories.includes("skirtings")} >
            </AccessoryBlock>
          }

          { showBufferRailsAccessories &&
            <AccessoryBlock 
              title={getText('ui-general-buffer-rails')} 
              info={getText('ui-accessories-buffer-rails-i')} 
              viewToOpen={EDIT_VIEW_BUFFER_RAIL} 
              componentType={TYP_CAR_BUFFER_RAIL} 
              finishType={MAT_CAR_BUFFER_RAIL}
              disableAdd={disableAdd}
              disableRemove={disableRemove}
              hidden={disabledAccessories.includes("bufferRails")} >
            </AccessoryBlock>
          }

          {showInfoAndMediaScreensAccessories && 
            <AccessoryBlock 
              title={getText('ui-general-info-media-screens')} 
              info={getText('ui-accessories-info-media-screens-i')} 
              viewToOpen={EDIT_VIEW_INFO_MEDIA_SCREENS} 
              componentType={[TYP_CAR_INFOSCREEN,TYP_CAR_MEDIASCREEN]}
              disableAdd={disableAdd}
              disableRemove={disableRemove}
              hidden={disabledAccessories.includes("infoAndMediaScreens")} >
            </AccessoryBlock>
          }

          {showSeatAccessories && 
            <AccessoryBlock 
              title={getText('ui-general-seat')} 
              info={getText('ui-accessories-seat-i')} 
              viewToOpen={EDIT_VIEW_SEAT} 
              componentType={TYP_CAR_SEAT} 
              finishType={MAT_CAR_SEAT}
              disableAdd={disableAdd}
              disableRemove={disableRemove}
              hidden={disabledAccessories.includes("seats")} >
            </AccessoryBlock>
          }
          {showTenantdirectoryAccessories && 
            <AccessoryBlock 
              title={getText('ui-general-tenant-directory')} 
              info={getText('ui-accessories-tenant-directory-i')} 
              viewToOpen={EDIT_VIEW_TENANT_DIRECTORY} 
              componentType={TYP_CAR_TENANT_DIRECTORY} 
              finishType={MAT_CAR_TENANT_DIRECTORY}
              disableAdd={disableAdd}
              disableRemove={disableRemove}
              hidden={disabledAccessories.includes("tenantDirectories")} >
            </AccessoryBlock>
          }
          { showAirPurifier && 
            <ServiceBlock 
              title={getText('ui-general-air-purifier')} 
              info={getText('ui-accessories-air-purifier-i')} 
              viewToOpen={EDIT_VIEW_AIR_PURIFIER} 
              serviceType={KCSM_AIR_PURIFIER}
              serviceImage="thumbnails/air-purifier-logo.png" 
              disableAdd={disableAdd}
              disableRemove={disableRemove}
              hidden={disabledAccessories.includes("airPurifiers")} >
            </ServiceBlock>
          }
          <div style={{height:'30px'}} />
        </ScrollBox>
      </EditorLayout>
    </div>
  )  
}
export default AccessoriesEditor;