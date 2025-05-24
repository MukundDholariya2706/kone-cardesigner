import React, { useState, useContext, useEffect, useMemo, useRef } from 'react';
import * as msal from "@azure/msal-browser";
import axios from 'axios'
import { ConfigContext } from '../config';


export const AuthContext = React.createContext();


export const AuthProvider = ({ children }) => {
  const { config } = useContext(ConfigContext)

  // Domain country needed here to check if any specific domain should use auth or not.
  const [ domainCountry, setDomainCountry ] = useState()

  const [loggedInUser, setLoggedInUser] = useState()
  const [profilePhoto, setProfilePhoto] = useState()
  const [ready, setReady] = useState(false) // Ready to show the application?

  const authRequired = config.ui_auth_required && !window.location.hash.includes('/generator/')

  const msalApp = useMemo(async () => {
    const msalObj = await new msal.PublicClientApplication({
      auth: {
        clientId: '893879db-45d8-434c-a566-3fafc3bb4f29',
        authority: 'https://login.microsoftonline.com/kone.onmicrosoft.com',
        validateAuthority: true,
        redirectUri: `${window.location.protocol}//${window.location.host}`,
        // navigateToLoginRequestUrl: true,
        // postLogoutRedirectUri: '/',

      },
      cache: {
        cacheLocation: 'localStorage',
        storeAuthStateInCookie: true,
      }
    })

    await msalObj.handleRedirectPromise().then(async tokenResponse => {
      let accountObj = null
      if (tokenResponse) {
        accountObj = tokenResponse.account
      } else {
        const currentAccounts = msalObj.getAllAccounts()
        if (!currentAccounts?.length) {
          // No user signed in
          if (authRequired) {
            signIn()
          } else {
            setReady(true)
          }
          return
        } else {
          // Can there be more than one? If so, which one to choose?
          accountObj = currentAccounts[0]
        }
      }
      
      if (accountObj) {
        msalObj.setActiveAccount(accountObj)

        const headers = await getAuthHeaders(GRAPH_REQUESTS.USER)

        const graphEndpointAccount = 'https://graph.microsoft.com/v1.0/me'
        // photo not used as I have no clue what the valid response would be
        // (there is no photo setup for dev team accounts)
        // const graphEndpointPhoto = 'https://graph.microsoft.com/v1.0/me/photo/$value'

        const userResponse = await axios.get(graphEndpointAccount, { headers })
        setLoggedInUser(userResponse.data)

        setReady(true)
      }

    }).catch(err => {
      console.error('Failed getting account token response', err)

      if (!authRequired) {
        setReady(true)
      } 
    })

    return msalObj
  }, [])

  const GRAPH_REQUESTS = {
    USER: {
      scopes: ['User.Read']
    },
    API: {
      // For Car Designer APIs
      scopes: ['api://893879db-45d8-434c-a566-3fafc3bb4f29/API'],
    }
  }

  async function getAPIHeaders({ requireAuth, optionalAuth }) {
    if (requireAuth || authRequired) {
      return getAuthHeaders(GRAPH_REQUESTS.API)
    }

    // optionally attaching auth tokens for if logged in user so some actions can be personalized for specific users, for example logged-in users can rename the designs they have created later on.
    if (optionalAuth) {
      try {
        return await getAuthHeaders(GRAPH_REQUESTS.API, { redirect: false })
      } catch (err) {
        // No logged in user, but it is optional so no need to do anything
      }
    }

    return {}
  }

  async function getAuthHeaders(scopes, options = {}) {
    const token = await acquireToken(scopes, options.redirect)

    if (!token) return {}

    return {
      Authorization: `Bearer ${token.accessToken}`, // the token is a variable which holds the token
      'skip-user': 'true', // This header skips fetching the whole user in the server side.
    }
  }

  async function acquireToken(request, redirect = true) {
    try {
      const token = await msalApp.acquireTokenSilent(request)
      if (!token) {
        throw new Error('No token')
      }

      return token
    } catch (err) {
      if (redirect) {
        console.error('Failed to get token silently', err)
        return msalApp.acquireTokenRedirect(request)
      } else {
        throw err
      }
    }
  }

  async function signIn() {
    msalApp.loginRedirect(GRAPH_REQUESTS.USER)
  }

  async function signOut() {
    msalApp.logoutRedirect()
  }

  return (
    <AuthContext.Provider value={{
      getAPIHeaders, 
      signIn, 
      signOut, 
      loggedInUser, 
      profilePhoto,
      domainCountry, setDomainCountry,
    }}>
      {ready && children}
    </AuthContext.Provider>
  )
}
export default AuthProvider;

export const AuthConsumer = AuthContext.Consumer;