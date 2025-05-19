import './Icon.scss';
import React from 'react';

const Icon = ({ id, style = {}, className = '' }) => {
  return (
    <svg data-testid={id} className={`svg-icon svg-${id}-dims ${className}`} style={style} title="Extended lead time">
      <use xlinkHref={`#${id}`}></use>
    </svg>
  )
}
export default Icon; 

