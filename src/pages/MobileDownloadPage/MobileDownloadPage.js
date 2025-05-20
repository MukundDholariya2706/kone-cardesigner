import React, { useState, useContext, useEffect } from 'react'
import Button from '../../components/Button';

import Layout from '../../components/Layout';

import phonesImg from './images/phones.png'
import phonesImg2x from './images/phones@2x.png'
import appstoreBadge from '../../assets/images/react.svg'
import './MobileDownloadPage.scss'
import { TranslationContext } from '../../store/translation/TranslationProvider';
import { APIContext } from '../../store/api/APIProvider';
import { DataContext } from '../../store/data/DataProvider';

const APK_FILE_NAME = 'kone-car-designer-3d.apk'
const AWS_LOCATION = 'https://car-designer-china-prod.s3.cn-north-1.amazonaws.com.cn/downloads/apps'

export const DOWNLOAD_LINK = `${AWS_LOCATION}/${APK_FILE_NAME}`

export function MobileDownloadPage(props) {

  const { getText } = useContext(TranslationContext)
  const { domainCountry, countries } = useContext(DataContext)

  const api = useContext(APIContext)

  const [ version, setVersion ] = useState('')

  async function downloadAPK() {
    window.open(DOWNLOAD_LINK, '_blank')

    try {
      // Logging
      await api.post('/data/downloads', { version }, { withKeyToken: true })
    } catch (err) {
      // Do nothing. Not a big deal if logging fails
    }
  } 

  useEffect(() => {
    api.get(`/frontline/version/mobile`)
      .then(result => setVersion(result))
      .catch(err => {
        //
      })

    }, [])
    
    useEffect(() => {
      if (!domainCountry) return
      
      // This page is only available for some specific domains.
      if (!domainCountry.mobileDownloadPage) {
        props.history.push('/')
      }
  }, [domainCountry])

  // Needed for logging to work
  useEffect(() => {
    if (!countries) return
    // Related to recaptcha replacement.
    // So the backend knows where the user is.
    api.get('/check') 
  }, [countries])

  return (
      <div className="MobileDownloadPage">
        <div className="page-content">
          <div className="heading-container">
            <h2 className="sub-heading">{getText('mobile-download-and-install')}</h2>
            <h1 className="main-heading">{getText('mobile-download-app-name')}</h1>
          </div>
          <div className="content-container">
          <div className="image-container">
            <img srcSet={`${phonesImg} 1x, ${phonesImg2x} 2x`} />
          </div>
          <div className="text-container">
            <p className="text-container__description">
              { getText('mobile-download-app-description') }
            </p>
            <p className="text-container__action-text">
              { getText('mobile-download-and-install-version') } {version}
            </p>
            <div className="action-button-container android-action-button-container">
              <p className="action-button-container__text">
                { getText('mobile-download-for-android') }
              </p>
              <Button 
                className="action-button" 
                onClick={() => {
                  downloadAPK()
                }}
                theme={['sm', 'outline', 'primary', 'no-hover']}>
                  { getText('ui-general-download') }
              </Button>
            </div>
            <div className="ios-huawei-icons">
              <div className="action-button-container ios-action-button-container">
                <p className="action-button-container__text">
                  { getText('mobile-download-for-ios') }
                </p>
                <a
                  className="img-container action-button"
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
             
            </div>
          </div>
        </div>
        </div>
      </div>
  )
}

// Separating Layout because can't be bothered with it for unit tests...
function MobileDownloadPageWithLayout(props) {
  return (
    <Layout
      limitedWidth={true}
      showNavBar={false}
      stickyHeader={true}
      navBarClassName="hidden"
    >
      <MobileDownloadPage {...props} />    
      <div className="footer-div"></div>
    </Layout>
  )
}

export default MobileDownloadPageWithLayout