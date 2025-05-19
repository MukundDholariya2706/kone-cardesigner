import './ServiceBlock.scss'

import React, { useContext } from 'react'
import Sprite from '../Sprite';
import Icon from '../Icon'
import InfoBox from '../InfoBox';
import { LayoutContext } from '../../store/layout';
import { DesignContext } from '../../store/design'
import { TranslationContext } from '../../store/translation';
import HeadingComponent from '../HeadingComponent/HeadingComponent';

/**
 * ServiceBlock UI component
 * @param {Object} props
 */
const ServiceBlock = ({title = '', info, className = '', children, viewToOpen, serviceType, hidden, serviceIcon=null, serviceImage=null,
                         disableAdd=[], disableRemove=[]}) => {
  const { getText } = useContext(TranslationContext);
  const { setEditView } = useContext(LayoutContext);
  const { getService, setService } = useContext(DesignContext)

  if (hidden) return null

  const service = getService({type:serviceType})

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
    setService({ type: serviceType, value:false })
  }
  
  // will remove button be visible
  const showRemove = (type) => {
    if(typeof type === 'string') {
      return disableRemove.indexOf(type) === -1
    } else {
      return !(type.every( item => (disableRemove.indexOf(item) !== -1) ) )
    }
  }

  // will add button be visible
  const showAdd = (type) => {
    return disableAdd.indexOf(type) === -1
  }

  return (
    <div className={`ServiceBlock ${className}`}>
      <HeadingComponent heading={title} info={info} padding="sm" >        
        { (serviceType && service ) && showRemove(serviceType) &&
          <div className="delete-button" onClick={handleDeleteClick}>
            <Icon id="icon-accessories-del" />
          </div>
        }
        {(serviceType && service ) &&
          <div className="edit-button" onClick={handleEditClick}>
            <Icon id="icon-accessories-edit" />
          </div>
        }
      </HeadingComponent>

      <div className="ServiceBlock__content">
        {(serviceType && service )

          // service items
          ? <div className="edit-container">
              <div className="edit-contents">
                <ServiceLayout icon={serviceIcon} image={serviceImage} />
              </div>

            </div>
          : showAdd(serviceType)          
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

export default ServiceBlock



/**
 * ServiceLayout UI component
 * @param {Object} props
 */
const ServiceLayout = ({ icon, image }) => {
  const {getText} = useContext(TranslationContext)
  return (
    <div className="ServiceLayout">
        {icon
          ? <div className="service-icon">
              <Icon id={icon} />
            </div>

          : <div className="service-image">
              <Sprite src={image} />
            </div>
        }
      <span className="service-name">{getText('ui-included')}</span>
    </div>
  )
}