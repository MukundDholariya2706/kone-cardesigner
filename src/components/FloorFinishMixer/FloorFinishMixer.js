import './FloorFinishMixer.scss'
import React, { useContext, useEffect, useReducer, useMemo } from 'react';
import ScrollBox from '../ScrollBox';
import EditorLayout from '../EditorLayout';
import { TranslationContext } from '../../store/translation/TranslationProvider';
import { LayoutContext } from '../../store/layout/LayoutProvider';
import { ProductContext } from '../../store/product/ProductProvider';
import { DesignContext } from '../../store/design/DesignProvider';
import { EDIT_VIEW_FLOOR, MAT_CAR_FLOORING, MATERIAL_CATEGORY_MASTER } from '../../constants';
import HeadingComponent from '../HeadingComponent/HeadingComponent';
import TileComponent from '../TileComponent';
import GridComponent from '../GridComponent';
import ListComponent from '../ListComponent';
import Button from '../Button';
import uniqid from 'uniqid';
import ToggleButtons from '../ToggleButtons';
import { reducer, SET_FINISH, SET_MATERIAL } from './floor-finish-mixer-reducer'
import { hasCommonElement } from '../../utils/array-utils';

const FloorFinishMixer = ({ className, groups = [] }) => {  

  const { getText } = useContext(TranslationContext);
  const layout = useContext(LayoutContext);
  const { getFinishes, saveMixedFinish, addTempFinish, addTempMaterial, getFinish: getFinishItem } = useContext(ProductContext);

  const { setFinish, getFinish, hasUndoState, createUndoState, clearUndoState, undo } = useContext(DesignContext)

  useEffect(() => {
    createUndoState()
    return () => {
      // Unmout: Reset finish
      if (hasUndoState()) {
        undo()
      }
    }
  }, [])

  function goBack() {
    if (hasUndoState()) {
      undo()
    }
    layout.setEditView(EDIT_VIEW_FLOOR)
  }
  
  const getFinishesByMaterials = (part) => {
    if (!part) {
      return []
    }
    const { type, materials } = part
    return getFinishes({ type }).filter(item => {
      return !item.mixed && !item.custom && (!materials || materials.length === 0 || hasCommonElement(item.materials, materials))
    })
  }

  // Filter out groups that have no finishes for their materials
  const groupsWithFinishes = useMemo(() => {
    return groups.filter(group => {
      if (!group) return false
      
      const finishes = []

      Object.values(group).forEach(val => {
        if (val && val.materials) {
          const result = getFinishesByMaterials(val)
          if (result) {
            finishes.push(...result)
          }
        }
      })
      
      return finishes.length > 0
    })
  }, [groups])

  const createInitialState = () => {
    let finish = getFinish({ type: MAT_CAR_FLOORING })
    const finishItem = getFinishItem({ id: finish }) || {}

    // Find out if orginal finish material exists in some group.
    // Select that group by default
    let groupIndex = groups.findIndex((group, index) => {
      return group.base && group.base.materials && hasCommonElement(group.base.materials, finishItem.materials)
    })
    groupIndex = groupIndex === -1 ? 0 : groupIndex

    const baseFinishes = getFinishesByMaterials(groups[groupIndex].base)
    const frameFinishes = getFinishesByMaterials(groups[groupIndex].frame)
    const listFinishes = getFinishesByMaterials(groups[groupIndex].list)
    const material = groups[groupIndex].material

    // set default finish, if material not found in current baseFinishes array
    if (baseFinishes && baseFinishes.length && !baseFinishes.find(item => item.id === finish)) {
      finish = baseFinishes[0].id
    }

    return {
      finishes: [finish, finish, null],
      material,
      groupIndex,
      baseFinishes,
      frameFinishes,
      listFinishes,
    }
  }

  const [state, dispatch] = useReducer(reducer, createInitialState())

  const setGroup = (groupIndex) => {

    const baseFinishes = getFinishesByMaterials(groups[groupIndex].base)
    const frameFinishes = getFinishesByMaterials(groups[groupIndex].frame)
    const listFinishes = getFinishesByMaterials(groups[groupIndex].list)
    const material = groups[groupIndex].material

    dispatch({ 
      type: SET_MATERIAL, 
      payload: { 
        material,
        groupIndex,
        baseFinishes,
        frameFinishes,
        listFinishes,
      }
    })

    // set default finish, if material not found in current finishes array
    // if (finishes && finishes.length && !finishes.find(item => item.id === state.finish)) {
    if (baseFinishes && baseFinishes.length && !baseFinishes.find(item => item.id === state.finish)) {
      dispatch({ type: SET_FINISH, payload: { finish: baseFinishes[0].id, index: 0 } })
      dispatch({ type: SET_FINISH, payload: { finish: baseFinishes[0].id, index: 1 } })
    }
  }

  const createFinish = (id = null) => {
    id = id || uniqid()
    const name = [...state.finishes].filter(item => item).join(', ')

    return {
      id,
      name,
      materials: [state.material],
      finishes: [...state.finishes].filter(item => item),
      custom: true,
      mixed: true,
      types: [ MAT_CAR_FLOORING ],
      categories: []
    }
  }

  const createMaterials = (id = null, items = []) => {
    return items.map((item, index) => {
      return {
        id: id + `-${index + 1}`,
        category: MATERIAL_CATEGORY_MASTER,
        finish: id,
        parent: item || items[0], // use "base finish" if finish not defined
        materialId: index + 1,
      }
    })
  }

  const createMixedFinish = () => {
    saveMixedFinish({ 
      finish: createFinish(),
      materials: createMaterials(null, [ ...state.finishes ] )
    }, (err, id) => {
      clearUndoState()
      setFinish({ type: MAT_CAR_FLOORING, finish: id, custom: true, mixed: true })
      layout.setEditView(EDIT_VIEW_FLOOR)
    })
  }

  useEffect(() => {
    const id = uniqid()
    
    const tempFinish = createFinish(id)
    const tempMaterials = createMaterials(id, [ ...state.finishes ])

    tempMaterials.forEach(tempMaterial => {
      addTempMaterial(tempMaterial)      
    });

    addTempFinish(tempFinish)

    setFinish({ type: MAT_CAR_FLOORING, finish: id })

  }, [ state ])

  function renderFinishTiles(finishes = [], index) {
    return finishes.map((finishItem) => {
      return (
        <TileComponent 
          key={finishItem.id} 
          title={getText(finishItem.id)} 
          subtitle={getText(finishItem.name)} 
          showSapId={true}
          image={finishItem.image} 
          icon={finishItem.premium && "icon-premium"}
          iconTitle={getText('ui-general-extended-lead-time')} 
          selected={finishItem.id === state.finishes[index]} 
          onClick={id => dispatch({ type: SET_FINISH, payload: { finish: finishItem.id, index } })}
        />
      )
    })
  }

  return (
    <EditorLayout
      className={'FloorFinishMixer' + (className ? ` ${className}` : '' )}
      heading={getText('ui-floor-finish-mixer-heading')} 
      action={getText('ui-general-back')} 
      actionClickHandler={goBack}
    >
    {
      groupsWithFinishes && groupsWithFinishes.length > 1 &&
      <ToggleButtons 
        content={ groupsWithFinishes.map((item, index) => ({ value: index, label: getText(`${item.label}`) })) }
        selectedButton={ state.groupIndex } 
        onChange={ groupIndex => setGroup(groupIndex) }
        style={{ marginBottom: '20px' }} 
      />
    }
      <ScrollBox>
        
        <ListComponent>
          <HeadingComponent heading={getText('ui-floor-base-finish')} info={getText('ui-floor-base-finish-i')} padding="sm" />

          <GridComponent cols="4" gap="sm">
            { renderFinishTiles(state.baseFinishes, 0) }
          </GridComponent>
          
          <HeadingComponent heading={getText('ui-floor-frame-finish')} info={getText('ui-floor-frame-finish-i')} border="top" padding="sm" style={{ marginTop: '30px' }} />
          
          <GridComponent cols="4" gap="sm">   
            { renderFinishTiles(state.frameFinishes, 1) }
          </GridComponent>
          
          { state.listFinishes.length > 0 && <>

            <HeadingComponent heading={getText('ui-floor-list-finish')} info={getText('ui-floor-list-finish-i')} border="top" padding="sm" style={{ marginTop: '30px' }} />

            <GridComponent cols="4" gap="sm">   
              <TileComponent                 
                title={getText('ui-floor-no-finish')}
                image={'thumbnails/null-finish.png'}                 
                selected={state.finishes[2] === null} 
                onClick={id => dispatch({ type: SET_FINISH, payload: { finish: null, index: 2 } })}
              /> 
              { renderFinishTiles(state.listFinishes, 2) }
            </GridComponent>

          </> }
          
        </ListComponent>

        <div style={{height:'70px'}} />
      </ScrollBox>

      <div className="action-buttons">
        <Button 
          disabled={false} 
          inlineBlock={true} 
          theme={['sm', 'outline', 'center']} 
          onClick={goBack}
        >
          {getText('ui-general-cancel')}
        </Button>
        <Button inlineBlock={true} theme={['sm', 'outline', 'primary', 'center']} onClick={e => { createMixedFinish() } }>{getText('ui-general-save')}</Button>
      </div>

    </EditorLayout>
  )
}
export default FloorFinishMixer