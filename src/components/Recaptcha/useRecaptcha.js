import { useEffect, useContext } from 'react'
import { DataContext } from '../../store/data'

/**
 * A custom hook for handling recaptcha.
 * @param {string=} actionOnInit - the action to execute on initialization. If empty, no action is executed. 
 * @param {Object} options
 * @param {Boolean=} options.visible - If the badge should be visible or not.
 * @param {Boolean=} options.handleBadgeVisibility - If the component that uses the hook should handle the visiblity or not. Useful if there are several components using recaptcha on the same page.
 */
const useRecaptcha = (actionOnInit, options = {}) => {
  const { domainCountry = {} } = useContext(DataContext)
  const { handleBadgeVisibility: shouldHandleBadgeVisibility = true } = options
  const sitekey = domainCountry.recaptchaSiteKey
  
  /**
   * Executes the recaptcha and returns a recaptcha token and number if succesful.
   * @param {string} action - Action to execute the recaptcha with.
   */
  const executeRecaptcha = async (action) => {
    const ready = sitekey && window && window.grecaptcha && window.grecaptcha.execute

    if (!ready) {
      return {}
    }

    const token = await window.grecaptcha.execute(sitekey, { action })
    return { recaptchaToken: token, recaptchaNumber: domainCountry.recaptcha, domain: domainCountry.domain }
  }

  useEffect(() => {
    return () => {
      // Hide badge when component dismounts
      handleBadgeVisibility({ visible: false })
    }
  }, [])

  // Apparently executing recaptcha often increases its accuracy.
  // (or so Google says so they can gather more data, probably...)
  useEffect(() => {
    if (!domainCountry) return
    if (actionOnInit) {
      executeRecaptcha(actionOnInit)
    }

    handleBadgeVisibility(options)
    
  }, [domainCountry])

  function waitToHandleBadgeVisiblity(ops) {
    setTimeout(() => {
      handleBadgeVisibility(ops)
    }, 100);
  }

  /**
   * Sets the recaptcha badge visibility to the one specified in options.
   */
  function handleBadgeVisibility(ops = {}) {
    if (!shouldHandleBadgeVisibility) return
    const badge = document.getElementsByClassName('grecaptcha-badge')[0]
    // Badge is not immediately set on the page when the app is first loaded
    // --> wait and retry
    if (!badge) {
      waitToHandleBadgeVisiblity(ops)
    } else {
      const {
        visible
      } = ops

      setBadgeVisibility(badge, visible)
    }
  }

  function setBadgeVisibility(badge, visible) {
    if (visible) {
      badge.style.visibility = 'visible'
    } else {
      badge.style.visibility = 'hidden'
    }
  }

  return executeRecaptcha
}


export default useRecaptcha