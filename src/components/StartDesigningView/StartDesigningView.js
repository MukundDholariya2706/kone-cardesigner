import './StartDesigningView.scss'

import React, { useContext, useEffect, useState } from 'react'
import { useHistory } from "react-router-dom"
import ActionCard from '../ActionCard'
import { ProductContext } from '../../store/product/ProductProvider'
import { OfferingContext } from '../../store/offering/OfferingProvider'
import { TranslationContext } from '../../store/translation/TranslationProvider';

import Container from '../Container'
import LoadingSpinner from '../LoadingSpinner'
import { useBuildingsType } from '../../utils/customHooks/customHooks'

const StartDesigningView = props => {
  const { productId, releaseId, marine } = props
  const history = useHistory();
  const [ loading, setLoading ] = useState(true)
  const { product, loadProductWithId } = useContext( ProductContext );  
  const { getText } = useContext(TranslationContext)
  const { countryCode = '',  } = useContext( OfferingContext );
  
  const buildingsType = useBuildingsType()

  useEffect(() => {
    loadProductWithId(productId, releaseId).then(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="loading-spinner-container">
      <LoadingSpinner />
    </div>
  }

  let baseUrl = '/'

  if (!marine) {
    baseUrl += `${buildingsType}/`
  }

  baseUrl += `${countryCode.toLowerCase()}/${productId}`

  if (releaseId) {
    baseUrl += `/${releaseId}`
  }

  const collectionUrl = `${baseUrl}/predesigns`
  const blankUrl = `${baseUrl}/edit/blank`

  return (
    <Container padding="lg">
      <div className="StartDesigningView">
        <div className={`StartDesigningView-item ${!product || product.designs.length === 0 ? ' disabled' : ''}`}>
          <ActionCard 
            onClick={ e => {
              history.push(collectionUrl) 
              } 
            }
            imageContainerClassName="predesign-image-container"
            selected={true} 
            label={getText('ui-selector-project-modify')}
            image="thumbnails/start-designing/pre-design.png"
          />
        </div>
        <div className="StartDesigningView-item">
            <ActionCard 
              onClick={ e => {
                history.push(blankUrl) } 
              }
              imageContainerClassName="empty-design-image-container"
              label={getText('ui-selector-project-empty')}
              image="thumbnails/start-designing/black.png"
            />
          </div>
      </div>
    </Container>
  )
}

export default StartDesigningView