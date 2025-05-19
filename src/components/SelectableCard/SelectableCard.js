import './SelectableCard.scss';
import React from 'react';
import Button from '../Button';
import Sprite from '../Sprite/Sprite';
import Icon from '../Icon'


const SelectableCard = ({ selected, image=null, icon=null, children, onClick, selectText, selectedText, className = '', imageStyle = 'normal' }) => {
  return (
    <div className={`SelectableCard ${className}`}>
      <div className="card-content">
        {image &&
          <div className={`SelectableCard-sprite-container image-style-${imageStyle}`}><Sprite src={image} /></div>
        }      
        {icon &&
          <div className="SelectableCard-icon-container"><Icon id={icon} /></div>
        }      
        <div className="SelectableCard-label">
          { children }
        </div>
      </div>
      <Button onClick={onClick} icon={selected ? 'icon-check-white' : undefined} selected={selected} theme={['md', 'outline', 'white-blue', ...(selected ? ['with-icon'] : [])]} className="SelectableCard-button">
        { selected ? selectedText : selectText }
      </Button>
    </div>
  )
}

export default SelectableCard