import React, {useContext} from 'react';
import './RadioButtonGroup.scss';
import { TranslationContext } from '../../store/translation';

/**
 * Renders out the RadioButtonGroup
 * @function RadioButtonGroup Editpanel renderer
 * @param {Object} selectedItem Selected item
 * @param {Array} selectionList List of selections
 * @param {function} onChange Function called when item is clicked
 */
const RadioButtonGroup = ({ selectionList, selectedItem, selectedId, styles, labelField="headerid", descriptionField="stringid", onChange, direction='column', itemsPerRow=1, isSelected, className = '', theme = 'default' }) => {
  
  const { getText } = useContext(TranslationContext);

  if (selectedItem && selectedItem.hasOwnProperty('id')) {
    selectedId = selectedItem.id
  }
  const selectionItems = (!selectionList) ? '' : selectionList
    .filter(item => !item.disabled)
    .map((item, key) => { 
      return (
        <div className={'radioItem' + ( (selectedId === item.id || (typeof isSelected === 'function' && isSelected(item) )) ? ' selected': '') + ( (selectedItem === null || item.disabled) ? ' disabled': '')} key={key} onClick={e => onChange && onChange(item.id)} >
          <div className={'radioButton' + (styles ? ' '+styles: '')}>
            <div className="innerRim" />
          </div>
          { 
            item[labelField] ?
            <div className={'radioLabel' + (styles ? ' '+styles: '')}>
              {getText(item[labelField])}
              { item[descriptionField] &&
                <p>{getText(item[descriptionField])}</p>
              }
            </div> :
            <div className={'radioLabel' + (styles ? ' '+styles: '')}>
              {getText(item[descriptionField])}
            </div> 
          }
          { item.shape && <div className={'shape'+item.shape}/> }
        </div>
      );
  });

  return (
    <div className={`RadioButtonGroup theme-${theme} direction-${direction} items-per-row-${itemsPerRow} ${className}`}>
        {selectionItems}
    </div>
  );
}

export default RadioButtonGroup;
