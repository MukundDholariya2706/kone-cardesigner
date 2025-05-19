import React from 'react'
import Icon from '../Icon'

import './ButtonWithIcon.scss'

/**
 * 
 * @param {Object} props 
 * @param {string=} props.className 
 */
function ButtonWithIcon(props) {
  const {
    className = '',
    id = '',
    children,
    style,
    onClick,
    iconId,
    icon2Id = null,
    disabled=false,
  } = props

  return (
    <div data-testid="ButtonWithIcon" onClick={onClick} className={`ButtonWithIcon ${className} ${disabled ?'disabled' :''}`}
      style={style} id={id}
    >
       <Icon className="button-icon" id={iconId} />
       <span className="button-text">
          { children }
       </span>
      {icon2Id && <Icon className="button-icon2" id={icon2Id} />}
    </div>
  )
}

export default ButtonWithIcon