import './PositionSelector.scss'
import React, { useContext } from 'react'
import { TranslationContext } from '../../store/translation/TranslationProvider';
import Icon from '../Icon';
import { isTrueTypeCar } from '../../utils/design-utils';



const PositionSelector = (props) => {
  const {
    positions = [],
    selectablePositions = ['B', 'C', 'D'],
    onChange,
    disabledPositions = [],
    carType,
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

  function WallSelection(innerProps) {
    const { 
      id, 
      className = '', 
      labelPosition = 'bottom', 
      label 
    } = innerProps

    let classNameToUse = `WallSelection ${className}`

    if (disabledPositions.includes(id)) {
      classNameToUse += ' disabled'
    }

    if (label) {
      classNameToUse += ` label-position-${labelPosition}`
    }

    const isSelectable = selectablePositions.includes(id)

    const checked = positions.includes(id)

    return (
      <div className={classNameToUse}>
        { isSelectable && 
          <Selection radioType={radioType} checked={checked} onSelect={() => onSelect(id)} />
        }
        { label && <p>{label}</p> }
      </div>
    )
  }

  return (
    <div className="PositionSelector">
      {/*<div className={"backwall disabled"} />*/}
      <WallSelection id="D" label={getText('ui-general-left')} className="selectionsLeft" />
      <div className="center">
        <div className={`backwall-container ${throughType ? 'hidden' : ''}`}>
          <WallSelection
          id="C"
          className="rear"
          label={getText('ui-general-rear')}
          labelPosition="top"
          />
          <div className={"position backwall" + (positions.includes('C') ? ' selected' : '')} />
        </div>
        <div className={'left' + (disabledPositions.indexOf('D') !== -1 ? ' disabled' : '')}>
          <div className={"position sidewall" + ((positions).includes('D') ? ' selected' : '')} />
          <div className="throughwall bottom left" />
          { throughType && <div className="throughwall top left" /> }
        </div>
        <div className={'right' + (disabledPositions.indexOf('B') !== -1 ? ' disabled' : '')}>
          <div className={"position sidewall" + ((positions).includes('B') ? ' selected' : '')} />
          <div className="throughwall bottom right" />
          { throughType && <div className="throughwall top right" /> }
        </div>
      </div>
      <WallSelection id="B" label={getText('ui-general-right')} className="selectionsRight" />
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

export default PositionSelector