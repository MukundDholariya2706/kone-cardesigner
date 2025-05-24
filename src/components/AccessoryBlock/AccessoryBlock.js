import './AccessoryBlock.scss'

import React, { useContext } from 'react'
import Sprite from '../Sprite';
import Icon from '../Icon'
import InfoBox from '../InfoBox';
import { LayoutContext } from '../../store/layout';
import { DesignContext } from '../../store/design/DesignProvider'
import { ProductContext } from '../../store/product/ProductProvider'
import { TranslationContext } from '../../store/translation/TranslationProvider';
import { BUFFER_RAIL_POSITIONS, TYP_CAR_BUFFER_RAIL, TYP_CAR_MIRROR, TYP_CAR_MIRROR_2} from '../../constants'
import HeadingComponent from '../HeadingComponent/HeadingComponent';

/**
 * AccessoryBlock UI component
 * @param {Object} props
 */
const AccessoryBlock = ({title = '', info, className = '', children, viewToOpen, componentType, finishType, layout='component', hidden,
                         disableAdd=[], disableRemove=[], showMirrorComponents=false }) => {
  const { getText } = useContext(TranslationContext);
  const { setEditView } = useContext(LayoutContext);
  const { getComponent, getFinish } = useContext(ProductContext)
  const { getComponent:getComponentId, getFinish:getFinishId, setComponent, getPositions } = useContext(DesignContext)

  if (hidden) return null

  let component;
  // info and media screens are in array
  if(typeof componentType !== 'string') {
    const componentIds = componentType.map(type => {
      if(!getPositions({type}) || getPositions({type}).length<1) {
        return null  
      }
      return ( getComponentId({ type: type }) || null )
    })
    if(componentIds.find(id => id !== null)) {
      component = []
      componentIds.forEach(id => {
        if(id) {
          component.push(getComponent({ id }))
        }
      })
    } else {
      component = null
    }
  } else  {
    const componentId = getComponentId({ type: componentType })
    component = getComponent({ id: componentId })
  }

  const finishId = getFinishId({ type: finishType })
  const finish = getFinish({ id: finishId })
  let positions = getPositions({ type: componentType }) 
  
  // special case for buffer rails, make sure that height information is not interpred as wall position and if now height information is present, make add button visible
  if(positions && positions.length>0 && componentType === TYP_CAR_BUFFER_RAIL) {
    let brHeigthPositionPresent = false
    BUFFER_RAIL_POSITIONS.forEach(item => {
      const bufferRailHeightIndex = positions.indexOf(item.id)
      if(bufferRailHeightIndex !== -1) {
        brHeigthPositionPresent = true
        positions.splice(bufferRailHeightIndex,1)
      }
    })
    if(!brHeigthPositionPresent && positions.length>0) {
      positions = []
    }
  }

  // click handler for add button
  const handleAddClick = (e) => {
    if (viewToOpen) {
      setEditView(viewToOpen)
    }
  }

  // click handler for edit button
  const handleEditClick = () => {
    if (viewToOpen) {
      setEditView(viewToOpen)
    }
  }

  // click handler for delete button
  const handleDeleteClick = (cType=null) => {

    if(cType !== null && typeof cType === 'string') {
      setComponent({ type: cType, component: null })
      return
    }
    
    if(typeof componentType === 'object') {
      componentType.forEach(type => setComponent({ type: type, component: null }) )
    } 
    setComponent({ type: componentType, component: null })
  }
  
  // will remove button be visible
  const showRemove = (type) => {
    if(typeof type === 'string') {
      return disableRemove.indexOf(type) === -1
    } else {

      if(showMirrorComponents) {
        return !(type.every( item => getComponentId({ type:item }) ) )
      } else {
        return !(type.every( item => (disableRemove.indexOf(item) !== -1) ) )
      }
    }
  }

  // will add button be visible
  const showAdd = (type) => {
    if(typeof type === 'string') {
      return disableAdd.indexOf(type) === -1
    } else {
      return !(type.every( item => (disableAdd.indexOf(item) !== -1) ) )
    }
  }

  return (
    <div className={`AccessoryBlock ${className}`}>
      <HeadingComponent heading={title} info={info} padding="sm" >
        { (( component || finish ) && ( !positions || positions.length!==0 ) && showRemove(componentType)) &&
          <div className="delete-button" onClick={handleDeleteClick}>
            <Icon id="icon-accessories-del" />
          </div>
        }
        {/* TODO: Add alt text for button 'ui-accessories-edit' */}
        { (( component || finish ) && ( !positions || positions.length!==0 ) ) && 
          <div className="edit-button" onClick={handleEditClick}>
            <Icon id="icon-accessories-edit" />
          </div>
        }

      </HeadingComponent>
      <div className="AccessoryBlock__content">
        {( ( component || finish ) && ( !positions || positions.length!==0 ) && showAdd(componentType) )
          ? ( showMirrorComponents === true && Array.isArray(componentType) && componentType.length===2

            // two components defined in the same edit panel, special for mirrors

            ?
              <>
                { Array.isArray(componentType) && componentType.map((cType,index) => {

                  if(cType === TYP_CAR_MIRROR && (!getComponentId({ type:cType }) || !getPositions({type:cType}) || getPositions({type:cType}).length<1) ) {
                    return null
                  }

                  const cTypeComponent = getComponentId({ type:cType })
                  if(!cTypeComponent) return null

                  let firstLine 
                  let secondLine
                  if(cType === TYP_CAR_MIRROR_2) {
                    const wamPositions = getPositions({type:TYP_CAR_MIRROR_2})
                    let wamSecondLine = ''
                    if(wamPositions && wamPositions.indexOf('A') !== -1) {
                      wamSecondLine +=getText('ui-wide-angle-mirror-front-wall')
                    }
                    if(wamPositions && wamPositions.indexOf('A') !== -1 && wamPositions.indexOf('C') !== -1) {
                      wamSecondLine +=', '
                    }
                    if(wamPositions && wamPositions.indexOf('C') !== -1) {
                      wamSecondLine +=getText('ui-wide-angle-mirror-back-wall')
                    }
                    secondLine = {name: wamSecondLine}
                    firstLine = {name:'ui-wide-angle-mirror'}
                  }

                  if(cType === TYP_CAR_MIRROR) {
                    secondLine = getComponent({id:cTypeComponent})
                    firstLine = {name:'ui-mirrors-heading'}
                  }

                  return (
                    <div className="edit-container" key={index}>
                      <div className="edit-contents">
                        {layout === 'component' && Array.isArray(component) && 
                          <ComponentLayout component={ firstLine } finish={secondLine} capitalComponent={true} />
                        }
                      </div>
                      <div className="edit-buttons">
                        {/* TODO: Add alt text for button ui-accessories-remove */}
                        { !showRemove(componentType) &&
                          <div className="delete-button" onClick={e => handleDeleteClick(cType)}>
                            <Icon id="icon-accessories-del" />
                          </div>
                        }
                      </div>
                    </div>
                  )
                }              
                )}
              </>

            // other than mirrors 
            : <div className="edit-container">
                <div className="edit-contents">
                  {layout === 'component' && Array.isArray(component) && 
                    <>
                    {component.map((comp,index) => {
                      return <ComponentLayout component={comp} finish={finish} key={index}/>
                    } ) }
                    </>
                  }
                  {layout === 'component' && !Array.isArray(component) && 
                    <ComponentLayout component={component} finish={finish} />
                  }
                  {layout === 'finish' && <FinishLayout finish={finish} />}
                </div>
              </div>

           )
          : showAdd(componentType)          
            ? <div className="edit-container">
                <button href="#" onClick={handleAddClick}
                  className="add-button">
                  <div className="add-button__image">+</div>
                  <p className="add-button__text">{getText('ui-general-add')}</p>
                </button>
              </div>
            : <div className="edit-container">
                <InfoBox text={getText('ui-accessory-no-selection')} />
              </div>
        }
      </div>
    </div>
  )
}

export default AccessoryBlock

/**
 * ComponentLayout UI component
 * @param {Object} props
 */
const ComponentLayout = ({ component: { name, id, properties } = {} , finish: { name: finishName } = {}, capitalComponent=false }) => {
  const {getText} = useContext(TranslationContext)

  // Tenant directory specifics ==========

  const getTdFinish = (finishName) => {
    if(finishName === 'finish-F') return 'Brushed Aluminium'
    if(finishName === 'finish-H') return 'Mirror polished aluminium'
    else return 'Glass'
  }

  if(name === 'component-TD1' || name === 'component-TD2' || name === 'component-TD3' || name === 'component-TD4') {
    return (
      <div className="ComponentLayout">
        <div className="component-name">{id}</div> 
        <div className="finish-name">{ ( (properties && properties.size ) ?properties.size+', ' :'')  +getText(getTdFinish(finishName))}</div> 
      </div>
    )
  } else return (
    <div className="ComponentLayout">
      <div className={'component-name'+(capitalComponent ?' uppercase' :'')}>{getText(name)}</div> 
      <div className="finish-name">{getText(finishName)}</div> 
    </div>
  )
}

/**
 * FinishLayout UI component
 * @param {Object} props
 */
const FinishLayout = ({ finish: { name, image } = {} }) => {
  const {getText} = useContext(TranslationContext)
  return (
    <div className="FinishLayout">
      <div className="finish-image">
        <Sprite src={image} />
      </div>
      <span className="finish-name">{getText(name)}</span>
    </div>
  )
}

/**
 * ServiceLayout UI component
 * @param {Object} props
 */
const ServiceLayout = ({ image }) => {
  const {getText} = useContext(TranslationContext)
  return (
    <div className="FinishLayout">
      <div className="finish-image">
        <Sprite src={image} />
      </div>
      <span className="finish-name">{getText('ui-included')}</span>
    </div>
  )
}