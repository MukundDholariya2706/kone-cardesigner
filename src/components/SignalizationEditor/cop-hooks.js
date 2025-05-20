import { useMemo, useContext, useEffect } from 'react'
import { DesignContext } from '../../store/design/DesignProvider'
import { ProductContext } from '../../store/product/ProductProvider'
import { getComponentFromComponentsData } from './cop-utils'

export function usePosition(type) {
  const { design, getPositions, setPositions } = useContext(DesignContext)
  const position = useMemo(() => getPositions({ type })?.[0], [design])

  const setPosition = (pos) => setPositions({ type, positions: [pos] }) 

  return [ position, setPosition ]
}

export function usePositions(type) {
  const { design, getPositions, setPositions } = useContext(DesignContext)
  const positions = useMemo(() => getPositions({ type }), [design])

  const setPositionsResult = (pos) => setPositions({ type, positions: pos }) 

  return [ positions, setPositionsResult ]
}

/**
 * Hook for getting and setting components in the design.
 * @param {string} type type of component 
 * @param {boolean} shouldGetComponentItem if true, returns a fourth item in the array which includes the definition of the component in the product data.
 * @param {boolean} useLandingComponentsData if true, finds the fourth item in the array which includes the definition of the component in the product data from componentsData.
 * @returns {Array} [ componentId, setComponent, component, componentItem ]
 */
export function useComponent(type, shouldGetComponentItem=false, useLandingComponentsData=false, ) {
  const designCtx = useContext(DesignContext)
  const productCtx = useContext(ProductContext)

  const component = useMemo(() => {
    return designCtx.getComponent({ type, justId: false }) || {}
  }, [designCtx.design])

  const componentId = component.component
  function setComponent(id) {
    if (id === 'off') {
      designCtx.setComponent({ type, component: null })
    } else {
      designCtx.setComponent({ type, component: id })
    }
  }

  // Optionally get also the component object 
  const componentItem = useMemo(() => {
    if (!shouldGetComponentItem || !componentId) return null

    // this is made because the landing components might be coming from different signalization families and may not be included in products components table
    let componentFromComponentsData=null
    if (useLandingComponentsData) {
      componentFromComponentsData = getComponentFromComponentsData(component, productCtx)
    }
    
    if (componentFromComponentsData) return componentFromComponentsData
    
    return productCtx.getComponent({ id: componentId })
  }, [shouldGetComponentItem, componentId])

  // Component id and component separately just to speed up development
  // from old UI logic to new UI logic. TODO refactor to only use component?
  return [componentId, setComponent, component, componentItem]
}

export function usePart({ componentType, partType }) {
  const designCtx = useContext(DesignContext)
  const part = useMemo(() => {
    return designCtx.getPart({ componentType, partType }) || {}
  }, [designCtx.design])

  function setPart(id) {
    designCtx.setPart({ componentType, partType, component: id })
  }

  function setPartFinish(id) {
    designCtx.setPart({ componentType, partType, finish: id })
  }

  return [ part.component, part.finish, setPart, setPartFinish ]
}

export function useValidDisplay({ item, selectedType, selectedColor, setType, setColor }) {
  useEffect(() => {
    if (!item?.displayTypes) return
    const found = item.displayTypes.find(x => x.id === selectedType)

    if (!found) {
      if (item.displayTypes[0]) {
        setType(item.displayTypes[0].id)
      }
    } else {
      const hasColor = found.displayColors.find(x => x.id === selectedColor)

      if (!hasColor && found.displayColors[0]) {
        setColor(found.displayColors[0].id)
      }
    }
  }, [item, selectedType, selectedColor])
}