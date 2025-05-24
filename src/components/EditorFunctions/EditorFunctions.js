import './EditorFunctions.scss';

import React, {useContext} from 'react';
import { LayoutContext } from '../../store/layout';
import { TranslationContext } from '../../store/translation/TranslationProvider';


/**
 *  Renders out the functions buttons in 3D view
 *  @function EditorFunctions Function buttons
 *  @param {Object} props Properties passed to this renderer
 */
const EditorFunctions = ({ save, reset, edited, showReset = true }) => {
  
  const { getText } = useContext(TranslationContext);
  const { view3dMode } = useContext(LayoutContext);

  return (
    <div className="EditorFunctions">
      { showReset && view3dMode === 'car' &&
        <button className="reset" disabled={!edited && true} onClick={e => reset(true)} >
          {getText('ui-general-reset')}
        </button>
      }

      {/*
      <button className="save" disabled={!edited && true} onClick={e => save(true)} >
        {getText('ui-general-save')}
      </button>
      */}
    </div>
  )
}
export default EditorFunctions;
