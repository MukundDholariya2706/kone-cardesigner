import React, {useContext, useEffect } from 'react';

import { DesignContext } from '../design'
import BlueprintBuilder from './BlueprintBuilder';
import { ProductContext } from '../product';
import { LayoutContext } from '../layout';
import { Context3d } from '../3d';
import { CAR_SHAPE_DEEP, TYP_LCS_PRODUCT} from '../../constants';
import { createCaptureBlueprintFilters } from './blueprint-utils';
import { get3DQuality } from '../../utils/generalUtils';
import { renderImages } from '../../utils/renderImages';

let globalCarShape
let prevBlueprint

/**
 * Helper function to access currently selected car shape in global scope
 */
export function getCarShape() {
  return globalCarShape
}

export const BlueprintContext = React.createContext();

const blueprintBuilder = new BlueprintBuilder()

/**
 * Create component store
 * @function BlueprintProvider Blueprint store
 * @param {Object} props Properties passed to the provider
 */
export const BlueprintProvider =  ({ children }) => {
  const { product } = useContext(ProductContext)
  const { design, hasHorizontalCop, setDesignImages } = useContext(DesignContext)
  const { view3dMode } = useContext(LayoutContext)
  const { sceneManager, userHasInteract, quality } = useContext(Context3d)
  
  const build = ( force = false ) => {
    try {
      const { carShape = CAR_SHAPE_DEEP } = design || {}

      // update "global" car shape variablem
      globalCarShape = carShape
      
      const blueprintFilters = localStorage.getItem('copOnly') ? createCaptureBlueprintFilters({ componentTypes: [TYP_LCS_PRODUCT] }) : {}
      
      const bb = blueprintBuilder.build(design, { view: view3dMode, userHasInteract, quality, hasHorizontalCop, product, ...blueprintFilters })

      
      // Don't rebuild if the blueprint doesn't change.

      const check = !force && prevBlueprint && bb && JSON.stringify(prevBlueprint) === JSON.stringify(bb)

      if (check) {
        sceneManager.emit('complete')
        return;
      }
      
      prevBlueprint = JSON.parse(JSON.stringify(bb));

      // If image renderer is busy don't start build process
      if (!sceneManager.imageRenderer.rendering) {
        sceneManager.build(bb)
      }

    } catch (error) {
      console.error(error.message);
    }
  }

  useEffect(() => {
    blueprintBuilder.setStore(product)
  }, [product])

  useEffect(() => {    
    if (product && design) {
      build()
    }
  }, [design, view3dMode, userHasInteract, quality])

  useEffect(() => {    
    if (product && design) {
      build(true)
    }
  }, [quality])

  async function renderDesignImages() {
    if (!design) return
    const images = await renderImages({
      design,
      product,
      quality: get3DQuality(),
      blueprintBuilder,
      hasHorizontalCop,
      imageRenderer: sceneManager.imageRenderer,
      unneededImages: [],
      dryrun: false
    })

    setDesignImages(images)
    return images
  }
  
  return (
    <BlueprintContext.Provider value={{
      blueprintBuilder,
      rebuild: build,
      renderDesignImages
    }}>
      {children}
    </BlueprintContext.Provider>
  )
}
export default BlueprintProvider;

export const BlueprintConsumer = BlueprintContext.Consumer;