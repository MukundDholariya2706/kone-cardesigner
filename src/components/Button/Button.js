import "./Button.scss"

import React from 'react';
import Icon from "../Icon";

/**
 * Creates the list component
 * @function Layout Render function for layout structure
 * @param {Object} props Properties passed to this renderer
 */
const Button = ({ 
  children,
  padding,
  className,
  selected,
  disabled,
  inlineBlock,
  theme,
  icon,
  iconFill,
  onClick,
}) => {

  const iconStyle = {}

  if (iconFill) {
    iconStyle.fill = iconFill
  }

  return (
    <div className={ 
      "Button" + (selected ? ' selected' : '') + 
      (theme && Array.isArray(theme) ? theme.map(t => (' theme-' + t)).join('')  : '') + // if array
      (theme && !Array.isArray(theme) ? ' theme-' + theme : '') + // if array
      (padding ? ' padding-' + padding : '') + 
      (disabled ? ' disabled' : '') + 
      (inlineBlock ? ' inline-block' : '') + 
      (className ? ' ' + className : '') 
    } onClick={ onClick }>
      { icon && <Icon style={iconStyle} id={icon} />}
      { children }
    </div>
  )
}
export default Button