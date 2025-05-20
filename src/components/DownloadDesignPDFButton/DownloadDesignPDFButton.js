import React, { useContext } from 'react'
import axios from 'axios'
import { ERROR_TYPES, SAVE_PREDESIGN_ACTION } from '../../constants'
import { APIContext } from '../../store/api'
import { DataContext } from '../../store/data/DataProvider'
import { DesignContext } from '../../store/design/DesignProvider'
import { ProductContext } from '../../store/product/ProductProvider'
import { SiteContext } from '../../store/site'
import { TranslationContext } from '../../store/translation/TranslationProvider'
import { UserContext } from '../../store/user'
import { setAnalyticsForEvent } from '../../utils/analytics-utils'
import { useDesignUrl, useDesignInformation, useErrorLogger } from '../../utils/customHooks/customHooks'

import DownloadPDFButton from '../DownloadPDFButton/DownloadPDFButton'
import { useRecaptcha } from '../Recaptcha'

import './DownloadDesignPDFButton.scss'

/**
 * 
 * @param {Object} props 
 * @param {*} props.document
 * @param {Object=} props.documentProps
 * @param {String} props.pdfName
 * @param {*=} props.children
 * @param {string=} props.loadingText Text to display when PDF is being generated
 * @param {boolean=} props.disabled
 * @param {string=} props.className
 * @param {Function=} props.loadPdfData - Asyncronous function that returns a promise for the data to pass into the pdf document.
 * @param {Function=} props.onGenerationFinished - Function to run after the pdf generation has finishes.
 * @param {Function=} props.onClick - Function to run on click before starting to load PDF data
 */
function DownloadDesignPDFButton(props) {
  const {
    className = '',
    children,
    onGenerationFinished,
    documentLanguage: injectedDocumentLanguage,
    documentProps = {},
    ...rest
  } = props

  const api = useContext(APIContext)
  const designCtx = useContext(DesignContext)
  const dataCtx = useContext(DataContext)
  const translationCtx = useContext(TranslationContext)
  const productCtx = useContext(ProductContext)
  const userCtx = useContext(UserContext)
  const siteCtx = useContext(SiteContext)
  const logError = useErrorLogger()
  const executeRecaptcha = useRecaptcha(undefined, { visible: false })

  const documentLanguage = injectedDocumentLanguage || userCtx.documentLanguage

  const loadDesignInformation = useDesignInformation()
  const designUrl = useDesignUrl()

  function handleFinished(err) {
    if (!err) {
      // PDF loaded succesfully
      ;(async () => {
        try {
          const { recaptchaToken, recaptchaNumber, domain } = await executeRecaptcha(SAVE_PREDESIGN_ACTION)
          await api.post(`/predesign/${designCtx.hiddenId}/count/downloaded`, {
            recaptchaToken,
            recaptchaNumber,
          }, {
            withKeyToken: true,
          })
        } catch (err) {
          console.error('ERROR: Failed to add to download count.')
        }
      })()
    } else {
      logError({
        message: 'PDF generation failed',
        severity: ERROR_TYPES.ERROR,
        stackTrace: err.stack,
      })
    }

    let { code } = documentLanguage || {};
    (typeof code === 'string') && (code = code.split('_')[0]); // remove country definition

    setAnalyticsForEvent({
      eventName: 'Download Document',
      eventData: {
        language: code,
      },
    })

    onGenerationFinished(err)
  }

  function getWriteDirection(languageCode = '') {
    const code = languageCode.split('_')[0]
  
    // 
    // Source of rtl language codes:
    // https://meta.wikimedia.org/wiki/Template:List_of_language_names_ordered_by_code
    // 
    const direction = ['ar', 'arc', 'dv', 'fa', 'ha', 'he', 'khw', 'ks', 'ku', 'ps', 'ur', 'yi'].indexOf(code) !== -1 ? 'rtl' : 'ltr';
    return direction
  }

  async function loadAddresses() {
    const { domainCountry } = dataCtx
    const { isMarine } = siteCtx
    const nameToUse = isMarine ? 'marine' : domainCountry.name

    try {
      const result = await api.get(`/frontline/${nameToUse}/addresses?get_all=true`)
      return result
    } catch (err) {
      console.error(`Failed to load address info for ${nameToUse}`)
      return {}
    }
  }

  async function generateFloorThumb(materials, images) {
    
    let canvas = document.createElement('canvas')
    canvas.width = 75
    canvas.height = 75
    let context = canvas.getContext('2d')
    if(materials[0]?.id === 'PVC') {
      let piece1
      let piece2
      try {
        const pieceBin = await axios.get(images[0],{responseType: 'arraybuffer'})
        piece1 = 'data:image/png;base64,'+Buffer.from(pieceBin.data,'binary').toString('base64')
      } catch {
        console.log('PDF image ',images[0],' missing')
      }
      try {
        const pieceBin = await axios.get(images[1],{responseType: 'arraybuffer'})
        piece2 = 'data:image/png;base64,'+Buffer.from(pieceBin.data,'binary').toString('base64')
      } catch {
        console.log('PDF image ',images[1],' missing')
      }
    
      let img1= null
      if(piece1) {
        img1 = await loadFinishImage(piece1)
        context.drawImage(img1,0,0,75,75)
      }
      if(piece2) {
        const img = await loadFinishImage(piece2)
        context.drawImage(img,9,9,57,57)
        if(piece1) {
          context.drawImage(img1,16.5,16.5, 42,42)
        }
      }
    
    } else if(['STONE', 'COMPOSITESTONE'].indexOf(materials[0]?.id) !== -1) {
      let piece1
      let piece2
      let piece3
      try {
        const pieceBin = await axios.get(images[0],{responseType: 'arraybuffer'})
        piece1 = 'data:image/png;base64,'+Buffer.from(pieceBin.data,'binary').toString('base64')
      } catch {
        console.log('PDF image ',images[0],' missing')
      }
      try {
        const pieceBin = await axios.get(images[1],{responseType: 'arraybuffer'})
        piece2 = 'data:image/png;base64,'+Buffer.from(pieceBin.data,'binary').toString('base64')
      } catch {
        console.log('PDF image ',images[1],' missing')
      }
  
      try {
        const pieceBin = await axios.get(images[2],{responseType: 'arraybuffer'})
        piece3 = 'data:image/png;base64,'+Buffer.from(pieceBin.data,'binary').toString('base64')
      } catch {
        console.log('PDF image ',images[2],' missing')
      }
  
      if(piece2) {
        const img = await loadFinishImage(piece2)
        context.drawImage(img,0,0)
      }
      if(piece3) {
        const img = await loadFinishImage(piece3)
        context.drawImage(img,9,9,57,57)
      }
      if(piece1) {
        const img = await loadFinishImage(piece1)
        context.drawImage(img,13.5,13.5, 48,48)
      }

    }
    return canvas.toDataURL()
  }

  function loadFinishImage(data) {
    return new Promise((resolve, reject)=> {
      let img = new Image()
      img.onload = () => resolve(img)
      img.src=data
    })
  }

  async function generateWallThumb(images) {
    let piece1
    let piece2
    let piece3
    try {
      if( images[0].indexOf('data:image/png;base64') !== -1) {
        piece1 = images[0]
      } else {
        const pieceBin = await axios.get(images[0],{responseType: 'arraybuffer'})
        piece1 = 'data:image/png;base64,'+Buffer.from(pieceBin.data,'binary').toString('base64')
      }
    } catch {
      console.log('PDF image ',images[0],' missing')
    }
    try {
      if( images[1].indexOf('data:image/png;base64') !== -1) {
        piece2 = images[1]
      } else {
        const pieceBin = await axios.get(images[1],{responseType: 'arraybuffer'})
        piece2 = 'data:image/png;base64,'+Buffer.from(pieceBin.data,'binary').toString('base64')
      }
    } catch {
      console.log('PDF image ',images[1],' missing')
    }

    try {
      if( images[2].indexOf('data:image/png;base64') !== -1) {
        piece3 = images[2]
      } else {
        const pieceBin = await axios.get(images[2],{responseType: 'arraybuffer'})
        piece3 = 'data:image/png;base64,'+Buffer.from(pieceBin.data,'binary').toString('base64')
      }
    } catch {
      console.log('PDF image ',images[2],' missing')
    }

    let canvas = document.createElement('canvas')
    canvas.width = 75
    canvas.height = 75
    let context = canvas.getContext('2d')

    if(piece1) {
      const img = await loadFinishImage(piece1)
      context.drawImage(img,0,0, 75, 75)
    }
    if(piece2) {
      const img = await loadFinishImage(piece2)
      context.drawImage(img, img.width/3,0, img.width/3,img.height,  25,0, 25,75)
    }
    if(piece3) {
      const img = await loadFinishImage(piece3)
      context.drawImage(img, 2*img.width/3,0,  img.width/3,img.height,  50,0, 25,75)
    }

    return canvas.toDataURL()
  }

  async function generateMixedThumbs(data) {
    let thumbs = {start:true}
    
    if(data && data.wallB && data.wallB.mixed && !data.wallB.generatedPdfImage) {
      thumbs.generatedPdfImageBWall = await generateWallThumb(data.wallB.pdfImages)
    }
    if(data && data.wallC && data.wallC.mixed && !data.wallC.generatedPdfImage) {
      thumbs.generatedPdfImageCWall = await generateWallThumb(data.wallC.pdfImages)
    }
    if(data && data.wallD && data.wallD.mixed && !data.wallD.generatedPdfImage) {
      thumbs.generatedPdfImageDWall = await generateWallThumb(data.wallD.pdfImages)
    }

    if(data && data.floor && data.floor.mixed && !data.floor.generatedPdfImage) {
      thumbs.generatedPdfImageFloor = await generateFloorThumb(data.floor.materials,data.floor.pdfImages)
    }
  
    return thumbs
  }

  const addImageSize = async (image) => {

    if(!image) return null

    let img = new Image()
    img.src = image
    await img.decode()

    return {w:img.width, h:img.height}

  }

  async function loadPdfData() {

    const designImagesObject = designCtx.designImages?.reduce((prev, curr) => {
      const result = { ...prev }
      result[curr.id] = curr
      return result
    }, {}) || {}

    const designInformation = loadDesignInformation()

    if(designInformation.cop.image) {
      designInformation.cop.imageSize = await addImageSize(designInformation.cop.image)
    }
    if(designInformation.horCop.image) {
      designInformation.horCop.imageSize = await addImageSize(designInformation.horCop.image)
    }
    if(designInformation.hl.image) {
      designInformation.hl.imageSize = await addImageSize(designInformation.hl.image)
    }
    if(designInformation.lcs.image) {
      designInformation.lcs.imageSize = await addImageSize(designInformation.lcs.image)
    }
    if(designInformation.dop.image) {
      designInformation.dop.imageSize = await addImageSize(designInformation.dop.image)
    }
    if(designInformation.din.image) {
      designInformation.din.imageSize = await addImageSize(designInformation.din.image)
    }
    if(designInformation.eid.image) {
      designInformation.eid.imageSize = await addImageSize(designInformation.eid.image)
    }
    if(designInformation.fb.image) {
      designInformation.fb.imageSize = await addImageSize(designInformation.fb.image)
    }

    const data = {
      ...designInformation,
      designName: designCtx.designName,
      productName: productCtx.product?.name,
      productDesc: productCtx.product?.description,
      designUrl,
      tenderInfo: (designCtx?.design?.tenderInfo && !designCtx.edited) ? designCtx.design.tenderInfo : null,
    }

    
    const promises = []

    promises.push(loadAddresses())
    promises.push(generateMixedThumbs(data))

    // The translation state is set to the translation context and used from there in the PDF
    promises.push(translationCtx.loadPDFTranslations(documentLanguage))

    const [ addresses, mixedThumbs ] = await Promise.all(promises)

    return {
      addresses,
      ...data,
      ...mixedThumbs,
      documentLanguage,
      viewImages: designImagesObject,
      domain: dataCtx.domainCountry?.domain,
    }
  }

  return (
    <DownloadPDFButton
      onGenerationFinished={handleFinished}
      className={`DownloadDesignPDFButton ${className}`}
      loadPdfData={loadPdfData}
      documentProps={{
        getText: translationCtx.getTextPDF,
        writeDirection: getWriteDirection(documentLanguage?.code),
        ...documentProps
      }}
      {...rest}
    >
      { children}
    </DownloadPDFButton>
  )
}

export default DownloadDesignPDFButton