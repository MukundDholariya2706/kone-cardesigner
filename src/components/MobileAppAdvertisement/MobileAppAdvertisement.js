import React, {useContext} from 'react';

import './MobileAppAdvertisement.scss';
import Icon from '../Icon';
import { TranslationContext } from '../../store/translation/TranslationProvider';
import appstoreBadge from '../../assets/images/appstore_badge.png'
import playstoreBadge from '../../assets/images/playstore_badge.png'
import appgalleryBadge from '../../assets/images/appGallery_badge.png'
import qrCodeIOS from '../../assets/images/QR_code_AppStore.png'
import qrCodeAndroid from '../../assets/images/QR_code_PlayStore.png'
import qrCodeHuawei from '../../assets/images/QR_code_AppGallery.png'

/**
 * Renders out the top navigation bar in the 3D viewer
 * @function NavBar NavBar renderer
 * @param {Object} props Properties passed to this renderer
 */
const MobileAppAdvertisement = ({onClickHandler}) => {  
  const { getText } = useContext(TranslationContext);

  return (
    <div className={'MobileAppAdvertisement'}>  
      <div className="left">
        <div className="title">{getText('ui-general-mobile-app-ad-title')}</div>
        <div className="ingress">{getText('ui-general-mobile-app-ad-text')}</div>
      </div>
      <div className="right">
        <div className="osContainer">
          <img src={qrCodeIOS} alt="" className="qr-code" />
          <a
            className="img-container"
            href="https://apps.apple.com/app/kone-car-designer-app/id1490402365"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src={appstoreBadge}
              alt={getText('ui-general-ios-app')}
              className="store-badge"
            />
          </a>
        </div>
        <div className="osContainer">
          <img src={qrCodeAndroid} alt="" className="qr-code" />
          <a
            href="https://play.google.com/store/apps/details?id=com.kone.cardesignerapp"
            className="img-container"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src={playstoreBadge}
              alt={getText('ui-general-android-app')}
              className="store-badge"
            />
          </a>
        </div>
        <div className="osContainer">
          <img src={qrCodeHuawei} alt="" className="qr-code" />
          <a
            href="https://appgallery.huawei.com/#/app/C103879261"
            className="img-container"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src={appgalleryBadge}
              alt={getText('ui-general-huawei-app-gallery')}
              className="store-badge"
            />
          </a>
        </div>
      </div>
       
      <div className="close" onClick={e => onClickHandler()}>
        <Icon id="icon-remove-item" />
      </div>
    </div>
  )
}

export default MobileAppAdvertisement;
