import React from 'react'
import AccordionItem, { AccordionHead, AccordionBody } from '../AccordionItem'

import './SectionAccordion.scss'

/**
 * 
 * @param {Object} props 
 * @param {string=} props.className 
 */
function SectionAccordion(props) {
  const {
    className = '',
    children,
    heading,
    displayedValue,
    isOpen,
    handleClick,
    disabled,
    disableAnimation = false,
    controlled,
    defaultOpen = false,
    accordionWasOpened = () => {}
  } = props

  let classes = `SectionAccordion ${className}`

  if (disableAnimation) {
    classes += ' SectionAccordion--no-animation'
  }
  
  if (disabled) {
    classes += ' SectionAccordion--disabled'
  }
  return (
    <div data-testid="SectionAccordion" className={classes}>
      <AccordionItem defaultOpen={defaultOpen} isOpen={isOpen} handleClick={handleClick} disabled={disabled} controlled={controlled} accordionWasOpened={accordionWasOpened}>
        <AccordionHead className="SectionAccordion_head">
          <div className="SectionAccordion__heading">{ heading }</div>
          <div className="SectionAccordion__selected-value">{ displayedValue }</div>
        </AccordionHead>
        <AccordionBody className="SectionAccordion__body">
          { children }
        </AccordionBody>
      </AccordionItem>
    </div>
  )
}

export default SectionAccordion