import React, { useContext, useEffect, useState } from 'react'
import { APIContext } from '../../store/api'
import { DataContext } from '../../store/data/DataProvider'
import { TranslationContext } from '../../store/translation/TranslationProvider'
import Icon from '../Icon'
import './OpenSurveyBanner.scss'

const LOCAL_STORAGE_KEY_SURVEY_BANNER_SHOWN = 'SURVEY_BANNER_LAST_SHOWN'

/**
 *
 * @param {Object} props
 * @param {string=} props.className
 */
function OpenSurveyBanner(props) {
  const { className = '', onButtonClick } = props

  const { getText } = useContext(TranslationContext)
  const dataCtx = useContext(DataContext)
  const { feedbackBannerSettings } = dataCtx 
  const api = useContext(APIContext)
  const [ visible, setVisible ] = useState(false)


  // Survey banner timer TODO move logic to a custom hook
  useEffect(() => {
    // Whether to show or not is set in the Admin Tool
    if (!feedbackBannerSettings) return
    if (!feedbackBannerSettings.show) return

    const value = localStorage.getItem(LOCAL_STORAGE_KEY_SURVEY_BANNER_SHOWN)

    if (isNaN(value)) {
      // Invalid value
      localStorage.removeItem(LOCAL_STORAGE_KEY_SURVEY_BANNER_SHOWN)
    } else {
      const now = Date.now()
      const lastShownTime = Number(value)

      if (lastShownTime + feedbackBannerSettings.showBannerCooldownSeconds * 1000 > now) {
        // Banner already shown once recently, don't show again
        return
      }
    }

    const timeoutId = setTimeout(() => {
      setVisible(true)
    }, 60 * 1000)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [api, feedbackBannerSettings])

  function handleCloseSurveyBanner() {
    setVisible(false)
    localStorage.setItem(LOCAL_STORAGE_KEY_SURVEY_BANNER_SHOWN, Date.now())
  }

  function handleButtonClick() {
    handleCloseSurveyBanner()
    onButtonClick()
  }

  return (
    <div
      data-testid="OpenSurveyBanner"
      className={`OpenSurveyBanner ${className} ${visible ? 'positioned' : ''}`}
    >
      <p className="banner-heading">{getText('ui-survey-banner-heading')}</p>
      <p className="banner-description">
        {getText('ui-survey-banner-description')}
      </p>
      <div onClick={handleButtonClick} className="action-button btn btn-kone-blue">
        {getText('ui-survey-banner-open-survey')}
      </div>
      <div onClick={handleCloseSurveyBanner} className="close-button">
        <Icon id="icon-close-colorless" />
      </div>
    </div>
  )
}

export default OpenSurveyBanner
