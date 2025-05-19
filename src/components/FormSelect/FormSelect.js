import React, { useState, useRef, useMemo } from 'react'

import chevron from '../../assets/icons/icon-select-white.svg'

import './FormSelect.scss'
import { useOnClickOutside } from '../../utils/customHooks'
import { useEffect } from 'react'

/**
 * 
 * @param {Object} props 
 * @param {string=} props.className 
 * @param {string=} props.label 
 * @param {Object[]} props.options 
 * @param {string} props.options.text - The text that is displayed in UI 
 * @param {string} props.options.value - The value that is used for onChange when this option is selected 
 * @param {string=} props.options.group - An optional group for the option 
 * @param {Function} props.onChange - Called with the value of the selected option 
 * @param {Function=} props.onClick
 * @param {string=} props.value - Currently selected option
 * @param {string=} props.emptySelectionText - The text that is displayed when nothing is selected
 * @param {boolean=} props.required
 * @param {boolean=} props.centerContent
 * @param {'normal' | 'big'} [props.size='normal'] props.size
 */
function FormSelect(props) {
  const {
    className = '',
    label,
    options,
    disabled,
    onChange,
    onClick = () => {},
    value,
    emptySelectionText,
    required,
    centerContent,
    size="normal"
  } = props

  const [ isOpen, setIsOpen ] = useState(false)
  const [ isFocused, setIsFocused ] = useState(false)

  const ref = useRef()

  useOnClickOutside(ref, () => {
    setIsOpen(false)
  })

  function handleClick(e) {
    e.stopPropagation()
    if (disabled) return
    setIsOpen(prev => !prev)
  }

  let formSelectClassName = `FormSelect ${className} size-${size}`

  if (isOpen) {
    formSelectClassName += ' open'
  }
  
  if (isFocused) {
    formSelectClassName += ' focused'
  }

  if (required && (!value || value === 'none')) {
    formSelectClassName += ' invalid'
  }
  
  if (disabled) {
    formSelectClassName += ' disabled'
  }

  // Group the options based on their 'group' property value.
  // Anything without group property value goes to 'rest' array.
  const { groups, rest } = useMemo(() => {
    const rest = emptySelectionText ? [
      {
        value: 'none',
        text: emptySelectionText,
      }] : []
    const groups = options.reduce((prev, curr) => {
      const groupName = curr.group

      if (!groupName) {
        rest.push(curr)
        return prev
      }

      if (!prev[groupName]) {
        prev[groupName] = []
      }

      prev[groupName].push(curr)
      return prev
    }, {})

    const result = Object.entries(groups)
      .map(([label, options]) => ({ label, options }))
      .sort((a, b) => {
        if (a.label.toLowerCase() > b.label.toLowerCase()) return 1
        if (a.label.toLowerCase() < b.label.toLowerCase()) return -1
        return 0
      })
    return { groups: result, rest }
  }, [options, emptySelectionText])

  function onScroll(e) {
    setIsOpen(false)
  }

  useEffect(() => {
    // The default select element automatically closes on document scroll 
    // so the state should match that behavior
    

    // 'mousewheel' because 'scroll' does not happen on pages that do not have any overflow
    document.addEventListener('wheel', onScroll)
    
    return () => {
      document.removeEventListener('wheel', onScroll)
    }
  }, [])


  return (
    <div data-testid="FormSelect" className={formSelectClassName} onClick={onClick}>
      {label && <div className="label-container">
        <p className="label">{label} {required && <span className="required">*</span> }</p>
      </div> }
      <div ref={ref} onClick={handleClick} className={`select-container ${centerContent ? 'centered' : ''}`}>
        <select
          data-testid="select"
          tabIndex={disabled ? -1 : 0}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          value={value || ''}
          onChange={(e) => {
            if (disabled) return
            if (e.target.value === 'none') {
              onChange(null)
            } else {
              onChange(e.target.value)
            }

            setTimeout(() => {
              // This has to happen after the handleClick of the container,
              // so using setTimeout
              setIsOpen(false)
            }, 0)
          }}
        >
          {rest.map((item, key) => (
            <option key={key} disabled={item.disabled} data-testid="select-option" value={item.value} className={item.className || 'select-option'}>
              {item.text}
            </option>
          ))}
          { groups.map(group => {
            return <OptionGroup key={group.label} label={group.label} options={group.options} />
          })}
        </select>
        <div  className="chevron-container">
          <img src={chevron} />
        </div>
      </div>
    </div>
  )
}

function OptionGroup(props) {
  const { label, options = [] } = props

  return (
    <optgroup data-testid={label} className="select-option-group" label={label}>
      { options.map(item => {
        return <option className="select-option" key={item.value} value={item.value}>{item.text}</option>
      }) }
    </optgroup>
  )
}

export default FormSelect