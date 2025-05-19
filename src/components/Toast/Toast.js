import React from 'react'
import { useEffect, useState, useRef } from 'react'
import Icon from '../Icon'

import './Toast.scss'

/**
 * 
 * @param {Object} props 
 * @param {string=} props.id 
 * @param {string=} props.className 
 * @param {string} props.message 
 * @param {number=} props.autoDismiss 
 * @param {Function=} props.onClick
 * @param {string|number=} props.top 
 * @param {string|number=} props.width 
 * @param {Function=} props.onClose 
 * @param {'default' | 'warning' | 'error' | 'info' } props.type 
 */
function Toast(props) {
  const { id, className = '', message, type = 'default', onClick, onClose, autoDismiss, width, top = 0 } = props
  const [ visible, setVisible ] = useState(false)

  const dismissTimer = useRef({
    timeoutId: null,
    start: null,
    remaining: autoDismiss,
    running: false,
  })

  let iconId = 'icon-checkmark-circle' // default

  if (type === 'warning') {
    iconId = 'icon-alert'
  }

  if (type === 'error') {
    iconId = 'icon-alert'
  }

  if (type === 'info') {
    iconId = 'icon-info'
  }

  function onAutoDismiss() {
    setVisible(false)
    setTimeout(() => {
      handleClose()
    }, 500)
  }

  useEffect(() => {
    setTimeout(() => {
      // Setting this after first render to get the transition effect
      setVisible(true)
    }, 0)

    if (autoDismiss && typeof autoDismiss === 'number') {
      const timeoutId = setTimeout(onAutoDismiss, autoDismiss)

      dismissTimer.current.timeoutId = timeoutId
      dismissTimer.current.start = Date.now()
      dismissTimer.current.running = true
    }

    return () => {
      if (dismissTimer.current.running) {
        clearInterval(dismissTimer.current.timeoutId)
      }
    }
  }, [])

  function handleClose(e) {
    // if closed by clicking and not because of auto dismiss
    if (e) {
      e.stopPropagation()
    }
    setVisible(false)

    if (onClose) {
      onClose(id)
    }
  }

  function handleMouseEnter(e) {
    pauseTimer()
  }

  function handleMouseLeave(e) {
    startTimer()
  }

  function startTimer() {
    if (dismissTimer.current.running) {
      const { remaining } = dismissTimer.current

      const timeoutId = setTimeout(onAutoDismiss, remaining)

      dismissTimer.current.timeoutId = timeoutId
      dismissTimer.current.start = Date.now()
    }
  }

  function pauseTimer() {
    if (dismissTimer.current.running) {
      const { start, timeoutId, remaining } = dismissTimer.current
      clearTimeout(timeoutId)

      const now = Date.now()
      const newRemaining = remaining - now + start 

      dismissTimer.current.remaining = newRemaining
    } 
  }

  return (
    <div style={{ top }} onClick={(e) => {
      if (onClick) {
        onClick(e)
      }
    }} data-testid="Toast" className={`Toast Toast--${type} ${visible ? 'Toast--visible' : ''} ${onClick ? 'Toast--clickable' : 'null'} ${className}`} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <div className="Toast__icon-container">
        <Icon id={iconId} />
      </div>
      <p className="Toast__message">{ message }</p>
      { onClose && <div onClick={handleClose} data-testid="close-button" className="Toast__close-button">
        <Icon id="icon-close" />
      </div> }
    </div>
  )
}

export default Toast