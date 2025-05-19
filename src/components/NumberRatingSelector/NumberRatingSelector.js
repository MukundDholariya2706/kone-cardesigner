import React from 'react'

import './NumberRatingSelector.scss'

/**
 *
 * @param {Object} props
 * @param {string=} props.className
 */
function NumberRatingSelector(props) {
  const { className = '', selectedOption, setSelectedOption } = props

  return (
    <div data-testid="NumberRatingSelector" className={`NumberRatingSelector ${className}`}>
      {Array.from({ length: 11 }, (v, i) => i).map((id) => {
        return (
          <NumberRatingOption
            key={id}
            id={id}
            isSelected={selectedOption === id}
            onSelect={(val) => setSelectedOption(val)}
          />
        )
      })}
    </div>
  )
}

function NumberRatingOption(props) {
  const { id, onSelect, isSelected } = props
  return (
    <div
      onClick={() => onSelect(id)}
      className={`NumberRatingOption ${isSelected ? 'selected' : ''}`}
    >
      {id}
    </div>
  )
}

export default NumberRatingSelector
