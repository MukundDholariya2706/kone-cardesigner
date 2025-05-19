import React, { useState, useEffect, useContext, useRef} from 'react'
import { withRouter } from "react-router";
import { Link } from "react-router-dom";
import Layout from '../../components/Layout/Layout'; 
import { DesignContext } from '../../store/design/DesignProvider'
import applyRules, { validateDesign } from '../../store/design/design-rules'
import { ProductContext } from '../../store/product/ProductProvider'
import { OfferingContext } from '../../store/offering/OfferingProvider'
import { DataContext } from '../../store/data/DataProvider'
import { UserContext } from '../../store/user/UserProvider'
import { APIContext } from '../../store/api/APIProvider';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import { createColorImage } from '../../utils/image-utils';
import Loader from '../Loader/Loader';
import GendocShareLoadingView from '../GendocShareLoadingView/GendocShareLoadingView';
import { getDesignSpecificationURL } from '../../utils/link-utils';
import ExpiredLinkError from './components/ExpiredLinkError/ExpiredLinkError';
import { AuthContext } from '../../store/auth/AuthProvider';


/* 
  Component that handles loading saved design data from backend to Car Designer. Also product, offering and
  translation data is loaded to match the design settings.

  This logic also handles reloading the data if user refreshes the page (or opens some URL directly) with a saved design ID in the URL.
  In that situation the application will redirect here for data loading, and then redirect back to the
  original page where the user was.
*/


// Depends on the original URL, different loader should be displayed.
// For example, if accessing the Editor route, and it redirects here, Editor loader should be displayed instead.
// (this is so that the loader does not change in the middle of the loading which would happen with the default loading animation otherwise)
function getLoaderToUse(location = {}) {
  if (!location.state) return null

  const { from } = location.state

  switch (from) {
    case 'gendocViewer':
      return 'gendoc'
    case 'editorView':
      return 'editor'
    default:
      return null
    
  }
}

const DesignShare = (props) => {
  const designStore = useContext(DesignContext)
  const api = useContext(APIContext)
  const productStore = useContext(ProductContext)
  const offeringStore = useContext(OfferingContext)
  const dataStore = useContext(DataContext)
  const userStore = useContext(UserContext)
  const { loggedInUser } = useContext(AuthContext)
  const [ design, setDesign ] = useState()

  // Immediately display the gendoc loader if the user is coming from the gendoc viewer
  // (most likely because they refreshed the page there)
  const loaderRef = useRef(getLoaderToUse(props.location))

  const [ progress, setProgress ] = useState(0)
  const [ isEditable, setIsEditable ] = useState(!!loggedInUser)

  const [error, setError] = useState()
  const [ hasExpired, setHasExpired ] = useState(false)
  const [ owner, setOwner ] = useState()

  // 'faking' progress for loading bars (gendoc viewer and editor page refresh)
  function loader() {
    let val = 0

    return () => {
      val += 5
      setProgress(val)
      return val
    }
  }

  // Avoiding closure issue with load design and use effect
  const makeProgress = loader()
  
  async function loadDesign() {
    const design = await api.get(`/predesign/${props.match.params.designId}`, { includeAuth: true })

    if (design.hasExpired) {
      const error = new Error('Design has expired')
      error.name = 'ExpirationError'
      setOwner(design.owner)
      throw error
    }

    if (!isEditable) {
      setIsEditable(design.ktoc || design.editableByPublic)
    }

    if (props.gendoc && (design.tenderInfo || design.owner)) {
      loaderRef.current = 'gendoc'
    } else {
      if (!loaderRef.current || loaderRef.current === 'gendoc') {
        loaderRef.current = 'normal'
      }
    }

    const { hiddenId, productId, country: countryCode, customFinishes, destinationCountry } = design

    offeringStore.setCountryCode(countryCode)
    const { offering, productFamilies } = await offeringStore.load(countryCode)
    
    makeProgress()

    const countryName = dataStore.getCountryNameForCode(countryCode)
    const customFinishesToAdd = (customFinishes || []).map(finish => {
      return {
        ...finish,
        shared: true
      }
    })

    // If old design with no releaseId information saved
    if (!design.releaseId) {
      const offeringProduct = offering.find(x => x.id === productId)

      if (offeringProduct && offeringProduct.releases) {
        design.releaseId = offeringProduct.releases[0].id // Take the first available release
      } else {
        // Can this happen? How?
        console.error(`No product ${productId} found in offering`)
      }
    }

    // decorator is used to inject data to loaded product
    const decorator = {
      materials: [],
      finishes: [],
    }

    // Add custom finishes and materials according to RAL-definitions.
    // This is used mainly with KTOC -custom finishes.
    // Data is given with JSON format in finish-definition.
    // design.components[<index>].finish = "{ key: "value" }"
    // example: 
    // design.components[<index>].finish = JSON.stringify({ type: "MAT_CAR_WALL_FINISH_C", material: "STEEL", category: "PAINTEDS", ral: "9004", color: "#282828" })
    if (design && design.components && Array.isArray(design.components)) {

      // get finishes with json definition
      const jsonFinishes = [
        // remove dublicates
        ...new Set(design.components.filter(
          cv => cv.finish && 
          typeof cv.finish === "string" && 
          cv.finish.indexOf("{") === 0
        ).map(cv => cv.finish))
      ];

      // add custom finishes & materials to 
      // product decorator
      for (const jsonFinish of jsonFinishes) {
        const finishData = JSON.parse(jsonFinish)
        if (finishData.ral) {
          const hexColor = finishData.color
          const color = parseInt(hexColor.replace("#", "0x"));
          const image = createColorImage(hexColor);

          decorator.materials.push({
            id: jsonFinish,
            category: "master",
            finish: jsonFinish,
            parent: 'CUSTOM-OTHER',
            color: color
          })
  
          decorator.finishes.push({
            id: jsonFinish,
            sapId: `${finishData.ral}`,
            name: `finish-ral-color`,
            types: finishData.type ? [finishData.type] : [],
            materials: finishData.material ? [finishData.material] : [],
            categories: finishData.category ? [finishData.category] : [],
            finishes: [jsonFinish],
            image: { url: image }
          })
        }
      }
    }

    makeProgress()

    const from = props.location.state?.from

    let product
    // When refreshing on the editor or design specification page,
    // the product has already been loaded through useProductFromURL hook before coming to this view.
    if ((from === 'editorView' || from === 'designSpecification') && productStore.product) {
      product = productStore.product
    } else {
      product = await productStore.loadProductWithId(productId, design.releaseId, offering, countryName, customFinishesToAdd, productFamilies, decorator, design.ktoc, design.customDesignDimensions, design.carShape, destinationCountry)
    }
    // console.log('>>> productStore.product', productStore.product)

    makeProgress()
    
    // If there is no language in the localStorage, set the one from the design.
    if (!userStore.language) {
      userStore.setLanguage(design.language)
    }

    const designImages = await dataStore.loadSharedImages(design.designImages)
    delete design.customFinishes
    let designToSet
    
    if (design.ktoc) {
      designToSet = design
    } else {
      const validatedDesign = validateDesign(design, product)
      designToSet = applyRules(validatedDesign, product)
    }
    if(product.customCarShape) {
      designToSet.isCustomShape = true    
    }

    designToSet.shared = true
    designStore.setDesign(designToSet, { skipRules: designToSet.ktoc })
    designStore.setInitDesign(designToSet)
    designStore.setInitHiddenId(hiddenId)
    designStore.setHiddenId(hiddenId)
    designStore.setDesignImages(designImages)
    designStore.setOriginalDesignId(designToSet.inheritedFrom || designToSet.sapId)
    
    const finalProgress = makeProgress()

    return { design: designToSet, progress: finalProgress }
  }

  const { countries } = dataStore

  // Wait for countries to be loaded (so it is possible to validate the design 
  // country), and then load the design itself.
  // 
  useEffect(() => {
    if (!dataStore.countries || dataStore.countries.length === 0) return
    loadDesign()
      .then(({ design }) => {

        setDesign(design)

      })
      .catch(err => {
        console.error(`Error when loading design:`, err)

        if (err.name === 'ExpirationError') {
          setHasExpired(true)
        } else {
          setError(err)
        }

      })
  }, [countries])

  useEffect(() => {
    if (!design) return
    
    if (loaderRef.current === 'gendoc') {
      props.history.replace({ 
        pathname: `/doc/${design.hiddenId}/view`,
        state: { progress, isEditable },
      })
      return
    }

    const url = getDesignSpecificationURL(design)
    
    if (loaderRef.current === 'editor') {
      props.history.replace({ 
        pathname: url.replace('specification', 'edit'),
        state: { progress }
      })
    } else {
      props.history.replace({ pathname: url, state: { fromShare: true }})
    }

  }, [design, isEditable])

  if (error) return (
    <div className="ErrorPage">
      <Layout
        limitedWidth={true}
        showHeader={true}
        navBarLinkLabel=""
        navBarClassName="navbar-lg pr-4 pl-4"
        showNavBar={false}
      >
        <div className="error">
          <p className="head">Sorry, something went wrong...</p>
          <span />
          <p className="info">The page you requested was not found. Try to refresh the page, or start from the scratch.</p>
          <Link to="/">Home</Link>
        </div>
      </Layout>
    </div>
  )

  if (hasExpired) return (
    <ExpiredLinkError owner={owner} />
  )

  if (!loaderRef.current) return null

  if (loaderRef.current === 'gendoc') {
    return (<GendocShareLoadingView progress={ progress } isEditable={isEditable} />)
  }

  if (loaderRef.current === 'editor') {
    return (<Loader progress={progress} />)
  }
  
  return (<LoadingSpinner />)
}

export default withRouter(DesignShare)