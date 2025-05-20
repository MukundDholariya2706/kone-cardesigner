import './DigitalServicesEditor.scss';
import React, { useContext, useState, useEffect} from 'react';

import { TranslationContext } from '../../store/translation/TranslationProvider'
import { ProductContext } from '../../store/product/ProductProvider';
import { DesignContext } from '../../store/design/DesignProvider';
import { LayoutContext } from '../../store/layout/LayoutProvider';
import EditorLayout from '../EditorLayout';
import ServiceBlock from '../ServiceBlock'
import DigitalServicesDialog from './dialogs/DigitalServicesDialog';

import { 
          EDIT_VIEW_CONNECTED_SERVICES, EDIT_VIEW_ELEVATOR_CALL, EDIT_VIEW_ROBOT_API,  KCSM_24_7_CONNECT, KCSM_APF_SERV_ROBOT_API, KCSM_ELEV_MUSIC, KCSM_MOBILE_ELEV_CALL } from '../../constants'
import ScrollBox from '../ScrollBox';

/**
 * Renders out the header part of the view (currently not in use)
 * @function DigitalServicesEditor Header renderer
 * @param {Object} props Propertied passed to this renderer
 */
const DigitalServicesEditor = () => {

  const { getText } = useContext(TranslationContext)
  const { product } = useContext(ProductContext)
  const { design, getComponent:getComponentId, getFinish:getFinishId} = useContext(DesignContext)
  const { showDialogDigitalServices, setShowDigitalServices } = useContext(LayoutContext)

  const [disableRemove, setDisableRemove] = useState([])
  const [disableAdd, setDisableAdd] = useState([])

  const disabledAccessories = Object.values(product.componentsData.accessories)
    .filter(v => v.disabled).map(item=>item.id)

  const updateAvailability = () => {


  }

  useEffect(()=> {
    updateAvailability()
  },[])

  useEffect(()=> {
    updateAvailability()
  },[design])

  const onReadMoreClick = () => {
    setShowDigitalServices(true)
  }

  // Hide accessories if there are none available
  const showConnected = product?.componentsData?.kcsmServices?.find(service => (service.id === KCSM_24_7_CONNECT && !service.disabled))
  const showElevatorMusic = product?.componentsData?.kcsmServices?.find(service => (service.id === KCSM_ELEV_MUSIC && !service.disabled))
  const showElevatorCall = product?.componentsData?.kcsmServices?.find(service => (service.id === KCSM_MOBILE_ELEV_CALL && !service.disabled))
  const showRobotApi = product?.componentsData?.kcsmServices?.find(service => (service.id === KCSM_APF_SERV_ROBOT_API && !service.disabled))

  return (      
    <div className="DigitalServicesEditor">        
      <EditorLayout heading={getText('ui-digital-services-heading')} readMore={getText('ui-general-read-more')} readMoreClickHandler={onReadMoreClick} >
      {/* <EditorLayout heading={getText('Digital services')} readMore={getText('ui-general-read-more')} readMoreClickHandler={onReadMoreClick} > */}

        <ScrollBox>

          { showConnected &&
            <ServiceBlock 
              title={getText('ui-general-24-7-connected-services')} 
              info={getText('ui-general-24-7-connected-services-i')} 
              viewToOpen={EDIT_VIEW_CONNECTED_SERVICES} 
              serviceType={KCSM_24_7_CONNECT} 
              serviceIcon="247connected"
              disableAdd={disableAdd}
              disableRemove={disableRemove}
              hidden={disabledAccessories.includes("connected-services")} >
            </ServiceBlock>
          }


          { showElevatorCall &&
            <ServiceBlock 
              title={getText('ui-general-elevator-call')} 
              info={getText('ui-general-elevator-call-i')} 
              viewToOpen={EDIT_VIEW_ELEVATOR_CALL} 
              serviceType={KCSM_MOBILE_ELEV_CALL} 
              serviceIcon="mobile-comm"
              disableAdd={disableAdd}
              disableRemove={disableRemove}
              hidden={disabledAccessories.includes("elevator-call")} >
            </ServiceBlock>
          }

          { showRobotApi &&
            <ServiceBlock 
              title={getText('ui-general-service-robot-api')} 
              info={getText('ui-general-service-robot-api-i')} 
              viewToOpen={EDIT_VIEW_ROBOT_API} 
              serviceType={KCSM_APF_SERV_ROBOT_API} 
              serviceIcon="robot"
              disableAdd={disableAdd}
              disableRemove={disableRemove}
              hidden={disabledAccessories.includes("robot-api")} >
            </ServiceBlock>
          }

          <div style={{height:'30px'}} />
        </ScrollBox>
  
      </EditorLayout>
      { showDialogDigitalServices && 
        <DigitalServicesDialog onConfirm={() => setShowDigitalServices(false)} onCancel={() => setShowDigitalServices(false)} />
      }

    </div>
  )  
}
export default DigitalServicesEditor;