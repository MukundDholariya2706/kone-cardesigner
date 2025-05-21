import React, { useState, useContext } from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard';
import FormSelect from '../../../../components/FormSelect'
import Icon from '../../../../components/Icon'
import { LOCAL_STORAGE_DOCUMENT_LANGUAGE } from '../../../../constants';
import { DataContext } from '../../../../store/data/DataProvider'
import { TranslationContext } from '../../../../store/translation/TranslationProvider'
import { UserContext } from '../../../../store/user'
import { setAnalyticsForEvent } from '../../../../utils/analytics-utils'
import { formatTime, sortLanguages } from '../../../../utils/generalUtils'

import './ShareDesignArea.scss'
import LoadingAnimation from './LoadingAnimation';
import { ToastContext } from '../../../../store/toast';
import ButtonWithIcon from '../../../../components/ButtonWithIcon'
import Checkbox from '../../../../components/Checkbox';
import { DesignContext } from '../../../../store/design';
import { AuthContext } from '../../../../store/auth';
import { APIContext } from '../../../../store/api';
import ShareDialog from '../../../../components/ShareDialog';
import Info from '../../../../components/Info/Info';

function ShareDesignArea(props) {
  const { 
    onDownloadClick,
    saveAllowed,
    loading,
    error,
    executeRecaptcha,
    designUrl
  } = props

  const [ showShareDialog, setShowShareDialog ] = useState(false)
  const api = useContext(APIContext)
  const { getText } = useContext(TranslationContext)
  const { addToast } = useContext(ToastContext)
  const { documentLanguage, setDocumentLanguage } = useContext(UserContext)
  const { languages } = useContext(DataContext)
  const designCtx = useContext(DesignContext)
  const { design = {} } = designCtx
  const { loggedInUser, domainCountry } = useContext(AuthContext)
  const [ updating, setUpdating ] = useState(false)

  const showExpirationUI = loggedInUser && design.ownedDesign && domainCountry.requireAuth && !error && !designCtx.edited

  function onCopyClick(e) {
    addToast({ message: getText('ui-dialog-notification-copied'), autoDismiss: 4000 })
    setAnalyticsForEvent({
      eventName: 'Share your design - Copy Link',
      eventdata: {}
    })
  }

  async function handleUpdateClick() {
    setUpdating(true)
    
    try {
      await extendExpirationDate()
    } catch (err) {
      console.error(`Failed to extend the expiration time`, err)
      addToast({ type: 'error', message: getText('ui-unexpected-error') })
    } finally {
      setUpdating(false)
    } 
  }

  function handleShareClick() {
    setShowShareDialog(true)
  }

  function getInfoBoxText() {
    let result = ''
    if (!design?.expiresAt) return result

    result += getText('ui-expiring-link-info-public-until')
    
    const formattedDate = formatTime(design.expiresAt)
    result += ` ${formattedDate}. `

    const formattedExtendedDate = formatTime(design.extendedExpirationTime)

    const canExtend = formattedExtendedDate !== formattedDate

    if (canExtend) {
      result += getText(`ui-expiring-link-extend-info-pre-date`)
      result += ` ${formattedExtendedDate} `
      result += getText(`ui-expiring-link-extend-info-post-date`)
    }
    
    return (
      <>
        <span className="info-box-update-description">{result}</span>
        {
          canExtend &&
          <span onClick={handleUpdateClick} className={`update-button ${updating ? 'loading' : ''}`}>{getText('ui-expiring-link-extend-action')}</span>
        }
      </>
    )
  }

  async function extendExpirationDate(e) {
    if (!designCtx.hiddenId) return

    const { recaptchaToken, recaptchaNumber } = await executeRecaptcha()    
    
    const dataToSend = { recaptchaToken, recaptchaNumber }

    const newDesign = await api.post(`/predesign/${designCtx.hiddenId}/extend-expiration`, dataToSend, { requireAuth: true, withKeyToken: true })
    
    designCtx.setDesignProperty('expiresAt', newDesign.expiresAt)
  }

  async function saveDesignEditableState(state) {
    if (!designCtx.hiddenId || !design) return
    
    const originalState = !!design.editableByPublic

    designCtx.setDesignProperty('editableByPublic', state)

    try {

      const { recaptchaToken, recaptchaNumber, domain } = await executeRecaptcha()    
      
      const dataToSend = { domain, recaptchaToken, recaptchaNumber, editableByPublic: state }
      
      await api.post(`/predesign/${designCtx.hiddenId}/set-editable`, dataToSend, { requireAuth: true, withKeyToken: true })
    } catch (err) {
      console.error(`Failed to change the design state`, err)
      addToast({ type: 'error', message: getText('ui-unexpected-error') })

      // Revert the UI to the original state so it matches the design in DB (where nothing was changed).
      // Would need a loader animation and only set the design state after everything went OK in the backend but cannot really be done with a checkbox so instead using tricks.
      designCtx.setDesignProperty('editableByPublic', originalState) 
    }
  }


  return (
    <>
    <div className="ShareDesignArea">
      {
        saveAllowed &&
        <div className="ShareDesignArea__section design-link-section">
          <p className="ShareDesignArea__section-header">{getText('ui-share-design')}</p>
          <div className="ShareDesignArea__section-content">
            <div className="ShareDesignArea__icon-container">
              <Icon id="icon-share-url" />

            </div>
            <div className="content-container">
              {
                error ?
                  <p className="link-placeholder">{getText('ui-unexpected-error')}</p> :
                  loading || !designUrl ?
                    <>
                      <LoadingAnimation />
                      <p>{getText('ui-generating-link')}</p>
                    </> :
                    <>
                      <div className="link-container">
                        <a className="design-link" href={designUrl} target="_blank" rel="noopener noreferrer">{designUrl}</a>
                      </div>
                      <p className="design-link-info-text">{getText('ui-anyone-with-link')}</p>
                      <div className="buttons-container">
                        <CopyToClipboard text={designUrl} onCopy={onCopyClick}>
                          <ButtonWithIcon
                            iconId="icon-copy">
                            {getText('ui-general-copy')}
                          </ButtonWithIcon>
                        </CopyToClipboard>
                        <ButtonWithIcon
                          onClick={handleShareClick}
                          iconId="icon-contact">
                          {getText('ui-general-email')}
                        </ButtonWithIcon>
                        {showExpirationUI && <div className="checkbox-container">
                          <Checkbox
                            theme="white"
                            className="enable-editing-checkbox"
                            labelText={getText('ui-expiring-link-enable-editing')}
                            onChange={saveDesignEditableState}
                            selected={design?.editableByPublic}
                          />
                          <Info
                            text={getText('ui-expiring-link-enable-editing-i')}
                            effect="solid"
                            className="info-icon checkbox-info"
                            tooltipPlacement="right" />
                        </div>}
                      </div>
                    </>
              }
            </div>
          </div>
          {showExpirationUI && <div
            className={`ShareDesignArea__info-box`}
          >
            <div className="icon-container">
              <Icon id="icon-info-square" className="info-icon" />
            </div>
            <p className="info-box-text">{getInfoBoxText()}</p>
          </div>}
        </div>
      }
      <div className="ShareDesignArea__section download-section">
        <p className="ShareDesignArea__section-header">{getText('ui-download-pdf')}</p>
        <div className="ShareDesignArea__section-content">
          <FormSelect
            value={documentLanguage && documentLanguage.code}
            emptySelectionText={getText('ui-general-select-document-lang')}
            centerContent={false}
            size="big"
            options={sortLanguages(languages.all, getText).map(lang => {
              return {
                value: lang.code,
                text: getText(`lang-${lang.code}`)
              }
            })}
            onChange={val => {
              const newLanguage = languages.all.find(l => l.code === val)
              const languageToSet = newLanguage || { language: 'none' }
              localStorage.setItem(LOCAL_STORAGE_DOCUMENT_LANGUAGE, JSON.stringify(languageToSet))
              setDocumentLanguage(languageToSet)
            }}
          />
          <button disabled={!documentLanguage || !documentLanguage.language || documentLanguage.language === 'none'}
            onClick={e => onDownloadClick(true)}>
            {getText('ui-general-download')}
          </button>
        </div>
      </div>
    </div>
    { showShareDialog ? 
      <ShareDialog 
        closed={!showShareDialog}
        designId={designCtx.hiddenId} 
        onChange={val => setShowShareDialog(val)} 
        design={design}
        designName={designCtx.designName}
        designUrl={designUrl}
        designSaved={true}
        carImage={designCtx.designImages.find(image => image.id === 'angleFront')}/> 
      : null}
    </>
  )
}



export default ShareDesignArea