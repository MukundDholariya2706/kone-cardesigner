import "./HeadingComponent.scss"

import React from 'react';
import Info from "../info/Info";


/**
 * Creates the list component
 * @function Layout Render function for layout structure
 * @param {Object} props Properties passed to this renderer
 */
const HeadingComponent = ({
  heading,
  info,
  style={},
  headingStyle={},
  children, 
  className,
  padding,
  border,
  align,
}) => {
  
  return (
    <div className={
      "HeadingComponent" + 
      (className ? ' ' + className : '') + 
      (padding ? ' padding-' + padding : '') + 
      (border ? ' border-' + border : '') +
      (align ? ' align-' + align : '') 
    }  style={ style }>      
      <div className="headerLabel" style={headingStyle}>
        {heading}
      </div>
      {info && info.trim().length > 0 && <Info text={info} />}
      {children}
    </div>
  )
}
export default HeadingComponent