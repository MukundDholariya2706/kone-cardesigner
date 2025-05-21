import React, { useState, useContext, useEffect, useRef, useMemo } from 'react'
import Button from '../../../../components/Button'
import Icon from '../../../../components/Icon'
import { APIContext } from '../../../../store/api'
import { DesignContext } from '../../../../store/design'
import { TranslationContext } from '../../../../store/translation/TranslationProvider'

import './DesignNameEditor.scss'

function DesignNameEditor(props) {
  const { executeRecaptcha, savingDesign, design, isEditable, online } = props
  const { getText } = useContext(TranslationContext)
  const { designName, setDesignName, hiddenId } = useContext(DesignContext)
  const api = useContext(APIContext)

  const [ editingName, setEditingName ] = useState(false)
  const [ saveDisabled, setSaveDisabled ] = useState(false)
  const [ prevDesignName, setPrevDesignName ] = useState(designName)
  const [ loading, setLoading ] = useState(false)

  const saveButtonDisabled = useMemo(() => {
    if (!designName || designName.trim().length === 0) return true

    if (online) {
      return savingDesign || loading
    }

    return false
  }, [online])

  const inputRef = useRef()

  useEffect(() => {
    if (editingName && inputRef.current) {
      inputRef.current.select()
    }
  }, [editingName])

  function onDesignNameChange(e) {
    const val = e.target.value
    setDesignName(val)

    const isValid = val.trim().length > 0

    setSaveDisabled(!isValid)
  }

  async function onDesignNameSave(e) {
    e.preventDefault()
    if (saveDisabled) return
    
    try {
      if (online) {
        setLoading(true)
           
        const { recaptchaToken, recaptchaNumber } = await executeRecaptcha()    

        const dataToSend = { 
          name: designName, 
          recaptchaToken, recaptchaNumber 
        }

        await api.post(`/predesign/${hiddenId}/rename`, dataToSend, { withKeyToken: true, includeAuth: true })
      }

      setPrevDesignName(designName)
      setEditingName(false)
    } catch (err) {
      // TODO error notification
    } finally {
      setLoading(false)
    }
  }

  function onDesignNameCancel(e) {
    setDesignName(prevDesignName)
    setSaveDisabled(false)
    setEditingName(false)
  }

  return (
    <div data-testid="DesignNameEditor" className={`DesignNameEditor ${editingName ? 'DesignNameEditor--editing' : ''}`}>
      {!editingName ?
      <>
        <label className="design-name">{ getText(designName) }</label>
        {
          isEditable &&
          <div className="icon icon-edit" onClick={e => setEditingName(true)} >
            <Icon id="icon-edit-field" /> 
          </div>
        }
        </>
          : 
        <>
          <form className="design-name-input-container" onSubmit={onDesignNameSave}>
            <input
              value={getText(designName)} 
              className="design-name-input"
              disabled={!editingName} 
              ref={inputRef}
              spellCheck="false"
              onChange={e => onDesignNameChange(e)}
              maxLength={design && design.ktoc ? 200 : 65}
              ></input>
          </form>
          <div className="buttons-container">
            <Button theme={['sm', 'outline', 'center', 'uppercase']} onClick={onDesignNameCancel}>
              { getText('ui-general-cancel') }
            </Button>
            <Button theme={['sm', 'primary', 'center', 'uppercase']} disabled={saveButtonDisabled} onClick={onDesignNameSave}>
              { getText('ui-general-save') }
            </Button>
          </div>
          </>
          }
      </div>
  )
}

export default DesignNameEditor