import './FormInput.scss'
import React, { useState } from 'react'

export const Honeypots = (options) => {
  const { onChange } = options

  return (
    <>
      <FormInput
        header="Website"
        className="type-1"
        placeholder=""
        required={false}
        onChange={(e) => onChange(e)}
        maxlength="80"
        honeypot={true}
        identifier="website" // Assuming this will never be a valid
      />
      <FormInput
        header="URL"
        className="type-2"
        placeholder=""
        required={false}
        onChange={(e) => onChange(e)}
        maxlength="80"
        honeypot={true}
        identifier="url" // Assuming this will never be a valid
      />
      <FormInput
        header="Homepage"
        className="type-3"
        placeholder=""
        required={false}
        onChange={(e) => onChange(e)}
        maxlength="80"
        honeypot={true}
        identifier="homepage" // Assuming this will never be a valid
      />
    </>
  )
}

const FormInput = ({ error = "", header, placeholder, required, onChange, textarea = false, honeypot, identifier, maxlength, className = '', onEnterKeyPress, }) => {
  const [focus, setFocus] = useState(false)
  const [invalid, setInvalid] = useState(false)

  const validateEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  const validatePhoneNumber = (number) => {
    const re = /^[+][0-9]{1,3}[-\s.]?[(]?[0-9]{1,3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im
    return re.test(String(number).toLowerCase());
  }

  const inputValidation = (e) => {
    const value = e.target.value

    let validInput

    switch (identifier) {
      case 'email':
        if (!value.trim()) {
          validInput = !required
        } else {
          validInput = validateEmail(value)
        }
        break
      case 'phone':
        if (value) {
          validInput = validatePhoneNumber(value)
          break
        }
        break
      default:
        validInput = !required || value.trim().length > 0
    }

    if (validInput) {
      setInvalid(false)
      onChange({ type: header, identifier, value, required })
    } else {
      setInvalid(true)
      onChange({ type: header, identifier, value: 'invalid', required })
    }
  }

  function handleChange(e) {
    const value = e.target.value
    onChange({ type: header, identifier, value, required })
  }

  let formInputClassName = 'FormInput'

  if (className) {
    formInputClassName += ` ${className}`
  }

  if (focus) {
    formInputClassName += ' focus'
  }

  if (invalid) {
    formInputClassName += ' invalid'
  }

  return (
    <div className={formInputClassName}>
      <div>
        <p className="input-label">{header} {required ? <span className='required'>*</span> : null}</p>
      </div>
      <div className={`input-container focus-style`}>
        {textarea ?
          <textarea type="text"
            onChange={e => handleChange(e)}
            onBlur={e => inputValidation(e)}
            placeholder={placeholder}
            maxLength={maxlength}
            onBlurCapture={e => setFocus(false)}
            onFocus={e => setFocus(true)} /> :
        honeypot ?
          <input type="text"
          onChange={e => handleChange(e)}
          onBlur={e => inputValidation(e)}
          placeholder={placeholder}
          maxLength={maxlength}
          autoComplete="off"
          name={identifier}
          tabIndex={-1}
          onKeyPress={e => {
            if (!onEnterKeyPress) return
            if (e.key === 'Enter') {
              onEnterKeyPress(e)
            }
          }}
          onFocus={e => setFocus(true)} /> :
          <input type="text"
            onChange={e => handleChange(e)}
            onBlur={e => inputValidation(e)}
            placeholder={placeholder}
            maxLength={maxlength}
            onKeyPress={e => {
              if (!onEnterKeyPress) return
              if (e.key === 'Enter') {
                onEnterKeyPress(e)
              }
            }}
            onBlurCapture={e => setFocus(false)}
            onFocus={e => setFocus(true)} />
        }
      </div>
      {invalid ? <p className='error'>{error}</p> : null}
      {/* <div className={"bottomline" + (focus ? ' focus' : '') + (invalid ? ' invalid' : '')} /> */}
    </div>
  )
}

export default FormInput