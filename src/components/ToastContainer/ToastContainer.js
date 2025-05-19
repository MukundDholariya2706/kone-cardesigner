import React, { useEffect, useContext } from 'react'
import { ToastContext } from '../../store/toast';
import Toast from '../Toast';

import './ToastContainer.scss'

/**
 * 
 * @param {Object} props 
 * @param {string=} props.className 
 * @param {boolean=} props.pageWide 
 */
function ToastContainer(props) {
  const {
    className = '',
    pageWide,
  } = props

  const { toasts, removeToast, clearToasts } = useContext(ToastContext)

  useEffect(() => {
    return () => {
      clearToasts()
    }
  }, [])

  if (!toasts || toasts.length === 0) return null

  return (
    <div className={`ToastContainer ${pageWide ? 'ToastContainer--page-wide' : ''} ${className}`}>
      { toasts.map((toast, i) => {
        const top = i * 3.5 + 'rem'
        return (
          <Toast 
            {...toast} 
            key={toast.id}
            top={top}
            onClose={removeToast} />
        )
      }) }
    </div>
  )
}

export default ToastContainer