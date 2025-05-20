import './ProductSelectionView.scss'

import React, { useState, useContext, useEffect, useMemo } from 'react'

import FormSelect from '../FormSelect'
import { TranslationContext } from '../../store/translation/TranslationProvider'
import { OfferingContext } from '../../store/offering'
import { AuthContext } from '../../store/auth'
import { sortProducts } from '../../utils/generalUtils'
import { useLocation } from 'react-router-dom'
import { ProductContext } from '../../store/product/ProductProvider'
import Container from '../Container'
import LoadingSpinner from '../LoadingSpinner'
import { NEW_BUILDINGS, EXISTING_BUILDINGS, MARINE } from '../../constants'
import Icon from '../Icon'


const ProductSelectionView = props => {
  const { marine } = props
  const { getText } = useContext(TranslationContext);
  const { loggedInUser } = useContext(AuthContext)
  const { offering, productFamilies } = useContext(OfferingContext);
  const { productId, setProductId, setReleaseId } = useContext(ProductContext);

  const location = useLocation()

  const typeToUse = useMemo(() => {
    if (!location) return

    if (marine) return MARINE

    return location.pathname.includes('/existing-buildings') ? EXISTING_BUILDINGS : NEW_BUILDINGS
  }, [location, marine])

  const productsToUse = useMemo(() => {
    if (!offering) return
    if (typeToUse === EXISTING_BUILDINGS) {
      return offering
        .filter(x => x.modernization)
        .map(x => {
          if (x.productFamily === 'modular-modernization') return x
          
          // With the exception of add-on-deco, all the other modernization
          // products should be listed under the full replacement family.
          return {
            ...x,
            productFamily: 'full-replacement'
          }
        })
    } else {
      return offering.filter(x => x.productFamily !== 'full-replacement' && x.productFamily !== 'modular-modernization')
    }
  }, [typeToUse, offering])

  // filters out families with no products
  const productFamilyFilter = ({ id, type }) => {    
    if (type !== typeToUse) return false
    return !!productsToUse.find(p => p.productFamily === id);
  }

  const filteredProductFamilies = useMemo(() => {
    if (productFamilies && productsToUse) {
      return productFamilies.filter(productFamilyFilter)
    }
    return []
  }, [productFamilies, productFamilyFilter, productsToUse])

  // Set the correct product, or if there is no product, default to first product on the list.
  useEffect(() => {
    if (productsToUse && productsToUse.length && productFamilies && productFamilies.length) {  
      if (!productId || !productsToUse.find(x => x.id === productId)) {
        const firstFamily = productFamilies.find(family => {
          return !!productsToUse.find(p => p.productFamily === family.id)
        })

        const sortedProducts = firstFamily && sortProducts(productsToUse.filter(p => p.productFamily === firstFamily.id) , getText);
        const firstProduct = sortedProducts && sortedProducts[0];
        if (firstProduct) {
          setProductId(firstProduct.id)
          
          // If logged in, also set the correct release Id
          if (loggedInUser && firstProduct.releases) {
            const lastIndex = firstProduct.releases.length - 1
            const release = firstProduct.releases[lastIndex]
            
            setReleaseId(release.id)
          }
        }
      }
    }
  }, [productFamilies, productsToUse])

  if (!productsToUse) {
    return <div className="loading-spinner-container">
      <LoadingSpinner />
    </div>
  }

  function handleProductSelection(productId, releaseId) {
    setProductId(productId)

    if (loggedInUser) {
      setReleaseId(releaseId)
    } else {
      // Nulling possible existing releaseId value for non-KONE users
      setReleaseId(null)
    }
  }

  return (    
    <Container className="product-selection-view-container" hPadding="xlg">
      <div className="ProductSelectionView">
        { filteredProductFamilies.map(family => {

          return <ProductFamilyContainerMarine 
            key={family.id} 
            {...family} 
            products={productsToUse.filter(p => p.productFamily === family.id)} onProductSelection={handleProductSelection} 
            selectedProduct={productId} />
        })}
      </div>
    </Container>
    
  )
}

function ProductFamilyContainerMarine(props) {
  const { id, name, description, image, products, onProductSelection, selectedProduct } = props
  
  const { loggedInUser } = useContext(AuthContext)
  const { getText } = useContext(TranslationContext)

  const sortedProducts = useMemo(() => {
    return sortProducts(products, getText)
  }, [products])

  return (
    <div className="ProductFamilyContainerMarine">
      <div className="ProductFamilyContainerMarine__header">
        <div className="ProductFamilyContainerMarine__image-container">
          <img src={image} />
        </div>
        <div className="ProductFamilyContainerMarine__info">
          <h3 className="ProductFamilyContainerMarine__title">{getText(name)}</h3>
          <p className="ProductFamilyContainerMarine__desc">{getText(description)}</p>
        </div>
      </div>
      <div className="ProductFamilyContainerMarine__products">
        { sortedProducts.map(product => {
          return (
            <ProductContainerMarine 
              key={product.id}
              selected={selectedProduct === product.id}
              onClick={(productId, releaseId) => onProductSelection(productId, releaseId)} 
              showReleases={!!loggedInUser} {...product} />
          )
        })}
      </div>
    </div>
  )

}

function ProductContainerMarine(props) {
  const { 
    id,
    name, description,
    releases,
    productfacts, 
    showReleases,
    selected,
    onClick,
  } = props

  const [ selectedReleaseId, setSelectedReleaseId ] = useState(() => {
    if (!releases) return undefined
    const lastIndex = releases.length - 1
    return releases[lastIndex].id
  }) // What should be the default for logged in users???

  const { getText } = useContext(TranslationContext)

  const { releaseName, releaseDescription } = useMemo(() => {
    let found

    if (releases && showReleases) {
      found = releases.find(x => x.id === selectedReleaseId)
    } else if (releases) {
      found = releases.find(x => x.default) || releases[0] // default first available
    }

    if (!found) return { releaseName: name, releaseDescription: description }

    return {
      releaseName: found.name,
      releaseDescription: found.description,
    }
  }, [releases, selectedReleaseId])

  const defaultRelease = useMemo(() => {
    let found = null
    if (releases) {
      found = releases.find(x => x.default) || releases[0];
    }
    return found.id || null

  }, [releases])
  
  const productsFactsByRelease = useMemo(() => {
    let found = null

    if (productfacts && productfacts.constructor !== Array) {
      found = JSON.parse(JSON.stringify(productfacts));
    }  else if (productfacts && showReleases) {
      found = productfacts.find(x => x.id === selectedReleaseId)
    } else if (productfacts) {
      found = productfacts.find(x => x.id === defaultRelease) || productfacts[0] // default first available
    }

    return found

  }, [releases, selectedReleaseId])

  function handleSelectChange(val) {
    setSelectedReleaseId(val)
  }

  function handleClick() {
    onClick(id, selectedReleaseId)
  }
  
  let className = 'ProductContainerMarine'

  if (selected) {
    className += ' ProductContainerMarine--selected'
  }

  return (
    <div className={className} onClick={handleClick}>
      <div className="ProductContainerMarine__icon-container">
        <Icon id="icon-checkmark-circle" className="ProductContainerMarine__icon" />
      </div>
      <div className="ProductContainerMarine__product-data">
        <h3 className="ProductContainerMarine__title">{getText(releaseName)}</h3>
        <p className="ProductContainerMarine__desc">{getText(releaseDescription)}</p>
      </div>
     <div className="ProductContainerMarine__product-info">
     { productsFactsByRelease && 
      <>
        <ProductInfoBlockMarine 
          icon="icon-max-travel" 
          label={getText('pdf-max-travel')} 
          value={getText(productsFactsByRelease['maxTravel'])} 
        />
        <ProductInfoBlockMarine 
          icon="icon-max-load" 
          label={getText('pdf-max-load')} 
          value={
            getText(productsFactsByRelease['maxPersons']) + 
            getText('ui-selector-load-capacity-persons') + 
            ' ' + 
            getText(productsFactsByRelease['maxLoad'])} 
        />
        <ProductInfoBlockMarine 
          icon="icon-max-speed" 
          label={getText('pdf-max-speed')} 
          value={getText(productsFactsByRelease['maxSpeed'])} 
        />
      </>
      }
      </div>
      { showReleases && releases &&
        <div className="ProductContainerMarine__select-container">
          <FormSelect 
            className="ProductContainerMarine__select" 
            label={getText('ui-selector-release')}
            options={releases.map(({ id: releaseId}) => ({ value: releaseId, text: releaseId }))}
            value={selectedReleaseId}
            // onClick={(e) => e.stopPropagation()}
            onChange={handleSelectChange}
          />
        </div>
        }
    </div>
  )
}

function ProductInfoBlockMarine(props) {
  const { label, value, icon } = props

  return (
    <div className="ProductInfoBlockMarine">
      <Icon className="ProductInfoBlockMarine__icon" id={icon} />
      <div className="ProductInfoBlockMarine__values">
        <p className="ProductInfoBlockMarine__label">{label}</p>
        <p className="ProductInfoBlockMarine__value">{value}</p>
      </div>
    </div>
  )
}

export default ProductSelectionView