import './GeneratorPage.scss'

import React, { useContext, useEffect, useState } from 'react'

import { DesignContext } from '../../store/design/DesignProvider'
import { ProductContext } from '../../store/product/ProductProvider'
import { Context3d } from '../../store/3d/shader-lib/Provider3d'
import { DataContext } from '../../store/data/DataProvider'
import { APIContext } from '../../store/api/APIProvider'
import {
  TYP_LANDING_FLOOR,
  KTOC_LANDING_FLOOR,
  TYP_LANDING_WALL,
  KTOC_LANDING_WALL,
  TYP_LCS_PRODUCT,
  MIDDLE_BETWEEN_DOORS,
  TYP_DOP_PRODUCT,
  MIDDLE_RIGHT,
  TYP_COP_HORIZONTAL,
} from '../../constants'
import { QUALITY_3D_LOW, QUALITY_3D_MEDIUM, QUALITY_3D_HIGH } from '../../store/3d'
import { OfferingContext } from '../../store/offering/OfferingProvider'
import { renderImages, IMAGE_IDS } from '../../utils/renderImages'
import { BlueprintContext } from '../../store/blueprint/BlueprintProvider'

/**
 * Gets an array of query parameters
 * @param {string} search
 */
function getQueryParams(search) {
  const arr = search.split('?')
  if (!arr[1]) return {}
  const queries = arr[1].split('&')

  return queries.reduce((prev, query) => {
    const [key, value] = query.split('=')
    prev[key] = value
    return prev
  }, {})
}

/**
 *
 * @param {string} search
 */
function getQualityFromParams(search) {
  if (!search) return QUALITY_3D_HIGH

  const params = getQueryParams(search)
  const quality = params.quality
  if (!quality) {
    return QUALITY_3D_HIGH
  }

  if (quality === 'low') {
    return QUALITY_3D_LOW
  }

  if (quality === 'medium') {
    return QUALITY_3D_MEDIUM
  }

  return QUALITY_3D_HIGH
}

function getImagesFromParams(search) {
  if (!search) return []
  
  const params = getQueryParams(search)
  const renderImagesList = params.renderImages
  if(!renderImagesList) return []
    
  return renderImagesList.split(';')
}

function getMultiplierFromParams(search) {
  if (!search) return 1
  
  const params = getQueryParams(search)
  const multiplier = params.multiplier
  if(!multiplier) return 1
    
  return multiplier
}

/**
 * Renders out the editor page. The page contains the 3D viewer and function menus.
 * Mounts the scene build by {@link SceneBuilder} according to the blueprint made by BlueprintBuilder to the Viewer3D.
 * @param {Object} props Properties passed to the renderer
 */
const GeneratorPage = (props) => {
  const { setProduct } = useContext(ProductContext)
  const api = useContext(APIContext)

  const { setDesign } = useContext(DesignContext)
  const { setOffering } = useContext(OfferingContext)
  const store3d = useContext(Context3d)
  const { imageRenderer, sceneManager } = store3d
  const { loadLocalData } = useContext(DataContext)
  const { blueprintBuilder } = useContext(BlueprintContext)

  const [designImages, setDesignImages] = useState()

  const { designId } = props.match.params

  function waitForAssets() {
    return new Promise((resolve) => {
      const onLoading = (loading, queueLength) => {
        if (loading) {
          return
        } else {
          console.log('assets loaded')
          sceneManager.assetManager.removeListener('loading', onLoading)
          resolve()
        }
      }
      console.log('listener added')
      sceneManager.assetManager.addListener('loading', onLoading)
    })
  }

  async function loadData() {
    const design = await api.get(`/predesign/${designId}`, { publicRoute: true })
    const renderList = getImagesFromParams(props.location.search)
    console.log('design loaded')
    const { productId } = design

    console.log('loading local data')
    const { localOffering, localProduct } = await loadLocalData(productId, design.releaseId || 'R19.2')
    console.log('local data loaded')

    // Need to set the states in contexts so blueprint builder can build the blueprint and the scene.
    // TODO Ideally images could be generated with just the logic in the GeneratorPage component
    setOffering(localOffering)
    setProduct(localProduct)

    const designToSet = design

    const landingFloorIndex = (designToSet.components || []).findIndex(item => item.componentType === TYP_LANDING_FLOOR)
    if(landingFloorIndex !== -1 && renderList.length<1 ) {
      designToSet.components[landingFloorIndex].finish = KTOC_LANDING_FLOOR
    }
    const landingWallIndex = (designToSet.components || []).findIndex(item => item.componentType === TYP_LANDING_WALL)
    if(landingWallIndex !== -1  && renderList.length<1 ) {
      designToSet.components[landingWallIndex].finish = KTOC_LANDING_WALL
    }

    const lcsIndex = (designToSet.components || []).findIndex(item => item.componentType === TYP_LCS_PRODUCT)
    if( lcsIndex !== -1  && renderList.length<1 ) {
      const lcsPos = designToSet.components[lcsIndex].positions
      if(lcsPos && lcsPos.indexOf(MIDDLE_BETWEEN_DOORS) !== -1) {
        designToSet.components[lcsIndex].positions = [MIDDLE_RIGHT]
      }
    }

    const dopIndex = (designToSet.components || []).findIndex(item => item.componentType === TYP_DOP_PRODUCT)
    if( dopIndex !== -1 && renderList.length<1 ) {
      const dopPos = designToSet.components[dopIndex].positions
      if(dopPos && dopPos.indexOf(MIDDLE_BETWEEN_DOORS) !== -1) {
        designToSet.components[dopIndex].positions = [MIDDLE_RIGHT]
      }
    }

    console.log('Setting design state')
    setDesign(designToSet)
    return { design: designToSet, product: localProduct }
  }

  async function loadImages() {
    const promises = [loadData(), waitForAssets()]

    const values = await Promise.all(promises)

    const [data] = values
    const { design, product } = data

    const quality = getQualityFromParams(props.location.search)
    const renderList = getImagesFromParams(props.location.search)
    const multiplier = getMultiplierFromParams(props.location.search)

    const hasHorizontalCop = () => {
      const copHor = design.components.find(item => item.componentType === TYP_COP_HORIZONTAL)
      if(copHor) { return true }
      return false
    }

    console.log('>>> starting image generation');
    let imageList = [];
    if (renderList.length < 1) {
      imageList = [
        IMAGE_IDS.ANGLE_FRONT_IMAGE,
        IMAGE_IDS.ANGLE_BACK_IMAGE,
        IMAGE_IDS.GENDOC_LANDING_IMAGE,
      ];
    } else {
      imageList = renderList;
    }    
    const images = await renderImages({
      design: design,
      product: product,
      quality,
      blueprintBuilder,
      hasHorizontalCop,
      imageRenderer,
      resolutionMultiplier: multiplier,
      neededImages: [
        ...imageList
      ]
    });

    console.log('', `${images.length} images generated`)

    return [...images]
  }

  useEffect(() => {
    const params = getQueryParams(props.location.search)

    if (params.logLevel === 'debug') {
      window.enableLogs?.()
    }

    loadImages().then((images) => {
      console.log('Images rendered, setting state')
      setDesignImages(images)
    })
  }, [])

  if (!designImages) return <div>loading</div>

  return (
    <div className="GeneratorPage">
      {designImages.map((img) => {
        console.log('react render for', img.id, img.data?.length)
        return <img className="gendoc-image" id={img.id} name={img.id} key={img.id} src={img.data} />
      })}
    </div>
  )
}

export default GeneratorPage
