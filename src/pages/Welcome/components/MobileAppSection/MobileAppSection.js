import React, { useContext } from 'react'
import { TranslationContext } from '../../../../store/translation/TranslationProvider'
import appstoreBadge from '../../../../assets/images/react.svg'
import playstoreBadge from '../../../../assets/images/react.svg'
import qrCodeIOS from '../../../../assets/images/react.svg'
import qrCodeAndroid from '../../../../assets/images/react.svg'
import imgKoneCarDesignerAppForMobileDevices from '../../../../assets/images/react.svg'
import './MobileAppSection.scss'

function MobileAppSection(props) {

  return (
    <section className={`MobileAppSection ${props.wideImage ? 'wide-version' : ''}`}>
      { props.wideImage ?
        <WideContent /> :
        <DefaultContent />
      }
    </section>
  )
}

function WideContent(props) {
  const { getText } = useContext(TranslationContext)

  return (
    <article className="WideContent">
      <div className="background">
        <img src={imgKoneCarDesignerAppForMobileDevices} alt="" />
      </div>
      <div className="body">
        <div className="content-container">
          <h3 className="section-heading">{getText('ui-landing-mobile-car-designer-title')}</h3>
          <p className="body-text">{getText('ui-landing-mobile-car-designer-desc')}</p>
          <div className="store-links-bar">
            <span className="img-container">
              <img src={qrCodeIOS} alt="" className="qr-code" />
              <br />
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
            </span>
            <span className="img-container">
              <img src={qrCodeAndroid} alt="" className="qr-code" />
              <br />
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
            </span>
          </div>
        </div>
      </div>
    </article>
  )
}

function DefaultContent(props) {
  const { getText } = useContext(TranslationContext)

  return (
    <article className="card with-border reversed">
      <div className="media">
        <img src={imgKoneCarDesignerAppForMobileDevices} alt="" />
      </div>
      <div className="body">
        <h3 className="section-heading">{getText('ui-landing-mobile-car-designer-title')}</h3>
        <p className="body-text">{getText('ui-landing-mobile-car-designer-desc')}</p>
        <div className="store-links-bar">
          <span className="img-container">
            <img src={qrCodeIOS} alt="" className="qr-code" />
            <br />
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
          </span>
          <span className="img-container">
            <img src={qrCodeAndroid} alt="" className="qr-code" />
            <br />
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
          </span>
        </div>
      </div>
    </article>
  )
}

export default MobileAppSection