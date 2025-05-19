import './ChevronProcess.scss'

import React from 'react';

const ChevronProcess = ({ children, margin }) => {
  return (
    <div className={'ChevronProcess' + (margin ? ` margin-${margin}` : '')}>
      { React.Children.toArray(children).filter(item => (item.type === ChevronProcessItem)).map((item, key) => {     
        return React.cloneElement(item, { key, number: `0${( key + 1 )}` })
      }) }
    </div>
  )
}

export const ChevronProcessItem = ({ number, selected, disabled, children, onClick }) => {
  return (
    <div className={'ChevronProcessItem' + (selected ? ' selected' : '') + (disabled ? ' disabled' : '')} onClick={ e => onClick && !disabled && onClick(e) }>
      <div className="ChevronProcessItem-start" />
      <div className="ChevronProcessItem-container">
        <div className="ChevronProcessItem-number">{ number }</div>
        <div className="ChevronProcessItem-label">{ children }</div>
      </div>
      <div className="ChevronProcessItem-end" />
    </div>
  )
}

export default ChevronProcess