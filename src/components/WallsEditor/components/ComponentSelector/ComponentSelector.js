import React, { useContext } from 'react'
import { TranslationContext } from '../../../../store/translation/TranslationProvider'
import Sprite from '../../../Sprite'

import './ComponentSelector.scss'

/**
 * 
 * @param {Object} props 
 * @param {string=} props.className 
 */
function ComponentSelector(props) {
  const {
    className = '',
    items = [],
    selectedItem,
    onChange = () => {},
  } = props

  const { getText } = useContext(TranslationContext)

  return (
    <div data-testid="ComponentSelector" className={`ComponentSelector ${className}`}>
      {items.map(type => {
        const selected = selectedItem === type.id
        return (
          <div key={type.id} className={`ComponentSelector__item ${selected ? 'selected' : ''}`} onClick={() => onChange(type.id)}>
            <div className="ComponentSelector__sprite">
              <Sprite src={type.image} />
            </div>
            <div className="ComponentSelector__label">{getText(type.label)}</div>
          </div>
        )
      })}
    </div>
  )
}

export default ComponentSelector