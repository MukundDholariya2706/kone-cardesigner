import './ThreeViewer.scss'
import React, { useRef, useEffect, useContext } from 'react';
import { Context3d } from '../../store/3d'
import { useWindowSize } from '../../utils/customHooks';
import { LayoutContext } from '../../store/layout';

const ThreeViewer = ({ children, disabled }) => {

  const { sceneManager } = useContext(Context3d)
  const { editPanelOpen } = useContext(LayoutContext)
  const containerRef = useRef();
  const contentRef = useRef();

  const size = useWindowSize();

  useEffect(() => {
    let to;
    if (size && sceneManager && contentRef.current) {      
      // setTimeout: Tablet rotation: wait for next dom update
      to = setTimeout(() => {
        sceneManager.setSize(contentRef.current.clientWidth, contentRef.current.clientHeight)
      }, 1)
    }
    return () => {
      if (to) {
        clearTimeout(to)
      }
    }
  }, [size]);


  useEffect(() => {
    if (contentRef.current) {
      sceneManager.setSize(contentRef.current.clientWidth, contentRef.current.clientHeight)
    }
  }, [editPanelOpen])

  useEffect(() => {
    const content = contentRef.current
    content.appendChild(sceneManager.canvas)
    return () => {
      content.removeChild(sceneManager.canvas)
    }
  }, [sceneManager])

  return (
    <div className={"ThreeViewer" + (editPanelOpen ? ' edit-panel-open' : '')} ref={containerRef}>
      <div 
        ref={contentRef} 
        className="canvas-container">
        </div>
      {children}
    </div>
  );
};

export default ThreeViewer;