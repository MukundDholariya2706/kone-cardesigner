import "./ScrollBox.scss"

import React from 'react';

/**
 * Creates the list component
 * @function Layout Render function for layout structure
 * @param {Object} props Properties passed to this renderer
 */
const ScrollBox = ({ 
  children,
  padding,
  className,
  id
}, ref) => {  
  return (
    <div ref={ref} className={"ScrollBox" + (padding ? ' padding-' + padding : '') + (className ? ' ' + className : '') } id={id} >
      { children }
    </div>
  )
}
export default React.forwardRef(ScrollBox)