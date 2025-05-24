import React, { useState, useEffect } from 'react';
import axios from 'axios'

// Empty default config so no need to specify it for every unit test separately 
export const ConfigContext = React.createContext({ config: {}});

const Api_Endpoints = {
  QA1: {
    Public: 'https://qa-kcd3d.azurewebsites.net/api/public',
    Preview: 'https://qa-kcd3d.azurewebsites.net/api/preview'
  },
  QA2: {
    Public: 'https://qa-kcd3d-stage.azurewebsites.net/api/public',
    Preview: 'https://qa-kcd3d-stage.azurewebsites.net/api/preview'
  },
}

/**
 * Creates store for config.
 * @function ConfigProvider Config store
 * @param {Object} props Properties passed to the provider
 */
export const ConfigProvider =  ({ children}) => {

  const [config, setConfig] = useState((process.env.RUNNING_TEST ? {} :null))

  useEffect(() => {

    /* 
      env.json file defines the client side settings for a specific environment.
      In local dev mode it is not required, and instead the default config values (as defined below) are used.

      During development, instead of changing the config values below, it is preferable to create a local env.json file
      in the /public folder with the values. This file is not added to the repo, so it is local
      for each developer. This is useful for example if one developer is running the backend server
      in a different port than another developer; both can define their own env.json file to point to the
      correct localhost port.
    */
    axios.get('/env.json').then(result => {
      const isPreview = result.data.api_endpoint?.includes('/preview')
      setConfig({
        ...result.data,
        isPreview
      })
    }).catch(err => {
      if (process.env.NODE_ENV === "production") {
        throw Error("Error when loading the env.json file.")
      } else {
         const api_endpoint = Api_Endpoints.QA1.Preview
       // const api_endpoint = Api_Endpoints.QA1.Public
        //  const api_endpoint = Api_Endpoints.QA2.Preview
        // const api_endpoint = Api_Endpoints.QA2.Public
        //  const api_endpoint = "http://localhost:3030/api/preview"

        const isPreview = api_endpoint.includes('/preview')
        setConfig({
          clientID: '893879db-45d8-434c-a566-3fafc3bb4f29',
          // dev: false,
          dev: true,
          api_endpoint,
          ui_auth_required: isPreview,
          isPreview,
        })
      }
    })
  }, [])

  useEffect(() => {
    if (!config || !config.dev) return

    localStorage.setItem('OFFERING EUROPE','R23.2')
    localStorage.setItem('OFFERING EUROPE SOC','R25.1')
    localStorage.setItem('OFFERING RUSSIA','R22.1')
    localStorage.setItem('OFFERING MODULAR MODERNIZATION','R20.2')
    localStorage.setItem('OFFERING MODULAR MODERNIZATION SOC','R21.1')
    localStorage.setItem('OFFERING MODULAR MODERNIZATION SOC EXPORT','R21.1')
    localStorage.setItem('OFFERING FULL REPLACEMENT','R20.2')
    localStorage.setItem('OFFERING MARINE','R20.1')
    localStorage.setItem('OFFERING ENA','R20.2')
    localStorage.setItem('OFFERING ENA MODERNIZATION','R20.2')
    localStorage.setItem('OFFERING INDIA','R24.2')
    localStorage.setItem('OFFERING CHINA','R25.1')
    localStorage.setItem('OFFERING CHINA EXPORT','R25.1')
    
  }, [config])


  return (
    <ConfigContext.Provider value={{
      config
    }}>
      {config && children}
    </ConfigContext.Provider>
  )
}
export default ConfigProvider;

export const ConfigConsumer = ConfigContext.Consumer; 