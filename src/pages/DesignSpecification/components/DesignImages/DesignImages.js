import React, { useState, useMemo, useEffect, useContext} from 'react'
import { Carousel } from 'react-responsive-carousel';
import { useHistory, useLocation } from 'react-router';
import Break from 'react-break';
import { APIContext } from '../../../../store/api';
import { DataContext } from '../../../../store/data/DataProvider'
import { ToastContext } from '../../../../store/toast';

import Icon from '../../../../components/Icon';
import ButtonWithIcon from '../../../../components/ButtonWithIcon'

import "react-responsive-carousel/lib/styles/carousel.min.css";
import './DesignImages.scss'
import { TranslationContext } from '../../../../store/translation/TranslationProvider';

let initialized = false

/**
 * 
 * @param {Object} props 
 * @param {string=} props.className 
 * @param {Object[]} props.designImages 
 * @param {boolean=} props.loggedInUser 
 * @param {Function=} props.executeRecaptcha 
 * @param {string=} props.designId 
 * @param {string=} props.productId 
 * @param {boolean=} props.loading 
 * @param {string=} props.designUrl 
 */
function DesignImages(props) {
  const {
    className = '',
    designImages: originalDesignImages = [],
    loggedInUser = false,
    executeRecaptcha = () => { },
    designId = null,
    productId = null,
    loading = false,
    designUrl = null
  } = props

  const api = useContext(APIContext)
  const { addToast } = useContext(ToastContext)
  const { getText } = useContext(TranslationContext)

  const [imagesSelected, setImagesSelected] = useState({angleFront: false, front:false, back:false, landing:false})

  const [downloadOpen, setDownloadOpen] = useState(false)
  const [downloadButtonState, setDownloadButtonState] = useState('idle')
  const [renderingId, setRenderingId] = useState(null)

  const { width, height } = useScreenSize();

  const UIBreakpoints = {
    hasCarousel: 0,
    hasImages: 1025,
  }

  const history = useHistory()
  const location = useLocation()
  const dataCtx = useContext(DataContext)
  const { highResSettings } = dataCtx 

  // Once the design images have been set, use those images
  // for the whole lifetime of this component
  const designImages = useMemo(() => {
    
    if (originalDesignImages.length > 0) {
      initialized = true
      return originalDesignImages
    }
    return []
  }, [])

  const hasImages = !!designImages.length

  const handleImageSelect = (value, item) => {
    const currentSelected = imagesSelected
    currentSelected[item] = !currentSelected[item]
    setImagesSelected({
      ...currentSelected
    })
  }

  const calculateDropDownStyles = useMemo(() => {
    if (!document?.getElementById('dlButton')?.offsetWidth) {
      return {}
    }
    return {
      width: document.getElementById('dlButton').offsetWidth + 'px',
    }
  },[width, downloadOpen])

  const checkRenderingQueue = async (queueId) => {

    console.log({queueId})
    if (!queueId) {
      return 
      // setTimeout( checkRenderingQueue.bind(queueId), 1000)
    }

    const result = await api.get(`/predesign/highres/${queueId}/images`)
    if (!result) {
      addToast({ type: 'error', message: getText('ui-unexpected-error') })
      return
      // setTimeout( checkRenderingQueue, 1000)
    }

  
    const images = result?.products?.[0].images

    let allready = true
    images.forEach(img => {      
      if (img.status === 'Failed') {
        addToast({ type: 'error', message: getText('ui-highres-image-generation-failed-error') })
        allready = false
      } 
        
      if(img.status !== 'Ready') allready = false
    })

    if (allready) {
      setDownloadButtonState('ready')
      const imageKeys = Object.keys(imagesSelected)
      const getImages = imageKeys.filter(img => imagesSelected[img])
      const downloadLink = await api.getApiUrl(`/predesign/highres/${queueId}/get-images-zipped?images=${getImages}`)
      const link = document.createElement("a");
      link.setAttribute("href", downloadLink); 
      link.setAttribute("download", queueId+'_all_images.zip');
      link.click();
      setTimeout(() => {
        setDownloadButtonState('idle')        
      }, 2000);      

    } else {
      setTimeout( checkRenderingQueue.bind(null, queueId), 1000)
    }

  }

  const startGenerating = async (resolution) => {
    setDownloadOpen(false)

    // console.log({designId, productId})
    if (!designId || !productId) return
    
    const keys = Object.keys(imagesSelected)
    let renderImagesList = []
    keys.forEach(key => {
      if(imagesSelected[key]) renderImagesList.push(key)
    })
    
    if (renderImagesList?.length < 1) {
      addToast({ type: 'warning', message: getText('ui-no-images-selected-warning') })
      return
    } 
    
    setDownloadButtonState('process')
    try {
      const { recaptchaToken, recaptchaNumber, domain } = await executeRecaptcha()
      let dataToSend
      let renderId
      if(highResSettings && !loggedInUser) {
        dataToSend = { sapId:designId, resolution:resolution, imageList:renderImagesList, productId, domain, recaptchaToken, recaptchaNumber}
        renderId = await api.post(`/predesign/highres`, dataToSend, { requireAuth: false, withKeyToken: true  })
      } else {
        dataToSend = { sapId:designId, resolution:resolution, imageList:renderImagesList, productId, domain, recaptchaToken, recaptchaNumber }
        renderId = await api.post(`/predesign/highres`, dataToSend, { requireAuth: true, withKeyToken: true  })
      }
      console.log({ renderId })
      console.log(highResSettings)
      setRenderingId(renderId.id)
      
      setTimeout( checkRenderingQueue.bind(null,renderId.id), 1000)
    } catch (err) {
      console.error(`Failed to generate high res images`, err)
      setDownloadButtonState('idle')        
      // addToast({ type: 'error', message: getText('ui-unexpected-error') })

      // Revert the UI to the original state so it matches the design in DB (where nothing was changed).
      // Would need a loader animation and only set the design state after everything went OK in the backend but cannot really be done with a checkbox so instead using tricks.
    }
      
  }

  return (
    <div className={`DesignImages ${className}`}>
      {!hasImages && 
      <button className="render-images-button" onClick={() => {
        history.push(location.pathname + '/render')
      }}>
          Render images
      </button>}
      <Break 
        query={{method: 'is', breakpoint: 'hasCarousel'}}
        breakpoints={UIBreakpoints}>
          {hasImages &&
        <Carousel
          transitionTime={0}
          statusFormatter={() => null}
          renderArrowPrev={onClickHandler => arrow(onClickHandler, 'prev')}
          renderArrowNext={onClickHandler => arrow(onClickHandler, 'next')}
          // renderArrowNext={nextArrow}
          infiniteLoop={true} 
            renderThumbs={() => null}>
            <div className="designImage">
              <img id="angleFront" src={(designImages.find(item => item.id === 'angleFront') || {}).data} alt="Car" />
              {(loggedInUser || highResSettings.show) &&
                <div className="selectImage"  onClick={ (val) => handleImageSelect(val,'angleFront')} >
                  <input type="checkbox" name="angleFront" checked={imagesSelected.angleFront} /> <div>{getText('ui-general-select')}</div>
                </div>
              }
            </div>
            <div className="designImage">
              <img id="front" src={(designImages.find(item => item.id === 'front') || {}).data} alt="Car" />
              {(loggedInUser || highResSettings.show) &&
                <div className="selectImage" onClick={ (val) => handleImageSelect(val,'front')} >
                  <input type="checkbox" name="front" checked={imagesSelected.front} /> <div>{getText('ui-general-select')}</div>
                </div>
              }
            </div>
            <div className="designImage">
              <img id="back" src={(designImages.find(item => item.id === 'back') || {}).data} alt="Car" />
              {(loggedInUser  || highResSettings.show) && 
                <div className="selectImage" onClick={ (val) => handleImageSelect(val,'back')} >
                  <input type="checkbox" name="back" checked={imagesSelected.back} /> <div>{getText('ui-general-select')}</div>
                </div>
              }
            </div>
            <div className="designImage">
              <img id="landing" src={(designImages.find(item => item.id === 'landing') || {}).data} alt="Landing" />
              {(loggedInUser  || highResSettings.show) && 
                <div className="selectImage" onClick={ (val) => handleImageSelect(val,'landing')} >
                  <input type="checkbox" name="landing" checked={imagesSelected.landing} /> <div>{getText('ui-general-select')}</div>
                </div>
              }
            </div>
            
        </Carousel>
          }
      </Break>
      <Break
        query={{method: 'is', breakpoint: 'hasImages'}}
        breakpoints={UIBreakpoints}>
          <div className="images-container">
            { hasImages &&
            images(designImages, imagesSelected, handleImageSelect, loggedInUser, getText, highResSettings)
            }
          </div>
      </Break>

      {(loggedInUser  || highResSettings.show) &&
        <div className={'downloadHighRes'+((loading || !designUrl) ?' disabled' :'')}>
          { downloadButtonState === 'idle' && <ButtonWithIcon
              id="dlButton"
              className="roundButtonBlue"
              style={downloadOpen ? { backgroundColor: '#14389B' } : {}}
              iconId="icon-download"
              icon2Id={downloadOpen ?"icon-chevron-up" :"icon-chevron-down"}
              onClick={ () => setDownloadOpen(!downloadOpen)}
            >
              {getText('ui-general-download-images')}
            </ButtonWithIcon>
          }
          { downloadButtonState === 'process' && <ButtonWithIcon
              id="dlButton"
              className="roundButtonBlue"
              style={ {backgroundColor:'#A1B9FB'}}
              iconId="icon-download"
              icon2Id="Spinner"
              onClick={ () => {}}
            >
              {getText('ui-general-generating')}
            </ButtonWithIcon>
          }
          { downloadButtonState === 'ready' && <ButtonWithIcon
              id="dlButton"
              className="roundButtonBlue"
              iconId="icon-download"
              icon2Id="status-success"
              onClick={ () => {}}
            >
              {getText('ui-general-success')}
            </ButtonWithIcon>
          }
          
          { downloadOpen && 
            <div className='downloadHighResDropdown' style={calculateDropDownStyles}>
              <div className='downloadHighResDropdownContent'>
                <ButtonWithIcon iconId="icon-download" onClick={() => startGenerating('4K') } className='responsiveButton'>{getText('ui-general-download-4k')}</ButtonWithIcon>
                <ButtonWithIcon iconId="icon-download" onClick={() => startGenerating('1080p') } className='responsiveButton'>{getText('ui-general-download-1080p')}</ButtonWithIcon>
                <ButtonWithIcon iconId="icon-download" onClick={() => startGenerating('720p')} className='responsiveButton'>{getText('ui-general-download-720p')}</ButtonWithIcon>
              </div>
            </div>
          }
        </div>
      }

    </div>
  )
}

function images(designImages, imagesSelected, handleImageSelect, loggedInUser, getText, highResSettings) {
  return (
    <>
      <div className="designImage">
        <img id="angleFront" src={(designImages.find(item => item.id === 'angleFront') || {}).data} alt="Car" />
        {(loggedInUser  || highResSettings.show) && 
          <div className="selectImage"  onClick={ (val) => handleImageSelect(val,'angleFront')} >
            <input type="checkbox" name="angleFront" checked={imagesSelected.angleFront} onChange={ () => {}}/> <div>{getText('ui-general-select')}</div>
          </div>
        }
      </div>
      <div className="designImage">
        <img id="front" src={(designImages.find(item => item.id === 'front') || {}).data} alt="Car" />
        {(loggedInUser  || highResSettings.show) &&
          <div className="selectImage" onClick={ (val) => handleImageSelect(val,'front')} >
            <input type="checkbox" name="front" checked={imagesSelected.front} onChange={ () => {}} /> <div>{getText('ui-general-select')}</div>
          </div>
        }
      </div>
      <div className="designImage">
        <img id="back" src={(designImages.find(item => item.id === 'back') || {}).data} alt="Car" />
        {(loggedInUser  || highResSettings.show) &&
          <div className="selectImage" onClick={ (val) => handleImageSelect(val,'back')} >
            <input type="checkbox" name="back" checked={imagesSelected.back} onChange={ () => {}} /> <div>{getText('ui-general-select')}</div>
          </div>
        }
      </div>
      <div className="designImage">
        <img id="landing" src={(designImages.find(item => item.id === 'landing') || {}).data} alt="Landing" />
        {(loggedInUser  || highResSettings.show) &&
          <div className="selectImage" onClick={ (val) => handleImageSelect(val,'landing')} >
            <input type="checkbox" name="landing" checked={imagesSelected.landing} onChange={ () => {}} /> <div>{getText('ui-general-select')}</div>
          </div>
        }
      </div>
   
    </>
  )
}



function arrow(onClickHandler, type = '') {

  return (
    <div onClick={onClickHandler} className={`arrow ${type}-arrow`}>
      <div className="icon-container">
        <Icon style={{fill: '#0071b9'}} id="icon-chevron-down" />
      </div>
    </div>
  )
}


function useScreenSize() {
  const isClient = typeof window === "object";

  function getSize() {
    return {
      width: isClient ? window.innerWidth : undefined,
      height: isClient ? window.innerHeight : undefined
    };
  }

  const [windowSize, setWindowSize] = useState(getSize);

  useEffect(() => {
    if (!isClient) {
      return false;
    }

    function handleResize() {
      setWindowSize(getSize());
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []); // Empty array ensures that effect is only run on mount and unmount

  return windowSize;
}

export default DesignImages