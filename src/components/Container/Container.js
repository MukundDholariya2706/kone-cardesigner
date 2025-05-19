import './Container.scss'

import React from 'react'

const Container = ({ children, className, padding, vPadding, hPadding, grow, sticky, style = {} }) => {
  return (
    <div 
      className={ 
        'Container' + 
        ( className ? ' ' + className : '') +
        ( padding ? ` padding-${padding}` : '') +
        ( vPadding ? ` v-padding-${vPadding}` : '') +
        ( hPadding ? ` h-padding-${hPadding}` : '') +
        ( grow ? ` grow-${grow}` : '') +
        ( sticky ? ` sticky` : '')
      }
      style={style}
    >
      {children}
    </div>
  )
}
export default Container