import './Selections.scss';

import React, {useContext, useState, useEffect, useMemo } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import { OfferingContext } from '../../store/offering';
import { ProductContext } from '../../store/product/ProductProvider';
import { TranslationContext } from '../../store/translation/TranslationProvider';
import { UserContext } from '../../store/user/UserProvider';

import { useRecaptcha } from '../../components/Recaptcha';
import Layout from '../../components/Layout'; 
import Container from '../../components/Container';

import { SELECTION_PAGE_ACTION, NEW_BUILDINGS, EXISTING_BUILDINGS, MARINE, LOCAL_STORAGE_ROLE, LOCAL_STORAGE_PROJECT_LOCATION } from '../../constants';

import { SiteContext } from '../../store/site/SiteProvider';
import { DataContext } from '../../store/data/DataProvider';
import { useBuildingsType } from '../../utils/customHooks/customHooks';
import allRoles from '../../store/roles'
import { RoleSelectionDialog, LocationAndRoleDialog } from './components'
import Icon from '../../components/Icon';
import Sprite from '../../components/Sprite';
import LoadingSpinner from '../../components/LoadingSpinner';
import ProductFamilyContainer from './components/ProductFamilyContainer/ProductFamilyContainer';
import { DesignContext } from '../../store/design/DesignProvider';
import { AuthContext } from '../../store/auth';
import { setAnalyticsForPage} from '../../utils/analytics-utils'
import { getDomainDefinition } from '../../utils/generalUtils';
import ToastContainer from '../../components/ToastContainer';

/**
 * Renders out the selections page. The page contains selection for project type and solution.
 * @param {Object} props Properties passed to the renderer
 */
const Selections = (props) => {  
  const { getText } = useContext(TranslationContext);
  const { isMarine: marine } = useContext(SiteContext)
  const designCtx = useContext(DesignContext)
  const { setEmptyDesign } = designCtx
  const { offering, countryCode, setCountryCode, productFamilies, countryCodeInitialized } = useContext(OfferingContext);
  const { countries } = useContext(DataContext)
  const { loggedInUser } = useContext(AuthContext)

  const history = useHistory()

  const location = useLocation()

  const selectedBuildingsType = useBuildingsType()

  const roles = useMemo(() => {
    return allRoles.filter(x => !!x.marine === !!marine)
  }, [marine])

  const kdi = useMemo(() => {
    if (!location || !location.pathname) return false

    return location.pathname.includes('global')
  }, [location])
  
  const countriesWithOffering = useMemo(() => {
    if (!countries) return
    return countries.filter(country => {
      if (selectedBuildingsType === EXISTING_BUILDINGS) {
        if (loggedInUser) {
          // Show both KONE only countries and normal countries for logged in users
          return country.hasKoneOnlyModernizationOffering || country.hasModernizationOffering
        } else {
          // Only 'normal' countries for non-logged in users.
          return country.hasModernizationOffering
        }
      }
      
      if (loggedInUser) {
        // Show both KONE only countries and normal countries for logged in users
        return country.hasKoneOnlyOffering || country.hasOffering
      } else {
        // Only 'normal' countries for non-logged in users.
        return country.hasOffering
      }
    })
  }, [ countries, selectedBuildingsType, loggedInUser ])

  const validCountrySelection = useMemo(() => {
    if (kdi || marine) return true
    if (!countriesWithOffering || !countryCode) return false

    setAnalyticsForPage( { projectCountry:countryCode} )

    return countriesWithOffering.map(x => x.alpha3.toLowerCase()).includes(countryCode.toLowerCase())
  }, [countriesWithOffering, countryCode, kdi, marine])

  const typeToUse = useMemo(() => {
    if (!location) return

    if (marine) return MARINE

    return location.pathname.includes('/existing-buildings') ? EXISTING_BUILDINGS : NEW_BUILDINGS
  }, [location, marine])

  const productsToUse = useMemo(() => {
    if (!offering) return
    const productsForUserType = offering.filter(product => {
      if (!loggedInUser) {
        if (product.isKoneOnly) return false
        if (!product.releases.find(x => x.default)) return false
      }

      return true
    }) 
    if (typeToUse === EXISTING_BUILDINGS) {
      return productsForUserType
        .filter(product => {
          return product.modernization
        })
        .map(x => {
          if (x.productFamily === 'modular-modernization') return x
          
          // With the exception of add-on-deco, all the other modernization
          // products should be listed under the full replacement family.
          return {
            ...x,
            productFamily: 'full-replacement'
          }
        })
    } else {
      return productsForUserType.filter(product => {
        return product.productFamily !== 'full-replacement' && product.productFamily !== 'modular-modernization'
      })
    }
  }, [typeToUse, offering, loggedInUser])

  // Scrolling fix related state.
  const [ currSelectedValues, setCurrSelectedValues ] = useState()

  // The scroll is set manually when necessary. Otherwise product selection
  // automatic scroll behaves weirdly.
  function setSelectionValues(newSelectedValues) {
    if (newSelectedValues && currSelectedValues) {
      // Only necessasy to fix if the new selection is below the old one in the UI
      if (newSelectedValues.fromTop > currSelectedValues.fromTop) {
          window.scrollTo(0, 
            // Scroll up by the height of the previous selection's contents
            newSelectedValues.scrollY - currSelectedValues.contentHeight
          )
      } 
    }

    setCurrSelectedValues(newSelectedValues)
  }

  const showLocationSelector = useMemo(() => {
    return !(marine || kdi)
  }, [marine, kdi])

  const { productId, setProductId, setProduct } = useContext(ProductContext);

  const { role, setRole } = useContext( UserContext )
  
  const selectedRole = useMemo(() => {
    if (!role) return null

    return roles.find(x => x.id === role)
  }, [role, roles])


  const [ showDialog, setShowDialog ] = useState(!selectedRole)

  // filters out families with no products
  const productFamilyFilter = ({ id, type }) => {    
    if (type !== typeToUse) return false
    return !!productsToUse.find(p => p.productFamily === id);
  }

  const filteredProductFamilies = useMemo(() => {
    if (productFamilies && productsToUse) {
      return productFamilies.filter(productFamilyFilter)
    }
    return []
  }, [productFamilies, typeToUse, productsToUse])

  useRecaptcha(SELECTION_PAGE_ACTION)
  
  useEffect(() => {
    // No default selection when this view is opened
    setProductId(null)
    setProduct(null)
    designCtx.setOriginalDesignId(null)
    setEmptyDesign(null) // Null design for so loader works properly in editor view when the user goes back and forth between the selections and editor pages

    setAnalyticsForPage( { country:getDomainDefinition(), role:localStorage.getItem(LOCAL_STORAGE_ROLE)} )

  }, [])

  // Show location selection dialog if invalid country selection 
  // (e.g. it is not found in the country list for the selected building type)
  useEffect(() => {
    if (!countriesWithOffering || !countryCodeInitialized) return

    if (!validCountrySelection && showLocationSelector) {
      setShowDialog(true)
    }
  }, [countriesWithOffering, countryCodeInitialized])

  useEffect(() => {
    if(kdi) setCountryCode('GLOBAL')
  }, [kdi])

  useEffect(() => {
    setCurrSelectedValues(null)
  }, [productsToUse])

  function settingsButton() {
    if (!selectedRole) return null

    // Do not show role selector if the role cannot be changed (forced to 'sales' for logged in users)
    if (loggedInUser && !showLocationSelector) return null

    return (
      <div 
        onClick={() => setShowDialog(true)} 
        className="settings-button">
          <div className="settings-item">
            <div 
              className="settings-sprite-container role-sprite-container">
                <Sprite src={selectedRole.image} />
            </div>
            <div 
              className="settings-label">
              {getText(selectedRole.name)}
            </div>
          </div>
          { showLocationSelector && 
          <div className="settings-item settings-country-selection">
            <div 
              className="settings-sprite-container">
                <Icon id="icon-map-location" />
            </div>
            <div 
              className="settings-label">
              { getText(`country-${countryCode}`) }
            </div>
          </div> }
      </div>
    )
  }

  function locationDialog() {
    if (!countryCodeInitialized) return null
    return (
      <LocationAndRoleDialog 
        onCancel={() => {
          if (!selectedRole || !validCountrySelection) {
            history.push('/')
          } else {
            setShowDialog(false)
          }
        }}
        onConfirm={({ country: newCountry, role: newRole }) => {
          setRole(newRole)
          setShowDialog(false)
          setCountryCode(newCountry)
          localStorage.setItem(LOCAL_STORAGE_PROJECT_LOCATION, newCountry.toUpperCase())
        }}
        role={(selectedRole || {}).id}
        roles={roles}
        country={validCountrySelection ? countryCode : null}
        countries={countriesWithOffering}
        className="role-dialog"
      />
    )
  }

  function roleDialog() {

    return (
      <RoleSelectionDialog 
        onCancel={() => {
          if (!selectedRole) {
            history.push('/marine')
          } else {
            setShowDialog(false)
          }
        }}
        onConfirm={(newRole) => {
          setRole(newRole)
          setShowDialog(false)
        }}
        role={(selectedRole || {}).id}
        roles={roles}
        className="role-dialog"
      />
    )
  }

  return (
    <Layout 
      limitedWidth={true} 
      showHeader={true} 
      stickyHeader={true}
      navBarLinkLabel={getText('ui-general-back')} 
      navBarClassName="navbar-lg pr-4 pl-4 navbar-selections"
      stickyNavBar={true}
      showGiveFeedbackButton={true}
      navBarCenterChildren={settingsButton()}
    >
      <div className="Selections content">
        <ToastContainer pageWide={true} />
        <Container style={{ paddingBottom: '30px' }}>
          { filteredProductFamilies?.length > 0 ? 
          <div className="product-selection-container">
            <h3 className="product-selection-container__header view-header">{getText('ui-selector-select-product')}</h3>
            { filteredProductFamilies.map(family => {

              return <ProductFamilyContainer 
                key={family.id} 
                setSelectionValues={setSelectionValues}
                {...family} 
                products={productsToUse.filter(p => p.productFamily === family.id)}
                selectedProduct={productId} />
            })}
          </div> :
          <div className="loading-spinner-container">
            <LoadingSpinner />
          </div>
          }
        </Container>
      </div>
      {
        showDialog &&
        (
          showLocationSelector ? locationDialog() : roleDialog()
        )
      }
    </Layout>
  )
}

export default Selections;