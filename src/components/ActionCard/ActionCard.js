import './ActionCard.scss'

import React from 'react'
import Icon from '../Icon'
import Sprite from '../Sprite'

const ActionCard = ({ label, image, selected, onClick, imageContainerClassName = '' }) => {
  return (
    <div className={'ActionCard' + (selected ? ' selected' : '') } onClick={ e => onClick && onClick(e) }>
      { image && <div className={`image-container ${imageContainerClassName}`}><Sprite className="ActionCard-image" src={ image } /></div> }
      <div className="ActionCard-container">
        <div className="ActionCard-label">{ label }</div> 
        <div className="ActionCard-icon-container">
          <Icon id="icon-arrow-right" />
        </div>
      </div>
    </div>
  )
}

export default ActionCard