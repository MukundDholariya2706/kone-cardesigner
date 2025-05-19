import { TYP_COP_FACE_PLATE_PRINT_1, MAT_COP_FACE_PLATE_1 } from "../../constants";

const componentsDataMapping = {
  TYP_DIN_PRODUCT : 'landingDestIndicator',
  TYP_DOP_PRODUCT : 'destinationOP',
  TYP_EID_PRODUCT : 'elevatorIdentifier',
  TYP_HI_PRODUCT : 'realHallIndicators',
  TYP_HL_PRODUCT : 'hallIndicators',
  TYP_LCS_PRODUCT : 'callStationTypes',
}

export function getFinishType(copFamily) {
  
  if (copFamily === 'KSSD' || copFamily === 'KDSD') return TYP_COP_FACE_PLATE_PRINT_1

  return MAT_COP_FACE_PLATE_1
}

export function getComponentFromComponentsData(component, productCtx) {
  
  const copsData = productCtx?.product?.componentsData?.signalization?.copModels
  if (!copsData) return null
  
  const itemType = componentsDataMapping[component?.componentType]
  if(!itemType) return null

  const correctCopData = copsData.find(copModel => {    
    return copModel[itemType].findIndex( item => item.id === component.component) !== -1
  })
  if (!correctCopData) return null
  
  return correctCopData[itemType].find( item => item.id === component.component)

}

/* const getFinishType = (id) => {
  const componentFinishTypes = getFinishTypeByComponent(selectedCopId);
  const finishType = getFinishTypeByFinish(id);

  let type='';
  if(typeof componentFinishTypes !== 'string') {
    for(let i=0;i<finishType.length;i++) {
      for(let j=0; j<componentFinishTypes.length;j++) {
        if(finishType[i]===componentFinishTypes[j]) {
          type=finishType[i];          
        }
      }
    }  
  } else {
    type = componentFinishTypes;
  }
  return type
} */