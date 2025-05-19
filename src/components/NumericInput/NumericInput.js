import './NumericInput.scss';
import React, { useState, useRef } from 'react';
import { useDebouncedCallback } from 'use-debounce'
import Icon from '../Icon'

const NumericInput = React.forwardRef( ({ icon, unit, value = 0, onChange, min = 0, max = 1, step = 1 }, ref)  => {

  const [ strValue, setStrValue ] = useState(value)
  
  const inputRef = useRef()

  React.useImperativeHandle(ref, () => ({
    setNewValue: (val) => {
      setStrValue(val)
    }
  }))

  const debounced = useDebouncedCallback( (value) => {
    onChange(value)
  }, 600)

  return (
    <div className={'NumericInput' + (icon ? ' with-icon' : '')}>
      { icon && <Icon id={icon}/> }
      <div className="input-with-unit">
        <input type="number" ref={inputRef} step={step} value={strValue} onChange={ e => {
          let v = e.target.value

          if (!isNaN(v)) {
            if (Number(v) < min) {
              v = min
            }
            if (Number(v) > max) {
              v = max
            }
          }

          setStrValue(v)

          if (!isNaN(v) && onChange) {
            debounced(Number(v))
          }
        } } />
        { unit && <div className="unit">{unit}</div> }
      </div>
    </div>
  )
})

export default NumericInput; 

