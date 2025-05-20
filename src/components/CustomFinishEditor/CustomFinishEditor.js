import './CustomFinishEditor.scss';

import React, { useContext, useState, useRef, useEffect, useCallback } from 'react'
import { ProductContext } from '../../store/product/ProductProvider';
import { DesignContext } from '../../store/design/DesignProvider';
import HeadingComponent from '../HeadingComponent/HeadingComponent';
import ListComponent from '../ListComponent/ListComponent';
import Cropper from 'react-easy-crop'
import Slider from '../Slider';
import RadioButtonGroup from '../RadioButtonGroup/RadioButtonGroup';
import { TranslationContext } from '../../store/translation/TranslationProvider';
import EditorLayout from '../EditorLayout';
import ScrollBox from '../ScrollBox';
import FileInput from '../FileInput';
import Button from '../Button';
import CustomFinishNameDialog from '../CustomFinishNameDialog';
import uniqid from 'uniqid';
import { CAR_TYPE_GLASS_BACKWALL } from '../../constants';

const TEXTURE_SIZE = 512

/**
 * @param {Object} props
 * @param {string} props.type - Type of the finish to change
 * @param {Function} props.setFinish
 * @param {string=} props.actionButtonText
 * @param {string} props.previousView - The edit view to go to when Cancel is clicked
 * @param {Function} props.onAction - The function to run after the action button or name dialog save button has been clicked
 * @param {boolean=} props.showNameDialog - Whether to show the finish name dialog when the action button is clicked
 * @param {string=} props.materialToUse - If not set, material selection will be shown 
 * @param {Function} props.setView
 * @param {Function=} props.setError
 * @param {Number[]=} props.defaultRepeat
 * @param {Number[]=} props.defaultOffset
 * @param {Number=} props.defaultZoom
 * @param {Number=} props.defaultBrightness
 * @param {Number=} props.defaultContrast
 * @param {Number=} props.defaultRotation
 */
const CustomFinishEditor = (props) => {
  const { getText } = useContext(TranslationContext)

  const { 
    type, 
    setFinish,
    actionButtonText = getText('ui-general-save'),
    onAction,
    showNameDialog = true,
    setError,
    setView,
    previousView,
    checkGlassBackwall=false,
    materialToUse,
    defaultRepeat = [1, 1],
    defaultZoom = 1,
    defaultRotation = 0,
    defaultOffset = [0, 0],
    defaultContrast = 100,
    defaultBrightness = 100,
  } = props

  const { addTempMaterial, addTempTexture } = useContext(ProductContext)
  const { hasUndoState, createUndoState, clearUndoState, undo,design } = useContext(DesignContext)

  const [ customMaterial, setCustomMaterial ] = useState(materialToUse || 'CUSTOM-OTHER')
  const [ src, setSrc ] = useState(undefined)
  const [ crop, setCrop ] = useState({ x: 0, y: 0 })
  const [ zoom, setZoom ] = useState(defaultZoom)
  const minZoom = 1
  const maxZoom = 4
  const [ croppedAreaPixels, setCroppedAreaPixels ] = useState(null)

  const [ brightness, setBrightness ] = useState(defaultBrightness)
  const [ contrast, setContrast ] = useState(defaultContrast)
  const [ repeat, setRepeat ] = useState(defaultRepeat)
  const [ offset, setOffset ] = useState(defaultOffset)
  const [ rotation, setRotation ] = useState(defaultRotation)

  const [ showDialog, setShowDialog ] = useState(false)

  const canvasRef = useRef(null)
  
  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  useEffect(() => {
    createUndoState()
  }, [])

  useEffect(() => {
    if (src && checkGlassBackwall && design.carType === CAR_TYPE_GLASS_BACKWALL) {
      // Is glass back wall + custom side wall finish combination possible???
      // For now it is allowed so commenting this out. If it should not be possible,
      // uncomment this one and do not allow selecting custom finishes in the finish list either.
      // setCarType({type:CAR_TYPE_NORMAL})
    }

    const timeout = setTimeout(() => {      
      if (src) {
        update()
      }
    }, 500)
    return () => {
      clearTimeout(timeout);
    }
  }, [src, crop, brightness, contrast, repeat, offset, rotation, customMaterial, croppedAreaPixels])

  function handleActionButtonClick(e) {
    if (showNameDialog) {
      setShowDialog(true)
    } else {
      handleAction()
    }
  }

  async function handleAction(name) {
    const canvas = canvasRef.current;
    if (!canvas) {
      return
    }

    await onAction({ 
      name,
      material: customMaterial,
      parent: customMaterial,            
      texture: {
        image: canvas.toDataURL(),
        offset: offset.map(item => isNaN(item) ? 0 : Number(item) / 100 ),
        repeat,
        rotation: isNaN( rotation ) ? 0 : Number(rotation) * ( Math.PI / 180),
      }
    })

    setView(previousView)
  }

  const update = async e => {  
    if (!src) {
      return
    }

    const image = new Image()
    image.src = src
    const canvas = canvasRef.current;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = TEXTURE_SIZE;
    canvas.height = TEXTURE_SIZE;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(
      image,
      croppedAreaPixels.x * scaleX, // source y
      croppedAreaPixels.y * scaleY, // source x
      croppedAreaPixels.width * scaleX, // source width
      croppedAreaPixels.height * scaleY, // source width
      0,
      0,
      canvas.width,
      canvas.height
    );
    
    const context = canvas.getContext('2d')
    let imgData = context.getImageData(0, 0, canvas.width, canvas.height)

    let i;

    if (Number(brightness) !== 100) {
      const b = ( Number(brightness) - 100 ) * 2.55
      
      // loop pixels (rgba)
      for (i = 0; i < imgData.data.length; i += 4) {
        imgData.data[i] =     Math.max(Math.min(imgData.data[i] + b, 255), 0);
        imgData.data[i + 1] = Math.max(Math.min(imgData.data[i + 1] + b, 255), 0);
        imgData.data[i + 2] = Math.max(Math.min(imgData.data[i + 2] + b, 255), 0);
        // imgData.data[i + 3] = 255;
      }
    }

    if (Number(contrast) !== 100) {      
      const c = ((Number(contrast) - 100) / 100) + 1;
      let intercept = 128 * (1 - c);
      // loop pixels (rgba)
      for (i = 0; i < imgData.data.length; i += 4) {      
        imgData.data[i] =     Math.max(Math.min(imgData.data[i] * c + intercept, 255), 0);
        imgData.data[i + 1] = Math.max(Math.min(imgData.data[i + 1] * c + intercept, 255), 0);
        imgData.data[i + 2] = Math.max(Math.min(imgData.data[i + 2] * c + intercept, 255), 0);
        // imgData.data[i + 3] = 255;
      }
    }

    context.putImageData(imgData, 0, 0);

    const id = uniqid()

    addTempTexture({
      id,
      type: "texture",
      file: { url: canvas.toDataURL() },
      rotation: isNaN( rotation ) ? 0 : Number(rotation) * ( Math.PI / 180),
      wrapS: 1000,
      wrapT: 1000,
      offset: offset.map(item => isNaN(item) ? 0 : Number(item) / 100 ),
      repeat: repeat.map(item => isNaN(item) ? 1 : Number(item) ),
    })

    addTempMaterial({
      id,
      category: "master",
      finish: id,
      parent: customMaterial,
      map: id,
    })

    setFinish({ type, finish: id, custom:true })
  }

  return (
    <div className="CustomFinishEditor">

      <canvas className="hidden" ref={canvasRef} width={TEXTURE_SIZE} height={TEXTURE_SIZE} />

      <EditorLayout 
        heading={getText('ui-custom-material-heading')} 
        action={getText('ui-general-back')} 
        actionClickHandler={e => {          
          if (hasUndoState()) {
            undo()
          }
          
          setView(previousView)       
        } }
      >
        <ScrollBox>

          { !src && (
            <FileInput 
              icon="icon-upload"
              label={getText('ui-custom-upload-image')}
              description={getText('ui-custom-upload-filetypes')}
              onChange={data => setSrc(data)}
            />
          ) }

          { src && (
            <ListComponent gap="sm" border="top" padding="sm">
              <HeadingComponent heading={getText('ui-custom-crop-image')} info={getText('ui-custom-crop-image-i')} />

              <div className="image-view-container">
                <div className="crop-container">
                  <Cropper
                    image={src}
                    crop={crop}
                    zoom={zoom}
                    minZoom={minZoom}
                    maxZoom={maxZoom}
                    aspect={1}
                    onCropChange={setCrop}
                    onCropComplete={onCropComplete}
                    onZoomChange={setZoom}
                    style={{ mediaStyle: { filter: `brightness(${brightness}%) contrast(${contrast}%)` } }}
                  />
                </div>
                <div className="slider-container">
                  <Slider className="slider-sm" min={minZoom} max={maxZoom} step={0.01} value={ zoom } onChange={ value => setZoom( value ) } pre="-" post="+" />
                </div>
              </div>

              <HeadingComponent heading={getText('ui-custom-brightness-and-contrast')} info={getText('ui-custom-brightness-and-contrast-i')} />

              <div className="sliders">
                <Slider icon="icon-brightness" min={0} max={200} value={ brightness } onChange={ value => setBrightness( value ) } />
                <Slider icon="icon-contrast" min={0} max={200} value={ contrast } onChange={ value => setContrast( value ) } />
              </div>

              <HeadingComponent heading={getText('ui-custom-offset')} info={getText('ui-custom-offset-i')} style={{ marginTop: '15px' }} />

              <div className="offset-inputs sliders">
                <Slider icon="icon-offset-x" step={1} min={-50} max={50} value={ offset[0] } onChange={ value => setOffset([ value, offset[1] ]) } />
                <Slider icon="icon-offset-y" step={1} min={-50} max={50} value={ offset[1] } onChange={ value => setOffset([ offset[0], value ]) } />
                <Slider icon="icon-offset-rotate" step={1} min={-180} max={180} value={ rotation } onChange={ value => setRotation( value ) } />
              </div>

              <HeadingComponent heading={getText('ui-custom-repeat')} info={getText('ui-custom-repeat-i')} style={{ marginTop: '15px' }}  />

              <div className="repeat-inputs sliders">
                <Slider icon="icon-offset-x" min={1} max={20} value={ repeat[0] } onChange={ value => setRepeat([ value, repeat[1] ]) } />
                <Slider icon="icon-offset-y" min={1} max={20} value={ repeat[1] } onChange={ value => setRepeat([ repeat[0], value ]) } />
                <div className="spacer" />
              </div>

            { !materialToUse &&
              <>
                <HeadingComponent heading={getText('ui-custom-desc-material')} info={getText('ui-custom-desc-material-i')} style={{ marginTop: '15px' }} />

                <RadioButtonGroup className="material-radio-buttons" labelField="name" selectedId={customMaterial} selectionList={[ 
                  { id: 'CUSTOM-STONE', name: 'material-CUSTOM-STONE' },
                  { id: 'CUSTOM-LAMINATES', name: 'material-CUSTOM-LAMINATES' },
                  { id: 'CUSTOM-WOOD', name: 'material-CUSTOM-WOOD' },
                  { id: 'CUSTOM-RUBBER', name: 'material-CUSTOM-RUBBER' },
                  { id: 'CUSTOM-METAL', name: 'material-CUSTOM-METAL' },
                  { id: 'CUSTOM-OTHER', name: 'material-CUSTOM-OTHER' },
                ]} onChange={ selectedId => setCustomMaterial(selectedId) } />
              </>
            }

            </ListComponent>
          ) }      
          <div style={{height:'70px'}} /> 
        </ScrollBox>
        <div className="action-buttons">
          <Button 
            disabled={false} 
            inlineBlock={true} 
            theme={['sm', 'outline', 'center']} 
            onClick={e => {
              if (hasUndoState()) {
                undo()
              }

              setView(previousView)
            }}
          >
            {getText('ui-general-cancel')}
          </Button>
          <Button disabled={!src} inlineBlock={true} theme={['sm', 'outline', 'primary', 'center']} onClick={handleActionButtonClick}>{actionButtonText}</Button>
        </div>

      </EditorLayout>
      
      { showDialog && <CustomFinishNameDialog 
        onCancel={ e => setShowDialog(false) } 
        onConfirm={ async ({ name }) => { 

          try {
            await handleAction(name)

            clearUndoState()
            setShowDialog(false)
            setView(previousView)
          } catch (err) {
            if (setError) {
              setError(err)
            }
            setShowDialog(false)
          }
        } }
      /> }

      

    </div>
)}

export default CustomFinishEditor;