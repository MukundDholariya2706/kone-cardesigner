import './Dropdown.scss';

import React, { forwardRef } from 'react';
import DropdownContainer, {DropdownTrigger, DropdownContent} from 'react-simple-dropdown';

/**
 * Renders out the Dropdown 
 * @function Dropdown Dropdown renderer
 * @param {Object} params Properties passed to this renderer
 */
const Dropdown = ({children, label, onShow }, ref) => {
  return (
    <DropdownContainer ref={ref} onShow={onShow}>
      <DropdownTrigger>{ label }</DropdownTrigger>
      <div className="content-container">
        <DropdownContent>
          { children }
        </DropdownContent>
      </div>
    </DropdownContainer>
  )
}

export default forwardRef(Dropdown);