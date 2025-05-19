export function setAnalyticsForEditPage( data ) {
//  console.log('Page --> ',{data})

  window.digitalData = {
    page: {
      pageInfo: {
        buildingType: data.buildingType || '',
        collection: data.collectionId || '',
        languageCountry: data.languageCountryId || '',
        language: data.languageId || '',
        country: data.countryCode || '',
        projectCountry: data.countryId || '',
        role: data.role || '',
        solution: data.productName || '',
        template: data.templateId || ''
      }
    },
    events: []
  };
}

export function setAnalyticsForPage( data ) {
  // console.log('Page --> ',{data})

  window.digitalData = {
    page: {
      pageInfo: {
        ...window?.digitalData?.page?.pageInfo,
        ...data
      }
    },
    events: []
  };
}

export function setAnalyticsForEvent( data ) {

//  console.log('Event --> ',{data})

  if(!window.digitalData || !window.digitalData.events) {
    window.digitalData = {
      page:{},
      events:[]
    }
  }

  window.digitalData.events.push({
    eventName: data.eventName,
    eventData: data.eventData
  })

}

export function formatDesignForAnalytics(design) {
  let retVal = {};
  retVal['accessibilityPacks'] =  design.regulations;
  retVal['shape'] =  design.carShape;
  retVal['type'] =  design.carType;
  retVal['ceilingType'] =  componentLine(design, 'TYP_CAR_CEILING');
  retVal['bWallMaterial'] =  componentLine(design, 'TYP_CAR_WALL_B', false);
  retVal['cWallMaterial'] =  componentLine(design, 'TYP_CAR_WALL_C', false);
  retVal['dWallMaterial'] =  componentLine(design, 'TYP_CAR_WALL_D', false);
  retVal['panelOrientation'] =  design.panelOrientation;
  retVal['scenicBackWall'] =  componentLine(design, 'TYP_CAR_GLASS_WALL_C');
  retVal['decoPackage'] =  componentLine(design, 'TYP_CAR_WALL_ADD_DECO_PACKAGE');
  retVal['laminatelists'] =  componentLine(design, 'TYP_CAR_LAMINATE_LIST', false);
  retVal['floorMaterial'] =  componentLine(design, 'TYP_CAR_FLOORING', false);
  retVal['COP1'] =  componentLine(design, 'TYP_COP_PRODUCT_1');
  retVal['COP2'] =  componentLine(design, 'TYP_COP_2');
  retVal['aWallMaterial'] =  componentLine(design, 'TYP_CAR_FRONT_WALL_A', false);
  retVal['door'] =  componentLine(design, 'TYP_DOOR_A');
  retVal['landingDoorFrameMaterial'] =  componentLine(design, 'TYP_LDO_FRAME_FRONT');
  retVal['mirrors'] =  componentLine(design, 'TYP_CAR_MIRROR');
  retVal['handrail'] =  componentLine(design, 'TYP_CAR_HANDRAIL');
  retVal['skirting'] =  componentLine(design, 'TYP_CAR_SKIRTING');
  retVal['bufferRails'] =  componentLine(design, 'TYP_CAR_BUFFER_RAIL');
  retVal['infoScreen'] =  componentLine(design, 'TYP_CAR_INFOSCREEN');
  retVal['mediaScreen'] =  componentLine(design, 'TYP_CAR_MEDIASCREEN');
  retVal['seat'] =  componentLine(design, 'TYP_CAR_SEAT');
  retVal['tenantDirectory'] =  componentLine(design, 'TYP_TENANT_DIRECTORY_1');
  retVal['hallIndicator'] =  componentLine(design, 'TYP_HI_PRODUCT');
  retVal['hallLantern'] =  componentLine(design, 'TYP_HL_PRODUCT');
  retVal['landingCallStation'] =  componentLine(design, 'TYP_LCS_PRODUCT');
  retVal['elevatorIndicator'] =  componentLine(design, 'TYP_EID_PRODUCT');
  retVal['destinationIndicator'] =  componentLine(design, 'TYP_DIN_PRODUCT');
  retVal['destinationOperatingPanel'] =  componentLine(design, 'TYP_DOP_PRODUCT');

  return retVal;
}

function componentLine(design, componentType, addComponent = true) {
  let retVal = '';
  if (!design || !design.components) {
    return 'Not selected'
  }
  const compIndex = design.components.findIndex(item => item.componentType === componentType)
  if (compIndex === -1) {
    return 'Not selected';
  }

  const designItem = design.components[compIndex];

  if (addComponent) {
    retVal += designItem.component + ', ';
  }

  if (designItem.finish) {
    retVal += designItem.finish;
  }

  if (designItem.positions) {
    retVal += ', ' + designItem.positions;
  }

  return retVal;
}