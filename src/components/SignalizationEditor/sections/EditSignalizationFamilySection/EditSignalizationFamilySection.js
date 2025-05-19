import React, { useState, useMemo, useContext } from 'react'
import { DesignContext } from '../../../../store/design'
import { ProductContext } from '../../../../store/product'
import { TranslationContext } from '../../../../store/translation'
import DcsDialog from '../../../DcsDialog/DcsDialog'
import HeadingComponent from '../../../HeadingComponent'
import SectionAccordion from '../../../SectionAccordion'
import Sprite from '../../../Sprite'
import ThumbnailList from '../../../ThumbnailList/ThumbnailList'
import { SignalizationContext } from '../../provider/SignalizationEditorProvider'

import './EditSignalizationFamilySection.scss'

/**
 * 
 * @param {Object} props 
 * @param {string=} props.className 
 */
function EditSignalizationFamilySection(props) {
  const {
    className = '',
    componentFamilies = [],
  } = props

  const designCtx = useContext(DesignContext)
  const { design } = designCtx
  const productCtx = useContext(ProductContext)
  const { product } = productCtx
  const { getText } = useContext(TranslationContext)

  const [ showDialog, setShowDialog ] = useState(false)

  const groupedFamilies = useMemo(() => {
    const groups = groupFamiliesByCategory(componentFamilies)
    return groups.sort((a, b) => {
      // DCS to last
      if (a.id === 'DESTINATIONCS') return 1
      if (b.id === 'DESTINATIONCS') return -1
      return 0
    })
  }, [componentFamilies])


  const { currentFamily, setCurrentFamily } = useContext(SignalizationContext)

  const currentFamilyData = getCurrentFamilyData()

  const [ isAccordionOpen, setIsAccordionOpen ] = useState(!currentFamily)

  function handleFamilyChange(id, componentCategory) {
    setCurrentFamily(id)
    setIsAccordionOpen(false)

    if (componentCategory === 'DESTINATIONCS') {
      setShowDialog(true)
    }
  }

  function handleClick(val) {
    if (!currentFamily) return

    setIsAccordionOpen(val)
  }

  function getCurrentFamilyData() {
    const found = componentFamilies.find(x => x.id === currentFamily)
    return found
  }

  function groupFamiliesByCategory(families) {
    const result = {}

    families.forEach(item => {
      const { componentCategory = 'CATEGORY_MISSING' } = item

      if (!result[componentCategory]) {
        result[componentCategory] = {
          id: componentCategory,
          heading: `component-category-${componentCategory}`,
          info: `component-category-${componentCategory}-i`,
          items: []
        }
      }

      result[componentCategory].items.push(item)
    })

    return Object.values(result) || []
  }

  return (
    <div data-testid="EditSignalizationFamilySection" className={`EditSignalizationFamilySection ${className}`}>
      { !isAccordionOpen && currentFamilyData &&
        <div className="family-info">
          <div className="family-info__image-container">
            <Sprite
              src={currentFamilyData.image}
            />
          </div>
          <h3 className="family-info__name">
            { getText(currentFamilyData.name) }
          </h3>
          <p className="family-info__description">
            { getText(currentFamilyData.description) }
          </p>
          {
            currentFamilyData.componentCategory === 'DESTINATIONCS' &&
            <p className="family-info__read-more" onClick={() => setShowDialog(true)}>
              { getText('ui-general-read-more')}
            </p>
          }
        </div>
      }
      <SectionAccordion
        isOpen={isAccordionOpen}
        controlled={true}
        disableAnimation={true}
        handleClick={handleClick}
        heading={getText('ui-signalization-family')}
        displayedValue={currentFamilyData ? getText(currentFamilyData.name) : getText('ui-general-please-select')}
        info={getText('ui-signalization-family-i')}
      >
        { groupedFamilies.map(group => {
          
          return (
            <div key={group.id} className="signalization-group">
              <HeadingComponent className="signalization-group__heading"
                heading={getText(group.heading)}
                info={getText(group.info)}
              />
              <ThumbnailList className="signalization-group__items" thumbnails={group.items} selectedId={currentFamily} onChange={id => handleFamilyChange(id, group.id)} showBorder={true} showDescription={true} />
            </div>
          )
        })}
        
      </SectionAccordion>
      { showDialog && 
        <DcsDialog onConfirm={() => setShowDialog(false)} onCancel={() => setShowDialog(false)} />
      }
    </div>
  )
}

export default EditSignalizationFamilySection