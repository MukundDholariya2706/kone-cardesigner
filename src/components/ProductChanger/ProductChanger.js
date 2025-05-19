import './ProductChanger.scss';

import React, { useState, useEffect, useContext, useRef, useMemo } from 'react';
import { withRouter } from "react-router"
import Dropdown from '../../components/Dropdown'
import { ProductContext } from '../../store/product';
import { OfferingContext } from '../../store/offering';
import { TranslationContext } from '../../store/translation';
import { sortProducts } from '../../utils/generalUtils';
import { EXISTING_BUILDINGS } from '../../constants';


const ProductChanger = (props) => {
  const { buildingsType } = props
  const { offering } = useContext(OfferingContext)
  const { productId, loadProductWithId } = useContext(ProductContext)
  const { getText } = useContext(TranslationContext);
  const dropdown = useRef(null)
  
  // Separate state for the selected item so the selection does not disappear
  // when loading the newly selected product
  const [ selectedProductId, setSelectedProductId ] = useState() 
  
  const productsToUse = useMemo(() => {
    if (!offering) return []
    if (buildingsType === EXISTING_BUILDINGS) {
      return offering.filter(x => x.modernization)
    }

    return offering.filter(x => x.productFamily !== 'full-replacement' && x.productFamily !== 'modular-modernization' )
  }, [buildingsType, offering])

  const { name } = (productsToUse || []).find(item => item.id === selectedProductId) || {};

  useEffect(() => {
    if (!productId || selectedProductId) return
    setSelectedProductId(productId)
  }, [productId])

  const onProductSelect = (id) => {
    const oldPath = props.history.location.pathname
    const pathArray = oldPath.split('/')
    const index = pathArray.indexOf('predesigns')
    pathArray[index - 1] = id // in the path, replace the product part with the selected product id. 
    const newPath = pathArray.join('/')
    if (oldPath === newPath) return // don't do anything if the already selected product was selected.
    props.history.push(newPath)

    const releaseId = undefined // TODO

    loadProductWithId(id, releaseId)
    setSelectedProductId(id)
    dropdown.current.hide()
  }

  if (!selectedProductId) {
    return null
  }

  return (
    <div className="ProductChanger">
      <label className="mr-2">{getText('ui-gallery-change-product')}</label>
      <Dropdown label={getText(name)} ref={dropdown}>
        { productsToUse && sortProducts(productsToUse, getText)
          .map((product, index) => {     
          const selected = product.id === selectedProductId;
          
          return (
            <div key={index} 
              className={`
                product${selected ? ' selected' : ''}
                ${product.hasDesigns ? '' : ' disabled'}
              `} onClick={e => onProductSelect(product.id)} >
              <div className="product-name">{getText(product.name)}</div>
              <div className="product-description">{getText(product.description)}</div>
            </div>
          )
        }) }
      </Dropdown>
    </div>
  )
}
export default withRouter(ProductChanger);
