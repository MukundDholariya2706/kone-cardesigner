import React from 'react'
import WallLocks from '../WallLocks'
import Icon from '../Icon'
import './WallItemSelector.scss'

/**
 * 
 * @param {Object} props 
 * @param {string=} props.selectedId
 * @param {string=} props.className
 * @param {Function} props.onSelect
 * @param {boolean=} props.disableSelection
 * @param {string=} props.locksType
 * @param {Object[]} props.items
 * @param {string} props.items[].id
 * @param {string} props.items[].label
 * @param {string} props.items[].iconId
 * @param {boolean=} props.items[].disabled
 * @param {JSX.Element=} props.extra
 */
function WallItemSelector(props) {
  const { 
    onSelect,
    notClickable=false,
    items,
    selectedId,
    disableSelection,
    locksType,
    showLockSymbols=true,
    extra,
    className,
  } = props

  return (
    <div className={`WallItemSelector 
      items-${items.length}
      ${className ? className : ''}`}
    >
      <div className="WallItemSelector__items">
        {
          items && items.map(item => {
            return (
              <WallItem 
                key={item.id}
                iconId={item.iconId}
                onClick={(!disableSelection && !notClickable) && (() => {
                  onSelect(item.id)
                })}
                label={item.label}
                disabled={item.disabled}
                selected={!disableSelection && !item.disabled && (item.id === selectedId || (Array.isArray(selectedId) && selectedId.indexOf(item.id) !== -1 ))}
              />
            )
          })
        }
      </div>

      <div className="lock-container">
        { locksType && showLockSymbols && 
          <WallLocks className={locksType + ' '+(Array.isArray(selectedId) ?'active' :'')} />
        }
      </div>

      { extra &&
        // Render the extra element with an appended className 'extra' 
        React.cloneElement(extra,
        { className: extra.props.className ? `${extra.props.className} extra` : 'extra' }) }
    </div>
  )
}

/**
 * @param {Object} props
 * @param {boolean} props.selected
 * @param {boolean} props.disabled
 * @param {string} props.label
 * @param {string} props.iconId
 * @param {Function} props.onClick
 */
export function WallItem(props) {
  const {
    disabled,
    selected,
    label,
    iconId,
    onClick
  } = props

  return (
    <div
      className={'WallItem' + ( selected ? ' selected' : '') + (onClick ? ' selectable' : '') + ( disabled ? ' disabled' : '') }
      onClick={e => onClick && onClick(e) }  
    >
    <div className="WallItem__label">
      {label}
    </div>
    <div 
      className="WallItem__icon" 
    >
      <Icon id={iconId}/>
    </div>
      <div className="WallItem__selectionState">
    </div>
  </div>
  )
}

export default WallItemSelector