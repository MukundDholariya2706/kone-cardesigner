import './InfoBox.scss'
import React from 'react'
import Icon from '../Icon';

const InfoBox = ({ className, text, iconClassName = '', header = '', icon = '', hAlign='', style = {}, children }) => {
  return (
    <div className={ 'InfoBox' + ( className ? ` ${className}` : '' ) + ( hAlign ? ` h-align-${hAlign}` : '')} style={style}>
      <div className="icon-container">
        <Icon className={iconClassName} id={icon ? icon : "icon-info-square"} />
      </div>
      <div className="text-container">
        { header && <p className="text-head">{header}</p> }
        <p className="text-body">{text}</p>
        {children}
      </div>
    </div>
  )
}

export default InfoBox