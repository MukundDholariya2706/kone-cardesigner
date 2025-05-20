import './PositionSelectorJamb.scss'
import React, { useContext } from 'react'
import { TranslationContext } from '../../store/translation/TranslationProvider';
import Icon from '../Icon';
import { isTrueTypeCar } from '../../utils/design-utils'



const PositionSelectorJamb = (props) => {
  const {
    positions = [],
    onChange,
    disabledPositions = [],
    carType,
    disabled,
    radioType = false
  } = props

  const { getText } = useContext(TranslationContext);
  const throughType = isTrueTypeCar( carType )
  const onSelect = (position) => {
    if (onChange && positions && position && !radioType) {
      onChange(positions.includes(position) ?
        positions.filter(item => item !== position) :
        [...positions, position])
    }
    if (onChange && positions && position && radioType) {
      onChange([position])
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
    <div className={`PositionSelectorJamb ${throughType ? 'through-type' : ''}`}>
      <div className="center">
        <p className="wall-label wall-label--left">{getText('ui-general-left')}</p>
        <p className="wall-label wall-label--right">{getText('ui-general-right')}</p>
        <div className={`backwall-container ${throughType ? 'hidden' : ''}`}>
          <div className={"position backwall" + (positions.includes('C') ? ' selected' : '')} />
        </div>
        <div className={'left' + (disabledPositions.indexOf('D') !== -1 ? ' disabled' : '')}>
          <div className={"position sidewall" + ((positions).includes('D') ? ' selected' : '')} />
          <div className="throughwall bottom left" />
          { throughType && <div className="throughwall top left" /> }
          <div className={`position bottom door-position ${selectedPositions['A2'] ? 'selected' : ''}`} />
          <WallSelection id="A2" className="bottom door-position-selector" />
          { throughType && 
            <>
            <div className={`position top door-position ${selectedPositions['C1'] ? 'selected' : ''}`} />
            <WallSelection id="C1" className="top door-position-selector" />
            </>
          }
        </div>
        <div className={'right' + (disabledPositions.indexOf('B') !== -1 ? ' disabled' : '')}>
          <div className={"position sidewall" + ((positions).includes('B') ? ' selected' : '')} />
          <div className="throughwall bottom right" />
          { throughType && <div className="throughwall top right" /> }
            <div className={`position bottom door-position ${selectedPositions['A1'] ? 'selected' : ''}`} />
            <WallSelection id="A1" className="bottom door-position-selector" />
            { throughType && 
              <>
                <div className={`position top door-position ${selectedPositions['C2'] ? 'selected' : ''}`} />
                <WallSelection id="C2" className="top door-position-selector" />
              </>
            }
        </div>
      </div>
        
    </div>
  )
}

function Selection(props) {
  const { checked, radioType, onSelect, className = ''} = props

  

  let classNameToUse = `selection ${className}`

  if (radioType) {
    classNameToUse += ' radio'
  }

  if (checked) {
    classNameToUse += ' checked'
  }

  return (
    <div className={classNameToUse} onClick={onSelect}>
      { checked && !radioType && <Icon id="icon-check-white" /> }
      { checked && radioType && <div className="innerRim" /> }
    </div>
  )
}

export default PositionSelectorJamb