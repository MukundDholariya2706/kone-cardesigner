import React, { useContext, } from 'react';
import './CheckBoxGroup.scss';
import { TranslationContext } from '../../store/translation/TranslationProvider';
import Icon from '../Icon';

/**
 * Renders out the CheckBoxGroup
 * @function CheckBoxGroup Checkbox group renderer
 * @param {Object} props
 * @param {string} props.className
 * @param {Array} props.selectedItems Checked items in the group
 * @param {Array} props.selectionList List of checkboxes
 * @param {Function} props.onChange Function called when item is clicked
 * @param {boolean=} props.disabled
 */
const CheckBoxGroup = (props) => {
  const { selectionList, selectedItems, onChange, className, theme = 'default', disabled=false } = props;
  const { getText } = useContext(TranslationContext);

  const selectionItems = (!selectionList)? '' :selectionList.map((item, key) => {
      return (
          <div 
            className={`checkboxItem theme-${theme}` + (disabled ? ' disabled' : '') + (selectedItems && selectedItems.indexOf(item.id) !== -1 ? ' selected': '')} 
            key={key} 
            onClick={onChange.bind(this, item.id)}>
            <div className={'checkBox'+ (disabled ? ' disabled' :'')}>
              {(selectedItems && selectedItems.indexOf(item.id) !== -1)
                ? <Icon id="icon-check-white" />
                : null
              }
            </div>
            <div className={'checkLabel'+ (disabled ? ' disabled' :'')}>
                {getText(item.stringid)}
            </div>
          </div>
      );
  });

  return (
    <div className={`CheckBoxGroup ${className ? className : ''}`}>
        {selectionItems}
    </div>
  );
}

export default CheckBoxGroup;
