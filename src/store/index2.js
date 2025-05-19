import React from 'react';
import { LayoutProvider } from './layout';
import { BlueprintProvider } from './blueprint';
import { Provider3d } from './3d';

/**
 * Data provider (React Context API)
 * @function Provider Main dataprovider
 * @param {Object} props
 */
const Provider2 = ({ children }) => (
  <>
    <Provider3d>
      <LayoutProvider>
        <BlueprintProvider>

          {children}

        </BlueprintProvider>
      </LayoutProvider>
    </Provider3d>          
  </>
)

export default Provider2;