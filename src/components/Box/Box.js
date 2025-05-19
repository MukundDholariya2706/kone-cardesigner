import "./Box.scss"

import React from 'react';

/**
 * Creates the list component
 * @function Layout Render function for layout structure
 * @param {Object} props Properties passed to this renderer
 */
const Box = ({ 
  children,
  padding,
  margin,
  className,
}) => {  
  return (
    <div className={"Box" + (margin ? ' margin-' + margin : '') + (padding ? ' padding-' + padding : '') + (className ? ' ' + className : '') } >
      { children }
    </div>
  )
}
export default Box