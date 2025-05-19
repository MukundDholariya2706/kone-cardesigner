// @ts-check

import './DesignSpecification.scss';

import React, { useState, useContext, useEffect, useRef, useMemo } from 'react';
import { Link } from "react-router-dom";
import Layout from '../../components/Layout';
import DownloadDialog from '../../components/DownloadDialog';
import ContactDialog from '../../components/ContactDialog';
import Icon from '../../components/Icon';
import LoadingSpinner from '../../components/LoadingSpinner';

import { DataContext } from '../../store/data';
import { UserContext } from '../../store/user';
import { DesignContext } from '../../store/design';
import { ProductContext } from '../../store/product';
import { OfferingContext } from '../../store/offering';
import { TranslationContext } from '../../store/translation';
import { getDesignInformation, getViewImages } from '../../utils/designInformation'
import {  
    DOWNLOAD_PAGE_ACTION, 
  LOCAL_STORAGE_SHARE_INFO_DIALOG_SHOWN, 
    SAVE_PREDESIGN_ACTION,
  } from '../../constants';
import { APIContext } from '../../store/api';
import { setAnalyticsForEditPage } from '../../utils/analytics-utils'
import { getCustomFinishesInUse } from '../../utils/design-utils'
import { getShareLink } from '../../utils/link-utils'
import useRecaptcha from '../../components/Recaptcha/useRecaptcha';
import { useProductFromURL, useBuildingsType, useIsDesignEditable } from '../../utils/customHooks/customHooks';
import { AuthContext } from '../../store/auth/AuthProvider';
import { SiteContext } from '../../store/site';
import allRoles from '../../store/roles'
import DesignNameEditor from './components/DesignNameEditor';
import ShareDesignArea from './components/ShareDesignArea';
import InfoDialog from './components/InfoDialog';
import ToastContainer from '../../components/ToastContainer';
import { ToastContext } from '../../store/toast';
import DesignImages from './components/DesignImages';
// import { renderImages, IMAGE_IDS } from '../../utils/renderImages';
import { getDomainDefinition } from '../../utils/generalUtils';
import TenderInfo from './components/TenderInfo/TenderInfo';
import DesignInfo from '../../components/DesignInfo/DesignInfo';

const DesignSpecification = (props) => {
  const { getText } = useContext(TranslationContext);  
  const api = useContext(APIContext)
  const { language, location, role, setRole } = useContext(UserContext);
  const siteCtx = useContext(SiteContext)
  const [loading, setLoading] = useState(true)
  const [saveError, setSaveError] = useState(false)
  const [design, setDesign] = useState()

  const canBeEdited = useIsDesignEditable()
  const { loggedInUser, domainCountry } = useContext(AuthContext)
  const { addToast } = useContext(ToastContext)
  const designStore = useContext(DesignContext);
  
  const roles = useMemo(() => {
    return allRoles.filter(x => !!x.marine === !!siteCtx.isMarine)
  }, [siteCtx.isMarine])

  const fromShareLink = useMemo(() => {
    if (!props.location || !props.location.state) return false
    return props.location.state.fromShare
  }, [props])

  const [ showInfoDialog, setShowInfoDialog ] = useState(() => {
    const dialogShown = localStorage.getItem(LOCAL_STORAGE_SHARE_INFO_DIALOG_SHOWN)

    if (dialogShown && role) return false
    return fromShareLink
  })
  const [ showDownloadDialog, setShowDownloadDialog ] = useState(false)
  const [ showContactDialog, setShowContactDialog ] = useState(false)

  const buildingsType = useBuildingsType()

  // KTOC designs
  const unsupportedComponents = useMemo(() => {
    if (!designStore.design || !designStore.design.unsupportedComponents) {
      return []
    }

    return designStore.design.unsupportedComponents
  }, [designStore.design])

  const productStore = useContext(ProductContext);

  const designUrl = getShareLink(designStore.hiddenId, siteCtx.isMarine, domainCountry)


  // A list of custom finishes that the design contains
  const customFinishesInUse = useMemo(() => {
    if (!designStore.design) return []
    return getCustomFinishesInUse(designStore.design, productStore.customFinishes)

  }, [designStore.design, productStore.customFinishes])

  // Saving allowed if logged in or no custom finishes applied to the design
  const saveAllowed = useMemo(() => {
    if (loggedInUser) return true
    // Finishes from shared designs have 'shared' flag set to true.
    // If only shared custom finishes are used, the design can be shared again,
    // even if not logged in. 
    if (customFinishesInUse && 
        customFinishesInUse
          .filter(x => !x.shared && !x.finish.mixed).length > 0) {
            return false
          }

    return true
  }, [loggedInUser, customFinishesInUse])

  const { 
    designImages, 
    setDesignImages, 
  } = designStore

  const offeringStore = useContext(OfferingContext);
  const { countryName } = useContext(DataContext)

  const [ savingDesign, setSavingDesign ] = useState(false)

  // Has the design already been shared?
  // Coming from share link --> has been saved.
  const [ designSaved, setDesignSaved ] = useState(() => {
    if (designStore.edited) return false
    if (!designStore.design) return false
    if (designStore.design.saved) return true
    if (designStore.design.shared) return true
  })

  const executeRecaptcha = useRecaptcha(DOWNLOAD_PAGE_ACTION, { visible: true })
  
  const { country, designId } = props.match.params

  const unsupportedRef = useRef()

  useProductFromURL(props.history)

  useEffect(() => {
    return async () => {
      if (designStore?.design?.country === 'ktoc' && productStore?.productKTOCDestCountry) {
        console.log('Swap to destination country offering')
        await productStore.swapProductToOfferingLocation()
      }
    }
  }, [])

  useEffect(() => {
    if (!productStore.product) return

    if (!designStore.design) {
      const d = (designId && productStore.getDesignBySapId(designId)) || null;

      if (d) {
        designStore.setDesign(d)
        // when coming to the shared link, set the analytics page info
        let langCode = ''
        let countryCode = ''
        let { code } = language || {};
        (typeof code === 'string') && (langCode = code.split('_')[0]); // remove country definition
        (typeof code === 'string') && (countryCode = code.split('_')[1]); // remove language definition

        const countryFromDomain = getDomainDefinition()
        setAnalyticsForEditPage( { collectionId:'', countryCode:countryFromDomain, countryId:country, productName:getText(productStore.product.name), languageCountryId: countryCode, languageId:langCode, templateId:d.sapId} )
        return
      } else {
        if (designId !== 'custom') {
          props.history.replace({
            pathname: `/share/${designId}`,
            state: { from: 'designSpecification' }
          })
          return
        }
      }
    }

    
    // if some design exists ... keep on showing that
    if (designStore.design) {
      return
    }

    siteCtx.goHome()

  }, [productStore.product])

  useEffect(() => {
    if (!designStore.design) return
    const designInfo = getDesignInformation({designStore, productStore, offeringStore, getText}) 
      
    designInfo.viewImages = getViewImages(designStore.designImages)

    setDesign(designInfo)
    setDesignImages(designStore.designImages)
    api.get('/check').then(() => {
      savePredesign(designStore.designImages)
    })
    
  }, [designStore.design])

  

  // Display an error for invalid KTOC designs
  useEffect(() => {
    if (loading) return
    if (!unsupportedComponents || unsupportedComponents.length === 0) return
    addToast({
      message: getText('ui-unsupported-components-error'),
      type: 'error',
      autoDismiss: null,
      onClick: () => {
        if (unsupportedRef && unsupportedRef.current) {
          unsupportedRef.current.scrollIntoView({ behavior: 'smooth' })
        }
      }
    })
  }, [unsupportedComponents, loading, unsupportedRef])

  async function savePredesign(designImages) {
    if (savingDesign || designSaved || !saveAllowed) {
      return
    }

    setSavingDesign(true)

    setSaveError(null)

    const itemToStore = {
      ...designStore.design,
      name: designStore.designName,
      theme: designStore.edited ? '' : designStore.design.theme, // remove theme from custom (i.e. edited) designs
      language, location,
      countryName,
      country: offeringStore.countryCode,
      edited: designStore.edited,
      productId: productStore.productId,
      releaseId: productStore.product.productRelease,
      customFinishes: customFinishesInUse,
      designImages,
      buildingsType
    }

    if (loggedInUser) {
      itemToStore.owner = loggedInUser
    } else if (designStore.originalDesignId) {
      itemToStore.inheritedFrom = designStore.originalDesignId
    }

    try {
      const { recaptchaToken, recaptchaNumber } = await executeRecaptcha(SAVE_PREDESIGN_ACTION)

      const dataToSend = {
        ...itemToStore,
        recaptchaToken,
        recaptchaNumber,
      }

      const result = await api.post(`/predesign`, dataToSend, {
        withKeyToken: true,
        includeAuth: true
      })
      
      const images = [...designImages]

      const ownedDesign = {
        ...result,
        ownedDesign: true,
        saved: true,
      }

      designStore.setDesign(ownedDesign, { setName: false, skipRules: true })
      designStore.setEdited(false)
      designStore.setHiddenId(result.hiddenId)

      // For reset functionality
      designStore.setInitDesign(ownedDesign)
      designStore.setInitHiddenId(result.hiddenId)

      setSavingDesign(false)
      setDesignSaved(true)
      setDesignImages(images)

      // Change the URL so it is possible to refresh the page and not lose the ID
      props.history.replace(result.hiddenId)
    } catch (err) {
      setSavingDesign(false)
      setSaveError(true)
      addToast({ type: 'error', message: getText('ui-unexpected-error') })
      console.error('Error when saving desing:', err)
    }
  }
  
  if (!design) return (<LoadingSpinner />)

  const navBarChildren = (
    <>
      <Link className="navbar-item edit-design-button" to={`${props.match.url.replace('specification', 'edit')}`}>        
        {getText('ui-open-in-3d')}        
      </Link>      
    </>
  );


  const onDownloadClick = async () => {
    setShowDownloadDialog(true)
  }

 
  return (
  <>
    { showDownloadDialog ? 
    <DownloadDialog
      closed={!showDownloadDialog} 
      onChange={e => setShowDownloadDialog(e)} 
    /> 
    : null}
    { showInfoDialog && 
      <InfoDialog
        onClose={() => {
          localStorage.setItem(LOCAL_STORAGE_SHARE_INFO_DIALOG_SHOWN, 'true')
          setShowInfoDialog(false)
        }}
        ktoc={designStore.design.ktoc}
        roles = {roles}
        currentRole = {role}
        setNewRole = {(newRole) => setRole(newRole)}
        loggedInUser
      />
    }
    { showContactDialog ? 
      <ContactDialog 
        closed={!showContactDialog} 
        onChange={val => setShowContactDialog(val)} 
        designName={designStore.designName} 
        design={designStore.design} 
        designUrl={designUrl}/> 
    : null}
      
    <Layout 
      limitedWidth={true} 
      showHeader={true} 
      stickyHeader={true}
      showHeaderContactLink={false}
      navBarLinkLabel={getText('ui-general-back')} 
      navBarClassName={`navbar-lg pr-4 pl-4 design-specification${fromShareLink ? ' hideBackButton' : ''}`}
      navBarChildren={canBeEdited ? navBarChildren : null}
      stickyNavBar={true}
      showGiveFeedbackButton={true}
      hideLinkOnMobile={true}
    >
      {design ? 
        <div className="DesignSpecification content">
          <ToastContainer pageWide={true} />
          <div className="topContainer">
            <h2 className="page-header">{getText('ui-general-design-specification')}</h2>  
              <DesignImages
                designImages={designImages}
                loggedInUser={loggedInUser}
                designUrl={designUrl}
                loading={savingDesign}
                executeRecaptcha={() => executeRecaptcha(SAVE_PREDESIGN_ACTION)}
                designId={designStore?.design?.id}
                productId={designStore?.design?.product || designStore?.design?.productId}
              />
          </div> 
          { 
            designStore.design.tenderInfo &&
              <TenderInfo {...designStore.design.tenderInfo } />
          }
          <div className="bottomContainer">
          {/* {
            designImages.map(element => {
              return <> <img id={element.id} src={element.data} /> {element.id} </>
            })
          } */}
            <div className="specification">
              <div className="textContent">
                <DesignNameEditor 
                  design={designStore.design}
                  savingDesign={savingDesign}
                  online={saveAllowed}
                  isEditable={(() => {
                    return designStore.edited || designStore.design.ownedDesign || designStore.design.ktoc
                  })()}
                  executeRecaptcha={() => executeRecaptcha(SAVE_PREDESIGN_ACTION)} />
                <p className="model">{getText(productStore?.product?.name)}</p>
                <p className="desc">{getText(productStore?.product?.description)}</p>
              </div>
            </div>
            <ShareDesignArea 
              error={saveError}
              designUrl={designUrl}
              saveAllowed={saveAllowed}
              loading={savingDesign}
              executeRecaptcha={() => executeRecaptcha(SAVE_PREDESIGN_ACTION)}
              onDownloadClick={onDownloadClick} />

            <DesignInfo design={design} />
            
            { unsupportedComponents && unsupportedComponents.length > 0 &&
              <div ref={unsupportedRef} className="block unsupportedComponents">
                <p className="head">{getText('ui-unsupported-components')}</p>
                <div className="unsupportedComponents__container">
                  {
                  unsupportedComponents.map(item => {
                    return (
                      <p key={item.itemType} className="unsupportedComponent">{item.itemType} - {item.itemId}</p>
                      )
                    })
                  }
                  </div>
              </div>
            }
            <div className={"contact-container"}>
              <div className="contact" onClick={e => setShowContactDialog(true)}>
                <Icon id="icon-contact" />
                {getText('ui-general-contact-us-about-design')}
              </div>
            </div>
          </div>
        </div>
      : null}
    </Layout>
  </>
  )
}




export default DesignSpecification;
