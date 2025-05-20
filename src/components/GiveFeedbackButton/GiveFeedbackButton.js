import React, { useContext, useState } from 'react'
import { TranslationContext } from '../../store/translation/TranslationProvider'
import { CompactFeedbackForm } from '../FeedbackForms/FeedbackForms'
import Icon from '../Icon'
import './GiveFeedbackButton.scss'

/**
 *
 * @param {Object} props
 * @param {string=} props.className
 */
function GiveFeedbackButton(props) {
  const { className = '', stickRight } = props
  const [isOpen, setIsOpen] = useState(false)
  const { getText } = useContext(TranslationContext)

  return (
    <>
      <div
        data-testid="GiveFeedbackButton"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`GiveFeedbackButton ${stickRight ? 'stick-right' : ''} ${className} ${isOpen ? 'opened' : ''}`}
      >
        <div className="button-icon">
          <Icon id="icon-like" />
        </div>
        <div className="button-text">{getText('ui-feedback-button-text')}</div>
      </div>
      {isOpen && (
        <div className={`CompactFeedbackFormContainer ${stickRight ? 'stick-right' : ''}`}>
          <CompactFeedbackForm onClose={() => setIsOpen(false)} />
        </div>
      )}
    </>
  )
}

export default GiveFeedbackButton
