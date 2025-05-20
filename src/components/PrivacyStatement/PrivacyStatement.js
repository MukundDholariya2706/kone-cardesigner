import React, { useContext } from 'react'
import { SiteContext } from '../../store/site/SiteProvider'
import { TranslationContext } from '../../store/translation/TranslationProvider'

import './PrivacyStatement.scss'

/**
 *
 * @param {Object} props
 * @param {string=} props.className
 */
function PrivacyStatement(props) {
  const { className = '' } = props
  const { getText } = useContext(TranslationContext)
  const { getPrivacyStatement } = useContext(SiteContext)

  return (
    <p className="PrivacyStatement" data-testid="PrivacyStatement">
      {getText('ui-contact-privacy-statement-1')}
      <a
        tabIndex={-1}
        className="readMore"
        href={getPrivacyStatement()}
        target="_blank"
        rel="noopener noreferrer"
      >
        &nbsp;
        {getText('ui-contact-privacy-statement-2')}
      </a>
      {getText('ui-contact-privacy-statement-3')}
    </p>
  )
}

export default PrivacyStatement
