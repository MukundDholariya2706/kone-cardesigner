import './RobotApi.scss';
import React, { useContext, useState, useEffect } from 'react';

import { ProductContext } from '../../store/product/ProductProvider';
import { DesignContext } from '../../store/design/DesignProvider';
import { TranslationContext } from '../../store/translation/TranslationProvider';
import EditorLayout from '../EditorLayout';
import SwitchButton from '../SwitchButton';
import RobotApiDialog from './dialogs/RobotApiDialog';
import { LayoutContext } from '../../store/layout/LayoutProvider';
import { EDIT_VIEW_DIGITAL_SERVICES, KCSM_APF_SERV_ROBOT_API } from '../../constants';

import ScrollBox from '../ScrollBox';

import imgRobotApi from "../../assets/images/react.svg";

const RobotApi = (props) => {
  
  const { getText } = useContext(TranslationContext);
  const { setEditView, showDialogRobotApi, setShowDialogRobotApi } = useContext(LayoutContext);
  const { product } = useContext(ProductContext);
  const {  setService } = useContext(DesignContext);

  const [ toggle, setToggle ] = useState(true)
  
  const [disableRemove, setDisableRemove] = useState([])

  const update = () => {

  }

  // on component mount
  useEffect(() => {
    setService({type:KCSM_APF_SERV_ROBOT_API,value:true})
  }, [])
  
  // on product change
  useEffect(() => {
    update()
  }, [product])

  useEffect(() => {
    if(toggle === undefined) return;
    if(toggle){
      setService({type:KCSM_APF_SERV_ROBOT_API,value:true})
    } else {
      setService({type:KCSM_APF_SERV_ROBOT_API,value:false})
    }

  }, [toggle])

  const onBackClick = () => {
    setEditView(EDIT_VIEW_DIGITAL_SERVICES)
  }

  return (      
    <div className="RobotApi">        
      <EditorLayout heading={getText('ui-robot-api-heading')} action={getText('ui-general-back')} actionClickHandler={onBackClick} >
        <ScrollBox>
            <SwitchButton toggle={toggle} label={getText('ui-robot-api-add')} onChange={e => setToggle(e)} isDisabled={(disableRemove.indexOf(KCSM_APF_SERV_ROBOT_API)!==-1)} extraStyle={{textTransform:'unset'}} />

            <div className='info-content'>
              <img
                    className="image"
                    src={imgRobotApi}
                    alt=""
                  />
              <p className='text'>
                {getText('ui-robot-api-info-content-para-1')}
              </p>
              <p className='text'>
                {getText('ui-robot-api-info-content-para-2')}
              </p>
              <p className="read-more" onClick={() => setShowDialogRobotApi(true)}>
                { getText('ui-general-read-more')}
              </p>
            </div>
                        
          <div style={{height:'20px'}} />
        </ScrollBox>
      </EditorLayout>
      { showDialogRobotApi && 
        <RobotApiDialog onConfirm={() => setShowDialogRobotApi(false)} onCancel={() => setShowDialogRobotApi(false)} />
      }
    </div>
  )
}
export default RobotApi;