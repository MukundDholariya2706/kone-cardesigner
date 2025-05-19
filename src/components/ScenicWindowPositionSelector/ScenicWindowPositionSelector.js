import React, { useState, useMemo, useContext } from 'react'
import { TranslationContext } from '../../../../store/translation';
import Icon from '../../../Icon';

import './ScenicWindowPositionSelector.scss'

const POSITIONS = {
  B1: 'B1',
  B2: 'B2',
  D1: 'D1',
  D2: 'D2',
  C: 'C'
}

/**
 * 
 * @param {Object} props 
 * @param {string=} props.className 
 */
function ScenicWindowPositionSelector(props) {
  const {
    positions = [],
    isTTC=false,
    onChange,
    disabledPositions = [],
    className = '',
    disabled,
  } = props

  const { getText } = useContext(TranslationContext);
  const onSelect = (position) => {
    if (onChange && positions && position) {
      onChange(positions.includes(position) ?
        positions.filter(item => item !== position) :
        [...positions, position])
    }
  }

  const selectedPositions = positions.reduce((prev, curr) => {
    prev[curr] = true
    return prev
  }, {})

  function WallSelection(innerProps) {
    const { 
      id, 
      className = '', 
      labelPosition = 'bottom', 
      label 
    } = innerProps

    let classNameToUse = `WallSelection ${className}`

    if (disabled || disabledPositions.includes(id)) {
      classNameToUse += ' disabled'
    }

    if (label) {
      classNameToUse += ` label-position-${labelPosition}`
    }

    const checked = positions.includes(id)

    return (
      <div className={classNameToUse}>
        <Selection checked={checked} onSelect={() => onSelect(id)} />
      </div>
    )
  }

  return (
    <div data-testid="ScenicWindowPositionSelector" className={`ScenicWindowPositionSelector ${className}`}>
      <div className="center">
        <p className="wall-label wall-label--left">{getText('ui-general-left')}</p>
        <p className="wall-label wall-label--right">{getText('ui-general-right')}</p>
        { isTTC
          ? (
            <div className={`backwall-container`}>
              <div className="throughwall top left" />
              <div className="throughwall top right" />
            </div>            
          )
          : (
          <div className={`backwall-container`}>
            <div className={"position backwall" + (positions.includes(POSITIONS.C) ? ' selected' : '')}>
              <WallSelection id={POSITIONS.C} />
            </div>
          </div>
          )
        }
        <div className={'left' + (disabledPositions.indexOf('D') !== -1 ? ' disabled' : '')}>
          <div className={"position sidewall-part" + (positions.includes(POSITIONS.D2) ? ' selected' : '')}>
            <WallSelection id={POSITIONS.D2} />
          </div>
          
          <div className={"position sidewall-part" + (positions.includes(POSITIONS.D1) ? ' selected' : '')}>
            <WallSelection id={POSITIONS.D1} />
          </div>
          <div className="throughwall bottom left" />
        </div>
        <div className={'right' + (disabledPositions.indexOf('B') !== -1 ? ' disabled' : '')}>
          <div className={"position sidewall-part" + (positions.includes(POSITIONS.B1) ? ' selected' : '')}>
            <WallSelection id={POSITIONS.B1} />
          </div>
          <div className={"position sidewall-part" + (positions.includes(POSITIONS.B2) ? ' selected' : '')}>
            <WallSelection id={POSITIONS.B2} />
          </div>
          <div className="throughwall bottom right" />
        </div>
      </div>
    </div>
  )
}

function Selection(props) {
  const { checked, onSelect, className = ''} = props

  

  let classNameToUse = `selection ${className}`

  if (checked) {
    classNameToUse += ' checked'
  }

  return (
    <div className={classNameToUse} onClick={onSelect}>
      { checked && <Icon id="icon-check-white" /> }
    </div>
  )
}

export default ScenicWindowPositionSelector