import React, { useState } from 'react'

export const ToastContext = React.createContext();

export function ToastProvider({ children, autoDismiss: globalDismiss = 7000 }) {
  const [ toasts, setToasts ] = useState([])

  

  function clearToasts() {
    setToasts([])
  }

  function getToastId(args) {
    const { message = '', type = 'default' } = args

    return `${type}_${message}`
  }

  /**
   * 
   * @param {Object} args 
   * @param {string} args.message 
   * @param {number=} args.autoDismiss 
   * @param {Function=} args.onClick 
   * @param {'default' | 'warning' | 'error' | 'info'=} args.type
   */
  function addToast(args) {
    const { message, type = 'default', autoDismiss = globalDismiss, onClick } = args
    const id = getToastId(args)

    const found = toasts.find(x => x.id === id)
    if (found) return id

    setToasts(prev => [...prev, { id, message, type, autoDismiss, onClick }])
    return id
  }

  function removeToast(id) {
    setToasts(prev => prev.filter(x => x.id !== id))
  }

  return (
    <ToastContext.Provider value={{
      addToast, toasts, clearToasts, removeToast
    }}>
      { children}
    </ToastContext.Provider>
  )
}


export default ToastProvider;

export const ToastConsumer = ToastContext.Consumer;