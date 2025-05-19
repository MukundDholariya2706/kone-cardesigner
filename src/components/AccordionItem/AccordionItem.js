import "./AccordionItem.scss"

import React, { useState, useEffect } from 'react';
import Icon from "../Icon";

/**
 * Creates the list component
 * @function Layout Render function for layout structure
 * @param {Object} props Properties passed to this renderer
 */
const AccordionItem = ({
  children,
  padding,
  className,
  controlled,
  isOpen,
  handleClick,
  disabled,
  defaultOpen = false,
  accordionWasOpened = () => {}
}) => {

  const [_open, _setOpen] = useState(defaultOpen)    

  const open = controlled ? isOpen :_open
  const setOpen = 
    disabled ? () => {} :
    controlled ? handleClick : _setOpen

  useEffect(() => {
    if(disabled) {
      _setOpen(false)
    }
  }, [disabled])

  return (
    <div className={"AccordionItem" + (padding ? ' padding-' + padding : '') + (className ? ' ' + className : '') + (open ? ' open' : '') } >
      { React.Children.toArray(children).filter(item => (item.type === AccordionHead || item.type === AccordionBody)).map((item, key) => {     
        return React.cloneElement(item, { open, setOpen, key, disabled, accordionWasOpened })
      }) }
    </div>
  )
}

export default AccordionItem

export const AccordionHead = ({
  children,
  padding,
  className,
  open, 
  setOpen,
  disabled,
  accordionWasOpened = () => {}
}) => {

  useEffect( () =>{
    if(open === true && accordionWasOpened !== null) {
      accordionWasOpened(open)
    }
  }, [open])

  return (
    <div className={"AccordionHead" + (padding ? ' padding-' + padding : '') + (className ? ' ' + className : '') + (disabled ? ' disabled' : '') } onClick={ e => setOpen(!open) } >
      { children }
      <div className="AccordionHead-chevron">
        <Icon style={{fill: disabled ? '#C6CACC' : '#0071b9'}} id="icon-chevron-down" />
      </div>
    </div>
  )
}

export const AccordionBody = ({
  children,
  padding,
  className,
}) => {
  return (
    <div className={"AccordionBody" + (padding ? ' padding-' + padding : '') + (className ? ' ' + className : '') } >
      { children }
    </div>
  )
}