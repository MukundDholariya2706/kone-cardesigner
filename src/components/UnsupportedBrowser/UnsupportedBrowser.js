import './UnsupportedBrowser.scss';
import React, { useContext, useEffect } from 'react';
import { TranslationContext } from '../../store/translation';

import chromeIcon from '../../assets/icons/icon-chrome.png'
import firefoxIcon from '../../assets/icons/icon-firefox.png'
import safariIcon from '../../assets/icons/icon-safari.png'
import edgeIcon from '../../assets/icons/icon-edge.png'
import { useErrorLogger } from '../../utils/customHooks/customHooks';
import { ERROR_TYPES } from '../../constants';
import { DataContext } from '../../store/data';

/**
 * UnsupportedBrowser is a component to be
 * shown if user is using a unsupported browser 
 */
const UnsupportedBrowser = () => {  
  const { is3DCheckDone } = useContext(DataContext);
  const { getText } = useContext(TranslationContext);
  const logError = useErrorLogger()

  useEffect(() => {
    // Can't log before 3d check API request has completed because that API provides a necessary API key token.
    if (!is3DCheckDone) return

    logError({
      message: 'Unsupported browser',
      severity: ERROR_TYPES.UNSUPPORTED_BROWSER
    })
  }, [is3DCheckDone])

  return (
  <div className="UnsupportedBrowser">
    <div className="fullWindowContainer">
      <div className="spacer"></div>
      <div className="container">
        <h2>{getText('ui-unsupported-browser-head')}</h2>
        <p>{getText('ui-unsupported-browser-use-supported-browser')}<br></br>
        {getText('ui-unsupported-browser-supported-browsers')}
        </p>
        <div className="icon-container">
          <img src={chromeIcon} alt="Chrome" />
          <img src={firefoxIcon} alt="Firefox" />
          <img src={safariIcon} alt="Safari" />
          <img src={edgeIcon} alt="Edge" />
        </div>
      </div>
    </div>
  </div>
)}

export default UnsupportedBrowser;