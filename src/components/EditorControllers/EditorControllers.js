import './EditorControllers.scss';

import React, { useContext } from 'react';
import { Context3d } from '../../store/3d';
import LandingFinishSelectorHorizontal from '../LandingFinishSelectorHorizontal'
import { TranslationContext } from '../../store/translation';
import { LayoutContext } from '../../store/layout'
import { VIEW3D_MODE_CAR, VIEW3D_MODE_LANDING, EDIT_VIEW_LANDING_FINISHES } from '../../constants';

/**
 *  Renders out the control buttons in 3D view
 *  @function EditorControllers Function buttons
 *  @param {Object} props Properties passed to this renderer
 */
const EditorControllers = (props) => {
  const { getText } = useContext(TranslationContext);
  const { zoomIn, zoomOut, rotate } = useContext(Context3d);
  const { view3dMode, editView } = useContext(LayoutContext)

  return (
    <div onClick={e => e.stopPropagation()} className="EditorControllers">

     
        <div />
        
        { view3dMode === VIEW3D_MODE_LANDING && editView !== EDIT_VIEW_LANDING_FINISHES &&
          <LandingFinishSelectorHorizontal />
        }

        <div className="ZoomAndRotate">
          <div className="Zooms no-selection-highlight">
            <div className="ZoomTop" onClick={ e => zoomIn() }>
              +
            </div>
            <div className="ZoomBottom" onClick={ e => zoomOut() }>
              -
            </div>

          </div>
          {view3dMode === VIEW3D_MODE_CAR && (
            <div className="Rotate" onClick={ e => rotate() }>
              <svg transform="rotate(90) scale(0.5 1)" xmlns="http://www.w3.org/2000/svg" height="29px" width="29px" enableBackground="new 0 0 1000 1000" viewBox="0 0 1000 1000" x="0px" y="0px" xmlnsxml="http://www.w3.org/XML/1998/namespace" xmlSpace="preserve" version="1.1">
                <g><path fill="#0071B9" stroke="#0071B9" d="M 980.9 479.9 c -12.1 -12.1 -31.8 -12.1 -43.9 0 l -69.2 69.2 c 2.3 -16.1 3.8 -32.4 3.8 -49.1 c 0 -197 -159.7 -356.7 -356.7 -356.7 c -114.4 0 -215.9 54 -281.2 137.7 l 46.4 37.1 c 54.4 -70.1 139.2 -115.4 234.8 -115.4 c 164.2 0 297.3 133.1 297.3 297.3 c 0 17.7 -1.9 34.9 -4.9 51.7 L 717 479.9 c -12.1 -12.1 -31.8 -12.1 -43.9 0 c -12.1 12.1 -12.1 31.8 0 43.9 l 146 116.3 c 6.3 6.3 14.6 9.2 22.8 8.9 c 8.2 0.2 16.5 -2.6 22.8 -8.9 l 116.3 -116.3 C 993 511.7 993 492 980.9 479.9 Z M 514.9 797.3 c -164.2 0 -297.3 -133.1 -297.3 -297.3 c 0 -14.3 1.3 -28.3 3.2 -42 l 62.2 62.2 c 12.1 12.1 31.8 12.1 43.9 0 s 12.1 -31.8 0 -43.9 L 210.7 360 c -6.3 -6.3 -14.6 -9.2 -22.8 -8.9 c -8.2 -0.2 -16.5 2.6 -22.8 8.9 l -146 116.3 C 7 488.4 7 508.1 19.1 520.2 c 12.1 12.1 31.8 12.1 43.9 0 l 101.2 -80.6 c -3.5 19.6 -6 39.7 -6 60.4 c 0 197 159.7 356.7 356.7 356.7 c 107.7 0 204 -47.9 269.4 -123.4 l -46.5 -37.2 C 683.3 758 603.7 797.3 514.9 797.3 Z" /></g>
              </svg>      
              <div className="Label">{getText("ui-general-rotate")}</div>
            </div>
          )}
        </div>
      {/* </div> */}

    </div>
  )
}
export default EditorControllers;
