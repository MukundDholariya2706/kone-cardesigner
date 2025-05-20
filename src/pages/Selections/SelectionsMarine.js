import './SelectionsMarine.scss';

import React, {useContext, useState, useMemo } from 'react';
import { useHistory } from 'react-router-dom';

import { OfferingContext } from '../../store/offering/OfferingProvider';
import { ProductContext } from '../../store/product/ProductProvider';
import { TranslationContext } from '../../store/translation/TranslationProvider';
import { UserContext } from '../../store/user/UserProvider';

import { useRecaptcha } from '../../components/Recaptcha';
import Layout from '../../components/Layout'; 
import ChevronProcess, { ChevronProcessItem } from '../../components/ChevronProcess';
import BuildingAndRoleSelectionView from '../../components/BuildingAndRoleSelectionView';
import ProductSelectionView from '../../components/ProductSelectionView';
import StartDesigningView from '../../components/StartDesigningView';
import Container from '../../components/Container';

import { SELECTION_PAGE_ACTION } from '../../constants';
import Button from '../../components/Button';

import { SiteContext } from '../../store/site/SiteProvider';
import allRoles from '../../store/roles'
import { RoleSelectionDialog } from './components';
import Sprite from '../../components/Sprite';
import origBuildingTypes from '../../store/building-types';
import { AuthContext } from '../../store/auth/AuthProvider';

/**
 * Renders out the SelectionsMarine page. The page contains selection for project type and solution.
 * @param {Object} props Properties passed to the renderer
 */
const SelectionsMarine = (props) => {  
  const { getText } = useContext(TranslationContext);
  const { getPrevPage } = useContext(SiteContext)
  const { offering, productFamilies } = useContext(OfferingContext)
  const auth = useContext(AuthContext)

  const history = useHistory()

  const buildingTypes = origBuildingTypes
    .filter(x => !!x.marine)

  const roles = allRoles
    .filter(x => !!x.marine)
  
  const { productId, releaseId } = useContext(ProductContext);

  const { role, setRole, buildingType, setBuildingType } = useContext( UserContext )
  
  const selectedRole = useMemo(() => {
    if (!role) return null

    return roles.find(x => x.id === role)
  }, [role, roles])


  const selectedBuildingType = useMemo(() => {
    if (!buildingType) return null

    const found = buildingTypes.find(x => x.id === buildingType)
    if (found) return found.id
  }, [buildingType, buildingTypes])

  const [ showDialog, setShowDialog ] = useState(!selectedRole)

  const productIsInSelectedBuildingType = useMemo(() => {
    if (!offering || !productId || !productFamilies) return false
    
    const product = offering.find(x => x.id === productId)

    if (!product) return false

    return !!productFamilies
      .find(x => x.id === product.productFamily)
  }, [offering, productId, productFamilies])
  

  const SELECT_BUILDING_AND_ROLE = 0
  const SELECT_PRODUCT =  1
  const START_DESIGNING =  2
  
  const [ process, setProcess ] = useState(() => {
    if (!selectedRole || !buildingType) return SELECT_BUILDING_AND_ROLE

    const prevPage = getPrevPage()
    if (prevPage && (prevPage.includes('edit') || prevPage.includes('predesigns'))) {
      return START_DESIGNING
    }

    return SELECT_BUILDING_AND_ROLE
  })

  const showNextButton = useMemo(() => {
    return process !== START_DESIGNING
  }, [process])

  const selectProductDisabled = useMemo(() => {
      return !selectedRole || !selectedBuildingType
  }, [selectedBuildingType, selectedRole])

  const startDesigningDisabled = useMemo(() => {
    return selectProductDisabled || !productIsInSelectedBuildingType || !productId
  }, [productIsInSelectedBuildingType, selectProductDisabled, productId])

  const nextButtonDisabled = useMemo(() => {
    switch (process) {
      case SELECT_BUILDING_AND_ROLE:
        return selectProductDisabled
      case SELECT_PRODUCT:
        return startDesigningDisabled
      default:
        return false
    }
  }, [selectProductDisabled, startDesigningDisabled, process])

  const showBackButton = useMemo(() => {
    return process !== SELECT_BUILDING_AND_ROLE
  }, [process])

  useRecaptcha(SELECTION_PAGE_ACTION)

  function settingsButton() {
    if (!selectedRole) return null
    if (process === START_DESIGNING) return null

    return (
      <div 
        onClick={() => {
          if (auth.loggedInUser) return // always KONE employee
          setShowDialog(true)
        }} 
        className={`settings-button ${auth.loggedInUser ? 'disabled' : ''}`}>
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
      </div>
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
      navBarClassName="navbar-lg pr-4 pl-4 navbar-SelectionsMarine"
      stickyNavBar={true}
      showGiveFeedbackButton={true}
      navBarCenterChildren={settingsButton()}
      bottomNavChildren={(
        <div className="buttons">
          { showBackButton && 
          <Button 
            onClick={() => setProcess(x => x - 1)}
            className="previous-button" theme={['md', 'outline', 'white-blue', 'no-hover']}>{ getText('ui-general-previous')}</Button>
          }
          { showNextButton && 
          <Button 
            onClick={() => setProcess(x => x + 1)}
            className="next-button" disabled={nextButtonDisabled} theme={['md', 'outline', 'primary']} >
            { getText('ui-general-next')}
          </Button>
          }
        </div>
      )}
    >
      <div className="SelectionsMarine content">
        <Container style={{ paddingTop: '70px', paddingBottom: '30px' }}>
          <Container className="chevron-container" hPadding="xlg" vPadding="sm" sticky={true} style={{ backgroundColor: 'rgba(255,255,255,0.8)' }}>
            <ChevronProcess>
              <ChevronProcessItem 
                onClick={e => setProcess(SELECT_BUILDING_AND_ROLE) } 
                selected={ process === SELECT_BUILDING_AND_ROLE } >
                  { getText('marine-ui-selector-select-vessel-type') }
              </ChevronProcessItem>
              <ChevronProcessItem 
                onClick={e => setProcess(SELECT_PRODUCT) } 
                selected={ process === SELECT_PRODUCT } 
                disabled={ selectProductDisabled } >
                  {getText('ui-selector-select-solution')}
                </ChevronProcessItem>
              <ChevronProcessItem 
                onClick={e => {
                // loadProductWithId(productId)
                setProcess(START_DESIGNING)
                }} 
                selected={ process === START_DESIGNING } 
                disabled={ startDesigningDisabled } >
                  { getText('ui-selector-start-designing') }
              </ChevronProcessItem>
            </ChevronProcess>
          </Container>
          
          { process === SELECT_BUILDING_AND_ROLE && <BuildingAndRoleSelectionView 
            history={props.history}
            marine={true}
            buildingType={selectedBuildingType}
            buildingTypes={buildingTypes}
            setBuildingType={setBuildingType}
          /> }
          { process === SELECT_PRODUCT && <ProductSelectionView marine={true} /> }
          { process === START_DESIGNING && <StartDesigningView marine={true} productId={productId} releaseId={releaseId} /> }
          
        </Container>
      </div>
      {
        showDialog &&
        (
          roleDialog()
        )
      }
    </Layout>
  )
}

export default SelectionsMarine;