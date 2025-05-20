import './App.scss';

// Note: Loader.scss is included here to prevent 
// flickering effect caused by lazy module loading.
// Reason: Loader components HTML is rendered before
// Styles are loaded / initialized
import '../Loader/Loader.scss' 
import playstoreBadge from '../../assets/images/playstore_badge.png'

import React, { useContext, useRef, useEffect } from 'react';

import { DataContext } from '../../store/data/DataProvider';
import { UserContext } from '../../store/user/UserProvider';
import { TranslationContext } from '../../store/translation/TranslationProvider';
import Icon from '../Icon';
import { setAnalyticsForPage} from '../../utils/analytics-utils'
import { getDomainDefinition } from '../../utils/generalUtils';

const modalRoot = document.getElementById('modal-root');

/**
 * This is the root rendering component for the application
 * @module /components/App Application component
 * @param {Object} props Properties passed to this renderer
 */
const App = ({ children }) => {
  const { getText, displayTranslationKeys } = useContext(TranslationContext)
  const { language } = useContext(UserContext)
  let { code = '' } = language || {};

  const [ langCode = '', countryCode = '' ] = code.split('_')
  const countryFromDomain = getDomainDefinition()

  setAnalyticsForPage( { country:countryFromDomain, language:langCode, languageCountry:countryCode} )

  const androidPromptRef = useRef();
  (typeof code === 'string') && (code = code.split('_')[0]); // remove country definition

  const promptEventRef = useRef()
  
  // 
  // Source of rtl language codes:
  // https://meta.wikimedia.org/wiki/Template:List_of_language_names_ordered_by_code
  // 
  const direction = ['ar', 'arc', 'dv', 'fa', 'ha', 'he', 'khw', 'ks', 'ku', 'ps', 'ur', 'yi'].indexOf(code) !== -1 ? 'rtl' : 'ltr';

  function handleBeforeInstall(e) {
      if (!androidPromptRef.current) return
      androidPromptRef.current.style.display = 'flex'
      // // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // // Stash the event so it can be triggered later.
      promptEventRef.current = e;
  }

  useEffect(() => {
    if (!androidPromptRef.current) return
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstall)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
    }
  }, [androidPromptRef])

  // add/remove rtl/ltr class for modal root elemet
  useEffect(() => {  
    const removedClass = direction === 'ltr' ? 'rtl' : 'ltr'

    if (modalRoot && modalRoot.classList && !modalRoot.classList.contains(direction)) {
      modalRoot.classList.add(direction);
    }
    if (modalRoot && modalRoot.classList && modalRoot.classList.contains(removedClass)) {
      modalRoot.classList.remove(removedClass);
    }    
  }, [direction])

  function closeAndroidPrompt() {
    if (androidPromptRef.current) {
      androidPromptRef.current.style.display = 'none'
    }
  }

  function handleInstallClick(e) {
    // hide our user interface that shows our A2HS button
    androidPromptRef.current.style.display = 'none'
    // Show the prompt
    promptEventRef.current.prompt()
    // Wait for the user to respond to the prompt
    promptEventRef.current.userChoice
      .then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the A2HS prompt');
        } else {
          console.log('User dismissed the A2HS prompt');
        }
        promptEventRef.current = null;
      })
  }

  let classes = `App ${direction}`

  if (code) {
    classes += ` lang-${code}`
  }

  if (displayTranslationKeys) {
    classes += ' displaying-translation-keys'
  }

  return (
    <div className={classes} >
      { children }
      <div className="android-prompt" ref={androidPromptRef}>
        {/* <Sprite src={logo} /> */}
        <div onClick={closeAndroidPrompt} className="close-icon">
          <Icon id="icon-close" />
        </div>
        <div className="install" onClick={handleInstallClick}>
          <span className="download">{getText('ui-general-download')}</span>
          <p>{getText('ui-mobile-home-header-2')}</p>
          <img
            src={playstoreBadge}
            alt={getText('ui-general-android-app')}
            className="store-badge"
          />
        </div>
      </div>
    </div>
  );
}

export default App;