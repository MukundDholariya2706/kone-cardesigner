import './Editor.scss';

import React, { useContext, useEffect, useMemo, useState } from 'react';
import { withRouter } from 'react-router'

import ThreeViewer from '../../components/ThreeViewer';

import Loader from '../../components/Loader'
import Layout from '../../components/Layout/Layout';
import MainNav from "../../components/MainNav"
import EditPanel from "../../components/EditPanel"
import DesignInfoPanel from "../../components/DesignInfoPanel"
import EditorControllers from '../../components/EditorControllers';
import EditorFunctions from '../../components/EditorFunctions';
import UnsavedChangesDialog from '../../components/UnsavedChangesDialog';
import ToastContainer from '../../components/ToastContainer';
import BottomBar from '../../components/BottomBar';

import { LayoutContext } from '../../store/layout';
import { DesignContext } from '../../store/design/DesignProvider';
import { ProductContext } from '../../store/product/ProductProvider';
import { Context3d } from '../../store/3d/shader-lib/Provider3d';

import { setAnalyticsForEditPage, setAnalyticsForEvent } from '../../utils/analytics-utils'

import { EDIT_VIEW_MODEL, EDITOR_PAGE_ACTION, EDIT_VIEW_CUSTOM_WALL_FINISH, EDIT_VIEW_CUSTOM_FLOOR_FINISH, EDIT_VIEW_FLOOR_FINISH_MIXER, EDIT_VIEW_CUSTOM_LANDING_FLOOR_FINISH, EDIT_VIEW_CUSTOM_LANDING_WALL_FINISH, EDIT_VIEW_LANDING_FINISHES, VIEW3D_MODE_CAR } from '../../constants';
import TinyLoadingAnimation from '../../components/TinyLoadingAnimation';
import { TranslationContext } from '../../store/translation/TranslationProvider';
import { SiteContext } from '../../store/site/SiteProvider';
import { UserContext } from '../../store/user/UserProvider';
import { useRecaptcha } from '../../components/Recaptcha';
import { useHideScrollBar, useIsDesignEditable, useProductFromURL } from '../../utils/customHooks/customHooks';
import GendocShareLoadingView from '../../components/GendocShareLoadingView/GendocShareLoadingView';

import SimpleEditorNavBar from '../../components/SimpleEditorNavBar/SimpleEditorNavBar';
import { getDomainDefinition } from '../../utils/generalUtils';

import GendocEditWarningDialog from '../../components/GendocEditWarningDialog/GendocEditWarningDialog';
import { AuthContext } from '../../store/auth/AuthProvider';
import LoadingSpinner from '../../components/LoadingSpinner';


/**
 * Renders out the editor page. The page contains the 3D viewer and function menus.
 * Mounts the scene build by {@link SceneBuilder} according to the blueprint made by BlueprintBuilder to the Viewer3D.
 * @param {Object} props Properties passed to the renderer
 */
const Editor = (props) => {
  // Contexts
  const { getText } = useContext(TranslationContext);
  const { error: productError, setError: setProductError, product } = useContext(ProductContext);

  const designCtx = useContext(DesignContext);
  const { getDesignProperty, design, setDesign, setInitDesign, setInitHiddenId, setHiddenId, initHiddenId, edited, designName, newDesign: setDefaultDesign, initDesign } = designCtx
  const { getTheme, getDesignBySapId } = useContext(ProductContext);
  const { loadingState, resetCamera, sceneManager, setCameraTargetByShape } = useContext(Context3d);
  const { language, role, buildingType } = useContext(UserContext);
  const layout = useContext(LayoutContext);
  const { back, getPrevPage, goHome } = useContext(SiteContext);
  const authCtx = useContext(AuthContext)

  // States

  const prevPage = getPrevPage()

  const [loading3D, setLoading3D] = useState(() => {
    if (prevPage?.includes('/specification')) {
      // Checking if the assets have been loaded once when coming from the specification page.
      // Otherwise the loader would get stuck at 0% progress because everythign is loaded
      // already and sceneManager.on('complete') is never called.
      return !sceneManager.assetManager.isComplete
    }

    return true
  })

  const [renderingImages, setRenderingImages] = useState(false)

  const showPreloader = useMemo(() => {
    if (!product || !design) return true
    return loading3D
  }, [loading3D, product, design])

  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false)
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [ isSurveyBannerVisible, setIsSurveyBannerVisible ] = useState(false)
  const [showWarningDialog, setShowWarningDialog] = useState(false)

  const { country, designId, product: productId, mode } = props.match.params
  const isGendocMode = mode === 'view'

  useHideScrollBar()
  useProductFromURL(props.history)

  useRecaptcha(EDITOR_PAGE_ACTION)

  const canBeEdited = useIsDesignEditable()

  const theme = getTheme(getDesignProperty('theme'))

  useEffect(() => {

    const onComplete = e => {
      // Hide preloader when scene is ready
      setLoading3D(false);
    }
    sceneManager.addListener('complete', onComplete)

    // component mount    
    if (layout.wasEditing !== layout.editView && layout.wasEditing) {
      layout.setEditView(layout.wasEditing);
    }

    return () => {
      // component unmount
      layout.setEditView(EDIT_VIEW_MODEL);
      layout.setSelectedWall(null);
      sceneManager.assetManager?.stopQueue()
      sceneManager.removeListener('complete', onComplete)
    }
  }, [])

  useEffect(() => {
    if (productError) {
      console.error(productError)
      setProductError(null)

      goHome()
    }
  }, [productError])

  useEffect(() => {
    if (showPreloader) return

    if (design) {
      if (layout.view3dMode === VIEW3D_MODE_CAR) {
        setCameraTargetByShape(design.carShape)
      }
    }
  }, [showPreloader])

  useEffect(() => {
    if (mode) {
      // Redirect to share component if data has not been loaded,
      // e.g. when user refreshes the page on the gendoc viewer page (= editor page).
      // Share loads the necessary data and redirects back here.
      if (!design || !product) {
        props.history.replace({
          pathname: `/doc/${designId}`,
          state: { from: 'gendocViewer' }
        })
        return
      }


      if (mode === 'view' && edited) {
        props.history.push('edit')
      }

      if (mode === 'edit' && !canBeEdited) {
        props.history.push('view')
      }
    } else if (design && !canBeEdited) {
      // If trying to access the standard editor URL directly with a design that cannot be edited
      authCtx.signIn(true)
    }
  }, [mode, canBeEdited])

  // Sets the correct design once the product has been loaded or 
  // redirects back to home page if no matching id
  // note: 
  useEffect(() => {
    if (!product || product.id !== productId || mode) return

    // if 'blank', set blank design
    if (designId === 'blank') {
      setDefaultDesign(product.product)
      let langCode = ''
      let countryCode = ''
      let { code } = language || {};
      (typeof code === 'string') && (langCode = code.split('_')[0]); // remove country definition
      (typeof code === 'string') && (countryCode = code.split('_')[1]); // remove language definition
      const countryFromDomain = getDomainDefinition()

      setAnalyticsForEditPage({ buildingType: buildingType, role: role, collectionId: '', countryCode:countryFromDomain, countryId: country, productName: getText(product.name), languageCountryId: countryCode, languageId: langCode, templateId: 'blank' })
      return
    }

    if (!prevPage?.includes('/specification') && (!design || design.sapId !== designId || design.productId !== product.id || !design.releases?.includes(product.productRelease))) {
      const d = (designId && getDesignBySapId(designId)) || null;

      if (d) {
        const designAfterRules = setDesign(d, { initial: true })
        setInitDesign(designAfterRules)
        // check if the design loaded is included in predesigns (global or local)
        const designTheme = product.themes.find(item => item.id === d.theme)
        const collectionId = (designTheme && designTheme.custom) ? 'Local KONE Collection' : ''

        let langCode = ''
        let countryCode = ''
        let { code } = language || {};
        (typeof code === 'string') && (langCode = code.split('_')[0]); // remove country definition
        (typeof code === 'string') && (countryCode = code.split('_')[1]); // remove language definition
        const countryFromDomain = getDomainDefinition()

        setAnalyticsForEditPage({ buildingType: buildingType, role: role, countryCode:countryFromDomain, collectionId, countryId: country, productName: getText(product.name), languageCountryId: countryCode, languageId: langCode, templateId: d.sapId })
        setAnalyticsForEvent({ eventName: 'Start Configuration', eventData: {} })
        return
      } else {
        // Some design ID is specified in the URL but no design has been loaded
        // --> go to the design share view and attempt to load the design with the id
        if (!design) {
          props.history.replace({ 
            pathname: `/share/${designId}`,
            state: { from: 'editorView' }
          })
          return
        }
      }
    }

    // if some design exists ... keep on showing that
    // e.g. when coming from the design specification page
    if (design) {
      // setHiddenIdForDesign(design)
      const prevPage = getPrevPage()
      // set analytics information when entering the edit page from collection page but not from design specification page
      if (prevPage && prevPage.indexOf('/specification') === -1) {
        const designTheme = product.themes.find(item => item.id === design.theme)
        const collectionId = (designTheme && designTheme.custom) ? 'Local KONE Collection' : ''

        let langCode = ''
        let countryCode = ''
        let { code } = language || {};
        (typeof code === 'string') && (langCode = code.split('_')[0]); // remove country definition
        (typeof code === 'string') && (countryCode = code.split('_')[1]); // remove language definition
        const countryFromDomain = getDomainDefinition()

        setAnalyticsForEditPage({ buildingType: buildingType, role: role, collectionId, countryCode:countryFromDomain, countryId: country, productName: getText(product.name), languageCountryId: countryCode, languageId: langCode, templateId: design.sapId })
      }
      setAnalyticsForEvent({ eventName: 'Start Configuration', eventData: {} })
      return
    }

    // If no design specified for editor to display --> redirect home
    goHome()

  }, [product, designId])

  if (showPreloader) {
    // progress 0..100
    const assetLoadingProgress = (loadingState && loadingState.progress) * 100
    let progressToUse
    if (props.location.state?.progress) {
      // Initial progress is made in the design share view (e.g. loading the design, product etc.)
      const initialProgress = props.location.state.progress
      const progressRemaining = 1 - initialProgress / 100  // percentage of progress still to be done (e.g. if 20% initial progress, then will still need to progress for 80%)

      progressToUse = design ? initialProgress + assetLoadingProgress * progressRemaining : 0
    } else {
      progressToUse = assetLoadingProgress
    }

    if (isGendocMode) {
      const isEditable = props.location.state?.isEditable
      return <GendocShareLoadingView progress={progressToUse} isEditable={isEditable} />
    } else {
      return <Loader progress={progressToUse} />
    }
  }

  const getTitle = () => {
    let newTitle = ((theme && theme.name) ? getText(theme.name) + ', ' : '') + getText(designName)
    if (edited) {
      newTitle += " - " + getText('ui-general-edited')
    }
    return newTitle
  }

  const onNavBarLinkClick = (e) => {
    if (edited) {
      e.preventDefault()
      setShowUnsavedDialog(true)
    }
  }

  const onMainClick = (e) => {
    if (isGendocMode) return
    if (layout.editPanelOpen) {
      // layout.setEditPanelOpen(false)
    }
  }

  const onReset = () => {
    if (design.sapId) {
      setDesign(initDesign)
      setHiddenId(initHiddenId)
    } else {
      setDefaultDesign(product.product)
      setInitHiddenId(null)
      setInitDesign(null)
    }
    resetCamera()
    setShowResetDialog(false)
  }

  const isCustomFinishEditorOpen =
    layout.editView === EDIT_VIEW_CUSTOM_WALL_FINISH ||
    layout.editView === EDIT_VIEW_CUSTOM_FLOOR_FINISH ||
    layout.editView === EDIT_VIEW_CUSTOM_LANDING_FLOOR_FINISH ||
    layout.editView === EDIT_VIEW_CUSTOM_LANDING_WALL_FINISH ||
    layout.editView === EDIT_VIEW_LANDING_FINISHES

  const isFloorMixerOpen = layout.editView === EDIT_VIEW_FLOOR_FINISH_MIXER
  const isEditorOpen = isCustomFinishEditorOpen || isFloorMixerOpen
  const hideMainNav = isEditorOpen

  function getPanelToUse(isViewerMode) {
    if (isViewerMode) {
      return DesignInfoPanel
    }

    return EditPanel
  }

  function getNavToUse(isViewerMode) {
    if (isViewerMode) {
      return null
    }

    return MainNav
  }

  function getNavBarToUse(isViewerMode) {
    if (isViewerMode) {
      return <SimpleEditorNavBar />
    }

    return undefined // defaults to normal editor navbar
  }

  if (!canBeEdited && mode !== 'view') return null

  if (renderingImages) return (<LoadingSpinner />)

  return (
    <>
      <Layout
        limitedWidth={false}
        fixedHeight={true}
        showHeader={false}
        panel={getPanelToUse(isGendocMode)}
        panelProps={{
          onEditClick: () => setShowWarningDialog(true),
          className: `editor-mode-${mode}`
        }}
        nav={getNavToUse(isGendocMode)}
        showNavBarLogin={true}
        navBarTitle={getTitle()}
        navBarLinkLabel={getText('ui-general-back')}
        onNavBarLinkClick={onNavBarLinkClick}
        navBarCenterChildren={<TinyLoadingAnimation />}
        stickyNavBar={false}
        onMainClick={onMainClick}
        hideLinkOnMobile={true}
        showSurveyBanner={!isGendocMode && !showPreloader}
        navBarToUse={getNavBarToUse(isGendocMode)}
        showGiveFeedbackButton={!isGendocMode}
        feedbackButtonEditorMode={true}
        className={
          (isCustomFinishEditorOpen ? ' with-custom-finish-editor' : '') +
          (isFloorMixerOpen ? ' with-floor-mixer' : '') +
          (hideMainNav ? ' hide-main-nav' : '') +
          (mode ? ` editor-mode-${mode}` : '')
        }
      >

        <div className={`Editor`}>
          <ToastContainer />
          <EditorFunctions
            save={e => setShowSaveDialog(e)}
            reset={e => setShowResetDialog(e)}
            showReset={!isGendocMode}
            edited={edited}
          />
          <ThreeViewer>
            <EditorControllers />
          </ThreeViewer>
          <BottomBar setRenderingImages={setRenderingImages} isGendocMode={isGendocMode} />
        </div>

      </Layout>

      { showResetDialog &&
        <UnsavedChangesDialog
          onCancel={e => setShowResetDialog(false)}
          onReset={e => onReset()}
          reset={true}
        />
      }

      { showUnsavedDialog &&
        <UnsavedChangesDialog
          onCancel={e => setShowUnsavedDialog(false)}
          onConfirm={e => back()}
          onSave={e => setShowSaveDialog(false)}
        />
      }

      {
        showWarningDialog &&
        <GendocEditWarningDialog 
          onCancel={() => setShowWarningDialog(false)}
          onConfirm={() => {
            layout.setView3dMode(VIEW3D_MODE_CAR)
            props.history.push('edit')
          }}
        />
      }
    </>
  )
}



export default withRouter(Editor);
