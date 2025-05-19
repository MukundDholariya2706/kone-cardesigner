import React, { useState, useContext, useEffect } from 'react';
import { DataContext } from '../data';
import { UserContext } from '../user';
import { SiteContext } from '../site';
import { resolve, reorder } from 'unicode-bidirectional/dist/unicode.bidirectional.min.js'; // For some reason unit tests fail to import without specific path.
import punycode from 'punycode';

export const TranslationContext = React.createContext({});

const missingStrings = {}

/**
 * Creates store for translations.
 * @function TranslationProvider Translation store
 * @param {Object} props Properties passed to the provider
 */
export const TranslationProvider =  ({ children }) => {
  const [ loading, setLoading ] = useState(false)
  const { loadTranslations, config, domainLanguage } = useContext(DataContext)
  const { isMarine } = useContext(SiteContext)

  const [ stringsByKey, setStringsByKey ] = useState(null)
  const [ stringsByKeyPDF, setStringsByKeyPDF ] = useState(null)
  const [ displayTranslationKeys, setDisplayTranslationKeys ] = useState(false)

  const { language, documentLanguage } = useContext(UserContext)

  function parseDocumentTranslation(documentTranslation, addressTranslation) {
    const valuesByKey = {}

    for (const item of documentTranslation) {
      const { key, value } = item

      if (
        key === 'pdf-office-address' ||
        key === 'pdf-office-name' ||
        key === 'pdf-office-phone' ||
        key === 'pdf-office-url'
        ) {
          const addressItem = addressTranslation.find(x => x.key === key)

          if (addressItem) {
            valuesByKey[key] = addressItem.value
          } else if (key) {
            valuesByKey[key] = value
          }
          
        } else if (key) {
          valuesByKey[key] = value
        }
    }

    return valuesByKey
  }

  function parseTranslation(translation) {
    const valuesByKey = {}

    for (const item of translation) {
      const { key, value } = item

      if (key) {
        valuesByKey[key] = value
      }
    }

    return valuesByKey
  }

  const loadStrings = async () => {
    // Don't load translations for the generator page.
    if (window.location.href.includes('/generator/')) {
      setStringsByKey({})
      return
    }
    setLoading(true)
    try {
      const result = await loadTranslations(language)

      const valuesByKey = parseTranslation(result)

      setStringsByKey(valuesByKey);

      setLoading(false);
    } catch (error) {
      // TODO: wait ... retry
      throw error
    }
  }

  const loadStringsPDF = async (injectedDocumentLanguage) => {
    try {
      const languageToLoad = injectedDocumentLanguage || documentLanguage || language
      const documentTranslation = await loadTranslations(languageToLoad)
      const domainTranslations = await loadTranslations(domainLanguage)

      const valuesByKey = parseDocumentTranslation(documentTranslation, domainTranslations)

      setStringsByKeyPDF(valuesByKey);

    } catch (error) {
      // TODO: wait ... retry
      throw error
    }
  }


  useEffect(() => {
    if (!config || !language) return
    loadStrings()
  }, [language, config])

  async function loadPDFTranslations(docLanguage) {
    try {
      await loadStringsPDF(docLanguage)
    } catch (err) {
      console.error(err)
      throw Error("Error when loading PDF translations.")
    }
  }

  function getTextPDF(key, writeDirection) {
    if (displayTranslationKeys) return key
    if (!key) return ''

     // Util for finding missing strings
    // if (language.code === "vi_VN") {
    //   if (stringsByKey[key] === undefined) {
    //     return `??? ${key}`
    //   } else {
    //     return '***'
    //   }
    // }

    let pdfString
    if(isMarine && stringsByKeyPDF[key+'_marine']) {
      pdfString = stringsByKeyPDF[key+'_marine'];
    } else {
      pdfString = stringsByKeyPDF[key] !== undefined ? stringsByKeyPDF[key] : key;
    }


    // create hex value (e.g 0xff) array from string 
    const stringDecoded = punycode.ucs2.decode(pdfString)

    // create levels (e.g [0,0,0,1,1,1,0,0,1]) from decoded array
    const stringLevels = resolve(stringDecoded, ( (writeDirection==='rtl') ? 1 : 0 ) );

    // go through all levels 
    let toBeMirrored=[]
    let toBeReordered=[]
    for(let i=0; i<stringLevels.length; i++) {
      if(stringLevels[i] === 1) {
        // if level value is 1 (RTL char) collect to the array toBeMirrored
        // no need to change the levels array because modifying only values that are 1
        toBeMirrored.push(stringDecoded[i])
      } else {
        let reversed=[]
        if(toBeMirrored.length>0) {
          reversed.push(...toBeMirrored.reverse())
          // TODO: figure out how to make spaces in correct places
          // TODO: special chars not to be made RTL
          /* if(reversed[0] === 32 && reversed[reversed.length-1] !== 32) {
            reversed.push(reversed.shift())
          } */
        }
        // if level value is something else than 1, push the array toBeMirrored to the final string array reversed
        toBeReordered.push(...reversed, stringDecoded[i])
        toBeMirrored=[]
      }
    }

    // if there were no level values differing 1 before the end of the string, push the collected array reversed to the final string
    if(toBeMirrored.length>0) {
      let reversed=[]
      reversed.push(...toBeMirrored.reverse())
      /* if(reversed[0] === 32 && reversed[reversed.length-1] !== 32) {
        reversed.push(reversed.shift())
      } */
      toBeReordered.push(...reversed)
    }

    // reorder the string according to the levels
    const stringReordered = reorder(toBeReordered, stringLevels);

    // encode reordered hex value array into string and return the string
    return punycode.ucs2.encode(stringReordered)
  }

  function getText(key) {

    if (displayTranslationKeys) return key
    if (!key) return ''
    if (!stringsByKey) return "░".repeat(8)

     // Util for finding missing strings
    // if (language.code === "vi_VN") {
    //   if (stringsByKey[key] === undefined) {
    //     return `??? ${key}`
    //   } else {
    //     return '***'
    //   }
    // }

    if(isMarine && stringsByKey[key+'_marine']) {
      return stringsByKey[key+'_marine']
    }

    if (!stringsByKey[key] === undefined) {
      missingStrings[key] = true;
      console.warn(`Translation is missing. Key: ${key}, All missing keys:`, missingStrings)
    }
    return stringsByKey[key] !== undefined ? stringsByKey[key] : key;
  }

  

  function hasText(key) {
    if (!key || !stringsByKey) return false
    return stringsByKey[key] ? true : false;
  }

  return (
    <TranslationContext.Provider value={{
      loading, getText, hasText, loadPDFTranslations, getTextPDF, displayTranslationKeys, setDisplayTranslationKeys,
    }}>
      { children}
    </TranslationContext.Provider>
  )
}
export default TranslationProvider;

export const TranslationConsumer = TranslationContext.Consumer;