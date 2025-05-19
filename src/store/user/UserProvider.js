import React, { useContext, useState, useEffect } from 'react';
import { LOCAL_STORAGE_LOCATION, LOCAL_STORAGE_ROLE, LOCAL_STORAGE_LANGUAGE, LOCAL_STORAGE_DOCUMENT_LANGUAGE, LOCAL_STORAGE_BUILDING_TYPE } from '../../constants';
import { setAnalyticsForPage} from '../../utils/analytics-utils'
import { AuthContext } from '../auth';

export const UserContext = React.createContext();

/**
 * Creates user store
 * @function UserProvider User store
 * @param {Object} props Properties passed to the provider
 */
export const UserProvider =  ({ children }) => {
  let initLang
  try {
    initLang = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LANGUAGE))
  } catch (err) {
    console.error("Failed to parse language from the local storage. Setting default.")
  }

  const { loggedInUser } = useContext(AuthContext)

  const [language, _setLanguage] = useState( (process.env.RUNNING_TEST ?{code:'fi_FI'} :initLang) );
  const [documentLanguage, setDocumentLanguage] = useState(JSON.parse(localStorage.getItem(LOCAL_STORAGE_DOCUMENT_LANGUAGE)))
  const [location, _setLocation] = useState( localStorage.getItem(LOCAL_STORAGE_LOCATION) );
  const [role, _setRole] = useState( localStorage.getItem(LOCAL_STORAGE_ROLE) );
  const [buildingType, _setBuildingType] = useState( localStorage.getItem(LOCAL_STORAGE_BUILDING_TYPE) );

  useEffect(() => {
    if (loggedInUser) {
      _setRole('sales')
      setAnalyticsForPage( { role:'sales'} )
    } else {
      // not logged in
    }
  }, [ loggedInUser ])

  const setLanguage = lang => {
    _setLanguage(lang);
    if (lang !== "none") { // Language is "none" for KTOC page, and it shouldn't be stored to local storage
      localStorage.setItem(LOCAL_STORAGE_LANGUAGE, JSON.stringify(lang));
    }
    let langCode = ''
    let countryCode =''
    let { code } = lang || {};
    (typeof code === 'string') && (langCode = code.split('_')[0]); // remove country definition
    (typeof code === 'string') && (countryCode = code.split('_')[1]); // remove language definition

    setAnalyticsForPage( { languageCountry:countryCode, language:langCode} )

  }
  const setLocation = name => {
    _setLocation(name);

    if (name === 'none') {
      return
    }
    
    localStorage.setItem(LOCAL_STORAGE_LOCATION, name);
  }
  const setRole = id => {
    if (loggedInUser) return // should always just be 'sales' for logged in users
    _setRole(id);
    localStorage.setItem(LOCAL_STORAGE_ROLE, id);
    setAnalyticsForPage( { role:id} )

  }
  const setBuildingType = type => {
    _setBuildingType(type);
    localStorage.setItem(LOCAL_STORAGE_BUILDING_TYPE, type);
  }

  return (
    <UserContext.Provider value={{
      language, setLanguage,
      location, setLocation,
      buildingType, setBuildingType,
      documentLanguage: documentLanguage || language, 
      setDocumentLanguage,
      role, setRole
    }}>
      {children}
    </UserContext.Provider>
  )
}
export default UserProvider;

export const UserConsumer = UserContext.Consumer;