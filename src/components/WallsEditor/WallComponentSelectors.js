import React, { useMemo, useCallback, useContext } from 'react'
import jsonLogic from 'json-logic-js';

import HeadingComponent from '../HeadingComponent';
import MaterialList from '../MaterialList';
import {
  DEFAULT_LIST_IMAGE_URL, TYP_CAR_WALL_C, TYP_CAR_WALL_D, TYP_CAR_WALL_B, CAR_TYPE_GLASS_BACKWALL,
  TYP_CAR_GLASS_WALL_C, MAT_CAR_WALL, SIDE_WALL_PANELS_ID, ALL_WALL_PANELS_ID, ANTIFINGERPRINT, STEEL,
  FIRST_TWO_PANELS, LAST_TWO_PANELS, CAR_TYPE_GLASSMATERIAL_BACKWALL, TYP_CAR_GLASS_WALL_FRAME, GLASS_WALL_MATERIAL,
  TWO_PANELS_COMBINED, THREE_PANELS, ENA_LAMINATES, MAT_CAR_WALL_FINISH_C, MAT_CAR_WALL_FINISH_B, MAT_CAR_WALL_FINISH_D, OFFERING_INDIA, OFFERING_ENA
} from '../../constants';
import WallItemSelector from '../WallItemSelector';
import InfoBox from '../InfoBox';
import { DesignContext } from '../../store/design';
import { TranslationContext } from '../../store/translation';
import { ProductContext } from '../../store/product';
import { ToastContext } from '../../store/toast';
import { getPanelTypes } from '../../utils/design-utils';
import CustomFinishes from '../CustomFinishes';
import Description from '../Description';
import ListComponent from '../ListComponent';
import TileComponent from '../TileComponent';
import GridComponent from '../GridComponent';
import CheckBoxGroup from '../CheckBoxGroup';
import FormSelect from '../FormSelect/FormSelect';
import { isTrueTypeCar } from '../../utils/design-utils'
import SectionAccordion from '../SectionAccordion';
import FinishItem from './components/FinishItem/FinishItem';
import { sortFinishes } from '../../utils/generalUtils'

export const DecoSelector = React.forwardRef((props, ref) => {
  const { decoPackages, getText, selectedId, onChange } = props

  const nullSelectionMaterial = {
    selectedNull: {
      image: DEFAULT_LIST_IMAGE_URL,
      label: getText('ui-general-please-select')
    },
  }

  return (
    <div className="DecoSelector">
      <HeadingComponent
        heading={getText('ui-walls-select-deco-mirror')}
        info={getText('ui-walls-select-deco-mirror-i')}
        padding="sm"
        border="top"
      />
      <MaterialList
        ref={ref}
        className="no-border gray-bg"
        initState={{ opened: (selectedId === undefined) }}
        translation={{ getText }}
        options={{ squareIcon: true }}
        materials={decoPackages}
        selectedId={selectedId}
        nullSelection={nullSelectionMaterial}
        onChange={id => onChange(id)}
      />
      { !selectedId &&
        <div className="deco-info">
          <div className="deco-info-glass">
            <div className="deco-info-glass-color" />
            {getText('ui-general-glass')}
          </div>
          <div className="deco-info-mirror">
            <div className="deco-info-mirror-color" />
            {getText('ui-general-mirror')}
          </div>
        </div>
      }
    </div>
  )
})

/**
 * 
 * @param {Object} props 
 * @param {Function} props.getText
 * @param {Function} props.onWallChange
 * @param {Function} props.onWallGroupChange
 * @param {string} props.selectedWallId
 * @param {boolean} props.showWallGroupSelector
 * @param {Object[]} props.validGroups
 * @param {Object[]} props.groups
 * @param {string} props.carType
 */
export function WallSelector(props) {
  const {
    getText,
    onWallChange,
    onWallGroupChange,
    selectedWallId,
    showWallGroupSelector,
    validGroups,
    groups,
    carType,
    scenicPositions
  } = props

  const groupsId = useCallback(createGroupIdFromGroups(groups), [groups])
  const filterGroupOptions = () => {
    let retVal = {}
    validGroups.forEach(item => {
      const compare = item.join('')
      if (compare === '000' && !retVal['d0c0b0']) { retVal['d0c0b0'] = { [TYP_CAR_WALL_D]: 0, [TYP_CAR_WALL_C]: 0, [TYP_CAR_WALL_B]: 0 } }
      if (compare === '010' && !retVal['d0c1b0']) { retVal['d0c1b0'] = { [TYP_CAR_WALL_D]: 0, [TYP_CAR_WALL_C]: 1, [TYP_CAR_WALL_B]: 0 } }
      if (compare === '001' && !retVal['d0c0b1']) { retVal['d0c0b1'] = { [TYP_CAR_WALL_D]: 0, [TYP_CAR_WALL_C]: 0, [TYP_CAR_WALL_B]: 1 } }
      if (compare === '011' && !retVal['d0c1b1']) { retVal['d0c1b1'] = { [TYP_CAR_WALL_D]: 0, [TYP_CAR_WALL_C]: 1, [TYP_CAR_WALL_B]: 1 } }
    });

    return retVal
  }

  

  const groupOptions = filterGroupOptions()

  const groupSelectOptions = useMemo(() => {
     const names = {
      'd0c0b0': 'ui-walls-linked-all',
      'd0c1b0': 'ui-walls-linked-d-b',
      'd0c0b1': 'ui-walls-linked-d-c',
      'd0c1b1': 'ui-walls-linked-c-b',
    }

    return Object.keys(groupOptions).map(key => {
      return {
        value: key,
        text: getText(names[key])
      }
    })
  }, [groupOptions])

  const items = [
    {
      id: TYP_CAR_WALL_D,
      label: getText('ui-walls-d-wall'),
      iconId: 'icon-wall-d',
    },
    {
      id: ((carType === CAR_TYPE_GLASS_BACKWALL || carType === CAR_TYPE_GLASSMATERIAL_BACKWALL) && (!scenicPositions || scenicPositions.includes('C')) )
        ? (carType === CAR_TYPE_GLASS_BACKWALL 
            ? TYP_CAR_GLASS_WALL_C
            : TYP_CAR_GLASS_WALL_FRAME)
        : TYP_CAR_WALL_C,
      label: getText('ui-walls-c-wall'),
      iconId: 'icon-wall-c',
      disabled: isTrueTypeCar(carType)
    },
    {
      id: TYP_CAR_WALL_B,
      label: getText('ui-walls-b-wall'),
      iconId: 'icon-wall-b',
    },
  ]

  function createGroupIdFromGroups(groups) {
    if (!groups) return undefined
    if( Object.keys(groups).length < 1) return undefined
    return `d${groups[TYP_CAR_WALL_D] !== undefined ? groups[TYP_CAR_WALL_D] : 0}c${groups[TYP_CAR_WALL_C] !== undefined ? groups[TYP_CAR_WALL_C] : 1}b${groups[TYP_CAR_WALL_B] !== undefined ? groups[TYP_CAR_WALL_B] : 0}`
  }

  const lockedWithSelectedWall = useMemo(() => {
    if (!groups) return null

    // special check for full scenic car
    if(selectedWallId === TYP_CAR_GLASS_WALL_C && scenicPositions?.length > 0) {
      let groupedWalls = []
      if( scenicPositions.includes('D1') || scenicPositions.includes('D2') ) groupedWalls.push(TYP_CAR_WALL_D)
      if( scenicPositions.includes('B1') || scenicPositions.includes('B2') ) groupedWalls.push(TYP_CAR_WALL_B)
      if( scenicPositions.includes('C')) groupedWalls.push(selectedWallId)
      return groupedWalls
    }

    const selectedGroup = groups[selectedWallId]
    const sameGroupWalls = Object.keys(groups).filter(key => groups[key] === selectedGroup)

    if (sameGroupWalls.length > 1) {
      return sameGroupWalls
    }
    return selectedWallId
  }, [groups, selectedWallId])


  return (
    <div className="WallSelector">
      <HeadingComponent heading={getText('ui-walls-select-wall')} info={getText('ui-walls-select-wall-i')} padding="sm" border="top" />
      <WallItemSelector
        items={items}
        onSelect={onWallChange}
        selectedId={!groups ? selectedWallId : lockedWithSelectedWall}
        locksType={groupsId}
        showLockSymbols={ groups ?true :false }
        extra={(showWallGroupSelector && Object.keys(groupOptions).length > 1) &&
          <div>
            <FormSelect
              onChange={val => onWallGroupChange(groupOptions[val])}
              value={groupsId}
              options={groupSelectOptions}
            />

            <InfoBox text={getText('ui-walls-2-wall-limit-info')} />
          </div>
        }
      />
    </div>
  )
}

/**
 * 
 * @param {Object} props 
 * @param {string} props.selectedPanel 
 * @param {string} props.selectedWall 
 * @param {string} props.selectedPanelingStyle 
 * @param {string} props.selectedWallFinishType 
 * @param {string} props.selectedMaterial 
 * @param {Function} props.onMaterialChange
 * @param {Function} props.onPanelSelection
 * @param {Function} props.setSelectedPanel
 * @param {Function} props.toggleAllPanels
 * @param {boolean} props.showMaterialSelector
 * @param {boolean} props.showCustomMaterial
 * @param {boolean} props.panelingException
 */
export function FinishSelector(props) {
  const {
    selectedPanel,
    selectedPanelingStyle,
    selectedWallFinishType,
    onMaterialChange,
    selectedMaterial,
    showMaterialSelector,
    onPanelSelection,
    selectedWall,
    setSelectedPanel,
    toggleAllPanels,
    showCustomMaterial,
    panelingException,
    // setSelectedScenicType,
    headerTitle = 'ui-walls-select-finish',
    headerInfo = 'ui-walls-select-finish-i'
  } = props

  const { getText } = useContext(TranslationContext)
  const { addToast } = useContext(ToastContext)

  const productCtx = useContext(ProductContext);
  const { product, getFilteredFinishes, getFilteredMaterials, addCategoriesToFinishes, isCustomFinish } = productCtx
  const designCtx = useContext(DesignContext);
  const { getFinish, cornerPieces, setWallFinish, design, getWallPanel, getFinishMaterial, setFinishMaterial, hasIdenticalPanels, verifyAndChangeAllWalls, getDesignProperty, getComponent, setComponent } = designCtx

  const premiumIcon = product?.businessSpecification?.market === 'ENA' ? 'icon-premium-ena' : 'icon-premium'

  const showPanelSelector = useMemo(() => {
    if (selectedWall === TYP_CAR_GLASS_WALL_FRAME || selectedWall === TYP_CAR_GLASS_WALL_C) {
      return false
    }
    if(product?.offeringLocation === OFFERING_INDIA) {
      return false
    }

    return selectedPanelingStyle === THREE_PANELS
      || (selectedPanelingStyle === TWO_PANELS_COMBINED && selectedWall !== TYP_CAR_WALL_C)
  }, [selectedPanelingStyle, selectedWall, product])


  const finishId = useMemo(() => {
    if (selectedPanelingStyle === '3panels' || selectedPanelingStyle === '2panelsCombined') {
      // Using the left panel finish when both side panels
      // or when all panels are selected.
      const [leftPanel, centerPanel, rightPanel ] = getPanelTypes(selectedWallFinishType)

      let panelTypeToUse

      switch (selectedPanel) {
        case SIDE_WALL_PANELS_ID:
        case ALL_WALL_PANELS_ID:  
        case FIRST_TWO_PANELS: 
          panelTypeToUse = leftPanel
          break
        case LAST_TWO_PANELS:
          panelTypeToUse = rightPanel
          break
        default:
          panelTypeToUse = selectedPanel
      }

      // Get the panel that is selected
      const panel = getWallPanel({
        finishType: selectedWallFinishType,
        panelType: panelTypeToUse
      })

      return panel ? panel.finish : getFinish({ type: selectedWallFinishType })
    } else {
      return getFinish({ type: selectedWallFinishType })
    }
  }, [selectedPanelingStyle, selectedWallFinishType, selectedPanel, design])


  // see if finish is custom finish
  const custom = useCallback(isCustomFinish(finishId), [finishId])

  const materials = useMemo(() => {
    const filtered = getFilteredMaterials({ type: selectedWallFinishType, design })

    // Check that the material has any finishes available
    return filtered.filter(material => {
      const finishesForMaterial = getFilteredFinishes({
        type: selectedWallFinishType,
        material: material.id,
        design
      })

      return finishesForMaterial?.length > 0
    })

  }, [selectedWallFinishType, design])

  // Material of the finish that is currently set in the design
  const selectedFinishMaterialId = useMemo(() => {
    // const materialInUse = getMaterial({ type: selectedWallFinishType, finish: finishId })
    const materialInUse = getFinishMaterial({ type: selectedWallFinishType })
    return materialInUse
  }, [finishId, design, selectedWallFinishType])

  // Selected material in the list
  const materialId = useMemo(() => {
    if (selectedMaterial) return selectedMaterial
    if (custom) return 'CUSTOM'

    // const materialInUse = getMaterial({ type: selectedWallFinishType, finish: finishId })
    const materialInUse = getFinishMaterial({ type: selectedWallFinishType })

    if (materialInUse) return materialInUse

    // when blank car start with something else than glass back wall (ENA thing)
    return materials && materials.length && (materials.find(item => item.id !== GLASS_WALL_MATERIAL) || {}).id
  }, [selectedMaterial, custom, materials, selectedWallFinishType, finishId])

  const finishes = useMemo(() => {


    const filteredFinishes = getFilteredFinishes({
      type: selectedWallFinishType,
      material: materialId,
      design
    })

    // special case for certain India designs, can not be handled by rules
    if( selectedWall === TYP_CAR_WALL_C && 
        (design?.originalSapId === 'IMNSE25' || design?.originalSapId === 'IMNSS22' || design?.originalSapId === 'IMNSS23'
        || design?.originalSapId === 'IMNSS24' || design?.originalSapId === 'IMNDP22'
        || design?.originalSapId === 'IMNDP21' || design?.originalSapId === 'IMNDP23'
        ) 
      ) {
      return []
    }

    return addCategoriesToFinishes({
      finishes: filteredFinishes
    })
  }, [selectedWallFinishType, materialId])

  const hideMaterialDesc = useMemo(() => {
    if (finishes && materialId) {
      const antifingerIndex = finishes.findIndex(item => item.id === ANTIFINGERPRINT)
      return (antifingerIndex === -1 && materialId === STEEL)
    } else {
      return false
    }
  }, [finishes])


  const materialsTabs = useMemo(() => {
    const result = materials
      .filter(item => {
        const finishes = getFilteredFinishes({
          type: selectedWallFinishType,
          material: item.id,
          design
        })

        return finishes && finishes.length > 0
      })
      .map(item => {
        return { value: item.id, text: getText(item.name) }
      })

    // TODO Show Glass material tab

    if (showCustomMaterial) {
      result.push({ value: 'CUSTOM', text: getText('ui-walls-custom') })
    }
    return result
  }, [materials, getText])


  const showTabs = materialsTabs && materialsTabs.length > 1

  function handleFinishClick(finishId, options = {}, mat) {
    const { custom } = options

    let shouldSetAllPanels = false

    if (selectedPanelingStyle === TWO_PANELS_COMBINED) {
      if (design.product === 'home') {
        // For homelift it is possible to separately set the panels
        // as long as non-laminate finishes are used.
        // Laminate finishes have to always be for the whole wall.
        shouldSetAllPanels = mat === 'LAMINATES'
      } else {
        // SOC 1100 width backwall always one finish for the whole wall
        // (regardless of panel amount)
        shouldSetAllPanels = true
      }
    }
    if (shouldSetAllPanels) {
      setSelectedPanel(ALL_WALL_PANELS_ID)

      setWallFinish({
        finishType: selectedWallFinishType,
        panelType: ALL_WALL_PANELS_ID,
        finishMaterial: selectedMaterial,
        finish: finishId,
        custom
      })

      // make sure that in ENA all walls are the same laminate material
      if (ENA_LAMINATES.indexOf(selectedMaterial) !== -1) {
        handleLaminatesENA()
      }

      return
    }

    const currentFinish = getFinish({type:selectedWallFinishType})

    // This sets either the panel finish or the wall finish
    // depending on the panel selection
    setWallFinish({
      finishType: selectedWallFinishType,
      finishMaterial: selectedMaterial,
      panelType: selectedPanel,
      finish: finishId,
      custom
    })
    
    // Monospace 500 can not mix certain steel finishes in the car walls
    if(product?.rules?.variousFilteringRules) {
      const checkOtherWalls = jsonLogic.apply(product.rules.variousFilteringRules, {
        filteringRULE: 'mixingLimited',
        PRODUCT: product.product,
        FINISH: finishId,          
        OLDFINISH: currentFinish,          
        TARGET: 'inside',
      })
      if(checkOtherWalls) {
        const showToaster = verifyAndChangeAllWalls({ finishType:selectedWallFinishType, finish:finishId, custom, finishMaterial:selectedMaterial})
        if(showToaster) {
          if(product?.businessSpecification?.market === OFFERING_ENA) {
            addToast({ message: getText('ui-dialog-ena-k-finish-on-all-walls-notice'), type:'info', autoDismiss: 4000})
          } else {
            addToast({ message: getText('ui-dialog-can-not-combine-steel-finishes-inside-notice'), type:'info', autoDismiss: 4000})
          }
        }
      }
    }

    if (ENA_LAMINATES.indexOf(selectedMaterial) !== -1) {
      handleLaminatesENA()
    }

  }

  const handleLaminatesENA = () => {
    const cWallMaterial = getFinishMaterial({ type: MAT_CAR_WALL_FINISH_C })
    const bWallMaterial = getFinishMaterial({ type: MAT_CAR_WALL_FINISH_B })
    const dWallMaterial = getFinishMaterial({ type: MAT_CAR_WALL_FINISH_D })

    if (selectedWallFinishType === MAT_CAR_WALL_FINISH_C
      && (bWallMaterial !== selectedMaterial || dWallMaterial !== selectedMaterial)
      && (ENA_LAMINATES.indexOf(bWallMaterial) !== -1 && ENA_LAMINATES.indexOf(dWallMaterial) !== -1)
    ) {
      setFinishMaterial({ type: MAT_CAR_WALL_FINISH_B, finishMaterial: selectedMaterial })
      setFinishMaterial({ type: MAT_CAR_WALL_FINISH_D, finishMaterial: selectedMaterial })
      return
    }

    if (selectedWallFinishType === MAT_CAR_WALL_FINISH_B
      && cWallMaterial !== selectedMaterial
      && ENA_LAMINATES.indexOf(cWallMaterial) !== -1
    ) {
      setFinishMaterial({ type: MAT_CAR_WALL_FINISH_C, finishMaterial: selectedMaterial })
      setFinishMaterial({ type: MAT_CAR_WALL_FINISH_D, finishMaterial: selectedMaterial })
    }

    if (selectedWallFinishType === MAT_CAR_WALL_FINISH_D
      && cWallMaterial !== selectedMaterial
      && ENA_LAMINATES.indexOf(cWallMaterial) !== -1
    ) {
      setFinishMaterial({ type: MAT_CAR_WALL_FINISH_C, finishMaterial: selectedMaterial })
      setFinishMaterial({ type: MAT_CAR_WALL_FINISH_B, finishMaterial: selectedMaterial })
    }
  }

  function getDisplayedValue() {
    const panels = designCtx.getAllWallPanels({ finishType: selectedWallFinishType })
    const finishes = []

    if (!panels?.length) {
      if (finishId) {
        finishes.push({ id: finishId })
      }
    } else {
      finishes.push(...panels.map(x => {
        return {
          id: x.finish,
          panel: x.type && x.type.slice(-1) // '1', 'X', '2'
        }
      }))
    }

    return (
      <FinishItem finishes={finishes} selectedPanelingStyle={selectedPanelingStyle} />
      )
  }
  //console.log('finishes befor sort : ',finishes)
  useMemo(() => {
    if(finishes)
      {
        finishes.forEach(element => {
          sortFinishes(element.finishes);
        });
      }
  },[finishes]);

  return (
    <div className="FinishSelector">
      <HeadingComponent
        className="FinishSelector-heading"
        heading={getText(headerTitle)} 
        info={getText(headerInfo)}
        border={product.product !=='monospace-300' ?'top' :'none'}
      />
      <SectionAccordion
        className="finish-section-accordion"
        displayedValue={getDisplayedValue()}
        disabled={(materialId !== 'CUSTOM' && finishes.length < 1) ? true : false}>
        {showPanelSelector && <PanelingFinishSelector
          onPanelSelection={onPanelSelection}
          selectedPanel={selectedPanel}
          selectedWall={selectedWall}
          hasIdenticalPanels={hasIdenticalPanels}
          selectedWallFinishType={selectedWallFinishType}
          setSelectedPanel={setSelectedPanel}
          toggleAllPanels={toggleAllPanels}
          panelingException={panelingException}
          selectedFinishMaterialId={selectedFinishMaterialId}
        />}
        {showMaterialSelector && showTabs && (
          <FormSelect
            className="material-dropdown"
            value={materialId}
            onChange={val => onMaterialChange(val)}
            options={materialsTabs}
          />
        )
        }

        {!!materialId && materialId !== 'CUSTOM' && !hideMaterialDesc &&
          <Description text={getText('ui-walls-material-' + materialId.toLowerCase())} padding="sm" />
        }

        {materialId !== 'CUSTOM' &&
          <ListComponent gap="md" padding="md" >
            {
              finishes.map((categoryItem, key) => {
                const tiles = (categoryItem || {}).finishes.map((finishItem, key) => {
                  return (
                    <TileComponent
                      key={key}
                      title={getText(finishItem.sapId || finishItem.id)}
                      subtitle={getText(finishItem.name)}
                      showSapId={product?.businessSpecification?.market !== 'ENA'}
                      image={finishItem.image}
                      icon={finishItem.premium && premiumIcon}
                      iconTitle={getText('ui-general-extended-lead-time')}
                      selected={finishItem.id === finishId 
                        && (showPanelSelector || materialId === selectedFinishMaterialId || selectedWall === TYP_CAR_GLASS_WALL_FRAME || selectedWall === TYP_CAR_GLASS_WALL_C 
                          || (selectedWall === TYP_CAR_WALL_C && product?.offeringLocation === OFFERING_INDIA) )}
                      onClick={id => handleFinishClick(finishItem.id, {}, materialId)}
                    />
                  )
                })
                return (
                  <React.Fragment key={key}>
                    <HeadingComponent heading={getText(categoryItem.name)} padding="sm" />
                    <GridComponent cols="3" gap="sm">
                      {tiles}
                    </GridComponent>
                  </React.Fragment>
                )
              })
            }
          </ListComponent>
        }
        {materialId === 'CUSTOM' &&
          <CustomFinishes
            className="custom-wall-finishes"
            type={selectedWallFinishType} finishType={MAT_CAR_WALL}
            finish={finishId}
            setFinish={(finishId) => handleFinishClick(finishId, { custom: true })}
          />
        }

      </SectionAccordion>
    </div>
  )
}

/**
 * 
 * @param {Object} props 
 * @param {string} props.selectedWallFinishType 
 * @param {string} props.selectedPanel 
 * @param {string} props.selectedWall 
 * @param {string} props.selectedFinishMaterialId
 * @param {boolean} props.panelingException 
 * @param {Function} props.setSelectedPanel 
 * @param {Function} props.onPanelSelection 
 * @param {Function} props.toggleAllPanels 
 * @param {Function} props.hasIdenticalPanels 
 */
function PanelingFinishSelector(props) {
  const {
    selectedWallFinishType,
    selectedPanel,
    selectedWall,
    setSelectedPanel,
    onPanelSelection,
    toggleAllPanels,
    hasIdenticalPanels,
    panelingException,
    selectedFinishMaterialId,
  } = props

  const { getText } = useContext(TranslationContext)

  let [leftId, centerId, rightId] = getPanelTypes(selectedWallFinishType)

  const checkboxDisabled = useMemo(() => {
    if (panelingException) {
      return selectedFinishMaterialId === 'LAMINATES'
    }
    return false
  }, [selectedFinishMaterialId, panelingException, selectedWall])

  const items = []

  if (selectedWall === TYP_CAR_WALL_C) {
    items.push({
      id: SIDE_WALL_PANELS_ID,
      label: getText('ui-walls-side-panels'),
      iconId: 'icon-left-and-right-panel',
    },
      {
        id: centerId,
        label: getText('ui-walls-center-panel'),
        iconId: 'icon-center-panel',
      })
  } else {
    if (panelingException) {
      if (selectedWall === TYP_CAR_WALL_B) {
        items.push({
          id: leftId,
          label: getText('ui-walls-left-panel'),
          iconId: 'icon-left-panel',
        },
          {
            id: LAST_TWO_PANELS,
            label: getText('ui-walls-right-panel'),
            iconId: 'icon-combined-right-panel',
          })
      } else {
        items.push({
          id: FIRST_TWO_PANELS,
          label: getText('ui-walls-left-panel'),
          iconId: 'icon-combined-left-panel',
        },
          {
            id: rightId,
            label: getText('ui-walls-right-panel'),
            iconId: 'icon-right-panel',
          })
      }
    } else {
      items.push({
        id: leftId,
        label: getText('ui-walls-left-panel'),
        iconId: 'icon-left-panel',
      },
        {
          id: centerId,
          label: getText('ui-walls-center-panel'),
          iconId: 'icon-center-panel',
        },
        {
          id: rightId,
          label: getText('ui-walls-right-panel'),
          iconId: 'icon-right-panel',
        })
    }
  }

  const locksType =
    selectedPanel === ALL_WALL_PANELS_ID ?
      items.length === 2 ? 'd0c1b0' : 'd0c0b0'
      : null // No locks when not all checked

  // Force a valid panel selection
  if (!items.find(x => x.id === selectedPanel)) {
    const identical = hasIdenticalPanels({ wallType: selectedWall })
    if (identical) {
      setSelectedPanel(ALL_WALL_PANELS_ID)
    } else {
      setSelectedPanel(items[0].id)
    }
  }

  return (
    <WallItemSelector
      items={items}
      className="panel-selection"
      onSelect={onPanelSelection}
      disableSelection={selectedPanel === ALL_WALL_PANELS_ID}
      selectedId={selectedPanel}
      locksType={locksType}
      extra={
        <CheckBoxGroup
          theme="white"
          className="all-panels-checkbox"
          disabled={checkboxDisabled}
          selectionList={[{
            id: ALL_WALL_PANELS_ID,
            stringid: 'ui-walls-all-panels-toggle'
          }]}
          selectedItems={selectedPanel === ALL_WALL_PANELS_ID ? [ALL_WALL_PANELS_ID] : []}
          onChange={() => toggleAllPanels()} />
      }
    />
  )
}

