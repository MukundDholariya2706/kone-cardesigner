import './ImageTitle.scss'
import React, {useContext} from 'react'
import { TranslationContext } from '../../store/translation/TranslationProvider';
import Sprite from '../Sprite';
import Icon from '../Icon';


const ImageTitle = ({ items, onChange, selectedItem, icon, selectedId, wide, enabledItems=null, className = '' }) => {
  const { getText } = useContext(TranslationContext);

  
  if (!items || !items.length) {
    return null
  }

  if (!selectedId && selectedItem) {
    selectedId = selectedItem.id
  }

  return (
    <div className={`ImageTitle ${className}`}>
    { 
      items.map((item, key) => (
        <div className={"tile-wrapper" + ( wide ? ' wide': '' )} key={key} >
          <div
          className={"tile" + (item.id === selectedId ? ' selected' : '') + ((enabledItems && !enabledItems.find(enabled => enabled.id === item.id)) ? ' disabled' : '')} 
          onClick={onChange.bind(this, item.id)} 
          > 
            { item.image &&
            <div className="sprite-container">
              { icon ? 
              <Icon className="component-icon" id={item.image} /> :
              <Sprite src={item.image} />
              }
            </div>
            }
            { !item.image &&
              <div className="sprite-container icon-container">
                <Icon id="icon-no-image" />
              </div>
            }
            <div className="label">{getText(item.name)}</div>
          </div>
        </div>
      ))
    }
    </div>
  )
}

export default ImageTitle