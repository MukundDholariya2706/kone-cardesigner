import React, { useState } from 'react';

export const CatalogContext = React.createContext();

/**
 * Creates catalog store
 * @function CatalogProvider Catalog store
 * @param {Object} props Properties passed to the provider
 */
export const CatalogProvider =  ({ children }) => {

  // TODO: My Designs from localStorage

  const [designs, setDesigns] = useState([]);

  return (
    <CatalogContext.Provider value={{
      designs, setDesigns
    }}>
      {children}
    </CatalogContext.Provider>
  )
}
export default CatalogProvider;

export const CatalogConsumer = CatalogContext.Consumer;