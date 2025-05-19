import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../user';
import { ConfigContext } from '../config';
import { APIContext } from '../api';
import { AuthContext } from '../auth';
import { loadRecaptcha } from '../../components/Recaptcha';

export const DataContext = React.createContext()

/**
 * Loads data from external sources
 * @function DataProvider Data store
 * @param {Object} props Properties passed to the provider
 */
export const DataProvider =  ({ children, initCountries=null, initLanguages=null }) => {
  const { language, setLanguage } = useContext(UserContext)
  const { config } = useContext(ConfigContext)
  const api = useContext(APIContext)
  const auth = useContext(AuthContext)

  const [countryName, setCountryName] = useState('') // Name of the country for the product, used for api requests.

  const [countries, setCountries] = useState(initCountries)
  const [languages, setLanguages] = useState(initLanguages)
  const [domainLanguage, setDomainLanguage] = useState() // Used for init load or pdf address fields

  const [domainRelatedData, setDomainRelatedData] = useState(null)  
  const [translations, setTranslations] = useState(null)
  const [feedbackBannerSettings, setFeedbackBannerSettings] = useState(null)
  const [highResSettings, setHighResSettings] = useState(false)

  const [welcomePageUIState, setWelcomePageUIState] = useState() // Manages the welcome page section visibility per frontline country domain

  // Need to check this one specifically for unsupported browser view,
  // as the API request contains an API key token that is required for error logging to work.
  // (so the API request must be complete before trying to log any errors)
  const [ is3DCheckDone, setIs3DCheckDone ] = useState(false)

  const setDomainItem = (domainData) => {
    // const hostname = "preview-cardesigner.kone.com"
    // const hostname = "cardesigner.kone.cn"
    const hostname = window.location.hostname
    let domainItem = domainData.find(item => item.domain.toLowerCase() === hostname.toLowerCase())
    if (!domainItem) {
      throw Error('No matching domain in domain data')
    }

    // Setting the recaptcha value based on the domain.
    switch (domainItem.recaptcha) {
      case 1: 
        domainItem.recaptchaSiteKey = "6LeNq7sUAAAAAL-1ia4R2EkRcDuXfVL91MJnx92I"
        break
      case 2:
        domainItem.recaptchaSiteKey = "6Le6q7sUAAAAADG6n_80ikyFXbC5FLlWWWRFjJeQ"
        break
      case 3:
        domainItem.recaptchaSiteKey = "6LdMR74UAAAAABLIb3IWPMzDglEF__S6EeRhrto1" // DEV
        break
      case 4:
        domainItem.recaptchaSiteKey = "6Ld0R74UAAAAAK-SCMSCbNHXZMKYtN9xjA-3zlRo" // QA
        break
      default:
        // China
        domainItem.recaptchaSiteKey = null
    }

    // testing for china case
    // domainItem.youtubeDisabled = true

    auth.setDomainCountry(domainItem)
    return domainItem
  }

  const loadCountryList = async (domainCountry) => {
    const isMarine = window.location.href.includes('/#/marine')

    let list

    if (isMarine) {
      list = await await api.get('/data/all-countries')
    } else {
      list = await api.get('/frontline/countries')
    }

    setCountries(list)
  }

  const init = async () => {
    // No need to setup anything for the generator page.
    if (window.location.hash.split('/')[1] === 'generator') {
      document.body.style.display = "block"
      auth.setDomainCountry(true) // dummy value, otherwise page won't show
      return
    }

    const domainData = await loadDomainRelatedData()
    const domainItem = setDomainItem(domainData)
    const country = domainItem ? domainItem.name : undefined

    api.get(`/frontline/${country}/3d`).then(result => {
      setIs3DCheckDone(true)
      if (!result || !result.active3D) {
        console.log(">Redirecting to", window.location.host + '/2d/')
        window.location.replace(`${window.location.protocol}//${window.location.host}/2d/`)
        return
      } else {
        // The app is hidden until this point.
        document.body.style.display = "block"
      }
    })

    if (domainItem?.recaptchaSiteKey) {
      loadRecaptcha(domainItem.recaptchaSiteKey)
    }

    let loadLanguagesFor = country && country !== "*" ? country : 'global'
    
    if (window.location.href.includes('/#/marine')) {
      loadLanguagesFor = 'marine'
    }

    loadLanguages(loadLanguagesFor)
    loadCountryList(domainItem)

    api.get('/frontline/global/feedback-banner-settings').then(settings => {
      setFeedbackBannerSettings(settings)
    }).catch(err => {
      console.error('Could not fetch feedback banner settings')
    })

    api.get('/frontline/global/high-res-settings').then(settings => {
      setHighResSettings(settings)
    }).catch(err => {
      console.error('Could not fetch high resolution settings')
    })
  }
  

  const loadDomainRelatedData = async () => {
    try {
      const data = await api.get(`/frontline/domain_data?hostname=${window.location.hostname}`);
      const result = Array.isArray(data) ? data : [ data ]
      setDomainRelatedData(result);

      return result;
    } catch (err) {
      if (err.response.status === 404) {
        // Should only happen when /2d/ folder or similar.
        console.error("No domain related data found.")
      } else {
        throw Error(`Error when loading domain related data.`);
      }
    }
  }

  const loadLanguages = async (country = 'global') => {
    // Don't load languages for the generator page.
    if (window.location.href.indexOf('/generator/') !== -1) {
      setLanguages({ defaultLanguage: 'none' })
      return
    }
    try {
      const newLanguages = await api.get(`/translation/${country}/languages`)

      let domainLanguageToSet

      if (newLanguages.defaultLanguage) {
        domainLanguageToSet = newLanguages.defaultLanguage
      } else if (newLanguages.primary && newLanguages.primary.length > 0) {
        domainLanguageToSet = newLanguages.primary[0]
      } else if (newLanguages.all && newLanguages.all.length > 0) {
        domainLanguageToSet = newLanguages.all[0]
      } else {
        // Should not happen, but what if?
      }

      setDomainLanguage(domainLanguageToSet)
      setLanguages(newLanguages)
      return newLanguages
    } catch (err) {
      throw Error(`Error when loading languages for ${country}.`)
    }
  }

  const loadTranslations = async (language = {}) => {
    if (language === 'none') return
    setTranslations(null)
    try {
      const languageCode = language.code || 'en'
      const response = await api.get(`/translation/${languageCode}`)
      setTranslations(response.translation)
      return response.translation
    } catch (error) {
      throw Error(`${error} when loading translations.`)
    }
  }
  
  const loadSharedImages = async (images) => {

    if(!images || !images.length) return []

    let loadedImages =[]
    for(let i=0;i<images.length;i++) {
      const image = images[i]
      if(image && image.data) {
        try {
          const response= await axios.get(image.data,{responseType:'arraybuffer'})
          if(response && response.status === 200) {
            const imageData = 'data:image/png;base64,'+Buffer.from(response.data, 'binary').toString('base64')
            loadedImages.push(
              {...image,
                data:imageData
              }
            )
          }
        } catch (error) {
          return []
        }
      }
    }
     
    return loadedImages

  }

  const getCountryNameForCode = code => {
    if (!code) return
    if (code.length !== 3) return code
    // if (code.toLowerCase() === MARINE) return MARINE
    if (!countries) return
    const country = countries.find(c => c.alpha3.toLowerCase() === code.toLowerCase())
    if (!country) return
    return country.name
  }

  const developmentFilterObject = (data, releaseId) => {
    let retData ={}
    retData = data.filter( item => {
      if(!item.releases) {
        return true
      }
      if(item.releases.indexOf(releaseId) !== -1) {
        return true
      }
      return false
    })
    return retData
  }

  const developmentFilterObjectItem = (data, releaseId) => {
    if(!data.releases) {
      return true
    }
    if(data.releases.indexOf(releaseId) !== -1) {
      return true
    }
    return false
  }

  const developmentFilterStructure = (data, releaseId) => {
    let retData = {}
    if (!data) return
    const keys = Object.keys(data)

    keys.forEach(key => {
      if( typeof data[key] === 'object') {
        retData[key] = developmentFilterStructure(data[key], releaseId)
      }
      if( Array.isArray(data[key])) {
        const filteredData = developmentFilterObject(data[key],releaseId)
        let filteredArray=[]
        filteredData.forEach(item => {
          if(typeof item === 'object') {
            if(Object.keys(item).find(itemKey => typeof itemKey === 'object')) {
              filteredArray.push(developmentFilterStructure(item, releaseId))
            } else {
              let filteredItem = {}
              const itemKeys = Object.keys(item)
              itemKeys.forEach(itemKey => {
                if(Array.isArray(item[itemKey]) && typeof item[itemKey][0] === 'object') {
                  filteredItem[itemKey] = developmentFilterObject(item[itemKey],releaseId)
                } else {
                  filteredItem[itemKey] = item[itemKey]
                }                
              });
              filteredArray.push(filteredItem)
            }
          } else {
            filteredArray.push(item)
          }
        }) 
        retData[key]=filteredArray
      }
    })
    return retData
  }

  // Mimic the real backend functionality by serving out the correct data per release.
  const developmentFilterByRelease = (data, releaseId) => {
    let retData ={}
    retData.components = developmentFilterObject(data.components,releaseId)
    retData.componentFamilies = developmentFilterObject(data.componentFamilies,releaseId)
    retData.designs = developmentFilterObject(data.designs,releaseId)
    retData.finishMaterials = developmentFilterObject(data.finishMaterials,releaseId)
    retData.finishes = developmentFilterObject(data.finishes,releaseId)
    // retData.componentsData = developmentFilterStructure(data.componentsData,releaseId)
    retData.componentsData = developmentFilterStructure(data.componentsData,releaseId)

    const productRelease = data.productReleases.find(x => x.id === releaseId)

    const {id, ...releaseData} = productRelease

    retData = {
      ...retData,
      ...releaseData,
    }


    retData.productRelease = releaseId

    return {...data, ...retData}
  }

  const loadProductFamilies = async (countryId) => {
    let responseData
    try {
      const response = await axios.get('/product-families.json')
      
      responseData = response.data
    } catch (error) {
      console.log(error.response)
    }
    return responseData
  }

  const loadOffering = async (countryId) => {
    let offeringToUse

    // Get the country matching the countryId. If one does not exist, load the global offering.
    const countryName = getCountryNameForCode(countryId) || 'global'
    setCountryName(countryName)

    if (!config.dev) {
      const response = await api.get(`/frontline/${countryName}/available?with_designs=true`)
      offeringToUse = response.products
    } else {
      const response = await axios.get('/products.json')
      offeringToUse = response.data.filter(item => item.productReleases?.length > 0).map(item => {
        const releases = [...item.productReleases]
        releases[releases.length - 1].default = true

        // This structure mimics the structure that comes from the real API.
        // ProductFamilyContainer component expects this structure.
        return {
          ...item,
          releases,
          designs: item.designs.map(design => ({
            ...design,
            releases: releases.map(x => x.id) 
          }))
        }
      })
    }

    return offeringToUse
  }

  // Used for KTOC page
  const loadLocalData = async (productId, releaseId) => {
    const offeringData = await axios.get('/products.json')
    const localOffering = offeringData.data
    const product = localOffering.find(item => item.id === productId)

    const productData = await axios.get(product.url)
    const rules = await loadRules(null, releaseId)
    const localProduct = productData.data

    localProduct.rules = rules

    return { localOffering, localProduct }
  }

  const loadProduct = async ({ productId, releaseId, offering, countryName: countryNameToUse, withRules = true, fullDefinition }) => {
    const product = offering.find(item => item.id === productId)
    if (!product) {
      return
    }

    try {
      // Local file with all the data related to the product.
      const response = await axios.get(product.url)

      let modifiedData = response.data
      
      // console.log({struct: JSON.parse(JSON.stringify( modifiedData.componentsData.accessories))})
      // If dev, use the local data.
      if (config.dev) {
        let findRelease = localStorage.getItem(`OFFERING ${modifiedData.offeringLocation.toUpperCase()}`)

        // TODO remove hardcoding
        // if (productId === 'monospace-550') {
        //   findRelease = 'R21.2'
        // }

        const filteredData = developmentFilterByRelease(modifiedData, releaseId || findRelease)
        // console.log({struct: JSON.parse(JSON.stringify( filteredData.componentsData.accessories))})

        filteredData.rules = await loadRules(
          null,
          findRelease
        )

        return filteredData
      }
      
       try {
        let apiToUse = '/package'
        
        if (countryNameToUse || countryName) {
          apiToUse += `/${countryNameToUse || countryName}`
        } else {
          apiToUse += '/global'
        }

        apiToUse += `/${productId}`

        if (withRules) {
          apiToUse += `?with_rules=true`
        }
        
        // This is needed to make KTOC page not care about the actual configuration or even the json definition.
        // Instead any possible finish or component should be valid (full definition should include them all).
        if (fullDefinition) {
          apiToUse += `?full_definition=true`
        }

        if (releaseId) {
          apiToUse += `&releaseId=${releaseId}`
        }

        const dbProduct = await api.get(apiToUse)

        //
        modifiedData.carTypes = dbProduct.carTypes
        modifiedData.carShapes = dbProduct.carShapes
        modifiedData.componentsData = dbProduct.componentsData
        modifiedData.components = dbProduct.components
        modifiedData.finishes = dbProduct.finishes
        modifiedData.finishMaterials = dbProduct.finishMaterials
        modifiedData.componentFamilies = dbProduct.componentFamilies
        modifiedData.themes = dbProduct.themes
        modifiedData.designs = dbProduct.designs
        modifiedData.productRelease = dbProduct.productRelease
        modifiedData.name = dbProduct.name
        modifiedData.description = dbProduct.description
        modifiedData.rules = dbProduct.rules
        modifiedData.readMoreURLs = dbProduct.readMoreURLs
      } catch (err) {
        //
        throw err
      }
 
      return modifiedData
    } catch (error) {
      console.error('Error when loading product', error)
      throw Error(error)
    }
  }

  const loadRules = async (productInfo, releaseId) => {
    const release = releaseId ?releaseId :( productInfo ?(productInfo.productRelease || 'R19.2') :'R19.2')

    try {
      // Local file with all the data related to the product.
      const response = await axios.get(`rules_${release}.json`)
      
      const rules = response.data
      
      return rules

    } catch (error) {
      throw Error(`${error} when loading rules.`)
    }
  }

  useEffect(() => {
    if (!config) {
      return
    }
    init()
  }, [config])

  useEffect(() => {
    if (!languages || language) return 
    
    // If there is no language already set (e.g. from local storage),
    // set the default language after languages have been loaded.
    setLanguage(domainLanguage)
  }, [languages])

  return (
    <DataContext.Provider value={{
      config, countries, loadProductFamilies, loadOffering, translations, loadTranslations, loadProduct, loadSharedImages,
      languages, welcomePageUIState, setWelcomePageUIState, loadLocalData, loadRules,
      domainRelatedData, 
      domainCountry: auth.domainCountry, // Here for backwards compatibility (initially was defined in DataProvider and many components get it from here)
      domainLanguage, 
      countryName, 
      is3DCheckDone,
      getCountryNameForCode,
      feedbackBannerSettings,
      highResSettings
    }}>
      { auth.domainCountry && children }
    </DataContext.Provider>
  )
}
export default DataProvider;

export const DataConsumer = DataContext.Consumer;