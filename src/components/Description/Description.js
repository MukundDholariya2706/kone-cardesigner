import "./Description.scss"

import React from 'react';

/**
 * Creates the list component
 * @function Layout Render function for layout structure
 * @param {Object} props Properties passed to this renderer
 */
const Description = ({
  style={},
  children, 
  text,
  className,
  padding,
  border,
}) => {
  
  return (
    <div className={"Description" + (className ? ' ' + className : '') + (padding ? ' padding-' + padding : '') + (border ? ' border-' + border : '') }  style={ style }>
      { children || text }
    </div>
  )
}
export default Description