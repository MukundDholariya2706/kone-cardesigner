import React from 'react'
import Icon from '../Icon'
import './SmileySelector.scss'

/**
 *
 * @param {Object} props
 * @param {string=} props.className
 */
function SmileySelector(props) {
  const { selection, setSelection } = props

  return (
    <div className={`SmileySelector ${selection ? 'selection-made' : 'no-selection-made'}`} data-testid="SmileySelector">
      <SmileyOption id={1} selectedId={selection} onSelect={setSelection} />
      <SmileyOption id={2} selectedId={selection} onSelect={setSelection} />
      <SmileyOption id={3} selectedId={selection} onSelect={setSelection} />
      <SmileyOption id={4} selectedId={selection} onSelect={setSelection} />
      <SmileyOption id={5} selectedId={selection} onSelect={setSelection} />
    </div>
  )
}

const ICON_MAP = {
  1: 'icon-smiley-frustrated',
  2: 'icon-smiley-sad',
  3: 'icon-smiley-neutral',
  4: 'icon-smiley-happy',
  5: 'icon-smiley-like',
}

function SmileyOption(props) {
  const { id, selectedId, onSelect } = props

  const isSelected = selectedId === id

  return (
    <div
      className={`SmileyOption ${isSelected || !selectedId ? 'selected' : 'not-selected'}`}
      onClick={() => onSelect(id)}
    >
      <Icon id={ICON_MAP[id]} />{' '}
    </div>
  )
}

export default SmileySelector
