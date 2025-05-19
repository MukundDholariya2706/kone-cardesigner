import './ElevatorCall.scss';
import React, { useContext, useState, useEffect } from 'react';

import { ProductContext } from '../../store/product';
import { DesignContext } from '../../store/design';
import { TranslationContext } from '../../store/translation';
import EditorLayout from '../EditorLayout';
import SwitchButton from '../SwitchButton';
import ElevatorCallDialog from './dialogs/ElevatorCallDialog';
import { LayoutContext } from '../../store/layout';
import { EDIT_VIEW_DIGITAL_SERVICES, KCSM_MOBILE_ELEV_CALL } from '../../constants';
import ScrollBox from '../ScrollBox';

import imgElevatorCall from "../../assets/images/elevator-call.png";

const ElevatorCall = (props) => {
  
  const { getText } = useContext(TranslationContext);
  const { setEditView, showDialogElevatorCall, setShowDialogElevatorCall } = useContext(LayoutContext);
  const { product } = useContext(ProductContext);
  const { setService } = useContext(DesignContext);

  const [ toggle, setToggle ] = useState(true)
  
  // const [ showDialog, setShowDialog ] = useState(false)
  const [disableRemove, setDisableRemove] = useState([])

  const update = () => {

  }

  // on component mount
  useEffect(() => {
    setService({type:KCSM_MOBILE_ELEV_CALL,value:true})
  }, [])
  
  // on product change
  useEffect(() => {
    update()
  }, [product])

  useEffect(() => {
    if(toggle === undefined) return;
    if(toggle){
      setService({type:KCSM_MOBILE_ELEV_CALL,value:true})
    } else {
      setService({type:KCSM_MOBILE_ELEV_CALL,value:false})
    }

  }, [toggle])

  const onBackClick = () => {
    setEditView(EDIT_VIEW_DIGITAL_SERVICES)
  }

  return (      
    <div className="ElevatorCall">        
      <EditorLayout heading={getText('ui-elevator-call-heading')} action={getText('ui-general-back')} actionClickHandler={onBackClick} >
        <ScrollBox>
            <SwitchButton toggle={toggle} label={getText('ui-elevator-call-add')} onChange={e => setToggle(e)} isDisabled={(disableRemove.indexOf(KCSM_MOBILE_ELEV_CALL)!==-1)}  extraStyle={{textTransform:'unset'}}/>

            <div className='info-content'>
              <img
                    className="image"
                    src={imgElevatorCall}
                    alt=""
                  />
              <p className='text'>
                {getText('ui-elevator-call-info-content-para-1')}
              </p>
              <p className='text'>
                {getText('ui-elevator-call-info-content-para-2')}
              </p>
              <ul>
                <li>{getText('ui-elevator-call-fact-1')}</li>
                <li>{getText('ui-elevator-call-fact-2')}</li>
                <li>{getText('ui-elevator-call-fact-3')}</li>
              </ul>
              <p className="read-more" onClick={() => setShowDialogElevatorCall(true)}>
                { getText('ui-general-read-more')}
              </p>
            </div>

          <div style={{height:'20px'}} />
        </ScrollBox>
      </EditorLayout>
      { showDialogElevatorCall && 
        <ElevatorCallDialog onConfirm={() => setShowDialogElevatorCall(false)} onCancel={() => setShowDialogElevatorCall(false)} />
      }
    </div>
  )
}
export default ElevatorCall;