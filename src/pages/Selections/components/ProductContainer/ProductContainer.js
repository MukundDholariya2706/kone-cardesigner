import React, { useState, useMemo, useContext, useRef, useLayoutEffect } from 'react'
import FormSelect from '../../../../components/FormSelect'
import Icon from '../../../../components/Icon'
import { OfferingContext } from '../../../../store/offering'
import { SiteContext } from '../../../../store/site'
import { TranslationContext } from '../../../../store/translation'
import { useBuildingsType } from '../../../../utils/customHooks/customHooks'
import DesignsContainer from '../DesignsContainer/DesignsContainer'

import './ProductContainer.scss'

function filterByReleaseId(releaseId) {
  return item => {
    if (!releaseId) return true
    if (!item.releases || !Array.isArray(item.releases)) return false

    return item.releases.includes(releaseId)
  }
}

function ProductContainer(props) {
  const {
    id,
    name, description,
    releases = [],
    productfacts,
    businessSpecification,
    setSelectionValues,
    designs, themes,
    showReleases,
    selected,
    onClick,
    isNew,
    extraFeatures,
  } = props

  const outerRef = useRef()
  const contentRef = useRef()
  const scrollYRef = useRef()

  const filteredReleases = releases.filter(x => {
    if (showReleases) {
      return x.selectable
    } else {
      return x.default
    }
  })

  // This is here for backwards compatibility so everything works with old API that did not have selectable flag for releases.
  if (showReleases && filteredReleases.length === 0) {
    const defaultRelease = releases.find(x => x.default)

    if (defaultRelease) {
      filteredReleases.push(defaultRelease)
    }
  }

  const [selectedReleaseId, setSelectedReleaseId] = useState(() => {
    if (!showReleases || !filteredReleases) return undefined
    const lastIndex = filteredReleases.length - 1
    return filteredReleases[lastIndex]?.id // Default to last available for logged in users (arbitrary choice)
  })

  const { getText } = useContext(TranslationContext)
  const { countryCode = '' } = useContext(OfferingContext)
  const { isMarine: marine } = useContext(SiteContext)

  const buildingsType = useBuildingsType()

  const { releaseName, releaseDescription } = useMemo(() => {
    let found
    if (filteredReleases && showReleases) {
      found = filteredReleases.find(x => x.id === selectedReleaseId)
    } else if (filteredReleases) {
      found = filteredReleases.find(x => x.default) || filteredReleases[0] // default first available
    }

    if (!found) return { releaseName: name, releaseDescription: description }

    return {
      releaseName: found.name,
      releaseDescription: found.description,
    }
  }, [filteredReleases, selectedReleaseId])

  
  const defaultRelease = useMemo(() => {
    let found = null
    if (filteredReleases) {
      found = filteredReleases.find(x => x.default) || filteredReleases[0];
    }
    return found.id || null

  }, [filteredReleases])
  
  const productsFactsByRelease = useMemo(() => {
    let found = null

    if (productfacts && productfacts.constructor !== Array) {
      found = JSON.parse(JSON.stringify(productfacts))
    } else if (productfacts && showReleases) {
      found = productfacts.find(x => x.id === selectedReleaseId)
    } else if (productfacts) {
      found = productfacts.find(x => x.id === defaultRelease) || productfacts[0] // default first available
    }

    return found

  }, [releases, selectedReleaseId])

  
  // Related to manual handling of scrolling behavior.
  // selectionValues used in Selections.js
  useLayoutEffect(() => { // Normal useEffect causes flickering
    if (!contentRef.current || !selected) return
    const rect = outerRef.current.getBoundingClientRect()

    setSelectionValues({
      contentHeight: contentRef.current.clientHeight,
      fromTop: rect.top + window.scrollY, // Scroll after the contents have been opened
      scrollY: scrollYRef.current, // Scroll at the time of clicking (when contents are still hidden)
      id // Just for debugging
    })
  }, [selected])

  function getDefaultReleaseId() {
    if (!filteredReleases) return null

    const found = filteredReleases.find(x => x.default)

    if (found) return found.id

    return filteredReleases[0]?.id
  }
  
  function handleSelectChange(val) {
    setSelectedReleaseId(val)
  }

  function handleClick() {
    onClick(id, selectedReleaseId, !selected)
    scrollYRef.current = window.scrollY
  }

  function getMaxLoadValue(facts) {
    if (facts['maxPersons']) {
      return  getText(facts['maxPersons']) +
              getText('ui-selector-load-capacity-persons') +
              ' ' +
              getText(facts['maxLoad'])
    }

    return getText(facts['maxLoad'])
  }

  let baseUrl = '/'

  if (!marine) {
    baseUrl += `${buildingsType}/`
  }

  baseUrl += `${countryCode.toLowerCase()}/${id}`

  if (selectedReleaseId) {
    baseUrl += `/${selectedReleaseId}`
  }

  baseUrl += '/edit'

  let className = 'ProductContainer'

  if (selected) {
    className += ' ProductContainer--selected'
  }

  if (isNew) {
    className += ' is-new-product'
  }

  return (
    <div ref={outerRef} className={className}>
      <div className="product-selection-box" onClick={handleClick}>
        <div className="product-selection-box__icon-container">
          <Icon id="icon-checkmark-circle" className="product-selection-box__icon" />
        </div>
        <div className="product-selection-box__product-data">
          <h3 className="product-selection-box__title"><span className="title">{getText(releaseName)}</span>
            { 
              showReleases && businessSpecification && 
              <span className="tag business-specification-tag">
                { getText(`business-market-${businessSpecification.market}`)  }
              </span>
              }
          </h3>
          {
            isNew &&
            <div className="new-tag"><span>{getText('ui-general-new')}</span></div>
          }
          <p className="product-selection-box__desc">{getText(releaseDescription)}</p>
        </div>
        <div className="product-selection-box__product-info">
          {productsFactsByRelease &&
            <>
              <ProductInfoBlock
                icon="icon-max-travel"
                label={getText('pdf-max-travel')}
                value={getText(productsFactsByRelease['maxTravel'])}
              />
              <ProductInfoBlock
                icon="icon-max-load"
                label={getText('pdf-max-load')}
                value={getMaxLoadValue(productsFactsByRelease)}
              />
              <ProductInfoBlock
                icon="icon-max-speed"
                label={getText('pdf-max-speed')}
                value={getText(productsFactsByRelease['maxSpeed'])}
              />
            </>
          }
        </div>
        {showReleases && filteredReleases &&
          <div className="product-selection-box__select-container">
            <FormSelect
              className="product-selection-box__select"
              label={getText('ui-selector-release')}
              options={filteredReleases.map(({ id: releaseId }) => ({ value: releaseId, text: releaseId }))}
              value={selectedReleaseId}
              // onClick={(e) => e.stopPropagation()}
              onChange={handleSelectChange}
            />
          </div>
        }
      </div>
      { selected &&
        <DesignsContainer 
          designs={designs.filter(filterByReleaseId(selectedReleaseId || getDefaultReleaseId()))} 
          themes={themes}
          ref={contentRef}
          baseUrl={baseUrl}
          productId={id}
          releaseId={selectedReleaseId}
          extraFeatures={extraFeatures}
        />
      }
    </div>
  )
}

function ProductInfoBlock(props) {
  const { label, value, icon } = props

  return (
    <div className="ProductInfoBlock">
      <Icon className="ProductInfoBlock__icon" id={icon} />
      <div className="ProductInfoBlock__values">
        <p className="ProductInfoBlock__label">{label}</p>
        <p className="ProductInfoBlock__value">{value}</p>
      </div>
    </div>
  )
}

export default ProductContainer