import React, { useContext } from 'react'
import { TWO_PANELS_COMBINED } from '../../../../constants'
import { ProductContext } from '../../../../store/product'
import { TranslationContext } from '../../../../store/translation'
import Icon from '../../../Icon'
import TileImage from '../../../TileImage/TileImage'

import './FinishItem.scss'

// Assuming only one missing panel
function getMissingPanel(panelFinishes) {
  const hasLeft = panelFinishes.find(x => x.panel === '1')
  if (!hasLeft) return '1'
  
  const hasMiddle = panelFinishes.find(x => x.panel === 'X')
  if (!hasMiddle) return 'X'

  const hasRight = panelFinishes.find(x => x.panel === '2')
  if (!hasRight) return '2'
}

const PANEL_ORDER = ['1', 'X', '2']
  .reduce((prev, curr, i) => {
    prev[curr] = i
    return prev
  }, {})

const PANEL_STRINGS = {
  '1': 'ui-general-left-abbrev',
  'X': 'ui-general-center-abbrev',
  '2': 'ui-general-right-abbrev'
}

/**
 * 
 * @param {Object} props 
 * @param {string=} props.className 
 */
 function FinishItem(props) {
  const { finishes = [], className = '', disabled, selectedPanelingStyle } = props

  const { getFinish, product } = useContext(ProductContext)
  const { getText } = useContext(TranslationContext)

  const premiumIcon = product.businessSpecification?.market === 'ENA' ? 'icon-premium-ena' : 'icon-premium'

  const finishItems = finishes.map(finish => {
    const finishData = getFinish({ id: finish.id })
    if (!finishData) return

    return {
      ...finishData,
      panel: finish.panel,
    }
  }).filter(x => x) // Filter out undefined

  if (finishItems.length === 0) {
    return <div className={`FinishItem ${className}`}>{getText('ui-general-no-selection')}</div>
  }

  const isPremium = !!finishItems.find(x => x.premium)

  const icon = isPremium && premiumIcon


  // "Complete" the wall finish thumbnail for blank car when only two panel finishes have been selected 
  if (finishItems.length === 2) {
    const missing = getMissingPanel(finishItems)
    finishItems.push({
      image: 'thumbnails/empty-wall-finish.png',
      panel: missing
    })
  }
  
  const images = finishItems
    .sort((a, b) => {
      if (a.panel && b.panel) {
        if (PANEL_ORDER[a.panel] > PANEL_ORDER[b.panel]) return 1
        if (PANEL_ORDER[a.panel] < PANEL_ORDER[b.panel]) return -1
      }

      return 0
    })
    .map(x => x.image) 


  function renderFinishesData() {
    const uniqueFinishes = []
    finishItems.forEach(item => {
      if (!uniqueFinishes.includes(item.id)) {
        uniqueFinishes.push(item.id)
      }
    })
    // If all panels are the same (or there are no panels), just display one finish.
    if (uniqueFinishes.length === 1) {
      return (
        <div className="info">
          <p className="sapId">{finishItems[0].sapId}</p>
          <p className="name">{getText(finishItems[0].name)}</p>
        </div>
      )
    }

    return (
      <div className="info panel-info">
        { finishItems
          .filter(item => {
            // if combined paneling style, center panel is always same as one of the side panels --> should not be displayed separately
            if (selectedPanelingStyle === TWO_PANELS_COMBINED) {
              return item.panel !== 'X'
            }

            return true
          })
          .map( (item,key) => (
          <p className="panel-finish" key={key}>{`${getText(PANEL_STRINGS[item.panel])}: ${getText(item.name)}`}</p>
        ))}
      </div>
    )
  }

  return (
    <div data-testid="FinishItem" className={`FinishItem ${className} ${disabled ? 'disabled' : ''}`}>
      <TileImage className="thumbnail" imageClassName={images.length > 1 ? 'MIXED-WALL' : ''} images={images}>
      {icon &&
        <div className="tile-icon">
          <Icon id={icon} />
        </div>
      }
      </TileImage>
      { renderFinishesData() }
    </div>
  )


}

export default FinishItem