import React, { useMemo, useContext } from 'react'
import { EXTRA_FEATURES } from '../../../../constants'
import { DesignContext } from '../../../../store/design'
import { TranslationContext } from '../../../../store/translation'
import InfoBox from '../../../InfoBox'
import SectionAccordion from '../../../SectionAccordion'
import SwitchButton from '../../../SwitchButton';

import './EditEmergengy.scss'

const { EMERGENCY_COMMUNICATIONS_247 } = EXTRA_FEATURES

/**
 * 
 * @param {Object} props 
 * @param {string=} props.className 
 */
function EditEmergengy(props) {
  const {
    className = '',
  } = props

  const designCtx = useContext(DesignContext)
  const { getDesignProperty, setExtraFeatures } = designCtx
  const { getText } = useContext(TranslationContext)

  const extraFeatures = getDesignProperty('extraFeatures') || []

  const toggle = useMemo(()=>{
    return extraFeatures.indexOf(EMERGENCY_COMMUNICATIONS_247) !== -1
  },[extraFeatures])

  function getDisplayedValue() {
    if (toggle) {
      return getText('ui-general-enabled')
    }

    return getText('ui-general-not-enabled')
  }

  const toggleHandler = () => {
    setExtraFeatures(EMERGENCY_COMMUNICATIONS_247)
  }

  return (
    <div data-testid="EditEmergengy" className={`EditEmergengy ${className}`}>
      <SectionAccordion
        heading={getText('ui-emergency-communication')}
        displayedValue={getDisplayedValue()}
      >
        <SwitchButton toggle={toggle} label={getText('ui-emergency-communication')} onChange={() => toggleHandler()} />
        <InfoBox text={getText('ui-emergency-communication-info')} />
      </SectionAccordion>
    </div>
  )
}

// function EditHorizontalCopSection() {
//   return null
// }
export default EditEmergengy