import './TenantDirectory.scss';
import React, { useContext, useState, useEffect } from 'react';
import jsonLogic from 'json-logic-js';

import { ProductContext } from '../../store/product';
import { DesignContext } from '../../store/design';
import { TranslationContext } from '../../store/translation';
import EditorLayout from '../EditorLayout';
import ImageTitle from '../ImageTitle'
import SwitchButton from '../SwitchButton';
import { LayoutContext } from '../../store/layout';
import { TYP_CAR_TENANT_DIRECTORY, MAT_CAR_TENANT_DIRECTORY, TYP_COP_PRODUCT_1, TYP_CAR_GLASS_WALL_C } from '../../constants';
import RadioButtonGroup from '../RadioButtonGroup';
import InfoBox from '../InfoBox';
import HeadingComponent from '../HeadingComponent/HeadingComponent';
import ScrollBox from '../ScrollBox';


const TenantDirectory = (props) => {
  
  const { getText } = useContext(TranslationContext);
  const { setEditView } = useContext(LayoutContext);
  const { product, getComponents } = useContext(ProductContext);
  const { getFinish: getFinishId, getComponent: getComponentId, setComponent, setFinish, 
    setComponentFinish, setDefaultComponent, setPositions, getPositions, design } = useContext(DesignContext)

  const [ tdFinishes, setTdFinishes ] = useState([])
  const [ toggle, setToggle ] = useState(true)
  
  const componentId = getComponentId({ type: TYP_CAR_TENANT_DIRECTORY })
  const finishId = getFinishId({ type: MAT_CAR_TENANT_DIRECTORY })
  const [ components, setComponents ] = useState([])
  const [ tdSize, setTdSize ] = useState()
  const [ tdFinish, setTdFinish ] = useState()
  const tenantDirectoriesData = product.componentsData.accessories.tenantDirectories

  // Sets the td finishes list based on the selected size.
   useEffect(() => {

    let newFinishes=[]
    components.filter(component => (!component.disabled && component.properties.size === tdSize))
      .forEach(item =>{
        item.properties.finishes.forEach(finishItem => {
          if(!finishItem.disabled) {
            newFinishes.push({
              ...finishItem,
              image: item.image
            })
          }
        })
      })
          

    setTdFinishes(newFinishes)
  }, [tdSize, components])

  const update = () => {
    setComponents(getComponents({ type: TYP_CAR_TENANT_DIRECTORY }))
  }

  const positionTenantDirectory = () => {
    if(product && product.rules && product.rules.tenantDirectory) {

      const cop1Pos = (getPositions({type:TYP_COP_PRODUCT_1}) || []).join('')
      const tdPosition = jsonLogic.apply( product.rules.tenantDirectory, { COP1POS: cop1Pos, SCENIC: getPositions({type:TYP_CAR_GLASS_WALL_C})})
      setPositions({ type: TYP_CAR_TENANT_DIRECTORY, positions: (tdPosition || ['B2']) } )
    }

  }

  const getTdSizes = () => {
    let items = components.map(item => ({id: item.properties.size, label: `td-size-${item.properties.size}`}))
    return [...new Set(items.map(obj => JSON.stringify(obj)))].map(obj => JSON.parse(obj)).sort((a, b) => {
      if (a.id > b.id) return -1
      if (a.id < b.id) return 1
      return 0
    })
  }

  // const tdFinishes = getTdFinishes()
  const tdSizes = getTdSizes()
  
  useEffect(() => {
    if(toggle === undefined) return;
    if(toggle){
      const defaultFinish = ((tenantDirectoriesData || {}).finishes || []).find(f => !f.disabled).id || 'F'
      const defaultSize = ((tenantDirectoriesData || {}).sizes || []).find(s => !s.disabled).id || 'A4'
      if (!componentId) {
        setDefaultComponent({ type: TYP_CAR_TENANT_DIRECTORY })
        setComponentFinish({ type: TYP_CAR_TENANT_DIRECTORY, finishType: MAT_CAR_TENANT_DIRECTORY, finish: defaultFinish })
        setTdFinish(defaultFinish)
        setTdSize(defaultSize)
      }
      else setTdFinish(finishId)
  
      if(componentId === 'TD1' || componentId === 'TD4') {
        setTdSize('A4')
      }
      if(componentId === 'TD2' || componentId === 'TD3') {
        setTdSize('A3')
      }
      update()
      positionTenantDirectory()
    } else {
      setComponent({type: TYP_CAR_TENANT_DIRECTORY, component: null})
    }

    if(!toggle) setComponent({ type: TYP_CAR_TENANT_DIRECTORY, component: null})
  }, [toggle])

    // on product change
  useEffect(() => {
    if (toggle && !getPositions({type: TYP_CAR_TENANT_DIRECTORY}) ) {
      positionTenantDirectory()
    }
    
  }, [design])
  
  // on product change
  useEffect(() => {
    update()
  }, [product])

  useEffect(() => {
    if(tdFinish && tdSize) {
      if((tdFinish === 'F' || tdFinish === 'H') && tdSize === 'A4') setComponent({ type: TYP_CAR_TENANT_DIRECTORY, component: 'TD1' })
      if((tdFinish === 'F' || tdFinish === 'H') && tdSize === 'A3') setComponent({ type: TYP_CAR_TENANT_DIRECTORY, component: 'TD2' })
      if(tdFinish === 'glass'  && tdSize === 'A3') setComponent({ type: TYP_CAR_TENANT_DIRECTORY, component: 'TD3' })
      if(tdFinish === 'glass'  && tdSize === 'A4') setComponent({ type: TYP_CAR_TENANT_DIRECTORY, component: 'TD4' })
    }
    
  }, [tdSize, tdFinish])

  const onFinishChange = (id) => {
    setTdFinish(id)
    setFinish({ type: MAT_CAR_TENANT_DIRECTORY, finish: id })
  }

  const onBackClick = () => {
    setEditView('accessories')
  }

  return (      
    <div className="TenantDirectory">        
      <EditorLayout heading={getText('ui-tenant-directory-heading')} action={getText('ui-general-back')} actionClickHandler={onBackClick} >
        <ScrollBox>
          <SwitchButton toggle={toggle} label={getText('ui-tenant-directory-add')} onChange={e => setToggle(e)} />
            {toggle ?
            <>
              <HeadingComponent heading={getText('ui-tenant-directory-select-finish')} info={getText('ui-tenant-directory-select-finish-i')} padding="sm" border="top" />
              
              <ImageTitle items={tdFinishes} onChange={id => onFinishChange(id)} selectedId={tdFinish} className="noUppercase"/>
              
              <HeadingComponent heading={getText('ui-tenant-directory-size')} info={getText('ui-tenant-directory-size-i')} padding="sm" border="top" />

              <RadioButtonGroup descriptionField="label" selectionList={tdSizes} selectedItem={{id: tdSize}} onChange={id => setTdSize(id)} />

              <InfoBox text={getText('ui-tenant-directory-info')} />
            </> : null}
            <div style={{height:'20px'}} />
          </ScrollBox>
      </EditorLayout>
    </div>
  )
}
export default TenantDirectory;