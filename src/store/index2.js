import React from 'react';
import { BlueprintProvider } from './blueprint';
import LayoutProvider from './layout';
import Provider3d from './3d/shader-lib/Provider3d';

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