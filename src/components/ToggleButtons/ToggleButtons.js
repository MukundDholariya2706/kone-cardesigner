import './ToggleButtons.scss'
import React from 'react'

const ToggleButtons = ({ content = [], type = "box", selectedButton, styles="", onChange, disableOptions=[], style = {} }) => {

  const onSelect = (num) => {
    onChange(num)
  }

  return (
    <div className={'ToggleButtons' + (type ? ` type-${type}` : '')} style={style}>
    { type === 'number' ?
      content.map((item, key)=> (
        <div className={"toggle-button" + 
          (selectedButton === item ? ' selected' : '') +
          (disableOptions.length && disableOptions[key] ? ' disabled' : '') + 
          (styles !== '' ? ' ' + styles : '')}
          key={key} 
          onClick={e => onSelect(item)}
        >
          {item}
        </div>
      )) : 
      content.map((item, key)=> (
        <div className={ "toggle-button" + 
          (selectedButton === item.value ? ' selected' : '') +
          ((disableOptions.length && disableOptions[key]) || content[key].disabled ? ' disabled' : '') + 
          (styles !== '' ? ' ' + styles : '') }
          key={key} onClick={e => onSelect(item.value)}
        >
          {item.label}
        </div>
      ))
    }
    </div>
  )
}

export default ToggleButtons