import React, { useContext } from 'react'
import { VIEW3D_MODE_CAR, VIEW3D_MODE_LANDING } from '../../constants'
import { LayoutContext } from '../../store/layout/LayoutProvider'
import { TranslationContext } from '../../store/translation/TranslationProvider'
import LanguageSelect from '../LanguageSelect'
import LoginComponent from '../LoginComponent'
import NavBar from '../NavBar'
import TinyLoadingAnimation from '../TinyLoadingAnimation'
import ToggleButtons from '../ToggleButtons'

import './SimpleEditorNavBar.scss'

function SimpleEditorNavBar(props) {
  const { className = '' } = props
  const { getText } = useContext(TranslationContext)
  const { view3dMode, setView3dMode } = useContext(LayoutContext)

  return (
    <NavBar
      className={`SimpleEditorNavBar ${className}`}
      centerChildren={<div>
        <TinyLoadingAnimation />
        <ToggleButtons
        content={[{ value: VIEW3D_MODE_CAR, label: getText('ui-general-inside') }, { value: VIEW3D_MODE_LANDING, label: getText('ui-general-landing') }]}
        selectedButton={view3dMode}
        onChange={e => setView3dMode(e)}
      />
      </div>}
    >
      <LanguageSelect />
      <LoginComponent cardFromTop="44px" />
     
    </NavBar>
  )
}

export default SimpleEditorNavBar