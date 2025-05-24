import './ConnectedServices.scss';
import React, { useContext, useState, useEffect } from 'react';

import { ProductContext } from '../../store/product/ProductProvider';
import { DesignContext } from '../../store/design/DesignProvider';
import { TranslationContext } from '../../store/translation/TranslationProvider';
import EditorLayout from '../EditorLayout';
import SwitchButton from '../SwitchButton';
import ConnectedServicesDialog from './dialogs/ConnectedServicesDialog';
import { LayoutContext } from '../../store/layout';
import { EDIT_VIEW_DIGITAL_SERVICES, KCSM_24_7_CONNECT } from '../../constants';

import ScrollBox from '../ScrollBox';

import imgMonitoring from "../../assets/images/react.svg";
import imgReporting from "../../assets/images/react.svg";
import imgAlerts from "../../assets/images/react.svg";
import imgAnalysis from "../../assets/images/react.svg";

const ConnectedServices = (props) => {
  
  const { getText } = useContext(TranslationContext);
  const { setEditView, showDialogConnectedServices, setShowDialogConnectedServices } = useContext(LayoutContext);
  const { product } = useContext(ProductContext);
  const {  setService } = useContext(DesignContext);

  const [ toggle, setToggle ] = useState(true)
  
  const [disableRemove, setDisableRemove] = useState([])

  const update = () => {

  }

  // on component mount
  useEffect(() => {
    setService({type:KCSM_24_7_CONNECT,value:true})
  }, [])
  
  // on product change
  useEffect(() => {
    update()
  }, [product])

  useEffect(() => {
    if(toggle === undefined) return;
    if(toggle){
      setService({type:KCSM_24_7_CONNECT,value:true})
    } else {
      setService({type:KCSM_24_7_CONNECT,value:false})
    }

  }, [toggle])

  const onBackClick = () => {
    setEditView(EDIT_VIEW_DIGITAL_SERVICES)
  }

  return (      
    <div className="ConnectedServices">        
      <EditorLayout heading={getText('ui-24-7-connected-services-heading')} action={getText('ui-general-back')} actionClickHandler={onBackClick} >
        <ScrollBox>
            <SwitchButton toggle={toggle} label={getText('ui-24-7-connected-services-add')} onChange={e => setToggle(e)} isDisabled={(disableRemove.indexOf(KCSM_24_7_CONNECT)!==-1)}  extraStyle={{textTransform:'unset'}}/>

            <div className='info-heading'>
              {getText('ui-24-7-connected-services-info-heading')}
            </div>
            <div className='info-content'>
              <p className='text'>
                {getText('ui-24-7-connected-services-info-content')}
              </p>

              <p className="read-more" onClick={() => setShowDialogConnectedServices(true)}>
                { getText('ui-general-read-more')}
              </p>
            </div>

            <div className='facts'>
              <img src={imgMonitoring} className='image'/>
              <div>
                <div className='info-fact-heading'>
                  {getText('ui-24-7-connected-services-monitoring')}
                </div>
                <div className="info-desc">{getText('ui-24-7-connected-services-monitoring-info')}</div>
              </div>
              <img src={imgAnalysis} className='image'/>
              <div>
                <div className='info-fact-heading'>
                  {getText('ui-24-7-connected-services-analysis')}
                </div>
                <div className="info-desc">{getText('ui-24-7-connected-services-analysis-info')}</div>
              </div>
              <img src={imgAlerts} className='image'/>
              <div>
                <div className='info-fact-heading'>
                  {getText('ui-24-7-connected-services-alerts')}
                </div>
                <div className="info-desc">{getText('ui-24-7-connected-services-alerts-info')}</div>
              </div>
              <img src={imgReporting} className='image'/>
              <div>
                <div className='info-fact-heading'>
                  {getText('ui-24-7-connected-services-reporting')}
                </div>
                <div className="info-desc">{getText('ui-24-7-connected-services-reporting-info')}</div>
              </div>
            </div>
                        
          <div style={{height:'20px'}} />
        </ScrollBox>
      </EditorLayout>
      { showDialogConnectedServices && 
        <ConnectedServicesDialog onConfirm={() => setShowDialogConnectedServices(false)} onCancel={() => setShowDialogConnectedServices(false)} />
      }
    </div>
  )
}
export default ConnectedServices;