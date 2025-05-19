import React, { useRef } from 'react'

import './FormRadio.scss'


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
function FormRadio(props) {
  const {
    className = '',
    label,
    options,
    onChange,
    onClick = () => {},
    value,
    emptySelectionText,
    required,
    size="normal"
  } = props


  const ref = useRef()


  let formRadioClassName = `FormRadio ${className} size-${size}`

  if (required && (!value || value === 'none')) {
    formRadioClassName += ' invalid'
  }


  return (
    <div data-testid="FormRadio" className={formRadioClassName} onClick={onClick}>
      {label && <div className="label-container">
        <p className="label">{label} {required && <span className="required">*</span> }</p>
      </div> }
      <div ref={ref} className={`radio-container`}>
        <ul>
          {options.map(item => {          
            return (<li className="radio-item" key={item.value}>
                <input type="radio" id={item.value} value={item.value} name={label} onClick={e => onChange(item.value)}/>
                <label for={item.value}>{item.text}</label>
                <div className="check"></div>
              </li>)}
            )
          }
        </ul>
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

export default FormRadio