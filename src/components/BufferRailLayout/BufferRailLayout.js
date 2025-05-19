import './BufferRailLayout.scss'
import React, {useContext} from 'react'
import { TranslationContext } from '../../store/translation';
import Icon from '../Icon';



const BufferRailLayout = ({ positions=[], disabledPositions=[], onChange }) => {
  const { getText } = useContext(TranslationContext);
  
    const onSelect = (position) => {
        if (onChange && positions && position) {
          onChange( positions.includes(position) ?
            positions.filter(item => item !== position) :
            [ ...positions, position ] )
        }
      }

    return (
        <div className="BufferRailLayout">
          <div className="bufferRails">
            <div>
              <div className={"bufferRail" + (positions.includes('HIGH') ? ' selected' : '') + (disabledPositions.includes('HIGH') ? ' disabled' : '')} />
              <div className={"bufferRail" + (positions.includes('MIDDLE') ? ' selected' : '') + (disabledPositions.includes('MIDDLE') ? ' disabled' : '')} />
              <div className={"bufferRail" + (positions.includes('LOW') ? ' selected' : '') + (disabledPositions.includes('LOW') ? ' disabled' : '')} />
            </div>
          </div>
          <div className="selections">
            <div className={"selection" + (disabledPositions.includes('HIGH') ? ' disabled' : '')}>
              <div data-testid="pos-HIGH" className={"selection-icon pos-HIGH" + (positions.includes('HIGH') ? ' checked' : '')} onClick={e => onSelect('HIGH')}>
                {positions.includes('HIGH') && <Icon id="icon-check-white" />}
              </div>
               <div className="selection-label">{getText('ui-buffer-rails-high')}</div>
            </div>
            <div className={"selection" + (disabledPositions.includes('MIDDLE') ? ' disabled' : '')}>
              <div data-testid="pos-MIDDLE" className={"selection-icon pos-MIDDLE" + (positions.includes('MIDDLE') ? ' checked' : '')} onClick={e => onSelect('MIDDLE')}>
                {positions.includes('MIDDLE') && <Icon id="icon-check-white" />}
              </div>
                <div className="selection-label">{getText('ui-buffer-rails-middle')}</div>
            </div>
            <div className={"selection" + (disabledPositions.includes('LOW') ? ' disabled' : '')}>
              <div data-testid="pos-LOW" className={"selection-icon pos-LOW" + (positions.includes('LOW') ? ' checked' : '')} onClick={e => onSelect('LOW')}>
                {positions.includes('LOW') && <Icon id="icon-check-white" />}
              </div>
                <div className="selection-label">{getText('ui-buffer-rails-low')}</div>
            </div>
          </div>
        </div>
    )
}

export default BufferRailLayout