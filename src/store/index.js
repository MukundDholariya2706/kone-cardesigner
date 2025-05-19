import React from 'react';
import axios from 'axios'
import axiosRetry from 'axios-retry'
import { DataProvider } from './data';
import { CatalogProvider } from './catalog';
import { OfferingProvider } from './offering';
import { ProductProvider } from './product';
import { DesignProvider } from './design';
import { UserProvider } from './user';
import { TranslationProvider } from './translation';
import { ConfigProvider } from './config';
import { APIProvider } from './api'
import { SiteProvider } from './site';
import { AuthProvider } from './auth/AuthProvider';
import { ToastProvider } from './toast';

// By default this retries for GET, HEAD, OPTIONS, PUT, DELETE if the response status is 500+.
// POST should never be retried without specific handler in the backend as well (which we don't have).
axiosRetry(axios, { 
  retries: 3, 
  retryDelay: retryCount => retryCount * 1500
})

/**
 * Data provider (React Context API)
 * @function Provider Main dataprovider
 * @param {Object} props
 */
export const Provider = ({ children, initialState = {}, dependencies = {} }) => {
  return (
    <>
      <ConfigProvider>
        <ToastProvider>
          <AuthProvider>
            <APIProvider axios={dependencies.axios || axios}>
              <UserProvider>
                <DataProvider initCountries={initialState.countries} initLanguages={initialState.languages}>
                    <SiteProvider>
                      <TranslationProvider >
                        <OfferingProvider >            
                          <ProductProvider initialProductState={initialState.product} >
                            <CatalogProvider>
                              <DesignProvider initialDesignState={initialState.design}>
  
                                { children }
  
                              </DesignProvider>
                            </CatalogProvider>
                          </ProductProvider>
                        </OfferingProvider>              
                      </TranslationProvider>
                    </SiteProvider>
                </DataProvider>
              </UserProvider>
            </APIProvider>
          </AuthProvider>
        </ToastProvider>
      </ConfigProvider>
    </>
  )
}

export default Provider;