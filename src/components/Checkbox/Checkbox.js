import React from 'react'
import Icon from '../Icon'

import './Checkbox.scss'

function Checkbox(props) {
  const {
    className = '',
    theme = 'default',
    labelText,
    selected,
    disabled,
    onChange
  } = props

  return (
    <div className={`Checkbox theme-${theme} ${className} ${selected ? 'selected' : ''}`} onClick={() => onChange(!selected)}>
      <div className={'checkBox'+ (disabled ? ' disabled' :'')}>
        { selected &&
          <Icon id="icon-check-white" />
        }
      </div>
      <div className={'checkLabel'+ (disabled ? ' disabled' :'')}>
        {labelText}
      </div>
    </div>
  )
}

export default Checkbox