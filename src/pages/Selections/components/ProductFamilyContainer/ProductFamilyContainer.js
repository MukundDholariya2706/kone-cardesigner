import React, { useMemo, useContext } from 'react'
import { AuthContext } from '../../../../store/auth'
import { ProductContext } from '../../../../store/product/ProductProvider'
import { TranslationContext } from '../../../../store/translation/TranslationProvider'
import { sortProducts } from '../../../../utils/generalUtils'
import ProductContainer from '../ProductContainer/ProductContainer'

import './ProductFamilyContainer.scss'

function ProductFamilyContainer(props) {
  const { id, name, description, image, products, selectedProduct, setSelectionValues } = props
  
  const { loggedInUser } = useContext(AuthContext)
  const { getText } = useContext(TranslationContext)
  const { setProductId, setReleaseId } = useContext(ProductContext) 



  const sortedProducts = useMemo(() => {
    return sortProducts(products, getText)
  }, [products])

  function onProductSelection(productId, releaseId, selected) {
    // 'on' / 'off' toggle behavior (open / closed). 
    if (!selected) {
      setProductId(null)
      setReleaseId(null)
      setSelectionValues(null)
      return
    }
    
    setProductId(productId)

    if (loggedInUser) {
      setReleaseId(releaseId)
    } else {
      // Nulling possible existing releaseId value for non-KONE users
      setReleaseId(null)
    }
  }

  return (
    <div className="ProductFamilyContainer">
      <div className="ProductFamilyContainer__header">
        <div className="ProductFamilyContainer__image-container">
          <img src={image} />
        </div>
        <div className="ProductFamilyContainer__info">
          <h3 className="ProductFamilyContainer__title">{getText(name)}</h3>
          <p className="ProductFamilyContainer__desc">{getText(description)}</p>
        </div>
      </div>
      <div className="ProductFamilyContainer__products">
        { sortedProducts.map(product => {
          return (
            <ProductContainer 
              key={product.id}
              setSelectionValues={setSelectionValues}
              selected={selectedProduct === product.id}
              onClick={onProductSelection} 
              showReleases={!!loggedInUser} {...product} />
          )
        })}
      </div>
    </div>
  )
}

export default ProductFamilyContainer