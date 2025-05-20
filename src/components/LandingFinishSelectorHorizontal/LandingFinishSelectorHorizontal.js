import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import {
  EDIT_VIEW_LANDING_FINISHES,
  LANDING_FINISH_GROUP,
  MAT_LANDING_FLOOR,
  MAT_LANDING_WALL
} from '../../constants'
import { DesignContext } from '../../store/design/DesignProvider'
import { LayoutContext } from '../../store/layout/LayoutProvider'
import { ProductContext } from '../../store/product/ProductProvider'
import { TranslationContext } from '../../store/translation/TranslationProvider'
import Alert from '../Alert/Alert'
import Icon from '../Icon'
import TermsOfService from '../TermsOfService'
import './LandingFinishSelectorHorizontal.scss'

// Should be in descending order from largest to smallest
const breakpoints = Object.entries({
  lg: 1200,
  md: 1000,
  sm: 600,
  xsm: 450,
})


/*
  NOTE:
  This component is just a copy of the components/LandingFinishSelector.js but with some quick adjustments
  made so that it can be positioned horizontally instead of vertically.
*/

const LandingFinishSelectorHorizontal = (props) => {
  const { getText } = useContext(TranslationContext)
  const {
    loading,
    product,
    getLandingFinishGroups,
    customFinishes,
    removeCustomFinishesForGroup,
    getGroupForFinish,
    getGroupFinishes,
  } = useContext(ProductContext)

  const { getFinish, setLandingGroup, design } = useContext(DesignContext)
  const { setEditView, setEditPanelOpen } = useContext(LayoutContext)

  const [currentBreakpoint, setCurrentBreakpoint] = useState()

  // Height of the finish selection square
  const SQUARE_HEIGHT = useMemo(() => {
    return getBreakpointValue({
      xsm: 30,
      sm: 32,
      md: 36,
      lg: 40,
    })
  }, [currentBreakpoint])

  // How many finishes to show at most at once
  const MAX_SQUARES = useMemo(() => {
    return getBreakpointValue({
      xsm: 2,
      sm: 3,
      md: 3,
      lg: 4,
    })
  }, [currentBreakpoint])

  // Margin
  const SQUARE_GAP = 10

  const [groups, setGroups] = useState()
  const finishesRef = useRef()

  const groupsToRender = useMemo(() => {
    if (!groups) return []
    const groupsWithStyles = groups.map((item, index) => {
      let finishStyle = {}
      let wallStyle = {}
      let floorStyle = {}
      const groupFinishes = getGroupFinishes({ groupId: item.id, groupType: item.type })

      const floor = groupFinishes.find((x) => x.types.includes(MAT_LANDING_FLOOR))
      const wall = groupFinishes.find((x) => x.types.includes(MAT_LANDING_WALL))

      if (floor.color) {
        floorStyle.background = floor.color.replace('0x', '#')
      } else if (floor.image && (floor.image.url || floor.image.localStorage)) {
        const imageToUse = floor.image.url || localStorage.getItem(floor.image.localStorage)

        floorStyle.background = `url(${imageToUse}) center/cover`
      } else {
        floorStyle.opacity = '0'
      }

      if (wall.color) {
        wallStyle.background = wall.color.replace('0x', '#')
      } else if (wall.image && (wall.image.url || wall.image.localStorage)) {
        const imageToUse = wall.image.url || localStorage.getItem(wall.image.localStorage)

        wallStyle.background = `url(${imageToUse}) center/cover`
      } else {
        wallStyle.opacity = '0'
      }

      if (item.image) {
        finishStyle.backgroundImage = `url(${item.image})`
      }

      finishStyle.height = SQUARE_HEIGHT
      finishStyle.width = SQUARE_HEIGHT
      finishStyle.minWidth = SQUARE_HEIGHT

      finishStyle.marginRight = SQUARE_GAP

      return { ...item, floorStyle, wallStyle, finishStyle }
    })

    if (groupsWithStyles.length <= MAX_SQUARES) {
      return groupsWithStyles
    }

    return [...groupsWithStyles, ...groupsWithStyles.slice(0, MAX_SQUARES - 1)]
  }, [groups, currentBreakpoint])

  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false)
  const removeRef = useRef()

  const group = useMemo(() => {
    const finish = getFinish({ type: MAT_LANDING_FLOOR })
    return getGroupForFinish({ id: finish }) || {}
  }, [design, groups])

  const [firstVisible, setFirstVisible] = useState()

  const displayArrows = useMemo(() => {
    if (!groups) return false
    if (groups.length > MAX_SQUARES) {
      return true
    }
  }, [groups, MAX_SQUARES])

  function getBreakpointValue(values) {
    return values[currentBreakpoint || 0]
  }

  function updateBreakpoint() {
    const currentHeight = window.innerWidth

    const found = breakpoints.find((item) => {
      const [_, value] = item
      return currentHeight >= value
    })

    const breakpoint = found ? found[0] : breakpoints[breakpoints.length - 1][0] // last breakpoint, should be smallest
    setCurrentBreakpoint(breakpoint)
  }

  useEffect(() => {
    updateBreakpoint()
    window.addEventListener('resize', updateBreakpoint)

    return () => {
      window.removeEventListener('resize', updateBreakpoint)
    }
  }, [])

  // Initialize the firstVisible value when selected group has been initalized
  useEffect(() => {
    if (Number.isInteger(firstVisible) || !group || !groups) return
    const selectedIndex = group && groups.findIndex((x) => x.id === group.id)
    setFirstVisible(selectedIndex)
  }, [group])

  // Setting the  value for the first visible state after
  // the finishes have been loaded, or if they are reloaded (e.g. by creating
  // new finishes)
  useEffect(() => {
    if (!groups) return
    const selectedIndex = group && groups.findIndex((x) => x.id === group.id)
    if (selectedIndex >= MAX_SQUARES) {
      // When finishes change, set the currently selected item as the last visible item on the list
      setFirstVisible(selectedIndex - MAX_SQUARES + 1)
    } else {
      setFirstVisible(selectedIndex)
    }
  }, [groups])

  // Scroll the container to show the first visible element
  useEffect(() => {
    if (!finishesRef.current) return
    finishesRef.current.scrollLeft = firstVisible * (SQUARE_HEIGHT + SQUARE_GAP)
  }, [firstVisible])

  const update = () => {
    if (product) {
      const result = getLandingFinishGroups()
      setGroups(result)
    }
  }

  useEffect(() => update(), [product, customFinishes])

  if (loading || !groups || !groups.length || firstVisible === undefined) {
    return null
  }

  const onGroupClick = (groupId) => {
    setLandingGroup({ groupId })
  }

  const onPlusClick = () => {
    setEditPanelOpen(true)
    setEditView(EDIT_VIEW_LANDING_FINISHES)
  }

  const topBottomMargin = 0
  const length = (groupsToRender || []).length
  const squares = Math.min(length, MAX_SQUARES)
  const finishesStyle = {
    width: squares * SQUARE_HEIGHT + (squares - 1) * SQUARE_GAP + 'px',
    maxWidth: squares * SQUARE_HEIGHT + (squares - 1) * SQUARE_GAP + 'px',
    marginLeft: SQUARE_GAP + 'px',
    paddingRight: SQUARE_GAP + topBottomMargin + 'px',
  }

  return (
    <div className="LandingFinishSelector">
      <label>{getText('ui-general-landing-color')}</label>
      {displayArrows && (
        <div
          className={`arrow up-arrow`}
          onClick={() => {
            setFirstVisible((prev) => {
              if (prev === 0) {
                return groups.length - 1
              }

              return prev - 1
            })
          }}
        >
          <Icon style={{ fill: '#0071b9' }} id="icon-chevron-down" />
        </div>
      )}
      <div ref={finishesRef} style={finishesStyle} className="finishes">
        {groupsToRender.map((item, index) => {
          const { id, wallStyle, floorStyle, finishStyle, custom, shared } = item
          return (
            <div
              key={index}
              onClick={(e) => onGroupClick(id)}
              className={`finish ${item.id === group.id ? ' selected' : ''}`}
              style={finishStyle}
            >
              {custom && (
                // lastVisible > index && firstVisible <= index &&
                <>
                  <div style={wallStyle} className="wall-clip-path clip-path"></div>
                  <div style={floorStyle} className="floor-clip-path clip-path"></div>
                  {!shared && (
                    <div
                      className="btn-remove-custom-finish"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setShowRemoveConfirm(true)
                        removeRef.current = item.id
                      }}
                    >
                      <Icon id="icon-remove-item" />
                    </div>
                  )}
                </>
              )}
            </div>
          )
        })}
      </div>
      {displayArrows && (
        <div
          className={`arrow down-arrow`}
          onClick={() => {
            setFirstVisible((prev) => {
              if (prev === groups.length - 1) {
                return 0
              }

              return prev + 1
            })
          }}
        >
          <Icon style={{ fill: '#0071b9' }} id="icon-chevron-down" />
        </div>
      )}
      <TermsOfService getText={getText}>
        <div className={`add-custom`} onClick={(e) => onPlusClick()}>
          <Icon id="icon-plus" />
        </div>
      </TermsOfService>
      {showRemoveConfirm && (
        <Alert
          title="ui-remove-custom-finish-confirm-title"
          description="ui-remove-custom-finish-confirm-desc"
          cancelLabel="ui-general-no"
          onConfirm={(e) => {
            if (group.id === removeRef.current) {
              setLandingGroup({ groupId: groups[0].id })
              setFirstVisible(0)
            }

            removeCustomFinishesForGroup({
              groupType: LANDING_FINISH_GROUP,
              groupId: removeRef.current,
            })
            setShowRemoveConfirm(false)
          }}
          onCancel={(e) => setShowRemoveConfirm(false)}
          onClose={(e) => setShowRemoveConfirm(false)}
        />
      )}
    </div>
  )
}

export default LandingFinishSelectorHorizontal
