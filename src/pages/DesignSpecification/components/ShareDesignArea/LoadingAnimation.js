import React from 'react'
// import { ReactComponent as LoadingSvg } from './loading-animation.svg'
import './LoadingAnimation.scss'

function LoadingAnimation(props) {
  const { className = '' } = props

  return (
    <div className={`LoadingAnimation ${className}`}>
        {/* <LoadingSvg /> */}
    </div>
  )
}

export default LoadingAnimation