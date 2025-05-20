import { useEffect, useContext, useRef, useState } from 'react'
import { ProductContext } from '../../store/product/ProductProvider'
import { OfferingContext } from '../../store/offering'
import { SiteContext } from '../../store/site'
import { useParams } from 'react-router'
import { EXISTING_BUILDINGS, NEW_BUILDINGS, MARINE } from '../../constants'
import { DesignContext } from '../../store/design/DesignProvider'
import { AuthContext } from '../../store/auth'
import { getDesignInformation } from '../designInformation'
import { getShareLink } from '../link-utils'
import { APIContext } from '../../store/api'
import { DataContext } from '../../store/data/DataProvider'

/**
 * If no product has been loaded yet, loads the product specified in the url.
 * If invalid product, redirects back home.
 * @param {Object} history
 */
export const useProductFromURL = (history) => {
  const { offering, error: offeringError } = useContext(OfferingContext)
  const { product, loading: productLoading, loadProductWithId } = useContext(ProductContext)
  const [ error, setError ] = useState(null)

  const { product: productInUrl, releaseId } = useParams()

  useEffect(() => {
    if (offeringError) {
      // This logic is all kinds of stupid but the current data loading setup does not allow for anything sensible...
      // Ideally the offering would be loaded here and errors were handled appropriately based on the error type / code.
      setError(new Error('Error loading the offering'))
      return
    }
    if (productLoading || !offering || !productInUrl) return

    if (product && product.id === productInUrl && product.productRelease === releaseId) return
    

    // Check if that product is part of the offering
    const result = offering.find((item) => item.id.toLowerCase() === productInUrl)

    if (!result) {
      console.error(`Failed to load product: no product in offering`)
      setError(new Error('Failed to load product, no product in offering'))
      return
    }

    loadProductWithId(result.id, releaseId, offering)
      .then(() => { /* all ok */ }, err => {
        console.error("Failed to load product:", err)
        setError(new Error(`Failed to load product: ${err?.message}`))
      })
  }, [offering, productInUrl, releaseId, offeringError])

  if (error) {
    // Throwing here instead of in the useEffect hook so that the ErrorBoundary can correctly catch the error and show the error page
    throw error
  }

  return { productId: productInUrl, releaseId }
}

export const useBuildingsType = () => {
  const siteCtx = useContext(SiteContext)

  const { country, buildingsType } = useParams()

  useEffect(() => {
    if (siteCtx.isMarine) {
      siteCtx.setSelectedBuildingsType(MARINE)
      return
    }

    const typeToSet = buildingsType === EXISTING_BUILDINGS 
      ? EXISTING_BUILDINGS 
      : buildingsType === MARINE 
      ? MARINE 
      : NEW_BUILDINGS

    siteCtx.setSelectedBuildingsType(typeToSet)
  }, [buildingsType, country])

  return siteCtx.selectedBuildingsType
}

/**
 * 
 * @param {Object} ref
 * @param {Function} fn 
 * @param {Object} options
 * @param {boolean=} options.ignoreCanvas
 */
export const useOnClickOutside = (ref, fn, options = {}) => {
  const { ignoreCanvas } = options

  const handleClick = (e) => {
    if (ignoreCanvas && e.target && e.target.nodeName === 'CANVAS') return
    if (ref && !ref.current.contains(e.target)) {
      fn()
    }
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClick)
    return () => {
      document.removeEventListener('mousedown', handleClick)
    };
  }, [])
}

// Used to disable body scrolling when a modal is open, while still
// preserving the position on the page.
export const useKeepPagePosition = () => {
  const scrollY = window.scrollY
  useEffect(() => {
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px` // Move the body up so the position stays.
    return () => {
      // When modal is closed, scroll to the position where the user was previously.
      const prevScrollY = document.body.style.top
      document.body.style.position = ''
      document.body.style.top = ''
      window.scrollTo(0, parseInt(prevScrollY || '0') * -1)
    }
  }, [])
}

// For checking if the user can go to the "edit" mode from the
// "view" mode of shared design (e.g. for Gendoc or Indian designs)
export const useIsDesignEditable = (injectedDesign) => {
  const { design } = useContext(DesignContext)
  const { loggedInUser, domainCountry } = useContext(AuthContext)

  if (loggedInUser) return true

  const designToUse = injectedDesign || design

  if (!designToUse) return false

  if (!domainCountry.requireAuth) return true

  return designToUse.ktoc || designToUse.editableByPublic
}

export const useDesignInformation = () => {
  const designStore = useContext(DesignContext)
  const productStore = useContext(ProductContext)
  const offeringStore = useContext(OfferingContext)

  function load() {
    return getDesignInformation({ designStore, productStore, offeringStore})
  }

  return load
}

export const useDesignUrl = () => {
  const designCtx = useContext(DesignContext)
  const siteCtx = useContext(SiteContext)
  const authCtx = useContext(AuthContext)
  
  return getShareLink(designCtx.hiddenId, siteCtx.isMarine, authCtx.domainCountry)
}

export const useErrorLogger = () => {
  const api = useContext(APIContext)
  const siteCtx = useContext(SiteContext)

  /**
   * 
   * @param {Object} errorData 
   * @param {string} errorData.message 
   * @param {string} errorData.severity 
   * @param {Object} errorData.stackTrace 
   */
  async function logError(errorData = {}) {
    if (process.env.NODE_ENV !== 'production') return

    try {
      await api.post('/logs/error/web', { 
        ...errorData, 
        build: siteCtx.carDesignerBuildNumber, 
        currentUrl: window.location.href,
      })
    } catch (err) {
      console.error('Failed to log error:', err)
    }
  }

  return logError
}

// https://overreacted.io/making-setinterval-declarative-with-react-hooks/
export function useInterval(callback, delay) {
  const savedCallback = useRef();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

export function useProjectCountry() {
  const offeringCtx = useContext(OfferingContext)
  const dataCtx = useContext(DataContext)

  const { countryCode } = offeringCtx

  if (!countryCode) return

  const countryName = dataCtx.getCountryNameForCode(countryCode)

  return { name: countryName, code: countryCode }
}

// Scroll bar is always on by default for the whole application (html in index.scss).
// Root element or even App component do not have access to router so cannot easily set a 
// css class for toggling the scrollbar, so instead doing it manually in page components (e.g. in Editor).
export function useHideScrollBar() {
  useEffect(() => {
    const element = document.querySelector('html')
    const originalValue = element.style.overflowY

    element.style.overflowY = 'hidden'
    
    return () => {
      element.style.overflowY = originalValue
    }
  }, [])
}