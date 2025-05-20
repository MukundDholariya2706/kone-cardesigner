import './FinishAccordionItem.scss';
import React, { useContext, useMemo } from 'react';
import jsonLogic from 'json-logic-js';

import AccordionItem, { AccordionHead, AccordionBody } from "../AccordionItem"
import ListComponent from '../ListComponent';
import GridComponent from '../GridComponent';
import TileComponent from '../TileComponent';

import { ProductContext } from '../../store/product/ProductProvider';
import { DesignContext } from '../../store/design/DesignProvider';
import { TranslationContext } from '../../store/translation/TranslationProvider';
import { ToastContext } from '../../store/toast';
import HeadingComponent from '../HeadingComponent/HeadingComponent';
import { DEFAULT_LIST_IMAGE_URL, MAT_CAR_FRONT_WALL_A, MAT_CDO_PANEL } from '../../constants';

const FinishAccordionItem = ({ finishes, finish, finishType, preferredFinishType=null, finishFilter, nullItem, border, onChange, showCategories = true, className, disabled=false }) => {
  const { getText } = useContext(TranslationContext);
  const { getFinishes, product } = useContext(ProductContext);
  const { getFinish, setFinish, verifyAndChangeAllWalls} = useContext(DesignContext)
  const { addToast } = useContext(ToastContext)


  if (!finish) {
    if(preferredFinishType) {
      finish = getFinish({ type: preferredFinishType })
    } else {
      finish = getFinish({ type: finishType })
    }
  }

  
  
  if (!finishes) {
    finishes = getFinishes({ type: finishType })
  }

  if (finishFilter) {
    finishes = finishes.filter(finishFilter)
  }

  if (!onChange) {
    onChange = id => {
      const currentAFinish = finishType.includes(MAT_CAR_FRONT_WALL_A) ?getFinish({type:MAT_CAR_FRONT_WALL_A}) :null

      if (Array.isArray(finishType)) {
        finishType.forEach(item => {
          setFinish({ type: item, finish: id })
        })
      } else {
        setFinish({ type: finishType, finish: id })
      }
      
      // check monospace 500 special rule for certain steel finishes
      if(finishType.includes(MAT_CAR_FRONT_WALL_A) || finishType.includes(MAT_CDO_PANEL)) {
            // Monospace 500 can not mix certain steel finishes in the car walls
        if(product?.rules?.variousFilteringRules) {
          const checkOtherWalls = jsonLogic.apply(product.rules.variousFilteringRules, {
            filteringRULE: 'mixingLimited',
            PRODUCT: product.product,
            FINISH: id,
            OLDFINISH: currentAFinish,
            WALL: finishType,
            TARGET: 'inside',
          })
          if(checkOtherWalls) {
            const showToaster = verifyAndChangeAllWalls({ finishType, finish:id, custom:null, finishMaterial:'STEEL'})
            if(showToaster) {
              addToast({ message: getText('ui-dialog-can-not-combine-steel-finishes-inside-notice'), type:'info', autoDismiss: 4000})
            }
          }
        }
      }


    }
  }

  const nullItemToUse = nullItem ? nullItem : { image: DEFAULT_LIST_IMAGE_URL, name: 'ui-general-please-select' }
  const headItem = finishes.find(item => item.id === finish) || nullItemToUse

  return (
    <div className={'FinishAccordionItem' + (border ? ` border-${border}` : '') + (className ? ' ' + className : '')}>
      <AccordionItem disabled={disabled}>
        <AccordionHead>

          {headItem && (
            <TileComponent
              title={headItem.sapId}
              subtitle={getText(headItem.name)}
              showSapId={product?.businessSpecification?.market !== 'ENA'} 
              image={headItem.image}
              icon={headItem.premium && "icon-premium"}
              iconTitle={getText('ui-general-extended-lead-time')}
              direction="row"
            />
          )}

        </AccordionHead>

        <AccordionBody>
          <FinishList 
            onChange={onChange}
            finishes={finishes} 
            showCategories={showCategories}
            showSapId={product?.businessSpecification?.market !== 'ENA'} 
            finish={finish} />
        </AccordionBody>
      </AccordionItem>
    </div>
  )
}

export function FinishList(props) {
  const {
    finish,
    onChange,
    showCategories,
    finishes = [],
    showSapId
  } = props

  const { product, addCategoriesToFinishes } = useContext(ProductContext);
  const { getText } = useContext(TranslationContext)

  const categories = useMemo(() => {
    return showCategories ? addCategoriesToFinishes({ finishes }) : []
  }, [ finishes, showCategories ])

  const premiumIcon = product?.businessSpecification?.market === 'ENA' ?'icon-premium-ena' :'icon-premium'

  return (
    <ListComponent gap="sm" padding="sm" >
      {/* With categories */}
      { categories.length > 0 && categories.map((categoryItem, key) => {
        const tiles = categoryItem.finishes.map((finishItem, key) => {
          return (
            <TileComponent
              key={key}
              title={finishItem.sapId}
              subtitle={getText(finishItem.name)}
              showSapId={showSapId}
              image={finishItem.image}
              icon={finishItem.premium && premiumIcon}
              iconTitle={getText('ui-general-extended-lead-time')}
              selected={finishItem.id === finish}
              onClick={e => onChange(finishItem.id)}
            />
          )
        })

        return (
          <React.Fragment key={key}>
            <HeadingComponent className="category-heading" heading={getText(categoryItem.name)} padding="sm" />
            <GridComponent cols="3" gap="sm">
              {tiles}
            </GridComponent>
          </React.Fragment>
        )
      })}

      {/* Without categories */}
      { categories.length === 0 && (
        <GridComponent cols="3" gap="sm">
          { finishes.map((finishItem, key) => {
            return (
              <TileComponent
                key={key}
                title={finishItem.sapId}
                subtitle={getText(finishItem.name)}
                showSapId={showSapId}
                image={finishItem.image}
                icon={finishItem.premium && "icon-premium"}
                iconTitle={getText('ui-general-extended-lead-time')}
                selected={finishItem.id === finish}
                onClick={e => onChange(finishItem.id)}
              />
            )
          })}
        </GridComponent>
      )}

    </ListComponent>
  )
}

export default FinishAccordionItem