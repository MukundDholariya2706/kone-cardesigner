import React, { useContext, useMemo, useRef, useState, useEffect } from 'react';
import { DataContext } from '../data';
import { useHistory, useLocation } from "react-router-dom";
import { MARINE } from '../../constants';
import { APIContext } from '../api';
import { AuthContext } from '../auth';

export const SiteContext = React.createContext();

/**
 * Creates store for site (domain) related information.
 * @function SiteProvider Site store
 * @param {Object} props Properties passed to the provider
 */
export const SiteProvider =  ({ children }) => {
  const { domainRelatedData, domainCountry } = useContext( DataContext )

  const api = useContext(APIContext)
  const { loggedInUser } = useContext(AuthContext)

  const [ selectedBuildingsType, setSelectedBuildingsType ] = useState()
  const [ carDesignerBuildNumber, setCarDesignerBuildNumber ] = useState()

  const location = useLocation()
  
  const firstRender = useRef(false)

  const isMarine = useMemo(() => {
    return location.pathname === '/marine' || location.pathname.startsWith('/marine/')
  }, [location])

  const isKdi = useMemo(() => {
    return location.pathname.includes('/global')
  }, [location])
  
  let history = useHistory();
  let historyRef = useRef([]);

  // record users navigation history
  
  if (((historyRef.current.length && historyRef.current[historyRef.current.length-1]) || null) !== history.location.pathname) {
    historyRef.current.push(history.location.pathname)
  }

  useEffect(() => {
    api.loadFile('injectedData.json').then(result => {
      setCarDesignerBuildNumber(result.buildNumber)
    }).catch(err => {
      console.error('Error when loading injectedData.json', err)
    })
  }, [])

  // If the application ever goes from marine to non-marine state or vice-versa,
  // reload the application to initialize all the states correctly.
  // (should only happen when manually entering the URL, never in normal usage)
  useEffect(() => {
    if (firstRender.current === true) {
      window.location.reload()
    } else {
      firstRender.current = true
    }
  }, [isMarine])

  function goHome() {
    if (isMarine) {
      history.push('/marine')
    } else {
      history.push('/')
    }
  }

  const getPrivacyStatement = () => {
    if (!domainRelatedData || !Array.isArray(domainRelatedData)) {
      return undefined
    }

    const hostname = window.location.hostname;
    let defaultPrivacyStatement;

    for (const item of domainRelatedData) {
      const { domain, privacyStatement } = item;

      if ( domain === '*' ) {
        defaultPrivacyStatement = privacyStatement;
      }
      
      if ( domain && hostname && hostname.toLowerCase() === domain.toLowerCase() ) {
        return privacyStatement;
      }
    }

    return defaultPrivacyStatement
  }

  const back = () => {
    history.push(getBackLink())
  }

  const getBackLink = () => {

    if (history && history.location && history.location.pathname) {
      const pathname = history.location.pathname;
      const prev = getPrevPage()
      
      if (pathname.indexOf('/contact') !== -1) {
        return prev || (isMarine ? `/${MARINE}` :'/')
      } else if (pathname.includes('/predesigns')) {
        if (isKdi) {
          return `/${selectedBuildingsType}/selections/global`
        }

        return `/${selectedBuildingsType}/selections`
      } else if (pathname.includes('/edit/blank')) {
        if (isKdi) {
          return `/${selectedBuildingsType}/selections/global`
        }

        return `/${selectedBuildingsType}/selections`
      } else if (pathname.includes('/edit/custom')) {
        if (isKdi) {
          return `/${selectedBuildingsType}/selections/global`
        }

        return `/${selectedBuildingsType}/selections`
      } else if (pathname.includes('/edit/') || pathname.includes('/doc/')) {
        if (isMarine) {
          return `${pathname.substring(0, pathname.indexOf('/edit/'))}/predesigns`
        }
        
        if (domainCountry.requireAuth) {
          if (!loggedInUser) {
            return null
          }
        }

        return `/${selectedBuildingsType}/selections`
      } else if (pathname.includes('/specification/')) {      
        return pathname.replace('specification', 'edit')
      }
    }

    return (isMarine ? `/${MARINE}` : '/')
  }

  const getPrevPage = () => {
    return ((historyRef.current.length > 1) && historyRef.current[historyRef.current.length - 2]) || null;
  }

  const editPageOpen = () => {
    const thisUrl = window.location.href
    return (thisUrl.indexOf('/edit/') !== -1)
  }

  return (
    <SiteContext.Provider value={{
      getPrivacyStatement,
      back,
      getBackLink,
      getPrevPage,
      selectedBuildingsType,
      setSelectedBuildingsType,
      isMarine,
      goHome,
      carDesignerBuildNumber,
      editPageOpen,
    }}>
      { children }
    </SiteContext.Provider>
  )
}
export default SiteProvider;

export const SiteConsumer = SiteContext.Consumer;