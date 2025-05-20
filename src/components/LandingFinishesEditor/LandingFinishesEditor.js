import './LandingFinishesEditor.scss';
import React, { useContext, useState, useEffect } from 'react';
import uniqid from 'uniqid'
import { TranslationContext } from '../../store/translation/TranslationProvider';
import EditorLayout from '../EditorLayout';
import { LayoutContext } from '../../store/layout/LayoutProvider';
import ScrollBox from '../ScrollBox';
import Button from '../Button';
import { SketchPicker } from 'react-color'
import { useOnClickOutside } from '../../utils/customHooks';
import { useRef } from 'react';
import { EDIT_VIEW_CUSTOM_LANDING_WALL_FINISH, EDIT_VIEW_CUSTOM_LANDING_FLOOR_FINISH, MAT_LANDING_WALL, MAT_LANDING_FLOOR, MAT_LANDING_CEILING, EDIT_VIEW_LANDING_FINISHES, LANDING_FINISH_GROUP } from '../../constants';
import { ProductContext } from '../../store/product/ProductProvider';
import { DesignContext } from '../../store/design/DesignProvider';
import CustomFinishEditor from '../CustomFinishEditor';
import { useCallback } from 'react';

const DEFAULT_TEXTURE = {
  image: null,
  offset: [0, 0],
  repeat: [1, 1],
  rotation: 0,
}


/**
 * Renders out the header part of the view (currently not in use)
 * @function LandingEditor Header renderer
 * @param {Object} props
 * @param {string} props.previousView
 * @param {Function} props.setError
 */
const LandingFinishesEditor = (props) => {
  const { previousView, setError } = props
  const { getText } = useContext(TranslationContext);
  const layout = useContext(LayoutContext)
  const product = useContext(ProductContext)
  const design = useContext(DesignContext)

  const [ view, setView ] = useState()
  const [ originalUndoState, setOriginalUndoState ] = useState()
  
  const originalFloor = useCallback(design.getFinish({ type: MAT_LANDING_FLOOR}), [])


  const [ customLandingFloor, setCustomLandingFloor ] = useState(createInitialFinishState(originalFloor, 'custom-landing-floor'))

  const originalWall = useCallback(design.getFinish({ type: MAT_LANDING_WALL}), [])


  const [ customLandingWall, setCustomLandingWall ] = useState(createInitialFinishState(originalWall, 'custom-landing-wall'))

  const originalCeiling = useCallback(design.getFinish({ type: MAT_LANDING_CEILING }), [])

  const [ customLandingCeiling, setCustomLandingCeiling ] = useState(() => { 
    const ceilingFinishes = product.getFinishes({ type: MAT_LANDING_CEILING })
    const parent = product.getParentForMaterial({ id: originalCeiling }) || originalCeiling 

    const found = ceilingFinishes.find(x => x.id === parent)
    return {
      name: 'custom-landing-ceiling',
      parent,
      color: product.getColorForMaterial({ id: originalCeiling }),
      material: parent,
      // Image of the ceiling should be the original image of the landing items 
      // for this group. This can then be used as the base for the custom 
      // thumbnails, as the ceiling should always stay as it is.
      image: found && found.image, 
      texture: DEFAULT_TEXTURE,
      copyOf: originalCeiling,
    }
  })

  // TODO init value from the design (if a color is already set there)
  const [ wallColor, setWallColor ] = useState(customLandingWall.color && customLandingWall.color.replace('0x', '#'))

  const [ floorColor, setFloorColor ] = useState(customLandingFloor.color && customLandingFloor.color.replace('0x', '#'))

  /**
   * The initial state of a landing finish to be edited. If nothing changes
   * for this finish, the initial state gets saved as is, essentially copying it
   */
  function createInitialFinishState(originalFinish, name) {
    const parent = product.getParentForMaterial({ id: originalFinish }) || originalFinish
    const color = product.getColorForMaterial({ id: originalFinish })
    const map = product.getMapForMaterial({ id: originalFinish })
    const found = product.customFinishes && product.customFinishes.find(x => x.id === originalFinish)
    const parentTexture =  found ? found.textures[0] : product.getTexture({ id: originalFinish })
    const image = found && found.finish.image && found.finish.image
    return { 
      name,
      parent,
      color,
      material: parent,
      texture: DEFAULT_TEXTURE,
      map,
      parentTexture,
      image, // Image to save for the finish itself
      copyOf: originalFinish,
      imageToUse: image && (image.url || localStorage.getItem(image.localStorage)) // Image to use for thumbnail
    }
  }

  useEffect(() => {
    const state = design.createUndoState()
    setOriginalUndoState(state)
  }, [])

  async function handleSave() {
    try {
      const group = {
        id: uniqid(),
        type: LANDING_FINISH_GROUP
      }

      await product
        .saveCustomFinish(customLandingFloor, {
          types: [MAT_LANDING_FLOOR],
          group,
          name: 'custom-landing-floor',
          map: customLandingFloor.map,
          texture: customLandingFloor.parentTexture,
          image: customLandingFloor.image
        })

      await product
        .saveCustomFinish(customLandingWall, {
          types: [MAT_LANDING_WALL],
          group,
          name: 'custom-landing-wall',
          map: customLandingWall.map,
          texture: customLandingWall.parentTexture,
          image: customLandingWall.image
        })

      await product
        .saveCustomFinish(customLandingCeiling, {
          types: [MAT_LANDING_CEILING],
          group,
          name: 'custom-landing-ceiling',
          image: { url: customLandingCeiling.image } // Preserve the original ceiling image
        })

      design.setLandingGroup({ groupId: group.id, custom: true })
        

      layout.setEditView(previousView)
    } catch (err) {
      console.error('Error when saving custom finishes', err)
      setError(err)
    }
  }

  const wallTimeoutRef = useRef()

  function handleWallColorChange(color) {
    const hexColor = color.hex
    setWallColor(hexColor)
    clearTimeout(wallTimeoutRef.current);
    wallTimeoutRef.current = setTimeout(() => {      
      if (hexColor) {
        const id = `color-${hexColor}`
        const color = hexColor.replace('#', '0x')

        const parent = product.getParentForMaterial({ id: originalWall }) || originalWall

        product.addTempMaterial({
          id,
          category: "master",
          finish: id,
          parent,
          color,
          lightMap: undefined, // quick fix, will make the wall dull looking tho
          aoMap: undefined
        })

        setCustomLandingWall({ 
          name: 'custom-landing-wall',
          material: id,
          color,
          parent,
          texture: DEFAULT_TEXTURE
        })

        design.setFinish({ type: MAT_LANDING_WALL, finish: id })
      }
    }, 500)
  }
  
  const floorTimeoutRef = useRef()

  function handleFloorColorChange(color) {
    const hexColor = color.hex
    setFloorColor(hexColor)
    clearTimeout(floorTimeoutRef.current)
    floorTimeoutRef.current = setTimeout(() => {      
      if (hexColor) {
        const id = `color-${hexColor}`

        const color = hexColor.replace('#', '0x')

        const parent = product.getParentForMaterial({ id: originalFloor }) || originalFloor

        product.addTempMaterial({
          id,
          category: "master",
          finish: id,
          parent,
          color
        })

        setCustomLandingFloor({ 
          name: 'custom-landing-floor',
          material: id,
          color,
          parent,
          texture: DEFAULT_TEXTURE
        })

        design.setFinish({ type: MAT_LANDING_FLOOR, finish: id })
      }
    }, 500)
  }

  function handleWallImport() {
    setView(EDIT_VIEW_CUSTOM_LANDING_WALL_FINISH)
  }

  function handleFloorImport() {
    setView(EDIT_VIEW_CUSTOM_LANDING_FLOOR_FINISH)
  }

  function onCancelClick() {
    if (originalUndoState) {
      design.setDesign(originalUndoState)
    }
    layout.setEditView(previousView)
  }

  if (view === EDIT_VIEW_CUSTOM_LANDING_WALL_FINISH) return (
    <CustomFinishEditor
      type={MAT_LANDING_WALL}
      setFinish={design.setFinish}
      actionButtonText={getText('ui-general-apply')}
      showNameDialog={false}
      setView={setView}
      defaultRepeat={[5, 5]}
      previousView={EDIT_VIEW_LANDING_FINISHES}
      onAction={params => {
        const imageToUse = params && params.texture && params.texture.image
        setCustomLandingWall({ ...params, imageToUse })
      }}
    />)

    if (view === EDIT_VIEW_CUSTOM_LANDING_FLOOR_FINISH) return (
      <CustomFinishEditor
        type={MAT_LANDING_FLOOR}
        setFinish={design.setFinish}
        actionButtonText={getText('ui-general-apply')}
        showNameDialog={false}
        setView={setView}
        materialToUse={product.getParentForMaterial({ id: originalFloor }) || originalFloor}
        defaultRepeat={[5, 5]}
        previousView={EDIT_VIEW_LANDING_FINISHES}
        onAction={params => {
          const imageToUse = params && params.texture && params.texture.image
          setCustomLandingFloor({ ...params, imageToUse })
        }}
      />)

  return (      
    <div className="LandingFinishesEditor">        
      <EditorLayout heading={getText('ui-landing-finishes')} >
        <ScrollBox>
          <LandingFinishBox
            label={getText('ui-change-landing-wall-finish')}
            actionText={getText('ui-general-import')}
            image={customLandingWall.imageToUse}
            onActionClick={handleWallImport}
            color={wallColor}
            setColor={handleWallColorChange}
          />
          <LandingFinishBox
            label={getText('ui-change-landing-floor-finish')}
            actionText={getText('ui-general-import')}
            image={customLandingFloor.imageToUse}
            onActionClick={handleFloorImport}
            color={floorColor}
            setColor={handleFloorColorChange}
          />
        </ScrollBox>
        <div className="action-buttons">
          <Button 
            disabled={false} 
            inlineBlock={true} 
            theme={['sm', 'outline', 'center']} 
            onClick={onCancelClick}
          >
            {getText('ui-general-cancel')}
          </Button>
          <Button disabled={false} inlineBlock={true} theme={['sm', 'outline', 'primary', 'center']} onClick={handleSave}>{getText('ui-general-save')}</Button>
        </div>
      </EditorLayout>
    </div>
  )
}

function LandingFinishBox(props) {
  const { 
    className = '', 
    label,
    actionText,
    onActionClick,
    image,
    color, setColor
  } = props

  return (
    <div className={`LandingFinishBox ${className}`}>
      <ColorSelector
        image={image}
        color={color}
        setColor={setColor}
      />
      <p className="label">{label}</p>
      <Button 
        theme="link"
        onClick={onActionClick}>{actionText}</Button>
    </div>
  )
}

function ColorSelector(props) {
  const { 
    className = '' ,
    color = '#ffffff',
    setColor,
    image,
  } = props

  const [ pickerOpen, setPickerOpen ] = useState(false)
  const outerDiv = useRef()
  useOnClickOutside(outerDiv, () => setPickerOpen(false), { ignoreCanvas: true })

  function handleChange(color, e) {
    e.stopPropagation()
    setColor(color)
  }

  return (
    <div
      ref={outerDiv}
      onClick={() => setPickerOpen(true)}
      style={{background: image ? `url(${image}) center/cover` : color }} 
      className={`ColorSelector ${className}`}>
      { pickerOpen &&
        <SketchPicker
          disableAlpha={true}
          color={color}
          onChange={handleChange}
        />
      }
    </div>
  )
}

export default LandingFinishesEditor;