import './Welcome.scss';

import React, { useContext, useEffect, useState } from 'react';
import Bowser from "bowser";

import { TranslationContext } from '../../../store/translation/TranslationProvider';
import { OfferingContext } from '../../../store/offering/OfferingProvider';


import { DataContext } from '../../../store/data/DataProvider';
import { APIContext } from '../../../store/api/APIProvider';
import HeroMarine from './HeroMarine';
import HeroWithModernization from './HeroWithModernization';
import HeroNoModernization from './HeroNoModernization';
import MobileAppSection from './MobileAppSection';
import {  LOCAL_STORAGE_SHOW_MOBILE_AD, LOCAL_STORAGE_ROLE } from '../../../constants';
import { SiteContext } from '../../../store/site/SiteProvider';
import { setAnalyticsForPage} from '../../../utils/analytics-utils'
import { getDomainDefinition } from '../../../utils/generalUtils';
import Layout from '../../../components/Layout/Layout';
import MobileAppAdvertisement from '../../../components/MobileAppAdvertisement';
import imgExplore from '../../../assets/react.svg'
import HeroIndia from './HeroIndia';

/**
 * Renders out the Welcome page. 
 * @param {Object} props Properties passed to the renderer
 */
const Welcome = (props) => {
  const { getText } = useContext(TranslationContext);
  const { country, countryCode } = useContext(OfferingContext);
  const api = useContext(APIContext)
  const { carDesignerBuildNumber } = useContext(SiteContext)

  const { domainCountry, welcomePageUIState, setWelcomePageUIState } = useContext(DataContext)

  const [loading, setLoading] = useState(!welcomePageUIState)
  const [showAd, setShowAd] = useState((localStorage.getItem(LOCAL_STORAGE_SHOW_MOBILE_AD) === 'false' ? false : true))

  const [ carDesignerVersion, setCarDesignerVersion ] = useState('')

  const browser = Bowser.getParser(window.navigator.userAgent)

  // Gets the welcome page ui state from the database and stores it into the context,
  // if it has not already been fetched.
  useEffect(() => {
    if (!domainCountry || welcomePageUIState) return
    let nameToUse = domainCountry.name === '*' ? 'global' : domainCountry.name

    if (props.marine) {
      nameToUse = 'marine'
    }

    api.get(`/frontline/${nameToUse}/ui/welcomePage`).then((result) => {
      setWelcomePageUIState(result)
      setLoading(false)
    }).catch(err => {
      console.error('Error when fetching welcome page UI data.', err)
      setLoading(false)
    })

    api.get(`/frontline/version/carDesigner`).then((result) => {
      setCarDesignerVersion(result)
    }).catch(err => {
      console.error('Error when fetching version.', err)
    })
  }, [domainCountry])

  useEffect( ()=> {
    if(!countryCode) return
    setAnalyticsForPage( { projectCountry:countryCode} )
  },[countryCode])

  useEffect( ()=> {
    setAnalyticsForPage( { country:getDomainDefinition(), role:localStorage.getItem(LOCAL_STORAGE_ROLE)} )
  },[])

  // Returns false if the section has been explicitly disabled, otherwise always true. (i.e. enabled by default)
  // TODO refactor visibility logic to be clearer and more intuitive
  const getSectionVisibility = (name) => {

    return !(welcomePageUIState &&
      welcomePageUIState.sections &&
      welcomePageUIState.sections[name] &&
      welcomePageUIState.sections[name].disabled)
  }

  // This defaults to false (as opposed to the one above). New hero view has to be explicitly enabled in the backend
  const shouldShowModernizationHero = () => {
    return welcomePageUIState &&
      welcomePageUIState.sections &&
      welcomePageUIState.sections.newHero &&
      !welcomePageUIState.sections.newHero.disabled
  }

  // Gets the URL for that particular section.
  const getSectionURL = (name, defaultValue) => {
    if (!domainCountry) return '#'
    // Has the value been set in the admin tool?
    const valueExists = welcomePageUIState &&
      welcomePageUIState.sections &&
      welcomePageUIState.sections[name] &&
      welcomePageUIState.sections[name].url

    let valueToUse

    if (valueExists) {
      // Value has been set --> Use that value
      valueToUse = welcomePageUIState.sections[name].url
    } else {
      // Value has not been set --> Use the value that is in the domain data.
      // If domain data value is also empty, default to KONE home page.
      valueToUse = domainCountry[`${name}URL`] || defaultValue || domainCountry.site
    }

    // Remove any possible protocols from the value. It is set in the <a> href.
    const arr = valueToUse.split('://')

    if (arr[1]) {
      return arr[1]
    }

    return arr[0]
  }


  function renderHeroSection() {
    // return <HeroWithModernization country={country} isEna={domainCountry.enaHomePage} />
    // return <HeroMarine />
    // return <HeroNoModernization country={country} />
    if (props.marine) {
      return <HeroMarine />
    }

    if (domainCountry.indiaHomePage) {
      return <HeroIndia />
    }

    const showModernization = shouldShowModernizationHero()

    if (showModernization) {
      return <HeroWithModernization country={country} isEna={domainCountry.enaHomePage} />
    }

    return <HeroNoModernization country={country} />
  }

  function renderMainSection() {
    if (domainCountry.indiaHomePage) return null

    return (
      <section className="main">
        <header>
          <h2 className="with-line no-line-on-phone">{getText('ui-landing-page-title')}</h2>
          <p className="lead">{getText('ui-landing-ingress')}</p>
        </header>

        <article className="card card-md mb-2 reversed">
          <div className="media">
            <img src={domainCountry.enaHomePage ? imgExplore : imgExplore} alt="" />
          </div>
          <div className="body">
            {/* EXPLORE */}
            <h3 className="section-heading">{getText('ui-landing-get-inspired-title')}</h3>
            <p className="body-text">{getText('ui-landing-get-inspired-desc')}</p>
          </div>
        </article>

        <article className="card card-md mb-2">
          <div className="body">
            <h3 className="section-heading">{getText('ui-landing-design-title')}</h3>
            <p className="body-text">{getText('ui-landing-design-desc')}</p>
          </div>
          <div className="media">
            <img src={domainCountry.enaHomePage ? imgExplore : imgExplore} alt="" />
          </div>
        </article>

        <article className="card card-md reversed">
          <div className="media">
            <img src={imgExplore} alt="" />
          </div>
          <div className="body">
            <h3 className="section-heading">{getText('ui-landing-share-title')}</h3>
            <p className="body-text">{getText('ui-landing-share-desc')}</p>
          </div>
        </article>
      </section>
    )
  }

  function renderLandingMaterialsSection() {
    const isEnabled = getSectionVisibility('landingMaterials')
    if (!isEnabled || domainCountry.indiaHomePage) return null

    return (
      <section className="related">
        <header>
          <h2 className="with-line line-above-on-phone">
            {/* You might also be interested */}
            {getText('ui-landing-related-title')}
          </h2>
        </header>

        <article className="card with-border">
          <div className="body">
            <h3 className="section-heading">{getText('ui-landing-materials-title')}</h3>
            <p className="body-text">{getText('ui-landing-materials-desc')}</p>
            <div>
              <a
                href={`https://${getSectionURL('landingMaterials')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn"
              >
                {getText('ui-general-find-out-more')}
              </a>
            </div>
          </div>
          <div className="media">
            <img src={imgExplore} alt="" />
          </div>
        </article>
      </section>
    )
  }

  function renderLinksSection() {
    const isEnabled = getSectionVisibility('elevatorPlanner') ||
      getSectionVisibility('mobileApp')

    if (!isEnabled || domainCountry.indiaHomePage) return null

    return (
      <section className="related">
        <header>
          <h2 className="with-line no-line-on-phone">{getText('ui-landing-plan-title')}</h2>
          <p className="lead">{getText('ui-landing-plan-desc')}</p>
        </header>

        {getSectionVisibility('elevatorPlanner') && (
          <article className="card with-border mb-1">
            <div className="body">
              <h3 className="section-heading">{getText('ui-landing-kone-elevator-planner-title')}</h3>
              <p className="body-text">{getText('ui-landing-kone-elevator-planner-desc')}</p>
              <div>
                <a
                  href={`https://${getSectionURL('elevatorPlanner', 'elevatorplanner.kone.com/')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn"
                >
                  {getText('ui-landing-kone-elevator-planner-btn')}
                </a>
              </div>
            </div>
            <div className="media">
              <img src={imgExplore} alt="" />
            </div>
          </article>
        )}
      </section>
    )
  }

  function renderMobileAppSection() {
    const isEnabled = getSectionVisibility('mobileApp')
    if (!isEnabled) return null

    return (
      <MobileAppSection wideImage={domainCountry.indiaHomePage} />
    )
  }

  const closeAdd = () => {
    localStorage.setItem(LOCAL_STORAGE_SHOW_MOBILE_AD, false)
    setShowAd(false)
  }

  if (loading) return <Layout
    limitedWidth={true}
    showNavBar={false}
    stickyHeader={true}
    navBarClassName="hidden"
  ></Layout>
  return (
    <Layout
      limitedWidth={true}
      showNavBar={false}
      stickyHeader={true}
      navBarClassName="hidden"
    >
      <div className="Welcome">
        {renderHeroSection()}
        {renderMainSection()}
        {renderLandingMaterialsSection()}
        {renderLinksSection()}
        {renderMobileAppSection()}


        <section className="footer">
          <p className="legal-notes">{getText('ui-landing-legal-notes')}</p>
          <div className="app-version">{carDesignerVersion}
            {carDesignerVersion && carDesignerBuildNumber && ' / '}
            {carDesignerBuildNumber}</div>
        </section>
      </div>

      { (showAd && browser.getPlatformType(true) === 'desktop') &&
        <MobileAppAdvertisement onClickHandler={e => closeAdd()} />
      }
    </Layout>
  )
}

export default Welcome;
