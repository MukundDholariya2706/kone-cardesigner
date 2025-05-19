import './CustomFinishes.scss'
import React, { useMemo, useContext, useState, useRef } from 'react';
import InfoBox from '../InfoBox';
import ListComponent from '../ListComponent';
import GridComponent from '../GridComponent';
import TileComponent from '../TileComponent';
import { ProductContext } from '../../store/product';
import { DesignContext } from '../../store/design';
import { TranslationContext } from '../../store/translation';
import Alert from '../Alert/Alert';
import Icon from '../Icon';
import HeadingComponent from '../HeadingComponent/HeadingComponent';
import { getFloorMixerGroups } from '../../utils/product-utils';

const CustomFinishes = ({ children, type, finishType, finish, setFinish, className }) => {  

  const removeRef = useRef()
  const { getText } = useContext(TranslationContext);
  const { product, customFinishes, removeCustomFinish, getFinish: getFinishItem } = useContext(ProductContext);
  const { resetFinish } = useContext(DesignContext)
  const [ showRemoveConfirm, setShowRemoveConfirm ] = useState(false)

  const categorize = (items) => {

    let itemsByMaterial = {}

    for (let i = 0; i < items.length; i++) {
      const { finish: f } = items[i]
      if (!f) {
        continue
      }

      // Duplicate the shared flag to the finish data
      // So it can be used in the component below
      f.shared = !!items[i].shared

      let { materials } = f
      if (!materials || !materials.length) {
        materials = ['OTHER']
      }

      for (let j = 0; j < materials.length; j++) {
        const material = materials[j];
        if (!itemsByMaterial.hasOwnProperty(material)) {
          itemsByMaterial[material] = []
        }
        itemsByMaterial[material].push(f)
      }
    }

    let materials = []

    for (let i = 0; i < Object.keys(itemsByMaterial).length; i++) {
      const key = Object.keys(itemsByMaterial)[i];
      materials.push({
        id: key,
        name: getText(`material-${key}`),
        finishes: itemsByMaterial[key]
      })
            
    }

    // sort by material name
    return materials.sort((a, b) => {
      const name1 = a.name
      const name2 = b.name
      if (name1 < name2) return -1
      if (name1 > name2) return 1
      return 0
    })
  }

  const materials = useMemo(() => {
    if (!customFinishes) return []
    return categorize(
      // if custom finish has type definition, filter out unwanted types
      customFinishes.filter(({ finish: { types, mixed, materials } = {} } = {}) => {

        if (mixed) {
          const groups = getFloorMixerGroups(product)
          if (materials.includes('MIXED-STONE')) {
            const stoneGroup = groups.find(x => x.material === 'MIXED-STONE')
            if (!stoneGroup) {
              return false
            }
          }

          if (materials.includes('MIXED-PVC')) {
            const pvcGroup = groups.find(x => x.material === 'MIXED-PVC')
            if (!pvcGroup) {
              return false
            }
          }
        }

        return !finishType || !types || !types.length || types.indexOf(finishType) !== -1 
      })
    )
  }, [customFinishes, product])


  return (
    <div className={'CustomFinishes' + (className ? ` ${className}` : '' )}>
      <InfoBox text={ getText('ui-custom-info') } />
      <ListComponent gap="md" padding="md" >

        { materials.map(({name, finishes}, key) => {
          return <React.Fragment key={key}>
            <HeadingComponent heading={name} padding="sm" />
            <GridComponent cols="3" gap="sm">
              { finishes.map((customFinish, index) => {
                
                const { id, materials: finishMaterials, finishes: finishIds, image, mixed } = customFinish || {}
                let images = null
                
                if (finishIds) {
                  images = finishIds.map(id => {
                    const { image } = getFinishItem({ id }) || {}
                    return image
                  })
                }

                const imageToUse = (image && image.url) || (image && localStorage.getItem(image.localStorage))

                return (
                  <TileComponent
                    key={index}
                    title={customFinish.name}
                    image={imageToUse}
                    images={images}
                    imageClassName={ finishMaterials ? finishMaterials.join() : null }
                    selected={customFinish.id === finish}
                    onClick={() => setFinish(customFinish.id, mixed)}
                    // onClick={() => setFinish({ type, finish: customFinish.id, custom: true, mixed })}
                  >
                    { // Can't delete finishes that are part of a shared design
                      !customFinish.shared &&
                      <div className="btn-remove-custom-finish" onClick={ e => {
                        e.preventDefault()
                        e.stopPropagation()
                        setShowRemoveConfirm(true)
                        removeRef.current = id
                      }}>
                        <Icon id="icon-remove-item" />
                      </div>
                    }
                  </TileComponent>
                )
              }) }
            </GridComponent>
          </React.Fragment>
        })}
      </ListComponent>

      { showRemoveConfirm && 
        <Alert 
          title="ui-remove-custom-finish-confirm-title" 
          description="ui-remove-custom-finish-confirm-desc"
          cancelLabel="ui-general-no"
          onConfirm={ e => {
            // see if design contains removed finish
            resetFinish(removeRef.current)
            removeCustomFinish(removeRef.current)
            setShowRemoveConfirm(false)
          } }
          onCancel={ e => setShowRemoveConfirm(false) }
          onClose={ e => setShowRemoveConfirm(false) }
        /> 
      }
      
    </div>
  )
}
export default CustomFinishes