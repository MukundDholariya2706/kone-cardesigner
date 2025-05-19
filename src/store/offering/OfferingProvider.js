import React, { useState, useContext, useEffect } from 'react'
import { DataContext } from '../data'
import { LOCAL_STORAGE_PROJECT_LOCATION, EXISTING_BUILDINGS, NEW_BUILDINGS, MARINE } from '../../constants'

import { setAnalyticsForPage} from '../../utils/analytics-utils'

export const OfferingContext = React.createContext()


/**
 * Creates store for offering.
 * Serves products based on selected country.
 * @function OfferingProvider Offering store
 * @param {Object} props Properties passed to the provider
 */
export const OfferingProvider =  ({ children }) => {
  const { countries, loadProductFamilies, loadOffering, domainCountry } = useContext(DataContext)
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [productFamilies, setProductFamilies] = useState([])
  const [offering, setOffering] = useState()
  const [countryCode, _setCountryCode] = useState()
  const [countryCodeInitialized, setCountryCodeInitialized] = useState(false)

  const setCountryCode = id => {
    if (!id) {
      _setCountryCode(undefined)
      return
    }

    setAnalyticsForPage( { projectCountry:id.toUpperCase()} )

    _setCountryCode(id.toUpperCase())
  }

  // When countryCode changes, load and set the corresponding offering.
  useEffect(() => {
    setOffering(null)
    if (!countryCode) return
     
    // Don't automatically load the offering for share or generator page.
    if (
      window.location.hash.includes('/share/') || 
      window.location.hash.includes('/doc/') || 
      window.location.hash.includes('/generator/')) {
      return
    }

    load(countryCode)
    
  }, [countryCode])

  useEffect(() => {
    if (!countries || countries.length === 0) return

    initCountryCode()
    setCountryCodeInitialized(true)

  }, [countries])

  /**
   * Loads and sets the offering for a country.
   * @param {string} code - Three character country code 
   */
  async function load(code) {
    setLoading(true)
    try {
      const families = await loadProductFamilies(code)
      const result = await loadOffering(code)
      // const sorted = sortProducts(result, getText)

      const familiesToUse = families.map(x => {
        if (code.toLowerCase() === MARINE) {
          return { type: MARINE, ...x }
        }

        if (x.id === 'full-replacement' || x.id === 'modular-modernization') {
          return { type: EXISTING_BUILDINGS, ...x }
        }

        return { type: NEW_BUILDINGS, ...x }
      })

      setProductFamilies(familiesToUse)


      const availableKdiOfferingLocations = [
        'Europe', 'Full Replacement', 'Modular Modernization', 'China Export'
      ]

      // Only show specific products for global offering (kdi)
      // TODO this breaks the page refresh functionality when coming from KTOC
      // for products that are not in the available offering locations (e.g. India).
      // Solution: KTOC routes should have 'ktoc' instead of 'global' and then that gets converted
      // to 'global' in API requests. (Alternatively KDI could have 'kdi' instead of 'global'.)
      const filteredResult = code.toLowerCase() === 'global' ? 
        result.filter(product => {
          return availableKdiOfferingLocations.includes(product.offeringLocation)
        }) : result

      setOffering(filteredResult)
      setLoading(false)
      return { offering: result, productFamilies: familiesToUse }
    } catch (err) {
      setError(err)
      setLoading(false)
    }
  } 

  function initCountryCode(alpha3) {
    if (countryCode) return
    
    if (alpha3) {
      _setCountryCode(alpha3.toUpperCase())
      return
    } 
    
    const codeFromUrl = getCountryCodeFromUrl()

    if (codeFromUrl) {
      _setCountryCode(codeFromUrl.toUpperCase())
      return
    }

    const codeFromLocalStorage = localStorage.getItem(LOCAL_STORAGE_PROJECT_LOCATION)
    
    if (codeFromLocalStorage) {
      _setCountryCode(codeFromLocalStorage.toUpperCase())
      return
    }

    if (domainCountry.alpha3 !== '*') {
      _setCountryCode((domainCountry.alpha3 || '').toUpperCase())
    }
  }

  function getCountryCodeFromUrl() {
    const urlParts = window.location.hash.split('/')
    
    const specialCases = ['global', 'ktoc', MARINE, 'kdi-distributors', 'latin-america-distributors']
    // TODO use route information on the page component instead of relying on the
    // url structure to match this.
    const countryPart = urlParts.find(x => x.length === 3 || specialCases.includes(x.toLowerCase()))
    if (countryPart) {
      if (specialCases.includes(countryPart)) return countryPart

      const alpha3 = countryPart.toLowerCase()

      // Check if a country with that alpha3 exists
      const result = countries.find(c => c.alpha3.toLowerCase() === alpha3)
      if (result) {
        return alpha3
      }
    }
  }

  return (
    <OfferingContext.Provider value={{
      load, loading, error, productFamilies, offering, countryCode, setCountryCode, setOffering, countryCodeInitialized
    }}>
      {children}
    </OfferingContext.Provider>
  )
}
export default OfferingProvider

export const OfferingConsumer = OfferingContext.Consumer