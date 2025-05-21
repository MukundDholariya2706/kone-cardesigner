import React, { useContext } from 'react'
import { TranslationContext } from '../../store/translation/TranslationProvider'
import SwitchButton from '../SwitchButton/SwitchButton'
import './TranslationModeToggler.scss'
import { ConfigContext } from '../../store/config/ConfigProvider'


/**
 *
 * @param {Object} props
 * @param {string=} props.className
 */
function TranslationModeToggler(props) {
  const { className = '' } = props

  const { displayTranslationKeys, setDisplayTranslationKeys } = useContext(TranslationContext)
  const { config } = useContext(ConfigContext)

  if (!config.isPreview) return null

  return (
    <SwitchButton
      data-testid="TranslationModeToggler"
      label="Translation keys"
      toggle={displayTranslationKeys}
      onChange={setDisplayTranslationKeys}
      className={`TranslationModeToggler ${className}`}
    ></SwitchButton>
  )
}

export default TranslationModeToggler
