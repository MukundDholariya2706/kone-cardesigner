import './LandingEditor.scss';
import React, { useContext } from 'react';
import { DesignConsumer } from '../../store/design'
import { TranslationContext } from '../../store/translation';
import EditorLayout from '../EditorLayout';


/**
 * Renders out the header part of the view (currently not in use)
 * @function LandingEditor Header renderer
 * @param {Object} props Propertied passed to this renderer
 */
const LandingEditor = () => {
  
  const { getText } = useContext(TranslationContext);

  return (      
    <div className="LandingEditor">        
      <EditorLayout heading={getText('ui-general-landing')} >
        <DesignConsumer>
          {design => (
            <React.Fragment>
              {/* design.state.walls */}
            </React.Fragment>
          )}
        </DesignConsumer>
      </EditorLayout>
    </div>
  )
}

export default LandingEditor;