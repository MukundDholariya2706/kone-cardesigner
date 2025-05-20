import './TinyLoadingAnimation.scss';
import React, { useContext, useEffect, useState } from 'react';
import { Context3d } from '../../store/3d/shader-lib/Provider3d';
import animation from '../../assets/images/react.svg'

const TinyLoadingAnimation = (props) => {

  const { sceneManager } = useContext(Context3d)   
  const [ showLoadingAnim, setShowLoadingAnim] = useState(false)

  useEffect(() => {
    const onLoading = (loading, queueLength) => { 
      if (loading) {
        setShowLoadingAnim(true)
      } else {
        setShowLoadingAnim(false)
      }
    }
    sceneManager.assetManager.addListener('loading', onLoading)
    return () => {
      sceneManager.assetManager.removeListener('loading', onLoading)
    }
  }, [])
  
  if (!showLoadingAnim) {
    return null
  }
  
  return (      
    <div className="TinyLoadingAnimation">
      <img src={animation} alt="loading..." />
    </div>
  )
}
export default TinyLoadingAnimation;