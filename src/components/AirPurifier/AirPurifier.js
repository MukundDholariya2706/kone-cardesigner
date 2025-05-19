import './AirPurifier.scss';
import React, { useContext, useState, useEffect } from 'react';

import { ProductContext } from '../../store/product';
import { DesignContext } from '../../store/design';
import { TranslationContext } from '../../store/translation';
import { Context3d } from '../../store/3d';
import EditorLayout from '../EditorLayout';
import SwitchButton from '../SwitchButton';
import AirPurifierDialog from './dialogs/AirPurifierDialog';
import { LayoutContext } from '../../store/layout';
import { KCSM_AIR_PURIFIER,VIEW3D_MODE_CAR, TYP_COP_PRODUCT_1 } from '../../constants';
import ScrollBox from '../ScrollBox';

import imgAirPurifier from "../../assets/images/air-purifier-sticker.png";

const AirPurifier = (props) => {
  
  const { getText } = useContext(TranslationContext);
  const { setEditView, showDialogAirPurifier, setShowDialogAirPurifier } = useContext(LayoutContext);
  const { product,} = useContext(ProductContext);
  const { setService, setAirPurifierVisibility,getPositions } = useContext(DesignContext);
  const { view3dMode } = useContext(LayoutContext); 
  const { sceneManager } = useContext(Context3d)

  const [ toggle, setToggle ] = useState(true)
  
  const [disableRemove, setDisableRemove] = useState([])

  const update = () => {

  }

  // on component mount
  useEffect(() => {
    setService({type:KCSM_AIR_PURIFIER,value:true})
    if(showDialogAirPurifier) {
      setAirPurifierVisibility({value:true})
    }
  }, [])
  
  // on product change
  useEffect(() => {
    update()
  }, [product])

  useEffect(() => {
    if(!showDialogAirPurifier) {
      setTimeout(()=>{ setAirPurifierVisibility({value:false}) },4000)
    }
    
  }, [showDialogAirPurifier])

  useEffect(() => {
    updateCameraPosition()
  }, [toggle])

  useEffect(() => {
    updateCameraPosition()
  }, [toggle])

  useEffect(() => {
    if(toggle === undefined) return;
    if(toggle){
      setService({type:KCSM_AIR_PURIFIER,value:true})
    } else {
      setService({type:KCSM_AIR_PURIFIER,value:false})
    }

  }, [toggle])

  const onBackClick = () => {
    setEditView('accessories')
  }

  function updateCameraPosition() {
    if (!sceneManager) return
    if (view3dMode !== VIEW3D_MODE_CAR) return
    if(toggle === undefined || !toggle) return

    // Focus camera on B-wall if Air Purifier is selected
    if (toggle) {
      const copPos = (getPositions({type:TYP_COP_PRODUCT_1}) || []).join('')
      if(['B1','BX','B2','A1'].includes(copPos)) {
        sceneManager.lookAtWall('B')
      } else {
        sceneManager.lookAtWall('D')
      }
      return
    }
    return
  }

  return (      
    <div className="AirPurifier">        
      <EditorLayout heading={getText('ui-air-purifier-heading')} action={getText('ui-general-back')} actionClickHandler={onBackClick} >
        <ScrollBox>
            <SwitchButton toggle={toggle} label={getText('ui-air-purifier-add')} onChange={e => setToggle(e)} isDisabled={(disableRemove.indexOf(KCSM_AIR_PURIFIER)!==-1)} extraStyle={{textTransform:'unset'}} />

            <div className='info-heading'>
              {getText('ui-air-purifier-info-heading')}
            </div>
            <div className='info-content'>
              <p className='text'>
                {getText('ui-air-purifier-info-content')}
              </p>
              <p className="read-more" onClick={() => setShowDialogAirPurifier(true)}>
                { getText('ui-general-read-more')}
              </p>
            </div>

            <div className='sticker'>
              <img
                    className="image"
                    src={imgAirPurifier}
                    alt=""
                  />
              <div className='label'>
                {getText('ui-air-purifier-sticker-info')}
              </div>
            </div>

                        
          <div style={{height:'20px'}} />
        </ScrollBox>
      </EditorLayout>
      { showDialogAirPurifier && 
        <AirPurifierDialog onConfirm={() => setShowDialogAirPurifier(false)} onCancel={() => setShowDialogAirPurifier(false)} />
      }
    </div>
  )
}
export default AirPurifier;