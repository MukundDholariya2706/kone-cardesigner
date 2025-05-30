import React, { useState, useContext } from 'react';
import { useHistory } from "react-router-dom"
import { AuthContext } from '../auth/AuthProvider';
import { ConfigContext } from '../config';

export const APIContext = React.createContext();

/**
 * Provider for API calls.
 * Separate context for these so the API calls used would always have the token auth included.
 */
export const APIProvider = ({ children, axios }) => {

  const history = useHistory()

  // A list of tokens received from the API on certain requests,
  // that is then send back to the server for validation
  // on POST requests.
  const [ keyTokens, setKeyTokens ] = useState([])

  const { config } = useContext(ConfigContext)
  const { getAPIHeaders, domainCountry } = useContext(AuthContext)


  let redirectTimer

   /**
   * @param {string} path - API path relative to the base api path 
   * @param {Object} options 
   * @param {boolean=} options.requireAuth - If auth token should be used always
   * @param {boolean=} options.includeAuth - If auth token should be used when logged in (but not required for most domains, exception India)
   * @param {boolean=} options.publicRoute - Wether to forcibly use the public route or not
   */
  const get = async (path, options = {}) => {
    const { requireAuth, includeAuth, publicRoute } = options
    const headers = await getAPIHeaders({ requireAuth, optionalAuth: includeAuth })

    headers['cd-domain'] = window.location.hostname

    const apiEndpoint = publicRoute ? config.api_endpoint.replace('preview', 'public') : config.api_endpoint
    
    let result

    try {
      result = await axios.get(`${apiEndpoint}${path}`, {
        headers
      })
    } catch (err) {
      const msg = err.response?.headers?.['error-message'] || err.message
      console.error(`Error for GET ${path}: ${msg}`)
      throw err
    }

    // Recaptcha replacement solution.
    // There should be three tokens sent to the server on post requests.
    if (result.headers['x-key-token']) {
      // Max three tokens. The tokens have to be in
      // order by time so the first one is removed when
      // a new one is received.
      if (keyTokens.length === 3) {
        keyTokens.shift()
      }

      // Get the token from the header and add it to the list.
      keyTokens.push(result.headers['x-key-token'])

      setKeyTokens(keyTokens)

      clearTimeout(redirectTimer)
      
      // Redirect the user back to either the welcome page
      // or the editor if there has not been a new token
      // after a while. This is because the token times out,
      // so new one needs to be generated by going to the
      // contact page or the specification page again.
      // This should basically only happen if the user leaves
      // the Car Designer idle for an hour on these pages.
      redirectTimer = setTimeout(() => {
        if (history && history.location) {
          console.log('Token timeout! Redirecting')
          const { pathname } = history.location
          if (pathname === '/contact') {
            history.push(pathname.replace('contact', ''))
          } else if (pathname.includes('specification')) {
            history.push(pathname.replace('specification', 'edit'))
          }
        }
      }, 1000 * 60 * 60) // One hour
    }

    return result.data
  }

  /**
   * 
   * @param {string} path - API path relative to the base api path 
   * @param {*} data - Data to send with the POST 
   * @param {Object} options 
   * @param {boolean=} options.requireAuth - If auth token should be used
   * @param {boolean=} options.includeAuth - If auth token should be used when logged in (but not required for most domains, exception India)
   * @param {boolean=} options.withKeyToken - If API token should be used (recaptcha replacement)
   */
  const post = async (path, data, options = {}) => {
    const { requireAuth, withKeyToken, includeAuth } = options

    const headers = await getAPIHeaders({ requireAuth, optionalAuth: includeAuth }) 

    if (withKeyToken) {
      // Create a combined token from the list.
      // The separator has to be ':' or the token validation fails.
      headers['x-key-token'] = keyTokens.join(':')
    }

    headers['cd-domain'] = window.location.hostname

    try {
      const result = await axios.post(`${config.api_endpoint}${path}`, data, { 
        headers
      })
      
      return result.data
    } catch (err) {
      const msg = err.response?.headers?.['error-message'] || err.message
      console.error(`Error for POST ${path}: ${msg}`)
      throw err
    }
  }

   /**
   * 
   * @param {string} path - API path relative to the base api path 
   * @param {Object} options 
   * @param {boolean=} options.requireAuth - If auth token should be used
   */
  const deleteOperation = async (path, options = {}) => {
    const { requireAuth } = options
    
    const headers = await getAPIHeaders({ requireAuth })

    // Could probably use either 'origin' or 'host' headers in the backend instead of manually inserting the domain but this guarantees that the header always matches the value that is configured in the backend data.
    if (domainCountry?.domain) {
      headers['cd-domain'] = domainCountry.domain
    }
    
    try {
      const result = await axios.delete(`${config.api_endpoint}${path}`, { headers })
      return result
    } catch (err) {
      const msg = err.response?.headers?.['error-message'] || err.message
      console.error(`Error for DELETE ${path}: ${msg}`)
      throw err
    }
  }

  // For loading files that are not necessarily available in the /src directory
  // but are included in /public or /build (e.g. env.json, content json files etc.)
  const loadFile = async (path) => {
    const result = await axios.get(path)
    return result.data
  }

  const getApiUrl = async (path) => {
    return `${config.api_endpoint.replace('preview', 'public')}${path}`
  }

  return (
    <APIContext.Provider value={{
      get, post, delete: deleteOperation, loadFile, getApiUrl
    }}>
      {children}
    </APIContext.Provider>
  )
}
export default APIProvider;

export const APIConsumer = APIContext.Consumer;