import "./ListComponent.scss"

import React from 'react';

/**
 * Creates the list component
 * @function Layout Render function for layout structure
 * @param {Object} props Properties passed to this renderer
 */
const ListComponent = ({ 
  children, 
  direction,
  gap,
  align,
  padding,
  className,
}) => {  

  return (
    <div className={"List" + (className ? ` ${className}` : '') + (gap ? ' gap-' + gap : '') + (direction ? ' direction-' + direction : '') + (align ? ' align-' + align : '') + (padding ? ' padding-' + padding : '') } >
      { React.Children.toArray(children).map((item, key) => {
        return (
          <div key={key} className="ListItem">
            { item }
          </div>
        )
      }) }
    </div>
  )
}
export default ListComponent