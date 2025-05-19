import "./TextLine.scss"

import React from 'react';
import Sprite from '../Sprite';

/**
 * Renders TileImage
 * @param {Object} props Properties passed to this renderer
 */
const TextLine = ({ 
  title,
  value,
  id,
  className,
  children,
}) => {  
  return (
    <div className={'TileImage' + (className ? ` ${className}` : '')} id={id ?id :''}>
      <div className='item'>
        <span>
          {title}
        </span>
        <span>
          {value}
        </span>
      </div>
      { children }
    </div>
  )
}
export default TextLine