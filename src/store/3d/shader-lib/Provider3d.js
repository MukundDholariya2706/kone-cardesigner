import React, { useEffect, useState } from 'react';
import SceneManager from './SceneManager';

let sceneManager = null
let _setUserHasInteract = true;

export const Context3d = React.createContext();

export const Provider3d =  ({ children }) => {

  if (!sceneManager) {
    sceneManager=new SceneManager()
  }

  const [ loadingState, setLoadingState ] = useState({
    loading: false,
    progress: 0,
    queueLength: 0,
    queueLengthAtStart: 0
  })

  const [ userHasInteract, setUserHasInteract ] = useState(_setUserHasInteract)

  const [ quality, _setQuality ] = useState(sceneManager.quality)

  useEffect(() => {
    const onLoading = (loading, queueLength) => {
      setLoadingState({
        loading,
        progress: 0,
        queueLength,
        queueLengthAtStart: queueLength
      })
    }
    
    const onProgress = (progress, queueLength, queueLengthAtStart) => {
      setLoadingState({
        loading: true,
        progress,
        queueLength,
        queueLengthAtStart
      })
    }

    const onUserInteract = () => {
      _setUserHasInteract = true
      setUserHasInteract(true)
    }

    sceneManager.assetManager.addListener('loading', onLoading)
    sceneManager.assetManager.addListener('progress', onProgress)    
    sceneManager.cameraController.addEventListener('controlstart', onUserInteract)

    return () => {
      sceneManager.assetManager.removeListener('loading', onLoading)
      sceneManager.assetManager.removeListener('progress', onProgress)
      sceneManager.cameraController.removeEventListener('controlstart', onUserInteract)
    }
  }, [])

  const setQuality = value => {
    if (value === quality  && value === sceneManager.quality) {
      return
    }
    sceneManager.setQuality(value)
    _setQuality(value)
  }

  return (
    <Context3d.Provider value={{
      sceneManager,
      assetManager: sceneManager.assetManager,
      imageRenderer: sceneManager.imageRenderer,
      cameraController: sceneManager.cameraController,
      loadingState,
      userHasInteract, setUserHasInteract,
      resetCamera: () => sceneManager.resetCamera(),
      setCameraTargetByShape: (shape) => sceneManager.setCameraTargetByShape(shape),
      zoomIn: () => sceneManager.zoomIn(),
      zoomOut: () => sceneManager.zoomOut(),
      rotate: () => sceneManager.rotate(),
      snapshot: () => sceneManager.snapshot(),
      quality, setQuality
    }}>
      {children}
    </Context3d.Provider>
  )
}
export default Provider3d;

export const Consumer3d = Context3d.Consumer;