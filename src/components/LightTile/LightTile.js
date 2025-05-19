import "./LightTile.scss"

import React from 'react';
import Icon from "../Icon";

/**
 * Creates the tile component light selector
 * @function Layout Render function for layout structure
 * @param {Object} props Properties passed to this renderer
 */
const LightTile = ({ 
  id = '',
  selected = false,
  onClick,
}) => {    
   
  return (
    <div className={ 'LightTile' + (selected ? ' selected' : '') + (id ? ' ' + id.toLowerCase() : '') } onClick={ e => (onClick && onClick()) }>
      <Icon id={'icon-light-' + id.toLowerCase()} />
      <div className="underline" />
    </div>
  )
}
export default LightTile