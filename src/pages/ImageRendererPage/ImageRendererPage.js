import React, { useEffect, useContext } from 'react'
import { useHistory } from 'react-router';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useRecaptcha } from '../../components/Recaptcha';
import { SAVE_PREDESIGN_ACTION } from '../../constants';
import { Context3d } from '../../store/3d';
import { APIContext } from '../../store/api';
import { BlueprintContext } from '../../store/blueprint';
import { DesignContext } from '../../store/design';
import {  getDesignSpecificationURL } from '../../utils/link-utils';

export default function ImageRendererPage(props) {
  const { renderDesignImages } = useContext(BlueprintContext)
  const { sceneManager } = useContext(Context3d)
  const history = useHistory()
  const { design } = useContext(DesignContext)
  const api = useContext(APIContext)
  const executeRecaptcha = useRecaptcha(undefined, { visible: false })
  const { designId } = props.match.params

  useEffect(() => {
    async function renderAndSaveImages() {
      try {
        const designImages = await renderDesignImages()
        await api.get('/check')
        const recaptchaData = await executeRecaptcha(SAVE_PREDESIGN_ACTION)

        await api.post(`/predesign/${designId}/set-images`, {
          ...recaptchaData,
          images: designImages
        }, {
          withKeyToken: true,
          includeAuth: true
        })
      } catch (err) {
        console.error('Failed to save images to the DB', err)
      } finally {
        if(design.ktoc) {
          const url = getDesignSpecificationURL(design, false, true)
          props.history.replace({ pathname: url, state: { fromShare: true }})
        } else {
          history.goBack()
        }
      }
    }

    if (sceneManager.assetManager.isComplete) {
      renderAndSaveImages()
      return
    }

    const onComplete = () => { 
      sceneManager.assetManager.removeListener('complete', onComplete)

      renderAndSaveImages()
    }

    sceneManager.assetManager.addListener('complete', onComplete)

    return () => {
      sceneManager.assetManager.removeListener('complete', onComplete)
    }
  }, [sceneManager.assetManager])

  if (!design) {
    props.history.replace({
      pathname: `/share/${designId}`,
      state: { from: 'designSpecification' }
    })
  }

  return <LoadingSpinner />
}