import './Skirting.scss';
import React, { useContext, useState, useEffect } from 'react';
import jsonLogic from 'json-logic-js';

import { ProductContext } from '../../store/product/ProductProvider';
import { DesignContext } from '../../store/design/DesignProvider';
import { TranslationContext } from '../../store/translation/TranslationProvider';
import EditorLayout from '../EditorLayout';
import SwitchButton from '../SwitchButton';
import { LayoutContext } from '../../store/layout';
import { MAT_CAR_SKIRTING, TYP_CAR_SKIRTING, MAT_CAR_FLOORING, EXTRA_FEATURES, OFFERING_INDIA, MAT_CAR_WALL_FINISH_B, MAT_CAR_CEILING, MAT_CAR_FRONT_WALL_A } from '../../constants';
import InfoBox from '../InfoBox';
import ImageTitle from '../ImageTitle';
import HeadingComponent from '../HeadingComponent/HeadingComponent';
import ScrollBox from '../ScrollBox';

const { SKIRTING_MANDATORY } = EXTRA_FEATURES

const Skirting = (props) => {
  
  const { getText } = useContext(TranslationContext);
  const { setEditView } = useContext(LayoutContext);
  const { product, getMaterial } = useContext(ProductContext);
  const { getFinish: getFinishId, getComponent: getComponentId, setFinish, setComponent, setDefaultComponent, design } = useContext(DesignContext);

  const [ finishes, setFinishes ] = useState([])
  const [ toggle, setToggle ] = useState(true)
  const [disableRemove, setDisableRemove] = useState([])

  const componentId = getComponentId({ type: TYP_CAR_SKIRTING })
  const finishId = getFinishId({ type: MAT_CAR_SKIRTING })

  const update = () => {
    let skirtingFinishes = product.componentsData.accessories?.skirtings?.finishes || []

    if(skirtingFinishes && product.offeringLocation === OFFERING_INDIA && product?.rules?.indiaFinishExceptions) {
      skirtingFinishes = skirtingFinishes.filter(item => {
        const test = {
          TESTING: 'skirtingFinish',
          PRODUCT: product.product,
          FINISH: item.id,
          B_FINISH: getFinishId({type:MAT_CAR_WALL_FINISH_B}),
          A_FINISH: getFinishId({type:MAT_CAR_FRONT_WALL_A}),
          CEILING_FINISH: getFinishId({type:MAT_CAR_CEILING}),
          DESIGN: design.originalSapId,
        }
        return jsonLogic.apply(product.rules.indiaFinishExceptions, test)
      })
    }

    setFinishes(skirtingFinishes)
    if(getComponentId({type: TYP_CAR_SKIRTING})) setToggle(true)
    if(product && product.rules && product.rules.accessoriesEdit ) {
      const test={}
      test['FLOOR_MATERIAL'] = getMaterial({type: MAT_CAR_FLOORING, finish: getFinishId({type: MAT_CAR_FLOORING})});
      test['PRODUCT'] = product.product;
      const disableRemoveAddList = jsonLogic.apply(product.rules.accessoriesEdit, test)
      if(disableRemoveAddList && disableRemoveAddList[0] && disableRemoveAddList[0].length > 0) {
        setDisableRemove(disableRemoveAddList[0])
      }
    }
  }

  // on component mount
  useEffect(() => {
    
    update()
  }, [])
  
  // on product change
  useEffect(() => {
    update()
  }, [product])

  useEffect(() => {
    if(toggle === undefined) return;
    if(toggle){
      if(!getComponentId({type: TYP_CAR_SKIRTING})) {
        setDefaultComponent({ type: TYP_CAR_SKIRTING })
      }
    } else {
      setComponent({type: TYP_CAR_SKIRTING, component: null})
    }

    if(!toggle) setComponent({ type: TYP_CAR_SKIRTING, component: null})
  }, [toggle])

  const onBackClick = () => {
    setEditView('accessories')
  }

  finishes.forEach(finish => {
    finish.image = `thumbnails/${componentId}_${finish.id}.png`
  })
  return (      
    <div className="Skirting">        
      <EditorLayout heading={getText('ui-skirting-heading')} action={getText('ui-general-back')} actionClickHandler={onBackClick} >
        <ScrollBox>
          { (product && (!product.extraFeatures || product.extraFeatures.indexOf(SKIRTING_MANDATORY) === -1)) &&
            <SwitchButton toggle={toggle} label={getText('ui-skirting-add')} onChange={e => setToggle(e)} isDisabled={(disableRemove.indexOf(TYP_CAR_SKIRTING)!==-1)} />
          }
          {toggle ?
          <>
            <HeadingComponent heading={getText('ui-skirting-select')} info={getText('ui-skirting-select-i')} padding="sm" border="top" />
            
            <ImageTitle items={finishes} onChange={id => setFinish({ type: MAT_CAR_SKIRTING, finish: id })} selectedId={finishId} className="noUppercase"/> 
            
            { (product?.businessSpecification?.market !== 'ENA' && product?.offeringLocation !== OFFERING_INDIA ) &&
              <InfoBox text={getText('ui-skirting-info')} style={{ marginTop: '20px' }} /> 
            }
          </> :
          null } 
          <div style={{height:'20px'}} />
        </ScrollBox>
      </EditorLayout>
    </div>
  )
}
export default Skirting;